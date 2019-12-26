import { MBaseMaterial } from "./MBaseMaterial";

import Shader3D = Laya.Shader3D;
import SubShader = Laya.SubShader;
import SkinnedMeshSprite3D = Laya.SkinnedMeshSprite3D;
import VertexMesh = Laya.VertexMesh;
import ShaderDefines = Laya.ShaderDefines;
import BaseMaterial = Laya.BaseMaterial;
import Vector4 = Laya.Vector4;
import RenderState = Laya.RenderState;


export class HeroMaterial extends MBaseMaterial
{
    
    /** Shader名称 */
    public static shaderName = "HeroShader";

    public static defaultMaterial:HeroMaterial;

    public static async install()
    {
        this.__initDefine__();
        await this.initShader();

        this.defaultMaterial = new HeroMaterial();
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

        attributeMap = {
            'a_Position': VertexMesh.MESH_POSITION0,
            'a_Color': VertexMesh.MESH_COLOR0,
            'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0,
            'a_BoneWeights': VertexMesh.MESH_BLENDWEIGHT0,
            'a_BoneIndices': VertexMesh.MESH_BLENDINDICES0,
            'a_MvpMatrix': VertexMesh.MESH_MVPMATRIX_ROW0
        };
        uniformMap = {
            'u_Bones': Shader3D.PERIOD_CUSTOM,
            'u_AlbedoTexture': Shader3D.PERIOD_MATERIAL,
            'u_AlbedoColor': Shader3D.PERIOD_MATERIAL,
            'u_ShadowTexture': Shader3D.PERIOD_MATERIAL,
            'u_TilingOffset': Shader3D.PERIOD_MATERIAL,
            'u_AlphaTestValue': Shader3D.PERIOD_MATERIAL,
            'u_MvpMatrix': Shader3D.PERIOD_SPRITE,
            'u_FogStart': Shader3D.PERIOD_SCENE,
            'u_FogRange': Shader3D.PERIOD_SCENE,
            'u_FogColor': Shader3D.PERIOD_SCENE
        };
        stateMap = {
            's_Cull': Shader3D.RENDER_STATE_CULL,
            's_Blend': Shader3D.RENDER_STATE_BLEND,
            's_BlendSrc': Shader3D.RENDER_STATE_BLEND_SRC,
            's_BlendDst': Shader3D.RENDER_STATE_BLEND_DST,
            's_DepthTest': Shader3D.RENDER_STATE_DEPTH_TEST,
            's_DepthWrite': Shader3D.RENDER_STATE_DEPTH_WRITE
        };

        
        shader = Shader3D.add(this.shaderName, null, null, true);
        subShader = new SubShader(attributeMap, uniformMap, SkinnedMeshSprite3D.shaderDefines, this.shaderDefines);
        shader.addSubShader(subShader);
        subShader.addShaderPass(vs, ps, stateMap);
        
    }

    public static shaderDefines:ShaderDefines;
    public static SHADERDEFINE_ALBEDOTEXTURE:number;
    public static SHADERDEFINE_SHADOWTEXTURE:number;
    public static SHADERDEFINE_TILINGOFFSET:number;
    public static SHADERDEFINE_ENABLEVERTEXCOLOR:number;
    
    static __initDefine__() 
    {
        
        this.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
        this.SHADERDEFINE_ALBEDOTEXTURE = this.shaderDefines.registerDefine("ALBEDOTEXTURE");
        this.SHADERDEFINE_SHADOWTEXTURE = this.shaderDefines.registerDefine("SHADOWTEXTURE");
        this.SHADERDEFINE_TILINGOFFSET = this.shaderDefines.registerDefine("TILINGOFFSET");
        this.SHADERDEFINE_ENABLEVERTEXCOLOR = this.shaderDefines.registerDefine("ENABLEVERTEXCOLOR");

    }


    
    
	public static RENDERMODE_OPAQUE = 0;
	public static RENDERMODE_CUTOUT = 1;
	public static RENDERMODE_TRANSPARENT = 2;
	public static RENDERMODE_ADDTIVE = 3;
	public static ALBEDOTEXTURE = Shader3D.propertyNameToID("u_AlbedoTexture");
	public static SHADOWTEXTURE = Shader3D.propertyNameToID("u_ShadowTexture");
	public static ALBEDOCOLOR = Shader3D.propertyNameToID("u_AlbedoColor");
	public static TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
	public static CULL = Shader3D.propertyNameToID("s_Cull");
	public static BLEND = Shader3D.propertyNameToID("s_Blend");
	public static BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
	public static BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
	public static DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
	public static DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");

    
    private _albedoColor: Vector4;
    private _albedoIntensity: number;
    private _enableVertexColor: boolean;


