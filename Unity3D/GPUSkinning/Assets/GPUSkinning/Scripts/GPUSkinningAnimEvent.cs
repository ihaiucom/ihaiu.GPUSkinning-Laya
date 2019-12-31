using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

[System.Serializable]
public class GPUSkinningAnimEvent : System.IComparable<GPUSkinningAnimEvent>
{
    public int frameIndex = 0;

    public int eventId = 0;

    public int CompareTo(GPUSkinningAnimEvent other)
    {
        return frameIndex > other.frameIndex ? -1 : 1;
    }


    public static GPUSkinningAnimEvent CreateFromBytes(byte[] bytes)
    {
        GPUSkinningAnimEvent obj = new GPUSkinningAnimEvent();
        obj.FromBytes(bytes);
        return obj;
    }

    public void FromBytes(byte[] bytes)
    {

    }


    public MemoryStream ToSteam()
    {
        MemoryStream stream = new MemoryStream();
        BinaryWriter b = new BinaryWriter(stream);
        b.Write((int) frameIndex);
        b.Write((int) eventId);
        return stream;
    }
}
