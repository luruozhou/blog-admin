import * as FS from 'fs';
import * as Path from 'path';

import * as Sequelize from 'sequelize';

import * as ThenFail from '../../libs/thenfail';
import * as Debug from '../../libs/debug';

import {db as config, test as testConfig, sequelizeConnectionPool} from '../../config';

let mysqlConfig = config.mysql;

let sequelize = new Sequelize(mysqlConfig.name, mysqlConfig.user, mysqlConfig.password, {
    timezone: '+08:00',
    host: mysqlConfig.host,
    port: mysqlConfig.port,
    dialect: 'mysql',
    logging: function (message: string) {
        ///{debug
        if (message.indexOf('Executing') > -1) {
            //Debug.log(sequelize, message);

        } else if (/error/i.test(message)) {
            Debug.error(sequelize, message);
        } else {
            Debug.warn(sequelize, message);
        }
        ///}
    },
    dialectOptions: {
        multipleStatements: true
    },
    pool: {
        idle: sequelizeConnectionPool.maxIdleTime,
        max: sequelizeConnectionPool.maxConnections
    }
});

Debug.log(sequelize, 'sequelize query logs');

export default sequelize;

// require('../db-models/model-relations');
