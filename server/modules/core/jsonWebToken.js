var jwt = require("jsonwebtoken");
import {appSecret} from "../../config";

export function getToken(data) {
    let token = jwt.sign(data, appSecret);
    return token;
}

export function verifyToken(token) {
    let data;
    try {
        data = jwt.verify(token, appSecret);
    } catch (e) {
        throw(e);
    }
    return data;
}
