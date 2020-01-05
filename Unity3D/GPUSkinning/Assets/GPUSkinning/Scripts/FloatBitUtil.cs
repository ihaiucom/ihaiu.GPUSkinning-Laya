using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public static class FloatBitUtil
{
    public struct Vector4Int
    {
        public int x;
        public int y;
        public int z;
        public int w;

    }

    public static Color ToColor(this float value)
    {
        int flag = value < 0 ? 1 : 0;
        float num = Mathf.Abs(value);
        int numInt = Mathf.FloorToInt(num);
        float numFloat = num - numInt;

        int numM = numInt / 100;
        int num1 = numInt % 100;



        Color c = new Color();
        c.r = numM / 100f / 255F;
        c.g = num1 / 100f / 255F;
        c.b = numFloat;
        c.a = flag;

        return c;
    }


    public static Vector4Int ToBit(this float value)
    {
        int flag = value < 0 ? 1 : 0;
        float num = Mathf.Abs(value);
        int numInt = Mathf.FloorToInt(num);
        float numFloat = num - numInt;

        int numM = numInt / 100;
        int num1 = numInt % 100;



        Vector4Int c = new Vector4Int();
        c.x = Mathf.FloorToInt(numM / 100f * 255);
        c.y = Mathf.FloorToInt(num1 / 100f * 255);
        c.z = Mathf.FloorToInt(numFloat * 255);
        c.w = flag * 255;

        return c;
    }

}
