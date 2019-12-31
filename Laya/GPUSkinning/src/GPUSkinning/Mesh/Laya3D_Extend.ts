
import LoaderManager = Laya.LoaderManager;
import Loader = Laya.Loader;
import Event = Laya.Event;
import GPUSkining from "../GPUSkining";

export default class Laya3D_Extend
{
    static Init()
    {
        var _Laya3D:any = Laya3D;
        _Laya3D._onMeshLmLoaded__src = _Laya3D._onMeshLmLoaded;
        _Laya3D._onMeshLmLoaded = this._onMeshLmLoaded;
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
            this._onMeshLmLoaded__src(loader, lmData);
        }
        
	}
}