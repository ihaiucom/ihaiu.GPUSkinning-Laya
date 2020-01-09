
import LoaderManager = Laya.LoaderManager;
import Loader = Laya.Loader;
import Event = Laya.Event;
import GPUSkining from "../GPUSkinning/GPUSkining";

export default class LayaExtends_Laya3D
{
    static Init()
    {
        var _Laya3D:any = Laya3D;
        _Laya3D._onMeshLmLoaded__src = _Laya3D._onMeshLmLoaded;
        _Laya3D._onMeshLmLoaded = LayaExtends_Laya3D._onMeshLmLoaded;
    }
    
    private static _onMeshLmLoaded__src(loader: Loader, lmData: ArrayBuffer): void 
    {
    }

    private static _onMeshLmLoaded(loader: Loader, lmData: ArrayBuffer): void 
    {
        var extension:string = Laya.Utils.getFileExtension(loader.url);
        if(extension == GPUSkining.EXT_SKING_MESH)
        {
            GPUSkining._onMeshLmLoaded(loader, lmData);
        }
        else
        {
            (<any>Laya3D)._onMeshLmLoaded__src(loader, lmData);
        }
        
	}
}