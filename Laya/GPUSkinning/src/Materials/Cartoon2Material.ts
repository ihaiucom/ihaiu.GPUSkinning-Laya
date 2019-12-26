import { MBaseMaterial } from "./MBaseMaterial";

import Shader3D = Laya.Shader3D;
import SubShader = Laya.SubShader;
import SkinnedMeshSprite3D = Laya.SkinnedMeshSprite3D;
import VertexMesh = Laya.VertexMesh;
import ShaderDefine = Laya.ShaderDefine;
import BaseMaterial = Laya.BaseMaterial;
import Vector4 = Laya.Vector4;
import RenderState = Laya.RenderState;
import Scene3DShaderDeclaration = Laya.Scene3DShaderDeclaration;



export class Cartoon2Material extends MBaseMaterial
{
    
    /** Shader名称 */
    public static shaderName = "Cartoon2Shader";

    public static defaultMaterial:Cartoon2Material;

    public static async install()
    {
        this.__initDefine__();
        await this.initShader();

        this.defaultMaterial = new Cartoon2Material();
        this.defaultMaterial.enableLighting = true;
        this.defaultMaterial.lock = true;
    }

    private static async initShader()
    {
        
        var outlineVS: string = await this.loadShaderVSAsync("Cartoon2OutlineShader");
        var outlinePS: string = await this.loadShaderPSAsync("Cartoon2OutlineShader");

        var vs: string = await this.loadShaderVSAsync(this.shaderName);
        var ps: string = await this.loadShaderPSAsync(this.shaderName);
        

        
        
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
			'a_BoneWeights': VertexMesh.MESH_BLENDWEIGHT0,
			'a_BoneIndices': VertexMesh.MESH_BLENDINDICES0,
			'a_Tangent0': VertexMesh.MESH_TANGENT0,
			'a_MvpMatrix': VertexMesh.MESH_MVPMATRIX_ROW0,
			'a_WorldMat': VertexMesh.MESH_WORLDMATRIX_ROW0
		};

        uniformMap = 
        {
			'u_Bones': Shader3D.PERIOD_CUSTOM,
			'u_DiffuseTexture': Shader3D.PERIOD_MATERIAL,
			'u_SpecularTexture': Shader3D.PERIOD_MATERIAL,
			'u_NormalTexture': Shader3D.PERIOD_MATERIAL,
			'u_AlphaTestValue': Shader3D.PERIOD_MATERIAL,
            'u_DiffuseColor': Shader3D.PERIOD_MATERIAL,
            // 卡通材质 -- 颜色强调
			'u_ShadowColor': Shader3D.PERIOD_MATERIAL,
			'u_MaterialSpecular': Shader3D.PERIOD_MATERIAL,
            'u_Shininess': Shader3D.PERIOD_MATERIAL,
            // 卡通材质 -- 颜色强调
            'u_ColorRange': Shader3D.PERIOD_MATERIAL,
            // 卡通材质 -- 颜色范围
            'u_ColorDeep': Shader3D.PERIOD_MATERIAL,
            // 卡通材质 -- 描边粗细
            'u_OutlineWidth': Shader3D.PERIOD_MATERIAL,
            
            
			'u_TilingOffset': Shader3D.PERIOD_MATERIAL,

			'u_WorldMat': Shader3D.PERIOD_SPRITE,
			'u_MvpMatrix': Shader3D.PERIOD_SPRITE,
			'u_LightmapScaleOffset': Shader3D.PERIOD_SPRITE,
			'u_LightMap': Shader3D.PERIOD_SPRITE,

			'u_CameraPos': Shader3D.PERIOD_CAMERA,
			'u_Viewport': Shader3D.PERIOD_CAMERA,
			'u_ProjectionParams': Shader3D.PERIOD_CAMERA,
			'u_View': Shader3D.PERIOD_CAMERA,

			'u_ReflectTexture': Shader3D.PERIOD_SCENE,
			'u_ReflectIntensity': Shader3D.PERIOD_SCENE,
			'u_FogStart': Shader3D.PERIOD_SCENE,
			'u_FogRange': Shader3D.PERIOD_SCENE,
			'u_FogColor': Shader3D.PERIOD_SCENE,
			'u_DirationLightCount': Shader3D.PERIOD_SCENE,
			'u_LightBuffer': Shader3D.PERIOD_SCENE,
			'u_LightClusterBuffer': Shader3D.PERIOD_SCENE,
			'u_AmbientColor': Shader3D.PERIOD_SCENE,
			'u_shadowMap1': Shader3D.PERIOD_SCENE,
			'u_shadowMap2': Shader3D.PERIOD_SCENE,
			'u_shadowMap3': Shader3D.PERIOD_SCENE,
			'u_shadowPSSMDistance': Shader3D.PERIOD_SCENE,
			'u_lightShadowVP': Shader3D.PERIOD_SCENE,
			'u_shadowPCFoffset': Shader3D.PERIOD_SCENE,

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
			'u_SpotLight.color': Shader3D.PERIOD_SCENE
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

        

        
        shader = Shader3D.add(this.shaderName, null, null, true);
        subShader =  new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        
        var outlinePass = subShader.addShaderPass(outlineVS, outlinePS);
        outlinePass.renderState.cull = Laya.RenderState.CULL_FRONT;

        var mainPass =  subShader.addShaderPass(vs, ps, stateMap);
        mainPass.renderState.cull = Laya.RenderState.CULL_NONE;
        
        
    }

