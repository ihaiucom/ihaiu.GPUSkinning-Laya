import GPUSkinningBone from "./Datas/GPUSkinningBone";

export default class GPUSkinningPlayerJoint extends Laya.Script3D
{

    bone: GPUSkinningBone;
    index: int = 0;
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

    Init(bone: GPUSkinningBone, index: int, boneIndex: int, boneGUID: string)
    {
        this.bone = bone;
        this.index = index;
        this.BoneIndex = boneIndex;
        this.BoneGUID = boneGUID;
    }
}