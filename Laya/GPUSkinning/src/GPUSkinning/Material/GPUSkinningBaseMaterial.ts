import Shader3D = Laya.Shader3D;
import BaseTexture = Laya.BaseTexture;
import ShaderDefine = Laya.ShaderDefine;
import Vector4 = Laya.Vector4;
import Material = Laya.Material;
import RenderState = Laya.RenderState;
import GPUSkinningPlayer from "../GPUSkinningPlayer";


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
    static SHADERDEFINE_IS_DIE: ShaderDefine;
    

    static __initDefine__(): void {
		this.SHADERDEFINE_GPUSKINING_MATRIX_TEXTURE = Shader3D.getDefineByName("GPUSKINING_MATRIX_TEXTURE");
		this.SHADERDEFINE_IS_SPEARATION = Shader3D.getDefineByName("IS_SPEARATION");
		this.SHADERDEFINE_IS_SUPERARMOR = Shader3D.getDefineByName("IS_SUPERARMOR");
		this.SHADERDEFINE_IS_INVINCIBLE = Shader3D.getDefineByName("IS_INVINCIBLE");
		this.SHADERDEFINE_IS_DIE = Shader3D.getDefineByName("IS_DIE");
    }

    
	/**渲染状态_不透明。*/
	static RENDERMODE_OPAQUE: number = 0;
	/**渲染状态_阿尔法测试。*/
	static RENDERMODE_CUTOUT: number = 1;
	/**渲染状态__透明混合。*/
	static RENDERMODE_TRANSPARENT: number = 2;
	/**渲染状态__加色法混合。*/
    static RENDERMODE_ADDTIVE: number = 3;
    
    
	static CULL: number = Shader3D.propertyNameToID("s_Cull");
	static BLEND: number = Shader3D.propertyNameToID("s_Blend");
	static BLEND_SRC: number = Shader3D.propertyNameToID("s_BlendSrc");
	static BLEND_DST: number = Shader3D.propertyNameToID("s_BlendDst");
	static DEPTH_TEST: number = Shader3D.propertyNameToID("s_DepthTest");
	static DEPTH_WRITE: number = Shader3D.propertyNameToID("s_DepthWrite");
    
	/**
	 * 渲染模式。
	 */
	set renderMode(value: number) {
		switch (value) {
			case GPUSkinningBaseMaterial.RENDERMODE_OPAQUE:
				this.alphaTest = false;
				this.renderQueue = Material.RENDERQUEUE_OPAQUE;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case GPUSkinningBaseMaterial.RENDERMODE_CUTOUT:
				this.renderQueue = Material.RENDERQUEUE_ALPHATEST;
				this.alphaTest = true;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case GPUSkinningBaseMaterial.RENDERMODE_TRANSPARENT:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
				this.alphaTest = false;
				this.depthWrite = false;
				// this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			default:
				throw new Error("GPUSkinningBaseMaterial : renderMode value error.");
		}
    }
    
	/**
	 * 是否写入深度。
	 */
	get depthWrite(): boolean {
		return this._shaderValues.getBool(GPUSkinningBaseMaterial.DEPTH_WRITE);
	}

	set depthWrite(value: boolean) {
		this._shaderValues.setBool(GPUSkinningBaseMaterial.DEPTH_WRITE, value);
	}



	/**
	 * 剔除方式。
	 */
	get cull(): number {
		return this._shaderValues.getInt(GPUSkinningBaseMaterial.CULL);
	}

	set cull(value: number) {
		this._shaderValues.setInt(GPUSkinningBaseMaterial.CULL, value);
	}


	/**
	 * 混合方式。
	 */
	get blend(): number {
		return this._shaderValues.getInt(GPUSkinningBaseMaterial.BLEND);
	}

	set blend(value: number) {
		this._shaderValues.setInt(GPUSkinningBaseMaterial.BLEND, value);
	}


	/**
	 * 混合源。
	 */
	get blendSrc(): number {
		return this._shaderValues.getInt(GPUSkinningBaseMaterial.BLEND_SRC);
	}

	set blendSrc(value: number) {
		this._shaderValues.setInt(GPUSkinningBaseMaterial.BLEND_SRC, value);
	}



	/**
	 * 混合目标。
	 */
	get blendDst(): number {
		return this._shaderValues.getInt(GPUSkinningBaseMaterial.BLEND_DST);
	}

	set blendDst(value: number) {
		this._shaderValues.setInt(GPUSkinningBaseMaterial.BLEND_DST, value);
	}


	/**
	 * 深度测试方式。
	 */
	get depthTest(): number {
		return this._shaderValues.getInt(GPUSkinningBaseMaterial.DEPTH_TEST);
	}

	set depthTest(value: number) {
		this._shaderValues.setInt(GPUSkinningBaseMaterial.DEPTH_TEST, value);
	}

    
    player: GPUSkinningPlayer;

    
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
        {
            this._shaderValues.addDefine(GPUSkinningBaseMaterial.SHADERDEFINE_IS_SPEARATION);
            // this.renderMode = GPUSkinningBaseMaterial.RENDERMODE_TRANSPARENT;
        }
        else
        {
            this._shaderValues.removeDefine(GPUSkinningBaseMaterial.SHADERDEFINE_IS_SPEARATION);
            // this.renderMode = GPUSkinningBaseMaterial.RENDERMODE_OPAQUE;
        }
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

    
	private _IsDie: boolean = false;
    /**
     * 是否是尸体
     */
    
    get IsDie()
    {
        return this._IsDie;
    }

    set IsDie(value: boolean)
    {
        this._IsDie = value;
        
		if (value)
            this._shaderValues.addDefine(GPUSkinningBaseMaterial.SHADERDEFINE_IS_DIE);
        else
            this._shaderValues.removeDefine(GPUSkinningBaseMaterial.SHADERDEFINE_IS_DIE);
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