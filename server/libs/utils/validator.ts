import * as Lodash from 'lodash';

import {StringHash} from '../utils';

import {APIErrorCode, APIError} from '../../modules/core/api-error';
import {Dictionary} from '../../../typings/lang';

var hop = Object.prototype.hasOwnProperty;

var mobileRegex = /^1\d{10}$/;
var passwordRegex = /^.{8,20}$/;
var nameRegex = /^[\u4e00-\u9fa5]{2,10}$/;
// 使用 [a-z_] 代替 \w 来避免大写字母
var emailRegex = /^(?!.{64,})[a-z_\d]+(?:[-.][a-z_\d]+)*@(?:[a-z\d]+(?:-[a-z\d]+)*\.)+[a-z]{2,}$/i;
var zCardRegex = /^80\d{6}$|^680\d{6}|^788\d{3}$|^13\d{5}$/;
var gradeRegex = /^(初[一二三四])|(预[初])|(高[一二三])|(小[一二三四五六])$/;
var scoreRegex = /^(?:0|[1-9]\d{1,3})$/;
var digitsRegex = /^\d+$/;
var dateRegex = /^\d{4}\-[01]\d\-[0-3]\d [0-2]\d:[0-5]\d:[0-5]\d$/;
var dateWithoutTimeRegex = /^\d{4}\-[01]\d\-[0-3]\d$/;
var lessonTypeRegex = /^(?:regular|test)-lesson$/;
var qqRegexp = /^\d{5,12}$/;
export interface Validator < T > {
    (value : T, key : string): void;
}

/**
 * 验证参数为必须，不为空的
 */
export function validateRequired(value : any, key : string) : void {
    if(value === undefined || value === null || !/^[\s\S]+$/.test(value)) {
        throw new APIError(APIErrorCode.InvalidArguments, `The argument "${key}", need a value.`);
    }
}
/**
 * 验证参数为字符串
 * @yueudn
 */
export function validateString(value : any, key : string) : void {
    if(typeof value !== 'string' || !value) {
        throw new APIError(APIErrorCode.InvalidArguments, `Invalid value ${value} for key "${key}", should be a string.`);
    }
}
/**
 * 验证参数为字符串类型数组
 * @yuedun
 */
export function validateStringArray(value : any, key : string) : void {
    var valid = true;

    if (!(value instanceof Array)) {
        valid = false;
    } else {
        for (let item of value) {
            if (typeof item !== 'string') {
                valid = false;
                break;
            }
        }
    }

    if (!valid) {
        throw new APIError(APIErrorCode.InvalidArguments, `Invalid value ${value} for key "${key}", should be a string array.`);
    }
}
/**
 * 验证参数为数值类型
 * @yuedun
 */
export function validateNumber(value : any, key : string) : void {
    if(typeof value !== 'number') {
        throw new APIError(APIErrorCode.InvalidArguments, `Invalid value ${value} for key "${key}", should be a number.`);
    }
}

/**
 * 验证一个值是否像一个boolean类型的值
 */
export function validateBooleanLike(value : string | number | boolean, key : string) : void {
    if(typeof value !== 'boolean' && value !== '1' && value !== '0' && value !== 1 && value !== 0) {
        throw new APIError(APIErrorCode.InvalidArguments, `Invalid value "${value}" for key "${key}".`);

    }
}

export function validateMobile(mobile : string, key : string) : void {
    if(typeof mobile !== 'string' || !mobileRegex.test(mobile)) {
        throw new APIError(APIErrorCode.InvalidArguments, `Invalid mobile number "${mobile}" for key "${key}".`);
    }
}

export function validatePassword(password : string, key : string) : void {
    if(typeof password !== 'string' || !passwordRegex.test(password)) {
        throw new APIError(APIErrorCode.InvalidArguments, `Invalid password for key "${key}".`);
    }
}

export function validateName(name : string, key : string) : void {
    if(typeof name !== 'string' || !nameRegex.test(name)) {
        throw new APIError(APIErrorCode.InvalidArguments, `Invalid name "${name}" for key "${key}".`);
    }
}

