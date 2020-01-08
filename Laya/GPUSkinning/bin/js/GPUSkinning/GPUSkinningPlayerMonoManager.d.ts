import GPUSkinningPlayerResources from "./GPUSkinningPlayerResources";
import GPUSkinningAnimation from "./Datas/GPUSkinningAnimation";
import Material = Laya.Material;
import Mesh = Laya.Mesh;
import Texture2D = Laya.Texture2D;
import GPUSkinningPlayerMono from "./GPUSkinningPlayerMono";
export default class GPUSkinningPlayerMonoManager {
    private items;
    Register(anim: GPUSkinningAnimation, mesh: Mesh, originalMtrl: Material, textureRawData: Texture2D, player: GPUSkinningPlayerMono): GPUSkinningPlayerResources;
    Unregister(player: GPUSkinningPlayerMono): void;
}
