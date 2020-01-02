using UnityEngine;
using System.Collections;
using System.IO;

[System.Serializable]
public class GPUSkinningBone
{
	[System.NonSerialized]
	public Transform transform = null;

	public Matrix4x4 bindpose;

	public int parentBoneIndex = -1;

	public int[] childrenBonesIndices = null;

	[System.NonSerialized]
	public Matrix4x4 animationMatrix;

	public string name = null;

    public string guid = null; 

    public bool isExposed = false;

    [System.NonSerialized]
    private bool bindposeInvInit = false;
    [System.NonSerialized]
    private Matrix4x4 bindposeInv;
    public Matrix4x4 BindposeInv
    {
        get
        {
            if(!bindposeInvInit)
            {
                bindposeInv = bindpose.inverse;
                bindposeInvInit = true;
            }
            return bindposeInv;
        }
    }


    public static GPUSkinningBone CreateFromBytes(byte[] bytes)
    {
        GPUSkinningBone obj = new GPUSkinningBone();
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
        b.WriteUTFString(name);
        b.WriteUTFString(guid);
        b.Write((bool) isExposed);
        b.Write((int) parentBoneIndex);
        b.WriteMatrix4x4(bindpose);

        return stream;
    }
}
