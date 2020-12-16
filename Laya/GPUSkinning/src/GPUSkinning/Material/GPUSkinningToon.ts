
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



export class GPUSkinningToonMaterial extends GPUSkinningBaseMaterial
{
    
    /** Shader名称 */
    public static shaderName = "GPUSkinningToon";
    public static outlinePass = "GPUSkinningToonOutline";

	private static _isInstalled: boolean = false;
    public static async install()
    {
		if(this._isInstalled)
		{
			return;
		}
		this._isInstalled = true;
        GPUSkinningToonMaterial.__initDefine__();
        await GPUSkinningToonMaterial.initShader();

        GPUSkinningToonMaterial.defaultMaterial = new GPUSkinningToonMaterial();
        GPUSkinningToonMaterial.defaultMaterial.lock = true;
    }

    private static async initShader()
    {
		
        var outlineVS: string = await this.loadShaderVSAsync(GPUSkinningToonMaterial.outlinePass);
		var outlinePS: string = await this.loadShaderPSAsync(GPUSkinningToonMaterial.outlinePass);
		
        var vs: string = await GPUSkinningToonMaterial.loadShaderVSAsync(GPUSkinningToonMaterial.shaderName);
        var ps: string = await GPUSkinningToonMaterial.loadShaderPSAsync(GPUSkinningToonMaterial.shaderName);
        
        
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

			
            // 卡通材质 -- 阴影颜色
			'u_CartoonShadowColor': Shader3D.PERIOD_MATERIAL,
            // 卡通材质 -- 颜色范围
            'u_CartoonColorRange': Shader3D.PERIOD_MATERIAL,
            // 卡通材质 -- 颜色强度
            'u_CartoonColorDeep': Shader3D.PERIOD_MATERIAL,
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

        
        shader = Shader3D.add(GPUSkinningToonMaterial.shaderName, null, null, true);
        subShader =  new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		
		
        var outlinePass = subShader.addShaderPass(outlineVS, outlinePS);
		outlinePass.renderState.cull = Laya.RenderState.CULL_FRONT;
		// outlinePass.renderState.depthWrite = false;

        

        var mainPass =  subShader.addShaderPass(vs, ps, stateMap);
        // mainPass.renderState.cull = Laya.RenderState.CULL_BACK;
        
        
    }
	

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

	
    // 卡通材质 -- 阴影颜色
    static CARTOON_SHADOWCOLOR: number = Shader3D.propertyNameToID("u_CartoonShadowColor");
    // 卡通材质 -- 颜色范围
    static CARTOON_CORLORRANGE: number = Shader3D.propertyNameToID("u_CartoonColorRange");
    // 卡通材质 -- 颜色强度
    static CARTOON_CORLORDEEP: number = Shader3D.propertyNameToID("u_CartoonColorDeep");
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
	static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");

