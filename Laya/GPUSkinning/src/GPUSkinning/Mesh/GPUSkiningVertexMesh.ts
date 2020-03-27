import VertexMesh = Laya.VertexMesh;
import VertexDeclaration = Laya.VertexDeclaration;
import VertexElement = Laya.VertexElement;
import VertexElementFormat = Laya.VertexElementFormat;


export default class GPUSkiningVertexMesh extends VertexMesh
{
    
	static MESH_TEXTURECOORDINATE2: number = 6;
	private static _declarationMap: any = {};

    /**
	 * 获取顶点声明。
	 * @param vertexFlag 顶点声明标记字符,格式为:"POSITION,NORMAL,COLOR,UV,UV1,UV2,BLENDWEIGHT,BLENDINDICES,TANGENT"。
	 * @return 顶点声明。
	 */
	static getVertexDeclaration(vertexFlag: string, compatible: boolean = true): VertexDeclaration {
		var verDec: VertexDeclaration = this._declarationMap[vertexFlag + (compatible ? "_0" : "_1")];//TODO:兼容模式
		if (!verDec) {
			var subFlags: any[] = vertexFlag.split(",");
			var offset: number = 0;
			var elements: any[] = [];
			for (var i: number = 0, n: number = subFlags.length; i < n; i++) {
				var element: VertexElement;
				switch (subFlags[i]) {
					case "POSITION":
						element = new VertexElement(offset, VertexElementFormat.Vector3, this.MESH_POSITION0);
						offset += 12;
						break;
					case "NORMAL":
						element = new VertexElement(offset, VertexElementFormat.Vector3, this.MESH_NORMAL0);
						offset += 12;
						break;
					case "COLOR":
						element = new VertexElement(offset, VertexElementFormat.Vector4, this.MESH_COLOR0);
						offset += 16;
						break;
					case "UV":
						element = new VertexElement(offset, VertexElementFormat.Vector2, this.MESH_TEXTURECOORDINATE0);
						offset += 8;
						break;
					case "UV1":
						element = new VertexElement(offset, VertexElementFormat.Vector4, this.MESH_TEXTURECOORDINATE1);
						offset += 16;
						break;
                    case "UV2":
                        element = new VertexElement(offset, VertexElementFormat.Vector4, this.MESH_TEXTURECOORDINATE2);
						offset += 16;
                        break;
					case "BLENDWEIGHT":
						element = new VertexElement(offset, VertexElementFormat.Vector4, this.MESH_BLENDWEIGHT0);
						offset += 16;
						break;
					case "BLENDINDICES":
						if (compatible) {
							element = new VertexElement(offset, VertexElementFormat.Vector4, this.MESH_BLENDINDICES0);//兼容
							offset += 16;
						} else {
							element = new VertexElement(offset, VertexElementFormat.Byte4, this.MESH_BLENDINDICES0);
							offset += 4;
						}
						break;
					case "TANGENT":
						element = new VertexElement(offset, VertexElementFormat.Vector4, this.MESH_TANGENT0);
						offset += 16;
						console.log("TANGENT", element)
						break;
					default:
						throw "VertexMesh: unknown vertex flag.";
				}
				elements.push(element);
			}
			verDec = new VertexDeclaration(offset, elements);
			this._declarationMap[vertexFlag + (compatible ? "_0" : "_1")] = verDec;//TODO:兼容模式
		}
		return verDec;
	}
}