
import Shader3D = Laya.Shader3D;
import SubShader = Laya.SubShader;
import SkinnedMeshSprite3D = Laya.SkinnedMeshSprite3D;
import VertexMesh = Laya.VertexMesh;
import ShaderDefine = Laya.ShaderDefine;
import Vector4 = Laya.Vector4;
import RenderState = Laya.RenderState;
import Scene3DShaderDeclaration = Laya.Scene3DShaderDeclaration;
import BaseTexture = Laya.BaseTexture;
import Material = Laya.Material;
import { GPUSkinningBaseMaterial } from "./GPUSkinningBaseMaterial";
import GPUSkiningVertexMesh from "../Mesh/GPUSkiningVertexMesh";



export class GPUSkinningToonV3Material extends GPUSkinningBaseMaterial
{
    
    /** Shader名称 */
    public static shaderName = "GPUSkinningToonV3";
    public static outlinePass = "GPUSkinningToonV2Outline";

	protected static _isInstalled: boolean = false;
    public static async install()
    {
		if(this._isInstalled)
		{
			return;
		}
		this._isInstalled = true;
        GPUSkinningToonV3Material.__initDefine__();
        await GPUSkinningToonV3Material.initShader();

        GPUSkinningToonV3Material.defaultMaterial = new GPUSkinningToonV3Material();
        GPUSkinningToonV3Material.defaultMaterial.lock = true;
    }

    protected static async initShader()
    {
		
        var outlineVS: string = await this.loadShaderVSAsync(GPUSkinningToonV3Material.outlinePass);
		var outlinePS: string = await this.loadShaderPSAsync(GPUSkinningToonV3Material.outlinePass);
		
        var vs: string = await GPUSkinningToonV3Material.loadShaderVSAsync(GPUSkinningToonV3Material.shaderName);
        var ps: string = await GPUSkinningToonV3Material.loadShaderPSAsync(GPUSkinningToonV3Material.shaderName);
        
        
        var attributeMap: object;
        var uniformMap: object;
        var stateMap: object;
        var shader:Shader3D;
        var subShader:SubShader;

        attributeMap = 
        {
			'a_Position': VertexMesh.MESH_POSITION0,
			'a_Color': VertexMesh.MESH_COLOR0,
			'a_Normal': VertexMesh.MESH_NORMAL0,
			'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0,
			'a_Texcoord1': VertexMesh.MESH_TEXTURECOORDINATE1,
			'a_Texcoord2': GPUSkiningVertexMesh.MESH_TEXTURECOORDINATE2,
			'a_MvpMatrix': VertexMesh.MESH_MVPMATRIX_ROW0,
			'a_WorldMat': VertexMesh.MESH_WORLDMATRIX_ROW0
		};

        uniformMap = 
        {
			'u_GPUSkinning_TextureMatrix': Shader3D.PERIOD_MATERIAL,
			'u_GPUSkinning_TextureSize_NumPixelsPerFrame': Shader3D.PERIOD_MATERIAL,

			'u_GPUSkinning_RootMotion': Shader3D.PERIOD_MATERIAL,
			'u_GPUSkinning_RootMotion_CrossFade': Shader3D.PERIOD_MATERIAL,
			'u_GPUSkinning_FrameIndex_PixelSegmentation': Shader3D.PERIOD_SPRITE,
			'u_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade': Shader3D.PERIOD_SPRITE,

			// 受击
			'u_DotRimColor': Shader3D.PERIOD_MATERIAL,

            // 卡通材质 -- 描边粗细
            'u_CartoonOutlineWidth': Shader3D.PERIOD_MATERIAL,
			// 描边颜色
			'u_outlineColor': Shader3D.PERIOD_MATERIAL,

			// 场景 -- 光照贴图
			'u_SceneLightingTexture': Shader3D.PERIOD_SCENE,
			// 场景 -- 光照贴图映射世界坐标大小
			'u_SceneLightingSize': Shader3D.PERIOD_SCENE,
			// 场景 -- 色彩平衡
			'u_SceneColorBalance': Shader3D.PERIOD_SCENE,
			
			// 主贴图
			'u_AlbedoTexture': Shader3D.PERIOD_MATERIAL,
			'u_AlbedoColor': Shader3D.PERIOD_MATERIAL,
			'u_TilingOffset': Shader3D.PERIOD_MATERIAL,
			'u_AlphaTestValue': Shader3D.PERIOD_MATERIAL,

			// 高光 - 强度
			'u_Specular': Shader3D.PERIOD_MATERIAL,
			// 高光 - 高斯
			'u_SpecGloss': Shader3D.PERIOD_MATERIAL,
			// 高光 - 颜色
			'u_SpecColor': Shader3D.PERIOD_MATERIAL,
			// 高光 - 方向
			'u_SpecularSpaceLightDir': Shader3D.PERIOD_MATERIAL,
			
			
            
			'u_WorldMat': Shader3D.PERIOD_SPRITE,
            'u_MvpMatrix': Shader3D.PERIOD_SPRITE,
            
			'u_FogStart': Shader3D.PERIOD_SCENE,
			'u_FogRange': Shader3D.PERIOD_SCENE,
			'u_FogColor': Shader3D.PERIOD_SCENE,

			
			'u_DirationLightCount': Shader3D.PERIOD_SCENE,
			'u_LightBuffer': Shader3D.PERIOD_SCENE,
			'u_LightClusterBuffer': Shader3D.PERIOD_SCENE,
			'u_AmbientColor': Shader3D.PERIOD_SCENE,
			
			//legacy lighting
			'u_DirectionLight.color': Shader3D.PERIOD_SCENE,
			'u_DirectionLight.direction': Shader3D.PERIOD_SCENE,
			'u_PointLight.position': Shader3D.PERIOD_SCENE,
			'u_PointLight.range': Shader3D.PERIOD_SCENE,
			'u_PointLight.color': Shader3D.PERIOD_SCENE,
			'u_SpotLight.position': Shader3D.PERIOD_SCENE,
			'u_SpotLight.direction': Shader3D.PERIOD_SCENE,
			'u_SpotLight.range': Shader3D.PERIOD_SCENE,
			'u_SpotLight.spot': Shader3D.PERIOD_SCENE,
			'u_SpotLight.color': Shader3D.PERIOD_SCENE,

			'u_CameraPos': Shader3D.PERIOD_CAMERA
		};

        stateMap = 
        {
			's_Cull': Shader3D.RENDER_STATE_CULL,
			's_Blend': Shader3D.RENDER_STATE_BLEND,
			's_BlendSrc': Shader3D.RENDER_STATE_BLEND_SRC,
			's_BlendDst': Shader3D.RENDER_STATE_BLEND_DST,
			's_DepthTest': Shader3D.RENDER_STATE_DEPTH_TEST,
			's_DepthWrite': Shader3D.RENDER_STATE_DEPTH_WRITE
		};

        
        shader = Shader3D.add(GPUSkinningToonV3Material.shaderName, null, null, true);
        subShader =  new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		
		
        var outlinePass = subShader.addShaderPass(outlineVS, outlinePS);
		outlinePass.renderState.cull = Laya.RenderState.CULL_FRONT;
		// outlinePass.renderState.blend = RenderState.BLEND_ENABLE_ALL;
		// outlinePass.renderState.srcBlend = RenderState.BLENDPARAM_SRC_ALPHA;
		// outlinePass.renderState.dstBlend = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
		// outlinePass.renderState.depthWrite = false;

        

        var mainPass =  subShader.addShaderPass(vs, ps, stateMap);
        mainPass.renderState.cull = Laya.RenderState.CULL_BACK;
        
        
    }

	

