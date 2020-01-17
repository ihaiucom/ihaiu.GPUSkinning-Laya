using System;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;

public class TestLayaCls : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {

    }

    // Update is called once per frame
    void Update()
    {

    }


    [ContextMenu("LayaClsInfo")]
    public void LayaClsInfo()
    {
        Assembly assembly = Assembly.Load("LayaAirLibrary");
        Debug.Log(assembly);
        Type[] types = assembly.GetTypes();
        foreach(Type type in types)
        {
            Debug.Log(type.FullName);
        }



    }
}
