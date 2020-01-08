import Vector3 = Laya.Vector3;
export declare class TestScene extends Laya.Scene3D {
    static create(): TestScene;
    sceneRoot: Laya.Sprite3D;
    mapNode: Laya.Sprite3D;
    camera: Laya.Camera;
    cameraNode: Laya.Sprite3D;
    screen3DLayer: Laya.Sprite3D;
    directionLight: Laya.DirectionLight;
    init(): void;
    initCamera(): void;
    lightRotaitonSrc: Vector3;
    lightRotaiton: Vector3;
    lightRotaitonStart(): void;
    lightRotaitonStop(): void;
    onLightRotaitonLoop(): void;
}
