import { GPUSkiningMeshReader } from "./GPUSkiningMeshReader";

export default class GPUSkiningMesh extends Laya.Mesh
{
    static _parse(data: any, propertyParams: any = null, constructParams: any[] = null): GPUSkiningMesh 
    {
		var mesh: GPUSkiningMesh = new GPUSkiningMesh();
		GPUSkiningMeshReader.read(<ArrayBuffer>data, mesh, mesh._subMeshes);
		return mesh;
	}

	static LoadAsync(path: string): Promise<GPUSkiningMesh>
	{
		return new  Promise<GPUSkiningMesh>((resolve)=>
		{
			Laya.loader.load(path, Laya.Handler.create(this, (data:any)=>
			{
				if(data instanceof ArrayBuffer)
				{
					var mesh = GPUSkiningMesh._parse(data);
					resolve(mesh);
				}
				else
				{
					resolve(data);
				}

			}), null, Laya.Loader.BUFFER);
		});
	}
}