import Shader3D = Laya.Shader3D;
import BaseTexture = Laya.BaseTexture;
import ShaderDefine = Laya.ShaderDefine;
import Vector4 = Laya.Vector4;


export class GPUSkinningBaseMaterial extends Laya.Material
{
    static SHADER_PATH_ROOT = "res/shaders/GPUSkinning/";
    
    // 获取--Shader路径--vs
    static getShaderVS(filename: string)
    {
        return this.SHADER_PATH_ROOT + filename  + ".vs";
    }

    // 获取--Shader路径--ps
    static getShaderPS(filename: string)
    {
        return this.SHADER_PATH_ROOT + filename  + ".fs";
    }

    
    // 获取--Shader路径--glsl
    static getShaderGLSL(filename: string)
    {
        return this.SHADER_PATH_ROOT + filename  + ".glsl";
    }

    
    // 加载Shader
    static async loadShaderGlslAsync(filename: string): Promise<string>
    {
        let code = await this.loadAsync(this.getShaderGLSL(filename), Laya.Loader.TEXT);
        return code.replace(/\r/g, "");
    }
    
    // 加载Shader
    static async loadShaderVSAsync(filename: string): Promise<string>
    {
        let code = await this.loadAsync(this.getShaderVS(filename), Laya.Loader.TEXT);
        return code.replace(/\r/g, "");
    }

    // 加载Shader
    static async loadShaderPSAsync(filename: string): Promise<string>
    {
        let code =  await this.loadAsync(this.getShaderPS(filename), Laya.Loader.TEXT);
        return code.replace(/\r/g, "");
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

    /** Rim颜色（受击） */
    static DOTRIMCOLOR: number = Shader3D.propertyNameToID("u_DotRimColor");
    
    static GPUSKINING_MATRIX_TEXTURE: number = Shader3D.propertyNameToID("u_GPUSkinning_TextureMatrix");
    
	static SHADERDEFINE_GPUSKINING_MATRIX_TEXTURE: ShaderDefine;
    static SHADERDEFINE_IS_SPEARATION: ShaderDefine;
    static SHADERDEFINE_IS_SUPERARMOR: ShaderDefine;
    static SHADERDEFINE_IS_INVINCIBLE: ShaderDefine;
    

    static __initDefine__(): void {
		this.SHADERDEFINE_GPUSKINING_MATRIX_TEXTURE = Shader3D.getDefineByName("GPUSKINING_MATRIX_TEXTURE");
		this.SHADERDEFINE_IS_SPEARATION = Shader3D.getDefineByName("IS_SPEARATION");
		this.SHADERDEFINE_IS_SUPERARMOR = Shader3D.getDefineByName("IS_SUPERARMOR");
		this.SHADERDEFINE_IS_INVINCIBLE = Shader3D.getDefineByName("IS_INVINCIBLE");
	}
    
	/**
	 * 骨骼动画贴图。
	 */
    get GPUSkinning_TextureMatrix(): BaseTexture 
    {
		return this._shaderValues.getTexture(GPUSkinningBaseMaterial.GPUSKINING_MATRIX_TEXTURE);
	}

    set GPUSkinning_TextureMatrix(value: BaseTexture) 
    {
		if (value)
			this._shaderValues.addDefine(GPUSkinningBaseMaterial.SHADERDEFINE_GPUSKINING_MATRIX_TEXTURE);
		else
			this._shaderValues.removeDefine(GPUSkinningBaseMaterial.SHADERDEFINE_GPUSKINING_MATRIX_TEXTURE);
		this._shaderValues.setTexture(GPUSkinningBaseMaterial.GPUSKINING_MATRIX_TEXTURE, value);
    }

	private _IsSeparation: boolean = false;
    /**
     * 是否是分身
     */
    get IsSeparation()
    {
        return this._IsSeparation;
    }

    /**
     * 是否是分身
     */
    set IsSeparation(value: boolean)
    {
        this._IsSeparation = value;
        
		if (value)
            this._shaderValues.addDefine(GPUSkinningBaseMaterial.SHADERDEFINE_IS_SPEARATION);
        else
            this._shaderValues.removeDefine(GPUSkinningBaseMaterial.SHADERDEFINE_IS_SPEARATION);
    }

    private _IsInvincible: boolean = false;
    /**
     * 是否是无敌
     */
    
    get IsInvincible()
    {
        return this._IsInvincible;
    }

    set IsInvincible(value: boolean)
    {
        this._IsInvincible = value;
        
		if (value)
            this._shaderValues.addDefine(GPUSkinningBaseMaterial.SHADERDEFINE_IS_INVINCIBLE);
        else
            this._shaderValues.removeDefine(GPUSkinningBaseMaterial.SHADERDEFINE_IS_INVINCIBLE);
    }



	private _IsSuperarmor: boolean = false;
    /**
     * 是否是霸体
     */
    
    get IsSuperarmor()
    {
        return this._IsSuperarmor;
    }

    set IsSuperarmor(value: boolean)
    {
        this._IsSuperarmor = value;
        
		if (value)
            this._shaderValues.addDefine(GPUSkinningBaseMaterial.SHADERDEFINE_IS_SUPERARMOR);
        else
            this._shaderValues.removeDefine(GPUSkinningBaseMaterial.SHADERDEFINE_IS_SUPERARMOR);
    }

    /** DotRim颜色强度 */
    protected _DotRimIntensity = 0.0;
	/**
	 * @internal
	 */
	get DotRimIntensity(): number {
		return this._DotRimIntensity;
	}

	set DotRimIntensity(value: number) {
		if (this._DotRimIntensity !== value) {
			// var color: Vector4 = (<Vector4>this._shaderValues.getVector(GPUSkinningBaseMaterial.DOTRIMCOLOR));
			// Vector4.scale(this._DotRimColor, value, color);
            this._DotRimIntensity = value;
            this._DotRimColor.w = value;
            this._shaderValues.setVector(GPUSkinningBaseMaterial.DOTRIMCOLOR, this._DotRimColor);
		}
    }
    
    protected _DotRimColor = new Vector4(1.0, 0.0, 0.0, 0.0);
    
	/**
	 * DotRim颜色
	 */
	get DotRimColor(): Vector4 {
		return this._DotRimColor;
	}

	set DotRimColor(value: Vector4) {
		// var color: Vector4 = (<Vector4>this._shaderValues.getVector(GPUSkinningBaseMaterial.DOTRIMCOLOR));
		// Vector4.scale(value, this._DotRimIntensity, color);
		this._DotRimColor = value;
		this._shaderValues.setVector(GPUSkinningBaseMaterial.DOTRIMCOLOR, this._DotRimColor);
    }
    
    private _HitTime = 0;
    private _HitTimeMax = 0.1;
    OnHit(t: number = 0.1)
    {
        var preT = this._HitTime;
        this._HitTime = t;
        this._HitTimeMax = Math.max(t, 0.01);
        this.DotRimIntensity = Math.max(0, Math.min(this._HitTime / this._HitTimeMax, 1));
        if(preT <= 0 && t > 0)
        {
            Laya.timer.frameLoop(1, this, this.__OnFrameHit);
        }
    }

    private __OnFrameHit()
    {
        this._HitTime -= Laya.timer.delta;
        this.DotRimIntensity = Math.max(0, Math.min(this._HitTime / this._HitTimeMax, 1));
        if(this._HitTime <= 0)
        {
            this._HitTime = 0;
            Laya.timer.clear(this, this.__OnFrameHit);
        }
    }
    
    __mname:string;


}