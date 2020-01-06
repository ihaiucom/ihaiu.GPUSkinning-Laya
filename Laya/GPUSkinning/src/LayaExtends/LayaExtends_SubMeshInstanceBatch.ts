import LayaUtil from "./LayaUtil";

export default class LayaExtends_SubMeshInstanceBatch
{
    private static isInited = false;
    static Init()
    {
        if(this.isInited)
            return;

        this.isInited = true;
        new LayaExtends_SubMeshInstanceBatch();
    }


    constructor()
    {
        // var SubMeshInstanceBatch = Laya.SubMeshInstanceBatch;
        // SubMeshInstanceBatch.prototype.getComponentsInChildren = this.getComponentsInChildren;
    }

    
}
