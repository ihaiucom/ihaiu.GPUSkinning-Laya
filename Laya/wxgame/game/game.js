

require('js/bundle.js');


// 设置屏幕常亮
wx.setKeepScreenOn && wx.setKeepScreenOn({
  keepScreenOn: true,
  success: function () {
    console.log("常亮设置成功！!!!");
  }
});

// require('testFile.js');
