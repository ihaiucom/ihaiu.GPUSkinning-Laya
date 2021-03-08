import GPUSkiningMesh from "./Mesh/GPUSkiningMesh";

import LoaderManager = Laya.LoaderManager;
import Loader = Laya.Loader;
import Event = Laya.Event;
import Shader3D = Laya.Shader3D;
import GPUSkinningAnimation from "./Datas/GPUSkinningAnimation";
import GPUSkinningPlayerMono from "./GPUSkinningPlayerMono";
import { GPUSkinningBaseMaterial } from "./Material/GPUSkinningBaseMaterial";
import GPUSkinningPlayerMonoManager from "./GPUSkinningPlayerMonoManager";
import GPUSkinningPlayer from "./GPUSkinningPlayer";
import GPUSkinningPlayerResources from "./GPUSkinningPlayerResources";
import GPUSkinningPlayerJoint from "./GPUSkinningPlayerJoint";
import { GPUSkiningLoadModelV05 } from "./Mesh/GPUSkiningLoadModelV05";
import GPUSkiningVertexMesh from "./Mesh/GPUSkiningVertexMesh";
import GPUSkinningClip from "./Datas/GPUSkinningClip";
import LayaExtends_Node from "../LayaExtends/LayaExtends_Node";
import { GPUSkinningCartoon2TextureMaterial } from "./Material/GPUSkinningCartoon2TextureMaterial";
import { GPUSkinningToonV2Material } from "./Material/GPUSkinningToonV2";
import { GPUSkinningToonWeaponV2Material } from "./Material/GPUSkinningToonWeaponV2";
import { JointNames } from "./JointNames";
import { SceneMaterialLightingTexture, SceneMaterialColorBalances } from "./Material/SceneMaterial";

interface IGpuSkinLHUrlInfo
{
  skinName: string;
  animName:string;
}

export default class GPUSkining
{
    static IsPauseAll: boolean = false;
    static EXT_SKING_MESH = "skinlm";

    static async InitAsync()
    {
      
      window['GPUSkining'] = GPUSkining;
      window['GPUSkinningPlayerMonoManager'] = GPUSkinningPlayerMonoManager;
      window['GPUSkinningPlayerMono'] = GPUSkinningPlayerMono;
      window['GPUSkinningPlayerResources'] = GPUSkinningPlayerResources;
      window['GPUSkinningPlayer'] = GPUSkinningPlayer;
      window['GPUSkinningPlayerJoint'] = GPUSkinningPlayerJoint;
      window['GPUSkiningMesh'] = GPUSkiningMesh;
      window['GPUSkiningLoadModelV05'] = GPUSkiningLoadModelV05;
      window['GPUSkiningVertexMesh'] = GPUSkiningVertexMesh;
      window['GPUSkinningBaseMaterial'] = GPUSkinningBaseMaterial;
      window['GPUSkinningCartoon2TextureMaterial'] = GPUSkinningCartoon2TextureMaterial;
      window['GPUSkinningToonV2Material'] = GPUSkinningToonV2Material;
      window['GPUSkinningToonWeaponV2Material'] = GPUSkinningToonWeaponV2Material;
      window['GPUSkinningAnimation'] = GPUSkinningAnimation;
      window['GPUSkinningClip'] = GPUSkinningClip;
      window['SceneMaterialColorBalances'] = SceneMaterialColorBalances;
      window['SceneMaterialLightingTexture'] = SceneMaterialLightingTexture;

      Laya.ClassUtils.regClass("GPUSkinningToonV2Material", GPUSkinningToonV2Material);
      Laya.ClassUtils.regClass("GPUSkinningToonWeaponV2Material", GPUSkinningToonWeaponV2Material);
      
      
      var GPUSkinningIncludegGLSL: string = await GPUSkinningBaseMaterial.loadShaderGlslAsync("GPUSkinningInclude");
      Shader3D.addInclude("GPUSkinningInclude.glsl", GPUSkinningIncludegGLSL);

      // var GPUSkinningIncludegGLSL: string = await GPUSkinningBaseMaterial.loadShaderGlslAsync("GPUSkinningInclude4");
      // Shader3D.addInclude("GPUSkinningInclude4.glsl", GPUSkinningIncludegGLSL);

      GPUSkinningBaseMaterial.__initDefine__();
      // await GPUSkinningUnlitMaterial.install();
      // await GPUSkinningCartoonMaterial.install();
      // await GPUSkinningCartoon2TextureMaterial.install();
      // await GPUSkinningToonMaterial.install();
      await GPUSkinningToonV2Material.install();
      await GPUSkinningToonWeaponV2Material.install();



      LayaExtends_Node.Init();
      // LayaExtends_Texture2D.Init();
      // LayaExtends_Laya3D.Init();

      Laya3D.SKING_MESH = "SKING_MESH";
      Laya3D.SKING_HIERARCHY = "SKING_HIERARCHY";






      var createMap: any = LoaderManager.createMap;
      createMap["skinlm"] = [Laya3D.SKING_MESH, GPUSkiningMesh._parse];
      createMap["skinlh"] = [Laya3D.SKING_HIERARCHY, this._parseHierarchy];

      Laya.Loader.typeMap["skinlh"] = Laya3D.SKING_HIERARCHY;
      
      var parserMap: any = Loader.parserMap;
      parserMap[Laya3D.SKING_MESH] = this._loadMesh.bind(this);

      parserMap[Laya3D.SKING_HIERARCHY] = this._loadHierarchy.bind(this);

        
    }

