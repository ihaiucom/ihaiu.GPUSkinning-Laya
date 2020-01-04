import GPUSkiningMesh from "./Mesh/GPUSkiningMesh";

import LoaderManager = Laya.LoaderManager;
import Loader = Laya.Loader;
import Event = Laya.Event;
import Shader3D = Laya.Shader3D;
import HalfFloatUtils = Laya.HalfFloatUtils;
import Laya3D_Extend from "./Mesh/Laya3D_Extend";
import GPUSkinningAnimation from "./Datas/GPUSkinningAnimation";
import GPUSkinningPlayerMono from "./GPUSkinningPlayerMono";
import { GPUSkinningBaseMaterial } from "./Material/GPUSkinningBaseMaterial";
import { GPUSkinningUnlitMaterial } from "./Material/GPUSkinningUnlitMaterial";
import LayaExtends_Node from "../LayaExtends/LayaExtends_Node";
import LayaExtends_Texture2D from "../LayaExtends/LayaExtends_Texture2D";
export default class GPUSkining
{
    static EXT_SKING_MESH = "skinlm";

    static async InitAsync()
    {
      
      var GPUSkinningIncludegGLSL: string = await GPUSkinningBaseMaterial.loadShaderGlslAsync("GPUSkinningInclude");
      Shader3D.addInclude("GPUSkinningInclude.glsl", GPUSkinningIncludegGLSL);

      GPUSkinningBaseMaterial.__initDefine__();
      await GPUSkinningUnlitMaterial.install();
      


      LayaExtends_Node.Init();
      LayaExtends_Texture2D.Init();
      Laya3D_Extend.Init();

      Laya3D.SKING_MESH = "SKING_MESH";






      var createMap: any = LoaderManager.createMap;
      createMap["skinlm"] = [Laya3D.SKING_MESH, GPUSkiningMesh._parse];

      
      var parserMap: any = Loader.parserMap;
      parserMap[Laya3D.SKING_MESH] = this._loadMesh;
        
    }

    private static _loadMesh(loader: Loader): void 
    {
      loader.on(Event.LOADED, null, this._onMeshLmLoaded, [loader]);
      loader.load(loader.url, Loader.BUFFER, false, null, true);
    }

    static _onMeshLmLoaded(loader: Loader, lmData: ArrayBuffer): void 
    {
      loader._cache = loader._createCache;
      var mesh: GPUSkiningMesh = GPUSkiningMesh._parse(lmData, loader._propertyParams, loader._constructParams);
      Laya3D._endLoad(loader, mesh);
    }
    


    static resRoot = "res/gpuskining/";
    static GetAnimName(name: string): string
    {
      return `GPUSKinning_Anim_${name}.skinlani`;
    }

    static GetMeshName(name: string): string
    {
      return `GPUSKinning_Mesh_${name}.skinlm`;
    }
    
    static GetTextureName(name: string): string
    {
      return `GPUSKinning_Texture_${name}.bytes`;
    }

    static GetPath(name: string)
    {
      return this.resRoot + name;
    }

    
	static LoadAnimTextureAsync(path: string, width: int, height:int): Promise<any>
	{
    WebGLRenderingContext
		return new  Promise<any>((resolve)=>
		{
			Laya.loader.load(path, Laya.Handler.create(this, (arrayBuffer:ArrayBuffer)=>
			{
        var i8 = new Uint8Array(arrayBuffer);
        // var texture: Laya.Texture2D = new Laya.Texture2D(width, height, Laya.TextureFormat.R8G8B8A8, false, true);
        // texture.setPixels(i8);
        // var i16 = new Uint16Array(arrayBuffer);
        // var count = arrayBuffer.byteLength / 2;
        // var f32 = new Float32Array(count);
        // // var reader = new Laya.Byte(arrayBuffer);
        // for(var i = 0; i < i16.length; i++)
        // {
        //   // f32[i] =  HalfFloatUtils.convertToNumber(reader.getUint16());
        //   i16[i] = 1;
        // }
        

        // var gl = Laya.LayaGL.instance;
        // var ext = gl.getExtension('OES_texture_float');
        // gl.getExtension('EXT_shader_texture_lod');
        var texture: Laya.Texture2D = new Laya.Texture2D(width, height, Laya.TextureFormat.R8G8B8A8, false, true);
        texture.wrapModeU = Laya.BaseTexture.WARPMODE_CLAMP;
        texture.wrapModeV = Laya.BaseTexture.WARPMODE_CLAMP;
        texture.filterMode = Laya.BaseTexture.FILTERMODE_POINT;
        texture.setPixels(<any>i8);
        
        window['animBuffer'] = arrayBuffer;
        window['animTexture'] = texture;
        resolve(texture);

			}), null, Laya.Loader.BUFFER);
		});
	}
    
	static LoadAsync(path: string, type?:string): Promise<any>
	{
		return new  Promise<any>((resolve)=>
		{
			Laya.loader.load(path, Laya.Handler.create(this, (data:any)=>
			{
        resolve(data);

			}), null, type);
		});
	}

    static async CreateByNameAsync(name: string, mainTexturePath: string, materialCls?: any): Promise<GPUSkinningPlayerMono>
    {
      if(!materialCls)
      {
        materialCls = GPUSkinningUnlitMaterial;
      }
      var animPath: string = this.GetPath(this.GetAnimName(name));
      var meshPath: string = this.GetPath(this.GetMeshName(name));
      var texturePath: string = this.GetPath(this.GetTextureName(name));

      var anim = await GPUSkinningAnimation.LoadAsync(animPath);
      // console.log(anim);

      var mesh = await GPUSkiningMesh.LoadAsync(meshPath);
      var mainTexture:Laya.Texture2D = await this.LoadAsync(mainTexturePath, Laya.Loader.TEXTURE2D);
      // console.log(mainTexture);
      // console.log(mesh);
      var animTexture = await this.LoadAnimTextureAsync(texturePath, anim.textureWidth, anim.textureHeight);
      // console.log(animTexture);
      var material:GPUSkinningUnlitMaterial = new materialCls();
      material.albedoTexture = mainTexture;
      material.GPUSkinning_TextureMatrix = animTexture;
      // console.log(material);

      var mat:Laya.UnlitMaterial = window['planemat'];
      mat.albedoTexture = animTexture;

      var sprite = new Laya.MeshSprite3D();
      var mono: GPUSkinningPlayerMono = sprite.addComponent(GPUSkinningPlayerMono);
      mono.SetData(anim, mesh, material, animTexture);
      window['mono'] = mono;
      console.log(mono);
      mono.Player.Play("IDLE");

      return mono;
    }


}