using UnityEngine;
using System.Collections;
using System.IO;
using System.Collections.Generic;

public class GPUSkinningAnimation : ScriptableObject
{
    public string guid = "";

    public string name = null;

    public GPUSkinningBone[] bones = null;

    public int rootBoneIndex = 0;

    public GPUSkinningClip[] clips = null;

    public Bounds bounds;

    public int textureWidth = 0;

    public int textureHeight = 0;

    public float[] lodDistances = null;

    public Mesh[] lodMeshes = null;

    public float sphereRadius = 1.0f;

    public GPUSkinningQuality skinQuality;


    public static GPUSkinningAnimation CreateFromBytes(byte[] bytes)
    {
        GPUSkinningAnimation obj = new GPUSkinningAnimation();
        obj.FromBytes(bytes);
        return obj;
    }

    public void FromBytes(byte[] bytes)
    {
        MemoryStream stream = new MemoryStream(bytes);
        stream.Position = 0;
        Debug.Log(stream.Length);
        BinaryReader b = new BinaryReader(stream);
        guid = b.ReadUTFString();
        name = b.ReadUTFString();
        rootBoneIndex = b.ReadInt16();
        textureWidth = (int) b.ReadUInt32();
        textureHeight = (int) b.ReadUInt32();
        sphereRadius = b.ReadSingle();
        skinQuality = (GPUSkinningQuality)b.ReadInt32();
        bounds = b.ReadBounds();

        // 剪辑列表 数量
        uint clipCount = b.ReadUInt32();
        // 骨骼列表 数量
        uint boneCount = b.ReadUInt32();


        // 剪辑列表 头信息
        List<ulong[]> clipPosLengthList = new List<ulong[]>();
        for(int i = 0; i < clipCount; i ++)
        {
            ulong[] info = new ulong[2];
            info[0] = b.ReadUInt32(); // posBegin
            info[1] = b.ReadUInt32(); // length
            clipPosLengthList.Add(info);
        }


        // 骨骼列表 头信息
        List<ulong[]> bonePosLengthList = new List<ulong[]>();
        for (int i = 0; i < boneCount; i++)
        {
            ulong[] info = new ulong[2];
            info[0] = b.ReadUInt32(); // posBegin
            info[1] = b.ReadUInt32(); // length
            bonePosLengthList.Add(info);
        }

        // 剪辑列表 数据块
        List< GPUSkinningClip > clipList = new List<GPUSkinningClip>();
        for (int i = 0; i < clipCount; i++)
        {
            ulong[] info = clipPosLengthList[i];
            ulong pos = info[0];
            ulong len = info[1];

            stream.Position = (long)pos;
            byte[] itemBytes = b.ReadBytes((int)len);
            stream.Position = (long)pos;



            GPUSkinningClip item = GPUSkinningClip.CreateFromBytes(itemBytes);
            clipList.Add(item);
        }
        clips = clipList.ToArray();


        // 骨骼列表 数据块
        List<GPUSkinningBone> boneList = new List<GPUSkinningBone>();
        for (int i = 0; i < boneCount; i++)
        {
            ulong[] info = bonePosLengthList[i];
            ulong pos = info[0];
            ulong len = info[1];

            stream.Position = (long)pos;
            byte[] itemBytes = b.ReadBytes((int)len);
            GPUSkinningBone item = GPUSkinningBone.CreateFromBytes(itemBytes);
            boneList.Add(item);
        }
        bones = boneList.ToArray();

    }


    public byte[] ToBytes()
    {
        byte[] bytes;
        MemoryStream stream = ToSteam();
        stream.Position = 0;
        bytes = stream.ToArray();
        return bytes;

    }

    public MemoryStream ToSteam()
    {
        MemoryStream stream = new MemoryStream();
        BinaryWriter b = new BinaryWriter(stream);
        b.WriteUTFString(guid);
        b.WriteUTFString(name);
        b.Write((short)rootBoneIndex);
        b.Write((uint)textureWidth);
        b.Write((uint)textureHeight);
        b.Write((float)sphereRadius);
        b.Write((int)skinQuality);
        b.Write((uint)bones.Length);
        b.WriteBounds(bounds);



        int intSize = sizeof(int);

        Dictionary<int, GPUSkinningBone> exportBoneDict = new Dictionary<int, GPUSkinningBone>();
        for (int i = 0; i < bones.Length; i++)
        {
            GPUSkinningBone item = bones[i];
            item.index = i;
            if (item.isExposed)
            {
                exportBoneDict.Add(item.index, item);
            }
        }

        if(exportBoneDict.Count > 0)
        {
            if(exportBoneDict.ContainsKey(rootBoneIndex))
            {
                exportBoneDict.Add(rootBoneIndex, bones[rootBoneIndex]);
            }
        }

        List<int> exportBoneIndexList = new List<int>();
        List<GPUSkinningBone> exportBoneList = new List<GPUSkinningBone>();
        for (int i = 0; i < bones.Length; i++)
        {
            GPUSkinningBone item = bones[i];
            if (exportBoneDict.ContainsKey(item.index))
            {
                exportBoneList.Add(item);
                exportBoneIndexList.Add(item.index);
            }
        }



        // 写入剪辑列表 数量
        b.Write((uint)clips.Length);
        // 写入骨骼列表 数量
        b.Write((uint)exportBoneList.Count);


        long posBegin = stream.Position ;
        posBegin += clips.Length * (intSize + intSize);
        posBegin += exportBoneList.Count * (intSize + intSize);

        // 写入剪辑列表 头信息
        List<MemoryStream> clipSteamList = new List<MemoryStream>();
        for (int i = 0; i < clips.Length; i ++)
        {
            GPUSkinningClip item = clips[i];
            MemoryStream itemStream = item.ToSteam(exportBoneIndexList);
            clipSteamList.Add(itemStream);
            b.Write((uint)posBegin);
            b.Write((uint)itemStream.Length);
            posBegin += itemStream.Length;
        }


        // 写入骨骼列表 头信息
        List<MemoryStream> boneSteamList = new List<MemoryStream>();
        for (int i = 0; i < exportBoneList.Count; i++)
        {
            GPUSkinningBone item = exportBoneList[i];
            MemoryStream itemSteam = item.ToSteam();
            boneSteamList.Add(itemSteam);
            b.Write((uint)posBegin);
            b.Write((uint)itemSteam.Length);
            posBegin += itemSteam.Length;
        }






        // 写入剪辑列表 数据块
        for (int i = 0; i < clipSteamList.Count; i++)
        {

            MemoryStream itemStream = clipSteamList[i];
            b.WriteMemoryStream(itemStream);

            itemStream.Close();
            itemStream.Dispose();
        }


        // 写入骨骼列表 数据块
        for (int i = 0; i < boneSteamList.Count; i++)
        {
            MemoryStream itemStream = boneSteamList[i];
            b.WriteMemoryStream(itemStream);


            itemStream.Close();
            itemStream.Dispose();
        }


        return stream;
    }
}
