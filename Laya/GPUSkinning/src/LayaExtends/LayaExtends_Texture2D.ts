import LayaGL = Laya.LayaGL;
import WebGLContext = Laya.WebGLContext;
import TextureFormat = Laya.TextureFormat;
export default class LayaExtends_Texture2D
{
    private static isInited = false;
    static Init()
    {
        if(this.isInited)
            return;

        this.isInited = true;
        new LayaExtends_Texture2D();
    }


    constructor()
    {
        Laya.Texture2D.prototype.setFloatPixels = this.setFloatPixels;
        Laya.Texture2D.prototype._setFloatPixels = this._setFloatPixels;
    }

    /**
	 * 通过像素填充纹理。
	 * @param	pixels 像素。
	 * @param   miplevel 层级。
	 */
    setFloatPixels(pixels: Uint8Array | Float32Array, miplevel: number = 0): void 
    {
		if (this._gpuCompressFormat())
			throw "Texture2D:the format is GPU compression format.";
		if (!pixels)
			throw "Texture2D:pixels can't be null.";
		var width: number = Math.max(this._width >> miplevel, 1);
		var height: number = Math.max(this._height >> miplevel, 1);
		var pixelsCount: number = width * height * this._getFormatByteCount();
		if (pixels.length < pixelsCount)
			throw "Texture2D:pixels length should at least " + pixelsCount + ".";
		this._setFloatPixels(pixels, miplevel, width, height);

		if (this._canRead)
			this._pixels = pixels;

		this._readyed = true;
		this._activeResource();
    }
    
	/**
	 * @internal
	 */
	_setFloatPixels(pixels: Float32Array, miplevel: number, width: number, height: number): void {
        var gl: WebGLRenderingContext = LayaGL.instance;
        
        var halfFloat = gl.getExtension('OES_texture_half_float');
        gl.getExtension('OES_texture_half_float_linear');
        
		var textureType: number = this._glTextureType;
		var glFormat: number = this._getGLFormat();
        WebGLContext.bindTexture(gl, textureType, this._glTexture);

        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(textureType, miplevel, gl.RGBA, width, height, 0, glFormat, halfFloat.HALF_FLOAT_OES, pixels);

	}

}
