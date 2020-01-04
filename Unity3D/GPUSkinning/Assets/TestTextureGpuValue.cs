using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[ExecuteInEditMode]
public class TestTextureGpuValue : MonoBehaviour
{
    public float num = 0;
    public float colorValue = 0;
    public float gpuValue = 0;
    void Start()
    {
        
    }

    void Update()
    {
        Test();
    }

    public void Test()
    {
        colorValue = num / 255f;
        gpuValue = colorValue * 255;
    }
}
