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

        
        var boundsMin:Laya.Vector3;
        var boundsMax:Laya.Vector3;
		if(version == "LAYAMODEL:GPUSkining_06")
		{
			boundsMin = new Laya.Vector3();
			boundsMax = new Laya.Vector3();

			boundsMin.x = readData.readFloat32();
			boundsMin.y = readData.readFloat32();
			boundsMin.z = readData.readFloat32();

			
			boundsMax.x = readData.readFloat32();
			boundsMax.y = readData.readFloat32();
			boundsMax.z = readData.readFloat32();
        }

        
        switch (version) 
        {
            case "LAYAMODEL:GPUSkining_05": 
            case "LAYAMODEL:GPUSkining_06": 
                GPUSkiningLoadModelV05.parse(readData, version, mesh, subMeshes);
                break;
            default: 
                throw new Error("MeshReader: unknown mesh version.");
        }

        if(version == "LAYAMODEL:GPUSkining_06")
		{
            mesh._needUpdateBounds = false;
            mesh.bounds.setMin(boundsMin);
            mesh.bounds.setMin(boundsMax);
        }
        mesh._setSubMeshes(subMeshes);
    }
}