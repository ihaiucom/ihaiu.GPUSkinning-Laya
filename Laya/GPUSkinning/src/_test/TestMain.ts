import TestShader from "./TestShader";
import GameConfig from "../GameConfig";
import GPUSkining from "../GPUSkinning/GPUSkining";

 class TestMain 
{
    constructor() 
    {
		this.InitLaya();


		if(Laya.Browser.onWeiXin)
		{
			Laya.URL.basePath = "http://10.10.10.188:8900/bin/";
		}
		
		// 启动游戏
		new TestShader();
		
		

	}

	

	InitLaya()
	{
		//根据IDE设置初始化引擎		
		if (window["Laya3D"]) Laya3D.init(GameConfig.width, GameConfig.height);
		else Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
		Laya["Physics"] && Laya["Physics"].enable();
		Laya["DebugPanel"] && Laya["DebugPanel"].enable();
		Laya.stage.scaleMode = GameConfig.scaleMode;
		Laya.stage.screenMode = GameConfig.screenMode;
		Laya.stage.alignV = GameConfig.alignV;
		Laya.stage.alignH = GameConfig.alignH;
		//兼容微信不支持加载scene后缀场景
		Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

		Laya.Shader3D.debugMode = true;

		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
		// if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
		if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
		if (GameConfig.stat) Laya.Stat.show();
		Laya.alertGlobalError = true;
	}


}


//激活启动类
new TestMain();