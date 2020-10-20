import { TestScene } from "./TestSene";

export default class TestLayaAnim
{
    scene: TestScene;
    constructor()
    {
        this.scene = TestScene.create();
        Laya.stage.addChild(this.scene);
        this.InitAsync();
    }

    async InitAsync()
    {
        Laya.Loader.typeMap['ls'] = Laya.Scene3D.HIERARCHY;
        Laya.Loader.typeMap['lh'] = Laya.Sprite3D.HIERARCHY;

        var sprite = await TestLayaAnim.loadAsync("res3d/Conventional/longqi_01.lh", null);
        window['sprite'] = sprite;
        this.scene.addChild(sprite);

    }

    
    // 加载资源, 异步
    static async loadAsync(path: string, type: string): Promise<any>
    {
        return new Promise<any>((resolve)=>
        {
            Laya.loader.load(path, 
                Laya.Handler.create(null, (res: any) =>
                {
                    resolve(res);
                }), 
                null, type);
         });
    }
}