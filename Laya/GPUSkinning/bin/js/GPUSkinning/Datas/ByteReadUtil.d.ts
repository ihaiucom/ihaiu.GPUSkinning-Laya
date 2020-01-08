import Byte = Laya.Byte;
import Bounds = Laya.Bounds;
import Vector3 = Laya.Vector3;
import Quaternion = Laya.Quaternion;
import Matrix4x4 = Laya.Matrix4x4;
export default class ByteReadUtil {
    static ReadQuaternion(b: Byte): Quaternion;
    static ReadVector3(b: Byte): Vector3;
    static ReadBounds(b: Byte): Bounds;
    static ReadMatrix4x4(b: Byte): Matrix4x4;
}
