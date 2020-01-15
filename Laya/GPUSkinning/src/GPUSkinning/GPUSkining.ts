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
import LayaExtends_Node from "../LayaExtends/LayaExtends_Node";
import LayaExtends_Texture2D from "../LayaExtends/LayaExtends_Texture2D";
import GPUSkinningPlayerMonoManager from "./GPUSkinningPlayerMonoManager";
import GPUSkinningPlayer from "./GPUSkinningPlayer";
import GPUSkinningPlayerResources from "./GPUSkinningPlayerResources";
import GPUSkinningPlayerJoint from "./GPUSkinningPlayerJoint";
import { GPUSkiningLoadModelV05 } from "./Mesh/GPUSkiningLoadModelV05";
import GPUSkiningVertexMesh from "./Mesh/GPUSkiningVertexMesh";
import GPUSkinningClip from "./Datas/GPUSkinningClip";
import LayaExtends_Laya3D from "../LayaExtends/LayaExtends_Laya3D";
import { GPUSkinningCartoonMaterial } from "./Material/GPUSkinningCartoonMaterial";
export default class GPUSkining
{
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
      
      
      var GPUSkinningIncludegGLSL: string = await GPUSkinningBaseMaterial.loadShaderGlslAsync("GPUSkinningInclude");
      Shader3D.addInclude("GPUSkinningInclude.glsl", GPUSkinningIncludegGLSL);

      // var GPUSkinningIncludegGLSL: string = await GPUSkinningBaseMaterial.loadShaderGlslAsync("GPUSkinningInclude4");
      // Shader3D.addInclude("GPUSkinningInclude4.glsl", GPUSkinningIncludegGLSL);

      GPUSkinningBaseMaterial.__initDefine__();
      await GPUSkinningUnlitMaterial.install();
      await GPUSkinningCartoonMaterial.install();


      LayaExtends_Node.Init();
      LayaExtends_Texture2D.Init();
      LayaExtends_Laya3D.Init();

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
        
        var f32 = new Float32Array(arrayBuffer);
        var texture: Laya.Texture2D = new Laya.Texture2D(width, height, Laya.TextureFormat.R32G32B32A32, false, true);
        texture.wrapModeU = Laya.BaseTexture.WARPMODE_CLAMP;
        texture.wrapModeV = Laya.BaseTexture.WARPMODE_CLAMP;
        texture.filterMode = Laya.BaseTexture.FILTERMODE_POINT;
        texture.anisoLevel = 0;
        texture.lock = true;
        texture.setSubPixels(0, 0, width, height, f32, 0)
        
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

    static async CreateByNameAsync(name: string, mainTexturePath?: string, materialCls?: any): Promise<GPUSkinningPlayerMono>
    {
      if(!materialCls)
      {
        materialCls = GPUSkinningUnlitMaterial;
      }
      var animPath: string = this.GetPath(this.GetAnimName(name));
      var meshPath: string = this.GetPath(this.GetMeshName(name));
      var matrixTexturePath: string = this.GetPath(this.GetMatrixTextureName(name));
      if(mainTexturePath == null || mainTexturePath == "")
      { 
        mainTexturePath = this.GetPath(this.GetMainTextureName(name));
      }
     

      var anim = await GPUSkinningAnimation.LoadAsync(animPath);
      // window['anim'] = anim;
      // console.log(anim);

      if(anim == null)
      {
        console.error("GPUSkinning资源加载失败", name);
        return;
      }

      var mesh = await GPUSkiningMesh.LoadAsync(meshPath);
      var mainTexture:Laya.Texture2D = await this.LoadAsync(mainTexturePath, Laya.Loader.TEXTURE2D);
      // console.log(mainTexture);
      // console.log(mesh);
      var animTexture = await this.LoadAnimTextureAsync(matrixTexturePath, anim.textureWidth, anim.textureHeight);
      // console.log(animTexture);
      var material:GPUSkinningUnlitMaterial = new materialCls();
      material.albedoTexture = mainTexture;
      material.GPUSkinning_TextureMatrix = animTexture;
      // console.log(material);

      // var mat:Laya.UnlitMaterial = window['planemat'];
      // if(mat)mat.albedoTexture = animTexture;

      var sprite = new Laya.MeshSprite3D();
      var mono: GPUSkinningPlayerMono = sprite.addComponent(GPUSkinningPlayerMono);
      mono.SetData(anim, mesh, material, animTexture);
      // window['mono'] = mono;
      // console.log(mono);
      // mono.Player.Play("IDLE");

      return mono;
    }


}
window['GPUSkining'] = GPUSkining;