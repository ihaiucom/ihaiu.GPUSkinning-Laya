/**This class is automatically generated by LayaAirIDE, please do not make any modifications. */
import GameUI from "./script/GameUI"
/*
* 游戏初始化配置;
*/
export default class GameConfig{
    static width:number=1334;
    static height:number=750;
    static scaleMode:string= Laya.Stage.SCALE_FIXED_AUTO;
    static screenMode:string="none";
    static alignV:string="top";
    static alignH:string="left";
    static startScene:any="test/TestScene.scene";
    static sceneRoot:string="";
    static debug:boolean=false;
    static stat:boolean=true;
    static physicsDebug:boolean=false;
    static exportSceneToJson:boolean=true;
    static useWebGL2 = true;
    constructor(){}
    static init(){
        var reg: Function = Laya.ClassUtils.regClass;
        reg("script/GameUI.ts",GameUI);
    }
}
GameConfig.init();