export default class GPUSkinningBetterList<T>
{
    public buffer: T[];
    public size:int = 0;
    public bufferIncrement:int = 0;

    public Get(i:int):T
    {
        return this.buffer[i];
    }

    public Set(i:int, value:T)
    {
        this.buffer[i] = value;
    }

    constructor(bufferIncrement: int)
    {
        this.bufferIncrement = Math.max(1, bufferIncrement);
    }

    private AllocateMore()
    {
        let newList:T[] = (this.buffer != null) 
            ? new Array<T>(this.buffer.length + this.bufferIncrement) 
            : new Array<T>(this.bufferIncrement);

        if(this.buffer != null && this.size > 0)
        {
            arrayCopyValue(this.buffer, newList, false);
        }

        this.buffer = newList;
    }

    public Clear()
    {
        this.size = 0;
    }

    public Release()
    {
        this.size = 0;
        this.buffer = null;
    }

    public Add(item: T)
    {
        if(this.buffer == null || this.size == this.buffer.length)
        {
            this.AllocateMore();
        }

        this.buffer[this.size ++] = item;
    }

    public AddRange(items: T[])
    {
        if(items == null)
        {
            return;
        }

        let length = items.length;
        if(length == 0)
        {
            return;
        }

        if(this.buffer == null)
        {
            this.buffer = new Array<T>(Math.max(this.bufferIncrement, length));
            arrayCopyValue(items, this.buffer, false);
            this.size = length;
        }
        else
        {
            if(this.size + length > this.buffer.length)
            {
                let newList: T[] = new Array<T>(Math.max(this.buffer.length + this.bufferIncrement, this.size + length));
                arrayCopyValue(this.buffer, newList, false);
                this.buffer = newList;
                for(var i = 0; i < length; i ++)
                {
                    this.buffer[this.size + i] = items[i];
                }
            }
            else
            {
                for(var i = 0; i < length; i ++)
                {
                    this.buffer[this.size + i] = items[i];
                }
            }
            this.size += length;
        }

    }


    public RemoveAt(index: int)
    {
        if(this.buffer != null && index > -1 && index < this.size)
        {
            this.size --;
            this.buffer[index] = null;
            for(let b = index; b < this.size; ++b)
            {
                this.buffer[b] = this.buffer[b + 1];
            }

            this.buffer[this.size] = null;
        }
    }

    /** 删除并返回最右一个值 */
    public Pop():T
    {
        if(this.buffer == null || this.size == 0)
        {
            return null;
        }

        --this.size;
        let t = this.buffer[this.size];
        this.buffer[this.size] = null;
        return t;
    }

    /** 返回最后一个值 */
    public Peek():T
    {
        if(this.buffer == null || this.size == 0)
        {
            return null;
        }

        return this.buffer[this.size - 1];

    }

}