import * as Sequelize from 'sequelize';
import sequelize from '../core/sequelize';

var Model = sequelize.define(
    'UserToken', {
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        access_token: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        refresh_token: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        refresh_time: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        expired_time: {
            type: Sequelize.DATE,
            allowNull: false,
        },
    }, {
        tableName: 'user_token',
        timestamps: true,
        underscored: true,
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
    }
);
Model.sync();
export default Model;