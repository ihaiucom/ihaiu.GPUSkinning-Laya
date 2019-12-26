declare class ByteArray {
    bufferExtSize: number;
    EOF_byte: number;
    EOF_code_point: number;
    write_position: number;
    data: DataView;
    /** 大小端,默认bigEndian */
    private $endian;
    endian: string;
    readonly readAvailable: number;
    buffer: ArrayBuffer;
    readonly rawBuffer: ArrayBuffer;
    readonly bytes: Uint8Array;
    dataView: DataView;
    readonly bufferOffset: number;
    position: number;
    length: number;
    readonly bytesAvailable: number;
    private _position;
    private _bytes;
    constructor(buffer?: any, bufferExtSize?: any);
    _validateBuffer(value: any): void;
    clear(): void;
    readInt(): int;
    readShort(): int;
    readByte(): int;
    readBytes(bytes: any, offset: any, length: any): void;
    readUTF(): string;
    readUTFBytes(length: any): string;
    readUnsignedInt(): int;
    readUnsignedByte(): uint;
    readUnsignedShort(): uint;
    readBoolean(): boolean;
    readFloat(): number;
    readDouble(): number;
    writeUTF(value: string): void;
    writeUTFBytes(value: any): void;
    writeInt(value: int): void;
    writeShort(value: int): void;
    writeByte(value: int): void;
    writeBytes(bytes: any, offset: any, length: any): void;
    writeBoolean(value: any): void;
    writeDouble(value: any): void;
    writeFloat(value: any): void;
    writeUnsignedInt(value: any): void;
    writeUnsignedShort(value: any): void;
    validate(len: number): boolean;
    validateBuffer(len: number): void;
    encodeUTF8(str: any): Uint8Array;
    decodeUTF8(data: any): string;
    encoderError(code_point: any): void;
    decoderError(fatal: any, opt_code_point?: number): number;
    inRange(a: any, min: any, max: any): boolean;
    div(n: any, d: any): number;
    stringToCodePoints(string: any): any[];
    toString(): string;
    _writeUint8Array(bytes: any, validateBuffer?: boolean): void;
    private $error;
}
declare function GameCommonLibInit(): void;
declare class BitHelper {
    /** 是否包含 */
    static Contain(val: number, type: number): boolean;
    /** 添加 */
    static Add(val: number, type: number): number;
    static BitUnset(ui: int, len: int, bit: int): uint;
    static BitSet(ui: uint, len: int, bit: int, val: uint): uint;
    static BitGet(ui: uint, len: int, bit: int): uint;
    static Bit2Str(bit: int): string;
    static Byte2Str(bytesSize: int): string;
}
declare function isNumber(x: any): x is number;
declare function isInt(s: any): boolean;
declare function isString(x: any): x is string;
declare function isNullOrEmpty(x: string | string[]): boolean;
declare function isNaNOrEmpty(x: number): boolean;
declare function getClassName(obj: any): string;
declare function getFunctionName(method: Function): string;
declare function getTime(): number;
declare function getTimeStamp(): number;
declare function bToStr(b: any): string;
declare function kbToStr(kb: any): string;
declare function arrayRemoveItem(arr: any[], item: any): boolean;
declare function arrayCopyInt(dst: number[], src: number[]): void;
declare function objRestDefaultValue(o: object): void;
declare function objCopyValue(from: object, to: object, isUsePool?: boolean): void;
declare function objectClone(from:object, isUsePool?: boolean): any;
/** Map -- 清除 */
declare function mapClear(map: Map<any, IPoolObject | any>, isBaseType?: boolean): void;
/** Map -- 拷贝数据 */
declare function mapCopyValue(from: Map<any, IPoolObject | any>, to: Map<any, IPoolObject | any>, isBaseType?: boolean): void;
/** Map -- 深度克隆数据对象 */
declare function mapClone<K, V>(from: Map<any, IPoolObject>, to?: Map<any, IPoolObject>, isPoolRecoverFrom?: boolean, isBaseType?: boolean): Map<K, V>;
/** Map -- 克隆基本类型数据 */
declare function mapCloneBase<K, V>(from: Map<any, number | string | boolean>, isPoolRecoverFrom?: boolean): Map<K, V>;
/** 数组 -- 清除 */
declare function arrayClear(list: any[] | IPoolObject[], isBaseType?: boolean): void;
/** 数组 -- 拷贝数据 */
declare function arrayCopyValue(from: any[] | IPoolObject[], to: any[] | IPoolObject[], isBaseType?: boolean): void;
/** 数组 -- 深度克隆数据对象 */
declare function arrayClone<T extends IPoolObject>(from: IPoolObject[], to?: IPoolObject[], isPoolRecoverFrom?: boolean): T[];
/** 数组 -- 克隆基本类型数据 */
declare function arrayCloneBase<T>(from: number[] | string[] | boolean[], isPoolRecoverFrom?: boolean): T[];
declare class Gid {
    static _gid: number;
    static getGID(): number;
}
declare class Mathf {
    /** 小数点多少位 */
    static FloatLength(num: number, floatM?: number): number;
    static clamp(num: number, min: number, max: number): number;
    static Clamp01(value: number): number;
    static Lerp(a: number, b: number, t: number): number;
    /** 弧度, 计算2个点 */
    static radian(fromX: number, fromY: number, toX: number, toY: number): number;
    /** 角度, 计算2个点 */
    static angle(fromX: number, fromY: number, toX: number, toY: number): number;
    /** 角度 转 弧度 */
    static angleToRadian(angle: number): number;
    /** 弧度 转 角度 */
    static radianToAngle(radian: number): number;
    /** 距离, 计算2个点 */
    static distanceangle(fromX: number, fromY: number, toX: number, toY: number): number;
    static directionPointX(fromX: number, fromY: number, toX: number, toY: number, length: number): number;
    static directionPointY(fromX: number, fromY: number, toX: number, toY: number, length: number): number;
    /** 弧度方向 点 */
    static radianPointX(radian: number, length: number, fromX: number): number;
    static radianPointY(radian: number, length: number, fromY: number): number;
    /** 弧度方向 点 */
    static anglePointX(angle: number, length: number, fromX: number): number;
    static anglePointY(angle: number, length: number, fromY: number): number;
}
declare class NumberTransfrom {
    unms: string[];
    digits: string[];
    units: string[];
    checkIsNumbers(x: string): boolean;
    transfrom2(num: number): string;
    transfrom(num: number): string;
}
/**
 * <p> <code>Pool</code> 是对象池类，用于对象的存储、重复使用。</p>
 * <p>合理使用对象池，可以有效减少对象创建的开销，避免频繁的垃圾回收，从而优化游戏流畅度。</p>
 */