	/** 宏定义--主贴图 */
	static SHADERDEFINE_ALBEDOTEXTURE: ShaderDefine;
	
	/** 宏定义--场景光照贴图 */
	static SHADERDEFINE_SCENELIGHTINGTEXTURE: ShaderDefine;
	static SHADERDEFINE_TILINGOFFSET: ShaderDefine;
	static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;

	
	// 卡通材质 -- 描边粗细
    static CARTOON_OUTLINEWIDTH: number = Shader3D.propertyNameToID("u_CartoonOutlineWidth");

	// 场景 -- 灯光贴图
	static SCENELIGHTINGTEXTURE: number = Shader3D.propertyNameToID("u_SceneLightingTexture");
	// 场景 -- 色彩平衡
	static SCENECOLORBALANCE: number = Shader3D.propertyNameToID("u_SceneColorBalance");
	// 主贴图
	static ALBEDOTEXTURE: number = Shader3D.propertyNameToID("u_AlbedoTexture");
	static ALBEDOCOLOR: number = Shader3D.propertyNameToID("u_AlbedoColor");
	static OUTLINECOLOR: number = Shader3D.propertyNameToID("u_outlineColor");
	static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");

	
	// 高光 - 强度
	static U_Specular: number = Shader3D.propertyNameToID("u_Specular");
	// 高光 - 高斯
	static U_SpecGloss: number = Shader3D.propertyNameToID("u_SpecGloss");
	// 高光 - 颜色
    static U_SpecColor: number = Shader3D.propertyNameToID("u_SpecColor");
	// 高光 - 方向
    static U_SpecularSpaceLightDir: number = Shader3D.propertyNameToID("u_SpecularSpaceLightDir");

