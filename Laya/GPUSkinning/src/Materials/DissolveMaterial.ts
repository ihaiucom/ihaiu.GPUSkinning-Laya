import { MBaseMaterial } from "./MBaseMaterial";
import Shader3D = Laya.Shader3D;
import SubShader = Laya.SubShader;
import VertexMesh = Laya.VertexMesh;
import ShaderDefine = Laya.ShaderDefine;
import BaseMaterial = Laya.BaseMaterial;
import RenderState  = Laya.RenderState;
import Scene3DShaderDeclaration = Laya.Scene3DShaderDeclaration;

export default class DissolveMaterial extends MBaseMaterial 
{
    /** Shader名称 */
    public static shaderName = "DissolveShader";

    public static defaultMaterial:DissolveMaterial;

    static SHADERDEFINE_DIFFUSEMAP: ShaderDefine;
	static SHADERDEFINE_NORMALMAP: ShaderDefine;
	static SHADERDEFINE_SPECULARMAP: ShaderDefine;
	static SHADERDEFINE_TILINGOFFSET: ShaderDefine;
	static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;

    public static __initDefine__() {
        DissolveMaterial.SHADERDEFINE_DIFFUSEMAP = Shader3D.getDefineByName("DIFFUSEMAP");
        DissolveMaterial.SHADERDEFINE_NORMALMAP = Shader3D.getDefineByName("NORMALMAP");
        DissolveMaterial.SHADERDEFINE_SPECULARMAP = Shader3D.getDefineByName("SPECULARMAP");
        DissolveMaterial.SHADERDEFINE_TILINGOFFSET = Shader3D.getDefineByName("TILINGOFFSET");
        DissolveMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D.getDefineByName("ENABLEVERTEXCOLOR");
    }

    public static async install()
    {
        this.__initDefine__();
        await this.initShader();

        this.defaultMaterial = new DissolveMaterial();
        this.defaultMaterial.enableLighting = true;
        this.defaultMaterial.lock = true;
    }