declare class Pool {
    private static _poolDic;
    /**
     * 根据对象类型标识字符，获取对象池。
     * @param sign 对象类型标识字符。
     * @return 对象池。
     */
    static getPoolBySign(sign: string): Array<any>;
    /**
     * 清除对象池的对象。
     * @param sign 对象类型标识字符。
     */
    static clearBySign(sign: string): void;
    /**
     * 将对象放到对应类型标识的对象池中。
     * @param sign 对象类型标识字符。
     * @param item 对象。
     */
    static recover(sign: string, item: any): void;
    /**
     * 根据类名进行回收，如果类有类名才进行回收，没有则不回收
     * @param	instance 类的具体实例
     */
    static recoverByClass(instance: any): void;
    /**
     * 根据类名回收类的实例
     * @param	instance 类的具体实例
     */
    static createByClass(cls: any): any;
    private static _getClassSign;
    /**
     * <p>根据传入的对象类型标识字符，获取对象池中此类型标识的一个对象实例。</p>
     * <p>当对象池中无此类型标识的对象时，则根据传入的类型，创建一个新的对象返回。</p>
     * @param sign 对象类型标识字符。
     * @param cls 用于创建该类型对象的类。
     * @return 此类型标识的一个对象。
     */
    static getItemByClass(sign: string, cls: any): any;
    /**
     * <p>根据传入的对象类型标识字符，获取对象池中此类型标识的一个对象实例。</p>
     * <p>当对象池中无此类型标识的对象时，则使用传入的创建此类型对象的函数，新建一个对象返回。</p>
     * @param sign 对象类型标识字符。
     * @param createFun 用于创建该类型对象的方法。
     * @param caller this对象
     * @return 此类型标识的一个对象。
     */
    static getItemByCreateFun(sign: string, createFun: Function, caller?: any): any;
    /**
     * 根据传入的对象类型标识字符，获取对象池中已存储的此类型的一个对象，如果对象池中无此类型的对象，则返回 null 。
     * @param sign 对象类型标识字符。
     * @return 对象池中此类型的一个对象，如果对象池中无此类型的对象，则返回 null 。
     */
    static getItem(sign: string): any;
}
interface IPoolObject {
    /**
     * 深度拷贝
     */
    clone(): IPoolObject;
    /**
     * 重置
     */
    onPoolRecover(): void;
    /** 返回给对象池 */
    poolRecover(): any;
}
declare class PoolObject implements IPoolObject {
    /**
    * 深度拷贝
    */
    clone(): PoolObject;
    /**
     * 重置
     */
    onPoolRecover(): void;
    /** 从对象池哪对象 */
    static PoolGet<T>(): T;
    /** 返回给对象池 */
    poolRecover(): void;
}
declare class Random {
    static range(min: number, max: number): number;
    static rangeBoth(min: number, max: number): number;
    static rangeBetween(min: number, max: number): number;
    static GetDisorderList<T>(list: Array<T>): Array<T>;
}
declare function toStringArray(txt: string, separator?: RegExp): string[];
declare function toIntArray(txt: string, separator?: RegExp): number[];
declare function toFloatArray(txt: string, separator?: RegExp): number[];
declare function toInt(val: string): number;
declare function toFloat(val: string): number;
declare function toBoolean(val: any): boolean;
declare function toBooleanArray(txt: string, separator?: RegExp): boolean[];
declare function configCellToArray(txt: string, separator?: RegExp): string[];
declare function csvGetInt(csv: string[], i: number): number;
declare function csvGetFloat(csv: string[], i: number): number;
declare function csvGetBoolean(csv: string[], i: number): boolean;
declare function csvGetString(csv: string[], i: number): string;
declare function firstUpperCase(str: string): string;
/**
 * format('{0} {1} {2}', params1, params2, params3)
 * format('{0} {1:U} {2:L}', params1, params2, params3)
 * @param value
 * @param args
 */
