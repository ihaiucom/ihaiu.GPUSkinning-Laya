
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



export class GPUSkinningCartoonMaterial extends GPUSkinningBaseMaterial
{
    
    /** Shader名称 */
    public static shaderName = "GPUSkinningCartoon";
    public static outlinePass = "GPUSkinningCartoonOutline";

	private static _isInstalled: boolean = false;
    public static async install()
    {
		if(this._isInstalled)
		{
			return;
		}
		this._isInstalled = true;
        GPUSkinningCartoonMaterial.__initDefine__();
        await GPUSkinningCartoonMaterial.initShader();

        GPUSkinningCartoonMaterial.defaultMaterial = new GPUSkinningCartoonMaterial();
        GPUSkinningCartoonMaterial.defaultMaterial.lock = true;
    }

    private static async initShader()
    {
		
        var outlineVS: string = await this.loadShaderVSAsync(GPUSkinningCartoonMaterial.outlinePass);
		var outlinePS: string = await this.loadShaderPSAsync(GPUSkinningCartoonMaterial.outlinePass);
		
        var vs: string = await GPUSkinningCartoonMaterial.loadShaderVSAsync(GPUSkinningCartoonMaterial.shaderName);
        var ps: string = await GPUSkinningCartoonMaterial.loadShaderPSAsync(GPUSkinningCartoonMaterial.shaderName);
        
        
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

			
			'u_AlbedoTexture': Shader3D.PERIOD_MATERIAL,
			'u_AlbedoColor': Shader3D.PERIOD_MATERIAL,
			'u_TilingOffset': Shader3D.PERIOD_MATERIAL,
			'u_AlphaTestValue': Shader3D.PERIOD_MATERIAL,
			
            
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

        
        shader = Shader3D.add(GPUSkinningCartoonMaterial.shaderName, null, null, true);
        subShader =  new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		
		
        var outlinePass = subShader.addShaderPass(outlineVS, outlinePS);
		outlinePass.renderState.cull = Laya.RenderState.CULL_FRONT;
		// outlinePass.renderState.depthWrite = false;

        

        var mainPass =  subShader.addShaderPass(vs, ps, stateMap);
        // mainPass.renderState.cull = Laya.RenderState.CULL_BACK;
        
        
    }

	
	/**渲染状态_不透明。*/
	static RENDERMODE_OPAQUE: number = 0;
	/**渲染状态_阿尔法测试。*/
	static RENDERMODE_CUTOUT: number = 1;
	/**渲染状态__透明混合。*/
	static RENDERMODE_TRANSPARENT: number = 2;
	/**渲染状态__加色法混合。*/
	static RENDERMODE_ADDTIVE: number = 3;

	static SHADERDEFINE_ALBEDOTEXTURE: ShaderDefine;
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

	static ALBEDOTEXTURE: number = Shader3D.propertyNameToID("u_AlbedoTexture");
	static ALBEDOCOLOR: number = Shader3D.propertyNameToID("u_AlbedoColor");
	static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");
	static CULL: number = Shader3D.propertyNameToID("s_Cull");
	static BLEND: number = Shader3D.propertyNameToID("s_Blend");
	static BLEND_SRC: number = Shader3D.propertyNameToID("s_BlendSrc");
	static BLEND_DST: number = Shader3D.propertyNameToID("s_BlendDst");
	static DEPTH_TEST: number = Shader3D.propertyNameToID("s_DepthTest");
	static DEPTH_WRITE: number = Shader3D.propertyNameToID("s_DepthWrite");

	/** 默认材质，禁止修改*/
	static defaultMaterial: GPUSkinningCartoonMaterial;

