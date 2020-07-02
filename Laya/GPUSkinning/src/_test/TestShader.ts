import { TestScene } from "./TestSene";
import GPUSkinningPlayerMono from "../GPUSkinning/GPUSkinningPlayerMono";
import GPUSkinningAnimation from "../GPUSkinning/Datas/GPUSkinningAnimation";

import Mesh = Laya.Mesh;
import Material = Laya.Material;
import Texture2D = Laya.Texture2D;
import GPUSkining, { MaterialTextureType } from "../GPUSkinning/GPUSkining";
import { GPUSkinningUnlitMaterial } from "../GPUSkinning/Material/GPUSkinningUnlitMaterial";
import { GPUSkinningWrapMode } from "../GPUSkinning/Datas/GPUSkinningWrapMode";
import { TestRotation } from "./TestRotation";
import { GPUSkinningCartoon2TextureMaterial } from "../GPUSkinning/Material/GPUSkinningCartoon2TextureMaterial";


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
        


        var nameList = [
            "1002_Skin1",
            // "Hero_1004_Dongzhuo_Skin1",
        ];

        for(var j = 0; j < nameList.length; j ++)
        {
            var resId = nameList[j];
            var hasShadowTexture = false;
            var mono = await GPUSkining.CreateByNameAsync(nameList[j], MaterialTextureType.ShadowColor_And_HeightRimLight);
            // var mono = await GPUSkining.CreateByNameAsync(nameList[j], MaterialTextureType.Shadow, GPUSkinningCartoon2TextureMaterial);
            var node = <Laya.Sprite3D> mono.owner;
            node.addComponent(TestRotation);
            // node.transform.localRotationEulerY = 90;
            window['mono'] = mono;
            mono.Player.Play("Idle");
            for(var i = 0; i < mono.anim.clips.length; i ++)
            {
                mono.anim.clips[i].wrapMode = GPUSkinningWrapMode.Loop;
                mono.anim.clips[i].individualDifferenceEnabled =true;
            }
            // mono.Player.isRandomPlayClip = true;

            this.scene.addChild(mono.owner);
            break;
        }
       
    }


}