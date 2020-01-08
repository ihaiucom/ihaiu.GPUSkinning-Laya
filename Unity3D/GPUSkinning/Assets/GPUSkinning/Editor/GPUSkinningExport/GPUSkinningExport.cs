using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;

public class GPUSkinningExport
{
    public static void StartExportList(GameObject[] prefabList)
    {
        if(prefabList.Length == 0)
        {
            Debug.Log("预设列表是空的 prefabList.Length=" + prefabList.Length);
            return;
        }
        GameObject runGO = GameObject.Find("GPUSkinningExport");
        if(runGO != null)
        {
            if(EditorApplication.isPlaying)
            {
                Debug.Log("有正在运行的列表");
                return;
            }
            else
            {
                GameObject.DestroyImmediate(runGO);
            }
        }

        EditorApplication.isPlaying = true;
        runGO = new GameObject("GPUSkinningExport");
        GPUSkinningExportList manager = runGO.AddComponent<GPUSkinningExportList>();
        manager.StartExport(prefabList, ()=> 
        {
            GameObject.DestroyImmediate(runGO);
            EditorApplication.isPlaying = false;
            Debug.Log("导出完成");
        });

    }
}
