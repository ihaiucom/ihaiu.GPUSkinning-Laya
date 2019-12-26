class ByteArray {
    get endian() {
        return this.$endian == 0 /* LITTLE_ENDIAN */ ? "littleEndian" : "bigEndian";
    }
    set endian(value) {
        this.$endian = value == "littleEndian" ? 0 /* LITTLE_ENDIAN */ : 1 /* BIG_ENDIAN */;
    }
    get readAvailable() {
        return this.write_position - this._position;
    }
    get buffer() {
        return this.data.buffer.slice(0, this.write_position);
    }
    set buffer(value) {
        let wpos = value.byteLength;
        let uint8 = new Uint8Array(value);
        let bufferExtSize = this.bufferExtSize;
        let bytes;
        if (bufferExtSize == 0) {
            bytes = new Uint8Array(wpos);
        }
        else {
            let multi = (wpos / bufferExtSize | 0) + 1;
            bytes = new Uint8Array(multi * bufferExtSize);
        }
        bytes.set(uint8);
        this.write_position = wpos;
        this._bytes = bytes;
        this.data = new DataView(bytes.buffer);
    }
    get rawBuffer() {
        return this.data.buffer;
    }
    get bytes() {
        return this._bytes;
    }
    get dataView() {
        return this.data;
    }
    set dataView(value) {
        this.buffer = value.buffer;
    }
    get bufferOffset() {
        return this.data.byteOffset;
    }
    get position() {
        return this._position;
    }
    set position(value) {
        this._position = value;
        if (value > this.write_position) {
            this.write_position = value;
        }
    }
    get length() {
        return this.write_position;
    }
    set length(value) {
        this.write_position = value;
        if (this.data.byteLength > value) {
            this._position = value;
        }
        this._validateBuffer(value);
    }
    get bytesAvailable() {
        return this.data.byteLength - this._position;
    }
    constructor(buffer, bufferExtSize) {
        if (bufferExtSize === void 0) {
            bufferExtSize = 0;
        }
        /**
         * @private
         */
        this.bufferExtSize = 0; //Buffer expansion size
        /**
         * @private
         */
        this.EOF_byte = -1;
        /**
         * @private
         */
        this.EOF_code_point = -1;
        if (bufferExtSize < 0) {
            bufferExtSize = 0;
        }
        this.bufferExtSize = bufferExtSize;
        let bytes, wpos = 0;
        if (buffer) {
            let uint8 = void 0;
            if (buffer instanceof Uint8Array) {
                uint8 = buffer;
                wpos = buffer.length;
            }
            else {
                wpos = buffer.byteLength;
                uint8 = new Uint8Array(buffer);
            }
            if (bufferExtSize == 0) {
                bytes = new Uint8Array(wpos);
            }
            else {
                let multi = (wpos / bufferExtSize | 0) + 1;
                bytes = new Uint8Array(multi * bufferExtSize);
            }
            bytes.set(uint8);
        }
        else {
            bytes = new Uint8Array(bufferExtSize);
        }
        this.write_position = wpos;
        this._position = 0;
        this._bytes = bytes;
        this.data = new DataView(bytes.buffer);
        this.endian = "bigEndian";
    }
    _validateBuffer(value) {
        if (this.data.byteLength < value) {
            let be = this.bufferExtSize;
            let tmp = void 0;
            if (be == 0) {
                tmp = new Uint8Array(value);
            }
            else {
                let nLen = ((value / be >> 0) + 1) * be;
                tmp = new Uint8Array(nLen);
            }
            tmp.set(this._bytes);
            this._bytes = tmp;
            this.data = new DataView(tmp.buffer);
        }
    }
    clear() {
        let buffer = new Uint8Array(this.bufferExtSize);
        this.data = new DataView(buffer);
        this._bytes = new Uint8Array(buffer);
        this._position = 0;
        this.write_position = 0;
    }
    readInt() {
        if (this.validate(4 /* SIZE_OF_INT32 */)) {
            var value = this.data.getInt32(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 4 /* SIZE_OF_INT32 */;
            return value;
        }
    }
    readShort() {
        if (this.validate(2 /* SIZE_OF_INT16 */)) {
            var value = this.data.getInt16(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 2 /* SIZE_OF_INT16 */;
            return value;
        }
    }
    readByte() {
        if (this.validate(1 /* SIZE_OF_INT8 */))
            return this.data.getInt8(this.position++);
    }
    readBytes(bytes, offset, length) {
        if (offset === void 0) {
            offset = 0;
        }
        if (length === void 0) {
            length = 0;
        }
        if (!bytes) {
            return;
        }
        var pos = this._position;
        var available = this.write_position - pos;
        if (available < 0) {
            this.$error(1025);
            return;
        }
        if (length == 0) {
            length = available;
        }
        else if (length > available) {
            this.$error(1025);
            return;
        }
        bytes.validateBuffer(offset + length);
        bytes._bytes.set(this._bytes.subarray(pos, pos + length), offset);
        this.position += length;
    }
    readUTF() {
        var length = this.readUnsignedShort();
        if (length > 0) {
            return this.readUTFBytes(length);
        }
        else {
            return "";
        }
    }
    readUTFBytes(length) {
        if (!this.validate(length)) {
            return;
        }
        var data = this.data;
        var bytes = new Uint8Array(data.buffer, data.byteOffset + this._position, length);
        this.position += length;
        return this.decodeUTF8(bytes);
    }
    readUnsignedInt() {
        if (this.validate(4 /* SIZE_OF_UINT32 */)) {
            var value = this.data.getUint32(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 4 /* SIZE_OF_UINT32 */;
            return value;
        }
    }
    readUnsignedByte() {
        if (this.validate(1 /* SIZE_OF_UINT8 */))
            return this._bytes[this.position++];
    }
    readUnsignedShort() {
        if (this.validate(2 /* SIZE_OF_UINT16 */)) {
            var value = this.data.getUint16(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 2 /* SIZE_OF_UINT16 */;
            return value;
        }
    }
    readBoolean() {
        if (this.validate(1 /* SIZE_OF_BOOLEAN */))
            return !!this._bytes[this.position++];
    }
    readFloat() {
        if (this.validate(4 /* SIZE_OF_FLOAT32 */)) {
            var value = this.data.getFloat32(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 4 /* SIZE_OF_FLOAT32 */;
            return value;
        }
    }
    readDouble() {
        if (this.validate(8 /* SIZE_OF_FLOAT64 */)) {
            var value = this.data.getFloat64(this._position, this.$endian == 0 /* LITTLE_ENDIAN */);
            this.position += 8 /* SIZE_OF_FLOAT64 */;
            return value;
        }
    }
    ////////////////////
    /////write
    ////////////////////
    writeUTF(value) {
        var utf8bytes = this.encodeUTF8(value);
        var length = utf8bytes.length;
        this.validateBuffer(2 /* SIZE_OF_UINT16 */ + length);
        this.data.setUint16(this._position, length, this.$endian == 0 /* LITTLE_ENDIAN */);
        this.position += 2 /* SIZE_OF_UINT16 */;
        this._writeUint8Array(utf8bytes, false);
    }
    writeUTFBytes(value) {
        this._writeUint8Array(this.encodeUTF8(value));
    }
    writeInt(value) {
        this.validateBuffer(4 /* SIZE_OF_INT32 */);
        this.data.setInt32(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
        this.position += 4 /* SIZE_OF_INT32 */;
    }
    writeShort(value) {
        this.validateBuffer(2 /* SIZE_OF_INT16 */);
        this.data.setInt16(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
        this.position += 2 /* SIZE_OF_INT16 */;
    }
    writeByte(value) {
        this.validateBuffer(1 /* SIZE_OF_INT8 */);
        this._bytes[this.position++] = value & 0xff;
    }
    writeBytes(bytes, offset, length) {
        if (offset === void 0) {
            offset = 0;
        }
        if (length === void 0) {
            length = 0;
        }
        var writeLength;
        if (offset < 0) {
            return;
        }
        if (length < 0) {
            return;
        }
        else if (length == 0) {
            writeLength = bytes.length - offset;
        }
        else {
            writeLength = Math.min(bytes.length - offset, length);
        }
        if (writeLength > 0) {
            this.validateBuffer(writeLength);
            this._bytes.set(bytes._bytes.subarray(offset, offset + writeLength), this._position);
            this.position = this._position + writeLength;
        }
    }
    writeBoolean(value) {
        this.validateBuffer(1 /* SIZE_OF_BOOLEAN */);
        this._bytes[this.position++] = +value;
    }
    writeDouble(value) {
        this.validateBuffer(8 /* SIZE_OF_FLOAT64 */);
        this.data.setFloat64(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
        this.position += 8 /* SIZE_OF_FLOAT64 */;
    }
    writeFloat(value) {
        this.validateBuffer(4 /* SIZE_OF_FLOAT32 */);
        this.data.setFloat32(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
        this.position += 4 /* SIZE_OF_FLOAT32 */;
    }
    writeUnsignedInt(value) {
        this.validateBuffer(4 /* SIZE_OF_UINT32 */);
        this.data.setUint32(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
        this.position += 4 /* SIZE_OF_UINT32 */;
    }
    writeUnsignedShort(value) {
        this.validateBuffer(2 /* SIZE_OF_UINT16 */);
        this.data.setUint16(this._position, value, this.$endian == 0 /* LITTLE_ENDIAN */);
        this.position += 2 /* SIZE_OF_UINT16 */;
    }
    validate(len) {
        let bl = this._bytes.byteLength;
        if (bl > 0 && this._position + len <= bl) {
            return true;
        }
        else {
            this.$error(1025);
            return false;
        }
    }
    validateBuffer(len) {
        this.write_position = len > this.write_position ? len : this.write_position;
        len += this._position;
        this._validateBuffer(len);
    }
    encodeUTF8(str) {
        var pos = 0;
        var codePoints = this.stringToCodePoints(str);
        var outputBytes = [];
        while (codePoints.length > pos) {
            var code_point = codePoints[pos++];
            if (this.inRange(code_point, 0xD800, 0xDFFF)) {
                this.encoderError(code_point);
            }
            else if (this.inRange(code_point, 0x0000, 0x007f)) {
                outputBytes.push(code_point);
            }
            else {
                var count = void 0, offset = void 0;
                if (this.inRange(code_point, 0x0080, 0x07FF)) {
                    count = 1;
                    offset = 0xC0;
                }
                else if (this.inRange(code_point, 0x0800, 0xFFFF)) {
                    count = 2;
                    offset = 0xE0;
                }
                else if (this.inRange(code_point, 0x10000, 0x10FFFF)) {
                    count = 3;
                    offset = 0xF0;
                }
                outputBytes.push(this.div(code_point, Math.pow(64, count)) + offset);
                while (count > 0) {
                    var temp = this.div(code_point, Math.pow(64, count - 1));
                    outputBytes.push(0x80 + (temp % 64));
                    count -= 1;
                }
            }
        }
        return new Uint8Array(outputBytes);
    }
    decodeUTF8(data) {
        var fatal = false;
        var pos = 0;
        var result = "";
        var code_point;
        var utf8_code_point = 0;
        var utf8_bytes_needed = 0;
        var utf8_bytes_seen = 0;
        var utf8_lower_boundary = 0;
        while (data.length > pos) {
            var _byte = data[pos++];
            if (_byte == this.EOF_byte) {
                if (utf8_bytes_needed != 0) {
                    code_point = this.decoderError(fatal);
                }
                else {
                    code_point = this.EOF_code_point;
                }
            }
            else {
                if (utf8_bytes_needed == 0) {
                    if (this.inRange(_byte, 0x00, 0x7F)) {
                        code_point = _byte;
                    }
                    else {
                        if (this.inRange(_byte, 0xC2, 0xDF)) {
                            utf8_bytes_needed = 1;
                            utf8_lower_boundary = 0x80;
                            utf8_code_point = _byte - 0xC0;
                        }
                        else if (this.inRange(_byte, 0xE0, 0xEF)) {
                            utf8_bytes_needed = 2;
                            utf8_lower_boundary = 0x800;
                            utf8_code_point = _byte - 0xE0;
                        }
                        else if (this.inRange(_byte, 0xF0, 0xF4)) {
                            utf8_bytes_needed = 3;
                            utf8_lower_boundary = 0x10000;
                            utf8_code_point = _byte - 0xF0;
                        }
                        else {
                            this.decoderError(fatal);
                        }
                        utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
                        code_point = null;
                    }
                }
                else if (!this.inRange(_byte, 0x80, 0xBF)) {
                    utf8_code_point = 0;
                    utf8_bytes_needed = 0;
                    utf8_bytes_seen = 0;
                    utf8_lower_boundary = 0;
                    pos--;
                    code_point = this.decoderError(fatal, _byte);
                }
                else {
                    utf8_bytes_seen += 1;
                    utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
                    if (utf8_bytes_seen !== utf8_bytes_needed) {
                        code_point = null;
                    }
                    else {
                        var cp = utf8_code_point;
                        var lower_boundary = utf8_lower_boundary;
                        utf8_code_point = 0;
                        utf8_bytes_needed = 0;
                        utf8_bytes_seen = 0;
                        utf8_lower_boundary = 0;
                        if (this.inRange(cp, lower_boundary, 0x10FFFF) && !this.inRange(cp, 0xD800, 0xDFFF)) {
                            code_point = cp;
                        }
                        else {
                            code_point = this.decoderError(fatal, _byte);
                        }
                    }
                }
            }
            //Decode string
            if (code_point !== null && code_point !== this.EOF_code_point) {
                if (code_point <= 0xFFFF) {
                    if (code_point > 0)
                        result += String.fromCharCode(code_point);
                }
                else {
                    code_point -= 0x10000;
                    result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
                    result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
                }
            }
        }
        return result;
    }
    encoderError(code_point) {
        this.$error(1026);
    }
    decoderError(fatal, opt_code_point = 0) {
        if (fatal) {
            this.$error(1027);
        }
        return opt_code_point || 0xFFFD;
    }
    inRange(a, min, max) {
        return min <= a && a <= max;
    }
    div(n, d) {
        return Math.floor(n / d);
    }
    stringToCodePoints(string) {
        var cps = [];
        // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
        var i = 0, n = string.length;
        while (i < string.length) {
            var c = string.charCodeAt(i);
            if (!this.inRange(c, 0xD800, 0xDFFF)) {
                cps.push(c);
            }
            else if (this.inRange(c, 0xDC00, 0xDFFF)) {
                cps.push(0xFFFD);
            }
            else {
                if (i == n - 1) {
                    cps.push(0xFFFD);
                }
                else {
                    var d = string.charCodeAt(i + 1);
                    if (this.inRange(d, 0xDC00, 0xDFFF)) {
                        var a = c & 0x3FF;
                        var b = d & 0x3FF;
                        i += 1;
                        cps.push(0x10000 + (a << 10) + b);
                    }
                    else {
                        cps.push(0xFFFD);
                    }
                }
            }
            i += 1;
        }
        return cps;
    }
    toString() {
        return "[ByteArray] length:" + this.length + ", bytesAvailable:" + this.bytesAvailable;
    }
    _writeUint8Array(bytes, validateBuffer = true) {
        if (validateBuffer === void 0) {
            validateBuffer = true;
        }
        var pos = this._position;
        var npos = pos + bytes.length;
        if (validateBuffer) {
            this.validateBuffer(npos);
        }
        this.bytes.set(bytes, pos);
        this.position = npos;
    }
    $error(code) {
        throw new Error("错误号" + code + ":");
    }
}
function GameCommonLibInit() {
    // Helpers
    window['BitHelper'] = BitHelper;
    window['Gid'] = Gid;
    window['Mathf'] = Mathf;
    window['NumberTransfrom'] = NumberTransfrom;
    window['Pool'] = Pool;
    window['PoolObject'] = PoolObject;
    window['Random'] = Random;
    window['StringUtils'] = StringUtils;
    window['SyncHellper'] = SyncHellper;
    window['__NumberUnitText'] = __NumberUnitText;
    window['__NumberUnitValue'] = __NumberUnitValue;
    // MapList
    window['Dictionary'] = Dictionary;
    window['DoubleKeyList'] = DoubleKeyList;
    window['DoubleKeyMap'] = DoubleKeyMap;
    window['UnOrderMultiMap'] = UnOrderMultiMap;
    //Signals
    window['Bindable'] = Bindable;
    window['Emitter'] = Emitter;
    window['Observer'] = Observer;
    window['Signal'] = Signal;
    window['SignalHandler'] = SignalHandler;
    window['Typed2Signal'] = Typed2Signal;
    window['Typed2SignalHandler'] = Typed2SignalHandler;
    window['Typed3Signal'] = Typed3Signal;
    window['Typed3SignalHandler'] = Typed3SignalHandler;
    window['TypedSignal'] = TypedSignal;
    window['TypedSignalHandler'] = TypedSignalHandler;
    window['UnOrderMultiMap'] = UnOrderMultiMap;
    window['UnOrderMultiMap'] = UnOrderMultiMap;
    window['ByteArray'] = ByteArray;
}
window['GameCommonLibInit'] = GameCommonLibInit;
class BitHelper {
    /** 是否包含 */
    static Contain(val, type) {
        return (val & type) != 0;
    }
    /** 添加 */
    static Add(val, type) {
        return val | type;
    }
    static BitUnset(ui, len, bit) {
        let mask = ((1 << len + 1) - 1);
        return ui & ~(mask << bit);
    }
    static BitSet(ui, len, bit, val) {
        let mask = ((1 << len + 1) - 1);
        let nv = mask & val;
        return ui & ~(mask << bit) | (nv << bit);
    }
    static BitGet(ui, len, bit) {
        let mask = ((1 << len + 1) - 1);
        return ui & (mask << bit);
    }
    static Bit2Str(bit) {
        let kb = bit / 8 / 1024;
        if (kb < 1024) {
            return StringUtils.FloatLength(kb, 100) + " KB";
        }
        else {
            let mb = kb / 1024;
            return StringUtils.FloatLength(mb, 100) + " MB";
        }
    }
    static Byte2Str(bytesSize) {
        let kb = bytesSize / 1024;
        if (kb < 1024) {
            return StringUtils.FloatLength(kb, 100) + " KB";
        }
        else {
            let mb = kb / 1024;
            return StringUtils.FloatLength(mb, 100) + " MB";
        }
    }
}
/*
 * @Descripttion:
 * @version:
 * @Author: ZengFeng
 * @Date: 2019-10-18 11:16:50
 * @LastEditors: ZengFeng
 * @LastEditTime: 2019-10-18 12:20:13
 */
function isNumber(x) {
    return typeof x === "number";
}
//判断是否是正整数
function isInt(s) {
    if (s != null) {
        var r, re;
        re = /\d*/i; //\d表示数字,*表示匹配多个数字
        r = s.match(re);
        return (r == s) ? true : false;
    }
    return false;
}
function isString(x) {
    return typeof x === "string";
}
function isNullOrEmpty(x) {
    if (x instanceof Array)
        return x == null || x == undefined;
    return x == null || x == undefined || x == "";
}
function isNaNOrEmpty(x) {
    return isNaN(x) || x === undefined || x === null;
}
// 获取类名
function getClassName(obj) {
    return obj["constructor"]["name"];
}
// 获取函数名
function getFunctionName(method) {
    return method["name"] || method.toString().match(/function\s*([^(]*)\(/)[1];
}
// 获取时间戳
function getTime() {
    return new Date().getTime();
}
// 获取时间戳 （秒）
function getTimeStamp() {
    return Math.floor(getTime() / 1000);
}
function bToStr(b) {
    if (b < 1024) {
        return b + "B";
    }
    let kb = b / 1024;
    return kbToStr(kb);
}
function kbToStr(kb) {
    if (kb < 1024) {
        return Math.ceil(kb) + "KB";
    }
    let mb = kb / 1024;
    if (mb < 1024) {
        return (Math.ceil(mb * 100) / 100) + "MB";
    }
    let gb = mb / 1024;
    return (Math.ceil(gb * 100) / 100) + "GB";
}
function arrayRemoveItem(arr, item) {
    var i = arr.indexOf(item);
    if (i != -1) {
        arr.splice(i, 1);
        return true;
    }
    return false;
}
function arrayCopyInt(dst, src) {
    dst.length = 0;
    for (let i = 0, len = src.length; i < len; i++) {
        dst.push(src[i]);
    }
}
function objRestDefaultValue(o) {
    for (let k in o) {
        let typeName = typeof (o[k]);
        switch (typeName) {
            case TypeName.mnumber:
                o[k] = 0;
                break;
            case TypeName.mboolean:
                o[k] = false;
                break;
            case TypeName.mstring:
                o[k] = "";
                break;
            case TypeName.mobject:
                if (o[k]) {
                    objRestDefaultValue(o[k]);
                }
                break;
        }
    }
}

/**对象深度拷贝值*/
function objCopyValue(from, to, isUsePool = false)
{
	var __CloneUseSetKeyMap = from.constructor['__CloneUseSetKeyMap'];
	for(var k in from)
	{
		var typeName = typeof(from[k]);
		switch(typeName)
		{
			case TypeName.mnumber:
			case TypeName.mstring:
			case TypeName.mboolean:
				to[k] = from[k];
				break;
			case TypeName.mobject:
				if(from[k] !== undefined && from[k] !== null)
				{
					if(__CloneUseSetKeyMap && __CloneUseSetKeyMap[k])
					{
						to[k] = from[k];
						break;
					}

					if(!to[k])
					{

						if(isUsePool)
						{
							to[k] = Pool.createByClass(from[k].constructor);
						}
						else
						{
							to[k] = new (from[k].constructor)();
						}
					}
					objCopyValue(from[k], to[k]);
				}
				else
				{
					objRestDefaultValue(to[k]);
				}
				break;

		}
	}
}


/** 对象深度克隆 */
function objectClone(from, isUsePool = false)
{
	var __CloneUseSetKeyMap = from.constructor['__CloneUseSetKeyMap'];
	var to;
	if (isUsePool)
	{
		to = Pool.createByClass(from.constructor);
	}
	else
	{
		to = new (from.constructor());
	}
	for(let k in from)
	{
		let typeName = typeof(from[k]);
		switch(typeName)
		{
			case TypeName.mnumber:
			case TypeName.mstring:
			case TypeName.mboolean:
				to[k] = from[k];
				break;
			case TypeName.mobject:
				if(from[k] !== undefined && from[k] !== null)
				{
					if(__CloneUseSetKeyMap && __CloneUseSetKeyMap[k])
					{
						to[k] = from[k];
					}
					else
					{
						to[k] = objectClone(from[k], isUsePool);
					}
				}
				break;
		}
	}

	return to;

}

/** Map -- 清除 */
function mapClear(map, isBaseType) {
    if (!isBaseType) {
        map.forEach((v, k) => {
            if (v.poolRecover) {
                v.poolRecover();
            }
        });
    }
    map.clear();
}
/** Map -- 拷贝数据 */
function mapCopyValue(from, to, isBaseType) {
    mapClear(to, isBaseType);
    from.forEach((v, k) => {
        to.set(k, v);
    });
}
/** Map -- 深度克隆数据对象 */
function mapClone(from, to, isPoolRecoverFrom, isBaseType) {
    let m;
    if (to) {
        mapClear(to);
        m = to;
    }
    else {
        m = Pool.createByClass(Map);
        m.clear();
    }
    from.forEach((v, k) => {
        m.set(k, v.clone());
    });
    if (isPoolRecoverFrom) {
        mapClear(from);
        Pool.recoverByClass(from);
    }
    return m;
}
/** Map -- 克隆基本类型数据 */
function mapCloneBase(from, isPoolRecoverFrom) {
    let m = Pool.createByClass(Map);
    from.forEach((v, k) => {
        m.set(k, v);
    });
    if (isPoolRecoverFrom) {
        mapClear(from, true);
        Pool.recoverByClass(from);
    }
    return m;
}
/** 数组 -- 清除 */
function arrayClear(list, isBaseType) {
    if (!isBaseType) {
        let item;
        for (let i = 0, len = list.length; i < len; i++) {
            item = list[i];
            if (item && item.poolRecover) {
                item.poolRecover();
            }
        }
    }
    list.length = 0;
}
/** 数组 -- 拷贝数据 */
function arrayCopyValue(from, to, isBaseType) {
    arrayClear(to, isBaseType);
    for (let i = 0, len = from.length; i < len; i++) {
        to.push(from[i]);
    }
}
/** 数组 -- 深度克隆数据对象 */
function arrayClone(from, to, isPoolRecoverFrom) {
    let m;
    if (to) {
        arrayClear(to);
        m = to;
    }
    else {
        m = Pool.createByClass(Array);
        m.length = 0;
    }
    for (let i = 0, len = from.length; i < len; i++) {
        m.push(from[i].clone());
    }
    if (isPoolRecoverFrom) {
        arrayClear(from);
        Pool.recoverByClass(from);
    }
    return m;
}
/** 数组 -- 克隆基本类型数据 */
function arrayCloneBase(from, isPoolRecoverFrom) {
    let m = Pool.createByClass(Array);
    m.length = 0;
    for (let i = 0, len = from.length; i < len; i++) {
        m.push(from[i]);
    }
    if (isPoolRecoverFrom) {
        from.length = 0;
        Pool.recoverByClass(from);
    }
    return m;
}
window['isNumber'] = isNumber;
window['isInt'] = isInt;
window['isString'] = isString;
window['isNullOrEmpty'] = isNullOrEmpty;
window['isNaNOrEmpty'] = isNaNOrEmpty;
window['getClassName'] = getClassName;
window['getFunctionName'] = getFunctionName;
window['getTime'] = getTime;
window['getTimeStamp'] = getTimeStamp;
window['bToStr'] = bToStr;
window['kbToStr'] = kbToStr;
window['arrayRemoveItem'] = arrayRemoveItem;
window['arrayCopyInt'] = arrayCopyInt;
window['objRestDefaultValue'] = objRestDefaultValue;
window['objCopyValue'] = objCopyValue;
window['objectClone'] = objectClone;
window['mapClear'] = mapClear;
window['mapCopyValue'] = mapCopyValue;
window['mapClone'] = mapClone;
window['mapCloneBase'] = mapCloneBase;
window['arrayClear'] = arrayClear;
window['arrayCopyValue'] = arrayCopyValue;
window['arrayClone'] = arrayClone;
window['arrayCloneBase'] = arrayCloneBase;
class Gid {
    static getGID() {
        return this._gid++;
    }
}
Gid._gid = 1;
class Mathf {
    /** 小数点多少位 */
    static FloatLength(num, floatM = 100) {
        if (floatM == 0) {
            return Math.floor(num);
        }
        return Math.floor(num * floatM) / floatM;
    }
    static clamp(num, min, max) {
        return Math.max(Math.min(num, Math.max(min, max)), Math.min(min, max));
    }
    static Clamp01(value) {
        if (value < 0.0)
            return 0.0;
        if (value > 1.0)
            return 1;
        return value;
    }
    /// <summary>
    ///   <para>Linearly interpolates between a and b by t.</para>
    /// </summary>
    /// <param name="a"></param>
    /// <param name="b"></param>
    /// <param name="t"></param>
    static Lerp(a, b, t) {
        return a + (b - a) * Mathf.Clamp01(t);
    }
    /** 弧度, 计算2个点 */
    static radian(fromX, fromY, toX, toY) {
        let dx = toX - fromX;
        let dy = toY - fromY;
        return Math.atan2(dy, dx);
    }
    /** 角度, 计算2个点 */
    static angle(fromX, fromY, toX, toY) {
        return this.radian(fromX, fromY, toX, toY) * 180 / Math.PI;
    }
    /** 角度 转 弧度 */
    static angleToRadian(angle) {
        return angle * Math.PI / 180;
    }
    /** 弧度 转 角度 */
    static radianToAngle(radian) {
        return radian * 180 / Math.PI;
    }
    /** 距离, 计算2个点 */
    static distanceangle(fromX, fromY, toX, toY) {
        let dx = toX - fromX;
        let dy = toY - fromY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    static directionPointX(fromX, fromY, toX, toY, length) {
        return Math.cos(this.radian(fromX, fromY, toX, toY)) * length + fromX;
    }
    static directionPointY(fromX, fromY, toX, toY, length) {
        return Math.sin(this.radian(fromX, fromY, toX, toY)) * length + fromY;
    }
    /** 弧度方向 点 */
    static radianPointX(radian, length, fromX) {
        return Math.cos(radian) * length + fromX;
    }
    static radianPointY(radian, length, fromY) {
        return Math.sin(radian) * length + fromY;
    }
    /** 弧度方向 点 */
    static anglePointX(angle, length, fromX) {
        return Math.cos(this.angleToRadian(angle)) * length + fromX;
    }
    static anglePointY(angle, length, fromY) {
        return Math.sin(this.angleToRadian(angle)) * length + fromY;
    }
}
class NumberTransfrom {
    constructor() {
        this.unms = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
        this.digits = ["", "十", "百", "千"];
        this.units = ["", "万", "亿", "万亿", "亿亿"];
    }
    //检查字符串s是否全为数字
    checkIsNumbers(x) {
        if (null == x) {
            return false;
        }
        for (let i = 0; i < x.length; i++) {
            let c = parseInt(x[i]);
            if (isNaN(c)) {
                return false;
            }
        }
        return true;
    }
    transfrom2(num) {
        if (null == num) {
            return "您输入的字符串地址为null！";
        }
        let str = num;
    }
    // 转换
    transfrom(num) {
        if (null == num) {
            return "您输入的字符串地址为null！";
        }
        let x = num.toString();
        if (0 == x.length) {
            return "您输入的字符串长度为0，请输入要转换的数字！";
        }
        if (x.length > 16) {
            return "您输入的字符串长度大于16，无法转换！";
        }
        //去除字符串首部的0，例如：0010->10
        let fm;
        for (fm = 0; fm < x.length; fm++) {
            if (x.charAt(fm) != '0') {
                break;
            }
        }
        x = x.substring(fm); //去除完毕
        //把字符串看作一些组，例如：123456789->1,2345,6789
        let result = "";
        let p = 0;
        let m = x.length % 4;
        let k = (m > 0 ? Math.floor(x.length / 4) + 1 : Math.floor(x.length / 4));
        //从最左边的那组开始，向右循环
        for (let i = k; i > 0; i--) {
            let len = 4;
            if (i == k && m != 0) //当i为最左边的那组时，组长度可能有变化
             {
                len = m;
            }
            let s = x.substring(p, p + len);
            let le = s.length;
            for (let j = 0; j < le; j++) {
                let n = parseInt(s.substring(j, j + 1));
                if (0 == n) {
                    if (j < le - 1 && parseInt(s.substring(j + 1, j + 2)) > 0 && !result.eEndsWith(this.unms[0])) { //加零的条件：不为最后一位 && 下一位数字大于0 && 以前没有加过“零”
                        result += this.unms[0];
                    }
                }
                else {
                    if (!(n == 1 && (result.eEndsWith(this.unms[0]) || result.length == 0) && j == le - 2)) { //处理1013一千零"十三"，1113 一千一百"一十三"
                        result += this.unms[n];
                    }
                    result += this.digits[le - j - 1];
                }
            }
            if (0 != parseInt(s)) //如果这组数字不全是 0 ，则加上单位：万，亿，万亿
             {
                result += this.units[i - 1];
            }
            p += len;
        }
        return result;
    }
}
/**
 * <p> <code>Pool</code> 是对象池类，用于对象的存储、重复使用。</p>
 * <p>合理使用对象池，可以有效减少对象创建的开销，避免频繁的垃圾回收，从而优化游戏流畅度。</p>
 */
class Pool {
    /**
     * 根据对象类型标识字符，获取对象池。
     * @param sign 对象类型标识字符。
     * @return 对象池。
     */
    static getPoolBySign(sign) {
        return Pool._poolDic[sign] || (Pool._poolDic[sign] = []);
    }
    /**
     * 清除对象池的对象。
     * @param sign 对象类型标识字符。
     */
    static clearBySign(sign) {
        if (Pool._poolDic[sign])
            Pool._poolDic[sign].length = 0;
    }
    /**
     * 将对象放到对应类型标识的对象池中。
     * @param sign 对象类型标识字符。
     * @param item 对象。
     */
    static recover(sign, item) {
        if (item["__InPool"])
            return;
        item["__InPool"] = true;
        Pool.getPoolBySign(sign).push(item);
    }
    /**
     * 根据类名进行回收，如果类有类名才进行回收，没有则不回收
     * @param	instance 类的具体实例
     */
    static recoverByClass(instance) {
        if (instance) {
            var className = instance["__className"] || instance.constructor._$gid;
            if (className)
                Pool.recover(className, instance);
        }
    }
    /**
     * 根据类名回收类的实例
     * @param	instance 类的具体实例
     */
    static createByClass(cls) {
        return Pool.getItemByClass(Pool._getClassSign(cls), cls);
    }
    static _getClassSign(cla) {
        var className = cla["__className"] || cla["_$gid"];
        if (!className) {
            cla["_$gid"] = className = Gid.getGID() + "";
        }
        return className;
    }
    /**
     * <p>根据传入的对象类型标识字符，获取对象池中此类型标识的一个对象实例。</p>
     * <p>当对象池中无此类型标识的对象时，则根据传入的类型，创建一个新的对象返回。</p>
     * @param sign 对象类型标识字符。
     * @param cls 用于创建该类型对象的类。
     * @return 此类型标识的一个对象。
     */
    static getItemByClass(sign, cls) {
        if (!Pool._poolDic[sign])
            return new cls();
        var pool = Pool.getPoolBySign(sign);
        if (pool.length) {
            var rst = pool.pop();
            rst["__InPool"] = false;
        }
        else {
            rst = new cls();
        }
        return rst;
    }
    /**
     * <p>根据传入的对象类型标识字符，获取对象池中此类型标识的一个对象实例。</p>
     * <p>当对象池中无此类型标识的对象时，则使用传入的创建此类型对象的函数，新建一个对象返回。</p>
     * @param sign 对象类型标识字符。
     * @param createFun 用于创建该类型对象的方法。
     * @param caller this对象
     * @return 此类型标识的一个对象。
     */
    static getItemByCreateFun(sign, createFun, caller) {
        var pool = Pool.getPoolBySign(sign);
        var rst = pool.length ? pool.pop() : createFun.call(caller);
        rst["__InPool"] = false;
        return rst;
    }
    /**
     * 根据传入的对象类型标识字符，获取对象池中已存储的此类型的一个对象，如果对象池中无此类型的对象，则返回 null 。
     * @param sign 对象类型标识字符。
     * @return 对象池中此类型的一个对象，如果对象池中无此类型的对象，则返回 null 。
     */
    static getItem(sign) {
        var pool = Pool.getPoolBySign(sign);
        var rst = pool.length ? pool.pop() : null;
        if (rst) {
            rst["__InPool"] = false;
        }
        return rst;
    }
}
Pool._poolDic = {};
class PoolObject {
    /**
    * 深度拷贝
    */
    clone() {
        return null;
    }
    /**
     * 重置
     */
    onPoolRecover() {
    }
    /** 从对象池哪对象 */
    static PoolGet() {
        return Pool.createByClass(this);
    }
    /** 返回给对象池 */
    poolRecover() {
        this.onPoolRecover();
        Pool.recoverByClass(this);
    }
}
class Random {
    // int
    // min <= r < max
    static range(min, max) {
        let range = max - min;
        let rand = Math.random();
        return min + Math.floor(range * rand);
    }
    // int
    // min <= r <= max
    static rangeBoth(min, max) {
        let range = max - min;
        let rand = Math.random();
        return min + Math.round(range * rand);
    }
    // int
    // min < r < max
    static rangeBetween(min, max) {
        let range = max - min;
        let rand = Math.random();
        if (Math.round(rand * range) == 0) {
            return min + 1;
        }
        else if (Math.round(rand * max) == max) {
            return max - 1;
        }
        else {
            return min + Math.round(rand * range) - 1;
        }
    }
    /// <summary>
    /// 乱序排列一个数组
    /// </summary>
    static GetDisorderList(list) {
        let countNum = list.length;
        let listA = new Array();
        let listB = new Array();
        for (let i = 0; i < countNum; i++) {
            listA.push(list[i]);
        }
        while (listB.length < countNum) {
            let index = Random.range(0, listA.length);
            if (listB.indexOf(listA[index]) === -1) {
                listB.push(listA[index]);
                listA.splice(index, 1);
            }
        }
        return listB;
    }
}
function toStringArray(txt, separator = /[:,;&]/) {
    return txt.split(separator);
}
function toIntArray(txt, separator = /[:,;&]/) {
    let list = [];
    let arr = toStringArray(txt, separator);
    for (let i = 0; i < arr.length; i++) {
        list.push(parseInt(arr[i]));
    }
    return list;
}
function toFloatArray(txt, separator = /[:,;&]/) {
    let list = [];
    let arr = toStringArray(txt, separator);
    for (let i = 0; i < arr.length; i++) {
        list.push(parseFloat(arr[i]));
    }
    return list;
}
function toInt(val) {
    return parseInt(val);
}
function toFloat(val) {
    return parseFloat(val);
}
function toBoolean(val) {
    if (val) {
        if (isNumber(val)) {
            return val != 0;
        }
        else if (isString(val)) {
            return val == "true" || parseInt(val) != 0;
        }
        return true;
    }
    else {
        return false;
    }
}
function toBooleanArray(txt, separator = /[:,;&]/) {
    let list = [];
    let arr = toStringArray(txt, separator);
    for (let i = 0; i < arr.length; i++) {
        list.push(toBoolean(arr[i]));
    }
    return list;
}
function configCellToArray(txt, separator = /[;]/) {
    return toStringArray(txt, separator);
}
function csvGetInt(csv, i) {
    return parseInt(csv[i]);
}
function csvGetFloat(csv, i) {
    return parseFloat(csv[i]);
}
function csvGetBoolean(csv, i) {
    return toBoolean(csv[i]);
}
function csvGetString(csv, i) {
    return csv[i];
}
function firstUpperCase(str) {
    return str.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
        return $1.toUpperCase() + $2.toLowerCase();
    });
}
/**
 * format('{0} {1} {2}', params1, params2, params3)
 * format('{0} {1:U} {2:L}', params1, params2, params3)
 * @param value
 * @param args
 */
function format(value, ...args) {
    try {
        return value.replace(/{(\d+(:.*)?)}/g, function (match, i) {
            var s = match.split(':');
            if (s.length > 1) {
                i = i[0];
                match = s[1].replace('}', '');
            }
            var arg = formatPattern(match, args[i]);
            return typeof arg != 'undefined' && arg != null ? arg : "";
        });
    }
    catch (e) {
        return "";
    }
}
function formatPattern(match, arg) {
    switch (match) {
        case 'L':
            arg = arg.toLowerCase();
            break;
        case 'U':
            arg = arg.toUpperCase();
            break;
        default:
            break;
    }
    return arg;
}
function isNullOrWhiteSpace(value) {
    try {
        if (value == null || value == 'undefined')
            return false;
        return value.replace(/\s/g, '').length < 1;
    }
    catch (e) {
        return false;
    }
}
//开头与结尾是否有空格字符
function isStartOrEndWithSpace(s) {
    var index = s.indexOf(" ");
    var lastIndex = s.lastIndexOf(" ");
    if (index == 0 || lastIndex == s.length - 1) {
        return true;
    }
    return false;
}
//开头与结尾是否是数字
function isStartOrEndWithNumber(s) {
    var fristChar = s.charAt(0);
    var lastChar = s.charAt(s.length - 1);
    if (isInt(fristChar) || isInt(lastChar)) {
        return true;
    }
    return false;
}
function trim(s) {
    return s.replace(/[\r\n]/g, "");
}
//////////////////////////////////////////////////////////////////////////
class __NumberUnitText {
}
__NumberUnitText.B = "B";
__NumberUnitText.M = "M";
__NumberUnitText.K = "K";
class __NumberUnitValue {
}
__NumberUnitValue.K = 1000;
__NumberUnitValue.M = 1000 * 1000;
__NumberUnitValue.B = 1000 * 1000 * 1000;
/**
 * 格式化数字 为K M B格式化
 * @param value 数字
 * @param fixed 数字保留几位
 */
function formatNumberUnit(value, fixed = 1) {
    var str = "";
    if (value >= __NumberUnitValue.B * 10) {
        value = value / __NumberUnitValue.B;
        str = value.toFixed(fixed + 1).slice(0, -1) + __NumberUnitText.B;
    }
    else if (value >= __NumberUnitValue.M * 10) {
        value = value / __NumberUnitValue.M;
        str = value.toFixed(fixed + 1).slice(0, -1) + __NumberUnitText.M;
    }
    else if (value >= __NumberUnitValue.K * 10) {
        value = value / __NumberUnitValue.K;
        str = value.toFixed(fixed + 1).slice(0, -1) + __NumberUnitText.K;
    }
    else {
        str = Math.floor(value) + "";
    }
    var a = str.split(".");
    var num = parseInt(a[0]);
    var result = num.toLocaleString('en-US');
    if (a.length >= 2) {
        if (fixed > 0) {
            result = result + "." + a[1];
        }
        else {
            result = result + a[1];
        }
    }
    return result;
}
function formatArrayNumberUnit(fmat, ...numbs) {
    let args = [];
    for (var index = 0; index < numbs.length; index++) {
        var num = numbs[index];
        args.push(formatNumberUnit(num, num > 1000 ? 1 : 0));
    }
    return fmat.format(...args);
}
/**
 * 数字转化为字母 大写
 * @param value 数字
 * @param isCapital 是否大写
 */
function numberToLetter(value, isCapital = true) {
    if (value <= 0) {
        return null;
    }
    let letter = "";
    value--;
    if (value > 26) {
        return "";
    }
    if (value < 0) {
        return "";
    }
    let AString = isCapital ? 'A' : 'a';
    letter = String.fromCharCode(value + AString.charCodeAt(0));
    return letter;
}
function getStringLength(str) {
    ///<summary>获得字符串实际长度，中文2，英文1</summary>
    ///<param name="str">要获得长度的字符串</param>
    var realLength = 0, len = str.length, charCode = -1;
    for (var i = 0; i < len; i++) {
        charCode = str.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128)
            realLength += 1;
        else
            realLength += 2;
    }
    return realLength;
}
;
window['toStringArray'] = toStringArray;
window['toIntArray'] = toIntArray;
window['toFloatArray'] = toFloatArray;
window['toInt'] = toInt;
window['toFloat'] = toFloat;
window['toBoolean'] = toBoolean;
window['toBooleanArray'] = toBooleanArray;
window['configCellToArray'] = configCellToArray;
window['csvGetInt'] = csvGetInt;
window['csvGetFloat'] = csvGetFloat;
window['csvGetBoolean'] = csvGetBoolean;
window['csvGetString'] = csvGetString;
window['firstUpperCase'] = firstUpperCase;
window['format'] = format;
window['formatPattern'] = formatPattern;
window['isNullOrWhiteSpace'] = isNullOrWhiteSpace;
window['isStartOrEndWithSpace'] = isStartOrEndWithSpace;
window['isStartOrEndWithNumber'] = isStartOrEndWithNumber;
window['trim'] = trim;
window['formatNumberUnit'] = formatNumberUnit;
window['formatArrayNumberUnit'] = formatArrayNumberUnit;
window['numberToLetter'] = numberToLetter;
class StringUtils {
    /** 小数点多少位 */
    static FloatLength(num, floatM = 100) {
        return Mathf.FloatLength(num, floatM).toString();
    }
    /** 填充长度 */
    static FillLeft(str, length, c = '0') {
        while (str.length < length) {
            str = c + str;
        }
        return str;
    }
    static FillRight(str, length, c = '0') {
        while (str.length < length) {
            str = str + c;
        }
        return str;
    }
    static get numberTransfrom() {
        if (!this._numberTransfrom) {
            this._numberTransfrom = new NumberTransfrom();
        }
        return this._numberTransfrom;
    }
    /** 获取中文数字 */
    static GetChineseNum(num) {
        return this.numberTransfrom.transfrom(num);
    }
}
/** 字符串 */
StringUtils.empty = "";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class SyncHellper {
    static waitTime(millisecond) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(() => {
                    return resolve();
                }, millisecond);
            });
        });
    }
    static waitFrame(frameNum) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(() => {
                    return resolve();
                }, 1000 / this.frameRate * frameNum);
            });
        });
    }
}
SyncHellper.frameRate = 60;
/*
 * @Descripttion:
 * @version:
 * @Author: ZengFeng
 * @Date: 2019-10-18 12:05:12
 * @LastEditors: ZengFeng
 * @LastEditTime: 2019-10-18 12:11:42
 */
