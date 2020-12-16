import GPUSkinningExecuteOncePerFrame from "./GPUSkinningExecuteOncePerFrame";
import { GPUSkinningBaseMaterial } from "./Material/GPUSkinningBaseMaterial";

/** GPU骨骼动画--材质球 */
export default class GPUSkinningMaterial
{
    /** 材质 */
    material: GPUSkinningBaseMaterial;

    /** 一帧只执行一次标记 */
    executeOncePerFrame: GPUSkinningExecuteOncePerFrame = new GPUSkinningExecuteOncePerFrame();

    /** 销毁 */
    Destroy()
    {
        if(this.material)
        {
            this.material.destroy();
            this.material = null;
        }
    }

}