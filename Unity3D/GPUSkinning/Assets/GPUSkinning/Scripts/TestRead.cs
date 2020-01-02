using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TestRead : MonoBehaviour
{
    public TextAsset textAsset;
    public GPUSkinningAnimation anim;

    [ContextMenu("Read")]
    public void Read()
    {

        byte[] bytes = textAsset.bytes;
        Debug.Log(bytes.Length);
        Debug.Log(bytes[0]);
        Debug.Log(bytes[1]);
        anim = GPUSkinningAnimation.CreateFromBytes(bytes);

    }
}