    private static async initShader()
    {
        var vs: string = await this.loadShaderVSAsync(this.shaderName);
        var ps: string = await this.loadShaderPSAsync(this.shaderName);
        

        var attributeMap: object;
        var uniformMap: object;
        var stateMap: object;
        var shader:Shader3D;
        var subShader:SubShader;

        attributeMap = 
        {
            // 顶点在投影空间下的位置
            'a_Position': VertexMesh.MESH_POSITION0,
            // 顶点在视图坐标系下的法向量
            'a_Normal': VertexMesh.MESH_NORMAL0,
            // 切向量
            'a_Tangent0': VertexMesh.MESH_TANGENT0,
            // 第一个uv坐标
            'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0,
            // 第二个uv坐标
            'a_Texcoord1': VertexMesh.MESH_TEXTURECOORDINATE1,
            // 骨骼权重
            'a_BoneWeights': VertexMesh.MESH_BLENDWEIGHT0,
            // 骨骼索引
            'a_BoneIndices': VertexMesh.MESH_BLENDINDICES0,
            // MVP矩阵
            'a_MvpMatrix': VertexMesh.MESH_MVPMATRIX_ROW0,
            // 世界矩阵
            'a_WorldMat': VertexMesh.MESH_WORLDMATRIX_ROW0,
            // 定色点
			'a_Color': VertexMesh.MESH_COLOR0,
		};

        uniformMap = 
        {
            'u_Bones': Shader3D.PERIOD_CUSTOM,
            'u_DiffuseTexture': Shader3D.PERIOD_MATERIAL,
            'u_NormalTexture': Shader3D.PERIOD_MATERIAL,
			'u_SpecularTexture': Shader3D.PERIOD_MATERIAL,
            'u_DiffuseColor': Shader3D.PERIOD_MATERIAL,
            'u_MaterialSpecular': Shader3D.PERIOD_MATERIAL,
            'u_Shininess': Shader3D.PERIOD_MATERIAL,
            'u_TilingOffset': Shader3D.PERIOD_MATERIAL,
            'u_AlphaTestValue': Shader3D.PERIOD_MATERIAL,
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
			'u_SpotLight.color': Shader3D.PERIOD_SCENE,

            //cartoon2
            'u_OutlineWidth': Shader3D.PERIOD_MATERIAL,
            'u_ColorRange': Shader3D.PERIOD_MATERIAL,
            'u_ColorDeep': Shader3D.PERIOD_MATERIAL,
            'u_ShadowColor': Shader3D.PERIOD_MATERIAL,
            
            // dissolve
            'u_DissolveTex':Shader3D.PERIOD_MATERIAL,
            'u_DissolveColor':Shader3D.PERIOD_MATERIAL,
            'u_DissolveProgress':Shader3D.PERIOD_MATERIAL,
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

        var mainPass =  subShader.addShaderPass(vs, ps, stateMap);
        mainPass.renderState.cull = Laya.RenderState.CULL_NONE;
    }

    /** 渲染状态_不透明。 */
    static RENDERMODE_OPAQUE = 0;
    /** 渲染状态_阿尔法测试。 */
    static RENDERMODE_CUTOUT = 1;
    /** 渲染状态_透明混合。 */
    static RENDERMODE_TRANSPARENT = 2;

    /** 漫反射贴图 */
    static ALBEDOTEXTURE: number    = Shader3D.propertyNameToID("u_DiffuseTexture");
    /** 法线贴图 */
    static NORMALTEXTURE: number    = Shader3D.propertyNameToID("u_NormalTexture");
    /** 高光贴图(镜面反射) */
    static SPECULARTEXTURE: number  = Shader3D.propertyNameToID("u_SpecularTexture");
    /** 漫反射颜色 */
    static ALBEDOCOLOR: number      = Shader3D.propertyNameToID("u_DiffuseColor");
    /** 高光颜色(镜面反射) */
    static MATERIALSPECULAR: number = Shader3D.propertyNameToID("u_MaterialSpecular");
    /** 光强度 */
    static SHININESS: number        = Shader3D.propertyNameToID("u_Shininess");
    /** 偏移 */
    static TILINGOFFSET: number     = Shader3D.propertyNameToID("u_TilingOffset");

    //---------------TODO------------GJC
    /** 溶解噪声图 */
    static DISSOLVE_TEX:number = Shader3D.propertyNameToID("u_DissolveTex");
    /** 溶解颜色 */
    static DISSOLVE_COLOR:number = Shader3D.propertyNameToID("u_DissolveColor");
    /** 溶解进度 */
    static DISSOLVE_PROGRESS:number = Shader3D.propertyNameToID("u_DissolveProgress"); 


    // 卡通材质 -- 阴影颜色
    static SHADOWCOLOR: number = Shader3D.propertyNameToID("u_ShadowColor");
    /** 卡通材质 -- 颜色强调 */
    static COLOR_RANGE: number = Shader3D.propertyNameToID("u_ColorRange");
    /** 卡通材质 -- 颜色范围 */
    static COLOR_DEEP: number = Shader3D.propertyNameToID("u_ColorDeep");
    /** 卡通材质 -- 描边粗细 */
    static OUTLINE_WIDTH: number = Shader3D.propertyNameToID("u_OutlineWidth");


    


    /** 渲染状态_剔除 */
    static CULL: number             = Shader3D.propertyNameToID("s_Cull");
    /** 渲染状态_混合 */
    static BLEND: number            = Shader3D.propertyNameToID("s_Blend");
    /** 渲染状态_混合源 */
    static BLEND_SRC: number        = Shader3D.propertyNameToID("s_BlendSrc");
    /** 渲染状态_混合目标 */
    static BLEND_DST: number        = Shader3D.propertyNameToID("s_BlendDst");
    /** 渲染状态_深度测试 */
    static DEPTH_TEST: number       = Shader3D.propertyNameToID("s_DepthTest");
    /** 渲染状态_深度写入 */
	static DEPTH_WRITE: number      = Shader3D.propertyNameToID("s_DepthWrite");

    private _enableVertexColor:boolean = false;
    private _albedoIntensity = 1.0;
    private _albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
    private _enableLighting = true;

    constructor()
    {
        super();

        this.setShaderName(DissolveMaterial.shaderName);

        var sv = this._shaderValues;
        sv.setVector(DissolveMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
        sv.setVector(DissolveMaterial.MATERIALSPECULAR, new Vector4(1.0, 1.0, 1.0, 1.0));
        sv.setNumber(DissolveMaterial.SHININESS, 0.078125);
        sv.setNumber(DissolveMaterial.ALPHATESTVALUE, 0.5);
        sv.setVector(DissolveMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));


        // 卡通材质 -- 阴影颜色
        sv.setVector(DissolveMaterial.SHADOWCOLOR, new Vector4(0.1764706, 0.1764706, 0.1764706, 1.0));
        // 卡通材质 -- 颜色强调
        sv.setNumber(DissolveMaterial.COLOR_RANGE, 88.4);
        // 卡通材质 -- 颜色范围
        sv.setNumber(DissolveMaterial.COLOR_DEEP, 0.08);
        // 卡通材质 -- 描边粗细
        sv.setNumber(DissolveMaterial.OUTLINE_WIDTH, 0.004);

        this.renderMode = DissolveMaterial.RENDERMODE_OPAQUE;
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
        return this._shaderValues.getVector(DissolveMaterial.MATERIALSPECULAR).x;
    }
    set _SpecColorR(value) {
        this._shaderValues.getVector(DissolveMaterial.MATERIALSPECULAR).x = value;
    }
    get _SpecColorG() {
        return this._shaderValues.getVector(DissolveMaterial.MATERIALSPECULAR).y;
    }
    set _SpecColorG(value) {
        this._shaderValues.getVector(DissolveMaterial.MATERIALSPECULAR).y = value;
    }
    get _SpecColorB() {
        return this._shaderValues.getVector(DissolveMaterial.MATERIALSPECULAR).z;
    }
    set _SpecColorB(value) {
        this._shaderValues.getVector(DissolveMaterial.MATERIALSPECULAR).z = value;
    }
    get _SpecColorA() {
        return this._shaderValues.getVector(DissolveMaterial.MATERIALSPECULAR).w;
    }
    set _SpecColorA(value) {
        this._shaderValues.getVector(DissolveMaterial.MATERIALSPECULAR).w = value;
    }
    get _AlbedoIntensity() {
        return this._albedoIntensity;
    }
    set _AlbedoIntensity(value) {
        if (this._albedoIntensity !== value) {
            var finalAlbedo = this._shaderValues.getVector(DissolveMaterial.ALBEDOCOLOR);
            Vector4.scale(this._albedoColor, value, finalAlbedo);
            this._albedoIntensity = value;
            this._shaderValues.setVector(DissolveMaterial.ALBEDOCOLOR, finalAlbedo);
        }
    }
    get _Shininess() {
        return this._shaderValues.getNumber(DissolveMaterial.SHININESS);
    }
    set _Shininess(value) {
        value = Math.max(0.0, Math.min(1.0, value));
        this._shaderValues.setNumber(DissolveMaterial.SHININESS, value);
    }
    get _MainTex_STX() {
        return this._shaderValues.getVector(DissolveMaterial.TILINGOFFSET).x;
    }
    set _MainTex_STX(x) {
        var tilOff = this._shaderValues.getVector(DissolveMaterial.TILINGOFFSET);
        tilOff.x = x;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STY() {
        return this._shaderValues.getVector(DissolveMaterial.TILINGOFFSET).y;
    }
    set _MainTex_STY(y) {
        var tilOff = this._shaderValues.getVector(DissolveMaterial.TILINGOFFSET);
        tilOff.y = y;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STZ() {
        return this._shaderValues.getVector(DissolveMaterial.TILINGOFFSET).z;
    }
    set _MainTex_STZ(z) {
        var tilOff = this._shaderValues.getVector(DissolveMaterial.TILINGOFFSET);
        tilOff.z = z;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STW() {
        return this._shaderValues.getVector(DissolveMaterial.TILINGOFFSET).w;
    }
    set _MainTex_STW(w) {
        var tilOff = this._shaderValues.getVector(DissolveMaterial.TILINGOFFSET);
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
            case DissolveMaterial.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case DissolveMaterial.RENDERMODE_CUTOUT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case DissolveMaterial.RENDERMODE_TRANSPARENT:
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
            this._shaderValues.addDefine(DissolveMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
        else
            this._shaderValues.removeDefine(DissolveMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
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
        return this._shaderValues.getVector(DissolveMaterial.TILINGOFFSET);
    }
    set tilingOffset(value) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                this._shaderValues.addDefine(DissolveMaterial.SHADERDEFINE_TILINGOFFSET);
            else
                this._shaderValues.removeDefine(DissolveMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        else {
            this._shaderValues.removeDefine(DissolveMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(DissolveMaterial.TILINGOFFSET, value);
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
    get albedoColor() {
        return this._albedoColor;
    }
    set albedoColor(value) {
        var finalAlbedo = this._shaderValues.getVector(DissolveMaterial.ALBEDOCOLOR);
        Vector4.scale(value, this._albedoIntensity, finalAlbedo);
        this._albedoColor = value;
        this._shaderValues.setVector(DissolveMaterial.ALBEDOCOLOR, finalAlbedo);
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
        return this._shaderValues.getVector(DissolveMaterial.MATERIALSPECULAR);
    }
    set specularColor(value) {
        this._shaderValues.setVector(DissolveMaterial.MATERIALSPECULAR, value);
    }
    get shininess() {
        return this._Shininess;
    }
    set shininess(value) {
        this._Shininess = value;
    }
    get albedoTexture() {
        return this._shaderValues.getTexture(DissolveMaterial.ALBEDOTEXTURE);
    }
    set albedoTexture(value) {
        if (value)
            this._shaderValues.addDefine(DissolveMaterial.SHADERDEFINE_DIFFUSEMAP);
        else
            this._shaderValues.removeDefine(DissolveMaterial.SHADERDEFINE_DIFFUSEMAP);
        this._shaderValues.setTexture(DissolveMaterial.ALBEDOTEXTURE, value);
    }
    get normalTexture() {
        return this._shaderValues.getTexture(DissolveMaterial.NORMALTEXTURE);
    }
    set normalTexture(value) {
        if (value)
            this._shaderValues.addDefine(DissolveMaterial.SHADERDEFINE_NORMALMAP);
        else
            this._shaderValues.removeDefine(DissolveMaterial.SHADERDEFINE_NORMALMAP);
        this._shaderValues.setTexture(DissolveMaterial.NORMALTEXTURE, value);
    }
    get specularTexture() {
        return this._shaderValues.getTexture(DissolveMaterial.SPECULARTEXTURE);
    }
    set specularTexture(value) {
        if (value)
            this._shaderValues.addDefine(DissolveMaterial.SHADERDEFINE_SPECULARMAP);
        else
            this._shaderValues.removeDefine(DissolveMaterial.SHADERDEFINE_SPECULARMAP);
        this._shaderValues.setTexture(DissolveMaterial.SPECULARTEXTURE, value);
    }
    get enableLighting() {
        return this._enableLighting;
    }
    set enableLighting(value) {
        if (this._enableLighting !== value) {
            if (value) {
                this['_disablePublicDefineDatas'].remove(Scene3DShaderDeclaration['SHADERDEFINE_POINTLIGHT']);
                this['_disablePublicDefineDatas'].remove(Scene3DShaderDeclaration['SHADERDEFINE_SPOTLIGHT']);
                this['_disablePublicDefineDatas'].remove(Scene3DShaderDeclaration['SHADERDEFINE_DIRECTIONLIGHT']);
            }
            else {
                this['_disablePublicDefineDatas'].add(Scene3DShaderDeclaration['SHADERDEFINE_POINTLIGHT']);
                this['_disablePublicDefineDatas'].add(Scene3DShaderDeclaration['SHADERDEFINE_SPOTLIGHT']);
                this['_disablePublicDefineDatas'].add(Scene3DShaderDeclaration['SHADERDEFINE_DIRECTIONLIGHT']);
            }
            this._enableLighting = value;
        }
    }
    get depthWrite() {
        return this._shaderValues.getBool(DissolveMaterial.DEPTH_WRITE);
    }
    set depthWrite(value) {
        this._shaderValues.setBool(DissolveMaterial.DEPTH_WRITE, value);
    }
    get cull() {
        return this._shaderValues.getInt(DissolveMaterial.CULL);
    }
    set cull(value) {
        this._shaderValues.setInt(DissolveMaterial.CULL, value);
    }
    get blend() {
        return this._shaderValues.getInt(DissolveMaterial.BLEND);
    }
    set blend(value) {
        this._shaderValues.setInt(DissolveMaterial.BLEND, value);
    }
    get blendSrc() {
        return this._shaderValues.getInt(DissolveMaterial.BLEND_SRC);
    }
    set blendSrc(value) {
        this._shaderValues.setInt(DissolveMaterial.BLEND_SRC, value);
    }
    get blendDst() {
        return this._shaderValues.getInt(DissolveMaterial.BLEND_DST);
    }
    set blendDst(value) {
        this._shaderValues.setInt(DissolveMaterial.BLEND_DST, value);
    }
    get depthTest() {
        return this._shaderValues.getInt(DissolveMaterial.DEPTH_TEST);
    }
    set depthTest(value) {
        this._shaderValues.setInt(DissolveMaterial.DEPTH_TEST, value);
    }
    clone() {
        var dest = new DissolveMaterial();
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

    //---------------TODO------------GJC
    set dissolveTex(value)
	{
		this._shaderValues.setTexture(DissolveMaterial.DISSOLVE_TEX,value);
	} 
	set dissolveColor(value)
	{
		this._shaderValues.setVector3(DissolveMaterial.DISSOLVE_COLOR,value);
    }
    /** 溶解进度 */
    get dissolveProgress()
	{
		return this._shaderValues.getNumber(DissolveMaterial.DISSOLVE_PROGRESS);
    }
    set dissolveProgress(value)
	{
		this._shaderValues.setNumber(DissolveMaterial.DISSOLVE_PROGRESS,value);
    }
    /** 卡通材质 -- 阴影颜色 */
    get shadowColor() {
        return this._shaderValues.getVector(DissolveMaterial.ALBEDOCOLOR);
    }
    set shadowColor(value) {
        this._albedoColor = value;
        this._shaderValues.setVector(DissolveMaterial.ALBEDOCOLOR, value);
    }
    /** 卡通材质 -- 颜色强调 */
    get _ColorRange() {
        return this._shaderValues.getNumber(DissolveMaterial.COLOR_RANGE);
    }
    set _ColorRange(value) {
        value = Math.max(-1.0, Math.min(100.0, value));
        this._shaderValues.setNumber(DissolveMaterial.COLOR_RANGE, value);
    }
     /** 卡通材质 -- 颜色范围 */
     get _ColorDeep() {
        return this._shaderValues.getNumber(DissolveMaterial.COLOR_DEEP);
    }
    set _ColorDeep(value) {
        value = Math.max(0.0, Math.min(2, value));
        this._shaderValues.setNumber(DissolveMaterial.COLOR_DEEP, value);
    }

    /** 卡通材质 -- 描边粗细 */
    get _OutlineWidth() {
        return this._shaderValues.getNumber(DissolveMaterial.OUTLINE_WIDTH);
    }
    set _OutlineWidth(value) {
        this._shaderValues.setNumber(DissolveMaterial.OUTLINE_WIDTH, value);
    }
}