
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



export class GPUSkinningToonWeaponV2Material extends GPUSkinningBaseMaterial
{
    
    /** Shader名称 */
    public static shaderName = "GPUSkinningToonWeaponV2";
    public static outlinePass = "GPUSkinningToonV2Outline";

	private static _isInstalled: boolean = false;
    public static async install()
    {
		if(this._isInstalled)
		{
			return;
		}
		this._isInstalled = true;
        GPUSkinningToonWeaponV2Material.__initDefine__();
        await GPUSkinningToonWeaponV2Material.initShader();

        GPUSkinningToonWeaponV2Material.defaultMaterial = new GPUSkinningToonWeaponV2Material();
        GPUSkinningToonWeaponV2Material.defaultMaterial.lock = true;
    }

    private static async initShader()
    {
		
        // var outlineVS: string = await this.loadShaderVSAsync(GPUSkinningToonWeaponV2Material.outlinePass);
		// var outlinePS: string = await this.loadShaderPSAsync(GPUSkinningToonWeaponV2Material.outlinePass);
		
        var vs: string = await GPUSkinningToonWeaponV2Material.loadShaderVSAsync("GPUSkinningToonV2");
        var ps: string = await GPUSkinningToonWeaponV2Material.loadShaderPSAsync("GPUSkinningToonV2");
        
        
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

			'u_DotRimColor': Shader3D.PERIOD_MATERIAL,
			
            // 卡通材质 -- 描边粗细
            'u_CartoonOutlineWidth': Shader3D.PERIOD_MATERIAL,

			// 卡通材质 -- 场景光照贴图
			'u_SceneLightingTexture': Shader3D.PERIOD_SCENE,
			// 卡通材质 -- 场景光照贴图映射世界坐标大小
			'u_SceneLightingSize': Shader3D.PERIOD_SCENE,
			
			// 主贴图
			'u_AlbedoTexture': Shader3D.PERIOD_MATERIAL,
			'u_AlbedoColor': Shader3D.PERIOD_MATERIAL,
			'u_TilingOffset': Shader3D.PERIOD_MATERIAL,
			'u_AlphaTestValue': Shader3D.PERIOD_MATERIAL,

			
			// 卡通材质 -- 阴影贴图
			'u_ShadowTexture': Shader3D.PERIOD_MATERIAL,
			
			// 卡通材质 -- 阴影颜色贴图
			'u_ShadowColorTexture': Shader3D.PERIOD_MATERIAL,
			
			// 卡通材质 -- 高光和边缘光贴图
			'u_HeightRimLightTexture': Shader3D.PERIOD_MATERIAL,

			'u_rimColorA0': Shader3D.PERIOD_MATERIAL,
			'u_rimColorA1': Shader3D.PERIOD_MATERIAL,
			'u_rimColorB': Shader3D.PERIOD_MATERIAL,
			'u_rimViewDirA0': Shader3D.PERIOD_MATERIAL,
			'u_rimViewDirB': Shader3D.PERIOD_MATERIAL,
			'u_outlineColor': Shader3D.PERIOD_MATERIAL,
			
            
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

        
        shader = Shader3D.add(GPUSkinningToonWeaponV2Material.shaderName, null, null, true);
        subShader =  new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		
		
        // var outlinePass = subShader.addShaderPass(outlineVS, outlinePS);
		// outlinePass.renderState.cull = Laya.RenderState.CULL_FRONT;
		// // outlinePass.renderState.depthWrite = false;

        

        var mainPass =  subShader.addShaderPass(vs, ps, stateMap);
        mainPass.renderState.cull = Laya.RenderState.CULL_BACK;
        
        
    }

	
	/**渲染状态_不透明。*/
	static RENDERMODE_OPAQUE: number = 0;
	/**渲染状态_阿尔法测试。*/
	static RENDERMODE_CUTOUT: number = 1;
	/**渲染状态__透明混合。*/
	static RENDERMODE_TRANSPARENT: number = 2;
	/**渲染状态__加色法混合。*/
	static RENDERMODE_ADDTIVE: number = 3;

