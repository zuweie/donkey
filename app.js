/*
 * @Author: your name
 * @Date: 2020-02-05 10:28:31
 * @LastEditTime: 2020-04-11 01:20:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app.js
 */

let Tasklistener = new Map();
const process = require('process');
const fs = require('fs');

module.exports = (app) => {

    //console.info('app.js@process.env.NODE_ENV', process.env.NODE_ENV);
    //console.debug('app.js@app', app.config);

    app.passport.verify(async (ctx, user) => {
        ctx.payload = user.payload;
        return user.payload;
    });
    
    app.messenger.on('exec_task', (taskey) => {
        console.debug('app.js#on_exec_task: app (pid '+process.pid+') receive a message to exec task');
        //console.debug('task', task);
        const ctx = app.createAnonymousContext();
        ctx.runInBackground( async () => {
            try{
                console.debug('app.js#app.messenger@exec_task start');
                let _task = await ctx.service.task.findTask(taskey);
                await ctx.service.task.execTask(_task);
                console.debug('app.js#app.messenger@exec_task end')
            }catch(e){
                console.debug(e);
            }
            
            console.debug('app (pid ' +process.pid +') send a message all the app to update task status');
            //let new_status_task = await ctx.service.task.findTask(task.key);
            //console.debug('app (pid '+process.id +') now task (before send)', new_status_task);
            ctx.app.messenger.sendToApp('task_done', taskey);
        })
    });

    app.messenger.on('task_done', (key)=>{
        console.debug('app.js#task_done@app (pid '+ process.pid +') receive a message to update task of <'+key+'>');

       let l = Tasklistener.get(key);
       if (l) {
           l.onTaskStatus(key);
       }
    });
    
    app.messenger.on('_port', ()=>{
        let fd = fs.openSync('./.port', 'w+');
        fs.writeSync(fd, app.server.address().port);
    });
   
    app.addTasklistener = (l) =>{

        console.debug('pid '+process.pid+' add listener!');
        Tasklistener.set(l.taskey, l);
        //Tasklistener.push(l);
    };
    
    app.rmTasklistener = (l) => {
        /*
        for(let i=0; i<Tasklistener.length; ++i) {
            if (l == Tasklistener[i]) {
                console.debug('app pid '+ process.pid + ' rm listener !');
                Tasklistener.splice(i, 1);
                console.debug('app pid '+ process.pid + ' has listener '+Tasklistener.length);
                break;
            }
        }
        */
       if (l) Tasklistener.delete(l.taskey);
    }
    app.publishTaskStatus = (key) => {
        listener.forEach(l=>{
            l.onTaskStatus(key);
        });
    }
    
}