import * as FS from 'fs-extra';
import * as Path from 'path';
import * as Lodash from 'lodash';
import * as moment from 'moment';

import * as ThenFail from './thenfail';
// import { EventEmitter, IO } from './utils';
import * as zmConfig from './config-core';

let uid: number = Date.now();
let logDir = zmConfig.debugLogDir;
let writer: FS.WriteStream;
let createAtHour: number;

interface Target {
    logId?: number;
    ignoreLog?: boolean;
}

let nextLogId = Date.now();

let expireLimit = zmConfig.debugLogExpireLimit;

FS.mkdirpSync(logDir);

export function log(target: Target | any, ...args: string[]): void {
    if (target && target.ignoreLog) {
        return;
    }
    return _log(target, 'log', args);
}

export function error(target: Target | any, ...args: string[]): void {
    return _log(target, 'error', args);
}

export function warn(target: Target | any, ...args: string[]): void {
    return _log(target, 'warning', args);
}

export interface LogFile {
    filename: string;
    createAt: number;
}

export function getLogData(filename: string): ThenFail<string> {
    return ThenFail.invoke<string>(FS, 'readFile', Path.join(logDir, filename), 'utf8')
        .then(data => data);
}

export function noop() {
}

export function getLogs(): ThenFail<LogFile[]> {
    return ThenFail.invoke<string[]>(FS, 'readdir', logDir)
        .then(files => {
            let logs: LogFile[] = [];

            return ThenFail
                .map(files, (filename) => {
                    let path = Path.join(logDir, filename);
                    if (!/^\d+.log$/.test(filename)) {
                        return;
                    }
                    return ThenFail
                        .invoke<FS.Stats>(FS, 'stat', path)
                        .then(fstat => {
                            let now = Date.now();
                            if (now - fstat.mtime.getTime() >= expireLimit) {
                                //删除过期的日志文件
                                FS.unlink(path);
                            } else {
                                logs.push({
                                    filename,
                                    createAt: fstat.ctime.getTime()
                                });
                            }
                        });
                })
                .then(() => logs);
        });
}


function _log(target: Target | any, type: string, args: string[]): void {
    if (!zmConfig.isDebugMode) {
        return;
    }

    let logId: number = 0;

    if (target) {
        if (!target.logId) {
            target.logId = ++nextLogId;
        }
        logId = target.logId;
    } else {
        logId = ++nextLogId;
    }

    let now = new Date();

    if (!writer || now.getHours() != createAtHour) {
        if (writer) {
            writer.end();
        }
        writer = FS.createWriteStream(Path.join(logDir, `${moment(now).format('YYYYMMDDHH')}.log`), {flags: 'a'});
        createAtHour = now.getHours();
    }

    writer.write(`{lid-${logId} type-${type} at-${moment(now).format('HH:mm:ss')}} ${args.join(' ')}\n`);
}
