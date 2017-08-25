import Path from "path";
import IO from "./io.js";
import '../modules/mysql-models/model-relations';
import {userProvider} from "../modules/core/userProvider";
import {permissionProvider} from "../modules/core/permissionProvider";
import ApiError, {ErrorCode} from "../modules/core/apiError";

const apiPrefix = '/api/';

exports.Router = function (app) {
    this.app = app; //express 实例
    var routeFileDir = Path.resolve("dest/server/api"); //路由根目录
    var routeFiles = IO.listFiles(routeFileDir, /\.js$/)  //获取目录下所有路由文件
    for (var routeFile of routeFiles) {
        var routeModule = require(routeFile);  //每个路由文件export的对象
        for (var key in routeModule) {
            if (key != "routeSettings") {
                attach(routeModule, key)
            }
        }
    }

    function attach(routeModule, key) {
        var routeSetting = ( routeModule.routeSettings && routeModule.routeSettings[key] ) || {};
        var routeHandler = routeModule[key];
        var method = routeSetting.method || "get";
        var urlPath;
        if (routeSetting.route) {
            urlPath = routeSetting.route;
        } else {
            urlPath = apiPrefix + Path.relative(routeFileDir, routeFile)
                    .replace(/\\/g, '/')
                    .replace(/\.js$/, '');
        }

        if (key != "default") {
            urlPath += "/" + key;
        }
        app[method](urlPath, function (req, res) {
            let authPromise;
            if (routeSetting.notAuthentication) {
                authPromise = userProvider.get(req, res)
            } else {
                authPromise = userProvider.authenticate(req, res)
            }
            return authPromise
                .then(user => {
                    // 权限判断
                    console.log(user.permission, routeSetting.permission)
                    let isVerify = permissionProvider.verifyRouter(user && user.permission, routeSetting.permission);
                    if (!isVerify) {
                        throw new ApiError({errorCode: ErrorCode.noPermission, message: "权限不足"});
                    }
                    req.user = user;
                })
                .then(function () {
                    if (!routeHandler) {
                        throw new ApiError({errorCode: ErrorCode.controllerNotExist, message: "没有对应接口controller"});
                    }
                    return routeHandler(req, res)
                })
                .then(function (returnData) {
                    return getJson(returnData)
                })
                .then(function (data) {
                    res.send(data);
                })
                .catch(error => {
                    let errorData;
                    errorData = getJson(null, error);
                    res.send(errorData);
                })
        })
    }
}

function getJson(data, error) {
    let res;
    if (error) {
        if (typeof error ==='string') {
            res={
                code:0,
                data:null,
                message:error
            }
        }else if(error instanceof ApiError){
            if(error.errorCode ===ErrorCode.accessTokenExpired){
                res={
                    code:2,
                    data:null,
                    message:error.message
                }
            }else{
                res={
                    code:0,
                    data:null,
                    message:error.message
                }
            }
        }else{
            res={
                code:0,
                data:null,
                message:error.message
            }
        }
    }else{
        res = {
            code:1,
            data,
            message: ""
        }
    }

    return res;

}