	/**
	 * @internal
	 */
	static __initDefine__(): void {
		GPUSkinningCartoonMaterial.SHADERDEFINE_ALBEDOTEXTURE = Shader3D.getDefineByName("ALBEDOTEXTURE");
		GPUSkinningCartoonMaterial.SHADERDEFINE_TILINGOFFSET = Shader3D.getDefineByName("TILINGOFFSET");
		GPUSkinningCartoonMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D.getDefineByName("ENABLEVERTEXCOLOR");
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
			var finalAlbedo: Vector4 = (<Vector4>this._shaderValues.getVector(GPUSkinningCartoonMaterial.ALBEDOCOLOR));
			Vector4.scale(this._albedoColor, value, finalAlbedo);
			this._albedoIntensity = value;
			this._shaderValues.setVector(GPUSkinningCartoonMaterial.ALBEDOCOLOR, finalAlbedo);
		}
	}

	/**
	 * @internal
	 */
	get _MainTex_STX(): number {
		return this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET).x;
	}

	set _MainTex_STX(x: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET));
		tilOff.x = x;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STY(): number {
		return this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET).y;
	}

	set _MainTex_STY(y: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET));
		tilOff.y = y;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STZ(): number {
		return this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET).z;
	}

	set _MainTex_STZ(z: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET));
		tilOff.z = z;
		this.tilingOffset = tilOff;
	}

	/**
	 * @internal
	 */
	get _MainTex_STW(): number {
		return this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET).w;
	}

	set _MainTex_STW(w: number) {
		var tilOff: Vector4 = (<Vector4>this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET));
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
		var finalAlbedo: Vector4 = (<Vector4>this._shaderValues.getVector(GPUSkinningCartoonMaterial.ALBEDOCOLOR));
		Vector4.scale(value, this._albedoIntensity, finalAlbedo);
		this._albedoColor = value;
		this._shaderValues.setVector(GPUSkinningCartoonMaterial.ALBEDOCOLOR, finalAlbedo);
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
		return this._shaderValues.getTexture(GPUSkinningCartoonMaterial.ALBEDOTEXTURE);
	}

	set albedoTexture(value: BaseTexture) {
		if (value)
			this._shaderValues.addDefine(GPUSkinningCartoonMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		else
			this._shaderValues.removeDefine(GPUSkinningCartoonMaterial.SHADERDEFINE_ALBEDOTEXTURE);
		this._shaderValues.setTexture(GPUSkinningCartoonMaterial.ALBEDOTEXTURE, value);
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
		return (<Vector4>this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET));
	}

	set tilingOffset(value: Vector4) {
		if (value) {
			if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
				this._shaderValues.addDefine(GPUSkinningCartoonMaterial.SHADERDEFINE_TILINGOFFSET);
			else
				this._shaderValues.removeDefine(GPUSkinningCartoonMaterial.SHADERDEFINE_TILINGOFFSET);
		} else {
			this._shaderValues.removeDefine(GPUSkinningCartoonMaterial.SHADERDEFINE_TILINGOFFSET);
		}
		this._shaderValues.setVector(GPUSkinningCartoonMaterial.TILINGOFFSET, value);
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
			this._shaderValues.addDefine(GPUSkinningCartoonMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
		else
			this._shaderValues.removeDefine(GPUSkinningCartoonMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	}

	/**
	 * 渲染模式。
	 */
	set renderMode(value: number) {
		switch (value) {
			case GPUSkinningCartoonMaterial.RENDERMODE_OPAQUE:
				this.alphaTest = false;
				this.renderQueue = Material.RENDERQUEUE_OPAQUE;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case GPUSkinningCartoonMaterial.RENDERMODE_CUTOUT:
				this.renderQueue = Material.RENDERQUEUE_ALPHATEST;
				this.alphaTest = true;
				this.depthWrite = true;
				this.cull = RenderState.CULL_BACK;
				this.blend = RenderState.BLEND_DISABLE;
				this.depthTest = RenderState.DEPTHTEST_LESS;
				break;
			case GPUSkinningCartoonMaterial.RENDERMODE_TRANSPARENT:
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
				throw new Error("GPUSkinningCartoonMaterial : renderMode value error.");
		}
	}



	/**
	 * 是否写入深度。
	 */
	get depthWrite(): boolean {
		return this._shaderValues.getBool(GPUSkinningCartoonMaterial.DEPTH_WRITE);
	}

	set depthWrite(value: boolean) {
		this._shaderValues.setBool(GPUSkinningCartoonMaterial.DEPTH_WRITE, value);
	}



	/**
	 * 剔除方式。
	 */
	get cull(): number {
		return this._shaderValues.getInt(GPUSkinningCartoonMaterial.CULL);
	}

	set cull(value: number) {
		this._shaderValues.setInt(GPUSkinningCartoonMaterial.CULL, value);
	}


	/**
	 * 混合方式。
	 */
	get blend(): number {
		return this._shaderValues.getInt(GPUSkinningCartoonMaterial.BLEND);
	}

	set blend(value: number) {
		this._shaderValues.setInt(GPUSkinningCartoonMaterial.BLEND, value);
	}


	/**
	 * 混合源。
	 */
	get blendSrc(): number {
		return this._shaderValues.getInt(GPUSkinningCartoonMaterial.BLEND_SRC);
	}

	set blendSrc(value: number) {
		this._shaderValues.setInt(GPUSkinningCartoonMaterial.BLEND_SRC, value);
	}



	/**
	 * 混合目标。
	 */
	get blendDst(): number {
		return this._shaderValues.getInt(GPUSkinningCartoonMaterial.BLEND_DST);
	}

	set blendDst(value: number) {
		this._shaderValues.setInt(GPUSkinningCartoonMaterial.BLEND_DST, value);
	}


	/**
	 * 深度测试方式。
	 */
	get depthTest(): number {
		return this._shaderValues.getInt(GPUSkinningCartoonMaterial.DEPTH_TEST);
	}

	set depthTest(value: number) {
		this._shaderValues.setInt(GPUSkinningCartoonMaterial.DEPTH_TEST, value);
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
        this._shaderValues.setVector(GPUSkinningCartoonMaterial.CARTOON_SHADOWCOLOR, value);
	}
	
	
    /** 卡通材质 -- 颜色范围 */
    get CartoonColorRange() {
        return this._shaderValues.getNumber(GPUSkinningCartoonMaterial.CARTOON_CORLORRANGE);
    }
    set CartoonColorRange(value) {
        value = Math.max(0.0, Math.min(2, value));
        this._shaderValues.setNumber(GPUSkinningCartoonMaterial.CARTOON_CORLORRANGE, value);
	}
	
	
    /** 卡通材质 -- 颜色强度 */
	get CartoonColorDeep() 
	{
        return this._shaderValues.getNumber(GPUSkinningCartoonMaterial.CARTOON_CORLORDEEP);
	}
	
	set CartoonColorDeep(value) 
	{
        value = Math.max(-1.0, Math.min(100.0, value));
        this._shaderValues.setNumber(GPUSkinningCartoonMaterial.CARTOON_CORLORDEEP, value);
	}
	
	
    /** 卡通材质 -- 描边粗细 */
    get CartoonOutlineWidth() {
        return this._shaderValues.getNumber(GPUSkinningCartoonMaterial.CARTOON_OUTLINEWIDTH);
    }
    set CartoonOutlineWidth(value) {
        this._shaderValues.setNumber(GPUSkinningCartoonMaterial.CARTOON_OUTLINEWIDTH, value);
    }


	constructor() {
		super();
		this.setShaderName(GPUSkinningCartoonMaterial.shaderName);
		this._albedoIntensity = 1.0;
		this._shaderValues.setVector(GPUSkinningCartoonMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
		this._shaderValues.setVector(GPUSkinningCartoonMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
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
		this.renderMode = GPUSkinningCartoonMaterial.RENDERMODE_OPAQUE;

		// this._shaderValues.addDefine(Shader3D.getDefineByName("SKIN_4"));
		
	}
	

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
	clone(): any {
		var dest: GPUSkinningCartoonMaterial = new GPUSkinningCartoonMaterial();
		this.cloneTo(dest);
        this._albedoColor.cloneTo(dest._albedoColor);
		return dest;
	}

	
	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		var destMaterial: GPUSkinningCartoonMaterial = (<GPUSkinningCartoonMaterial>destObject);
		destMaterial._enableLighting = this._enableLighting;
		destMaterial._albedoIntensity = this._albedoIntensity;
		destMaterial._enableVertexColor = this._enableVertexColor;
		this._albedoColor.cloneTo(destMaterial._albedoColor);
		this._cartoonShadowColor.cloneTo(destMaterial._cartoonShadowColor);
		
	}

}