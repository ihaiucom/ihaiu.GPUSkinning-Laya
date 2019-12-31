import { TestScene } from "./TestSene";
import MaterialInstall from "../Materials/MaterialInstall";
import { Cartoon2Material } from "../Materials/Cartoon2Material";
import GPUSkinningPlayerMono from "../GPUSkinning/GPUSkinningPlayerMono";
import GPUSkinningAnimation from "../GPUSkinning/Datas/GPUSkinningAnimation";

import Mesh = Laya.Mesh;
import Material = Laya.Material;
import Texture2D = Laya.Texture2D;
import GPUSkining from "../GPUSkinning/GPUSkining";


export default class TestShader
{
    scene: TestScene;
    constructor()
    {
        this.scene = TestScene.create();
        Laya.stage.addChild(this.scene);
        // this.loadPrefab();
        this.InitAsync();
    }

    async InitAsync()
    {
		// 初始化shader
        await MaterialInstall.install();
        // this.TestPrefab();

        var mono = await GPUSkining.CreateByNameAsync("Hero_1001_Dianguanglongqi_Skin1", "res/gpuskining/Hero_1001_Dianguanglongqi.jpg");
        if(mono)
        {
            this.scene.addChild(mono.owner);
        }

        await this.TestLoadCube();
    }

    TestGPUSkining()
    {
        var anim: GPUSkinningAnimation, mesh: Mesh, mtrl: Material, textureRawData: Texture2D;

        var sprite = new Laya.MeshSprite3D();
        var mono: GPUSkinningPlayerMono = sprite.addComponent(GPUSkinningPlayerMono);
        mono.SetData(anim, mesh, mtrl, textureRawData);
    }

    TestPrefab()
    {
        let box = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1, 1, 1));
        box.transform.rotate(new Laya.Vector3(0, 45, 0), false, false);

        var meshRenderer = box.meshRenderer;

        
        let material = new Cartoon2Material();
        material.enableLighting = true;
        meshRenderer.material = material;

        this.scene.addChild(box);
    }

    async TestLoadCube()
    {
        
        let prefabName = "Cube";
        let path = this.GetPathByResId(prefabName);

        let res:Laya.Sprite3D = await this.Load3DAsync(path);
        res.transform.localRotationEulerX = -90;
        this.scene.addChild(res);
        res.transform.position = new Laya.Vector3(0, 0, 0);
        window['res'] = res;
    }

    /** 3D资源根目录 */
    static  Res3DRoot: string = "res3d/Conventional/";
    
    /** 获取资源路径 */
    GetPathByResId(resId: string): string
    {
        return TestShader.Res3DRoot + resId + ".lh";
    }
    
    async loadPrefab()
    {
		// 初始化shader
        await MaterialInstall.install();
        
        let prefabName = "Hero_1001_Dianguanglongqi_Skin1";
        let path = this.GetPathByResId(prefabName);

        let res:Laya.Sprite3D = await this.Load3DAsync(path);

        let node1 = this.createRole(res);
        let node2 = this.createRole(res);

        node2.transform.localPositionX = 2;
        node2.transform.localScaleX = -1;

        var modelNode1: Laya.Sprite3D = <Laya.Sprite3D> node1.getChildByName("model");
        var modelNode2: Laya.Sprite3D = <Laya.Sprite3D> node2.getChildByName("model");
        let animator1:Laya.Animator = modelNode1.getComponent(Laya.Animator);
        let animator2:Laya.Animator = modelNode2.getComponent(Laya.Animator);

        Laya.timer.loop(3000, this, ()=>{
            animator1.play(Math.random() > 0.5 ? "RUN" : "IDLE");
            modelNode1.transform.localScaleX *= -1;
        });
        
        Laya.timer.loop(4000, this, ()=>{
            modelNode2.transform.localScaleX *= -1;
            animator2.play(Math.random() > 0.5 ? "RUN" : "IDLE");
        });
        
    }

    createRole(res:Laya.Sprite3D)
    {
        let node:Laya.Sprite3D = <Laya.Sprite3D> res.clone();
        node.transform.position = new Laya.Vector3(0, 0, 0);
        window['node'] = node;
        
        var modelNode: Laya.Sprite3D = <Laya.Sprite3D> node.getChildByName("model");
        let animator:Laya.Animator = modelNode.getComponent(Laya.Animator);

        let skinnedMeshSprite3D:Laya.SkinnedMeshSprite3D = <Laya.SkinnedMeshSprite3D>(modelNode.getChildAt(1));
        if(!(skinnedMeshSprite3D instanceof Laya.SkinnedMeshSprite3D))
        {
            skinnedMeshSprite3D = <Laya.SkinnedMeshSprite3D>(modelNode.getChildAt(0));
        }
        let meshRenderer = skinnedMeshSprite3D.skinnedMeshRenderer;
        let unlitMaterial = <Laya.UnlitMaterial> meshRenderer.material;
        // unlitMaterial.renderMode = UnlitMaterial.RENDERMODE_CUTOUT;

        let material = new Cartoon2Material();
        material.enableLighting = true;
        material.albedoTexture = unlitMaterial.albedoTexture;
        meshRenderer.material = material;

        
        this.scene.addChild(node);
        animator.play("IDLE");
        return node;
    }



    
	async Load3DAsync(path: string):Promise<any>
	{
        return new Promise<any>((resolve)=>
        {
			Laya.loader.create(path, Laya.Handler.create(null, (res)=>
			{
                resolve(res);
			}));
		});
    }
}