	/** 默认材质，禁止修改*/
	static defaultMaterial: GPUSkinningToonV3Material;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		GPUSkinningToonV3Material.SHADERDEFINE_ALBEDOTEXTURE = Shader3D.getDefineByName("ALBEDOTEXTURE");
		GPUSkinningToonV3Material.SHADERDEFINE_SCENELIGHTINGTEXTURE = Shader3D.getDefineByName("SCENELIGHTING");
		GPUSkinningToonV3Material.SHADERDEFINE_TILINGOFFSET = Shader3D.getDefineByName("TILINGOFFSET");
		GPUSkinningToonV3Material.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D.getDefineByName("ENABLEVERTEXCOLOR");
	}

	


	
	protected __outlineColor: Vector4 = new Vector4(0.0, 0, 0.0);
	get outlineColor(): Vector4 {
		return this.__outlineColor;
	}
	set outlineColor(value: Vector4) {
		this.__outlineColor = value;
		this._shaderValues.setVector(GPUSkinningToonV3Material.OUTLINECOLOR, value);
	}

	
	set _OutlineColor(value: Vector4) {
		this.outlineColor = value;
	}

	


	protected _albedoColor: Vector4 = new Vector4(1.0, 1.0, 1.0, 1.0);
	


	/**
	 * 反照率颜色。
	 */
	get albedoColor(): Vector4 {
		return this._albedoColor;
	}

	set albedoColor(value: Vector4) {
		var finalAlbedo: Vector4 = (<Vector4>this._shaderValues.getVector(GPUSkinningToonV3Material.ALBEDOCOLOR));
		Vector4.scale(value, 1, finalAlbedo);
		this._albedoColor = value;
		this._shaderValues.setVector(GPUSkinningToonV3Material.ALBEDOCOLOR, finalAlbedo);
	}


	/**
	 * 反照率贴图。
	 */
	get albedoTexture(): BaseTexture {
		return this._shaderValues.getTexture(GPUSkinningToonV3Material.ALBEDOTEXTURE);
	}

	set albedoTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(GPUSkinningToonV3Material.SHADERDEFINE_ALBEDOTEXTURE);
		else
			this._shaderValues.removeDefine(GPUSkinningToonV3Material.SHADERDEFINE_ALBEDOTEXTURE);
		this._shaderValues.setTexture(GPUSkinningToonV3Material.ALBEDOTEXTURE, value);
	}

	
	set _MainTex(value: BaseTexture) {
		this.albedoTexture = value;
	}

	



	
	/**
	 * 场景光照
	 */
	get sceneLightingTexture(): BaseTexture {
		return this._shaderValues.getTexture(GPUSkinningToonV3Material.SCENELIGHTINGTEXTURE);
	}

	set sceneLightingTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(GPUSkinningToonV3Material.SHADERDEFINE_SCENELIGHTINGTEXTURE);
		else
			this._shaderValues.removeDefine(GPUSkinningToonV3Material.SHADERDEFINE_SCENELIGHTINGTEXTURE);
		this._shaderValues.setTexture(GPUSkinningToonV3Material.SCENELIGHTINGTEXTURE, value);
	}





	

	
    /** 卡通材质 -- 描边粗细 */
    get CartoonOutlineWidth() {
        return this._shaderValues.getNumber(GPUSkinningToonV3Material.CARTOON_OUTLINEWIDTH);
    }
    set CartoonOutlineWidth(value) {
        this._shaderValues.setNumber(GPUSkinningToonV3Material.CARTOON_OUTLINEWIDTH, value);
	}
	
	
    set _OutlineWidth(value) {
		this.CartoonOutlineWidth = value;
	}

	/** 高光 - 强度 */
	set _Specular(value: number)
	{
        this._shaderValues.setNumber(GPUSkinningToonV3Material.U_Specular, value);
	}

	/** 高光 - 高斯 */
	set _SpecGloss(value: number)
	{
        this._shaderValues.setNumber(GPUSkinningToonV3Material.U_SpecGloss, value);
	}

	/** 高光 - 颜色 */
	set _SpecColor(value : Vector4)
	{
        this._shaderValues.setVector(GPUSkinningToonV3Material.U_SpecColor, value);
	}

	/** 高光 - 方向 */
	set _SpecularSpaceLightDir(value: Vector4)
	{
        this._shaderValues.setVector(GPUSkinningToonV3Material.U_SpecularSpaceLightDir, value);
	}


	constructor(shaderName?:string) {
		super();
		if(!shaderName) shaderName = GPUSkinningToonV3Material.shaderName;

		this.setShaderName(shaderName);
		this._shaderValues.setVector(GPUSkinningToonV3Material.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
		this._shaderValues.setVector(GPUSkinningToonV3Material.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
		
		// this._shaderValues.setVector(GPUSkinningToonV3Material.DOTRIMCOLOR, new Vector4(1.0, 0.0, 0.0, 1.0));
		// 卡通材质 -- 描边粗细
		this.CartoonOutlineWidth = 0.004;


        this._shaderValues.setNumber(Material.ALPHATESTVALUE, 0.5);

		this.renderMode = GPUSkinningBaseMaterial.RENDERMODE_OPAQUE;
		
	}
	

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
	clone(): any {
		var dest: GPUSkinningToonV3Material = new GPUSkinningToonV3Material();
		this.cloneTo(dest);
		this._albedoColor.cloneTo(dest._albedoColor);
		return dest;
	}

	
	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		var destMaterial: GPUSkinningToonV3Material = (<GPUSkinningToonV3Material>destObject);
		this._albedoColor.cloneTo(destMaterial._albedoColor);
		
	}

}