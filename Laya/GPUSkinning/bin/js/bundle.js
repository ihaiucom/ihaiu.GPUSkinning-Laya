(function () {
    'use strict';

    class GameConfig {
        constructor() { }
        static init() {
        }
    }
    GameConfig.width = 1334;
    GameConfig.height = 750;
    GameConfig.scaleMode = Laya.Stage.SCALE_SHOWALL;
    GameConfig.screenMode = "none";
    GameConfig.alignV = "top";
    GameConfig.alignH = "left";
    GameConfig.startScene = "test/TestScene.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = true;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    var Shader3D = Laya.Shader3D;
    var Vector4 = Laya.Vector4;
    class SceneMaterial {
        static Init(scene) {
            this.scene = scene;
            this._shaderValues = scene._shaderValues;
            this.SHADERDEFINE_SCENELIGHTINGTEXTURE = Shader3D.getDefineByName("SCENELIGHTING");
            this.sceneLightingSize = new Vector4(-10, 20, -10, 20);
        }
        static get sceneLightingTexture() {
            return this._shaderValues.getTexture(this.SCENELIGHTINGTEXTURE);
        }
        static set sceneLightingTexture(value) {
            if (value)
                this._shaderValues.addDefine(this.SHADERDEFINE_SCENELIGHTINGTEXTURE);
            else
                this._shaderValues.removeDefine(this.SHADERDEFINE_SCENELIGHTINGTEXTURE);
            this._shaderValues.setTexture(this.SCENELIGHTINGTEXTURE, value);
        }
        static SetSceneLightingTexture(value) {
            this.sceneLightingTexture = value;
        }
        static get sceneLightingSize() {
            return this._shaderValues.getVector(this.SCENELIGHTINGSIZE);
        }
        static set sceneLightingSize(value) {
            this._shaderValues.setVector(this.SCENELIGHTINGSIZE, value);
        }
        static SetSceneLightingSize(value) {
            this.sceneLightingSize = value;
        }
        static LoadSceneLightingTexture(path) {
            Laya.loader.create(path, Laya.Handler.create(this, (texture) => {
                this.sceneLightingTexture = texture;
            }), null, Laya.Loader.TEXTURE2D);
        }
    }
    SceneMaterial.SCENELIGHTINGTEXTURE = Shader3D.propertyNameToID("u_SceneLightingTexture");
    SceneMaterial.SCENELIGHTINGSIZE = Shader3D.propertyNameToID("u_SceneLightingSize");

    var Vector3 = Laya.Vector3;
    class TestScene extends Laya.Scene3D {
        static create() {
            let node = new TestScene();
            node.name = "WarScene";
            let scene = node;
            scene.init();
            return scene;
        }
        init() {
            window['warScene'] = this;
            this.initCamera();
        }
        initCamera() {
            var cameraRootNode = new Laya.Sprite3D("CameraRoot");
            var cameraRotationXNode = new Laya.Sprite3D("CameraRotationX");
            var camera = new Laya.Camera(0, 0.1, 1000);
            var screenLayer = new Laya.Sprite3D("ScreenLayer");
            cameraRootNode.addChild(cameraRotationXNode);
            cameraRotationXNode.addChild(camera);
            camera.addChild(screenLayer);
            cameraRotationXNode.transform.localRotationEulerX = -20;
            camera.transform.localPosition = new Vector3(0, 0, 10);
            camera.clearColor = new Laya.Vector4(0.2, 0.5, 0.8, 1);
            camera.clearColor = new Laya.Vector4(0.3, 0.3, 0.3, 1);
            camera.orthographic = true;
            camera.orthographicVerticalSize = 2.6;
            camera.farPlane = 2000;
            this.camera = camera;
            this.cameraNode = cameraRootNode;
            this.screen3DLayer = screenLayer;
            let directionLight = this.addChild(new Laya.DirectionLight());
            directionLight.color = new Laya.Vector3(1, 1.0, 1.0);
            this.lightRotaitonSrc = directionLight.transform.localRotationEuler = new Laya.Vector3(-45, 80, 0);
            this.directionLight = directionLight;
            directionLight.transform.rotationEuler = new Laya.Vector3(-20, 20, 0);
            this.addChild(cameraRootNode);
            this.addChild(directionLight);
            SceneMaterial.Init(this);
        }
        lightRotaitonStart() {
            this.lightRotaiton = this.directionLight.transform.localRotationEuler;
            Laya.timer.frameLoop(1, this, this.onLightRotaitonLoop);
        }
        lightRotaitonStop() {
            this.directionLight.transform.localRotationEuler = this.lightRotaitonSrc;
            Laya.timer.clear(this, this.onLightRotaitonLoop);
        }
        onLightRotaitonLoop() {
            this.lightRotaiton.x += 1;
            this.lightRotaiton.y += 2;
            this.lightRotaiton.z += 2;
            this.directionLight.transform.localRotationEuler = this.lightRotaiton;
        }
    }

    class TestBaseMaterial extends Laya.Material {
        static getShaderVS(filename) {
            return this.SHADER_PATH_ROOT + filename + ".vs";
        }
        static getShaderPS(filename) {
            return this.SHADER_PATH_ROOT + filename + ".fs";
        }
        static getShaderGLSL(filename) {
            return this.SHADER_PATH_ROOT + filename + ".glsl";
        }
        static async loadShaderGlslAsync(filename) {
            let code = await this.loadAsync(this.getShaderGLSL(filename), Laya.Loader.TEXT);
            return code.replace(/\r/g, "");
        }
        static async loadShaderVSAsync(filename) {
            let code = await this.loadAsync(this.getShaderVS(filename), Laya.Loader.TEXT);
            return code.replace(/\r/g, "");
        }
        static async loadShaderPSAsync(filename) {
            let code = await this.loadAsync(this.getShaderPS(filename), Laya.Loader.TEXT);
            return code.replace(/\r/g, "");
        }
        static async loadAsync(path, type) {
            return new Promise((resolve) => {
                Laya.loader.load(path, Laya.Handler.create(null, (res) => {
                    resolve(res);
                }), null, type);
            });
        }
    }
    TestBaseMaterial.SHADER_PATH_ROOT = "res/shaders/test/";

    var Shader3D$1 = Laya.Shader3D;
    var SubShader = Laya.SubShader;
    var VertexMesh = Laya.VertexMesh;
    var Vector4$1 = Laya.Vector4;
    var RenderState = Laya.RenderState;
    var Material = Laya.Material;
    class TestUnlitMaterial extends TestBaseMaterial {
        constructor() {
            super();
            this._albedoColor = new Vector4$1(1.0, 1.0, 1.0, 1.0);
            this.setShaderName(TestUnlitMaterial.shaderName);
            this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
            this.alphaTest = false;
            this._shaderValues.setBool(Shader3D$1.propertyNameToID("s_DepthWrite"), false);
            this._shaderValues.setInt(Shader3D$1.propertyNameToID("s_DepthTest"), RenderState.DEPTHTEST_LESS);
            this._shaderValues.setInt(Shader3D$1.propertyNameToID("s_Cull"), RenderState.CULL_BACK);
            this._shaderValues.setInt(Shader3D$1.propertyNameToID("s_Blend"), RenderState.BLEND_ENABLE_ALL);
            this._shaderValues.setInt(Shader3D$1.propertyNameToID("s_BlendSrc"), RenderState.BLENDPARAM_SRC_ALPHA);
            this._shaderValues.setInt(Shader3D$1.propertyNameToID("s_BlendDst"), RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
            this._shaderValues.setVector(TestUnlitMaterial.ALBEDOCOLOR, this._albedoColor);
        }
        static async install() {
            if (this._isInstalled) {
                return;
            }
            this._isInstalled = true;
            TestUnlitMaterial.__initDefine__();
            await TestUnlitMaterial.initShader();
            TestUnlitMaterial.defaultMaterial = new TestUnlitMaterial();
            TestUnlitMaterial.defaultMaterial.lock = true;
        }
        static async initShader() {
            var vs = await this.loadShaderVSAsync(this.shaderName);
            var ps = await this.loadShaderPSAsync(this.shaderName);
            var attributeMap;
            var uniformMap;
            var stateMap;
            var shader;
            var subShader;
            attributeMap =
                {
                    'a_Position': VertexMesh.MESH_POSITION0,
                    'a_Color': VertexMesh.MESH_COLOR0,
                    'a_MvpMatrix': VertexMesh.MESH_MVPMATRIX_ROW0
                };
            uniformMap =
                {
                    "u_AlbedoColor": Shader3D$1.PERIOD_MATERIAL,
                    'u_MvpMatrix': Shader3D$1.PERIOD_SPRITE,
                    'u_FogStart': Shader3D$1.PERIOD_SCENE,
                    'u_FogRange': Shader3D$1.PERIOD_SCENE,
                    'u_FogColor': Shader3D$1.PERIOD_SCENE
                };
            stateMap =
                {
                    's_Cull': Shader3D$1.RENDER_STATE_CULL,
                    's_Blend': Shader3D$1.RENDER_STATE_BLEND,
                    's_BlendSrc': Shader3D$1.RENDER_STATE_BLEND_SRC,
                    's_BlendDst': Shader3D$1.RENDER_STATE_BLEND_DST,
                    's_DepthTest': Shader3D$1.RENDER_STATE_DEPTH_TEST,
                    's_DepthWrite': Shader3D$1.RENDER_STATE_DEPTH_WRITE
                };
            shader = Shader3D$1.add(this.shaderName, null, null, true);
            subShader = new SubShader(attributeMap, uniformMap);
            shader.addSubShader(subShader);
            var mainPass = subShader.addShaderPass(vs, ps, stateMap);
        }
        static __initDefine__() {
        }
        get albedoColor() {
            return this._albedoColor;
        }
        set albedoColor(value) {
            var finalAlbedo = this._shaderValues.getVector(TestUnlitMaterial.ALBEDOCOLOR);
            Vector4$1.scale(value, 1, finalAlbedo);
            this._albedoColor = value;
            this._shaderValues.setVector(TestUnlitMaterial.ALBEDOCOLOR, finalAlbedo);
        }
    }
    TestUnlitMaterial.shaderName = "unlit";
    TestUnlitMaterial._isInstalled = false;
    TestUnlitMaterial.ALBEDOCOLOR = Shader3D$1.propertyNameToID("u_AlbedoColor");

    var IndexFormat = Laya.IndexFormat;
    var IndexBuffer3D = Laya.IndexBuffer3D;
    var LayaGL = Laya.LayaGL;
    var VertexBuffer3D = Laya.VertexBuffer3D;
    var VertexMesh$1 = Laya.VertexMesh;
    var Mesh = Laya.Mesh;
    var SubMesh = Laya.SubMesh;
    var MeshSprite3D = Laya.MeshSprite3D;
    class TestMesh {
        constructor() {
            this.scene = TestScene.create();
            Laya.stage.addChild(this.scene);
            this.InitAsync();
        }
        async InitAsync() {
            await TestUnlitMaterial.install();
            console.log("TestUnlitMaterial.install");
            var vertexDeclaration = VertexMesh$1.getVertexDeclaration("POSITION,COLOR");
            var vertices = new Float32Array([
                0.5, 0, 0, 1, 0, 0, 0.5,
                1, 1, 1, 0, 1, 0, 0.5,
                1, 0, 0, 0, 0, 1, 0.5,
                -0.5, 0, 0, 0.5, 0, 0, 0.5,
                -1, -1, -1, 0.0, 0.5, 0, 0.5,
                -1, 0, 0, 0.0, 0.0, 0.5, 0.5,
            ]);
            var indices = new Uint16Array([
                0, 1, 2,
                3, 4, 5
            ]);
            var gl = LayaGL.instance;
            var vertexBuffer = new VertexBuffer3D(vertices.length * 4, gl.STATIC_DRAW, true);
            vertexBuffer.vertexDeclaration = vertexDeclaration;
            vertexBuffer.setData(vertices.buffer);
            var indexBuffer = new IndexBuffer3D(IndexFormat.UInt16, indices.length, gl.STATIC_DRAW, true);
            indexBuffer.setData(indices);
            var mesh = new Mesh();
            var subMeshes = [];
            mesh._vertexBuffer = vertexBuffer;
            mesh._vertexCount = vertexBuffer._byteLength / vertexDeclaration.vertexStride;
            mesh._indexBuffer = indexBuffer;
            mesh._setBuffer(vertexBuffer, indexBuffer);
            this.CreateSubMesh(mesh, subMeshes, vertexBuffer, indexBuffer, 0, 3);
            this.CreateSubMesh(mesh, subMeshes, vertexBuffer, indexBuffer, 3, 3);
            mesh._setSubMeshes(subMeshes);
            mesh.calculateBounds();
            var sprite = new MeshSprite3D(mesh);
            window['sprite'] = sprite;
            var material1 = new TestUnlitMaterial();
            var material2 = new TestUnlitMaterial();
            material2.albedoColor = new Laya.Vector4(1.0, 0.0, 0.0, 1.0);
            sprite.meshRenderer.materials = [material1, material2];
            this.scene.addChild(sprite);
        }
        CreateSubMesh(mesh, subMeshes, vertexBuffer, indexBuffer, indexStart, indexCount) {
            var subMesh = new SubMesh(mesh);
            subMesh._vertexBuffer = vertexBuffer;
            subMesh._indexBuffer = indexBuffer;
            subMesh._setIndexRange(indexStart, indexCount);
            var subIndexBufferStart = subMesh._subIndexBufferStart;
            var subIndexBufferCount = subMesh._subIndexBufferCount;
            var boneIndicesList = subMesh._boneIndicesList;
            subIndexBufferStart.length = 1;
            subIndexBufferCount.length = 1;
            boneIndicesList.length = 1;
            subIndexBufferStart[0] = indexStart;
            subIndexBufferCount[0] = indexCount;
            subMeshes.push(subMesh);
        }
    }

    class TestMain {
        constructor() {
            this.InitLaya();
            if (Laya.Browser.onWeiXin) {
                Laya.URL.basePath = "http://10.10.10.188:8900/bin/";
            }
            new TestMesh();
        }
        TestFun() {
            for (let i = 0; i < 10; i++) {
                let ii = i;
                let handler = Laya.Handler.create(null, (r) => {
                    console.log(ii + ", " + r);
                });
                setTimeout(() => {
                    handler.runWith(i);
                }, 100);
            }
        }
        InitLaya() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            Laya.Shader3D.debugMode = true;
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError = true;
        }
    }
    new TestMain();

}());
//# sourceMappingURL=bundle.js.map
