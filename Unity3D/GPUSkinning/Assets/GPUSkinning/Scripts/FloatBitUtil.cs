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

    public static float ToFloat(this Vector4 c)
    {
        return (c.x * 10000 + c.y * 100 + c.z) * (c.w * 10 - 1);
    }

    public static float ToFloat(this Color c)
    {
        return (c.r * 10000 + c.g * 100 + c.b) * (c.a * 10 - 1);
    }

    public static Color ToColor(this float value)
    {
        value *= 100;
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

        return c;
    }

    
    public static Vector4 ToVector4(this float value)
    {
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

        return c;
    }


    public static Vector4Int ToVector4Int(this float value)
    {
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
