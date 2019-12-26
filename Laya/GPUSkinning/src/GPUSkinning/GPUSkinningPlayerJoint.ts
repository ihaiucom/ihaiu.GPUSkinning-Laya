
export default class GPUSkinningPlayerJoint extends Laya.Script3D
{

    BoneIndex:int = 0;
    BoneGUID: string = null;

    private go: Laya.Sprite3D;
    private transform: Laya.Transform3D;



    public get Transform(): Laya.Transform3D
    {
        return this.transform;
    }

    public get GameObject(): Laya.Sprite3D
    {
        return this.go;
    }


    onAwake()
    {
        this.go = <Laya.Sprite3D> this.owner;
        this.transform = this.go.transform;
    }

    Init(boneIndex: int, boneGUID: string)
    {
        this.BoneIndex = boneIndex;
        this.BoneGUID = boneGUID;
    }
}