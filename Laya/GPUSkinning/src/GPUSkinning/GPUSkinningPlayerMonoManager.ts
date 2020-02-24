import GPUSkinningPlayerResources from "./GPUSkinningPlayerResources";
import GPUSkinningAnimation from "./Datas/GPUSkinningAnimation";


import Material = Laya.Material;
import Mesh = Laya.Mesh;
import Texture2D = Laya.Texture2D;
import GPUSkinningPlayerMono from "./GPUSkinningPlayerMono";

/** GPU骨骼动画--播放管理器 */
export default class GPUSkinningPlayerMonoManager
{
    /** GPU骨骼动画--资源 列表 */
    private items:GPUSkinningPlayerResources[] = [];

    /** 注册 */
    public  Register(anim: GPUSkinningAnimation , mesh: Mesh , originalMtrl:Material , textureRawData: Texture2D , player: GPUSkinningPlayerMono  )
    {

        if (anim == null || originalMtrl == null || textureRawData == null || player == null)
        {
            return;
        }

        let item: GPUSkinningPlayerResources  = null;

        let items = this.items;
        let numItems = items.length;
        for(let i = 0; i < numItems; ++i)
        {
            if(items[i].anim.guid == anim.guid)
            {
                item = items[i];
                break;
            }
        }

        if(item == null)
        {
            item = new GPUSkinningPlayerResources();
            items.push(item);
        }

        if(item.anim == null)
        {
            item.anim = anim;
        }

        if(item.mesh == null)
        {
            item.mesh = mesh;
        }

        item.InitMaterial(<any>originalMtrl, anim.skinQuality);

        if(item.texture == null)
        {
            item.texture = textureRawData;
        }

        if (item.players.indexOf(player) == -1)
        {
            item.players.push(player);
            item.AddCullingBounds();
            player.isEnable = true;
        }

        return item;
    }

    /** 注销 */
    public Unregister(player: GPUSkinningPlayerMono )
    {
        if(player == null)
        {
            return;
        }

        let items = this.items;
        let numItems = items.length;
        for(let i = 0; i < numItems; ++i)
        {
            let playerIndex = items[i].players.indexOf(player);
            if(playerIndex != -1)
            {
                items[i].players.splice(playerIndex, 1);
                items[i].RemoveCullingBounds(playerIndex);
                player.isEnable = false;
                if(items[i].players.length == 0)
                {
                    items[i].Destroy();
                    items.splice(i, 1)
                }
                break;
            }
        }
    } 
}