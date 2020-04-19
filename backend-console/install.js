/*
 * @Author: your name
 * @Date: 2019-12-10 18:20:05
 * @LastEditTime: 2020-04-19 13:13:12
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-mini-admin/libs/install.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');
const inquirer = require('inquirer');
const shell    = require('shelljs');
const moment   = require('moment');
const bcrypt   = require('bcrypt');

let lockfile_name = '.mini-admin.locked'

function bcrypt_password(plaint_pass) {
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(plaint_pass, salt);
    return hash;
}
function replace_money_symbol (txt) {
    return txt;
    //return txt.replace(/\$/g, '\\$');
}

function replace_windows_path_split (path) {
    // this for Windows
    return path.replace(/\\/g, '\\\\');//.replace(/\//g, '\\\/');
}

module.exports = async function (l, p) {
    
        console.log(colors.green('checking the locked file...'));
        let lockfile_path = path.join(process.cwd(), lockfile_name);
        if (fs.existsSync(lockfile_path)) {
            throw 'mini-admin had installed. pls remove '+lockfile_name+ ' to continue...'
        }

        // 没有 login 和 password 进来 则需要在此询问用户的 login 和 password
        let answer = {nickname:'', login:l?(l).toString():'', password:p?(p).toString():'', email:''};

        if (!l || !p) {
            let question = [
           
                {
                    type: 'input',
                    name: 'login',
                    message: "your login account (defalut admin) ? ",
                },
                {
                    type: 'input',
                    name: 'password',
                    message: "your login password (default 123456) ? ",
                },
            ];
            answer = await inquirer.prompt(question);
        }
        let {nickname, login, password, email} = answer;
        


        // 处理一下把$,换成 \$.
        nickname = nickname? replace_money_symbol(nickname): 'putsoon';
        login = login? replace_money_symbol(login): 'admin';
        password = password? replace_money_symbol(bcrypt_password(password)) : replace_money_symbol( bcrypt_password('123456') );
        email = email? replace_money_symbol(email): 'admin@admin.com';

        //console.debug('install.js#install@nickname, login, password, email', nickname, login, password, email);
        //return 0;
        /**
         * shell sequelize-cli
         */
        let cwd = process.cwd();
        
        /** copy the sequelizerc file to dest */
        shell.cp('-r', cwd+'/backend-console/build-stuff/sequelizerc', cwd+'/.sequelizerc');

        shell.exec('npx sequelize-cli init --force');
        
        shell.rm('-rf', cwd+'/database/config/database.json');
        
        // change the databse config file.
        //shell.exec('pwd=`pwd` && sed "s:{pwd}:${pwd}:g" '+cwd+'/backend-console/build-stuff/sqlite.database.json.tpl'+' > '+cwd+'/database/config/database.json');

        let db_config = fs.readFileSync(cwd+'/backend-console/build-stuff/sqlite.database.json.tpl').toString();
        
        // test
        
        db_config = db_config.replace(/\{pwd\}/g, replace_windows_path_split(cwd));
        fs.writeFileSync(cwd+'/database/config/database.json', db_config);

        // 1 copy migration
        shell.cp('-r', cwd+'/backend-console/build-stuff/migrations/*.js', cwd+'/database/migrations/');
        // 2 run migration
        //shell.exec('npx sequelize-cli db:migrate');

        // 3 create a admin sheed

        // replace the admin-user name & pwd
        console.log(colors.green('generate the Admin user Seeder file ...'));

        //shell.rm('-rf', cwd+'/build-stuff/seeders/*');
        
        let datetime = moment(new Date()).format('YYYYMMDDHHmm');
        let tablename = 'AdminUsers';
        
        // 因为windows上对sed的支持不足，所以只能用原始的办法了。
        //shell.exec('tablename="'+tablename+'" && nickname="'+nickname+'" && login="'+login+'" && password="'+password+'" && email="'+email+'" && sed -e "s:{tablename}:${tablename}:g" -e "s:{nickname}:${nickname}:g" -e "s:{login}:${login}:g" -e "s:{password}:${password}:g" -e "s:{email}:${email}:g" '+cwd+'/backend-console/build-stuff/seed-admin-user.js.tpl > '+cwd+'/backend-console/build-stuff/'+datetime+'-admin-user.js');

        // 4 copy the seeder file.
        shell.rm('-rf', cwd+'/database/seeders/*');

        let admin_seeder = fs.readFileSync(cwd+'/backend-console/build-stuff/seed-admin-user.js.tpl').toString();
        admin_seeder = admin_seeder.replace(/\{tablename\}/g, tablename);
        admin_seeder = admin_seeder.replace(/\{nickname\}/g, nickname);
        admin_seeder = admin_seeder.replace(/\{login\}/g, login);
        admin_seeder = admin_seeder.replace(/\{email\}/g, email);
        admin_seeder = admin_seeder.replace(/\{password\}/g, password);
        fs.writeFileSync(cwd+'/database/seeders/'+datetime+'-admin-user.js', admin_seeder);
        //shell.mv('-f', cwd+'/backend-console/build-stuff/'+datetime+'-admin-user.js', cwd+'/database/seeders/');
        
        // 5 seeding...
        //console.log(colors.green('seeding ...'));
        //shell.exec('npx sequelize-cli db:seed:all');
        
        // 6 copy the model
        console.log(colors.green('copying the model file'));
        shell.cp('-r', cwd+'/backend-console/build-stuff/models/*.js', cwd+'/database/models')
        
        // 7 copy the model wapper
        console.log(colors.green('copying the connect driver'));
        shell.cp('-r', cwd+'/backend-console/build-stuff/conn.js.tpl', cwd+'/database/conn.js');

        // 8 copy the model wapper
        console.log(colors.green('copying the sequelize model wapper'));
        shell.cp('-r', cwd+'/backend-console/build-stuff/sequelize_model.js.tpl', cwd+'/database/sequelize_model.js');
    }