	/** 默认材质，禁止修改*/
	static defaultMaterial: GPUSkinningToonMaterial;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		GPUSkinningToonMaterial.SHADERDEFINE_ALBEDOTEXTURE = Shader3D.getDefineByName("ALBEDOTEXTURE");
		GPUSkinningToonMaterial.SHADERDEFINE_SHADOWTEXTURE = Shader3D.getDefineByName("SHADOWTEXTURE");
		GPUSkinningToonMaterial.SHADERDEFINE_SHADOWCOLORTEXTURE = Shader3D.getDefineByName("SHADOWCOLORTEXTURE");
		GPUSkinningToonMaterial.SHADERDEFINE_HEIGHTRIMLIGHTTEXTURE = Shader3D.getDefineByName("HEIGHTRIMLIGHTTEXTURE");
		GPUSkinningToonMaterial.SHADERDEFINE_SCENELIGHTINGTEXTURE = Shader3D.getDefineByName("SCENELIGHTING");
		GPUSkinningToonMaterial.SHADERDEFINE_TILINGOFFSET = Shader3D.getDefineByName("TILINGOFFSET");
		GPUSkinningToonMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D.getDefineByName("ENABLEVERTEXCOLOR");
	}

	private _albedoColor: Vector4 = new Vector4(1.0, 1.0, 1.0, 1.0);
	private _albedoIntensity: number = 1.0;
	private _enableVertexColor: boolean = false;

	/**
	 * @internal
	 */
	get _ColorR(): number {
		return this._albedoColor.x;
	}

	set _ColorR(value: number) {
		this._albedoColor.x = value;
		this.albedoColor = this._albedoColor;
	}

	/**
	 * @internal
	 */
	get _ColorG(): number {
		return this._albedoColor.y;
	}

	set _ColorG(value: number) {
		this._albedoColor.y = value;
		this.albedoColor = this._albedoColor;
	}

	/**
	 * @internal
	 */
	get _ColorB(): number {
		return this._albedoColor.z;
	}

	set _ColorB(value: number) {
		this._albedoColor.z = value;
		this.albedoColor = this._albedoColor;
	}

	/**
	 * @internal 
	 */
	get _ColorA(): number {
		return this._albedoColor.w;
	}

	set _ColorA(value: number) {
		this._albedoColor.w = value;
		this.albedoColor = this._albedoColor;
	}

	/**
	 * @internal
	 */
	get _AlbedoIntensity(): number {
		return this._albedoIntensity;
	}

	set _AlbedoIntensity(value: number) {
		if (this._albedoIntensity !== value) {
			var finalAlbedo: Vector4 = (<Vector4>this._shaderValues.getVector(GPUSkinningToonMaterial.ALBEDOCOLOR));
			Vector4.scale(this._albedoColor, value, finalAlbedo);
			this._albedoIntensity = value;
			this._shaderValues.setVector(GPUSkinningToonMaterial.ALBEDOCOLOR, finalAlbedo);
		}
	}

	/**
	 * @internal
	 */
	get _MainTex_STX(): number {
		return this._shaderValues.getVector(GPUSkinningToonMaterial.TILINGOFFSET).x;
	}

	set _MainTex_STX(x: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(GPUSkinningToonMaterial.TILINGOFFSET));
		tilOff.x = x;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STY(): number {
		return this._shaderValues.getVector(GPUSkinningToonMaterial.TILINGOFFSET).y;
	}

	set _MainTex_STY(y: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(GPUSkinningToonMaterial.TILINGOFFSET));
		tilOff.y = y;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STZ(): number {
		return this._shaderValues.getVector(GPUSkinningToonMaterial.TILINGOFFSET).z;
	}

	set _MainTex_STZ(z: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(GPUSkinningToonMaterial.TILINGOFFSET));
		tilOff.z = z;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STW(): number {
		return this._shaderValues.getVector(GPUSkinningToonMaterial.TILINGOFFSET).w;
	}

	set _MainTex_STW(w: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(GPUSkinningToonMaterial.TILINGOFFSET));
		tilOff.w = w;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _Cutoff(): number {
		return this.alphaTestValue;
	}

	set _Cutoff(value: number) {
		this.alphaTestValue = value;
	}

	/**
	 * 反照率颜色R分量。
	 */
	get albedoColorR(): number {
		return this._ColorR;
	}

	set albedoColorR(value: number) {
		this._ColorR = value;
	}

	/**
	 * 反照率颜色G分量。
	 */
	get albedoColorG(): number {
		return this._ColorG;
	}

	set albedoColorG(value: number) {
		this._ColorG = value;
	}

	/**
	 * 反照率颜色B分量。
	 */
	get albedoColorB(): number {
		return this._ColorB;
	}

	set albedoColorB(value: number) {
		this._ColorB = value;
	}

	/**
	 * 反照率颜色Z分量。
	 */
	get albedoColorA(): number {
		return this._ColorA;
	}

	set albedoColorA(value: number) {
		this._ColorA = value;
	}

	/**
	 * 反照率颜色。
	 */
	get albedoColor(): Vector4 {
		return this._albedoColor;
	}

	set albedoColor(value: Vector4) {
		var finalAlbedo: Vector4 = (<Vector4>this._shaderValues.getVector(GPUSkinningToonMaterial.ALBEDOCOLOR));
		Vector4.scale(value, this._albedoIntensity, finalAlbedo);
		this._albedoColor = value;
		this._shaderValues.setVector(GPUSkinningToonMaterial.ALBEDOCOLOR, finalAlbedo);
	}

	/**
	 * 反照率强度。
	 */
	get albedoIntensity(): number {
		return this._albedoIntensity;
	}

	set albedoIntensity(value: number) {
		this._AlbedoIntensity = value;
	}

	/**
	 * 反照率贴图。
	 */
	get albedoTexture(): BaseTexture {
		return this._shaderValues.getTexture(GPUSkinningToonMaterial.ALBEDOTEXTURE);
	}

	set albedoTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(GPUSkinningToonMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		else
			this._shaderValues.removeDefine(GPUSkinningToonMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		this._shaderValues.setTexture(GPUSkinningToonMaterial.ALBEDOTEXTURE, value);
	}

	
	/**
	 * 阴影贴图
	 */
	get shadowTexture(): BaseTexture {
		return this._shaderValues.getTexture(GPUSkinningToonMaterial.SHADOWTEXTURE);
	}

	set shadowTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(GPUSkinningToonMaterial.SHADERDEFINE_SHADOWTEXTURE);
		else
			this._shaderValues.removeDefine(GPUSkinningToonMaterial.SHADERDEFINE_SHADOWTEXTURE);
		this._shaderValues.setTexture(GPUSkinningToonMaterial.SHADOWTEXTURE, value);
	}

	/**
	 * 阴影颜色贴图
	 */
	get shadowColorTexture(): BaseTexture {
		return this._shaderValues.getTexture(GPUSkinningToonMaterial.SHADOWCOLORTEXTURE);
	}

	set shadowColorTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(GPUSkinningToonMaterial.SHADERDEFINE_SHADOWCOLORTEXTURE);
		else
			this._shaderValues.removeDefine(GPUSkinningToonMaterial.SHADERDEFINE_SHADOWCOLORTEXTURE);
		this._shaderValues.setTexture(GPUSkinningToonMaterial.SHADOWCOLORTEXTURE, value);
	}

	
	
	/**
	 * 高光和边缘光贴图
	 */
	get heightRimLightTexture(): BaseTexture {
		return this._shaderValues.getTexture(GPUSkinningToonMaterial.HEIGHTRIMLIGHTTEXTURE);
	}

	set heightRimLightTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(GPUSkinningToonMaterial.SHADERDEFINE_HEIGHTRIMLIGHTTEXTURE);
		else
			this._shaderValues.removeDefine(GPUSkinningToonMaterial.SHADERDEFINE_HEIGHTRIMLIGHTTEXTURE);
		this._shaderValues.setTexture(GPUSkinningToonMaterial.HEIGHTRIMLIGHTTEXTURE, value);
	}

	
	/**
	 * 场景光照
	 */
	get sceneLightingTexture(): BaseTexture {
		return this._shaderValues.getTexture(GPUSkinningToonMaterial.SCENELIGHTINGTEXTURE);
	}

	set sceneLightingTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(GPUSkinningToonMaterial.SHADERDEFINE_SCENELIGHTINGTEXTURE);
		else
			this._shaderValues.removeDefine(GPUSkinningToonMaterial.SHADERDEFINE_SCENELIGHTINGTEXTURE);
		this._shaderValues.setTexture(GPUSkinningToonMaterial.SCENELIGHTINGTEXTURE, value);
	}

	/**
	 * 纹理平铺和偏移X分量。
	 */
	get tilingOffsetX(): number {
		return this._MainTex_STX;
	}

	set tilingOffsetX(x: number) {
		this._MainTex_STX = x;
	}

	/**
	 * 纹理平铺和偏移Y分量。
	 */
	get tilingOffsetY(): number {
		return this._MainTex_STY;
	}

	set tilingOffsetY(y: number) {
		this._MainTex_STY = y;
	}

	/**
	 * 纹理平铺和偏移Z分量。
	 */
	get tilingOffsetZ(): number {
		return this._MainTex_STZ;
	}

	set tilingOffsetZ(z: number) {
		this._MainTex_STZ = z;
	}

	/**
	 * 纹理平铺和偏移W分量。
	 */
	get tilingOffsetW(): number {
		return this._MainTex_STW;
	}

	set tilingOffsetW(w: number) {
		this._MainTex_STW = w;
	}

	/**
	 * 纹理平铺和偏移。
	 */
	get tilingOffset(): Vector4 {
		return (<Vector4>this._shaderValues.getVector(GPUSkinningToonMaterial.TILINGOFFSET));
	}

	set tilingOffset(value: Vector4) {
		if (value) {
			if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
				this._shaderValues.addDefine(GPUSkinningToonMaterial.SHADERDEFINE_TILINGOFFSET);
			else
				this._shaderValues.removeDefine(GPUSkinningToonMaterial.SHADERDEFINE_TILINGOFFSET);
		} else {
			this._shaderValues.removeDefine(GPUSkinningToonMaterial.SHADERDEFINE_TILINGOFFSET);
		}
		this._shaderValues.setVector(GPUSkinningToonMaterial.TILINGOFFSET, value);
	}

	/**
	 * 是否支持顶点色。
	 */
	get enableVertexColor(): boolean {
		return this._enableVertexColor;
	}

	set enableVertexColor(value: boolean) {
		this._enableVertexColor = value;
		if (value)
			this._shaderValues.addDefine(GPUSkinningToonMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
		else
			this._shaderValues.removeDefine(GPUSkinningToonMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	}

	
	private _enableLighting: boolean;
	/**
	 * 是否启用光照。
	 */
	get enableLighting(): boolean {
		return this._enableLighting;
	}

	set enableLighting(value: boolean) {
		if (this._enableLighting !== value) {
			if (value) 
			{
				this._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
			}
			else 
			{
				this._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
			}
			this._enableLighting = value;
		}
	}

    // 卡通材质 -- 阴影颜色
	private _cartoonShadowColor: Vector4;
	
    // 卡通材质 -- 阴影颜色
    get CartoonShadowColor() {
        return this._cartoonShadowColor;
    }
    set CartoonShadowColor(value:Vector4) {
        this._cartoonShadowColor = value;
        this._shaderValues.setVector(GPUSkinningToonMaterial.CARTOON_SHADOWCOLOR, value);
	}
	
	
    /** 卡通材质 -- 颜色范围 */
    get CartoonColorRange() {
        return this._shaderValues.getNumber(GPUSkinningToonMaterial.CARTOON_CORLORRANGE);
    }
    set CartoonColorRange(value) {
        value = Math.max(0.0, Math.min(2, value));
        this._shaderValues.setNumber(GPUSkinningToonMaterial.CARTOON_CORLORRANGE, value);
	}
	
	
    /** 卡通材质 -- 颜色强度 */
	get CartoonColorDeep() 
	{
        return this._shaderValues.getNumber(GPUSkinningToonMaterial.CARTOON_CORLORDEEP);
	}
	
	set CartoonColorDeep(value) 
	{
        value = Math.max(-1.0, Math.min(100.0, value));
        this._shaderValues.setNumber(GPUSkinningToonMaterial.CARTOON_CORLORDEEP, value);
	}
	
	
    /** 卡通材质 -- 描边粗细 */
    get CartoonOutlineWidth() {
        return this._shaderValues.getNumber(GPUSkinningToonMaterial.CARTOON_OUTLINEWIDTH);
    }
    set CartoonOutlineWidth(value) {
        this._shaderValues.setNumber(GPUSkinningToonMaterial.CARTOON_OUTLINEWIDTH, value);
    }


	constructor() {
		super();
		this.setShaderName(GPUSkinningToonMaterial.shaderName);
		this._albedoIntensity = 1.0;
		this._shaderValues.setVector(GPUSkinningToonMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
		this._shaderValues.setVector(GPUSkinningToonMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
		// 卡通材质 -- 阴影颜色
		this.CartoonShadowColor = new Vector4(0.1764706, 0.1764706, 0.1764706, 1.0);
		// 卡通材质 -- 颜色范围
		this.CartoonColorRange = 0.08;
		// 卡通材质 -- 颜色强度
		this.CartoonColorDeep = 88.4;
		// 卡通材质 -- 描边粗细
		this.CartoonOutlineWidth = 0.004;


        this._shaderValues.setNumber(Material.ALPHATESTVALUE, 0.5);

		this._enableLighting = true;
		this.renderMode = GPUSkinningBaseMaterial.RENDERMODE_OPAQUE;

		// this._shaderValues.addDefine(Shader3D.getDefineByName("SKIN_4"));
		
	}
	

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
	clone(): any {
		var dest: GPUSkinningToonMaterial = new GPUSkinningToonMaterial();
		this.cloneTo(dest);
        this._albedoColor.cloneTo(dest._albedoColor);
		return dest;
	}

	
	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		var destMaterial: GPUSkinningToonMaterial = (<GPUSkinningToonMaterial>destObject);
		destMaterial._enableLighting = this._enableLighting;
		destMaterial._albedoIntensity = this._albedoIntensity;
		destMaterial._enableVertexColor = this._enableVertexColor;
		this._albedoColor.cloneTo(destMaterial._albedoColor);
		this._cartoonShadowColor.cloneTo(destMaterial._cartoonShadowColor);
		
	}

}