declare function format(value: any, ...args: any[]): string;
declare function formatPattern(match: any, arg: any): string;
declare function isNullOrWhiteSpace(value: string): boolean;
declare function isStartOrEndWithSpace(s: string): boolean;
declare function isStartOrEndWithNumber(s: string): boolean;
declare function trim(s: any): any;
declare class __NumberUnitText {
    static B: string;
    static M: string;
    static K: string;
}
declare class __NumberUnitValue {
    static K: number;
    static M: number;
    static B: number;
}
/**
 * 格式化数字 为K M B格式化
 * @param value 数字
 * @param fixed 数字保留几位
 */
declare function formatNumberUnit(value: number, fixed?: number): string;
declare function formatArrayNumberUnit(fmat: string, ...numbs: number[]): string;
/**
 * 数字转化为字母 大写
 * @param value 数字
 * @param isCapital 是否大写
 */
declare function numberToLetter(value: number, isCapital?: boolean): string;
declare function getStringLength(str: any): number;
declare class StringUtils {
    /** 字符串 */
    static readonly empty = "";
    /** 小数点多少位 */
    static FloatLength(num: number, floatM?: number): string;
    /** 填充长度 */
    static FillLeft(str: string, length: number, c?: string): string;
    static FillRight(str: string, length: number, c?: string): string;
    private static _numberTransfrom;
    static readonly numberTransfrom: NumberTransfrom;
    /** 获取中文数字 */
    static GetChineseNum(num: number): string;
}
declare class SyncHellper {
    static frameRate: number;
    static waitTime(millisecond: number): Promise<void>;
    static waitFrame(frameNum: number): Promise<void>;
}
declare enum TypeName {
    mstring = "string",
    mnumber = "number",
    mboolean = "boolean",
    mfunction = "function",
    mobject = "object"
}
declare type TKey = number | string;
declare type int = number;
declare type uint = number;
declare type float = number;
declare type long = number;
declare type double = number;
declare type Guid = number;
declare type int8 = number;
declare type int16 = number;
declare type int32 = number;
declare type int64 = number;
declare type uint8 = number;
declare type uint16 = number;
declare type uint32 = number;
declare type uint64 = number;
declare type float32 = number;
declare type float64 = number;
declare type intwf = number;
declare class Dictionary<K, T> {
    private dict;
    private _count;
    readonly count: number;
    add(key: string | number, val: T): void;
    set(key: string | number, val: T): void;
    remove(key: string | number): void;
    hasKey(key: string | number): boolean;
    getValue(key: string | number): T;
    getValueOrDefault(key: string | number, _default?: T): T;
    __getDict(): {
        [key: string]: T;
        [key: number]: T;
    };
    getValues(): T[];
    getKeys(): any[];
    clear(): void;
}
interface DictionaryObject<K, V> {
}
/** 二维Key字典列表 */
declare class DoubleKeyList<K1, K2, V> {
    private key1Dict;
    getDict(key1: K1): UnOrderMultiMap<K2, V>;
    getOrCreateDict(key1: K1): UnOrderMultiMap<K2, V>;
    addItem(key1: K1, key2: K2, v: V): void;
    removeItem(key1: K1, key2: K2, v: V): void;
    getItemList(key1: K1, key2: K2): V[];
}
/** 二维Key字典 */
declare class DoubleKeyMap<K1, K2, V> {
    private key1Dict;
    private getDict;
    private getOrCreateDict;
    add(key1: K1, key2: K2, v: V): void;
    remove(key1: K1, key2: K2): void;
    removeValues(key1: K1): void;
    getValue(key1: K1, key2: K2): V;
    getValues(key1: K1): V[];
    clear(): void;
}
declare class UnOrderMultiMap<T, K> {
    private dictionary;
    private queue;
    private FetchList;
    private RecycleList;
    sortItem(t: T, compareFn?: (a: K, b: K) => number): void;
    addItem(t: T, k: K): void;
    removeItem(t: T, k: K): boolean;
    removeList(t: T): boolean;
    readonly count: int;
    getAll(t: T): K[];
    get(t: T): K[];
    contains(t: T, k: K): boolean;
    containsKey(t: T): boolean;
    clear(): void;
    getKeys(): T[];
}
/** 绑定 */
declare class Bindable<T> {
    private _changeWatcher;
    private _value;
    constructor(value?: T);
    value: T;
    add(listener: (T: any) => void, self: any): void;
    remove(listener: (T: any) => void, self: any): void;
    removeAll(): void;
    bindTo(target: Bindable<T>): void;
    unbind(target: Bindable<T>): void;
    private setValue;
}
/**
 * 事件
 */
