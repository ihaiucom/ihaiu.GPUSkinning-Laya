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
        Test();
    }

    public void Test()
    {
        numBitFlag = num < 0 ? 1 : 0;
        numBitFlag *= 255;
        float n = Mathf.Abs(num);
        numInt = Mathf.FloorToInt(n);
        numFloat = n - numInt;
        numFloat = (int)(numFloat * 100) / 100.0f;

        numMultiple = numInt / 100;
        numInt1 = numInt % 100;

        colorIntMValue = numMultiple / 100.0f / 255f;
        colorInt1Value = numInt1 / 100.0f / 255f;
        colorFloatValue = numFloat / 255f;

        colorIntMValue = Mathf.Clamp01(colorIntMValue);


        numBitIntM = Mathf.FloorToInt(numMultiple / 100f * 255);
        numBitInt1 = Mathf.FloorToInt(numInt1 / 100f * 255);
        numBitFloat = Mathf.FloorToInt(numFloat * 255);



        gpuValue = colorIntMValue * 255 * 100 * 100 + colorInt1Value * 255f * 100f + colorFloatValue * 255f;
        gpuValue *= numBitFlag > 0 ? -1 : 1;

        //gpuValue = colorValue * 255;
    }
}
