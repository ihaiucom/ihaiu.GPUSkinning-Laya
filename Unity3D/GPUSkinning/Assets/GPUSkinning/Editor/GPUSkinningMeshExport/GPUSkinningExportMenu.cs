using System.Collections;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;



namespace GPUSkingings
{
    public class GPUSkinningExportMenu
    {
        [MenuItem("Assets/GPUSkinning ExportMesh", false, 1)]
        [MenuItem("Assets/GPUSkinning ExportAnim", false, 1)]
        public static void ExportAnim()
        {
            Object[] objs = Selection.objects;
            for (int i = 0; i < objs.Length; i++)
            {
                if (objs[i] is GPUSkinningAnimation)
                {
                    ExportAnim((GPUSkinningAnimation) objs[i]);
                }
                else if (objs[i] is Mesh)
                {
                    ExportMesh((Mesh)objs[i]);
                }
            }
        }

        public static void ExportAnim(GPUSkinningAnimation anim)
        {
            GPUSkinningAnimExport export = new GPUSkinningAnimExport();
            export.SetAnim(anim);
            export.Export();
        }



        public static void ExportMesh(Mesh mesh)
        {
            GPUSkinningMeshExport export = new GPUSkinningMeshExport();
            export.SetMesh(mesh);
            export.Export();
        }

        [MenuItem("Assets/GPUSkinning ReadAnim", false, 1)]
        public static void ReadAnim()
        {
            Object[] objs = Selection.objects;
            for (int i = 0; i < objs.Length; i++)
            {

                if (objs[i] is TextAsset)
                {
                    TextAsset asset = (TextAsset) objs[i];
                    byte[] bytes = asset.bytes;
                    Debug.Log(bytes);
                    GPUSkinningAnimation anim = GPUSkinningAnimation.CreateFromBytes(bytes);
                }

            }
        }
    }
}