var TypeName;
(function (TypeName) {
    TypeName["mstring"] = "string";
    TypeName["mnumber"] = "number";
    TypeName["mboolean"] = "boolean";
    TypeName["mfunction"] = "function";
    TypeName["mobject"] = "object";
})(TypeName || (TypeName = {}));
class Dictionary {
    constructor() {
        this.dict = {};
        this._count = 0;
    }
    get count() {
        return this._count;
    }
    add(key, val) {
        if (this.hasKey(key) === false) {
            this._count++;
        }
        this.dict[key] = val;
    }
    set(key, val) {
        if (this.hasKey(key) === false) {
            this._count++;
        }
        this.dict[key] = val;
    }
    remove(key) {
        if (this.hasKey(key)) {
            this._count--;
        }
        // this.dict[key] = undefined;
        delete this.dict[key];
    }
    hasKey(key) {
        return this.dict[key] != undefined;
    }
    getValue(key) {
        return this.dict[key];
    }
    getValueOrDefault(key, _default) {
        if (this.hasKey(key)) {
            return this.getValue(key);
        }
        else {
            return _default;
        }
    }
    __getDict() {
        return this.dict;
    }
    getValues() {
        let list = [];
        for (var key in this.dict) {
            list.push(this.dict[key]);
        }
        return list;
    }
    getKeys() {
        let list = [];
        for (var key in this.dict) {
            list.push(key);
        }
        return list;
    }
    clear() {
        this.dict = {};
        this._count = 0;
    }
}
/** 二维Key字典列表 */
class DoubleKeyList {
    constructor() {
        this.key1Dict = new Dictionary();
    }
    getDict(key1) {
        return this.key1Dict.getValue(key1);
    }
    getOrCreateDict(key1) {
        let dict = this.key1Dict.getValue(key1);
        if (!dict) {
            dict = new UnOrderMultiMap();
            this.key1Dict.add(key1, dict);
        }
        return dict;
    }
    addItem(key1, key2, v) {
        let dict = this.getOrCreateDict(key1);
        dict.addItem(key2, v);
    }
    removeItem(key1, key2, v) {
        let dict = this.getDict(key1);
        if (dict) {
            dict.removeItem(key2, v);
        }
    }
    getItemList(key1, key2) {
        let dict = this.getDict(key1);
        if (dict) {
            return dict.get(key2);
        }
        return null;
    }
}
/** 二维Key字典 */
class DoubleKeyMap {
    constructor() {
        this.key1Dict = new Map();
    }
    getDict(key1) {
        return this.key1Dict.get(key1);
    }
    getOrCreateDict(key1) {
        let dict = this.key1Dict.get(key1);
        if (!dict) {
            dict = new Map();
            this.key1Dict.set(key1, dict);
        }
        return dict;
    }
    add(key1, key2, v) {
        let dict = this.getOrCreateDict(key1);
        dict.set(key2, v);
    }
    remove(key1, key2) {
        let dict = this.getDict(key1);
        if (dict) {
            dict.delete(key2);
        }
    }
    removeValues(key1) {
        let dict = this.getDict(key1);
        if (dict) {
            let key2s = dict.getKeys();
            for (let key2 of key2s) {
                dict.delete(key2);
            }
        }
        this.key1Dict.delete(key1);
    }
    getValue(key1, key2) {
        let dict = this.getDict(key1);
        if (dict) {
            return dict.get(key2);
        }
        return null;
    }
    getValues(key1) {
        let dict = this.getDict(key1);
        if (dict) {
            return dict.getValues();
        }
        return null;
    }
    clear() {
        this.key1Dict.clear();
    }
}
class UnOrderMultiMap {
    constructor() {
        this.dictionary = new Map();
        // 重用list
        this.queue = [];
    }
    FetchList() {
        if (this.queue.length > 0) {
            let list = this.queue.shift();
            list.length = 0;
            return list;
        }
        return [];
    }
    RecycleList(list) {
        list.length = 0;
        // 防止暴涨
        if (this.queue.length > 100) {
            return;
        }
        this.queue.push(list);
    }
    sortItem(t, compareFn) {
        let list = this.dictionary.get(t);
        if (list) {
            if (compareFn) {
                list.sort(compareFn);
            }
            else {
                list.sort();
            }
        }
    }
    addItem(t, k) {
        let list = this.dictionary.get(t);
        if (!list) {
            list = this.FetchList();
            this.dictionary.set(t, list);
        }
        list.push(k);
    }
    removeItem(t, k) {
        let list = this.dictionary.get(t);
        if (!list) {
            return false;
        }
        if (!arrayRemoveItem(list, k)) {
            return false;
        }
        if (list.length == 0) {
            this.RecycleList(list);
            this.dictionary.delete(t);
        }
        return true;
    }
    removeList(t) {
        let list = this.dictionary.get(t);
        if (list) {
            this.RecycleList(list);
        }
        return this.dictionary.delete(t);
    }
    get count() {
        return this.dictionary.size;
    }
    /// <summary>
    /// 不返回内部的list,copy一份出来
    /// </summary>
    /// <param name="t"></param>
    /// <returns></returns>
    getAll(t) {
        let list = this.dictionary.get(t);
        if (!list) {
            return [];
        }
        return list.slice(0);
    }
    /// <summary>
    /// 返回内部的list
    /// </summary>
    /// <param name="t"></param>
    /// <returns></returns>
    get(t) {
        return this.dictionary.get(t);
    }
    contains(t, k) {
        let list = this.get(t);
        if (!list) {
            return false;
        }
        return list.indexOf(k) != -1;
        // return list.includes(k);
    }
    containsKey(t) {
        return this.dictionary.has(t);
    }
    clear() {
        let values = this.dictionary.getValues();
        for (let val of values) {
            this.RecycleList(val);
        }
        this.dictionary.clear();
    }
    getKeys() {
        return this.dictionary.getKeys();
    }
}
/** 绑定 */
class Bindable {
    constructor(value = null) {
        this._changeWatcher = new TypedSignal();
        this._value = value;
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this.setValue(value);
    }
    add(listener, self) {
        this._changeWatcher.add(listener, self);
    }
    remove(listener, self) {
        this._changeWatcher.remove(listener, self);
    }
    removeAll() {
        this._changeWatcher.removeAll();
    }
    bindTo(target) {
        this.value = target.value;
        target.add(t => this.setValue(t), this);
    }
    unbind(target) {
        target.remove(t => this.setValue(t), this);
    }
    setValue(value) {
        if (value != this._value) {
            this._value = value;
            this._changeWatcher.dispatch(value);
        }
    }
}
/**
 * 事件
 */
