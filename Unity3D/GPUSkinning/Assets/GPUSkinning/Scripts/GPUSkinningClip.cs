using UnityEngine;
using System.Collections;
using System.IO;
using System.Collections.Generic;

[System.Serializable]
public class GPUSkinningClip
{
    public string name = null;

    public float length = 0.0f;

    public int fps = 0;

    public GPUSkinningWrapMode wrapMode = GPUSkinningWrapMode.Once;

    public GPUSkinningFrame[] frames = null;

    public int pixelSegmentation = 0;

    public bool rootMotionEnabled = false;

    public bool individualDifferenceEnabled = false;

    public GPUSkinningAnimEvent[] events = null;


    public static GPUSkinningClip CreateFromBytes(byte[] bytes)
    {
        GPUSkinningClip obj = new GPUSkinningClip();
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
        b.WriteString(name);
        b.Write((float) length);
        b.Write((uint) fps);
        b.Write((int) wrapMode);
        b.Write((uint)pixelSegmentation);
        b.Write((bool)rootMotionEnabled);
        b.Write((bool)individualDifferenceEnabled);


        // 帧列表 数量
        b.Write((uint)frames.Length);
        // 事件列表 数量
        b.Write((uint)events.Length);

        int longSize = sizeof(long);
        long posBegin = stream.Position;
        posBegin += frames.Length * (longSize + longSize);
        posBegin += events.Length * (longSize + longSize);


        // 帧列表 头信息
        List<MemoryStream> frameSteamList = new List<MemoryStream>();
        for (int i = 0; i < frames.Length; i++)
        {
            GPUSkinningFrame item = frames[i];
            MemoryStream itemStream = item.ToSteam();
            frameSteamList.Add(itemStream);
            b.Write((ulong)posBegin);
            b.Write((ulong)itemStream.Length);
            posBegin += itemStream.Length;
        }



        // 事件列表 头信息
        List<MemoryStream> eventSteamList = new List<MemoryStream>();
        for (int i = 0; i < events.Length; i++)
        {
            GPUSkinningAnimEvent item = events[i];
            MemoryStream itemStream = item.ToSteam();
            eventSteamList.Add(itemStream);
            b.Write((ulong)posBegin);
            b.Write((ulong)itemStream.Length);
            posBegin += itemStream.Length;
        }




        // 帧列表 数据块
        for (int i = 0; i < frameSteamList.Count; i++)
        {
            MemoryStream itemStream = frameSteamList[i];
            b.WriteMemoryStream(itemStream);

            itemStream.Close();
            itemStream.Dispose();
        }



        // 事件列表 数据块
        for (int i = 0; i < eventSteamList.Count; i++)
        {
            MemoryStream itemStream = eventSteamList[i];
            b.WriteMemoryStream(itemStream);

            itemStream.Close();
            itemStream.Dispose();
        }



        return stream;
    }
}
