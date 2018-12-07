/*
    缓存的逻辑没有写 看了其他同学写的没怎么看懂  时间太紧就只写了 检测后缀名的
*/
let path = require('path');
let fs = require('fs');
let vm = require('vm');
function Module(id) {
  this.id = id;
  this.exports = {}
}
Module.wrap = function (script) {
  return `(function (exports, require, module, __filename, __dirname) {
      ${script}
  })`
}
Module._resolveExtName = function(path){
    let readPath = path.resolve(__dirname,path);
    //如果有后缀名的文件
    if(!path.extname(readPath)){
        let extName = Object.keys(Module._extensions); 
        for(let i=0;i < extName.length;i++){
            //如果目标目录存在
            if(fs.existsSync(path+extName[i])){
                //组合完整文件路径 
                return path+extName[i]
            }else{
                throw new Error("找不到文件");
            }
        }
    }
    return readPath;
}
Module._extensions = {
  '.js'(module){
    let content = fs.readFileSync(module.id, 'utf8');
    let fnStr = Module.wrap(content);
    let fn = vm.runInThisContext(fnStr);
    fn.call(module.exports, module.exports, req, module); 
  },
  '.json'(module){
    let content = fs.readFileSync(module.id,'utf8');
    module.exports = JSON.parse(content);
  }
}
function req(p) {
  let readlPath = path.resolve(__dirname,p);
  let filePath = Module._resolveExtName(readlPath);
  let module = new Module(filePath); 
  let extName = path.extname(module.id);
  Module._extensions[extName](module);
  return module.exports;
}