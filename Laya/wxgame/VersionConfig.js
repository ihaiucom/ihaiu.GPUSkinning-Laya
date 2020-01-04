var VersionConfig =
{
  // 应用版本号
  AppVersion: "v1.0.0.13",
  // 资源版本好
  ResVersion: "v1.0.0.0",
  // 是否使用Zip
  IsUseZip: true,
  // 是否使用网络资源
  IsUseWebRes: true,
  // 网络资源路径
  UrlBasePath: "https://h5-jjsg-cdn.123u.com/testlaya/web_01_00_00_13/",
  // 海外CDN
  // UrlBasePath: 'http://h5-hwjjsg-cdn.123u.com/testlaya/web/',
  UrlBasePath: "http://192.168.100.205:8901/bin/",

  // 网络资源路径 是否使用多个CDN
  IsUseCdnList: true,
  // 网络资源路径 CDN 资源根目录路径
  RootPath: "testlaya/web_01_00_00_13/",
  // 网络资源路径 多个CDN列表
  CDNList:
    [
      "https://h5-jjsg-cdn.123u.com/",
      "https://h5-jjsg-cdn1.123u.com/",
      "https://h5-jjsg-cdn2.123u.com/",
      "https://h5-jjsg-cdn3.123u.com/",
      "https://h5-jjsg-cdn4.123u.com/",
      "https://h5-jjsg-cdn5.123u.com/"
    ],


  isInited: false,
  Init: function () {
    if (this.isInited) {
      return;
    }
    this.isInited = true;

    if (window['wx']) {
      // VersionConfig.IsUseZip = true;
      // VersionConfig.IsUseCdnList = true;
      // VersionConfig.IsUseWebRes = true;
    }
    else {
      var isWeb = location.origin.eStartsWith("https://");
      if (isWeb) {
        VersionConfig.IsUseZip = true;
        VersionConfig.IsUseCdnList = true;
      }
    }

    // if (VersionConfig.IsUseCdnList) {
    //   VersionConfig.IsUseCdnList = VersionConfig.CDNList && VersionConfig.CDNList.length > 0;
    // }

    if (VersionConfig.IsUseWebRes && VersionConfig.UrlBasePath) {
      Laya.URL.basePath = VersionConfig.UrlBasePath;
    }
    Laya.URL.basePath = VersionConfig.UrlBasePath;

    if (Laya.MiniAdpter) {
      Laya.MiniAdpter.nativefiles =
        [
          "res/fgui/GameLaunch.bin",
          "res/fgui/GameLaunch_atlas0.png",
          "res/fgui/GameLaunch_atlas_upoiw2g.jpg",
        ];
    }

  }

};
window.VersionConfig = VersionConfig;
