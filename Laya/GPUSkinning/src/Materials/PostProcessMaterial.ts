import { MBaseMaterial } from "./MBaseMaterial";
import Shader3D = Laya.Shader3D;
import SubShader = Laya.SubShader;
import VertexMesh = Laya.VertexMesh;
import ShaderDefine = Laya.ShaderDefine;
import BaseMaterial = Laya.BaseMaterial;
import RenderState  = Laya.RenderState;
import Scene3DShaderDeclaration = Laya.Scene3DShaderDeclaration;

export default class PostProcessMaterial extends MBaseMaterial 
{
   /** Shader名称 */
   public static shaderName = "PostProcessShader";

   public static defaultMaterial:PostProcessMaterial;

   static SHADERDEFINE_DIFFUSEMAP: ShaderDefine;
   static SHADERDEFINE_NORMALMAP: ShaderDefine;
   static SHADERDEFINE_SPECULARMAP: ShaderDefine;
   static SHADERDEFINE_TILINGOFFSET: ShaderDefine;
   static SHADERDEFINE_ENABLEVERTEXCOLOR: ShaderDefine;

   public static __initDefine__() {
    PostProcessMaterial.SHADERDEFINE_DIFFUSEMAP = Shader3D.getDefineByName("DIFFUSEMAP");
       PostProcessMaterial.SHADERDEFINE_NORMALMAP = Shader3D.getDefineByName("NORMALMAP");
       PostProcessMaterial.SHADERDEFINE_SPECULARMAP = Shader3D.getDefineByName("SPECULARMAP");
       PostProcessMaterial.SHADERDEFINE_TILINGOFFSET = Shader3D.getDefineByName("TILINGOFFSET");
       PostProcessMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D.getDefineByName("ENABLEVERTEXCOLOR");
   }

   public static async install()
   {
       this.__initDefine__();
       await this.initShader();

       this.defaultMaterial = new PostProcessMaterial();
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
            'a_PositionTexcoord': VertexMesh.MESH_POSITION0
        };

        uniformMap = 
        {
            'u_MainTex': Shader3D.PERIOD_MATERIAL,
            'u_BloomTex': Shader3D.PERIOD_MATERIAL,
            'u_AutoExposureTex': Shader3D.PERIOD_MATERIAL,
            'u_Bloom_DirtTileOffset': Shader3D.PERIOD_MATERIAL,
            'u_Bloom_DirtTex': Shader3D.PERIOD_MATERIAL,
            'u_BloomTex_TexelSize': Shader3D.PERIOD_MATERIAL,
            'u_Bloom_Settings': Shader3D.PERIOD_MATERIAL,
            'u_Bloom_Color': Shader3D.PERIOD_MATERIAL
        };

        shader = Shader3D.add(this.shaderName, null, null, true);
        subShader =  new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);

        var shaderPass  = subShader.addShaderPass(vs, ps);
        var renderState = shaderPass.renderState;
        renderState            = shaderPass.renderState;
        renderState.depthTest  = RenderState.DEPTHTEST_ALWAYS;
        renderState.depthWrite = false;
        renderState.cull       = RenderState.CULL_NONE;
        renderState.blend      = RenderState.BLEND_DISABLE;
    }

    constructor()
    {
        super();

        this.setShaderName(PostProcessMaterial.shaderName);
    }
}