class Emitter {
    constructor(isDispatchName = false) {
        /** 监听数组 */
        this.listeners = {};
        /** 是否把事件名称抛当参数抛给回调 */
        this.isDispatchName = false;
        this.isDispatchName = isDispatchName;
    }
    /**
     * 注册事件
     * @param name 事件名称
     * @param callback 回调函数
     * @param context 上下文
     */
    add(name, callback, context) {
        let hasRegistered = false;
        let observers = this.listeners[name];
        if (!observers) {
            this.listeners[name] = [];
        }
        else {
            let length = observers.length;
            for (let i = 0; i < length; i++) {
                let observer = observers[i];
                if (observer.comparAll(callback, context)) {
                    hasRegistered = true;
                }
            }
        }
        if (!hasRegistered) {
            this.listeners[name].push(new Observer(callback, context));
        }
    }
    /**
     * 移除事件
     * @param name 事件名称
     * @param callback 回调函数
     * @param context 上下文
     */
    remove(name, callback, context) {
        let observers = this.listeners[name];
        if (!observers)
            return;
        let length = observers.length;
        for (let i = 0; i < length; i++) {
            let observer = observers[i];
            if (observer.compar(context)) {
                observers.splice(i, 1);
                break;
            }
        }
        if (observers.length == 0) {
            delete this.listeners[name];
        }
    }
    /**
     * 发送事件
     * @param name 事件名称
     */
    dispatch(name, ...args) {
        let observers = this.listeners[name];
        if (!observers)
            return;
        let length = observers.length;
        for (let i = length - 1; i >= 0; i--) {
            let observer = observers[i];
            if (this.isDispatchName) {
                observer.notify(name, ...args);
            }
            else {
                observer.notify(...args);
            }
        }
    }
}
/**
 * 观察者
 */
