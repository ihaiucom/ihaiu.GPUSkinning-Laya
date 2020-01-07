import { TestScene } from "./TestSene";
import MaterialInstall from "../Materials/MaterialInstall";
import { Cartoon2Material } from "../Materials/Cartoon2Material";
import GPUSkinningPlayerMono from "../GPUSkinning/GPUSkinningPlayerMono";
import GPUSkinningAnimation from "../GPUSkinning/Datas/GPUSkinningAnimation";

import Mesh = Laya.Mesh;
import Material = Laya.Material;
import Texture2D = Laya.Texture2D;
import GPUSkining from "../GPUSkinning/GPUSkining";
import { GPUSkinningUnlitMaterial } from "../GPUSkinning/Material/GPUSkinningUnlitMaterial";
import { GPUSkinningWrapMode } from "../GPUSkinning/Datas/GPUSkinningWrapMode";


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
        
		await GPUSkining.InitAsync();
		// 初始化shader
        await MaterialInstall.install();
        // this.TestPrefab();
        var plane2:Laya.MeshSprite3D = <any> this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(5, 5, 1,1)));
        plane2.transform.localRotationEulerX = 20;

        var plane:Laya.MeshSprite3D = <any> this.scene.addChild(new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(5, 5, 1,1)));
        var mat = new Laya.UnlitMaterial();
        plane.transform.localRotationEulerX = 20;
        window['planemat'] = mat;
        window['plane'] = plane;

        // var texture =  await this.LoadAnimTextureAsync("res/gpuskining/rili.bytes", 2, 2);
        // var texture =  await this.LoadAnimTextureAsync("res/gpuskining/GPUSKinning_Laya_Texture_MutantAnim2.bytes", 128, 64);
        // var texture =  this.GetAnimTextureAsync();
        // mat.albedoTexture = texture;
        // mat.GPUSkinning_TextureMatrix = texture;
        plane.meshRenderer.sharedMaterial = mat;
        


        // var mono = await GPUSkining.CreateByNameAsync("MutantAnim2", "res/gpuskining/enemy_mutant_d.jpg");
        
        var mono = await GPUSkining.CreateByNameAsync("Hero_1001_Dianguanglongqi_Skin1", "res/gpuskining/Hero_1001_Dianguanglongqi.jpg");
        if(mono)
        {
            mono.Player.Play("IDLE");
            
            for(var i = 0; i < mono.anim.clips.length; i ++)
            {
                mono.anim.clips[i].wrapMode = GPUSkinningWrapMode.Loop;
                mono.anim.clips[i].individualDifferenceEnabled =true;
            }
            this.scene.addChild(mono.owner);

            var sprite: Laya.MeshSprite3D = <Laya.MeshSprite3D> mono.owner;
            window['sprite'] = sprite;
            window['mono'] = mono;
            // sprite.transform.localRotationEulerX = -90;
            // this.CloneMono(mono);

        }

        return;

        var mono = await GPUSkining.CreateByNameAsync("Hero_1001_Dianguanglongqi_Skin1", "res/gpuskining/Hero_1001_Dianguanglongqi.jpg");
        if(mono)
        {
            
        for(var i = 0; i < mono.anim.clips.length; i ++)
        {
            mono.anim.clips[i].wrapMode = GPUSkinningWrapMode.Loop;
            mono.anim.clips[i].individualDifferenceEnabled =true;
        }

            this.scene.addChild(mono.owner);

            var sprite: Laya.MeshSprite3D = <Laya.MeshSprite3D> mono.owner;
            sprite.transform.localPositionX = 2;
            mono.Player.Play("IDLE");


            window['sprite2'] = sprite;
            window['mono2'] = mono;
            // sprite.transform.localRotationEulerX = -90;
            // this.CloneMono(mono);

        }

        // await this.TestLoadCube();
    }

    CloneMono(mono: GPUSkinningPlayerMono, nx = 10, ny = 20)
    {
        var names = [];
        for(var i = 0; i < mono.anim.clips.length; i ++)
        {
            mono.anim.clips[i].wrapMode = GPUSkinningWrapMode.Loop;
            mono.anim.clips[i].individualDifferenceEnabled =true;
            names[i] = mono.anim.clips[i].name;
        }
        var sprite: Laya.MeshSprite3D = <Laya.MeshSprite3D> mono.owner;
        for(var y = 0; y < ny; y ++)
        {
            for(var x = 0; x < nx; x ++)
            {
                var c : Laya.MeshSprite3D= <any>sprite.clone();
                // c.transform.localPositionX = x - 5;
                c.transform.localPositionX = x - 2;
                c.transform.localPositionZ = -y * 2 + 5;
                let cm :GPUSkinningPlayerMono= c.getComponent(GPUSkinningPlayerMono);
                cm.SetData(mono.anim, mono.mesh, mono.mtrl, mono.textureRawData)
                this.scene.addChild(c);
                let i = Random.range(0, mono.anim.clips.length - 1);
                i = Math.floor(i);
                cm.Player.Play(names[i]);

                // setTimeout(() => {
                    
                //     if(cm)cm.Player.Play(names[i]);
                // }, 100);

            }
        }
    }

    
	GetAnimTextureAsync(): Laya.Texture2D
	{
        var pixelsF32 =  new Float32Array(2 * 2 * 4);
        window['pixelsF32'] = pixelsF32;
        var i = 0;
        pixelsF32[i + 0] = 1.0;
        pixelsF32[i + 1] = 0.5;
        pixelsF32[i + 2] = 100;
        pixelsF32[i + 3] = 1.0;

        var texture: Laya.Texture2D = new Laya.Texture2D(2, 2, Laya.TextureFormat.R32G32B32A32, false, false);
        texture.wrapModeU = Laya.BaseTexture.WARPMODE_CLAMP;
        texture.wrapModeV = Laya.BaseTexture.WARPMODE_CLAMP;
        texture.filterMode = Laya.BaseTexture.FILTERMODE_POINT;
        texture.anisoLevel = 0;
        texture.lock = true;
        texture.setSubPixels(0, 0, 2, 2, pixelsF32, 0)
        return texture;
    }

    
	LoadAnimTextureAsync(path: string, width: int, height:int): Promise<any>
	{
		return new  Promise<any>((resolve)=>
		{
			Laya.loader.load(path, Laya.Handler.create(this, (arrayBuffer:ArrayBuffer)=>
			{
        var f32 = new Float32Array(arrayBuffer);
        window['f32'] = f32;
       
        var texture: Laya.Texture2D = new Laya.Texture2D(width, height, Laya.TextureFormat.R32G32B32A32, false, false);
        texture.wrapModeU = Laya.BaseTexture.WARPMODE_CLAMP;
        texture.wrapModeV = Laya.BaseTexture.WARPMODE_CLAMP;
        texture.filterMode = Laya.BaseTexture.FILTERMODE_POINT;
        texture.anisoLevel = 0;
        texture.lock = true;
        texture.setSubPixels(0, 0, width, height, f32, 0)
        console.log(width, height);
        
        window['animBuffer2'] = arrayBuffer;
        window['animTexture2'] = texture;
        resolve(texture);

			}), null, Laya.Loader.BUFFER);
		});
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