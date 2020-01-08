export default class GameConfig {
    static width: number;
    static height: number;
    static scaleMode: string;
    static screenMode: string;
    static alignV: string;
    static alignH: string;
    static startScene: any;
    static sceneRoot: string;
    static debug: boolean;
    static stat: boolean;
    static physicsDebug: boolean;
    static exportSceneToJson: boolean;
    constructor();
    static init(): void;
}