declare class Emitter {
    /** 监听数组 */
    private listeners;
    /** 是否把事件名称抛当参数抛给回调 */
    private isDispatchName;
    constructor(isDispatchName?: boolean);
    /**
     * 注册事件
     * @param name 事件名称
     * @param callback 回调函数
     * @param context 上下文
     */
    add(name: string, callback: Function, context: any): void;
    /**
     * 移除事件
     * @param name 事件名称
     * @param callback 回调函数
     * @param context 上下文
     */
    remove(name: string, callback: Function, context: any): void;
    /**
     * 发送事件
     * @param name 事件名称
     */
    dispatch(name: string, ...args: any[]): void;
}
/**
 * 观察者
 */
declare class Observer {
    /** 回调函数 */
    private callback;
    /** 上下文 */
    private context;
    constructor(callback: Function, context: any);
    /**
     * 发送通知
     * @param args 不定参数
     */
    notify(...args: any[]): void;
    /**
     * 上下文比较
     * @param context 上下文
     */
    compar(context: any): boolean;
    /**
     * 上下文比较
     * @param context 上下文
     */
    comparAll(callback: Function, context: any): boolean;
}
declare class Signal {
    private _listeners;
    add(listener: () => void, self: any): void;
    addOnce(listener: () => void, self: any): void;
    private hasListener;
    remove(listener: () => void, self: any): void;
    removeAll(): void;
    dispatch(): void;
}
declare class SignalHandler {
    private _handler;
    private _self;
    private _once;
    constructor(handler: () => void, self: any, once?: boolean);
    apply(): void;
    equals(handler: () => void, self: any): boolean;
    once(): boolean;
}
declare class Typed2Signal<T, Y> {
    private _listeners;
    add(listener: (T: any, Y: any) => void, self: any): void;
    addOnce(listener: (T: any, Y: any) => void, self: any): void;
    private hasListener;
    remove(listener: (T: any, Y: any) => void, self: any): void;
    removeAll(): void;
    dispatch(value1: T, value2: Y): void;
}
declare class Typed2SignalHandler<T, Y> {
    private _handler;
    private _self;
    private _once;
    constructor(handler: (T: any, Y: any) => void, self: any, once?: boolean);
    apply(arg1: T, arg2: Y): void;
    equals(handler: (T: any, Y: any) => void, self: any): boolean;
    once(): boolean;
}
declare class Typed3Signal<T, Y, U> {
    private _listeners;
    add(listener: (T: any, Y: any, U: any) => void, self: any): void;
    addOnce(listener: (T: any, Y: any, U: any) => void, self: any): void;
    private hasListener;
    remove(listener: (T: any, Y: any, u: any) => void, self: any): void;
    removeAll(): void;
    dispatch(value1: T, value2: Y, value3: U): void;
}
declare class Typed3SignalHandler<T, Y, U> {
    private _handler;
    private _self;
    private _once;
    constructor(handler: (T: any, Y: any, U: any) => void, self: any, once?: boolean);
    apply(arg1: T, arg2: Y, arg3: U): void;
    equals(handler: (T: any, Y: any, U: any) => void, self: any): boolean;
    once(): boolean;
}
declare class TypedSignal<T> {
    private _listeners;
    add(listener: (T: any) => void, self: any): void;
    addOnce(listener: (T: any) => void, self: any): void;
    private hasListener;
    remove(listener: (T: any) => void, self: any): void;
    removeAll(): void;
    dispatch(value: T): void;
}
declare class TypedSignalHandler<T> {
    private _handler;
    private _self;
    private _once;
    constructor(handler: (T: any) => void, self: any, once?: boolean);
    apply(arg: T): void;
    equals(handler: (T: any) => void, self: any): boolean;
    once(): boolean;
}
