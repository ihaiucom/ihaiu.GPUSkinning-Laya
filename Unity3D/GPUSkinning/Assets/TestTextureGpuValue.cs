using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[ExecuteInEditMode]
public class TestTextureGpuValue : MonoBehaviour
{
    public float num = 0;
    public int numInt = 0;

    public int numMultiple = 1;
    public int numInt1 = 0;
    public float numFloat = 0;

    
    
    public float colorFlagValue = 0;
    public float colorIntMValue = 0;
    public float colorInt1Value = 0;
    public float colorFloatValue = 0;

    public int numBitFlag = 0;
    public int numBitIntM = 0;
    public int numBitInt1 = 0;
    public int numBitFloat = 0;

    public float gpuValue = 0;
    void Start()
    {
        
    }

    void Update()
    {
        //Test();
        Test2();
    }

    public Vector4 vector4;
    public Color color4;
    public Vector4Int vector4Int;

    public float gpuColorFloat;
    public float gpuVectorFloat;
    public void Test2()
    {
        vector4 = num.ToVector4();
        color4 = num.ToColor();
        vector4Int = num.ToVector4Int();
        gpuVectorFloat = vector4.ToFloat();
        gpuColorFloat = color4.ToFloat();



    }

    public void Test()
    {
        colorFlagValue = num >= 0 ? 2 : 0;
        colorFlagValue = colorFlagValue * 0.1f;

        float n = Mathf.Abs(num);
        numInt = Mathf.FloorToInt(n);
        numFloat = n - numInt;
        numFloat = (int)( numFloat * 100 ) / 100.0f;

        numMultiple = numInt / 100;
        numInt1 = numInt % 100;

        colorIntMValue = numMultiple / 100.0f;
        colorInt1Value = numInt1 / 100.0f;
        colorFloatValue = numFloat;

        colorIntMValue = Mathf.Clamp01(colorIntMValue);


        numBitFlag =  Mathf.FloorToInt(colorFlagValue * 255);
        numBitIntM = Mathf.FloorToInt(numMultiple/ 100f * 255);
        numBitInt1 = Mathf.FloorToInt(numInt1/ 100f * 255);
        numBitFloat = Mathf.FloorToInt(numFloat * 255);


        

        gpuValue = colorIntMValue * 100 * 100 + colorInt1Value * 100f + colorFloatValue;
        gpuValue *= colorFlagValue * 10 - 1;

        //gpuValue = colorValue * 255;
    }
}