    public static ToSkinLHUrl(skinName: string, animName:string):string
    {
      return skinName + '&' + animName + ".skinlh";
    }

    
    public static ParseSkinLHUrl(url:string):IGpuSkinLHUrlInfo
    {
      url = url.replace(".skinlh", "");
      var arr = url.split('&');
      return {skinName:arr[0], animName:arr[1]};
    }

    private static _parseHierarchy(data: any): void {
      console.error("_parseHierarchy", data)
    }
    
    private static _loadHierarchy(loader: Loader): void {
      loader._cache = true;
      var urlInfo: IGpuSkinLHUrlInfo = this.ParseSkinLHUrl(loader.url);
			Laya.loader._loaderCount--;
      this.CreateByName(urlInfo.skinName, urlInfo.animName, Laya.Handler.create(null, (res:Laya.MeshSprite3D)=>{
        res && res._setCreateURL(loader.url)
        Laya.loader._loaderCount++;
        Laya3D._endLoad(loader, res);
      }));
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
    


    static resRoot = "res3d/Conventional/";
    static GetAnimName(name: string): string
    {
      return name + ".info.bin";
    }

    static GetMeshName(name: string): string
    {
      return name + ".mesh.bin";
    }
    
    static GetMatrixTextureName(name: string): string
    {
      return name + ".matrix.bin";
    }
    
    static GetMainTextureName(name: string): string
    {
      return `${name}_main.png`;
    }
    
    static GetShadowTextureName(name: string): string
    {
      return `GPUSKinning_${name}_ShadowTexture.png`;
    }
    
    static GetShadowColorTextureName(name: string): string
    {
      return `GPUSKinning_${name}_ShadowColorTexture.png`;
    }

    static GetMaskTextureName(name: string): string
    {
      return `${name}_mask.png`;
    }
    
    static GetHeightRimLightTextureName(name: string): string
    {
      return `GPUSKinning_${name}_HeightRimLightTexture.png`;
    }
    
    static GetMaterailName(name: string): string
    {
      return `${name}.materail.lmat`;
    }

    static GetPath(name: string)
    {
      return this.resRoot + name;
    }

    // static LoadAnimTexture(path: string, width: int, height:int, callback:(  (anim: Laya.Texture2D) => any))
    // {
    //       Laya.loader.load(path, Laya.Handler.create(this, (arrayBuffer:ArrayBuffer | Laya.Texture2D)=>
    //       {
    //         var texture: Laya.Texture2D;
    //         if(arrayBuffer instanceof ArrayBuffer)
    //         {
    //           var f32 = new Float32Array(arrayBuffer);
    //           texture = new Laya.Texture2D(width, height, Laya.TextureFormat.R32G32B32A32, false, false);
    //           texture.wrapModeU = Laya.BaseTexture.WARPMODE_CLAMP;
    //           texture.wrapModeV = Laya.BaseTexture.WARPMODE_CLAMP;
    //           texture.filterMode = Laya.BaseTexture.FILTERMODE_POINT;
    //           texture.anisoLevel = 0;
    //           texture.lock = true;
    //           texture.setSubPixels(0, 0, width, height, f32, 0);
    //           texture._url =  Laya.URL.formatURL(path);


    //           Laya.Loader.clearRes(path);
    //           Laya.Loader.cacheRes(path, texture);
    //         }
    //         else
    //         {
    //           texture = arrayBuffer;
    //         }
            
    //         callback(texture);

    //       }), null, Laya.Loader.BUFFER);

    // }

    
    static LoadAnimTexture(path: string, width: int, height:int, callback:(  (anim: Laya.Texture2D) => any))
    {
          Laya.loader.load(path, Laya.Handler.create(this, (arrayBuffer:ArrayBuffer | Laya.Texture2D)=>
          {
            var texture: Laya.Texture2D;
            if(arrayBuffer instanceof ArrayBuffer)
            {
              var f32 = new Float32Array(arrayBuffer);
              
              var pixelDataArrays:Float32Array = new Float32Array(width*height*4); 
              pixelDataArrays.set(f32,0);
    
              texture = new Laya.Texture2D(width, height, Laya.TextureFormat.R32G32B32A32, false, false);
              texture.wrapModeU = Laya.BaseTexture.WARPMODE_CLAMP;
              texture.wrapModeV = Laya.BaseTexture.WARPMODE_CLAMP;
              texture.filterMode = Laya.BaseTexture.FILTERMODE_POINT;
              texture.anisoLevel = 0;
              texture.lock = true;
              texture.setPixels(pixelDataArrays,0);
              texture._setCreateURL(path);
              // texture._url =  Laya.URL.formatURL(path);

              


              Laya.Loader.clearRes(path);
              Laya.Loader.cacheRes(path, texture);
            }
            else
            {
              texture = arrayBuffer;
            }
            
            callback(texture);

          }), null, Laya.Loader.BUFFER);

    }

    
	static LoadAnimTextureAsync(path: string, width: int, height:int): Promise<any>
	{
		return new  Promise<any>((resolve)=>
		{
        this.LoadAnimTexture(path, width, height, (res: Laya.Texture2D)=>{
          resolve(res);
        });
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
    
	static Load3DAsync(path: string, type?:string): Promise<any>
	{
		return new  Promise<any>((resolve)=>
		{
			Laya.loader.create(path, Laya.Handler.create(this, (data:any)=>
			{
        Laya.timer.frameOnce(1, this, ()=>{

          resolve(data);

        })
			}), null, type);
		});
	}


    static GetLoadItemList(list: {url:string, type:string}[],name: string, hasShadowTexture?: boolean,  mainTexturePath?: string): {url:string, type:string}[]
    {
      var animPath: string = this.GetPath(this.GetAnimName(name));
      var meshPath: string = this.GetPath(this.GetMeshName(name));
      var matrixTexturePath: string = this.GetPath(this.GetMatrixTextureName(name));
      if(mainTexturePath == null || mainTexturePath == "")
      { 
        mainTexturePath = this.GetPath(this.GetMainTextureName(name));
      }


      if(!list)
      {
        list = [];
      }


      list.push(
                {url: animPath, type: Laya.Loader.BUFFER},
                {url: meshPath, type: Laya.Loader.BUFFER},
                {url: matrixTexturePath, type: Laya.Loader.BUFFER},
                {url: mainTexturePath, type: Laya.Loader.TEXTURE2D},
             );
      
      var maskTexturePath = this.GetPath(this.GetMaskTextureName(name));
      list.push({ url: maskTexturePath, type: Laya.Loader.TEXTURE2D });
			
      return list;
    }

    static async CreateByNameAsync(skinName: string, animName:string): Promise<Laya.MeshSprite3D>
    {
      return new Promise<Laya.MeshSprite3D>((resolve)=>
      {
            this.CreateByName(skinName, animName, Laya.Handler.create(this, (res: Laya.MeshSprite3D)=>{
              resolve(res);
            }));
      })
    }


    static CreateByName(skinName: string, animName:string, callback:Laya.Handler)
    {

      var animPath: string = this.GetPath(this.GetAnimName(animName));
      var matrixTexturePath: string = this.GetPath(this.GetMatrixTextureName(animName));
      var meshPath: string = this.GetPath(this.GetMeshName(skinName));
      var materailPath = this.GetPath(this.GetMaterailName(skinName));

      GPUSkinningAnimation.Load(animPath, (anim: GPUSkinningAnimation)=>
      {
            if(anim == null)
            {
              console.error("GPUSkinning.CreateByName资源加载失败", animPath);
              callback.runWith(null);
              return;
            }
            
            GPUSkiningMesh.Load(meshPath, (mesh: GPUSkiningMesh)=>
            {
                  if(mesh == null)
                  {
                    console.error("GPUSkinning.CreateByName资源加载失败", meshPath);
                    callback.runWith(null);
                    return;
                  }

                  this.LoadAnimTexture(matrixTexturePath, anim.textureWidth, anim.textureHeight, (animTexture: Laya.Texture2D)=>
                  {
                      if(animTexture == null)
                      {
                        console.error("GPUSkinning.CreateByName资源加载失败", matrixTexturePath);
                        callback.runWith(null);
                      }
                      


                      Laya.loader.create(materailPath, Laya.Handler.create(this, (material:GPUSkinningToonV2Material)=>
                      {
                        if(material == null)
                        {
                          console.error("GPUSkinning.CreateByName资源加载失败", materailPath);
                          callback.runWith(null);
                          return;
                        }

                        material.GPUSkinning_TextureMatrix = animTexture;
                        material.__mname = skinName + " prefab";
                        material.lock = true;


                        var sprite = new Laya.MeshSprite3D();
                        sprite.name = skinName+"&"+animName;
                        var mono: GPUSkinningPlayerMono = sprite.addComponent(GPUSkinningPlayerMono);
                        mono.skinName = skinName;
                        mono.animName = animName;
                        mono.SetData(anim, mesh, material, animTexture);
                        callback.runWith(sprite);
                        window['sprite'] = sprite;

                      }));

                          
                          
                        

                  });



              
            })


      })


    }


}
window['GPUSkining'] = GPUSkining;
window['SceneMaterial'] = SceneMaterialLightingTexture;
window['JointNames'] = JointNames;