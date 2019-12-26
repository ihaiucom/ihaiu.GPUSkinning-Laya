import { MBaseMaterial } from "./MBaseMaterial";

export class SimpleMaterial extends MBaseMaterial
{
    
    /** Shader名称 */
    public static shaderName = "SimpleShader";

    public static async install()
    {
        await this.initShader();
    }

    private static async initShader()
    {
        
        var attributeMap:Object = 
        {
            'a_Position': Laya.VertexMesh.MESH_POSITION0, 
            'a_Normal': Laya.VertexMesh.MESH_NORMAL0
        };

        var uniformMap:Object = 
        {
            'u_MvpMatrix': Laya.Shader3D.PERIOD_SPRITE, 
            'u_WorldMat': Laya.Shader3D.PERIOD_SPRITE
        };

        var vs: string = await this.loadShaderVSAsync(this.shaderName);
        var ps: string = await this.loadShaderPSAsync(this.shaderName);

        console.log(vs);
        console.log(ps);

        
        
		var customShader:Laya.Shader3D = Laya.Shader3D.add(this.shaderName);
		var subShader:Laya.SubShader =new Laya.SubShader(attributeMap, uniformMap);
		customShader.addSubShader(subShader);
        subShader.addShaderPass(vs, ps);
        
    }


    
    public static DIFFUSETEXTURE: number =  Laya.Shader3D.propertyNameToID("u_texture");
    public static MARGINALCOLOR: number = Laya.Shader3D.propertyNameToID("u_marginalColor");

    constructor()
    {
        super();
        this.setShaderName(SimpleMaterial.shaderName);
        // this.setShaderName("CustomShader");

    }

    /**
     * 获取漫反射贴图。
     *  漫反射贴图。
     */
    public get diffuseTexture(): Laya.BaseTexture 
    {
        return this._shaderValues.getTexture(SimpleMaterial.DIFFUSETEXTURE);
    }

    /**
     * 设置漫反射贴图。
     * 漫反射贴图。
     */
    public set diffuseTexture(value: Laya.BaseTexture) 
    {
        this._shaderValues.setTexture(SimpleMaterial.DIFFUSETEXTURE,value);
    }

    /**
     * 设置边缘光照颜色。
     * 边缘光照颜色。
     */
    public set marginalColor(value: Laya.Vector3) 
    {
        this._shaderValues.setVector3(SimpleMaterial.MARGINALCOLOR, value);
    }
}