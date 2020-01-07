using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
[Serializable]
public struct Vector4Int
{
    public int x;
    public int y;
    public int z;
    public int w;

}

public static class FloatBitUtil
{
    public static int MulToBit = 1;
    public static float MulToFloat = 1f;

    public static float ToFloat(this Vector4Int c)
    {
        return (c.x / 255f * 10000 + c.y / 255f * 100 + c.z / 255f) * (c.w / 255f * 10 - 1) * MulToFloat;
    }

    public static float ToFloat(this Vector4 c)
    {
        return (c.x * 10000 + c.y * 100 + c.z) * (c.w * 10 - 1) * MulToFloat;
    }

    public static float ToFloat(this Color c)
    {
        return (c.r * 10000 + c.g * 100 + c.b) * (c.a * 10 - 1) * MulToFloat;
    }

    public static short GetShort(this byte[] arr, int index)
    {
        return (short)(0xff00 & arr[index] << 8 | (0xff & arr[index + 1]));
    }





    public static Color ToColor(this float value)
    {
        value *= MulToBit;
        int flag = value >= 0 ? 2 : 0;
        float num = Mathf.Abs(value);
        int numInt = Mathf.FloorToInt(num);
        float numFloat = num - numInt;

        int numM = numInt / 100;
        int num1 = numInt % 100;



        Color c = new Color();
        c.r = numM * 0.01f;
        c.g = num1 * 0.01f;
        c.b = numFloat;
        c.a = flag * 0.1f;


        c.r = Mathf.RoundToInt(c.r * 100) * 0.01f;
        c.g = Mathf.RoundToInt(c.g * 100) * 0.01f;
        c.b = Mathf.RoundToInt(c.b * 100) * 0.01f;
        c.a = Mathf.RoundToInt(c.a * 100) * 0.01f;

        c.r = Mathf.Clamp01(c.r);
        c.g = Mathf.Clamp01(c.g);
        c.b = Mathf.Clamp01(c.b);
        c.a = Mathf.Clamp01(c.a);

        return c;
    }

    public static float ToFloat2(this Color c)
    {
        return (c.r * 100 + c.g  + c.b * 0.01f) * (c.a * 10 - 1) ;
    }

    public static Color ToColor2(this float value)
    {
        //value *= MulToBit;
        int flag = value >= 0 ? 2 : 0;
        float num = Mathf.Abs(value);
        int numInt = Mathf.FloorToInt(num);
        float numFloat = num - numInt;

        float f = numFloat * 100;
        int numFloatInt = Mathf.FloorToInt(f);
        float numFloat2 = f - numFloatInt;

        int numM = numInt / 100;
        int num1 = numInt % 100;



        Color c = new Color();
        c.r = num1 * 0.01f;
        c.g = numFloat;
        c.b = numFloat2;
        c.a = flag * 0.1f;


        //c.r = Mathf.RoundToInt(c.r * 100) * 0.01f;
        //c.g = Mathf.RoundToInt(c.g * 100) * 0.01f;
        //c.b = Mathf.RoundToInt(c.b * 100) * 0.01f;
        //c.a = Mathf.RoundToInt(c.a * 100) * 0.01f;

        //c.r = Mathf.Clamp01(c.r);
        //c.g = Mathf.Clamp01(c.g);
        //c.b = Mathf.Clamp01(c.b);
        //c.a = Mathf.Clamp01(c.a);

        return c;
    }

    
    public static Vector4 ToVector4(this float value)
    {
        value *= MulToBit;
        int flag = value >= 0 ? 2 : 0;
        float num = Mathf.Abs(value);
        int numInt = Mathf.FloorToInt(num);
        float numFloat = num - numInt;

        int numM = numInt / 100;
        int num1 = numInt % 100;



        Vector4 c = new Vector4();
        c.x = numM * 0.01f;
        c.y = num1 * 0.01f;
        c.z = numFloat;
        c.w = flag * 0.1f;

        c.x = Mathf.RoundToInt(c.x * 100) * 0.01f;
        c.y = Mathf.RoundToInt(c.y * 100) * 0.01f;
        c.z = Mathf.RoundToInt(c.z * 100) * 0.01f;
        c.w = Mathf.RoundToInt(c.w * 100) * 0.01f;

        c.x = Mathf.Clamp01(c.x);
        c.y = Mathf.Clamp01(c.y);
        c.z = Mathf.Clamp01(c.z);
        c.w = Mathf.Clamp01(c.w);

        return c;
    }



    public static Vector4Int ToVector4Int(this float value)
    {
        value *= MulToBit;
        int flag = value >= 0 ? 2 : 0;
        float num = Mathf.Abs(value);
        int numInt = Mathf.FloorToInt(num);
        float numFloat = num - numInt;

        int numM = numInt / 100;
        int num1 = numInt % 100;



        Vector4Int c = new Vector4Int();
        c.x = Mathf.FloorToInt(numM * 0.01f * 255);
        c.y = Mathf.FloorToInt(num1 * 0.01f * 255);
        c.z = Mathf.FloorToInt(numFloat * 255);
        c.w = Mathf.FloorToInt(flag * 0.1f * 255);

        c.x = Mathf.Clamp(c.x, 0, 255);
        c.y = Mathf.Clamp(c.y, 0, 255);
        c.z = Mathf.Clamp(c.z, 0, 255);
        c.w = Mathf.Clamp(c.w, 0, 255);

        return c;
    }

    public static void CalculateTextureSize(int numPixels, out int texWidth, out int texHeight)
    {
        texWidth = 1;
        texHeight = 1;
        while (true)
        {
            if (texWidth * texHeight >= numPixels) break;
            texWidth *= 2;
            if (texWidth * texHeight >= numPixels) break;
            texHeight *= 2;
        }
    }

}
