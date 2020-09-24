import Shader3D = Laya.Shader3D;
import BaseTexture = Laya.BaseTexture;
import ShaderDefine = Laya.ShaderDefine;
import Vector4 = Laya.Vector4;


export class TestBaseMaterial extends Laya.Material
{
    static SHADER_PATH_ROOT = "res/shaders/test/";
    
    // 获取--Shader路径--vs
    static getShaderVS(filename: string)
    {
        return this.SHADER_PATH_ROOT + filename  + ".vs";
    }

    // 获取--Shader路径--ps
    static getShaderPS(filename: string)
    {
        return this.SHADER_PATH_ROOT + filename  + ".fs";
    }

    
    // 获取--Shader路径--glsl
    static getShaderGLSL(filename: string)
    {
        return this.SHADER_PATH_ROOT + filename  + ".glsl";
    }

    
    // 加载Shader
    static async loadShaderGlslAsync(filename: string): Promise<string>
    {
        let code = await this.loadAsync(this.getShaderGLSL(filename), Laya.Loader.TEXT);
        return code.replace(/\r/g, "");
    }
    
    // 加载Shader
    static async loadShaderVSAsync(filename: string): Promise<string>
    {
        let code = await this.loadAsync(this.getShaderVS(filename), Laya.Loader.TEXT);
        return code.replace(/\r/g, "");
    }

    // 加载Shader
    static async loadShaderPSAsync(filename: string): Promise<string>
    {
        let code =  await this.loadAsync(this.getShaderPS(filename), Laya.Loader.TEXT);
        return code.replace(/\r/g, "");
    }

    
    // 加载资源, 异步
    static async loadAsync(path: string, type: string): Promise<any>
    {
        return new Promise<any>((resolve)=>
        {
            Laya.loader.load(path, 
                Laya.Handler.create(null, (res: any) =>
                {
                    resolve(res);
                }), 
                null, type);
         });
    }
    
    __mname:string;


}