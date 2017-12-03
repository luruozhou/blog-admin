export let test = {
    route: {
        useTestData: false
    },
    api: {
        useTestData: true,
        testDataDelay: 1000
    }
};

export let db = {
    mysql: {
        name: 'MyBlog',
        host: '118.178.192.112',
        port: 3306,
        user: 'root',
        password: '815815'
    }
};

/** 链接数 */
export let sequelizeConnectionPool = {
    maxIdleTime: 20000,
    maxConnections: 200
}

/** 启用强缓存 */
export let enableStrongCache = true;
