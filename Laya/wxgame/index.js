window.screenOrientation = "sensor_landscape",
loadLib("libs/laya.core.js"),
  loadLib("libs/laya.d3.js"),
loadLib("libs/laya.html.js"),
  loadLib("libs/laya.ani.js"),






loadLib("libs/game/GameCommonLib.js"),
loadLib("libs/game/StringExtend.js");




function loadSubpackage()
{
  const loadTask = wx.loadSubpackage({
    name: 'GameMain', // name 可以填 name 或者 root
    success: function (res) 
    {
      // 分包加载成功后通过 success 回调
      console.log("分包加载成功后");

    },
    fail: function (res) 
    {
      // 分包加载失败通过 fail 回调
      console.log("分包加载失败");
    }
  });

  loadTask.onProgressUpdate(res => {
    // console.log('下载进度', res.progress)
    // console.log('已经下载的数据长度', res.totalBytesWritten)
    // console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
  })
}


loadSubpackage();


