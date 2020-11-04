import { TestScene } from "./TestSene";
import GPUSkinningPlayerMono from "../GPUSkinning/GPUSkinningPlayerMono";
import GPUSkinningAnimation from "../GPUSkinning/Datas/GPUSkinningAnimation";

import Mesh = Laya.Mesh;
import Material = Laya.Material;
import Texture2D = Laya.Texture2D;
import GPUSkining from "../GPUSkinning/GPUSkining";
import { GPUSkinningWrapMode } from "../GPUSkinning/Datas/GPUSkinningWrapMode";
import { TestRotation } from "./TestRotation";


export default class TestShader
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
        GPUSkining.resRoot = "res3d/GPUSKinning-30/";
        await GPUSkining.InitAsync();
        
        // var box = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(1.0, 0.25, 0.5));
        // this.scene.addChild(box);


        var nameList = [
            ["1010_000", "1010_000"],
            // "3001",
            // "Hero_1004_Dongzhuo_Skin1",
            // "Monster_4003_Kuileishi_Skin1",
            // "longqi_01"
        ];

        for(var j = 0; j < nameList.length; j ++)
        {
            var resId = nameList[j];
            var hasShadowTexture = false;
            var mono = await GPUSkining.CreateByNameAsync(nameList[j][0], nameList[j][1]);
            // mono.Player.material.IsSeparation = true;
            // mono.Player.material.IsSuperarmor = true;
            // var mono = await GPUSkining.CreateByNameAsync(nameList[j], MaterialTextureType.ShadowColor_And_HeightRimLight);
            // var mono = await GPUSkining.CreateByNameAsync(nameList[j], MaterialTextureType.Shadow, GPUSkinningCartoon2TextureMaterial);
            var node = <Laya.Sprite3D> mono.owner;
            node.transform.localRotationEulerY = 90;
            // node.addComponent(TestRotation);
            window['mono'] = mono;
            // mono.Player.Play("attack_01");
            // for(var i = 0; i < mono.anim.clips.length; i ++)
            // {
            //     mono.anim.clips[i].wrapMode = GPUSkinningWrapMode.Loop;
            //     mono.anim.clips[i].individualDifferenceEnabled =true;
            // }
            // mono.Player.isRandomPlayClip = true;

            var b = new Laya.Sprite3D();
            b.addChild(mono.owner);
            this.scene.addChild(b);
            // b.transform.localScaleX = -1;
            mono.Player.SetWeapon("D_R_weapon", "w_1010_r_000", "w_1010_r_000");

            // b.transform.setWorldLossyScale(new Laya.Vector3(-1, 1, 1));

            // setTimeout(() => {
                
            // var b = new Laya.Sprite3D();
            // var node2 = <Laya.Sprite3D> node.clone();
            // var mono2:GPUSkinningPlayerMono = node2.getComponent(GPUSkinningPlayerMono);
            // window['mono2'] = mono2;
            // // mono2.Player.material.IsSeparation = true;
            // node2.transform.localRotationEulerY = 90;
            // b.addChild(node2);
            // b.transform.localPositionX += 1.5;
            // b.transform.localScaleX = -1;
            // this.scene.addChild(b);
            // mono2.Player.SetWeapon("D_R_weapon", "w_1010_r_000", "w_1010_r_000");
            // }, 1000);

            break;
        }
       
    }


}