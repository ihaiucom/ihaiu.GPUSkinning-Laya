using System.Collections;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;

public class GPUSkinningExportMenu
{
    [MenuItem("Assets/GPUSkinning ExportMesh", false, 1)]
    public static void ExportMesh()
    {
        Object[] objs = Selection.objects;
        for (int i = 0; i < objs.Length; i++)
        {
            Mesh mesh = (Mesh) objs[i];
            if(mesh is Mesh)
            {
                ExportMesh(mesh);
            }
        }
    }

    public static void ExportMesh(Mesh mesh)
    {
        GPUSkinningMeshExport export = new GPUSkinningMeshExport();
        export.SetMesh(mesh);
        export.Export();
    }
}
