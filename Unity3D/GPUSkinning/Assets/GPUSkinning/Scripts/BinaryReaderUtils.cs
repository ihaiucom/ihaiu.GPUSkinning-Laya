using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text;
using UnityEngine;

public static class BinaryReaderUtils
{




    public static string ReadUTFString(this BinaryReader src)
    {
        int len = (int) src.ReadUInt16();
        byte[] bytes = src.ReadBytes(len);
        string str = Encoding.UTF8.GetString(bytes);
        return str;
    }


    public static Vector3 ReadVector3(this BinaryReader src, int xm = 1)
    {
        Vector3 o = new Vector3();
        o.x = src.ReadSingle() * xm;
        o.y = src.ReadSingle();
        o.z = src.ReadSingle();
        return o;
    }


    public static Bounds ReadBounds(this BinaryReader src, int xm = 1)
    {
        Bounds o = new Bounds();
        Vector3 min = src.ReadVector3(xm);
        Vector3 max = src.ReadVector3(xm);
        o.SetMinMax(min, max);
        return o;
    }

}
