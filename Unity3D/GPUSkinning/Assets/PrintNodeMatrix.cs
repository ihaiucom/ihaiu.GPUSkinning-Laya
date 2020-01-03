using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[ExecuteInEditMode]
public class PrintNodeMatrix : MonoBehaviour
{
    public Matrix4x4 localToWorldMatrix;
    public Matrix4x4 worldToLocalMatrix;
    void Start()
    {
        
    }

    void Update()
    {
        localToWorldMatrix = transform.localToWorldMatrix;
        worldToLocalMatrix = transform.worldToLocalMatrix;
    }
}