class Observer {
    constructor(callback, context) {
        /** 回调函数 */
        this.callback = null;
        /** 上下文 */
        this.context = null;
        let self = this;
        self.callback = callback;
        self.context = context;
    }
    /**
     * 发送通知
     * @param args 不定参数
     */
    notify(...args) {
        let self = this;
        self.callback.call(self.context, ...args);
    }
    /**
     * 上下文比较
     * @param context 上下文
     */
    compar(context) {
        return context == this.context;
    }
    /**
     * 上下文比较
     * @param context 上下文
     */
    comparAll(callback, context) {
        return callback == this.callback && context == this.context;
    }
}
class Signal {
    constructor() {
        this._listeners = [];
    }
    add(listener, self) {
        if (!this.hasListener(listener, self)) {
            this._listeners.push(new SignalHandler(listener, self));
        }
    }
    addOnce(listener, self) {
        if (!this.hasListener(listener, self)) {
            this._listeners.push(new SignalHandler(listener, self, true));
        }
    }
    hasListener(listener, self) {
        for (var i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].equals(listener, self)) {
                return true;
            }
        }
        return false;
    }
    remove(listener, self) {
        for (var i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].equals(listener, self)) {
                this._listeners.splice(i, 1);
                break;
            }
        }
    }
    removeAll() {
        this._listeners.length = 0;
    }
    dispatch() {
        this._listeners.forEach(handler => handler.apply());
        this._listeners = this._listeners.filter((handler, i, arr) => { return !handler.once(); });
    }
}
class SignalHandler {
    constructor(handler, self, once = false) {
        this._handler = handler;
        this._self = self;
        this._once = once;
    }
    apply() {
        this._handler.apply(this._self);
    }
    equals(handler, self) {
        return this._handler == handler && this._self == self;
    }
    once() {
        return this._once;
    }
}
class Typed2Signal {
    constructor() {
        this._listeners = [];
    }
    add(listener, self) {
        if (!this.hasListener(listener, self)) {
            this._listeners.push(new Typed2SignalHandler(listener, self));
        }
    }
    addOnce(listener, self) {
        if (!this.hasListener(listener, self)) {
            this._listeners.push(new Typed2SignalHandler(listener, self, true));
        }
    }
    hasListener(listener, self) {
        for (var i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].equals(listener, self)) {
                return true;
            }
        }
        return false;
    }
    remove(listener, self) {
        for (var i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].equals(listener, self)) {
                this._listeners.splice(i, 1);
                break;
            }
        }
    }
    removeAll() {
        this._listeners.length = 0;
    }
    dispatch(value1, value2) {
        this._listeners.forEach(handler => handler.apply(value1, value2));
        this._listeners = this._listeners.filter((handler, i, arr) => { return !handler.once(); });
    }
}
class Typed2SignalHandler {
    constructor(handler, self, once = false) {
        this._handler = handler;
        this._self = self;
        this._once = once;
    }
    apply(arg1, arg2) {
        this._handler.apply(this._self, [arg1, arg2]);
    }
    equals(handler, self) {
        return this._handler == handler && this._self == self;
    }
    once() {
        return this._once;
    }
}
class Typed3Signal {
    constructor() {
        this._listeners = [];
    }
    add(listener, self) {
        if (!this.hasListener(listener, self)) {
            this._listeners.push(new Typed3SignalHandler(listener, self));
        }
    }
    addOnce(listener, self) {
        if (!this.hasListener(listener, self)) {
            this._listeners.push(new Typed3SignalHandler(listener, self, true));
        }
    }
    hasListener(listener, self) {
        for (var i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].equals(listener, self)) {
                return true;
            }
        }
        return false;
    }
    remove(listener, self) {
        for (var i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].equals(listener, self)) {
                this._listeners.splice(i, 1);
                break;
            }
        }
    }
    removeAll() {
        this._listeners.length = 0;
    }
    dispatch(value1, value2, value3) {
        this._listeners.forEach(handler => handler.apply(value1, value2, value3));
        this._listeners = this._listeners.filter((handler, i, arr) => { return !handler.once(); });
    }
}
class Typed3SignalHandler {
    constructor(handler, self, once = false) {
        this._handler = handler;
        this._self = self;
        this._once = once;
    }
    apply(arg1, arg2, arg3) {
        this._handler.apply(this._self, [arg1, arg2, arg3]);
    }
    equals(handler, self) {
        return this._handler == handler && this._self == self;
    }
    once() {
        return this._once;
    }
}
class TypedSignal {
    constructor() {
        this._listeners = [];
    }
    add(listener, self) {
        if (!this.hasListener(listener, self)) {
            this._listeners.push(new TypedSignalHandler(listener, self));
        }
    }
    addOnce(listener, self) {
        if (!this.hasListener(listener, self)) {
            this._listeners.push(new TypedSignalHandler(listener, self, true));
        }
    }
    hasListener(listener, self) {
        for (var i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].equals(listener, self)) {
                return true;
            }
        }
        return false;
    }
    remove(listener, self) {
        for (var i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].equals(listener, self)) {
                this._listeners.splice(i, 1);
                break;
            }
        }
    }
    removeAll() {
        this._listeners.length = 0;
    }
    dispatch(value) {
        this._listeners.forEach(handler => handler.apply(value));
        this._listeners = this._listeners.filter((handler, i, arr) => { return !handler.once(); });
    }
}
class TypedSignalHandler {
    constructor(handler, self, once = false) {
        this._handler = handler;
        this._self = self;
        this._once = once;
    }
    apply(arg) {
        this._handler.apply(this._self, [arg]);
    }
    equals(handler, self) {
        return this._handler == handler && this._self == self;
    }
    once() {
        return this._once;
    }
}

GameCommonLibInit();