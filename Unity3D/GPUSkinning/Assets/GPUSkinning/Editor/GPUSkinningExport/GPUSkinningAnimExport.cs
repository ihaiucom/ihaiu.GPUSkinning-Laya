using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text;
using UnityEditor;
using UnityEngine;


namespace GPUSkingings
{


    public class GPUSkinningAnimExport
    {

        public string version = "LAYAANIM:GPUSkining_05";
        private int versionByteLength = 2 + 12;
        public GPUSkinningAnimation anim;
        public string name;


        public void SetAnim(GPUSkinningAnimation anim)
        {
            this.anim = anim;
        }


        public void Export(string outDir = null)
        {
            name = anim.name;

            MemoryStream stream = new MemoryStream();
            stream.Position = 0;
            BinaryWriter b = new BinaryWriter(stream);
            // version
            b.WriteUTFString(version);

            MemoryStream animStream = anim.ToSteam();
            b.Write((uint)animStream.Length);
            b.WriteMemoryStream(animStream);



            string dir = outDir;
            if(string.IsNullOrEmpty(dir))
            {
                dir = AssetDatabase.GetAssetPath(anim);
                dir = Path.GetDirectoryName(dir);
            }

            string savedPath = dir + "/GPUSKinning_" + name + "_Anim.bin";
            //string savedPath = dir + "/GPUSKinning_Anim_" + name + ".bytes";

            using (FileStream fileStream = new FileStream(savedPath, FileMode.Create))
            {
                stream.Position = 0;
                byte[] bytes = stream.GetBuffer();
                fileStream.Write(bytes, 0, (int)stream.Length);
                fileStream.Flush();
                fileStream.Close();
                fileStream.Dispose();
            }

            stream.Close();
            stream.Dispose();

        }


    }

}
