class ApiError extends Error {
    constructor({errorCode, message}) {
        super();
        this.errorCode = errorCode;
        this.message = message;
        this.stack = (new Error()).stack;
    }
}

export class ErrorCode {
    static hasNotLogin = 100; //没登录
    static userNotExist = 101; //用户不存在
    static passwordMissMatch = 102; //密码不正确
    static accessTokenMissMatch = 103; //token不对
    static accessTokenExpired = 104; //token过期
    static refreshTokenMissMatch = 105; //refreshToken不对
    static refreshTokenExpired = 106; //refreshToken过期
    static noPermission = 200; //权限不足
    static controllerNotExist = 400; //接口的处理函数不存在
    static unknow = 800; //未知错误
}

export default ApiError