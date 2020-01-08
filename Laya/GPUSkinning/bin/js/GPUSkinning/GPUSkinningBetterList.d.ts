export default class GPUSkinningBetterList<T> {
    buffer: T[];
    size: int;
    bufferIncrement: int;
    Get(i: int): T;
    Set(i: int, value: T): void;
    constructor(bufferIncrement: int);
    private AllocateMore;
    Clear(): void;
    Release(): void;
    Add(item: T): void;
    AddRange(items: T[]): void;
    RemoveAt(index: int): void;
    Pop(): T;
    Peek(): T;
}
