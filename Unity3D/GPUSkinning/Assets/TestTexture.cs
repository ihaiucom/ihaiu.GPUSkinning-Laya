using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

[ExecuteInEditMode]
public class TestTexture : MonoBehaviour
{
    public Texture2D texture;
    public Texture2D texture2;
    public int width;
    public int height;
    public bool isRunEditor = true;
    public Vector4 tc;
    public Vector3[] frame0Points = new Vector3[4];


    public TextAsset bytesAsset;
    public byte[] bytes;
    public Color[] colors;

    public Texture2D byteTexture;
    public Sprite sprite;
    public SpriteRenderer spriteRender;
    // Start is called before the first frame update
    void Start()
    {
        spriteRender = GetComponent<SpriteRenderer>();
    }

    // Update is called once per frame
    void Update()
    {
        if (isRunEditor)
            ToBytes3_16Bit();
    }



    [ContextMenu("To ToBytes3_16Bit")]
    public void ToBytes3_16Bit()
    {

        Texture2D texture = new Texture2D(2, 2, TextureFormat.RGBAHalf, false, true);
        Color[] pixels = texture.GetPixels();

        for(int i = 0; i < frame0Points.Length; i ++)
        {
            Vector3 pos = frame0Points[i];
            pixels[i] = new Color(pos.x, pos.y, pos.z, 1);

        }


        texture.SetPixels(pixels);
        texture.Apply();

        bytes = texture.GetRawTextureData();

        Debug.Log("bytes.Length=" + bytes.Length);


        string savedPath = "Assets/rili-16.bin";
        using (FileStream fileStream = new FileStream(savedPath, FileMode.Create))
        {
            fileStream.Write(bytes, 0, bytes.Length);
            fileStream.Flush();
            fileStream.Close();
            fileStream.Dispose();
        }

    }


    [ContextMenu("To ToBytes3_32Bit")]
    public void ToBytes3_32Bit()
    {
        var stream = new MemoryStream();
        var b = new BinaryWriter(stream);
        for (int i = 0; i < frame0Points.Length; i++)
        {
            Vector3 pos = frame0Points[i];
            b.Write((float)pos.x);
            b.Write((float)pos.y);
            b.Write((float)pos.z);
            b.Write((float)1);

        }
        stream.Flush();

        bytes = stream.ToArray();
        Debug.Log("stream.Length=" + stream.Length + ", bytes.Length=" + bytes.Length);


        string savedPath = "Assets/rili-36.bin";
        using (FileStream fileStream = new FileStream(savedPath, FileMode.Create))
        {
            fileStream.Write(bytes, 0, bytes.Length);
            fileStream.Flush();
            fileStream.Close();
            fileStream.Dispose();
        }

    }

    [ContextMenu("To Bytes")]
    public void ToBytes()
    {
        width = this.texture.width;
        height = this.texture.height;

        string savedPath = "Assets/"+ texture.name+ ".bytes";
        using (FileStream fileStream = new FileStream(savedPath, FileMode.Create))
        {
            byte[] bytes = texture.GetRawTextureData();
            fileStream.Write(bytes, 0, bytes.Length);
            fileStream.Flush();
            fileStream.Close();
            fileStream.Dispose();
        }
    }

    [ContextMenu("To Bytes2")]
    public void ToBytes2()
    {
        int num = frame0Points.Length * 3;
        FloatBitUtil.CalculateTextureSize(num, out width, out height);

        Texture2D texture = new Texture2D(width, height, TextureFormat.RGBA32, false, true);
        texture2 = texture;
        texture.name = "rili";
        Color[] pixels = texture.GetPixels();
        for(int i = 0; i < pixels.Length; i ++)
        {
            pixels[i] = new Color(0, 0, 0, 0);
        }

        for(int i = 0 ; i < frame0Points.Length; i ++)
        {
            pixels[i * 3 + 0] = frame0Points[i].x.ToColor();
            pixels[i * 3 + 1] = frame0Points[i].y.ToColor();
            pixels[i * 3 + 2] = frame0Points[i].z.ToColor();
        }
     
        int line = 0;
        //pixels[line + 0] = new Color(tc.x, tc.y, tc.z, tc.w);
        //pixels[line + 1] = new Color(1, 0, 0, 1);
        //pixels[line + 2] = new Color(1, 0, 0, 1);
        //pixels[line + 3] = new Color(0, 0, 1, 1);


        //line++;
        //pixels[line + 0] = new Color(0, 1, 0, 1);
        //pixels[line + 1] = new Color(0, 1, 0, 1);
        //pixels[line + 2] = new Color(0, 1, 0, 1);
        //pixels[line + 3] = new Color(0, 0, 1, 1);

        //line++;
        //pixels[line + 0] = new Color(0, 0, 1, 1);
        //pixels[line + 1] = new Color(0, 0, 1, 1);
        //pixels[line + 2] = new Color(0, 0, 1, 1);
        //pixels[line + 3] = new Color(0, 0, 1, 1);


        //line++;
        //pixels[line + 0] = new Color(0.5f, 0.5f, 0, 1);
        //pixels[line + 1] = new Color(0.5f, 0.5f, 0, 1);
        //pixels[line + 2] = new Color(0.5f, 0.5f, 0, 1);
        //pixels[line + 3] = new Color(0.5f, 0.5f, 1, 1);

        texture.SetPixels(pixels);
        texture.Apply();
        this.colors = pixels;
        string savedPath = "Assets/" + texture.name + ".bytes";
        using (FileStream fileStream = new FileStream(savedPath, FileMode.Create))
        {
            byte[] bytes = texture.GetRawTextureData();
            this.bytes = bytes;
            fileStream.Write(bytes, 0, bytes.Length);
            fileStream.Flush();
            fileStream.Close();
            fileStream.Dispose();
        }

        this.width = texture.width;
        this.height = texture.height;
    }


    [ContextMenu("Test Bytes")]
    public void TestBytes()
    {
        bytes = bytesAsset.bytes;

        Texture2D texture = new Texture2D(width, width);
        byteTexture = texture;
        int pixelsCount = width * height;
        colors = new Color[pixelsCount];
        for (int i = 0; i < pixelsCount; i ++)
        {
            Color32 color = new Color32();
            int offset = i * 4;
            color.r = bytes[offset + 0];
            color.g = bytes[offset + 1];
            color.b = bytes[offset + 2];
            color.a = bytes[offset + 3];
            colors[i] = color;
            int y = Mathf.FloorToInt(i / width);
            int x = i - (y * width);
            texture.SetPixel(x, y, color);
        }
        byteTexture.Apply();


        sprite = Sprite.Create(texture, new Rect(new Vector2(0, 0), new Vector2(texture.width, texture.height)), new Vector2(0.5f, 0.5f));
        spriteRender.sprite = sprite;
    }
}