	/** 宏定义--主贴图 */
	static SHADERDEFINE_ALBEDOTEXTURE: ShaderDefine;
	/** 宏定义--阴影贴图 */
	static SHADERDEFINE_SHADOWTEXTURE: ShaderDefine;
	/** 宏定义--阴影颜色贴图 */
	static SHADERDEFINE_SHADOWCOLORTEXTURE: ShaderDefine;
	/** 宏定义--高光和边缘光贴图 */
	static SHADERDEFINE_HEIGHTRIMLIGHTTEXTURE: ShaderDefine;
	
	/** 宏定义--场景光照贴图 */
	static SHADERDEFINE_SCENELIGHTINGTEXTURE: ShaderDefine;
	static SHADERDEFINE_TILINGOFFSET: ShaderDefine;
	static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;

	
	// 卡通材质 -- 描边粗细
    static CARTOON_OUTLINEWIDTH: number = Shader3D.propertyNameToID("u_CartoonOutlineWidth");

	static SCENELIGHTINGTEXTURE: number = Shader3D.propertyNameToID("u_SceneLightingTexture");

	// 高光和边缘光贴图
	static HEIGHTRIMLIGHTTEXTURE: number = Shader3D.propertyNameToID("u_HeightRimLightTexture");
	// 阴影颜色贴图
	static SHADOWCOLORTEXTURE: number = Shader3D.propertyNameToID("u_ShadowColorTexture");
	// 阴影贴图
	static SHADOWTEXTURE: number = Shader3D.propertyNameToID("u_ShadowTexture");
	// 主贴图
	static ALBEDOTEXTURE: number = Shader3D.propertyNameToID("u_AlbedoTexture");
	static ALBEDOCOLOR: number = Shader3D.propertyNameToID("u_AlbedoColor");
	static RIMCOLORA0: number = Shader3D.propertyNameToID("u_rimColorA0");
	static RIMCOLORA1: number = Shader3D.propertyNameToID("u_rimColorA1");
	static RIMCOLORB: number = Shader3D.propertyNameToID("u_rimColorB");
	static RIMVIEWDIRA0: number = Shader3D.propertyNameToID("u_rimViewDirA0");
	static RIMVIEWDIRB: number = Shader3D.propertyNameToID("u_rimViewDirB");
	static OUTLINECOLOR: number = Shader3D.propertyNameToID("u_outlineColor");
	static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");
	static CULL: number = Shader3D.propertyNameToID("s_Cull");
	static BLEND: number = Shader3D.propertyNameToID("s_Blend");
	static BLEND_SRC: number = Shader3D.propertyNameToID("s_BlendSrc");
	static BLEND_DST: number = Shader3D.propertyNameToID("s_BlendDst");
	static DEPTH_TEST: number = Shader3D.propertyNameToID("s_DepthTest");
	static DEPTH_WRITE: number = Shader3D.propertyNameToID("s_DepthWrite");

