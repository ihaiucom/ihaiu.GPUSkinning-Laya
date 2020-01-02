using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text;
using UnityEditor;
using UnityEngine;


namespace Laya
{

    class _Data
    {
        public uint offset = 0;
        public uint size = 0;
    }

    class _BLOCK
    {
        public ushort count = 0;
        public List<uint> blockStarts = new List<uint>();
        public List<uint> blockLengths = new List<uint>();
    }

    enum IndexFormat
    {
        UInt8,
        UInt16,
        UInt32
    }



    public class LayaMeshExport
    {

        public string version = "LAYAMODEL:05";
        private int versionByteLength = 2 + 12;
        public Mesh mesh;

        private _Data _Data = new _Data();
        private _BLOCK _BLOCK = new _BLOCK();
        private List<string> _strings = new List<string>(new string[] { "MESH", "SUBMESH", "GPUSKinning_Mesh_Hero_1001_Dianguanglongqi_Skin1", "POSITION,NORMAL,UV,UV1,TANGENT" });

        private ushort string_index_MESH = 0;
        private ushort string_index_SUBMESH = 1;
        private ushort string_index_Name = 2;
        private ushort string_index_Flag = 3;
        private uint stringsByteLength = 97;

        private uint vertexCount = 6040;
        private uint vertexStride = 48;
        private uint vertexByteLength = 6040 * 48;
        private uint indexByteLength = 0;

        private uint boneCount = 0;
        private List<ushort> boneNameIndexList = new List<ushort>();
        private uint bindPoseDataStart = 0;
        private uint bindPoseDataLength = 0;


        MemoryStream blockMeshBuffer;
        List<MemoryStream> blockSubMeshBufferList = new List<MemoryStream>();

        MemoryStream stringBuffer;
        MemoryStream vertexBuffer;
        MemoryStream indexBuffer;


        private string meshName = "GPUSKinning_Mesh_Hero_1001_Dianguanglongqi_Skin1";

        IndexFormat indexFormat;


        public void SetMesh(Mesh mesh)
        {
            this.mesh = mesh;
        }


        private void GenerateMeshBuff()
        {

            Vector3[] vertices = mesh.vertices;
            Vector3[] normals = mesh.normals;
            Vector4[] tangents = mesh.tangents;
            Color[] colors = mesh.colors;
            Vector2[] uvs = mesh.uv;
            List<Vector4> uvs1 = new List<Vector4>();
            List<Vector4> uvs2 = new List<Vector4>();
            mesh.GetUVs(1, uvs1);
            mesh.GetUVs(2, uvs2);
            int[] triangles = mesh.triangles;
            vertexCount = (uint) mesh.vertexCount;


            // vertexStride = 56
            MemoryStream stream = new MemoryStream();
            BinaryWriter w = new BinaryWriter(stream);
            vertexStride = 0;
            for (int i = 0; i < vertexCount; i ++)
            {
                // 12 = 3 * 4
                Vector3 position = vertices[i];
                vertexStride += 12;

                // 12 = 3 * 4
                Vector3 normal = normals[i];
                vertexStride += 12;

                // 8 = 2 * 4
                Vector2 uv = uvs[i];
                vertexStride += 8;

                // 8 = 2 * 4
                Vector2 uv1 = uvs[i];
                vertexStride += 8;

                // 16 = 4 * 4
                Vector4 tangent = tangents[i];
                vertexStride += 16;

                w.WriteVector3(position, -1);
                w.WriteVector3(normal, -1);
                w.WriteUVVector2(uv);
                w.WriteVector2(uv1);
                w.WriteVector4(tangent, -1);


            }


            vertexByteLength = (uint) stream.Length;
            vertexBuffer = stream;



            stream = new MemoryStream();
            w = new BinaryWriter(stream);

            indexFormat = IndexFormat.UInt16;
            if (vertexCount > 65535)
            {
                indexFormat = IndexFormat.UInt32;
                w.WriteIntArrayUint32(triangles);
            }
            else
            {
                indexFormat = IndexFormat.UInt16;
                w.WriteIntArrayUint16(triangles);
            }


            indexByteLength = (uint)stream.Length;
            indexBuffer = stream;

            for(int i = 0; i < mesh.subMeshCount; i ++)
            {
                uint start = mesh.GetIndexStart(i);
                uint count = mesh.GetIndexCount(i);
            }



            stream = new MemoryStream();
            w = new BinaryWriter(stream);
            stringsByteLength = 0;
            for (int i = 0; i < _strings.Count; i++)
            {
                w.WriteUTFString(_strings[i]);
                stringsByteLength += 2 + (uint)_strings[i].Length;
            }
            stringBuffer = stream;


        }

