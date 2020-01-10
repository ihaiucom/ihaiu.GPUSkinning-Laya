using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

public class GPUSkinningExportList : MonoBehaviour
{

#if UNITY_EDITOR
    private Action onComplete;
    public GameObject[] prefabList;
    public string exportDir = "Assets/GameResources/GPUSkinning";

    public int index = 0;
    public bool runing = false;
    public void StartExport(GameObject[] prefabList, Action onComplete)
    {
        if(!Directory.Exists(exportDir))
        {
            Directory.CreateDirectory(exportDir);
        }

        exportDir = Path.GetFullPath(exportDir);


        this.prefabList = prefabList;
        this.onComplete = onComplete;
        index = 0;
        runing = true;
        Debug.Log("StartExport " + prefabList.Length + ", runing=" + runing);


    }

    void Start()
    {
        
    }

    private GameObject currentPrefab;
    private GameObject currentGO;
    private GPUSkinningSampler currentSampler;
    void Update()
    {
        if(!runing)
        {
            return;
        }

        if(currentSampler == null)
        {
            currentPrefab = prefabList[index];
            currentGO = GameObject.Instantiate<GameObject>(prefabList[index]);
            currentSampler = currentGO.GetComponent<GPUSkinningSampler>();

            if(currentSampler == null)
            {
                index++;
                currentSampler = null;
                return;

            }

            if(currentSampler.animClips.Length == 0)
            {
                Debug.LogError(currentPrefab.name + "没有动作列表");
                index++;
                currentSampler = null;
                return;
            }

            currentSampler.exportDir = exportDir;
            currentSampler.BeginSample();
            currentSampler.StartSample();
        }


        if (!currentSampler.isSampling && currentSampler.IsSamplingProgress())
        {
            if (++currentSampler.samplingClipIndex < currentSampler.animClips.Length)
            {
                currentSampler.StartSample();
            }
            else
            {
                currentSampler.EndSample();
            }
            return;
        }



        if (!currentSampler.isSampling && !currentSampler.IsSamplingProgress())
        {
            GPUSkinningSampler sampler  = currentPrefab.GetComponent<GPUSkinningSampler>();
            sampler.anim = currentSampler.anim;
            sampler.savedMesh = currentSampler.savedMesh;
            sampler.savedMtrl = currentSampler.savedMtrl;
            sampler.textureLaya = currentSampler.textureLaya;

            GameObject.DestroyImmediate(currentGO);

            index++;
            if(index >= prefabList.Length)
            {
                Debug.Log(onComplete + "导出完成 数量:" + prefabList.Length);
                if(onComplete != null)
                {
                    onComplete();
                }

                UnityEditor.EditorApplication.isPlaying = false;
                return;
            }

            currentSampler = null;

        }







    }
#endif
}
