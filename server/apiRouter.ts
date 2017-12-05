import * as Router from 'koa-router';
import {Context, Request, Response} from 'koa';

// Node 自带包
import * as FS from 'fs';
import * as Path from 'path';


import {IO, wait} from './libs/utils';
import * as config from './config';
import * as Debug from './libs/debug';
import sequelize from './modules/core/sequelize';
const cwd = process.cwd();

type APIHandler = any;

export interface APIInfo {
    target: any;
    name: string;
    handler: APIHandler;
    path: string | RegExp;
    method: string;
    authentication: boolean;
    test: string;
    json: boolean;
}

export function api({
                        method,
                        path,
                        authentication = false,
                        test,
                        json = true
                    }: {
    method: string,
    path?: string | RegExp,
    authentication?: boolean,
    test?: string,
    json?: boolean
}) {
    return function (target: API | any, name: string) {
        if (!/^(?:post|get|put|delete|all)$/i.test(method)) {
            throw new Error(`invalid request method "${method}"`);
        }

        method = method.toLowerCase();

        target.methods = target.methods || [];

        target.methods.push({
            target: target,
            name: name,
            handler: (<any>target)[name],
            path: path,
            method: method,
            authentication: authentication,
            test: test,
            json: json
        });
    };
}

export interface API {
    methods?: APIInfo[];
}

export class APIRouter {
    private static jsExtRegex = /\.js$/;
    private static upperCaseRegex = /[A-Z]+(?=[A-Z][a-z]|$)|[A-Z]/g;

    private testDataDir: string;

    constructor(private router: Router,
                private apiRootPath = '',
                apiFileDir = 'api',
                testDataDir = 'test-data') {
        apiFileDir = Path.resolve(cwd, './server', apiFileDir);

        this.testDataDir = Path.resolve(cwd, '../server', testDataDir);

        let apiFiles = IO.listFiles(apiFileDir, APIRouter.jsExtRegex);

        for (let apiFile of apiFiles) {
            let apiModule = require(apiFile);

            let basePath = '/' + Path.relative(apiFileDir, apiFile)
                .replace(/\\/g, '/')
                .replace(APIRouter.jsExtRegex, '');

            let APIClass = <API>(apiModule.default);

            if (APIClass && APIClass.methods) {
                for (let apiMethod of APIClass.methods) {
                    this.attach(basePath, apiMethod);
                }
            }
        }
    }

    private attach(basePath: string, apiMethod: APIInfo): void {
        let koaMethod: Function = (<any>this.router)[apiMethod.method];

        let methodName = apiMethod.name;
        let methodPath = apiMethod.path;

        let pathFriendlyMethodName = methodName
            .replace(APIRouter.upperCaseRegex, (m: string, index: number) => {
                return (index ? '-' : '') + m.toLowerCase();
            });

        let path: string | RegExp;

        if (!methodPath) {
            if (methodName == 'default') {
                path = this.apiRootPath + basePath;
            } else {
                path = this.apiRootPath + basePath + '/' + pathFriendlyMethodName;
            }
        } else if (typeof methodPath === 'string') {
            if (methodPath.charAt(0) != '/') {
                path = this.apiRootPath + basePath + '/' + methodPath;
            } else {
                path = this.apiRootPath + methodPath;
            }
        } else {
            path = methodPath;
        }

        let testDataPath = apiMethod.test;

        if (!testDataPath) {
            if (methodName == 'default') {
                testDataPath = this.testDataDir + basePath;
            } else {
                testDataPath = this.testDataDir + basePath + '/' + pathFriendlyMethodName;
            }
        } else if (testDataPath.charAt(0) != '/') {
            testDataPath = this.testDataDir + basePath + '/' + testDataPath;
        } else {
            testDataPath = this.testDataDir + testDataPath;
        }

        if (!APIRouter.jsExtRegex.test(testDataPath)) {
            testDataPath += '.js';
        }

        testDataPath = Path.resolve(testDataPath);

        koaMethod.call(this.router, path, async (ctx: Context) => {

            //debug log
            Debug.log(ctx.request, `${ctx.request.method.toUpperCase()} ${ctx.request.originalUrl}`);
            //

            let data;
            try {
                if (config.test.api.useTestData) {
                    if (FS.existsSync(testDataPath)) {
                        console.log(`loads test data from "${testDataPath}".`);
                        await wait(config.test.api.testDataDelay || 0);
                        data = require(testDataPath);
                    } else {
                        console.log(`test data "${testDataPath}" does not exist, will call handler.`);
                        data = await apiMethod.handler.call(apiMethod.target, ctx);
                    }
                } else {
                    data = await apiMethod.handler.call(apiMethod.target, ctx);
                }
            } catch (e) {
                console.log(e, 'catch')
            }
            ctx.response.body = (typeof data);
        });
    }
}