        private void GenerateBlockMeshInfo()
        {
            MemoryStream stream = new MemoryStream();
            BinaryWriter w = new BinaryWriter(stream);

            // READ_MESH , vertex
            w.Write((ushort)string_index_MESH);
            w.Write((ushort)string_index_Name);

            short vertexBufferCount = 1;
            w.Write((short)vertexBufferCount);
            w.Write((uint)stringsByteLength);
            w.Write((uint)vertexCount);
            w.Write((ushort)string_index_Flag);

            // READ_MESH , index
            w.Write((uint)(stringsByteLength + vertexByteLength));
            w.Write((uint)indexByteLength);




            // READ_MESH , bone
            w.Write((ushort)boneCount);
            for (int i = 0; i < boneCount; i++)
            {
                w.Write((ushort)boneNameIndexList[i]);
            }

            w.Write((uint)bindPoseDataStart);
            w.Write((uint)bindPoseDataLength);

            blockMeshBuffer = stream;
        }

        private void GenerateBlockSubMeshInfo()
        {

            // READ_SUBMESH 
            for (int i = 0; i < mesh.subMeshCount; i++)
            {
                MemoryStream stream = new MemoryStream();
                BinaryWriter w = new BinaryWriter(stream);

                uint subMeshIndexStart = mesh.GetIndexStart(i);
                uint subMeshIndexCount = mesh.GetIndexCount(i);

                w.Write((ushort)string_index_SUBMESH);
                short vbIndex = 0;
                w.Write((short)vbIndex);
                w.Write((uint)subMeshIndexStart);
                w.Write((uint)subMeshIndexCount);


                short drawCount = 1;
                w.Write((short)drawCount);
                for (int j = 0; j < drawCount; j++)
                {
                    w.Write((uint)subMeshIndexStart);
                    w.Write((uint)subMeshIndexCount);

                    uint boneDicofs = 0;
                    uint boneDicCount = 0;
                    w.Write((uint)boneDicofs);
                    w.Write((uint)boneDicCount);
                }

                blockSubMeshBufferList.Add(stream);
            }
        }


