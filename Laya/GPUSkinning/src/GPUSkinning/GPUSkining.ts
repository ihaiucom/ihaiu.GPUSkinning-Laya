import GPUSkiningMesh from "./Mesh/GPUSkiningMesh";

import LoaderManager = Laya.LoaderManager;
import Loader = Laya.Loader;
import Event = Laya.Event;
import Shader3D = Laya.Shader3D;
import HalfFloatUtils = Laya.HalfFloatUtils;
import GPUSkinningAnimation from "./Datas/GPUSkinningAnimation";
import GPUSkinningPlayerMono from "./GPUSkinningPlayerMono";
import { GPUSkinningBaseMaterial } from "./Material/GPUSkinningBaseMaterial";
import { GPUSkinningUnlitMaterial } from "./Material/GPUSkinningUnlitMaterial";
import GPUSkinningPlayerMonoManager from "./GPUSkinningPlayerMonoManager";
import GPUSkinningPlayer from "./GPUSkinningPlayer";
import GPUSkinningPlayerResources from "./GPUSkinningPlayerResources";
import GPUSkinningPlayerJoint from "./GPUSkinningPlayerJoint";
import { GPUSkiningLoadModelV05 } from "./Mesh/GPUSkiningLoadModelV05";
import GPUSkiningVertexMesh from "./Mesh/GPUSkiningVertexMesh";
import GPUSkinningClip from "./Datas/GPUSkinningClip";
import { GPUSkinningCartoonMaterial } from "./Material/GPUSkinningCartoonMaterial";
import LayaExtends_Node from "../LayaExtends/LayaExtends_Node";
import { GPUSkinningCartoon2TextureMaterial } from "./Material/GPUSkinningCartoon2TextureMaterial";
import SceneMaterial from "./Material/SceneMaterial";
// import LayaExtends_Laya3D from "../LayaExtends/LayaExtends_Laya3D";
// import LayaExtends_Texture2D from "../LayaExtends/LayaExtends_Texture2D";
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
      window['GPUSkinningUnlitMaterial'] = GPUSkinningUnlitMaterial;
      window['GPUSkinningAnimation'] = GPUSkinningAnimation;
      window['GPUSkinningClip'] = GPUSkinningClip;
      window['SceneMaterial'] = SceneMaterial;
      
      
      var GPUSkinningIncludegGLSL: string = await GPUSkinningBaseMaterial.loadShaderGlslAsync("GPUSkinningInclude");
      Shader3D.addInclude("GPUSkinningInclude.glsl", GPUSkinningIncludegGLSL);

      // var GPUSkinningIncludegGLSL: string = await GPUSkinningBaseMaterial.loadShaderGlslAsync("GPUSkinningInclude4");
      // Shader3D.addInclude("GPUSkinningInclude4.glsl", GPUSkinningIncludegGLSL);

      GPUSkinningBaseMaterial.__initDefine__();
      // await GPUSkinningUnlitMaterial.install();
      // await GPUSkinningCartoonMaterial.install();
      await GPUSkinningCartoon2TextureMaterial.install();


      LayaExtends_Node.Init();
      // LayaExtends_Texture2D.Init();
      // LayaExtends_Laya3D.Init();

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
    


    static resRoot = "res3d/Conventional/";
    static GetAnimName(name: string): string
    {
      return `GPUSKinning_${name}_Anim.bin`;
    }

    static GetMeshName(name: string): string
    {
      return `GPUSKinning_${name}_Mesh.bin`;
    }
    
    static GetMatrixTextureName(name: string): string
    {
      return `GPUSKinning_${name}_MatrixTexture.bin`;
    }
    
    static GetMainTextureName(name: string): string
    {
      return `GPUSKinning_${name}_MainTexture.png`;
    }
    
    static GetShadowTextureName(name: string): string
    {
      return `GPUSKinning_${name}_ShadowTexture.png`;
    }

    static GetPath(name: string)
    {
      return this.resRoot + name;
    }

    static LoadAnimTexture(path: string, width: int, height:int, callback:(  (anim: Laya.Texture2D) => any))
    {
          Laya.loader.load(path, Laya.Handler.create(this, (arrayBuffer:ArrayBuffer | Laya.Texture2D)=>
          {
            var texture: Laya.Texture2D;
            if(arrayBuffer instanceof ArrayBuffer)
            {
              var f32 = new Float32Array(arrayBuffer);
              texture = new Laya.Texture2D(width, height, Laya.TextureFormat.R32G32B32A32, false, true);
              texture.wrapModeU = Laya.BaseTexture.WARPMODE_CLAMP;
              texture.wrapModeV = Laya.BaseTexture.WARPMODE_CLAMP;
              texture.filterMode = Laya.BaseTexture.FILTERMODE_POINT;
              texture.anisoLevel = 0;
              texture.lock = true;
              texture.setSubPixels(0, 0, width, height, f32, 0);
              texture._url =  Laya.URL.formatURL(path);


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
      if(hasShadowTexture)
      {
          var shadowTexturePath = this.GetPath(this.GetShadowTextureName(name));
          list.push({url: shadowTexturePath, type: Laya.Loader.TEXTURE2D});
      }
      return list;
    }

    static async CreateByNameAsync(name: string, hasShadowTexture?: boolean, materialCls?: any): Promise<GPUSkinningPlayerMono>
    {
      return new Promise<GPUSkinningPlayerMono>((resolve)=>
      {
            this.CreateByName(name, Laya.Handler.create(this, (mono: GPUSkinningPlayerMono)=>{
              resolve(mono);
            }), hasShadowTexture, materialCls);
      })
    }

    static CreateByName(name: string, callback:Laya.Handler, hasShadowTexture?: boolean, materialCls?: any)
    {
      if(!materialCls)
      {
        materialCls = GPUSkinningCartoon2TextureMaterial;
      }
      var animPath: string = this.GetPath(this.GetAnimName(name));
      var meshPath: string = this.GetPath(this.GetMeshName(name));
      var matrixTexturePath: string = this.GetPath(this.GetMatrixTextureName(name));
      var mainTexturePath = this.GetPath(this.GetMainTextureName(name));

      var shadowTexturePath = this.GetPath(this.GetShadowTextureName(name));
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
                      
                      Laya.loader.create(mainTexturePath, Laya.Handler.create(this, (mainTexture:Laya.Texture2D)=>
                      {
                          if(mainTexture == null)
                          {
                            console.error("GPUSkinning.CreateByName资源加载失败", mainTexturePath);
                          }

                          var createFun = (shadowTexture?:Laya.Texture2D)=>
                          {
                            var material:GPUSkinningCartoon2TextureMaterial = new materialCls();
                            material.albedoTexture = mainTexture;
                            material.GPUSkinning_TextureMatrix = animTexture;
                            material.__mname = name + " prefab";
                            if(shadowTexture)
                            {
                              material.shadowTexture = shadowTexture;
                            }
  
                            var sprite = new Laya.MeshSprite3D();
                            var mono: GPUSkinningPlayerMono = sprite.addComponent(GPUSkinningPlayerMono);
                            mono.SetData(anim, mesh, material, animTexture);
                            callback.runWith(mono);
                          }

                          
                          if(hasShadowTexture)
                          {  
                              Laya.loader.create(shadowTexturePath, Laya.Handler.create(this, (shadowTexture:Laya.Texture2D)=>
                              {
                                createFun(shadowTexture);
                                  
                              }), null, Laya.Loader.TEXTURE2D);
                          }
                          else
                          {
                              createFun();
                          }
                         
                          
                        

                      }), null, Laya.Loader.TEXTURE2D);

                  });



              
            })


      })


    }


}
window['GPUSkining'] = GPUSkining;
window['SceneMaterial'] = SceneMaterial;