import { TestScene } from "./TestSene";

import IndexFormat = Laya.IndexFormat;
import IndexBuffer3D = Laya.IndexBuffer3D;
import LayaGL = Laya.LayaGL;
import VertexBuffer3D = Laya.VertexBuffer3D;
import VertexDeclaration = Laya.VertexDeclaration;
import VertexMesh = Laya.VertexMesh;
import Mesh = Laya.Mesh;
import SubMesh = Laya.SubMesh;
import MeshSprite3D = Laya.MeshSprite3D;
import Material = Laya.Material;
import Texture2D = Laya.Texture2D;
import { TestRotation } from "./TestRotation";
import { TestUnlitMaterial } from "./TestMaterials/TestUnlitMaterial";


export default class TestMesh
{
    scene: TestScene;
    constructor()
    {
        this.scene = TestScene.create();
        Laya.stage.addChild(this.scene);
        this.InitAsync();
    }

    async InitAsync()
    {
        await TestUnlitMaterial.install();
        console.log("TestUnlitMaterial.install");
        
        var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,COLOR");
        
        var vertices = new Float32Array([
            0.5, 0, 0,   1, 0, 0, 0.5,
            1, 1, 1,    0, 1, 0, 0.5, 
            1, 0, 0,    0, 0, 1, 0.5, 

            -0.5, 0, 0,    0.5, 0, 0, 0.5, 
            -1, -1, -1,    0.0, 0.5, 0, 0.5, 
            -1, 0, 0,      0.0, 0.0, 0.5, 0.5, 

        ]);

        var indices = new Uint16Array([
            0, 1, 2,
            3, 4, 5
        ]);
        

        var gl: WebGLRenderingContext = LayaGL.instance;

        // 顶点数据buff
        var vertexBuffer = new VertexBuffer3D(vertices.length * 4, gl.STATIC_DRAW, true);
        vertexBuffer.vertexDeclaration = vertexDeclaration;
        vertexBuffer.setData(<ArrayBuffer>vertices.buffer);
        
        // 索引buff
        var indexBuffer: IndexBuffer3D = new IndexBuffer3D(<number>IndexFormat.UInt16, indices.length, gl.STATIC_DRAW, true);
        indexBuffer.setData(indices);

        

        var mesh = new Mesh();
		var subMeshes: SubMesh[] = [];

        // 设置mesh
		mesh._vertexBuffer = vertexBuffer;
        mesh._vertexCount = vertexBuffer._byteLength / vertexDeclaration.vertexStride;
        mesh._indexBuffer = indexBuffer;
        mesh._setBuffer(vertexBuffer, indexBuffer);
      
        // 创建SubMesh
        this.CreateSubMesh(mesh, subMeshes, vertexBuffer, indexBuffer, 0, 3);
        this.CreateSubMesh(mesh, subMeshes, vertexBuffer, indexBuffer, 3, 3);


        
        
		mesh._setSubMeshes(subMeshes);
		mesh.calculateBounds();

        var sprite = new MeshSprite3D(mesh);
        // sprite.addComponent(TestRotation);
        window['sprite'] = sprite;
        var material1 = new TestUnlitMaterial();
        var material2 = new TestUnlitMaterial();
        material2.albedoColor = new Laya.Vector4(1.0, 0.0, 0.0, 1.0);
        sprite.meshRenderer.materials = [material1, material2];

        this.scene.addChild(sprite);

       
    }

    private CreateSubMesh(mesh: Mesh, subMeshes: SubMesh[], vertexBuffer: VertexBuffer3D, indexBuffer: IndexBuffer3D,
        indexStart: number, indexCount: number
    )
    {
        var subMesh = new SubMesh(mesh);

		subMesh._vertexBuffer = vertexBuffer;
		subMesh._indexBuffer = indexBuffer;
        subMesh._setIndexRange(indexStart, indexCount);

        
		var subIndexBufferStart: number[] = subMesh._subIndexBufferStart;
		var subIndexBufferCount: number[] = subMesh._subIndexBufferCount;
        var boneIndicesList: Uint16Array[] = subMesh._boneIndicesList;
        
        
		subIndexBufferStart.length = 1;
		subIndexBufferCount.length = 1;
        boneIndicesList.length = 1;
        
        
        subIndexBufferStart[0] = indexStart;
        subIndexBufferCount[0] = indexCount;
        
		subMeshes.push(subMesh);
    }


}