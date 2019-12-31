import Mesh = Laya.Mesh;
import SubMesh = Laya.SubMesh;
import Byte = Laya.Byte;
import { GPUSkiningLoadModelV05 } from "./GPUSkiningLoadModelV05";

export class GPUSkiningMeshReader 
{

     static read(data:ArrayBuffer, mesh:Mesh, subMeshes:SubMesh[]):void 
     {
        var readData:Byte = new Byte(data);
        readData.pos = 0;
        var version:string = readData.readUTFString();
        switch (version) 
        {
            case "LAYAMODEL:GPUSkining_05": 
                GPUSkiningLoadModelV05.parse(readData, version, mesh, subMeshes);
                break;
            default: 
                throw new Error("MeshReader: unknown mesh version.");
        }
        mesh._setSubMeshes(subMeshes);
    }
}