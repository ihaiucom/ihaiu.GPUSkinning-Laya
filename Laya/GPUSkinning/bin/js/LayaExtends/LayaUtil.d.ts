export default class LayaUtil {
    static GetComponentsInChildren<T>(go: Laya.Node, componentType: typeof Laya.Component, outComponents?: T[]): T[];
}
