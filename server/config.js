export const db = {
    mysql: {
        name: 'MyBlog',
        host: '118.178.192.112',
        port: 3306,
        user: 'root',
        password: '815815'
    },
    mongodb:{
        db: 'mongodb://luruozhou:123456@127.0.0.1/luruozhou',//本地
        opts: {
            server: {poolSize: 20},
        }
    }
};

/** 链接数 */
export const sequelizeConnectionPool = {
    maxIdleTime: 20000,
    maxConnections: 200
}

export const ServerHost = {
    host:'http://dev.zm1v1.com:8085',
    port:9000
}

export const appSecret = "lrz-kkk";

/** 启用强缓存 */
export const enableStrongCache = true;
