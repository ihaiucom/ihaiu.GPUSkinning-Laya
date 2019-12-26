
import { Cartoon2Material } from "./Cartoon2Material";
import DissolveMaterial from "./DissolveMaterial";

import Vector4 = Laya.Vector4;
interface MaterialConfig
{
    shader:string;
    parameter:any;
}

interface Cartoon2MaterialParameter
{
    outlinewidth:number;
    mainColor:number[];
    shadowColor:number[];
    colorDeep:number;
    colorRange:number;
}

export default class MaterialParameterConfigManager
{
    static configsJson:any;
    static configPath:string = "res/config/materialparameter.json";

    static async LoadConfigAsync()
    {
        // let json = await Game.asset.loadResAsync(this.configPath, Laya.Loader.JSON);
        // this.configsJson = json;
    }

    static ToColor(colorArr:number[]):Vector4
    {
        return new Vector4(colorArr[0], colorArr[1], colorArr[2], colorArr[3]);
    }

    
    static SetParameter(material: Laya.BaseMaterial, prefabName:string)
    {
        if(!this.configsJson)
            return;
        let config:MaterialConfig = this.configsJson[prefabName];
        if(config)
        {
            if(material instanceof Cartoon2Material)
            {
                this.SetParameterByCartoon2Material(material, config.parameter);
            }

            if(material instanceof DissolveMaterial)
            {
                this.SetParameterByDissolveMaterial(material, config.parameter);
            }
        }
    }

    static SetParameterByCartoon2Material(material: Cartoon2Material, parameter:Cartoon2MaterialParameter)
    {
        material.albedoColor = this.ToColor(parameter.mainColor);
        material.shadowColor = this.ToColor(parameter.shadowColor);
        material._ColorDeep = parameter.colorDeep;
        material._ColorRange = parameter.colorRange;
        material._OutlineWidth = parameter.outlinewidth;
        // console.log("SetParameterByCartoon2Material", parameter.outlinewidth, material._OutlineWidth, material.albedoTexture.url);
        
    }

    static SetParameterByDissolveMaterial(material: DissolveMaterial, parameter:Cartoon2MaterialParameter)
    {
        material.albedoColor = this.ToColor(parameter.mainColor);
        material.shadowColor = this.ToColor(parameter.shadowColor);
        material._ColorDeep = parameter.colorDeep;
        material._ColorRange = parameter.colorRange;
        material._OutlineWidth = parameter.outlinewidth;
        // console.log("SetParameterByCartoon2Material", parameter.outlinewidth, material._OutlineWidth, material.albedoTexture.url);
        
    }
}