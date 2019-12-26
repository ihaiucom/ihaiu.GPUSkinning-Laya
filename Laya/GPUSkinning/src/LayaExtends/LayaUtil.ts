export default class LayaUtil
{
    static GetComponentsInChildren<T>(go:Laya.Node, componentType: typeof Laya.Component, outComponents?:T[]): T[]
    {
        if(!outComponents)
        {
            outComponents = [];
        }

        for(let i = 0, len = go.numChildren; i < len; i ++)
        {
            let child = go.getChildAt(i);
            let component = child.getComponent(componentType);
            if(component)
            {
                outComponents.push(component);
            }

            this.GetComponentsInChildren(child, componentType, outComponents);
        }

        return outComponents;
    }
}