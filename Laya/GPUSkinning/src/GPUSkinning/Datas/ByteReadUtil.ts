
import Byte = Laya.Byte;
import Bounds = Laya.Bounds;
import Vector3 = Laya.Vector3;
import Quaternion = Laya.Quaternion;

import Matrix4x4 = Laya.Matrix4x4;
export default class ByteReadUtil
{
    
    
    static ReadQuaternion(b:Byte):Quaternion
    {
        var v = new Quaternion();
        v.x = b.readFloat32();
        v.y = b.readFloat32();
        v.z = b.readFloat32();
        v.w = b.readFloat32();
        return v;
    }
    
    static ReadVector3(b:Byte):Vector3
    {
        var v = new Vector3();
        v.x = b.readFloat32() * -1;
        v.y = b.readFloat32();
        v.z = b.readFloat32();
        return v;
    }

    static ReadBounds(b:Byte):Bounds
    {
        var min = this.ReadVector3(b);
        var max = this.ReadVector3(b);
        var v = new Bounds(min, max);
        return v;
    }

    
    
    static mm = new Matrix4x4(
		-1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0
    );
    
    static ReadMatrix4x4(b:Byte):Matrix4x4
    {
        var m00 = b.readFloat32();
        var m01 = b.readFloat32();
        var m02 = b.readFloat32();
        var m03 = b.readFloat32();

        
        var m10 = b.readFloat32();
        var m11 = b.readFloat32();
        var m12 = b.readFloat32();
        var m13 = b.readFloat32();

        
        var m20 = b.readFloat32();
        var m21 = b.readFloat32();
        var m22 = b.readFloat32();
        var m23 = b.readFloat32();
        
        var m30 = b.readFloat32();
        var m31 = b.readFloat32();
        var m32 = b.readFloat32();
        var m33 = b.readFloat32();
        // var v = new Matrix4x4
        // (
        //     -m00, m01, m02, m03,
        //     -m10, m11, m12, m13,
        //     -m20, m21, m22, m23,
        //     -m30, m31, m32, m33,
        // );

        
        var v2 = new Matrix4x4
        (
            m00, m01, m02, m03,
            m10, m11, m12, m13,
            m20, m21, m22, m23,
            m30, m31, m32, m33,
        );

        var v = new Matrix4x4();

        Matrix4x4.multiply(this.mm, v2, v);

        return v;
    }
}