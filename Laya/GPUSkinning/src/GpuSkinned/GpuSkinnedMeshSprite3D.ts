import RenderableSprite3D = Laya.RenderableSprite3D;
import MeshFilter = Laya.MeshFilter;
import MeshSprite3D = Laya.MeshSprite3D;
import Node = Laya.Node;
import { GpuSkinnedMeshRenderer } from "./GpuSkinnedMeshRenderer";

export class GpuSkinnedMeshSprite3D extends MeshSprite3D
{

	_parse(data: any, spriteMap: any): void {
        super._parse(data, spriteMap);       
    }

    _cloneTo(destObject: any, rootSprite: Node, dstSprite: Node): void{
        super._cloneTo(destObject, rootSprite, dstSprite);
    }

    destroy(destroyChild: boolean = true): void {
        super.destroy(destroyChild);
    }

    protected _create(): Node {
		return new GpuSkinnedMeshSprite3D();
	}
}