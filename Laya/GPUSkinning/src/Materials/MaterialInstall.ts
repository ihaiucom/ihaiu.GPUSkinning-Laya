import { BlinnPhongMaterial } from "./BlinnPhongMaterial";
import { HeroMaterial } from "./HeroMaterial";
import { Cartoon2Material } from "./Cartoon2Material";
import MaterialParameterConfigManager from "./MaterialParameterConfigManager";
import DissolveMaterial from "./DissolveMaterial";
import BloomMaterial from "./BloomMaterial";
import BloomEffectMaterial from "./BloomEffectMaterial";

import Shader3D = Laya.Shader3D;
import ShaderVariant = Laya.ShaderVariant;

export default class MaterialInstall
{
    static async install()
    {
        // 3D
        // await BlinnPhongMaterial.install();
        await Cartoon2Material.install();
        // await HeroMaterial.install();
        // await DissolveMaterial.install();
        // await BloomMaterial.install();
        // await BloomEffectMaterial.install();

        // await MaterialParameterConfigManager.LoadConfigAsync();

        // await this.initShader();

    }

    //初始化shader
    private static async initShader()
    {
        // let shaderObj = await Game.asset.loadResAsync("res/config/ShaderVariantCollection.json", Laya.Loader.JSON);
        // for(let shaderName in shaderObj)
        // {
        //     let shader:Shader3D = Shader3D._preCompileShader[shaderName];
        //     //加载获取得到shaderObj
        //     let arr :Array<any>= shaderObj[shaderName];
        //     for (let index = 0; index < arr.length; index++) 
        //     {
        //         let obj = arr[index];
        //         let shadervariant = new ShaderVariant(shader, obj.subShaderIndex, obj.passIndex, obj.defineNames);
        //         //将构建的shadervariant添加到debugShaderVariantCollection中
        //         Shader3D.debugShaderVariantCollection.add(shadervariant);
        //     }
        // }
      
        // //预编译shader
        // Shader3D.debugShaderVariantCollection.compile();
    }

    
    /** 导出Shader 预编译 */
    static exportShaderVariantCollection()
    {
        let shaderObj = {};
        let arr;
        for(let i = 0;i<Shader3D.debugShaderVariantCollection.variantCount;i++)
        {
            let shadervariant:ShaderVariant = Shader3D.debugShaderVariantCollection.getByIndex(i);
            let shaderName:string = shadervariant.shader.name;
            if(!shaderObj[shaderName])shaderObj[shaderName] = [];
            arr = shaderObj[shaderName];
            let obj:any = {};
            obj.defineNames = shadervariant.defineNames;
            obj.passIndex= shadervariant.passIndex;
            obj.subShaderIndex= shadervariant.subShaderIndex;
            arr.push(obj);
        }

        let json = JSON.stringify(shaderObj, null, 4);
        console.log(json);
        // saveFile("ShaderVariantCollection.json",json)
    }
}

window['MaterialInstall'] = MaterialInstall;