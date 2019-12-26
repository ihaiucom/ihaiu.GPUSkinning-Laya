import LayaUtil from "./LayaUtil";

export default class LayaExtends_Node
{
    private static isInited = false;
    static Init()
    {
        if(this.isInited)
            return;

        this.isInited = true;
        new LayaExtends_Node();
    }


    constructor()
    {
        Laya.Node.prototype.getComponentsInChildren = this.getComponentsInChildren;
    }

    
    getComponentsInChildren<T>(componentType: typeof Laya.Component, outComponents?:T[]): T[]
    {
        if(outComponents)
        {
            outComponents.length = 0;
        }
        else
        {
            outComponents = [];
        }
        LayaUtil.GetComponentsInChildren(<any>this, componentType, outComponents);
        return outComponents;
    }


}
