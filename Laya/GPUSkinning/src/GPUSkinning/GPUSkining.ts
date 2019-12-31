import GPUSkiningMesh from "./Mesh/GPUSkiningMesh";

import LoaderManager = Laya.LoaderManager;
import Loader = Laya.Loader;
import Event = Laya.Event;
import Laya3D_Extend from "./Mesh/Laya3D_Extend";
import GPUSkinningAnimation from "./Datas/GPUSkinningAnimation";
import GPUSkinningPlayerMono from "./GPUSkinningPlayerMono";
import { GPUSkinningBaseMaterial } from "./Material/GPUSkinningBaseMaterial";
import { GPUSkinningUnlitMaterial } from "./Material/GPUSkinningUnlitMaterial";
export default class GPUSkining
{
    static EXT_SKING_MESH = "skinlm";

    static Init()
    {
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
      return null;

      var mesh = await GPUSkiningMesh.LoadAsync(meshPath);
      var animTexture = await this.LoadAsync(texturePath, Laya.Loader.TEXTURE2D);
      var mainTexture = await this.LoadAsync(mainTexturePath, Laya.Loader.TEXTURE2D);
      var material:GPUSkinningUnlitMaterial = new materialCls();
      material.albedoTexture = mainTexture;

      var sprite = new Laya.MeshSprite3D();
      var mono: GPUSkinningPlayerMono = sprite.addComponent(GPUSkinningPlayerMono);
      mono.SetData(anim, mesh, material, animTexture);

      return mono;
    }


}