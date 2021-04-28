
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
import { GPUSkinningToonV3Material } from "./GPUSkinningToonV3";



export class GPUSkinningToonWeaponV3Material extends GPUSkinningToonV3Material
{
    /** Shader名称 */
    public static shaderName = "GPUSkinningToonWeaponV3";
    public static outlinePass = "GPUSkinningToonV2Outline";

    public static async install()
    {
        this.__initDefine__();
        await this.initShader();

        this.defaultMaterial = new GPUSkinningToonWeaponV3Material();
        this.defaultMaterial.lock = true;
    }

    protected static async initShader()
    {
		
        // var outlineVS: string = await this.loadShaderVSAsync(GPUSkinningToonWeaponV3Material.outlinePass);
		// var outlinePS: string = await this.loadShaderPSAsync(GPUSkinningToonWeaponV3Material.outlinePass);
		
        var vs: string = await GPUSkinningToonWeaponV3Material.loadShaderVSAsync("GPUSkinningToonV3");
        var ps: string = await GPUSkinningToonWeaponV3Material.loadShaderPSAsync("GPUSkinningToonV3");
        
        
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

        
        shader = Shader3D.add(GPUSkinningToonWeaponV3Material.shaderName, null, null, true);
        subShader =  new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		
		
        // var outlinePass = subShader.addShaderPass(outlineVS, outlinePS);
		// outlinePass.renderState.cull = Laya.RenderState.CULL_FRONT;
		// // outlinePass.renderState.depthWrite = false;

        

        var mainPass =  subShader.addShaderPass(vs, ps, stateMap);
        mainPass.renderState.cull = Laya.RenderState.CULL_BACK;
        
        
    }

	

	/** 默认材质，禁止修改*/
	static defaultMaterial: GPUSkinningToonWeaponV3Material;




	constructor() {
		super(GPUSkinningToonWeaponV3Material.shaderName);
	}
	

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
	clone(): any {
		var dest: GPUSkinningToonWeaponV3Material = new GPUSkinningToonWeaponV3Material();
		this.cloneTo(dest);
		this._albedoColor.cloneTo(dest._albedoColor);
		return dest;
	}

	
	cloneTo(destObject: any): void {
		super.cloneTo(destObject);
		var destMaterial: GPUSkinningToonWeaponV3Material = (<GPUSkinningToonWeaponV3Material>destObject);
		this._albedoColor.cloneTo(destMaterial._albedoColor);
		
	}

}