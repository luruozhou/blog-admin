
export enum APIErrorCode {
    Unknown = 0,

    ArgumentsMissing = 1001,
    InvalidArguments,

    UserNotExists = 2001,
    MobileNumberUnavailable,
    PasswordMismatch,
    PermissionDenied,
    UserNotActivated,
    
    VerifierExpired = 2101,
    InvalidVerifier,
    InvalidToken,

    // 业务错误
    InsufficientPoints = 3001,
    NoAvailableTestRoom,
    InsufficientMins,
    InsufficientSpecialMins,
    InsufficientTsinghuaOrBeijingMins,

    StudentNotExists = 3601,
    SellerNotExists,
    UserExists,
    RecordNotExists,
    UserNotSeller,

    ExceedTheLimit = 3801,

    DeviceNotMatch = 3901,
    DeviceIsUsing,

    SMSSendFail = 4001,
    
    /** 课程冲突 */
    CourseConflict = 5001,
    TakeChargeStudentConflict,
    ArrangeRepeat,
    OpenRepeat,
    FeedBackCountExceed,
    PendingCompleteCountExceed,
    CourseNotExist,
    
    /** 操作七牛 */
    AddResourceToQiniuFail = 6001,
    UpdateResourceFromQiniuFail,
    RemoveResourceFromQiniuFail,
    ResourceNotExists,
    ResourceExists,
    
    /** 教研hr */
    lessonRequireMatching = 7001,
    lessonRequireMatched,
    isNotTeacher,
    trainingAccountFull,
    makeUpTreated,
    importTeacherSchoolNoEmpty,
    importTeacherGradeNoEmpty,
    importTeacherInvalidTimeType,
    lessonNotExist,
    
    /** 市场活动 */
    hadParticipated = 8001,
    emailUsed,
    
    /** 下载出错 */
    teacherStudentCardDownloadFailed = 9001,
    /** 销售助理管理平台 */
    uniqueViolation = 10001,

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

APIErrorMessage[APIErrorCode.UserNotExists]           = '该用户不存在';
APIErrorMessage[APIErrorCode.MobileNumberUnavailable] = '手机号已经被使用';
APIErrorMessage[APIErrorCode.PasswordMismatch]        = '密码不匹配';
APIErrorMessage[APIErrorCode.PermissionDenied]        = '权限不足';
APIErrorMessage[APIErrorCode.UserNotActivated]        = '用户未激活';

APIErrorMessage[APIErrorCode.VerifierExpired]         = '验证码已过期';
APIErrorMessage[APIErrorCode.InvalidVerifier]         = '验证码错误';
APIErrorMessage[APIErrorCode.InvalidToken]            = '识别码错误';

APIErrorMessage[APIErrorCode.InsufficientPoints]      = '余额不足';
APIErrorMessage[APIErrorCode.InsufficientMins]        = '剩余课时不足';
APIErrorMessage[APIErrorCode.InsufficientSpecialMins] = '剩余特殊课程课时不足';
APIErrorMessage[APIErrorCode.InsufficientTsinghuaOrBeijingMins] = '剩余清北课程课时不足';
APIErrorMessage[APIErrorCode.NoAvailableTestRoom]     = '没有可用的测试房间';

APIErrorMessage[APIErrorCode.StudentNotExists]        = '学生不存在';
APIErrorMessage[APIErrorCode.SellerNotExists]         = '教务老师不存在';
APIErrorMessage[APIErrorCode.UserExists]              = '用户已存在';
APIErrorMessage[APIErrorCode.RecordNotExists]         = '记录不存在';
APIErrorMessage[APIErrorCode.UserNotSeller]           = '用户不是教务老师';

APIErrorMessage[APIErrorCode.ExceedTheLimit]          = '超出限制';

APIErrorMessage[APIErrorCode.DeviceNotMatch]          = '设备不匹配';

APIErrorMessage[APIErrorCode.SMSSendFail]             = '短信发送失败';

APIErrorMessage[APIErrorCode.CourseConflict]          = '课程有冲突';
APIErrorMessage[APIErrorCode.TakeChargeStudentConflict] = "学生负责冲突";
APIErrorMessage[APIErrorCode.ArrangeRepeat]           = '重复排课';
APIErrorMessage[APIErrorCode.OpenRepeat]              = '重复开课';
APIErrorMessage[APIErrorCode.FeedBackCountExceed]     = '超过未反馈课程数目';
APIErrorMessage[APIErrorCode.CourseNotExist]          = '课程不存在';

APIErrorMessage[APIErrorCode.AddResourceToQiniuFail]        = '添加资源到七牛失败';
APIErrorMessage[APIErrorCode.UpdateResourceFromQiniuFail]   = '更新七牛的资源失败';
APIErrorMessage[APIErrorCode.RemoveResourceFromQiniuFail]   = '删除七牛的资源失败';
APIErrorMessage[APIErrorCode.ResourceNotExists]  = '资源不存在';
APIErrorMessage[APIErrorCode.ResourceExists]     = '资源已存在';

APIErrorMessage[APIErrorCode.lessonRequireMatching]         = '其他教研老师正在为该学生匹配老师';
APIErrorMessage[APIErrorCode.lessonRequireMatched]          = '其他教研老师已为该学生匹配老师';
APIErrorMessage[APIErrorCode.isNotTeacher]                  = '该手机用户不是讲师';
APIErrorMessage[APIErrorCode.trainingAccountFull]           = '培训房间账号已满';
APIErrorMessage[APIErrorCode.makeUpTreated]                 = '补录审核已被处理';
APIErrorMessage[APIErrorCode.importTeacherSchoolNoEmpty]    = '所属学校不能为空';
APIErrorMessage[APIErrorCode.importTeacherGradeNoEmpty]    = '全职老师教学年级不能为空';
APIErrorMessage[APIErrorCode.importTeacherInvalidTimeType]    = '存在非法的工作性质';
APIErrorMessage[APIErrorCode.hadParticipated]               = '您已经参加过此活动';
APIErrorMessage[APIErrorCode.emailUsed]                     = '邮箱已被使用';
APIErrorMessage[APIErrorCode.uniqueViolation]                     = '相应的纪录已存在';
APIErrorMessage[APIErrorCode.lessonNotExist]                = '排课不存在';

APIErrorMessage[APIErrorCode.teacherStudentCardDownloadFailed]      = '下载老师学生证失败';

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