	static SHADERDEFINE_DIFFUSEMAP: ShaderDefine;
	static SHADERDEFINE_NORMALMAP: ShaderDefine;
	static SHADERDEFINE_SPECULARMAP: ShaderDefine;
	static SHADERDEFINE_TILINGOFFSET: ShaderDefine;
	static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;
    
    static __initDefine__() 
    {
        
		this.SHADERDEFINE_DIFFUSEMAP = Shader3D.getDefineByName("DIFFUSEMAP");
		this.SHADERDEFINE_NORMALMAP = Shader3D.getDefineByName("NORMALMAP");
		this.SHADERDEFINE_SPECULARMAP = Shader3D.getDefineByName("SPECULARMAP");
		this.SHADERDEFINE_TILINGOFFSET = Shader3D.getDefineByName("TILINGOFFSET");
        this.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D.getDefineByName("ENABLEVERTEXCOLOR");

    }



    
	/**高光强度数据源_漫反射贴图的Alpha通道。*/
	static SPECULARSOURCE_DIFFUSEMAPALPHA: number;
	/**高光强度数据源_高光贴图的RGB通道。*/
	static SPECULARSOURCE_SPECULARMAP: number;

	/**渲染状态_不透明。*/
	static RENDERMODE_OPAQUE: number = 0;
	/**渲染状态_阿尔法测试。*/
	static RENDERMODE_CUTOUT: number = 1;
	/**渲染状态_透明混合。*/
	static RENDERMODE_TRANSPARENT: number = 2;
    

	static ALBEDOTEXTURE: number = Shader3D.propertyNameToID("u_DiffuseTexture");
	static NORMALTEXTURE: number = Shader3D.propertyNameToID("u_NormalTexture");
	static SPECULARTEXTURE: number = Shader3D.propertyNameToID("u_SpecularTexture");
   
    // 卡通材质 -- 主颜色
    static ALBEDOCOLOR: number = Shader3D.propertyNameToID("u_DiffuseColor");
    // 卡通材质 -- 阴影颜色
    static SHADOWCOLOR: number = Shader3D.propertyNameToID("u_ShadowColor");
    
	static MATERIALSPECULAR: number = Shader3D.propertyNameToID("u_MaterialSpecular");
    static SHININESS: number = Shader3D.propertyNameToID("u_Shininess");

