using System.Collections;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;

public class CustomExportZF : Util.CustomExport
{
    public void EndEachHierarchyExport(string hierarchyPath)
    {
        Debug.LogFormat("EndEachHierarchyExport: {0}",  hierarchyPath);
    }

    public void EndHierarchysExport(string savePath)
    {
        Debug.LogFormat("EndHierarchysExport: {0}", savePath);
    }

    public bool StartEachHierarchyExport(string hierarchyPath)
    {
        Debug.LogFormat("StartEachHierarchyExport: {0}", hierarchyPath);
        return true;
    }

    public void StartHierarchysExport(string savePath)
    {
        Debug.LogFormat("StartHierarchysExport: {0}", savePath);
    }

    [MenuItem("LayaAir3DZF/Get CustomExportZF", false, 1)]
    public static void GetCls()
    {
        Debug.LogFormat("LayaAir3D.customExport: {0}", LayaAir3D.customExport);
    }


    [MenuItem("LayaAir3DZF/Set CustomExportZF", false, 1)]
    public static void SetCls()
    {
        Util.CustomExport obj = new CustomExportZF();

        LayaAir3D.customExport = obj;
    }
}
