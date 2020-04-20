
import Shader3D = Laya.Shader3D;
import BaseTexture = Laya.BaseTexture;
import ShaderData = Laya.ShaderData;
import ShaderDefine = Laya.ShaderDefine;
import Vector4 = Laya.Vector4;


export default class SceneMaterial
{
    static scene: Laya.Scene3D;
    static _shaderValues:ShaderData;
    static Init(scene: Laya.Scene3D)
    {
        this.scene = scene;
        this._shaderValues = (<any>scene)._shaderValues;
		this.SHADERDEFINE_SCENELIGHTINGTEXTURE = Shader3D.getDefineByName("SCENELIGHTING");
        this.sceneLightingSize = new Vector4(-10, 20, -10, 20);
    }
    
	static SCENELIGHTINGTEXTURE: number = Shader3D.propertyNameToID("u_SceneLightingTexture");
	static SCENELIGHTINGSIZE: number = Shader3D.propertyNameToID("u_SceneLightingSize");

	static SHADERDEFINE_SCENELIGHTINGTEXTURE: ShaderDefine;
    
	/**
	 * 场景光照贴图
	 */
    static get sceneLightingTexture(): BaseTexture 
    {
		return this._shaderValues.getTexture(this.SCENELIGHTINGTEXTURE);
	}

    static set sceneLightingTexture(value: BaseTexture) 
    {
		if (value)
			this._shaderValues.addDefine(this.SHADERDEFINE_SCENELIGHTINGTEXTURE);
		else
			this._shaderValues.removeDefine(this.SHADERDEFINE_SCENELIGHTINGTEXTURE);
		this._shaderValues.setTexture(this.SCENELIGHTINGTEXTURE, value);
    }

    static SetSceneLightingTexture(value: BaseTexture)
    {
        this.sceneLightingTexture = value;
    }

    
    
	/**
	 * 场景光照贴图映射场景大小 (xMin, xLength, zMin, zLength)
	 */
    static get sceneLightingSize(): Vector4 
    {
		return this._shaderValues.getVector(this.SCENELIGHTINGSIZE);
	}

    static set sceneLightingSize(value: Vector4) 
    {
		this._shaderValues.setVector(this.SCENELIGHTINGSIZE, value);
    }

    static SetSceneLightingSize(value: Vector4)
    {
        this.sceneLightingSize = value;
    }

    
    static LoadSceneLightingTexture(path: string)
    {
        Laya.loader.create(path, Laya.Handler.create(this, (texture:Laya.Texture2D)=>
        {
            this.sceneLightingTexture = texture;
        }), null, Laya.Loader.TEXTURE2D);
    }
}
