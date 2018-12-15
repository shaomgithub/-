//promise化
let {promisify} = require('util');
//判断文件状态
let stat = promisify(fs.stat);
//读取文件
let readdir = promisify(fs.readdir);
//删除文件操作
let unlink = promisify(fs.unlink);
//删除文件目录
let rmdir = promisify(fs.rmdir);
function wideAsync(p,callback){
  let arr = [p];
  let index = 0;
  async function removeCollect(index){
    let i = index-1;
    if(i>=0){
      await rmdir(arr[i]);
      removeCollect(i);
    }else{
      callback();
    }
  }
  async function wideSpace(index){
    if(!arr[index]){
      return removeCollect(index);
    }
    let fileState = await stat(arr[index]);
    //是目录
    if(fileState.isDirectory()){
      let dirs = await readdir(arr[index]);
      dirs = dirs.map(dir => path.join(arr[index], dir));
      arr = [...arr, ...dirs];
      index++;
      wideSpace(index);
      //是文件
    }else{
      await unlink(arr[index]);
      arr.splice(index,1); 
      index--;
      wideSpace(index);
    }
  }
  wideSpace(index);
}
wideAsync('a',()=>{
  console.log('删除成功');
});