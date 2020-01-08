export default class LayaExtends_Node {
    private static isInited;
    static Init(): void;
    constructor();
    getComponentsInChildren<T>(componentType: typeof Laya.Component, outComponents?: T[]): T[];
}
