import { TestScene } from "./TestSene";
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
        this.InitAsync();
    }

    async InitAsync()
    {
        GPUSkining.resRoot = "res3d/GPUSKinning-30/";
        await GPUSkining.InitAsync();
        


        var nameList = [
            "Hero_1004_Dongzhuo_Skin1",
        ];

        for(var j = 0; j < nameList.length; j ++)
        {
            var resId = nameList[j];
            var mono = await GPUSkining.CreateByNameAsync(nameList[j], true);
            window['mono'] = mono;
            mono.Player.Play("Idle");
            // for(var i = 0; i < mono.anim.clips.length; i ++)
            // {
            //     mono.anim.clips[i].wrapMode = GPUSkinningWrapMode.Loop;
            //     mono.anim.clips[i].individualDifferenceEnabled =true;
            // }

            this.scene.addChild(mono.owner);
            break;
        }
       
    }


}