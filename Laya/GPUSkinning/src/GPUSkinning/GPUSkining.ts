import GPUSkiningMesh from "./Mesh/GPUSkiningMesh";

import LoaderManager = Laya.LoaderManager;
import Loader = Laya.Loader;
import Event = Laya.Event;
import Shader3D = Laya.Shader3D;
import Laya3D_Extend from "./Mesh/Laya3D_Extend";
import GPUSkinningAnimation from "./Datas/GPUSkinningAnimation";
import GPUSkinningPlayerMono from "./GPUSkinningPlayerMono";
import { GPUSkinningBaseMaterial } from "./Material/GPUSkinningBaseMaterial";
import { GPUSkinningUnlitMaterial } from "./Material/GPUSkinningUnlitMaterial";
import LayaExtends_Node from "../LayaExtends/LayaExtends_Node";
export default class GPUSkining
{
    static EXT_SKING_MESH = "skinlm";

    static async InitAsync()
    {
      
      var GPUSkinningIncludegGLSL: string = await GPUSkinningBaseMaterial.loadShaderGlslAsync("GPUSkinningInclude");
      Shader3D.addInclude("GPUSkinningInclude.glsl", GPUSkinningIncludegGLSL);
      await GPUSkinningUnlitMaterial.install();
      


      LayaExtends_Node.Init();
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
		return new  Promise<any>((resolve)=>
		{
			Laya.loader.load(path, Laya.Handler.create(this, (arrayBuffer:ArrayBuffer)=>
			{
        var imageData = new Uint8Array(arrayBuffer);
        var texture: Laya.Texture2D = new Laya.Texture2D(width, height, Laya.TextureFormat.R32G32B32A32, false, true);
        texture.setPixels(imageData);
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
      console.log(anim);

      var mesh = await GPUSkiningMesh.LoadAsync(meshPath);
      console.log(mesh);
      var animTexture = await this.LoadAnimTextureAsync(texturePath, anim.textureWidth, anim.textureHeight);
      console.log(animTexture);
      var mainTexture = await this.LoadAsync(mainTexturePath, Laya.Loader.TEXTURE2D);
      console.log(mainTexture);
      var material:GPUSkinningUnlitMaterial = new materialCls();
      material.albedoTexture = mainTexture;
      console.log(material);

      var sprite = new Laya.MeshSprite3D();
      var mono: GPUSkinningPlayerMono = sprite.addComponent(GPUSkinningPlayerMono);
      mono.SetData(anim, mesh, material, animTexture);
      window['mono'] = mono;
      console.log(mono);

      return mono;
    }


}