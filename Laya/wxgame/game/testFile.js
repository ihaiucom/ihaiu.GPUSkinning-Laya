
var MiniFileMgr = Laya.MiniFileMgr;
function printDir(dirRoot)
{
  console.log(`打印目录:${dirRoot}`);
  var list = MiniFileMgr.fs.readdirSync(dirRoot);
  for (var path of list) {
    var url = dirRoot + "/" + path;
    console.log(url);
  }
}

function findFile(path, dirRoot)
{
  if (!dirRoot)
  {
    dirRoot = MiniFileMgr.fileNativeDir;
  }
  var list = MiniFileMgr.fs.readdirSync(dirRoot);
  if (list.indexOf(path) != -1)
  {
    console.log("存在文件：", path);
  }
  else
  {
    console.log("不存在文件：", path);
  }
}

printDir(MiniFileMgr.fileNativeDir);
printDir(MiniFileManager.rootPath);


// setTimeout(function(){

//   console.log("Laya.MiniFileMgr.fakeObj", Laya.MiniFileMgr.fakeObj)
// }, 2000)



// var path = "wx8f6cdf2d4ba80fed.o6zAJswJ5bxaNvboOtqQvwkU3uKU.gdgx9HvDc7wc4e038689d1aed3dd7be3789126c9e795.png";

// findFile(path, null);

// console.log("清除缓存");
// Laya.MiniFileMgr.deleteAll();

function __testFun()
{
  // var path = "res/fgui/GameLaunch.bin";
  // path = "ServerList.json";
  // path = "res/fgui/GameLaunch_atlas0.png"
  // Laya.loader.load(path, Laya.Handler.create(this, (res) => {
  //   console.log("加载", path, res);
  // }))
  return false;
}

window.__testFun = __testFun;

