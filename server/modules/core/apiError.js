// class ApiError extends Error {
//     constructor({errorCode, message}) {
//         super();
//         this.errorCode = errorCode;
//         this.message = message;
//         this.stack = (new Error()).stack;
//     }
// }
// let test = new ApiError({});
// console.log('-------------------')
// console.log(test instanceof ApiError)
// console.log(test instanceof Error)
// console.log('-------------------')
function ApiError({ message, errorCode }) {
    this.message = message;
    this.errorCode = errorCode;
    this.stack = (new Error()).stack;
}
ApiError.prototype = Object.create(Error.prototype);
ApiError.prototype.constructor = ApiError;

export class ErrorCode {
    static hasNotLogin = 100; //没登录
    static userNotExist = 101; //用户不存在
    static passwordMissMatch = 102; //密码不正确
    static accessTokenMissMatch = 103; //token不对
    static accessTokenExpired = 104; //token过期
    static refreshTokenMissMatch = 105; //refreshToken不对
    static refreshTokenExpired = 106; //refreshToken过期
    static hasRegistered = 106; //已经注册
    static registeredFailed = 106; //注册失败，网络原因或者服务异常之类的
    static noPermission = 200; //权限不足
    static controllerNotExist = 400; //接口的处理函数不存在
    static unknow = 800; //未知错误
}

export default ApiError