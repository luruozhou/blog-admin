
export enum APIErrorCode {
    Unknown = 0,

    ArgumentsMissing = 1001,
    InvalidArguments,

    UserNotExists = 2001,
    /**
     * 自定义 APIError
     * 例如：
     *     throw new APIError(APIErrorCode.CustomAPIError, '错误')
     */
    CustomAPIError = 444444,
}

export var APIErrorMessage: string[] = [];

var UNKNOWN_ERROR = '未知错误';

APIErrorMessage[APIErrorCode.Unknown]                 = UNKNOWN_ERROR;

APIErrorMessage[APIErrorCode.ArgumentsMissing]        = '缺少必要参数';
APIErrorMessage[APIErrorCode.InvalidArguments]        = '参数值不被接受';


export class APIError {
    name: string;
    stack: string;
    
    constructor(
        public code = APIErrorCode.Unknown,
        public message = APIErrorMessage[code] || APIErrorCode[code] || UNKNOWN_ERROR,
        public data?: any,
        public error?: Error
        ) {
        this.stack = (<any>new Error()).stack;
        this.name = APIErrorCode[code];
    }
}