    // 卡通材质 -- 颜色强调
    static COLOR_RANGE: number = Shader3D.propertyNameToID("u_ColorRange");
    // 卡通材质 -- 颜色范围
    static COLOR_DEEP: number = Shader3D.propertyNameToID("u_ColorDeep");
    // 卡通材质 -- 描边粗细
    static OUTLINE_WIDTH: number = Shader3D.propertyNameToID("u_OutlineWidth");
    
	static TILINGOFFSET: number = Shader3D.propertyNameToID("u_TilingOffset");
	static CULL: number = Shader3D.propertyNameToID("s_Cull");
	static BLEND: number = Shader3D.propertyNameToID("s_Blend");
	static BLEND_SRC: number = Shader3D.propertyNameToID("s_BlendSrc");
	static BLEND_DST: number = Shader3D.propertyNameToID("s_BlendDst");
	static DEPTH_TEST: number = Shader3D.propertyNameToID("s_DepthTest");
	static DEPTH_WRITE: number = Shader3D.propertyNameToID("s_DepthWrite");

    
    // 卡通材质 -- 主颜色
	private _albedoColor: Vector4;
    // 卡通材质 -- 阴影颜色
	private _shadowColor: Vector4;
	private _albedoIntensity: number;
	private _enableLighting: boolean;
	private _enableVertexColor: boolean = false;

