import { MBaseMaterial } from "./MBaseMaterial";
import Shader3D = Laya.Shader3D;
import SubShader = Laya.SubShader;
import VertexMesh = Laya.VertexMesh;
import ShaderDefine = Laya.ShaderDefine;
import BaseMaterial = Laya.BaseMaterial;
import RenderState  = Laya.RenderState;
import Scene3DShaderDeclaration = Laya.Scene3DShaderDeclaration;

export default class BloomEffectMaterial extends MBaseMaterial
{
    /** Shader名称 */
    public static shaderName = "BloomEffectShader";

    public static defaultMaterial:BloomEffectMaterial;

    public static __initDefine__() {
        
    }

    public static async install()
    {
        this.__initDefine__();
        await this.initShader();

        this.defaultMaterial = new BloomEffectMaterial();
        this.defaultMaterial.lock = true;
    }

    private static async initShader()
    {
        var vs: string = await this.loadShaderVSAsync(this.shaderName);
        var ps: string = await this.loadShaderPSAsync(this.shaderName);
        

        var attributeMap: object;
        var uniformMap: object;
        var shader:Shader3D;
        var subShader:SubShader;

        attributeMap = 
        {
            'a_PositionTexcoord': VertexMesh.MESH_POSITION0
		};

        uniformMap = 
        {
            'u_MainTex': Shader3D.PERIOD_MATERIAL,
            // highlight
            'u_colorThreshold':Shader3D.PERIOD_MATERIAL,

            // gaussianblur
            'u_gaussianOffset':Shader3D.PERIOD_MATERIAL,
            'u_mainTexelSize':Shader3D.PERIOD_MATERIAL,

            // bloom
            'u_bloomColor':Shader3D.PERIOD_MATERIAL,
            'u_bloomFactor':Shader3D.PERIOD_MATERIAL
		};

        

        
        shader = Shader3D.add(this.shaderName, null, null, true);
        subShader =  new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);

        var mainPass    = subShader.addShaderPass(vs, ps);
        var renderState = mainPass.renderState;
        renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
        renderState.depthWrite = false;
        renderState.cull = RenderState.CULL_NONE;
        renderState.blend = RenderState.BLEND_DISABLE;
    }

    //---------------TODO------------GJC
    /** 高亮阈值 */
    static COLOR_THRESHOLD:number = Shader3D.propertyNameToID("u_colorThreshold");
    /** 高斯偏移 */
    static GAUSSIAN_OFFSET:number = Shader3D.propertyNameToID("u_gaussianOffset");
    /** 纹理分辨率 */
    static MAINTEXEL_SIZE:number = Shader3D.propertyNameToID("u_mainTexelSize");
    /** Bloom泛光颜色 */
    static BLOOM_COLOR:number = Shader3D.propertyNameToID("u_bloomColor");
    /** Bloom权值 */
    static BLOOM_FACTOR:number = Shader3D.propertyNameToID("u_bloomFactor");

    constructor()
    {
        super();

        this.setShaderName(BloomEffectMaterial.shaderName);

        var sv = this._shaderValues;
        // 高亮阈值
        sv.setVector(BloomEffectMaterial.COLOR_THRESHOLD, new Vector4(1.0, 1.0, 1.0, 1.0));
        // 高斯偏移
        sv.setVector(BloomEffectMaterial.GAUSSIAN_OFFSET, new Vector4(0.0, 0.0, 0.0, 0.0));
        // Bloom泛光颜色
        sv.setVector(BloomEffectMaterial.BLOOM_COLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
        // Bloom权值
        sv.setNumber(BloomEffectMaterial.BLOOM_FACTOR, 1.0);
    }

    /** 高亮阈值 */
    get colorThreshold() {
        return this._shaderValues.getVector(BloomEffectMaterial.COLOR_THRESHOLD);
    }
    set colorThreshold(value) {
        this._shaderValues.setVector(BloomEffectMaterial.COLOR_THRESHOLD, value);
    }
    /** 高斯偏移 */
    get gaussianOffset() {
        return this._shaderValues.getVector(BloomEffectMaterial.GAUSSIAN_OFFSET);
    }
    set gaussianOffset(value) {
        this._shaderValues.setVector(BloomEffectMaterial.GAUSSIAN_OFFSET, value);
    }
    /** 纹理分辨率 */
    get mainTexelSize() {
        return this._shaderValues.getVector(BloomEffectMaterial.MAINTEXEL_SIZE);
    }
    set mainTexelSize(value) {
        this._shaderValues.setVector(BloomEffectMaterial.MAINTEXEL_SIZE, value);
    }
    /** Bloom泛光颜色 */
    get bloomColor() {
        return this._shaderValues.getVector(BloomEffectMaterial.BLOOM_COLOR);
    }
    set bloomColor(value) {
        this._shaderValues.setVector(BloomEffectMaterial.BLOOM_COLOR, value);
    }
    /** Bloom权值 */
    get bloomFactor() {
        return this._shaderValues.getNumber(BloomEffectMaterial.BLOOM_FACTOR);
    }
    set bloomFactor(value) {
        this._shaderValues.setNumber(BloomEffectMaterial.BLOOM_FACTOR, value);
    }
}