	/** 默认材质，禁止修改*/
	static defaultMaterial: GPUSkinningToonWeaponV2Material;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		GPUSkinningToonWeaponV2Material.SHADERDEFINE_ALBEDOTEXTURE = Shader3D.getDefineByName("ALBEDOTEXTURE");
		GPUSkinningToonWeaponV2Material.SHADERDEFINE_SHADOWTEXTURE = Shader3D.getDefineByName("SHADOWTEXTURE");
		GPUSkinningToonWeaponV2Material.SHADERDEFINE_SHADOWCOLORTEXTURE = Shader3D.getDefineByName("SHADOWCOLORTEXTURE");
		GPUSkinningToonWeaponV2Material.SHADERDEFINE_HEIGHTRIMLIGHTTEXTURE = Shader3D.getDefineByName("HEIGHTRIMLIGHTTEXTURE");
		GPUSkinningToonWeaponV2Material.SHADERDEFINE_SCENELIGHTINGTEXTURE = Shader3D.getDefineByName("SCENELIGHTING");
		GPUSkinningToonWeaponV2Material.SHADERDEFINE_TILINGOFFSET = Shader3D.getDefineByName("TILINGOFFSET");
		GPUSkinningToonWeaponV2Material.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D.getDefineByName("ENABLEVERTEXCOLOR");
	}

	
	private _rimColorA0: Vector4 = new Vector4(1.0, 0.02116402, 0.0);
	get rimColorA0(): Vector4 {
		return this._rimColorA0;
	}
	set rimColorA0(value: Vector4) {
		
		var finalAlbedo: Vector4 = (<Vector4>this._shaderValues.getVector(GPUSkinningToonWeaponV2Material.RIMCOLORA0));
		Vector4.scale(value, 1, finalAlbedo);

		this._rimColorA0 = value;
		this._shaderValues.setVector(GPUSkinningToonWeaponV2Material.RIMCOLORA0, finalAlbedo);
	}
	
	set _RimA_Color(value: Vector4) {
		this.rimColorA0 = value;
	}

	
	private _rimColorA1: Vector4 = new Vector4(1.0, 0.9290133, 0.759434);
	get rimColorA1(): Vector4 {
		return this._rimColorA1;
	}
	set rimColorA1(value: Vector4) {
		this._rimColorA1 = value;
		this._shaderValues.setVector(GPUSkinningToonWeaponV2Material.RIMCOLORA1, value);
	}

	set _RimB_Color(value: Vector4) {
		this.rimColorA1 = value;
	}

	
	private _rimColorB: Vector4 = new Vector4(1.0, 0.501811, 0.0);
	get rimColorB(): Vector4 {
		return this._rimColorB;
	}
	set rimColorB(value: Vector4) {
		this._rimColorB = value;
		this._shaderValues.setVector(GPUSkinningToonWeaponV2Material.RIMCOLORB, value);
	}

	
	set _RimC_Color(value: Vector4) {
		this.rimColorB = value;
	}

	
	set _RimC_Range(value: number) {
		this._rimColorB.w = value;
		this.rimColorB = this._rimColorB;
	}

	
	private __outlineColor: Vector4 = new Vector4(0.0, 0, 0.0);
	get outlineColor(): Vector4 {
		return this.__outlineColor;
	}
	set outlineColor(value: Vector4) {
		this.__outlineColor = value;
		this._shaderValues.setVector(GPUSkinningToonWeaponV2Material.OUTLINECOLOR, value);
	}

	
	set _OutlineColor(value: Vector4) {
		this.outlineColor = value;
	}

	
	private _rimViewDirA0: Vector4 = new Vector4(25, -5, 10, 0.55);
	get rimViewDirA0(): Vector4 {
		return this._rimViewDirA0;
	}
	set rimViewDirA0(value: Vector4) {
		this._rimViewDirA0 = value;
		this._shaderValues.setVector(GPUSkinningToonWeaponV2Material.RIMVIEWDIRA0, value);
	}

	
	set _RimAB_Direction(value: Vector4) {
		this.rimViewDirA0 = value;
	}

	set _RimA_Rate(value: number)
	{
		this._rimViewDirA0.w = value;
		this.rimViewDirA0 = this._rimViewDirA0;
	}

	
	
	
	private _rimViewDirB: Vector4 = new Vector4(-30, -5, 20, 0.6);
	get rimViewDirB(): Vector4 {
		return this._rimViewDirB;
	}
	set rimViewDirB(value: Vector4) {
		this._rimViewDirB = value;
		this._shaderValues.setVector(GPUSkinningToonWeaponV2Material.RIMVIEWDIRB, value);
	}

	
	set _RimC_Direction(value: Vector4) {
		this.rimViewDirB = value;
	}
	
	
	set _RimB_Rate(value: number)
	{
		this._rimViewDirB.w = value;
		this.rimViewDirB = this._rimViewDirB;
	}



	private _albedoColor: Vector4 = new Vector4(1.0, 1.0, 1.0, 1.0);
	


	/**
	 * 反照率颜色。
	 */
	get albedoColor(): Vector4 {
		return this._albedoColor;
	}

	set albedoColor(value: Vector4) {
		var finalAlbedo: Vector4 = (<Vector4>this._shaderValues.getVector(GPUSkinningToonWeaponV2Material.ALBEDOCOLOR));
		Vector4.scale(value, 1, finalAlbedo);
		this._albedoColor = value;
		this._shaderValues.setVector(GPUSkinningToonWeaponV2Material.ALBEDOCOLOR, finalAlbedo);
	}


	/**
	 * 反照率贴图。
	 */
	get albedoTexture(): BaseTexture {
		return this._shaderValues.getTexture(GPUSkinningToonWeaponV2Material.ALBEDOTEXTURE);
	}

	set albedoTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(GPUSkinningToonWeaponV2Material.SHADERDEFINE_ALBEDOTEXTURE);
		else
			this._shaderValues.removeDefine(GPUSkinningToonWeaponV2Material.SHADERDEFINE_ALBEDOTEXTURE);
		this._shaderValues.setTexture(GPUSkinningToonWeaponV2Material.ALBEDOTEXTURE, value);
	}

	
	set _MainTex(value: BaseTexture) {
		this.albedoTexture = value;
	}

	
	/**
	 * 阴影贴图
	 */
	get shadowTexture(): BaseTexture {
		return this._shaderValues.getTexture(GPUSkinningToonWeaponV2Material.SHADOWTEXTURE);
	}

	set shadowTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(GPUSkinningToonWeaponV2Material.SHADERDEFINE_SHADOWTEXTURE);
		else
			this._shaderValues.removeDefine(GPUSkinningToonWeaponV2Material.SHADERDEFINE_SHADOWTEXTURE);
		this._shaderValues.setTexture(GPUSkinningToonWeaponV2Material.SHADOWTEXTURE, value);
	}

	/**
	 * 阴影颜色贴图
	 */
	get shadowColorTexture(): BaseTexture {
		return this._shaderValues.getTexture(GPUSkinningToonWeaponV2Material.SHADOWCOLORTEXTURE);
	}

	set shadowColorTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(GPUSkinningToonWeaponV2Material.SHADERDEFINE_SHADOWCOLORTEXTURE);
		else
			this._shaderValues.removeDefine(GPUSkinningToonWeaponV2Material.SHADERDEFINE_SHADOWCOLORTEXTURE);
		this._shaderValues.setTexture(GPUSkinningToonWeaponV2Material.SHADOWCOLORTEXTURE, value);
	}

	
	
	/**
	 * 高光和边缘光贴图
	 */
	get heightRimLightTexture(): BaseTexture {
		return this._shaderValues.getTexture(GPUSkinningToonWeaponV2Material.HEIGHTRIMLIGHTTEXTURE);
	}

	set heightRimLightTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(GPUSkinningToonWeaponV2Material.SHADERDEFINE_HEIGHTRIMLIGHTTEXTURE);
		else
			this._shaderValues.removeDefine(GPUSkinningToonWeaponV2Material.SHADERDEFINE_HEIGHTRIMLIGHTTEXTURE);
		this._shaderValues.setTexture(GPUSkinningToonWeaponV2Material.HEIGHTRIMLIGHTTEXTURE, value);
	}

	
	set _MaskTex(value: BaseTexture) {
		this.heightRimLightTexture = value;
	}
	



	
	/**
	 * 场景光照
	 */
	get sceneLightingTexture(): BaseTexture {
		return this._shaderValues.getTexture(GPUSkinningToonWeaponV2Material.SCENELIGHTINGTEXTURE);
	}

	set sceneLightingTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(GPUSkinningToonWeaponV2Material.SHADERDEFINE_SCENELIGHTINGTEXTURE);
		else
			this._shaderValues.removeDefine(GPUSkinningToonWeaponV2Material.SHADERDEFINE_SCENELIGHTINGTEXTURE);
		this._shaderValues.setTexture(GPUSkinningToonWeaponV2Material.SCENELIGHTINGTEXTURE, value);
	}


	/**
	 * 渲染模式。
	 */
	set renderMode(value: number) {
		switch (value) {
			case GPUSkinningToonWeaponV2Material.RENDERMODE_OPAQUE:
				this.alphaTest = false;
				this.renderQueue = Material.RENDERQUEUE_OPAQUE;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case GPUSkinningToonWeaponV2Material.RENDERMODE_CUTOUT:
				this.renderQueue = Material.RENDERQUEUE_ALPHATEST;
				this.alphaTest = true;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case GPUSkinningToonWeaponV2Material.RENDERMODE_TRANSPARENT:
				this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
				this.alphaTest = false;
				this.depthWrite = false;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_ENABLE_ALL;
				this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
				this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			default:
				throw new Error("GPUSkinningToonWeaponV2Material : renderMode value error.");
		}
	}



	/**
	 * 是否写入深度。
	 */
	get depthWrite(): boolean {
		return this._shaderValues.getBool(GPUSkinningToonWeaponV2Material.DEPTH_WRITE);
	}

	set depthWrite(value: boolean) {
		this._shaderValues.setBool(GPUSkinningToonWeaponV2Material.DEPTH_WRITE, value);
	}



	/**
	 * 剔除方式。
	 */
	get cull(): number {
		return this._shaderValues.getInt(GPUSkinningToonWeaponV2Material.CULL);
	}

	set cull(value: number) {
		this._shaderValues.setInt(GPUSkinningToonWeaponV2Material.CULL, value);
	}


	/**
	 * 混合方式。
	 */
	get blend(): number {
		return this._shaderValues.getInt(GPUSkinningToonWeaponV2Material.BLEND);
	}

	set blend(value: number) {
		this._shaderValues.setInt(GPUSkinningToonWeaponV2Material.BLEND, value);
	}


	/**
	 * 混合源。
	 */
	get blendSrc(): number {
		return this._shaderValues.getInt(GPUSkinningToonWeaponV2Material.BLEND_SRC);
	}

	set blendSrc(value: number) {
		this._shaderValues.setInt(GPUSkinningToonWeaponV2Material.BLEND_SRC, value);
	}



	/**
	 * 混合目标。
	 */
	get blendDst(): number {
		return this._shaderValues.getInt(GPUSkinningToonWeaponV2Material.BLEND_DST);
	}

	set blendDst(value: number) {
		this._shaderValues.setInt(GPUSkinningToonWeaponV2Material.BLEND_DST, value);
	}


	/**
	 * 深度测试方式。
	 */
	get depthTest(): number {
		return this._shaderValues.getInt(GPUSkinningToonWeaponV2Material.DEPTH_TEST);
	}

	set depthTest(value: number) {
		this._shaderValues.setInt(GPUSkinningToonWeaponV2Material.DEPTH_TEST, value);
	}

	

	
    /** 卡通材质 -- 描边粗细 */
    get CartoonOutlineWidth() {
        return this._shaderValues.getNumber(GPUSkinningToonWeaponV2Material.CARTOON_OUTLINEWIDTH);
    }
    set CartoonOutlineWidth(value) {
        this._shaderValues.setNumber(GPUSkinningToonWeaponV2Material.CARTOON_OUTLINEWIDTH, value);
	}
	
	
    set _OutlineWidth(value) {
		this.CartoonOutlineWidth = value;
	}


	constructor() {
		super();
		this.setShaderName(GPUSkinningToonWeaponV2Material.shaderName);
		this._shaderValues.setVector(GPUSkinningToonWeaponV2Material.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
		this._shaderValues.setVector(GPUSkinningToonWeaponV2Material.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
		this._shaderValues.setVector(GPUSkinningToonWeaponV2Material.RIMCOLORA0, this._rimColorA0);
		this._shaderValues.setVector(GPUSkinningToonWeaponV2Material.RIMCOLORA1, this._rimColorA1);
		this._shaderValues.setVector(GPUSkinningToonWeaponV2Material.RIMCOLORB, this._rimColorB);
		
		// this._shaderValues.setVector(GPUSkinningToonWeaponV2Material.DOTRIMCOLOR, new Vector4(1.0, 0.0, 0.0, 1.0));
		// 卡通材质 -- 描边粗细
		this.CartoonOutlineWidth = 0.004;


        this._shaderValues.setNumber(Material.ALPHATESTVALUE, 0.5);

		this.renderMode = GPUSkinningToonWeaponV2Material.RENDERMODE_OPAQUE;

		// this._shaderValues.addDefine(Shader3D.getDefineByName("SKIN_4"));
		
	}
	

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
	clone(): any {
		var dest: GPUSkinningToonWeaponV2Material = new GPUSkinningToonWeaponV2Material();
		this.cloneTo(dest);
		this._albedoColor.cloneTo(dest._albedoColor);
		return dest;
	}

	
	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		var destMaterial: GPUSkinningToonWeaponV2Material = (<GPUSkinningToonWeaponV2Material>destObject);
		this._albedoColor.cloneTo(destMaterial._albedoColor);
		
		// this._rimColorA0.cloneTo(destMaterial._rimColorA0);
		// this._rimColorA1.cloneTo(destMaterial._rimColorA1);
		// this._rimColorB.cloneTo(destMaterial._rimColorB);

		// destMaterial.rimColorA0 = destMaterial._rimColorA0;
		// destMaterial.rimColorA1 = destMaterial._rimColorA1;
		// destMaterial.rimColorB = destMaterial._rimColorB;
		
	}

}