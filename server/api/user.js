import {userProvider} from "../modules/core/userProvider";
import * as User from "../modules/user";
import * as Validator from '../utils/Validator';
import {getToken} from "../modules/core/jsonWebToken";
import ApiError, {ErrorCode} from "../modules/core/apiError";
import {Permission} from '../../server/modules/core/permissionProvider';

export var routeSettings = {
    login: {
        method: "post",
        notAuthentication: true
    },
    register: {
        method: "post",
        notAuthentication: true
    },
    logout: {
        method: "post"
    },
    getInfo: {
        method: "post",
        permission: Permission.user
    }
};

/**
 * 用户登录接口
 * userName:string
 * password:string
 */
export function login(req, res) {
    Validator.validate(req.body,
        ['userName', 'password'],
        {
            userName: /^.+$/,
            password: /^.{6,}$/
        });

    return userProvider
        .authenticate(req, res)
        .then(async data => {
            if (data && data.userRecord) {
                let secretData = {
                    uid: data.uid,
                    random: new Date().getTime()
                }
                let access_token = getToken(secretData);
                let refresh_token = getToken(secretData);
                await userProvider.saveToken(access_token, refresh_token, data.uid);
                return {access_token, refresh_token,};
            }
        })
}
/**
 * 获取用户信息接口
 */
export function getInfo(req, res) {
    let user = req.user;
    let userInfo = user.userRecord || {};
    return userInfo
}

/**
 * 用户注册接口
 * userName:string
 * nickName:string
 * password:string
 */
export function register(req, res) {
    let args = req.body;
    Validator.validate(args,
        ['userName', 'password', 'nickName'],
        {
            userName: /^.+$/,
            password: /^.{6,}$/,
            nickName: /^.+$/
        });

    return User
        .register(args)
        .then(uid => {
            if (uid) {
                req.session.uid = uid;
                return '注册成功.';
            } else {
                throw new ApiError({errorCode: ErrorCode.registeredFailed, message: "注册失败"});
            }
        })
}

/**
 * 用户登出接口
 */
export function logout(req, res) {
    userProvider.logout(req);
    res.clearCookie('sessionid');
    return "登出成功"
}
