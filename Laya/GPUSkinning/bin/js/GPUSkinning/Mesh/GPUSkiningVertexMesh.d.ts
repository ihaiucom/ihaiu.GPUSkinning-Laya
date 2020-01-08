import VertexMesh = Laya.VertexMesh;
import VertexDeclaration = Laya.VertexDeclaration;
export default class GPUSkiningVertexMesh extends VertexMesh {
    static MESH_TEXTURECOORDINATE2: number;
    private static _declarationMap;
    static getVertexDeclaration(vertexFlag: string, compatible?: boolean): VertexDeclaration;
}
