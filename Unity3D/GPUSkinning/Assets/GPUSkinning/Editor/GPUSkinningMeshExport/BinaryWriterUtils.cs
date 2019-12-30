using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text;
using UnityEngine;

public static class BinaryWriterUtils
{

    public static BinaryWriter WriteIntArrayUint32(this BinaryWriter src, int[] list)
    {
        for (int i = 0; i < list.Length; i++)
        {
            src.Write((uint)list[i]);
        }
        return src;
    }

    public static BinaryWriter WriteIntArrayUint16(this BinaryWriter src, int[] list)
    {
        for(int i = 0; i < list.Length; i ++)
        {
            src.Write((ushort)list[i]);
        }
        return src;
    }


    public static BinaryWriter WriteUVVector2(this BinaryWriter src, Vector2 v)
    {
        src.Write(v.x);
        src.Write(1 - v.y);
        return src;
    }

    public static BinaryWriter WriteVector2(this BinaryWriter src, Vector2 v)
    {
        src.Write(v.x);
        src.Write(v.y);
        return src;
    }

    public static BinaryWriter WriteVector3(this BinaryWriter src, Vector3 v, int xm = 1)
    {
        src.Write(v.x * xm);
        src.Write(v.y);
        src.Write(v.z);
        return src;
    }


    public static BinaryWriter WriteVector4(this BinaryWriter src, Vector4 v, int xm = 1)
    {
        src.Write(v.x);
        src.Write(v.y);
        src.Write(v.z);
        src.Write(v.w);
        return src;
    }



    public static BinaryWriter WriteString(this BinaryWriter src, string v)
    {

        byte[] stringBytes = Encoding.UTF8.GetBytes(v);
        src.Write((ushort)v.Length);
        src.Write(stringBytes);
        return src;
    }

    public static BinaryWriter WriteMemoryStream(this BinaryWriter src, MemoryStream v)
    {
        v.Position = 0;
        byte[] bytes = v.GetBuffer();
        src.Write(bytes, 0, (int)v.Length);
        return src;
    }

}
