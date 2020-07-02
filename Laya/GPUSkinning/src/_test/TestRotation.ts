export class TestRotation extends Laya.Script3D
{
    
    onUpdate():void
    {
        var go = <Laya.Sprite3D> this.owner;
        go.transform.localRotationEulerY += 1;
    }
}