export function validateEmail(email : string, key : string) : void {
    if(typeof email !== 'string' || !emailRegex.test(email)) {
        throw new APIError(APIErrorCode.InvalidArguments, `Invalid email "${email}" for key "${key}".`);
    }
}

export function validateZCard(zCard : string, key : string) : void {
    if(typeof zCard !== 'string' || !zCardRegex.test(zCard)) {
        throw new APIError(APIErrorCode.InvalidArguments, `Invalid zCard "${zCard}" for key "${key}".`);
    }
}

export function validateGrade(grade : string, key : string) : void {
    if(typeof grade !== 'string') {
        throw new APIError(APIErrorCode.InvalidArguments, `Invalid grade "${grade}" for key "${key}".`);
    }
}

export function validateScore(score : string, key : string) : void {
    if(typeof score !== 'string' || !scoreRegex.test(score)) {
        throw new APIError(APIErrorCode.InvalidArguments, `Invalid score "${score}" for key "${key}".`);
    }
}
/**
 * 验证参数是否为可转为数字的字符串
 * @yuedun
 */
export function validateDigits(digits : string, key : string) : void {
    if(typeof digits !== 'string' || !digitsRegex.test(digits)) {
        throw new APIError(APIErrorCode.InvalidArguments, `Invalid value "${digits}" for key "${key}".`);
    }
}

export function validateDate(date : string, key : string) : void {
    if(!dateRegex.test(date)) {
        throw new APIError(APIErrorCode.InvalidArguments, `Invalid value "${date}" for key "${key}".`);
    }
}

export function validateDateWithoutTime(date : string, key : string) : void {
    if(!dateWithoutTimeRegex.test(date)) {
        throw new APIError(APIErrorCode.InvalidArguments, `Invalid value "${date}" for key "${key}".`);
    }
}

export function validateLessonType(type : string, key : string) : void {
    if(!lessonTypeRegex.test(type)) {
        throw new APIError(APIErrorCode.InvalidArguments, `Invalid value "${type}" for key "${key}".`);
    }
}

export function validateQQAccount(type : string, key : string) : void {
    if(!qqRegexp.test(type)) {
        throw new APIError(APIErrorCode.InvalidArguments, `Invalid value "${type}" for key "${key}".`);
    }
}

var validatorMap : Dictionary < Validator < any >> = {
    string: validateString,
    booleanLike: validateBooleanLike,
    mobile: validateMobile,
    password: validatePassword,
    name: validateName,
    email: validateEmail,
    zCard: validateZCard,
    grade: validateGrade,
    score: validateScore,
    digits: validateDigits,
    date: validateDate,
    dateWithoutTime: validateDateWithoutTime,
    stringArray: validateStringArray,
    qq: validateQQAccount,
    number: validateNumber,
    lessonType: validateLessonType
};
/**
 * 验证参数的有效性
 * @param data 传入的所有参数
 * @param requiredKeys 需要验证的参数
 * @param validatorNameMap 需要验证的参数类型
 */
export function validate(data : any, requiredKeys : string[] = [], validatorNameMap : Dictionary < string | RegExp | Validator < any >> = {}) : void {
    var requiredHash = new StringHash(requiredKeys);

    var keys = Lodash.union(Object.keys(data), requiredKeys);

    for (let key of keys) {
        let value = data[key];
        let required = requiredHash.exists(key);

        if (required || (value !== undefined && value !== '')) {
            var validatorOrKey = hop.call(validatorNameMap, key)
                ? validatorNameMap[key]
                : key;

            if (required && data[key] == null) {
                throw new APIError(APIErrorCode.ArgumentsMissing, `Missing argument "${key}".`);
            } else {
                if (typeof validatorOrKey === 'string') {
                    let validator = validatorMap[validatorOrKey];
                    if (validator) {
                        validator(value, key);
                    }
                } else if (validatorOrKey instanceof RegExp) {
                    if (!validatorOrKey.test(value)) {
                        throw new APIError(APIErrorCode.InvalidArguments, `Invalid value "${key}" for key ${key}.`);
                    }
                } else if (validatorOrKey instanceof Function) {
                    validatorOrKey(value, key);
                }
            }
        }
    }
}
