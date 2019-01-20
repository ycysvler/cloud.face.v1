/**
 * 加载指定文件夹下的router
 *
 * copy from yanggang by zhanghongqing on 2018/6/28.
 */
const fs = require('fs');
const path = require('path');
const Router = require('koa-router');                   // 引用路由模块

const loader = function (loadPath) {                    // 加载一个目录
    let router = new Router();
    let walk = function(dir) {
        let results = [];
        let list = fs.readdirSync(dir);
        list.forEach(function(file) {
            file = dir + '/' + file;
            let stat = fs.statSync(file);
            if (stat && stat.isDirectory()) results = results.concat(walk(file));
            else results.push(file);
        });
        return results;
    };
    let files =  walk(loadPath);

    for (let i in files){
        let file = path.resolve(loadPath , files[i]);

        if (fs.statSync(file).isFile() &&
            path.extname(file).toLowerCase() == '.js' &&
            path.basename(file).substr(0,1) != '.'){

            require(file)(router);
        }
    }
    return router;
};


module.exports = (routerpath, routerbase)=>{
    let root = new Router();
    let r_api = loader(path.join(routerpath));       // 加载 routers/api 下文件

    root.use(routerbase, r_api.routes(), r_api.allowedMethods());
    return root;
};
