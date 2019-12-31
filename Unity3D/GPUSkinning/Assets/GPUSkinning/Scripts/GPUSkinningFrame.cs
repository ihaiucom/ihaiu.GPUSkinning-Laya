using UnityEngine;
using System.Collections;
using System.IO;

[System.Serializable]
public class GPUSkinningFrame
{
    public Matrix4x4[] matrices = null;

    public Quaternion rootMotionDeltaPositionQ;

    public float rootMotionDeltaPositionL;

    public Quaternion rootMotionDeltaRotation;

    [System.NonSerialized]
    private bool rootMotionInvInit = false;
    [System.NonSerialized]
    private Matrix4x4 rootMotionInv;
    public Matrix4x4 RootMotionInv(int rootBoneIndex)
    {
        if (!rootMotionInvInit)
        {
            rootMotionInv = matrices[rootBoneIndex].inverse;
            rootMotionInvInit = true;
        }
        return rootMotionInv;
    }


    public static GPUSkinningFrame CreateFromBytes(byte[] bytes)
    {
        GPUSkinningFrame obj = new GPUSkinningFrame();
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

        b.Write((float)rootMotionDeltaPositionL);
        b.WriteQuaternion(rootMotionDeltaPositionQ);
        b.WriteQuaternion(rootMotionDeltaRotation);


        // 矩阵列表 数量
        b.Write((uint)matrices.Length);

        for(int i = 0; i < matrices.Length; i ++)
        {
            b.WriteMatrix4x4(matrices[i]);
        }


        return stream;
    }
}