        public void Export()
        {
            meshName = mesh.name;
            _strings[string_index_Name] = meshName;



            GenerateMeshBuff();
            GenerateBlockMeshInfo();
            GenerateBlockSubMeshInfo();


            _BLOCK.count = (ushort)(1 + blockSubMeshBufferList.Count);

            int blockMeshBufferLength = (int) blockMeshBuffer.Length;

            int blockSubMeshBufferListByteLength = 0;
            for (int i = 0; i < blockSubMeshBufferList.Count; i++)
            {
                blockSubMeshBufferListByteLength += (int)blockSubMeshBufferList[i].Length;
            }


            versionByteLength = 2 + version.Length;
            int pos_begin_meshInfo = versionByteLength  // 14
                + 4 //(uint)_Data.offset
                + 4 //(uint)_Data.size
                + 2 //(short)_BLOCK.count
                + (_BLOCK.count * (4 + 4)) // 16
                + 4 // _strings.offset
                + 2 // _strings.Count
                ;


            int pos_begin_strings = versionByteLength 
                + 4 //(uint)_Data.offset
                + 4 //(uint)_Data.size
                + 2 //(short)_BLOCK.count
                + (_BLOCK.count * (4 + 4))
                + 4 // _strings.offset
                + 2 // _strings.Count
                + blockMeshBufferLength
                + blockSubMeshBufferListByteLength
                ;



            _Data.offset = (uint)pos_begin_strings;

            Debug.Log("versionByteLength = " + versionByteLength);
            Debug.Log("blockMeshBufferLength = " + blockMeshBufferLength);
            Debug.Log("blockSubMeshBufferListByteLength = " + blockSubMeshBufferListByteLength);
            Debug.Log("pos_begin_meshInfo = " + pos_begin_meshInfo);
            Debug.Log("pos_begin_strings = " + pos_begin_strings);

            _BLOCK.count = (ushort)(1 + blockSubMeshBufferList.Count);
            for(int i = 0; i < _BLOCK.count; i ++)
            {
                _BLOCK.blockStarts.Add(0);
                _BLOCK.blockLengths.Add(0);
            }
            _BLOCK.blockStarts[0] = (uint) pos_begin_meshInfo;
            _BLOCK.blockLengths[0] = (uint)blockMeshBufferLength;
            uint start = _BLOCK.blockStarts[0] + _BLOCK.blockLengths[0];
            for (int i = 0; i < blockSubMeshBufferList.Count; i++)
            {
                _BLOCK.blockStarts[i + 1] = (uint)start;
                _BLOCK.blockLengths[i + 1] = (uint)blockSubMeshBufferList[i].Length;
                start += _BLOCK.blockLengths[i + 1];

            }


            MemoryStream stream = new MemoryStream();
            BinaryWriter w = new BinaryWriter(stream);
            // version
            w.WriteUTFString(version);


            // _Data
            w.Write((uint)_Data.offset);
            w.Write((uint)_Data.size);

            // _BLOCK
            w.Write((short)_BLOCK.count);
            for (int i = 0; i < _BLOCK.count; i ++)
            {
                w.Write(_BLOCK.blockStarts[i]);
                w.Write(_BLOCK.blockLengths[i]);
            }

            // _strings
            uint offset = 0;
            ushort count = (ushort) _strings.Count;
            w.Write((uint)offset);
            w.Write((ushort)count);



            // Mesh Info
            Debug.Log("write Mesh Info pos =" + stream.Position + "   ，blockMeshBuffer.Length=" + blockMeshBuffer.Length);
            w.WriteMemoryStream(blockMeshBuffer);
            Debug.Log("write Mesh Info End pos =" + stream.Position);

            // SubMesh Info List
            for (int i = 0; i < blockSubMeshBufferList.Count; i ++)
            {
                w.WriteMemoryStream(blockSubMeshBufferList[i]);
            }


            Debug.Log("write _string pos =" + stream.Position);
            // string[] _strings
            w.WriteMemoryStream(stringBuffer);
            // bytes vertexBufferData
            w.WriteMemoryStream(vertexBuffer);
            // bytes indexBufferData
            w.WriteMemoryStream(indexBuffer);
            // bytes bindPoseDatas
            // bytes boneIndices


            string dir = AssetDatabase.GetAssetPath(mesh);
            dir = Path.GetDirectoryName(dir);

            //string savedPath = dir + "/" + meshName + ".lm";
            string savedPath = dir + "/GPUSKinning_Mesh_Hero_1001_Dianguanglongqi_Skin1-GPUSKinning_Mesh_Hero_1001_Dianguanglongqi_Skin1.lm";
       
            using (FileStream fileStream = new FileStream(savedPath, FileMode.Create))
            {
                byte[] bytes = stream.GetBuffer();
                fileStream.Write(bytes, 0, (int) stream.Length);
                fileStream.Flush();
                fileStream.Close();
                fileStream.Dispose();
            }



            blockMeshBuffer.Close();
            blockMeshBuffer.Dispose();
            for (int i = 0; i < blockSubMeshBufferList.Count; i++)
            {
                blockSubMeshBufferList[i].Close();
                blockSubMeshBufferList[i].Dispose();
            }

            stringBuffer.Close();
            stringBuffer.Dispose();


            vertexBuffer.Close();
            vertexBuffer.Dispose();



            indexBuffer.Close();
            indexBuffer.Dispose();

            stream.Close();
            stream.Dispose();

        }

   
    }

}