    constructor()
    {
        super();

        this._albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
        this._albedoIntensity = 1.0;
        this._enableVertexColor = false;
        this.setShaderName(HeroMaterial.shaderName);
        this._shaderValues.setVector(HeroMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
        this.renderMode = HeroMaterial.RENDERMODE_OPAQUE;

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
    get _AlbedoIntensity() {
        return this._albedoIntensity;
    }
    set _AlbedoIntensity(value) {
        if (this._albedoIntensity !== value) {
            var finalAlbedo = this._shaderValues.getVector(HeroMaterial.ALBEDOCOLOR);
            Vector4.scale(this._albedoColor, value, finalAlbedo);
            this._albedoIntensity = value;
            this._shaderValues.setVector(HeroMaterial.ALBEDOCOLOR, finalAlbedo);
        }
    }
    get _MainTex_STX() {
        return this._shaderValues.getVector(HeroMaterial.TILINGOFFSET).x;
    }
    set _MainTex_STX(x) {
        var tilOff = this._shaderValues.getVector(HeroMaterial.TILINGOFFSET);
        tilOff.x = x;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STY() {
        return this._shaderValues.getVector(HeroMaterial.TILINGOFFSET).y;
    }
    set _MainTex_STY(y) {
        var tilOff = this._shaderValues.getVector(HeroMaterial.TILINGOFFSET);
        tilOff.y = y;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STZ() {
        return this._shaderValues.getVector(HeroMaterial.TILINGOFFSET).z;
    }
    set _MainTex_STZ(z) {
        var tilOff = this._shaderValues.getVector(HeroMaterial.TILINGOFFSET);
        tilOff.z = z;
        this.tilingOffset = tilOff;
    }
    get _MainTex_STW() {
        return this._shaderValues.getVector(HeroMaterial.TILINGOFFSET).w;
    }
    set _MainTex_STW(w) {
        var tilOff = this._shaderValues.getVector(HeroMaterial.TILINGOFFSET);
        tilOff.w = w;
        this.tilingOffset = tilOff;
    }
    get _Cutoff() {
        return this.alphaTestValue;
    }
    set _Cutoff(value) {
        this.alphaTestValue = value;
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
        var finalAlbedo = this._shaderValues.getVector(HeroMaterial.ALBEDOCOLOR);
        Vector4.scale(value, this._albedoIntensity, finalAlbedo);
        this._albedoColor = value;
        this._shaderValues.setVector(HeroMaterial.ALBEDOCOLOR, finalAlbedo);
    }
    get albedoIntensity() {
        return this._albedoIntensity;
    }
    set albedoIntensity(value) {
        this._AlbedoIntensity = value;
    }
    get albedoTexture() {
        return this._shaderValues.getTexture(HeroMaterial.ALBEDOTEXTURE);
    }
    set albedoTexture(value) {
        if (value)
            this._shaderValues.addDefine(HeroMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        else
            this._shaderValues.removeDefine(HeroMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        this._shaderValues.setTexture(HeroMaterial.ALBEDOTEXTURE, value);
    }

    
    get shadowTexture() {
        return this._shaderValues.getTexture(HeroMaterial.SHADOWTEXTURE);
    }
    set shadowTexture(value) {
        if (value)
            this._shaderValues.addDefine(HeroMaterial.SHADERDEFINE_SHADOWTEXTURE);
        else
            this._shaderValues.removeDefine(HeroMaterial.SHADERDEFINE_SHADOWTEXTURE);
        this._shaderValues.setTexture(HeroMaterial.SHADOWTEXTURE, value);
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
        return this._shaderValues.getVector(HeroMaterial.TILINGOFFSET);
    }
    set tilingOffset(value) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                this._shaderValues.addDefine(HeroMaterial.SHADERDEFINE_TILINGOFFSET);
            else
                this._shaderValues.removeDefine(HeroMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        else {
            this._shaderValues.removeDefine(HeroMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(HeroMaterial.TILINGOFFSET, value);
    }
    get enableVertexColor() {
        return this._enableVertexColor;
    }
    set enableVertexColor(value) {
        this._enableVertexColor = value;
        if (value)
            this._shaderValues.addDefine(HeroMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
        else
            this._shaderValues.removeDefine(HeroMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
    }
    set renderMode(value) {
        switch (value) {
            case HeroMaterial.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case HeroMaterial.RENDERMODE_CUTOUT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case HeroMaterial.RENDERMODE_TRANSPARENT:
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
                throw new Error("UnlitMaterial : renderMode value error.");
        }
    }
    set depthWrite(value) {
        this._shaderValues.setBool(HeroMaterial.DEPTH_WRITE, value);
    }
    get depthWrite() {
        return this._shaderValues.getBool(HeroMaterial.DEPTH_WRITE);
    }
    set cull(value) {
        this._shaderValues.setInt(HeroMaterial.CULL, value);
    }
    get cull() {
        return this._shaderValues.getInt(HeroMaterial.CULL);
    }
    set blend(value) {
        this._shaderValues.setInt(HeroMaterial.BLEND, value);
    }
    get blend() {
        return this._shaderValues.getInt(HeroMaterial.BLEND);
    }
    set blendSrc(value) {
        this._shaderValues.setInt(HeroMaterial.BLEND_SRC, value);
    }
    get blendSrc() {
        return this._shaderValues.getInt(HeroMaterial.BLEND_SRC);
    }
    set blendDst(value) {
        this._shaderValues.setInt(HeroMaterial.BLEND_DST, value);
    }
    get blendDst() {
        return this._shaderValues.getInt(HeroMaterial.BLEND_DST);
    }
    set depthTest(value) {
        this._shaderValues.setInt(HeroMaterial.DEPTH_TEST, value);
    }
    
    get depthTest() 
    {
        return this._shaderValues.getInt(HeroMaterial.DEPTH_TEST);
    }

    clone() 
    {
        var dest = new HeroMaterial();
        this.cloneTo(dest);
        return dest;
    }

}