    constructor()
    {
        super();

        
        this._enableVertexColor = false;
        this.setShaderName(Cartoon2Material.shaderName);
        this._albedoIntensity = 1.0;
        // 卡通材质 -- 主颜色
        this._albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
        // 卡通材质 -- 阴影颜色
        this._shadowColor = new Vector4(0.1764706, 0.1764706, 0.1764706, 1.0);
        var sv = this._shaderValues;
        // 卡通材质 -- 主颜色
        sv.setVector(Cartoon2Material.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
        sv.setVector(Cartoon2Material.MATERIALSPECULAR, new Vector4(1.0, 1.0, 1.0, 1.0));
        sv.setNumber(Cartoon2Material.SHININESS, 0.078125);

        // 卡通材质 -- 阴影颜色
        sv.setVector(Cartoon2Material.SHADOWCOLOR, new Vector4(0.1764706, 0.1764706, 0.1764706, 1.0));
        // 卡通材质 -- 颜色强调
        sv.setNumber(Cartoon2Material.COLOR_RANGE, 88.4);
        // 卡通材质 -- 颜色范围
        sv.setNumber(Cartoon2Material.COLOR_DEEP, 0.08);
        // 卡通材质 -- 描边粗细
        sv.setNumber(Cartoon2Material.OUTLINE_WIDTH, 0.004);

        sv.setNumber(BaseMaterial.ALPHATESTVALUE, 0.5);
        sv.setVector(Cartoon2Material.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
        this._enableLighting = true;
        this.renderMode = Cartoon2Material.RENDERMODE_OPAQUE;

    }

    get _ColorR() {
        return this._albedoColor.x;
    }
    set _ColorR(value) {
        this._albedoColor.x = value;
        this.albedoColor = this._albedoColor;
    }
    get _ColorG() {
        return this._albedoColor.y;
    }
    set _ColorG(value) {
        this._albedoColor.y = value;
        this.albedoColor = this._albedoColor;
    }
    get _ColorB() {
        return this._albedoColor.z;
    }
    set _ColorB(value) {
        this._albedoColor.z = value;
        this.albedoColor = this._albedoColor;
    }
    get _ColorA() {
        return this._albedoColor.w;
    }
    set _ColorA(value) {
        this._albedoColor.w = value;
        this.albedoColor = this._albedoColor;
    }
    get _SpecColorR() {
        return this._shaderValues.getVector(Cartoon2Material.MATERIALSPECULAR).x;
    }
    set _SpecColorR(value) {
        this._shaderValues.getVector(Cartoon2Material.MATERIALSPECULAR).x = value;
    }
    get _SpecColorG() {
        return this._shaderValues.getVector(Cartoon2Material.MATERIALSPECULAR).y;
    }
    set _SpecColorG(value) {
        this._shaderValues.getVector(Cartoon2Material.MATERIALSPECULAR).y = value;
    }
    get _SpecColorB() {
        return this._shaderValues.getVector(Cartoon2Material.MATERIALSPECULAR).z;
    }
    set _SpecColorB(value) {
        this._shaderValues.getVector(Cartoon2Material.MATERIALSPECULAR).z = value;
    }
    get _SpecColorA() {
        return this._shaderValues.getVector(Cartoon2Material.MATERIALSPECULAR).w;
    }
    set _SpecColorA(value) {
        this._shaderValues.getVector(Cartoon2Material.MATERIALSPECULAR).w = value;
    }
    get _AlbedoIntensity() {
        return this._albedoIntensity;
    }
    set _AlbedoIntensity(value) {
        if (this._albedoIntensity !== value) {
            var finalAlbedo = this._shaderValues.getVector(Cartoon2Material.ALBEDOCOLOR);
            Vector4.scale(this._albedoColor, value, finalAlbedo);
            this._albedoIntensity = value;
            this._shaderValues.setVector(Cartoon2Material.ALBEDOCOLOR, finalAlbedo);
        }
    }


    get _Shininess() {
        return this._shaderValues.getNumber(Cartoon2Material.SHININESS);
    }
    set _Shininess(value) {
        value = Math.max(0.0, Math.min(1.0, value));
        this._shaderValues.setNumber(Cartoon2Material.SHININESS, value);
    }

    
    /** 卡通材质 -- 颜色强调 */
    get _ColorRange() {
        return this._shaderValues.getNumber(Cartoon2Material.COLOR_RANGE);
    }
    set _ColorRange(value) {
        value = Math.max(-1.0, Math.min(100.0, value));
        this._shaderValues.setNumber(Cartoon2Material.COLOR_RANGE, value);
    }

    
    
    /** 卡通材质 -- 颜色范围 */
    get _ColorDeep() {
        return this._shaderValues.getNumber(Cartoon2Material.COLOR_DEEP);
    }
    set _ColorDeep(value) {
        value = Math.max(0.0, Math.min(2, value));
        this._shaderValues.setNumber(Cartoon2Material.COLOR_DEEP, value);
    }

    /** 卡通材质 -- 描边粗细 */
    get _OutlineWidth() {
        return this._shaderValues.getNumber(Cartoon2Material.OUTLINE_WIDTH);
    }
    set _OutlineWidth(value) {
        this._shaderValues.setNumber(Cartoon2Material.OUTLINE_WIDTH, value);
    }


    get _MainTex_STX() {
        return this._shaderValues.getVector(Cartoon2Material.TILINGOFFSET).x;
    }
    set _MainTex_STX(x) {
        var tilOff = this._shaderValues.getVector(Cartoon2Material.TILINGOFFSET);
        tilOff.x = x;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STY() {
        return this._shaderValues.getVector(Cartoon2Material.TILINGOFFSET).y;
    }
    set _MainTex_STY(y) {
        var tilOff = this._shaderValues.getVector(Cartoon2Material.TILINGOFFSET);
        tilOff.y = y;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STZ() {
        return this._shaderValues.getVector(Cartoon2Material.TILINGOFFSET).z;
    }
    set _MainTex_STZ(z) {
        var tilOff = this._shaderValues.getVector(Cartoon2Material.TILINGOFFSET);
        tilOff.z = z;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STW() {
        return this._shaderValues.getVector(Cartoon2Material.TILINGOFFSET).w;
    }
    set _MainTex_STW(w) {
        var tilOff = this._shaderValues.getVector(Cartoon2Material.TILINGOFFSET);
        tilOff.w = w;
        this.tilingOffset = tilOff;
    }
    get _Cutoff() {
        return this.alphaTestValue;
    }
    set _Cutoff(value) {
        this.alphaTestValue = value;
    }
    set renderMode(value) {
        switch (value) {
            case Cartoon2Material.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case Cartoon2Material.RENDERMODE_CUTOUT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case Cartoon2Material.RENDERMODE_TRANSPARENT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            default:
                throw new Error("Material:renderMode value error.");
        }
    }
    get enableVertexColor() {
        return this._enableVertexColor;
    }
    set enableVertexColor(value) {
        this._enableVertexColor = value;
        if (value)
            this._shaderValues.addDefine(Cartoon2Material.SHADERDEFINE_ENABLEVERTEXCOLOR);
        else
            this._shaderValues.removeDefine(Cartoon2Material.SHADERDEFINE_ENABLEVERTEXCOLOR);
    }
    get tilingOffsetX() {
        return this._MainTex_STX;
    }
    set tilingOffsetX(x) {
        this._MainTex_STX = x;
    }
    get tilingOffsetY() {
        return this._MainTex_STY;
    }
    set tilingOffsetY(y) {
        this._MainTex_STY = y;
    }
    get tilingOffsetZ() {
        return this._MainTex_STZ;
    }
    set tilingOffsetZ(z) {
        this._MainTex_STZ = z;
    }
    get tilingOffsetW() {
        return this._MainTex_STW;
    }
    set tilingOffsetW(w) {
        this._MainTex_STW = w;
    }
    get tilingOffset() {
        return this._shaderValues.getVector(Cartoon2Material.TILINGOFFSET);
    }
    set tilingOffset(value) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                this._shaderValues.addDefine(Cartoon2Material.SHADERDEFINE_TILINGOFFSET);
            else
                this._shaderValues.removeDefine(Cartoon2Material.SHADERDEFINE_TILINGOFFSET);
        }
        else {
            this._shaderValues.removeDefine(Cartoon2Material.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(Cartoon2Material.TILINGOFFSET, value);
    }
    get albedoColorR() {
        return this._ColorR;
    }
    set albedoColorR(value) {
        this._ColorR = value;
    }
    get albedoColorG() {
        return this._ColorG;
    }
    set albedoColorG(value) {
        this._ColorG = value;
    }
    get albedoColorB() {
        return this._ColorB;
    }
    set albedoColorB(value) {
        this._ColorB = value;
    }
    get albedoColorA() {
        return this._ColorA;
    }
    set albedoColorA(value) {
        this._ColorA = value;
    }

    // 卡通材质 -- 主颜色
    get albedoColor() {
        return this._albedoColor;
    }
    set albedoColor(value) {
        var finalAlbedo = this._shaderValues.getVector(Cartoon2Material.ALBEDOCOLOR);
        Vector4.scale(value, this._albedoIntensity, finalAlbedo);
        this._albedoColor = value;
        this._shaderValues.setVector(Cartoon2Material.ALBEDOCOLOR, finalAlbedo);
    }

    
    // 卡通材质 -- 阴影颜色
    get shadowColor() {
        return this._shadowColor;
    }
    set shadowColor(value) {
        this._albedoColor = value;
        this._shaderValues.setVector(Cartoon2Material.ALBEDOCOLOR, value);
    }


    get albedoIntensity() {
        return this._albedoIntensity;
    }
    set albedoIntensity(value) {
        this._AlbedoIntensity = value;
    }
    get specularColorR() {
        return this._SpecColorR;
    }
    set specularColorR(value) {
        this._SpecColorR = value;
    }
    get specularColorG() {
        return this._SpecColorG;
    }
    set specularColorG(value) {
        this._SpecColorG = value;
    }
    get specularColorB() {
        return this._SpecColorB;
    }
    set specularColorB(value) {
        this._SpecColorB = value;
    }
    get specularColorA() {
        return this._SpecColorA;
    }
    set specularColorA(value) {
        this._SpecColorA = value;
    }
    get specularColor() {
        return this._shaderValues.getVector(Cartoon2Material.MATERIALSPECULAR);
    }
    set specularColor(value) {
        this._shaderValues.setVector(Cartoon2Material.MATERIALSPECULAR, value);
    }
    get shininess() {
        return this._Shininess;
    }
    set shininess(value) {
        this._Shininess = value;
    }
    get albedoTexture() {
        return this._shaderValues.getTexture(Cartoon2Material.ALBEDOTEXTURE);
    }
    set albedoTexture(value) {
        if (value)
            this._shaderValues.addDefine(Cartoon2Material.SHADERDEFINE_DIFFUSEMAP);
        else
            this._shaderValues.removeDefine(Cartoon2Material.SHADERDEFINE_DIFFUSEMAP);
        this._shaderValues.setTexture(Cartoon2Material.ALBEDOTEXTURE, value);
    }
    get normalTexture() {
        return this._shaderValues.getTexture(Cartoon2Material.NORMALTEXTURE);
    }
    set normalTexture(value) {
        if (value)
            this._shaderValues.addDefine(Cartoon2Material.SHADERDEFINE_NORMALMAP);
        else
            this._shaderValues.removeDefine(Cartoon2Material.SHADERDEFINE_NORMALMAP);
        this._shaderValues.setTexture(Cartoon2Material.NORMALTEXTURE, value);
    }
    get specularTexture() {
        return this._shaderValues.getTexture(Cartoon2Material.SPECULARTEXTURE);
    }
    set specularTexture(value) {
        if (value)
            this._shaderValues.addDefine(Cartoon2Material.SHADERDEFINE_SPECULARMAP);
        else
            this._shaderValues.removeDefine(Cartoon2Material.SHADERDEFINE_SPECULARMAP);
        this._shaderValues.setTexture(Cartoon2Material.SPECULARTEXTURE, value);
    }
    

	/**
	 * 是否启用光照。
	 */
	get enableLighting(): boolean {
		return this._enableLighting;
	}

	set enableLighting(value: boolean) {
		if (this._enableLighting !== value) {
			if (value) {
				this._disablePublicDefineDatas.remove(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
				this._disablePublicDefineDatas.remove(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT);
				this._disablePublicDefineDatas.remove(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
			}
			else {
				this._disablePublicDefineDatas.add(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
				this._disablePublicDefineDatas.add(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT);
				this._disablePublicDefineDatas.add(Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
			}
			this._enableLighting = value;
		}
    }
    
    set depthWrite(value) {
        this._shaderValues.setBool(Cartoon2Material.DEPTH_WRITE, value);
    }
    get depthWrite() {
        return this._shaderValues.getBool(Cartoon2Material.DEPTH_WRITE);
    }
    set cull(value) {
        this._shaderValues.setInt(Cartoon2Material.CULL, value);
    }
    get cull() {
        return this._shaderValues.getInt(Cartoon2Material.CULL);
    }
    set blend(value) {
        this._shaderValues.setInt(Cartoon2Material.BLEND, value);
    }
    get blend() {
        return this._shaderValues.getInt(Cartoon2Material.BLEND);
    }
    set blendSrc(value) {
        this._shaderValues.setInt(Cartoon2Material.BLEND_SRC, value);
    }
    get blendSrc() {
        return this._shaderValues.getInt(Cartoon2Material.BLEND_SRC);
    }
    set blendDst(value) {
        this._shaderValues.setInt(Cartoon2Material.BLEND_DST, value);
    }
    get blendDst() {
        return this._shaderValues.getInt(Cartoon2Material.BLEND_DST);
    }
    set depthTest(value) {
        this._shaderValues.setInt(Cartoon2Material.DEPTH_TEST, value);
    }
    get depthTest() {
        return this._shaderValues.getInt(Cartoon2Material.DEPTH_TEST);
    }
    clone() {
        var dest = new Cartoon2Material();
        this.cloneTo(dest);
        return dest;
    }
    cloneTo(destObject) {
        super.cloneTo(destObject);
        var destMaterial = destObject;
        destMaterial._enableLighting = this._enableLighting;
        destMaterial._albedoIntensity = this._albedoIntensity;
        destMaterial._enableVertexColor = this._enableVertexColor;
        this._albedoColor.cloneTo(destMaterial._albedoColor);
    }

}