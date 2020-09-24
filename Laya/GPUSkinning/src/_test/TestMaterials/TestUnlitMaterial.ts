import { TestBaseMaterial } from "./TestBaseMaterial";

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

export class TestUnlitMaterial extends TestBaseMaterial
{
    /** Shader名称 */
    public static shaderName = "unlit";

    private static _isInstalled: boolean = false;
    public static async install()
    {
		if(this._isInstalled)
		{
			return;
		}
		this._isInstalled = true;
        TestUnlitMaterial.__initDefine__();
        await TestUnlitMaterial.initShader();

        TestUnlitMaterial.defaultMaterial = new TestUnlitMaterial();
        TestUnlitMaterial.defaultMaterial.lock = true;
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
			'a_Position': VertexMesh.MESH_POSITION0,
			'a_Color': VertexMesh.MESH_COLOR0,
			'a_MvpMatrix': VertexMesh.MESH_MVPMATRIX_ROW0
		};

        uniformMap = 
        {
			"u_AlbedoColor": Shader3D.PERIOD_MATERIAL,
            
            'u_MvpMatrix': Shader3D.PERIOD_SPRITE,
            
			'u_FogStart': Shader3D.PERIOD_SCENE,
			'u_FogRange': Shader3D.PERIOD_SCENE,
			'u_FogColor': Shader3D.PERIOD_SCENE
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
        // mainPass.renderState.cull = Laya.RenderState.CULL_BACK;
        
        
    }

    
	/** 默认材质，禁止修改*/
	static defaultMaterial: TestUnlitMaterial;

	/**
	 * @internal
	 */
	static __initDefine__(): void {

	}

	constructor() {
		super();
        this.setShaderName(TestUnlitMaterial.shaderName);
        
        this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
		
        this.alphaTest = false;
        
		this._shaderValues.setBool(Shader3D.propertyNameToID("s_DepthWrite"), false);
		this._shaderValues.setInt(Shader3D.propertyNameToID("s_DepthTest"),  RenderState.DEPTHTEST_LESS);
		this._shaderValues.setInt(Shader3D.propertyNameToID("s_Cull"),  RenderState.CULL_BACK);
		this._shaderValues.setInt(Shader3D.propertyNameToID("s_Blend"),  RenderState.BLEND_ENABLE_ALL);
		this._shaderValues.setInt(Shader3D.propertyNameToID("s_BlendSrc"),  RenderState.BLENDPARAM_SRC_ALPHA);
		this._shaderValues.setInt(Shader3D.propertyNameToID("s_BlendDst"),  RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
		
		this._shaderValues.setVector(TestUnlitMaterial.ALBEDOCOLOR, this._albedoColor);
	}

	
	static ALBEDOCOLOR: number = Shader3D.propertyNameToID("u_AlbedoColor");
	private _albedoColor: Vector4 = new Vector4(1.0, 1.0, 1.0, 1.0);
	/**
	 * 反照率颜色。
	 */
	get albedoColor(): Vector4 {
		return this._albedoColor;
	}

	set albedoColor(value: Vector4) {
		var finalAlbedo: Vector4 = (<Vector4>this._shaderValues.getVector(TestUnlitMaterial.ALBEDOCOLOR));
		Vector4.scale(value, 1, finalAlbedo);
		this._albedoColor = value;
		this._shaderValues.setVector(TestUnlitMaterial.ALBEDOCOLOR, finalAlbedo);
	}

}