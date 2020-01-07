using System;
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

    public short numInt2 = 0;
    public byte[] bytes2;
    public byte[] bytes;
    public byte[] byte3;
    public float byteSort2 = 0;
    public float byteSort = 0;
    public float byteSort3 = 0;

    public  int MulToBit = 100;
    public  float MulToFloat = 0.01f;

    public Vector4 vector4;
    public Color color4;
    public Vector4Int vector4Int;

    public float gpuColorFloat;
    public float gpuVectorFloat;
    public float gpuVectorIntFloat;
    public void Test2()
    {
        FloatBitUtil.MulToBit = MulToBit;
        FloatBitUtil.MulToFloat = MulToFloat;

        numInt2 = (short)(num * 10000);
        bytes2 = BitConverter.GetBytes(numInt2);
        bytes = LittleEndianBitConverter.GetBytes(numInt2);

        byteSort2 = BitConverter.ToInt16(bytes2, 0) * 0.0001f;
        byteSort = LittleEndianBitConverter.ToInt16(bytes, 0) * 0.0001f;


        vector4.x = bytes2[0] / 255f;
        vector4.y = bytes2[1] / 255f;

        //vector4.x = Mathf.RoundToInt(bytes2[0] / 255f * 100) * 0.01f;
        //vector4.y = Mathf.RoundToInt(bytes2[1] / 255f * 100) * 0.01f;
        //vector4.z = Mathf.RoundToInt(bytes2[2] / 255f * 100) * 0.01f;
        //vector4.w = Mathf.RoundToInt(bytes2[3] / 255f * 100) * 0.01f;

        vector4Int.x = Mathf.FloorToInt(vector4.x * 255);
        vector4Int.y = Mathf.FloorToInt(vector4.y * 255);
        //vector4Int.z = Mathf.FloorToInt(vector4.z * 255);
        //vector4Int.w = Mathf.FloorToInt(vector4.w * 255);

        byte3 = new byte[2];
        byte3[0] = (byte)vector4Int.x;
        byte3[1] = (byte)vector4Int.y;
        //byte3[2] = (byte)vector4Int.z;
        //byte3[3] = (byte)vector4Int.w;

        byteSort3 = LittleEndianBitConverter.ToInt16(byte3, 0) * 0.0001f;




        //bytes = BitConverter.GetBytes(num);
        //byteSort = bytes.GetShort(0);

        //vector4 = num.ToVector4();
        //color4 = num.ToColor();
        //vector4Int = num.ToVector4Int();
        //gpuVectorFloat = vector4.ToFloat();
        //gpuColorFloat = color4.ToFloat();
        //gpuVectorIntFloat = vector4Int.ToFloat();



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
