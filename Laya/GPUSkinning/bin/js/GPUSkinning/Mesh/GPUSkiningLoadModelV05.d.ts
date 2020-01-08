import Mesh = Laya.Mesh;
import SubMesh = Laya.SubMesh;
import Byte = Laya.Byte;
export declare class GPUSkiningLoadModelV05 {
    private static _BLOCK;
    private static _DATA;
    private static _strings;
    private static _readData;
    private static _version;
    private static _mesh;
    private static _subMeshes;
    static _bindPoseIndices: number[];
    static parse(readData: Byte, version: string, mesh: Mesh, subMeshes: SubMesh[]): void;
    private static _readString;
    private static READ_DATA;
    private static READ_BLOCK;
    private static READ_STRINGS;
    private static READ_MESH;
    private static READ_SUBMESH;
}
