declare namespace laya.display
{
    interface Node
    {
        getComponentsInChildren<T>(componentType: typeof Laya.Component, outComponents?:T[]): T[];
    }
}