export default class LayaExtends_Texture2D {
    private static isInited;
    static Init(): void;
    constructor();
    setFloatPixels(pixels: Uint8Array | Float32Array, miplevel?: number): void;
    _setFloatPixels(pixels: Float32Array, miplevel: number, width: number, height: number): void;
}
