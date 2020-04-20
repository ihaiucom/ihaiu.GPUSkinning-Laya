import Vector3 = Laya.Vector3;
import SceneMaterial from "../GPUSkinning/Material/SceneMaterial";
export class TestScene extends Laya.Scene3D
{
    static create(): TestScene
    {
        let node = new TestScene();
        node.name = "WarScene";

        let scene = node;
        scene.init()
        return scene;
    }

    /** 场景根节点 */
    sceneRoot:Laya.Sprite3D;

    /** 地图节点 */
    mapNode: Laya.Sprite3D;

    /** 摄像机 */
    camera:Laya.Camera;
    cameraNode:Laya.Sprite3D;

    /** 屏幕空间层 */
    screen3DLayer:Laya.Sprite3D;

    /** 灯光 */
    directionLight:Laya.DirectionLight;

    
    init()
    {
        window['warScene'] = this;

        this.initCamera();
    }

    
    initCamera()
    {
        var cameraRootNode: Laya.Sprite3D = new Laya.Sprite3D("CameraRoot");
        var cameraRotationXNode: Laya.Sprite3D = new Laya.Sprite3D("CameraRotationX");
        var camera:Laya.Camera = new Laya.Camera(0, 0.1, 1000);
        var screenLayer: Laya.Sprite3D = new Laya.Sprite3D("ScreenLayer");

        cameraRootNode.addChild(cameraRotationXNode);
        cameraRotationXNode.addChild(camera);
        camera.addChild(screenLayer);

        cameraRotationXNode.transform.localRotationEulerX = -20;
        camera.transform.localPosition = new Vector3(0, 0, 10);

        camera.clearColor = new Laya.Vector4(0.2, 0.5, 0.8, 1);
        camera.orthographic = true;
        camera.orthographicVerticalSize = 5.2;
        camera.farPlane = 2000;
        

        
        this.camera = camera;
        this.cameraNode = cameraRootNode;
        this.screen3DLayer = screenLayer;

        
        //创建平行光
        let directionLight: Laya.DirectionLight =<Laya.DirectionLight> this.addChild(new Laya.DirectionLight());
		directionLight.color = new Laya.Vector3(1, 1.0, 1.0);
		this.lightRotaitonSrc= directionLight.transform.localRotationEuler = new Laya.Vector3(-45, 80, 0);
        this.directionLight = directionLight;
        directionLight.transform.rotationEuler = new Laya.Vector3(-20, 20, 0); 
        

        this.addChild(cameraRootNode);
        this.addChild(directionLight);

        // this.lightRotaitonStart();

        SceneMaterial.Init(this);
        // SceneMaterial.LoadSceneLightingTexture("res3d/GPUSKinning-30/scene_lighting.png"); 

        
    }

    lightRotaitonSrc:Vector3;
    lightRotaiton:Vector3;
    lightRotaitonStart()
    {
        this.lightRotaiton = this.directionLight.transform.localRotationEuler;
        Laya.timer.frameLoop(1, this, this.onLightRotaitonLoop)
    }

    
    lightRotaitonStop()
    {
        this.directionLight.transform.localRotationEuler = this.lightRotaitonSrc;
        Laya.timer.clear(this, this.onLightRotaitonLoop)
    }
    
    onLightRotaitonLoop()
    {
        this.lightRotaiton.x += 1;
        this.lightRotaiton.y += 2;
        this.lightRotaiton.z += 2;

        this.directionLight.transform.localRotationEuler = this.lightRotaiton;
    }
    
}

