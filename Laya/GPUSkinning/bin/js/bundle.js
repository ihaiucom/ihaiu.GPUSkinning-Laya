var laya = (function () {
	'use strict';

	var VertexMesh = Laya.VertexMesh;
	var VertexDeclaration = Laya.VertexDeclaration;
	var VertexElement = Laya.VertexElement;
	var VertexElementFormat = Laya.VertexElementFormat;
	class GPUSkiningVertexMesh extends VertexMesh {
	    static getVertexDeclaration(vertexFlag, compatible = true) {
	        var verDec = this._declarationMap[vertexFlag + (compatible ? "_0" : "_1")];
	        if (!verDec) {
	            var subFlags = vertexFlag.split(",");
	            var offset = 0;
	            var elements = [];
	            for (var i = 0, n = subFlags.length; i < n; i++) {
	                var element;
	                switch (subFlags[i]) {
	                    case "POSITION":
	                        element = new VertexElement(offset, VertexElementFormat.Vector3, this.MESH_POSITION0);
	                        offset += 12;
	                        break;
	                    case "NORMAL":
	                        element = new VertexElement(offset, VertexElementFormat.Vector3, this.MESH_NORMAL0);
	                        offset += 12;
	                        break;
	                    case "COLOR":
	                        element = new VertexElement(offset, VertexElementFormat.Vector4, this.MESH_COLOR0);
	                        offset += 16;
	                        break;
	                    case "UV":
	                        element = new VertexElement(offset, VertexElementFormat.Vector2, this.MESH_TEXTURECOORDINATE0);
	                        offset += 8;
	                        break;
	                    case "UV1":
	                        element = new VertexElement(offset, VertexElementFormat.Vector4, this.MESH_TEXTURECOORDINATE1);
	                        offset += 16;
	                        break;
	                    case "UV2":
	                        element = new VertexElement(offset, VertexElementFormat.Vector4, this.MESH_TEXTURECOORDINATE2);
	                        offset += 16;
	                        console.log("UV2", element);
	                        break;
	                    case "BLENDWEIGHT":
	                        element = new VertexElement(offset, VertexElementFormat.Vector4, this.MESH_BLENDWEIGHT0);
	                        offset += 16;
	                        break;
	                    case "BLENDINDICES":
	                        if (compatible) {
	                            element = new VertexElement(offset, VertexElementFormat.Vector4, this.MESH_BLENDINDICES0);
	                            offset += 16;
	                        }
	                        else {
	                            element = new VertexElement(offset, VertexElementFormat.Byte4, this.MESH_BLENDINDICES0);
	                            offset += 4;
	                        }
	                        break;
	                    case "TANGENT":
	                        element = new VertexElement(offset, VertexElementFormat.Vector4, this.MESH_TANGENT0);
	                        offset += 16;
	                        console.log("TANGENT", element);
	                        break;
	                    default:
	                        throw "VertexMesh: unknown vertex flag.";
	                }
	                elements.push(element);
	            }
	            verDec = new VertexDeclaration(offset, elements);
	            this._declarationMap[vertexFlag + (compatible ? "_0" : "_1")] = verDec;
	        }
	        return verDec;
	    }
	}
	GPUSkiningVertexMesh.MESH_TEXTURECOORDINATE2 = 6;
	GPUSkiningVertexMesh._declarationMap = {};

	var IndexBuffer3D = Laya.IndexBuffer3D;
	var VertexBuffer3D = Laya.VertexBuffer3D;
	var HalfFloatUtils = Laya.HalfFloatUtils;
	var Matrix4x4 = Laya.Matrix4x4;
	var SubMesh = Laya.SubMesh;
	var IndexFormat = Laya.IndexFormat;
	var LayaGL = Laya.LayaGL;
	class GPUSkiningLoadModelV05 {
	    static parse(readData, version, mesh, subMeshes) {
	        GPUSkiningLoadModelV05._mesh = mesh;
	        GPUSkiningLoadModelV05._subMeshes = subMeshes;
	        GPUSkiningLoadModelV05._version = version;
	        GPUSkiningLoadModelV05._readData = readData;
	        GPUSkiningLoadModelV05.READ_DATA();
	        GPUSkiningLoadModelV05.READ_BLOCK();
	        GPUSkiningLoadModelV05.READ_STRINGS();
	        for (var i = 0, n = GPUSkiningLoadModelV05._BLOCK.count; i < n; i++) {
	            GPUSkiningLoadModelV05._readData.pos = GPUSkiningLoadModelV05._BLOCK.blockStarts[i];
	            var index = GPUSkiningLoadModelV05._readData.getUint16();
	            var blockName = GPUSkiningLoadModelV05._strings[index];
	            var fn = GPUSkiningLoadModelV05["READ_" + blockName];
	            if (fn == null)
	                throw new Error("model file err,no this function:" + index + " " + blockName);
	            else
	                fn.call(null);
	        }
	        GPUSkiningLoadModelV05._mesh._bindPoseIndices = new Uint16Array(GPUSkiningLoadModelV05._bindPoseIndices);
	        GPUSkiningLoadModelV05._bindPoseIndices.length = 0;
	        GPUSkiningLoadModelV05._strings.length = 0;
	        GPUSkiningLoadModelV05._readData = null;
	        GPUSkiningLoadModelV05._version = null;
	        GPUSkiningLoadModelV05._mesh = null;
	        GPUSkiningLoadModelV05._subMeshes = null;
	    }
	    static _readString() {
	        return GPUSkiningLoadModelV05._strings[GPUSkiningLoadModelV05._readData.getUint16()];
	    }
	    static READ_DATA() {
	        GPUSkiningLoadModelV05._DATA.offset = GPUSkiningLoadModelV05._readData.getUint32();
	        GPUSkiningLoadModelV05._DATA.size = GPUSkiningLoadModelV05._readData.getUint32();
	    }
	    static READ_BLOCK() {
	        var count = GPUSkiningLoadModelV05._BLOCK.count = GPUSkiningLoadModelV05._readData.getUint16();
	        var blockStarts = GPUSkiningLoadModelV05._BLOCK.blockStarts = [];
	        var blockLengths = GPUSkiningLoadModelV05._BLOCK.blockLengths = [];
	        for (var i = 0; i < count; i++) {
	            blockStarts.push(GPUSkiningLoadModelV05._readData.getUint32());
	            blockLengths.push(GPUSkiningLoadModelV05._readData.getUint32());
	        }
	    }
	    static READ_STRINGS() {
	        var offset = GPUSkiningLoadModelV05._readData.getUint32();
	        var count = GPUSkiningLoadModelV05._readData.getUint16();
	        var prePos = GPUSkiningLoadModelV05._readData.pos;
	        GPUSkiningLoadModelV05._readData.pos = offset + GPUSkiningLoadModelV05._DATA.offset;
	        for (var i = 0; i < count; i++)
	            GPUSkiningLoadModelV05._strings[i] = GPUSkiningLoadModelV05._readData.readUTFString();
	        GPUSkiningLoadModelV05._readData.pos = prePos;
	    }
	    static READ_MESH() {
	        var gl = LayaGL.instance;
	        var i;
	        var memorySize = 0;
	        var name = GPUSkiningLoadModelV05._readString();
	        var reader = GPUSkiningLoadModelV05._readData;
	        var arrayBuffer = reader.__getBuffer();
	        var vertexBufferCount = reader.getInt16();
	        var offset = GPUSkiningLoadModelV05._DATA.offset;
	        for (i = 0; i < vertexBufferCount; i++) {
	            var vbStart = offset + reader.getUint32();
	            var vertexCount = reader.getUint32();
	            var vertexFlag = GPUSkiningLoadModelV05._readString();
	            var vertexDeclaration = GPUSkiningVertexMesh.getVertexDeclaration(vertexFlag, false);
	            var vertexStride = vertexDeclaration.vertexStride;
	            var vertexData;
	            var floatData;
	            var uint8Data;
	            var subVertexFlags = vertexFlag.split(",");
	            var subVertexCount = subVertexFlags.length;
	            var mesh = GPUSkiningLoadModelV05._mesh;
	            switch (GPUSkiningLoadModelV05._version) {
	                case "LAYAMODEL:05":
	                case "LAYAMODEL:GPUSkining_05":
	                    vertexData = arrayBuffer.slice(vbStart, vbStart + vertexCount * vertexStride);
	                    floatData = new Float32Array(vertexData);
	                    uint8Data = new Uint8Array(vertexData);
	                    break;
	                case "LAYAMODEL:COMPRESSION_05":
	                    vertexData = new ArrayBuffer(vertexStride * vertexCount);
	                    floatData = new Float32Array(vertexData);
	                    uint8Data = new Uint8Array(vertexData);
	                    var lastPosition = reader.pos;
	                    reader.pos = vbStart;
	                    for (var j = 0; j < vertexCount; j++) {
	                        var subOffset;
	                        var verOffset = j * vertexStride;
	                        for (var k = 0; k < subVertexCount; k++) {
	                            switch (subVertexFlags[k]) {
	                                case "POSITION":
	                                    subOffset = verOffset / 4;
	                                    floatData[subOffset] = HalfFloatUtils.convertToNumber(reader.getUint16());
	                                    floatData[subOffset + 1] = HalfFloatUtils.convertToNumber(reader.getUint16());
	                                    floatData[subOffset + 2] = HalfFloatUtils.convertToNumber(reader.getUint16());
	                                    verOffset += 12;
	                                    break;
	                                case "NORMAL":
	                                    subOffset = verOffset / 4;
	                                    floatData[subOffset] = reader.getUint8() / 127.5 - 1;
	                                    floatData[subOffset + 1] = reader.getUint8() / 127.5 - 1;
	                                    floatData[subOffset + 2] = reader.getUint8() / 127.5 - 1;
	                                    verOffset += 12;
	                                    break;
	                                case "COLOR":
	                                    subOffset = verOffset / 4;
	                                    floatData[subOffset] = reader.getUint8() / 255;
	                                    floatData[subOffset + 1] = reader.getUint8() / 255;
	                                    floatData[subOffset + 2] = reader.getUint8() / 255;
	                                    floatData[subOffset + 3] = reader.getUint8() / 255;
	                                    verOffset += 16;
	                                    break;
	                                case "UV":
	                                    subOffset = verOffset / 4;
	                                    floatData[subOffset] = HalfFloatUtils.convertToNumber(reader.getUint16());
	                                    floatData[subOffset + 1] = HalfFloatUtils.convertToNumber(reader.getUint16());
	                                    verOffset += 8;
	                                    break;
	                                case "UV1":
	                                    subOffset = verOffset / 4;
	                                    floatData[subOffset] = HalfFloatUtils.convertToNumber(reader.getUint16());
	                                    floatData[subOffset + 1] = HalfFloatUtils.convertToNumber(reader.getUint16());
	                                    verOffset += 8;
	                                    break;
	                                case "BLENDWEIGHT":
	                                    subOffset = verOffset / 4;
	                                    floatData[subOffset] = reader.getUint8() / 255;
	                                    floatData[subOffset + 1] = reader.getUint8() / 255;
	                                    floatData[subOffset + 2] = reader.getUint8() / 255;
	                                    floatData[subOffset + 3] = reader.getUint8() / 255;
	                                    verOffset += 16;
	                                    break;
	                                case "BLENDINDICES":
	                                    uint8Data[verOffset] = reader.getUint8();
	                                    uint8Data[verOffset + 1] = reader.getUint8();
	                                    uint8Data[verOffset + 2] = reader.getUint8();
	                                    uint8Data[verOffset + 3] = reader.getUint8();
	                                    verOffset += 4;
	                                    break;
	                                case "TANGENT":
	                                    subOffset = verOffset / 4;
	                                    floatData[subOffset] = reader.getUint8() / 127.5 - 1;
	                                    floatData[subOffset + 1] = reader.getUint8() / 127.5 - 1;
	                                    floatData[subOffset + 2] = reader.getUint8() / 127.5 - 1;
	                                    floatData[subOffset + 3] = reader.getUint8() / 127.5 - 1;
	                                    verOffset += 16;
	                                    break;
	                            }
	                        }
	                    }
	                    reader.pos = lastPosition;
	                    break;
	            }
	            var vertexBuffer = new VertexBuffer3D(vertexData.byteLength, gl.STATIC_DRAW, true);
	            vertexBuffer.vertexDeclaration = vertexDeclaration;
	            vertexBuffer.setData(vertexData);
	            var vertexCount = vertexBuffer._byteLength / vertexDeclaration.vertexStride;
	            if (vertexCount > 65535)
	                mesh._indexFormat = IndexFormat.UInt32;
	            else
	                mesh._indexFormat = IndexFormat.UInt16;
	            mesh._vertexBuffer = vertexBuffer;
	            mesh._vertexCount += vertexCount;
	            memorySize += floatData.length * 4;
	        }
	        var ibStart = offset + reader.getUint32();
	        var ibLength = reader.getUint32();
	        var ibDatas;
	        if (mesh.indexFormat == IndexFormat.UInt32)
	            ibDatas = new Uint32Array(arrayBuffer.slice(ibStart, ibStart + ibLength));
	        else
	            ibDatas = new Uint16Array(arrayBuffer.slice(ibStart, ibStart + ibLength));
	        var indexBuffer = new IndexBuffer3D(mesh.indexFormat, ibDatas.length, gl.STATIC_DRAW, true);
	        indexBuffer.setData(ibDatas);
	        mesh._indexBuffer = indexBuffer;
	        mesh._setBuffer(mesh._vertexBuffer, indexBuffer);
	        memorySize += indexBuffer.indexCount * 2;
	        mesh._setCPUMemory(memorySize);
	        mesh._setGPUMemory(memorySize);
	        var boneNames = mesh._boneNames = [];
	        var boneCount = reader.getUint16();
	        boneNames.length = boneCount;
	        for (i = 0; i < boneCount; i++)
	            boneNames[i] = GPUSkiningLoadModelV05._strings[reader.getUint16()];
	        var bindPoseDataStart = reader.getUint32();
	        var bindPoseDataLength = reader.getUint32();
	        var bindPoseDatas = new Float32Array(arrayBuffer.slice(offset + bindPoseDataStart, offset + bindPoseDataStart + bindPoseDataLength));
	        var bindPoseFloatCount = bindPoseDatas.length;
	        var bindPoseBuffer = mesh._inverseBindPosesBuffer = new ArrayBuffer(bindPoseFloatCount * 4);
	        mesh._inverseBindPoses = [];
	        for (i = 0; i < bindPoseFloatCount; i += 16) {
	            var inverseGlobalBindPose = new Matrix4x4(bindPoseDatas[i + 0], bindPoseDatas[i + 1], bindPoseDatas[i + 2], bindPoseDatas[i + 3], bindPoseDatas[i + 4], bindPoseDatas[i + 5], bindPoseDatas[i + 6], bindPoseDatas[i + 7], bindPoseDatas[i + 8], bindPoseDatas[i + 9], bindPoseDatas[i + 10], bindPoseDatas[i + 11], bindPoseDatas[i + 12], bindPoseDatas[i + 13], bindPoseDatas[i + 14], bindPoseDatas[i + 15], new Float32Array(bindPoseBuffer, i * 4, 16));
	            mesh._inverseBindPoses[i / 16] = inverseGlobalBindPose;
	        }
	        return true;
	    }
	    static READ_SUBMESH() {
	        var reader = GPUSkiningLoadModelV05._readData;
	        var arrayBuffer = reader.__getBuffer();
	        var subMesh = new SubMesh(GPUSkiningLoadModelV05._mesh);
	        reader.getInt16();
	        var ibStart = reader.getUint32();
	        var ibCount = reader.getUint32();
	        var indexBuffer = GPUSkiningLoadModelV05._mesh._indexBuffer;
	        subMesh._indexBuffer = indexBuffer;
	        subMesh._setIndexRange(ibStart, ibCount);
	        var vertexBuffer = GPUSkiningLoadModelV05._mesh._vertexBuffer;
	        subMesh._vertexBuffer = vertexBuffer;
	        var offset = GPUSkiningLoadModelV05._DATA.offset;
	        var subIndexBufferStart = subMesh._subIndexBufferStart;
	        var subIndexBufferCount = subMesh._subIndexBufferCount;
	        var boneIndicesList = subMesh._boneIndicesList;
	        var drawCount = reader.getUint16();
	        subIndexBufferStart.length = drawCount;
	        subIndexBufferCount.length = drawCount;
	        boneIndicesList.length = drawCount;
	        var pathMarks = GPUSkiningLoadModelV05._mesh._skinDataPathMarks;
	        var bindPoseIndices = GPUSkiningLoadModelV05._bindPoseIndices;
	        var subMeshIndex = GPUSkiningLoadModelV05._subMeshes.length;
	        for (var i = 0; i < drawCount; i++) {
	            subIndexBufferStart[i] = reader.getUint32();
	            subIndexBufferCount[i] = reader.getUint32();
	            var boneDicofs = reader.getUint32();
	            var boneDicCount = reader.getUint32();
	            var boneIndices = boneIndicesList[i] = new Uint16Array(arrayBuffer.slice(offset + boneDicofs, offset + boneDicofs + boneDicCount));
	            for (var j = 0, m = boneIndices.length; j < m; j++) {
	                var index = boneIndices[j];
	                var combineIndex = bindPoseIndices.indexOf(index);
	                if (combineIndex === -1) {
	                    boneIndices[j] = bindPoseIndices.length;
	                    bindPoseIndices.push(index);
	                    pathMarks.push([subMeshIndex, i, j]);
	                }
	                else {
	                    boneIndices[j] = combineIndex;
	                }
	            }
	        }
	        GPUSkiningLoadModelV05._subMeshes.push(subMesh);
	        return true;
	    }
	}
	GPUSkiningLoadModelV05._BLOCK = { count: 0 };
	GPUSkiningLoadModelV05._DATA = { offset: 0, size: 0 };
	GPUSkiningLoadModelV05._strings = [];
	GPUSkiningLoadModelV05._bindPoseIndices = [];

	var Byte = Laya.Byte;
	class GPUSkiningMeshReader {
	    static read(data, mesh, subMeshes) {
	        var readData = new Byte(data);
	        readData.pos = 0;
	        var version = readData.readUTFString();
	        switch (version) {
	            case "LAYAMODEL:GPUSkining_05":
	                GPUSkiningLoadModelV05.parse(readData, version, mesh, subMeshes);
	                break;
	            default:
	                throw new Error("MeshReader: unknown mesh version.");
	        }
	        mesh._setSubMeshes(subMeshes);
	    }
	}

	class GPUSkiningMesh extends Laya.Mesh {
	    static _parse(data, propertyParams = null, constructParams = null) {
	        var mesh = new GPUSkiningMesh();
	        GPUSkiningMeshReader.read(data, mesh, mesh._subMeshes);
	        return mesh;
	    }
	    static LoadAsync(path) {
	        return new Promise((resolve) => {
	            Laya.loader.load(path, Laya.Handler.create(this, (data) => {
	                if (data instanceof ArrayBuffer) {
	                    var mesh = GPUSkiningMesh._parse(data);
	                    mesh._url = Laya.URL.formatURL(path);
	                    Laya.Loader.clearRes(path);
	                    Laya.Loader.cacheRes(path, mesh);
	                    resolve(mesh);
	                }
	                else {
	                    resolve(data);
	                }
	            }), null, Laya.Loader.BUFFER);
	        });
	    }
	    destroy() {
	        super.destroy();
	    }
	}

	var Bounds = Laya.Bounds;
	var Vector3 = Laya.Vector3;
	var Quaternion = Laya.Quaternion;
	var Matrix4x4$1 = Laya.Matrix4x4;
	class ByteReadUtil {
	    static ReadQuaternion(b) {
	        var v = new Quaternion();
	        v.x = b.readFloat32();
	        v.y = b.readFloat32();
	        v.z = b.readFloat32();
	        v.w = b.readFloat32();
	        return v;
	    }
	    static ReadVector3(b) {
	        var v = new Vector3();
	        v.x = b.readFloat32() * -1;
	        v.y = b.readFloat32();
	        v.z = b.readFloat32();
	        return v;
	    }
	    static ReadBounds(b) {
	        var min = this.ReadVector3(b);
	        var max = this.ReadVector3(b);
	        var v = new Bounds(min, max);
	        return v;
	    }
	    static ReadMatrix4x4(b) {
	        var m00 = b.readFloat32();
	        var m01 = b.readFloat32();
	        var m02 = b.readFloat32();
	        var m03 = b.readFloat32();
	        var m10 = b.readFloat32();
	        var m11 = b.readFloat32();
	        var m12 = b.readFloat32();
	        var m13 = b.readFloat32();
	        var m20 = b.readFloat32();
	        var m21 = b.readFloat32();
	        var m22 = b.readFloat32();
	        var m23 = b.readFloat32();
	        var m30 = b.readFloat32();
	        var m31 = b.readFloat32();
	        var m32 = b.readFloat32();
	        var m33 = b.readFloat32();
	        var v = new Matrix4x4$1(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
	        return v;
	    }
	}

	var Matrix4x4$2 = Laya.Matrix4x4;
	class GPUSkinningBone {
	    constructor() {
	        this.parentBoneIndex = -1;
	        this._bindposeInvInit = false;
	    }
	    get BindposeInv() {
	        if (!this._bindposeInv) {
	            this._bindposeInv = new Matrix4x4$2();
	            this.bindpose.invert(this._bindposeInv);
	            this._bindposeInvInit = true;
	        }
	        return this._bindposeInv;
	    }
	    FromBytes(data) {
	        var b = new Laya.Byte(data);
	        this.name = b.readUTFString();
	        this.guid = b.readUTFString();
	        this.isExposed = b.readByte() != 0;
	        this.parentBoneIndex = b.readInt32();
	        this.bindpose = ByteReadUtil.ReadMatrix4x4(b);
	    }
	    static CreateFromBytes(data) {
	        var obj = new GPUSkinningBone();
	        obj.FromBytes(data);
	        return obj;
	    }
	}

	var GPUSkinningWrapMode;
	(function (GPUSkinningWrapMode) {
	    GPUSkinningWrapMode[GPUSkinningWrapMode["Once"] = 0] = "Once";
	    GPUSkinningWrapMode[GPUSkinningWrapMode["Loop"] = 1] = "Loop";
	})(GPUSkinningWrapMode || (GPUSkinningWrapMode = {}));

	class GPUSkinningAnimEvent {
	    constructor() {
	        this.frameIndex = 0;
	        this.eventId = 0;
	    }
	    CompareTo(other) {
	        return this.frameIndex > other.frameIndex ? -1 : 1;
	    }
	    FromBytes(data) {
	        var b = new Laya.Byte(data);
	        this.frameIndex = b.readInt32();
	        this.eventId = b.readInt32();
	    }
	    static CreateFromBytes(data) {
	        var obj = new GPUSkinningAnimEvent();
	        obj.FromBytes(data);
	        return obj;
	    }
	}

	var Matrix4x4$3 = Laya.Matrix4x4;
	class GPUSkinningFrame {
	    constructor() {
	        this.rootMotionInvInit = false;
	    }
	    RootMotionInv(rootBoneIndex) {
	        if (!this.rootMotionInvInit) {
	            let m = this.matrices[rootBoneIndex];
	            this.rootMotionInv = new Matrix4x4$3();
	            m.invert(this.rootMotionInv);
	            this.rootMotionInvInit = true;
	        }
	        return this.rootMotionInv;
	    }
	    FromBytes(data, rootMotionEnabled) {
	        var b = new Laya.Byte(data);
	        if (rootMotionEnabled) {
	            this.rootMotionDeltaPositionL = b.readFloat32();
	            this.rootMotionDeltaPositionQ = ByteReadUtil.ReadQuaternion(b);
	            this.rootMotionDeltaRotation = ByteReadUtil.ReadQuaternion(b);
	        }
	        var matricesCount = b.readUint32();
	        this.matrices = [];
	        for (var i = 0; i < matricesCount; i++) {
	            var m = ByteReadUtil.ReadMatrix4x4(b);
	            this.matrices.push(m);
	        }
	    }
	    static CreateFromBytes(data, rootMotionEnabled) {
	        var obj = new GPUSkinningFrame();
	        obj.FromBytes(data, rootMotionEnabled);
	        return obj;
	    }
	}

	var Byte$1 = Laya.Byte;
	class GPUSkinningClip {
	    constructor() {
	        this.length = 0.0;
	        this.fps = 0;
	        this.wrapMode = GPUSkinningWrapMode.Once;
	        this.pixelSegmentation = 0;
	        this.rootMotionEnabled = false;
	        this.individualDifferenceEnabled = false;
	        this.frameCount = 0;
	        this.frameLastIndex = 0;
	    }
	    FromBytes(data) {
	        var b = new Byte$1(data);
	        b.pos = 0;
	        this.name = b.readUTFString();
	        this.length = b.readFloat32();
	        this.fps = b.readUint32();
	        this.wrapMode = b.readInt32();
	        this.pixelSegmentation = b.readUint32();
	        this.rootMotionEnabled = b.readByte() != 0;
	        this.individualDifferenceEnabled = b.readByte() != 0;
	        var frameCount = b.readUint32();
	        var eventCount = b.readUint32();
	        var framePosLengthList = [];
	        for (var i = 0; i < frameCount; i++) {
	            var info = [];
	            info[0] = b.readUint32();
	            info[1] = b.readUint32();
	            framePosLengthList.push(info);
	        }
	        var eventPosLengthList = [];
	        for (var i = 0; i < eventCount; i++) {
	            var info = [];
	            info[0] = b.readUint32();
	            info[1] = b.readUint32();
	            eventPosLengthList.push(info);
	        }
	        var frameList = [];
	        this.frames = frameList;
	        for (var i = 0; i < frameCount; i++) {
	            var itemInfo = framePosLengthList[i];
	            var pos = itemInfo[0];
	            var len = itemInfo[1];
	            b.pos = pos;
	            var itemBuffer = b.readArrayBuffer(len);
	            var item = GPUSkinningFrame.CreateFromBytes(itemBuffer, this.rootMotionEnabled);
	            frameList.push(item);
	        }
	        var eventList = [];
	        this.events = eventList;
	        for (var i = 0; i < eventCount; i++) {
	            var itemInfo = eventPosLengthList[i];
	            var pos = itemInfo[0];
	            var len = itemInfo[1];
	            b.pos = pos;
	            var itemBuffer = b.readArrayBuffer(len);
	            var item = GPUSkinningAnimEvent.CreateFromBytes(itemBuffer);
	            eventList.push(item);
	        }
	        this.frameCount = Math.floor(this.length * this.fps);
	        this.frameLastIndex = this.frameCount - 1;
	    }
	    static CreateFromBytes(data) {
	        var obj = new GPUSkinningClip();
	        obj.FromBytes(data);
	        return obj;
	    }
	}

	var GPUSkinningQuality;
	(function (GPUSkinningQuality) {
	    GPUSkinningQuality[GPUSkinningQuality["Bone1"] = 0] = "Bone1";
	    GPUSkinningQuality[GPUSkinningQuality["Bone2"] = 1] = "Bone2";
	    GPUSkinningQuality[GPUSkinningQuality["Bone4"] = 2] = "Bone4";
	})(GPUSkinningQuality || (GPUSkinningQuality = {}));

	var Byte$2 = Laya.Byte;
	class GPUSkinningAnimation extends Laya.Resource {
	    constructor() {
	        super(...arguments);
	        this.bonesCount = 67;
	        this.rootBoneIndex = 0;
	        this.textureWidth = 0;
	        this.textureHeight = 0;
	        this.sphereRadius = 1.0;
	        this.skinQuality = GPUSkinningQuality.Bone4;
	    }
	    FromBytes(arrayBuffer) {
	        var b = new Byte$2(arrayBuffer);
	        b.pos = 0;
	        this.guid = b.readUTFString();
	        this.name = b.readUTFString();
	        this.rootBoneIndex = b.readInt16();
	        this.textureWidth = b.readUint32();
	        this.textureHeight = b.readUint32();
	        this.sphereRadius = b.readFloat32();
	        this.skinQuality = b.readInt32();
	        this.bonesCount = b.readUint32();
	        this.bounds = ByteReadUtil.ReadBounds(b);
	        var clipCount = b.readUint32();
	        var boneCount = b.readUint32();
	        var clipPosLengthList = [];
	        for (var i = 0; i < clipCount; i++) {
	            var info = [];
	            info[0] = b.readUint32();
	            info[1] = b.readUint32();
	            clipPosLengthList.push(info);
	        }
	        var bonePosLengthList = [];
	        for (var i = 0; i < boneCount; i++) {
	            var info = [];
	            info[0] = b.readUint32();
	            info[1] = b.readUint32();
	            bonePosLengthList.push(info);
	        }
	        var clipList = [];
	        this.clips = clipList;
	        for (var i = 0; i < clipCount; i++) {
	            var itemInfo = clipPosLengthList[i];
	            var pos = itemInfo[0];
	            var len = itemInfo[1];
	            b.pos = pos;
	            var itemBuffer = b.readArrayBuffer(len);
	            var item = GPUSkinningClip.CreateFromBytes(itemBuffer);
	            clipList.push(item);
	        }
	        var boneList = [];
	        this.bones = boneList;
	        for (var i = 0; i < boneCount; i++) {
	            var itemInfo = bonePosLengthList[i];
	            var pos = itemInfo[0];
	            var len = itemInfo[1];
	            b.pos = pos;
	            b.pos = pos;
	            var itemBuffer = b.readArrayBuffer(len);
	            var item = GPUSkinningBone.CreateFromBytes(itemBuffer);
	            boneList.push(item);
	        }
	    }
	    static CreateFromBytes(data) {
	        var b = new Byte$2(data);
	        b.pos = 0;
	        var version = b.readUTFString();
	        var len = b.readUint32();
	        var arrayBuffer = b.readArrayBuffer(len);
	        var obj = new GPUSkinningAnimation();
	        obj.version = version;
	        obj.FromBytes(arrayBuffer);
	        return obj;
	    }
	    static async LoadAsync(path) {
	        return new Promise((resolve) => {
	            this.Load(path, (anim) => {
	                resolve(anim);
	            });
	        });
	    }
	    static Load(path, callback) {
	        Laya.loader.load(path, Laya.Handler.create(this, (data) => {
	            if (data == null) {
	                console.error("加载资源失败", path);
	                callback(null);
	                return;
	            }
	            var anim;
	            if (data instanceof ArrayBuffer) {
	                anim = GPUSkinningAnimation.CreateFromBytes(data);
	                anim._url = Laya.URL.formatURL(path);
	                Laya.Loader.clearRes(path);
	                Laya.Loader.cacheRes(path, anim);
	            }
	            else {
	                anim = data;
	            }
	            if (callback) {
	                callback(anim);
	            }
	        }), null, Laya.Loader.BUFFER);
	    }
	    _disposeResource() {
	        super._disposeResource();
	    }
	    destroy() {
	        super.destroy();
	    }
	}

	var GPUSKinningCullingMode;
	(function (GPUSKinningCullingMode) {
	    GPUSKinningCullingMode[GPUSKinningCullingMode["AlwaysAnimate"] = 0] = "AlwaysAnimate";
	    GPUSKinningCullingMode[GPUSKinningCullingMode["CullUpdateTransforms"] = 1] = "CullUpdateTransforms";
	    GPUSKinningCullingMode[GPUSKinningCullingMode["CullCompletely"] = 2] = "CullCompletely";
	})(GPUSKinningCullingMode || (GPUSKinningCullingMode = {}));

	class GPUSkinningBetterList {
	    constructor(bufferIncrement) {
	        this.size = 0;
	        this.bufferIncrement = 0;
	        this.bufferIncrement = Math.max(1, bufferIncrement);
	    }
	    Get(i) {
	        return this.buffer[i];
	    }
	    Set(i, value) {
	        this.buffer[i] = value;
	    }
	    AllocateMore() {
	        let newList = (this.buffer != null)
	            ? new Array(this.buffer.length + this.bufferIncrement)
	            : new Array(this.bufferIncrement);
	        if (this.buffer != null && this.size > 0) {
	            arrayCopyValue(this.buffer, newList, false);
	        }
	        this.buffer = newList;
	    }
	    Clear() {
	        this.size = 0;
	    }
	    Release() {
	        this.size = 0;
	        this.buffer = null;
	    }
	    Add(item) {
	        if (this.buffer == null || this.size == this.buffer.length) {
	            this.AllocateMore();
	        }
	        this.buffer[this.size++] = item;
	    }
	    AddRange(items) {
	        if (items == null) {
	            return;
	        }
	        let length = items.length;
	        if (length == 0) {
	            return;
	        }
	        if (this.buffer == null) {
	            this.buffer = new Array(Math.max(this.bufferIncrement, length));
	            arrayCopyValue(items, this.buffer, false);
	            this.size = length;
	        }
	        else {
	            if (this.size + length > this.buffer.length) {
	                let newList = new Array(Math.max(this.buffer.length + this.bufferIncrement, this.size + length));
	                arrayCopyValue(this.buffer, newList, false);
	                this.buffer = newList;
	                for (var i = 0; i < length; i++) {
	                    this.buffer[this.size + i] = items[i];
	                }
	            }
	            else {
	                for (var i = 0; i < length; i++) {
	                    this.buffer[this.size + i] = items[i];
	                }
	            }
	            this.size += length;
	        }
	    }
	    RemoveAt(index) {
	        if (this.buffer != null && index > -1 && index < this.size) {
	            this.size--;
	            this.buffer[index] = null;
	            for (let b = index; b < this.size; ++b) {
	                this.buffer[b] = this.buffer[b + 1];
	            }
	            this.buffer[this.size] = null;
	        }
	    }
	    Pop() {
	        if (this.buffer == null || this.size == 0) {
	            return null;
	        }
	        --this.size;
	        let t = this.buffer[this.size];
	        this.buffer[this.size] = null;
	        return t;
	    }
	    Peek() {
	        if (this.buffer == null || this.size == 0) {
	            return null;
	        }
	        return this.buffer[this.size - 1];
	    }
	}

	class GPUSkinningExecuteOncePerFrame {
	    constructor() {
	        this.frameCount = -1;
	    }
	    CanBeExecute() {
	        return this.frameCount != Laya.timer.currFrame;
	    }
	    MarkAsExecuted() {
	        this.frameCount = Laya.timer.currFrame;
	    }
	}

	class GPUSkinningMaterial {
	    constructor() {
	        this.executeOncePerFrame = new GPUSkinningExecuteOncePerFrame();
	    }
	    Destroy() {
	        if (this.material) {
	            this.material.destroy();
	            this.material = null;
	        }
	    }
	}

	var MaterialState;
	(function (MaterialState) {
	    MaterialState[MaterialState["RootOn_BlendOff"] = 0] = "RootOn_BlendOff";
	    MaterialState[MaterialState["RootOn_BlendOn_CrossFadeRootOn"] = 1] = "RootOn_BlendOn_CrossFadeRootOn";
	    MaterialState[MaterialState["RootOn_BlendOn_CrossFadeRootOff"] = 2] = "RootOn_BlendOn_CrossFadeRootOff";
	    MaterialState[MaterialState["RootOff_BlendOff"] = 3] = "RootOff_BlendOff";
	    MaterialState[MaterialState["RootOff_BlendOn_CrossFadeRootOn"] = 4] = "RootOff_BlendOn_CrossFadeRootOn";
	    MaterialState[MaterialState["RootOff_BlendOn_CrossFadeRootOff"] = 5] = "RootOff_BlendOn_CrossFadeRootOff";
	    MaterialState[MaterialState["Count"] = 6] = "Count";
	})(MaterialState || (MaterialState = {}));

	var BoundSphere = Laya.BoundSphere;
	var Vector4 = Laya.Vector4;
	var Vector3$1 = Laya.Vector3;
	var Shader3D = Laya.Shader3D;
	class GPUSkinningPlayerResources {
	    constructor() {
	        this.anim = null;
	        this.mesh = null;
	        this.players = [];
	        this.cullingGroup = null;
	        this.cullingBounds = new GPUSkinningBetterList(100);
	        this.mtrls = null;
	        this.executeOncePerFrame = new GPUSkinningExecuteOncePerFrame();
	        this.time = 0;
	        GPUSkinningPlayerResources.Init();
	    }
	    get Time() {
	        return this.time;
	    }
	    set Time(value) {
	        this.time = value;
	    }
	    static Init() {
	        if (this._isInited)
	            return;
	        this._isInited = true;
	        for (let key of this.keywords) {
	            this.keywordDefines.push(Shader3D.getDefineByName(key));
	        }
	        this.ShaderDefine_SKIN_1 = Shader3D.getDefineByName("SKIN_1");
	        this.ShaderDefine_SKIN_2 = Shader3D.getDefineByName("SKIN_2");
	        this.ShaderDefine_SKIN_4 = Shader3D.getDefineByName("SKIN_4");
	        this.shaderPropID_GPUSkinning_TextureMatrix = Shader3D.propertyNameToID("u_GPUSkinning_TextureMatrix");
	        this.shaderPropID_GPUSkinning_TextureSize_NumPixelsPerFrame = Shader3D.propertyNameToID("u_GPUSkinning_TextureSize_NumPixelsPerFrame");
	        this.shaderPorpID_GPUSkinning_FrameIndex_PixelSegmentation = Shader3D.propertyNameToID("u_GPUSkinning_FrameIndex_PixelSegmentation");
	        this.shaderPropID_GPUSkinning_RootMotion = Shader3D.propertyNameToID("u_GPUSkinning_RootMotion");
	        this.shaderPorpID_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade = Shader3D.propertyNameToID("u_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade");
	        this.shaderPropID_GPUSkinning_RootMotion_CrossFade = Shader3D.propertyNameToID("u_GPUSkinning_RootMotion_CrossFade");
	    }
	    Destroy() {
	        this.anim = null;
	        this.mesh = null;
	        if (this.mtrls != null) {
	            for (let i = 0; i < this.mtrls.length; i++) {
	                this.mtrls[i].Destroy();
	                this.mtrls[i] = null;
	            }
	            this.mtrls = null;
	        }
	        if (this.texture != null) {
	            this.texture.destroy();
	            this.texture = null;
	        }
	        if (this.players != null) {
	            this.players.length = 0;
	            this.players = null;
	        }
	    }
	    AddCullingBounds() {
	        this.cullingBounds.Add(new BoundSphere(new Vector3$1(0, 0, 0), 0));
	    }
	    RemoveCullingBounds(index) {
	        this.cullingBounds.RemoveAt(index);
	    }
	    LODSettingChanged(player) {
	        if (player.LODEnabled) {
	            let players = this.players;
	            let numPlayers = players.length;
	            for (let i = 0; i < numPlayers; i++) {
	                if (players[i].Player == player) {
	                    let distanceIndex = 0;
	                    this.SetLODMeshByDistanceIndex(distanceIndex, players[i].Player);
	                    break;
	                }
	            }
	        }
	        else {
	            player.SetLODMesh(null);
	        }
	    }
	    SetLODMeshByDistanceIndex(index, player) {
	        let lodMesh = null;
	        if (index == 0) {
	            lodMesh = this.mesh;
	        }
	        else {
	            let lodMeshes = this.anim.lodMeshes;
	            lodMesh = lodMeshes == null || lodMeshes.length == 0 ? this.mesh : lodMeshes[Math.min(index - 1, lodMeshes.length - 1)];
	            if (lodMesh == null)
	                lodMesh = this.mesh;
	        }
	        player.SetLODMesh(lodMesh);
	    }
	    UpdateCullingBounds() {
	        let numPlayers = this.players.length;
	        for (let i = 0; i < numPlayers; ++i) {
	            let player = this.players[i];
	            if (!player.isEnable) {
	                continue;
	            }
	            if (!player.Player || !player.Player.Position) {
	                console.error("player.Player =null");
	                return;
	            }
	            let bounds = this.cullingBounds.Get(i);
	            bounds.center = player.Player.Position;
	            bounds.radius = this.anim.sphereRadius;
	            this.cullingBounds[i] = bounds;
	        }
	    }
	    Update(deltaTime, mtrl) {
	        if (this.executeOncePerFrame.CanBeExecute()) {
	            this.executeOncePerFrame.MarkAsExecuted();
	            this.time += deltaTime;
	        }
	        if (mtrl.executeOncePerFrame.CanBeExecute()) {
	            let anim = this.anim;
	            mtrl.executeOncePerFrame.MarkAsExecuted();
	            mtrl.material._shaderValues.setTexture(GPUSkinningPlayerResources.shaderPropID_GPUSkinning_TextureMatrix, this.texture);
	            mtrl.material._shaderValues.setVector(GPUSkinningPlayerResources.shaderPropID_GPUSkinning_TextureSize_NumPixelsPerFrame, new Vector4(anim.textureWidth, anim.textureHeight, anim.bonesCount * 3, 0));
	        }
	    }
	    UpdatePlayingData(mpb, spriteShaderData, playingClip, frameIndex, nextFrameIndex, nextFrameFade, frame, rootMotionEnabled, lastPlayedClip, frameIndex_crossFade, crossFadeTime, crossFadeProgress) {
	        spriteShaderData.setVector(GPUSkinningPlayerResources.shaderPorpID_GPUSkinning_FrameIndex_PixelSegmentation, new Vector4(frameIndex, playingClip.pixelSegmentation, nextFrameIndex, nextFrameFade));
	        if (rootMotionEnabled) {
	            let rootMotionInv = frame.RootMotionInv(this.anim.rootBoneIndex);
	            mpb.setMatrix4x4(GPUSkinningPlayerResources.shaderPropID_GPUSkinning_RootMotion, rootMotionInv);
	        }
	        if (this.IsCrossFadeBlending(lastPlayedClip, crossFadeTime, crossFadeProgress)) {
	            if (lastPlayedClip.rootMotionEnabled) {
	                mpb.setMatrix4x4(GPUSkinningPlayerResources.shaderPropID_GPUSkinning_RootMotion_CrossFade, lastPlayedClip.frames[frameIndex_crossFade].RootMotionInv(this.anim.rootBoneIndex));
	            }
	            console.log(spriteShaderData["__id"], "frameIndex_crossFade", frameIndex_crossFade, "CrossFadeBlendFactor", this.CrossFadeBlendFactor(crossFadeProgress, crossFadeTime), playingClip.name, "frameIndex=", frameIndex, "pixelSegmentation", playingClip.pixelSegmentation);
	            spriteShaderData.setVector(GPUSkinningPlayerResources.shaderPorpID_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade, new Vector4(frameIndex_crossFade, lastPlayedClip.pixelSegmentation, this.CrossFadeBlendFactor(crossFadeProgress, crossFadeTime)));
	        }
	    }
	    CrossFadeBlendFactor(crossFadeProgress, crossFadeTime) {
	        return Mathf.Clamp01(crossFadeProgress / crossFadeTime);
	    }
	    IsCrossFadeBlending(lastPlayedClip, crossFadeTime, crossFadeProgress) {
	        return lastPlayedClip != null && crossFadeTime > 0 && crossFadeProgress <= crossFadeTime;
	    }
	    GetMaterial(state) {
	        return this.mtrls[state];
	    }
	    InitMaterial(originalMaterial, skinningQuality) {
	        if (this.mtrls != null) {
	            return;
	        }
	        let SKILL_N;
	        switch (skinningQuality) {
	            case GPUSkinningQuality.Bone1:
	                SKILL_N = GPUSkinningPlayerResources.ShaderDefine_SKIN_1;
	                break;
	            case GPUSkinningQuality.Bone2:
	                SKILL_N = GPUSkinningPlayerResources.ShaderDefine_SKIN_2;
	                break;
	            case GPUSkinningQuality.Bone4:
	                SKILL_N = GPUSkinningPlayerResources.ShaderDefine_SKIN_4;
	                break;
	        }
	        let mtrls = this.mtrls = [];
	        for (let i = 0; i < MaterialState.Count; ++i) {
	            let materialItem = new GPUSkinningMaterial();
	            let material = materialItem.material = originalMaterial.clone();
	            material.lock = true;
	            mtrls[i] = materialItem;
	            material.name = GPUSkinningPlayerResources.keywords[i];
	            material._shaderValues.addDefine(SKILL_N);
	            this.EnableKeywords(i, materialItem);
	        }
	    }
	    CloneMaterial(originalMaterial, skinningQuality) {
	        if (originalMaterial == null) {
	            console.error("GPUSkinningPlayerResources.CloneMaterial originalMaterial=null");
	        }
	        let material = originalMaterial.clone();
	        let SKILL_N;
	        switch (skinningQuality) {
	            case GPUSkinningQuality.Bone1:
	                SKILL_N = GPUSkinningPlayerResources.ShaderDefine_SKIN_1;
	                break;
	            case GPUSkinningQuality.Bone2:
	                SKILL_N = GPUSkinningPlayerResources.ShaderDefine_SKIN_2;
	                break;
	            case GPUSkinningQuality.Bone4:
	                SKILL_N = GPUSkinningPlayerResources.ShaderDefine_SKIN_4;
	                break;
	        }
	        material._shaderValues.addDefine(SKILL_N);
	        material._shaderValues.addDefine(GPUSkinningPlayerResources.keywordDefines[3]);
	        return material;
	    }
	    EnableKeywords(ki, mtrl) {
	        for (let i = 0; i < this.mtrls.length; ++i) {
	            if (i == ki) {
	                mtrl.material._shaderValues.addDefine(GPUSkinningPlayerResources.keywordDefines[i]);
	            }
	            else {
	                mtrl.material._shaderValues.removeDefine(GPUSkinningPlayerResources.keywordDefines[i]);
	            }
	        }
	    }
	}
	GPUSkinningPlayerResources.keywords = [
	    "ROOTON_BLENDOFF", "ROOTON_BLENDON_CROSSFADEROOTON", "ROOTON_BLENDON_CROSSFADEROOTOFF",
	    "ROOTOFF_BLENDOFF", "ROOTOFF_BLENDON_CROSSFADEROOTON", "ROOTOFF_BLENDON_CROSSFADEROOTOFF"
	];
	GPUSkinningPlayerResources.keywordDefines = [];
	GPUSkinningPlayerResources.shaderPropID_GPUSkinning_TextureMatrix = -1;
	GPUSkinningPlayerResources.shaderPropID_GPUSkinning_TextureSize_NumPixelsPerFrame = 0;
	GPUSkinningPlayerResources.shaderPorpID_GPUSkinning_FrameIndex_PixelSegmentation = 0;
	GPUSkinningPlayerResources.shaderPorpID_GPUSkinning_FrameIndex_PixelSegmentation_Last = 0;
	GPUSkinningPlayerResources.shaderPropID_GPUSkinning_RootMotion = 0;
	GPUSkinningPlayerResources.shaderPorpID_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade = 0;
	GPUSkinningPlayerResources.shaderPropID_GPUSkinning_RootMotion_CrossFade = 0;
	GPUSkinningPlayerResources._isInited = false;

	class GPUSkinningPlayerMonoManager {
	    constructor() {
	        this.items = [];
	    }
	    Register(anim, mesh, originalMtrl, textureRawData, player) {
	        if (anim == null || originalMtrl == null || textureRawData == null || player == null) {
	            return;
	        }
	        let item = null;
	        let items = this.items;
	        let numItems = items.length;
	        for (let i = 0; i < numItems; ++i) {
	            if (items[i].anim.guid == anim.guid) {
	                item = items[i];
	                break;
	            }
	        }
	        if (item == null) {
	            item = new GPUSkinningPlayerResources();
	            items.push(item);
	        }
	        if (item.anim == null) {
	            item.anim = anim;
	        }
	        if (item.mesh == null) {
	            item.mesh = mesh;
	        }
	        item.InitMaterial(originalMtrl, anim.skinQuality);
	        if (item.texture == null) {
	            item.texture = textureRawData;
	        }
	        if (item.players.indexOf(player) == -1) {
	            item.players.push(player);
	            item.AddCullingBounds();
	            player.isEnable = true;
	        }
	        return item;
	    }
	    Unregister(player) {
	        if (player == null) {
	            return;
	        }
	        let items = this.items;
	        let numItems = items.length;
	        for (let i = 0; i < numItems; ++i) {
	            let playerIndex = items[i].players.indexOf(player);
	            if (playerIndex != -1) {
	                items[i].players.splice(playerIndex, 1);
	                items[i].RemoveCullingBounds(playerIndex);
	                player.isEnable = false;
	                if (items[i].players.length == 0) {
	                    items[i].Destroy();
	                    items.splice(i, 1);
	                }
	                break;
	            }
	        }
	    }
	}

	class GPUSkinningPlayerJoint extends Laya.Script3D {
	    constructor() {
	        super(...arguments);
	        this.BoneIndex = 0;
	        this.BoneGUID = null;
	    }
	    get Transform() {
	        return this.transform;
	    }
	    get GameObject() {
	        return this.go;
	    }
	    onAwake() {
	        this.go = this.owner;
	        this.transform = this.go.transform;
	    }
	    Init(boneIndex, boneGUID) {
	        this.BoneIndex = boneIndex;
	        this.BoneGUID = boneGUID;
	    }
	}

	var Vector3$2 = Laya.Vector3;
	var Matrix4x4$4 = Laya.Matrix4x4;
	var Quaternion$1 = Laya.Quaternion;
	class GPUSkinningPlayer {
	    constructor(go, res) {
	        this.time = 0;
	        this.timeDiff = 0;
	        this.crossFadeTime = -1;
	        this.crossFadeProgress = 0;
	        this.lastPlayedTime = 0;
	        this.lastPlayedClip = null;
	        this.lastPlayingFrameIndex = -1;
	        this.lastPlayingClip = null;
	        this.playingClip = null;
	        this.nextFrameIndex = -1;
	        this.nextLerpProgress = 0;
	        this.res = null;
	        this.rootMotionFrameIndex = -1;
	        this.speed = 1;
	        this.sAnimEvent = new Typed2Signal();
	        this.rootMotionEnabled = false;
	        this.cullingMode = GPUSKinningCullingMode.CullUpdateTransforms;
	        this.visible = true;
	        this.lodEnabled = false;
	        this.isPlaying = false;
	        this.joints = null;
	        this.__frameIndex = 0;
	        this.isRandomPlayClip = false;
	        this.randomPlayClipI = 0;
	        this.go = go;
	        this.transform = go.transform;
	        this.res = res;
	        this.mr = go.meshRenderer;
	        this.mf = go.meshFilter;
	        this.spriteShaderData = go.meshRenderer._shaderValues;
	        go.meshRenderer['__id'] = this.spriteShaderData['__id'] = GPUSkinningPlayer._ShaderUID++;
	        let mtrl = this.GetCurrentMaterial();
	        this.mtrl = mtrl;
	        var mtrl2 = new GPUSkinningMaterial();
	        mtrl2.material = res.CloneMaterial(mtrl.material, res.anim.skinQuality);
	        mtrl = mtrl2;
	        this.mtrl = mtrl2;
	        this.mr.sharedMaterial = mtrl == null ? null : mtrl.material;
	        this.mf.sharedMesh = res.mesh;
	        this.ConstructJoints();
	    }
	    get RootMotionEnabled() {
	        return this.rootMotionEnabled;
	    }
	    set RootMotionEnabled(value) {
	        this.rootMotionFrameIndex = -1;
	        this.rootMotionEnabled = value;
	    }
	    get CullingMode() {
	        return this.cullingMode;
	    }
	    set CullingMode(value) {
	        this.cullingMode = value;
	    }
	    get Visible() {
	        return this.visible;
	    }
	    set Visible(value) {
	        this.visible = value;
	    }
	    get LODEnabled() {
	        return this.lodEnabled;
	    }
	    set LODEnabled(value) {
	        this.lodEnabled = value;
	        this.res.LODSettingChanged(this);
	    }
	    get IsPlaying() {
	        return this.isPlaying;
	    }
	    get PlayingClipName() {
	        return this.playingClip == null ? null : this.playingClip.name;
	    }
	    get Position() {
	        return this.transform == null ? new Vector3$2() : this.transform.position;
	    }
	    get LocalPosition() {
	        return this.transform == null ? new Vector3$2() : this.transform.localPosition;
	    }
	    get Joints() {
	        return this.joints;
	    }
	    get WrapMode() {
	        return this.playingClip == null ? GPUSkinningWrapMode.Once : this.playingClip.wrapMode;
	    }
	    get ClipTimeLength() {
	        if (!this.playingClip) {
	            return 0;
	        }
	        return this.playingClip.length;
	    }
	    get IsTimeAtTheEndOfLoop() {
	        if (this.playingClip == null) {
	            return false;
	        }
	        else {
	            return this.GetFrameIndex() == (Math.floor(this.playingClip.length * this.playingClip.fps) - 1);
	        }
	    }
	    get NormalizedTime() {
	        if (this.playingClip == null) {
	            return 0;
	        }
	        else {
	            return this.GetFrameIndex() / (Math.floor(this.playingClip.length * this.playingClip.fps) - 1);
	        }
	    }
	    set NormalizedTime(value) {
	        if (this.playingClip != null) {
	            var v = Mathf.Clamp01(value);
	            if (this.WrapMode == GPUSkinningWrapMode.Once) {
	                this.time = v * this.playingClip.length;
	            }
	            else if (this.WrapMode == GPUSkinningWrapMode.Loop) {
	                if (this.playingClip.individualDifferenceEnabled) {
	                    this.res.Time = this.playingClip.length + v * this.playingClip.length - this.timeDiff;
	                }
	                else {
	                    this.res.Time = v * this.playingClip.length;
	                }
	            }
	            else {
	                console.error(`GPUSkinningPlayer.NormalizedTime 未知 播放模式 WrapMode=${this.WrapMode}`);
	            }
	        }
	    }
	    GetCurrentTime() {
	        let time = 0;
	        switch (this.WrapMode) {
	            case GPUSkinningWrapMode.Once:
	                time = this.time;
	                break;
	            case GPUSkinningWrapMode.Loop:
	                time = this.res.Time + (this.playingClip.individualDifferenceEnabled ? this.timeDiff : 0);
	                break;
	            default:
	                console.error(`GPUSkinningPlayer.GetCurrentTime 未知 播放模式 WrapMode=${this.WrapMode}`);
	                break;
	        }
	        return time;
	    }
	    GetFrameIndex() {
	        let time = this.GetCurrentTime();
	        if (this.playingClip.length == time) {
	            return this.GetTheLastFrameIndex_WrapMode_Once(this.playingClip);
	        }
	        else {
	            return this.GetFrameIndex_WrapMode_Loop(this.playingClip, time);
	        }
	    }
	    GetNextFrameIndex(currentFrameIndex) {
	        var frameIndex = currentFrameIndex;
	        var frameEnd = Math.floor(this.playingClip.length * this.playingClip.fps) - 1;
	        if (frameIndex == frameEnd) {
	            switch (this.WrapMode) {
	                case GPUSkinningWrapMode.Once:
	                    frameIndex = frameEnd;
	                    break;
	                case GPUSkinningWrapMode.Loop:
	                    frameIndex = 0;
	                    break;
	                default:
	                    console.error(`GPUSkinningPlayer.GetNextFrameIndex 未知 播放模式 WrapMode=${this.WrapMode}`);
	                    break;
	            }
	        }
	        else {
	            frameIndex++;
	        }
	        return frameIndex;
	    }
	    GetCrossFadeFrameIndex() {
	        if (this.lastPlayedClip == null) {
	            return 0;
	        }
	        switch (this.lastPlayedClip.wrapMode) {
	            case GPUSkinningWrapMode.Once:
	                if (this.lastPlayedTime >= this.lastPlayedClip.length) {
	                    return this.GetTheLastFrameIndex_WrapMode_Once(this.lastPlayedClip);
	                }
	                else {
	                    return this.GetFrameIndex_WrapMode_Loop(this.lastPlayedClip, this.lastPlayedTime);
	                }
	                break;
	            case GPUSkinningWrapMode.Loop:
	                return this.GetFrameIndex_WrapMode_Loop(this.lastPlayedClip, this.lastPlayedTime);
	                break;
	            default:
	                console.error(`GPUSkinningPlayer.GetCrossFadeFrameIndex 未知 播放模式 this.lastPlayedClip.wrapMode=${this.lastPlayedClip.wrapMode}`);
	                break;
	        }
	    }
	    GetTheLastFrameIndex_WrapMode_Once(clip) {
	        return clip.frameLastIndex;
	    }
	    GetFrameIndex_WrapMode_Loop(clip, time) {
	        return Math.floor(time * clip.fps) % Math.floor(clip.length * clip.fps);
	    }
	    GetCurrentMaterial() {
	        if (this.res == null) {
	            return null;
	        }
	        if (this.playingClip == null) {
	            return this.res.GetMaterial(MaterialState.RootOff_BlendOff);
	        }
	        let res = this.res;
	        let playingClip = this.playingClip;
	        let lastPlayedClip = this.lastPlayedClip;
	        let rootMotionEnabled = this.rootMotionEnabled;
	        let crossFadeTime = this.crossFadeTime;
	        let crossFadeProgress = this.crossFadeProgress;
	        if (playingClip.rootMotionEnabled && rootMotionEnabled) {
	            if (res.IsCrossFadeBlending(lastPlayedClip, crossFadeTime, crossFadeProgress)) {
	                if (lastPlayedClip.rootMotionEnabled) {
	                    return res.GetMaterial(MaterialState.RootOn_BlendOn_CrossFadeRootOn);
	                }
	                return res.GetMaterial(MaterialState.RootOn_BlendOn_CrossFadeRootOff);
	            }
	            return res.GetMaterial(MaterialState.RootOn_BlendOff);
	        }
	        if (res.IsCrossFadeBlending(lastPlayedClip, crossFadeTime, crossFadeProgress)) {
	            if (lastPlayedClip.rootMotionEnabled) {
	                return res.GetMaterial(MaterialState.RootOff_BlendOn_CrossFadeRootOn);
	            }
	            return res.GetMaterial(MaterialState.RootOff_BlendOn_CrossFadeRootOff);
	        }
	        else {
	            return res.GetMaterial(MaterialState.RootOff_BlendOff);
	        }
	    }
	    SetLODMesh(mesh) {
	        if (!this.LODEnabled) {
	            mesh = this.res.mesh;
	        }
	        if (this.mf != null && this.mf.sharedMesh != mesh) {
	            this.mf.sharedMesh = mesh;
	        }
	    }
	    ConstructJoints() {
	        if (this.joints)
	            return;
	        let existingJoints = this.go.getComponentsInChildren(GPUSkinningPlayerJoint);
	        let bones = this.res.anim.bones;
	        let numBones = bones == null ? 0 : bones.length;
	        for (let i = 0; i < numBones; i++) {
	            let bone = bones[i];
	            if (!bone.isExposed) {
	                continue;
	            }
	            if (this.joints == null) {
	                this.joints = [];
	            }
	            let joints = this.joints;
	            let inTheExistingJoints = false;
	            if (existingJoints != null) {
	                for (let j = 0; j < existingJoints.length; j++) {
	                    let existingJoint = existingJoints[j];
	                    if (existingJoint && existingJoint.BoneGUID == bone.guid) {
	                        if (existingJoint.BoneIndex != i) {
	                            existingJoint.Init(i, bone.guid);
	                        }
	                        joints.push(existingJoint);
	                        existingJoints[j] = null;
	                        inTheExistingJoints = true;
	                        break;
	                    }
	                }
	            }
	            if (!inTheExistingJoints) {
	                let joinGO = new Laya.Sprite3D(bone.name);
	                this.go.addChild(joinGO);
	                joinGO.transform.localPosition = new Vector3$2();
	                joinGO.transform.localScale = new Vector3$2(1, 1, 1);
	                let join = joinGO.addComponent(GPUSkinningPlayerJoint);
	                joints.push(join);
	                join.Init(i, bone.guid);
	            }
	        }
	        this.DeleteInvalidJoints(existingJoints);
	    }
	    DeleteInvalidJoints(joints) {
	        if (joints) {
	            for (let i = 0; i < joints.length; i++) {
	                let join = joints[i];
	                let joinGO = join.owner;
	                for (let j = joinGO.numChildren; j >= 0; j--) {
	                    let child = joinGO.getChildAt(j);
	                    this.go.addChild(child);
	                    child.transform.localPosition = new Vector3$2();
	                }
	                joinGO.removeSelf();
	                joinGO.destroy();
	            }
	        }
	    }
	    Play(clipName, nomrmalizeTime = 0) {
	        let clips = this.res.anim.clips;
	        let numClips = clips == null ? 0 : clips.length;
	        let playingClip = this.playingClip;
	        for (let i = 0; i < numClips; ++i) {
	            if (clips[i].name == clipName) {
	                let item = clips[i];
	                if (playingClip != item
	                    || (playingClip != null && playingClip.wrapMode == GPUSkinningWrapMode.Once && this.IsTimeAtTheEndOfLoop)
	                    || (playingClip != null && !this.isPlaying)) {
	                    this.SetNewPlayingClip(item, nomrmalizeTime);
	                }
	                this.time = nomrmalizeTime * item.length;
	                return;
	            }
	        }
	    }
	    CrossFade(clipName, fadeLength, nomrmalizeTime = 0) {
	        this.Play(clipName, nomrmalizeTime);
	        return;
	        if (this.playingClip == null) {
	            this.Play(clipName, nomrmalizeTime);
	        }
	        else {
	            let playingClip = this.playingClip;
	            let clips = this.res.anim.clips;
	            let numClips = clips == null ? 0 : clips.length;
	            for (let i = 0; i < numClips; ++i) {
	                if (clips[i].name == clipName) {
	                    let item = clips[i];
	                    if (playingClip != item) {
	                        this.crossFadeProgress = nomrmalizeTime;
	                        this.crossFadeTime = fadeLength;
	                        this.SetNewPlayingClip(item, nomrmalizeTime);
	                        return;
	                    }
	                    if ((playingClip != null && playingClip.wrapMode == GPUSkinningWrapMode.Once && this.IsTimeAtTheEndOfLoop)
	                        || (playingClip != null && !this.isPlaying)) {
	                        this.SetNewPlayingClip(item, nomrmalizeTime);
	                        return;
	                    }
	                }
	            }
	        }
	    }
	    SetNewPlayingClip(clip, nomrmalizeTime = 0) {
	        this.lastPlayedClip = this.playingClip;
	        this.lastPlayedTime = this.GetCurrentTime();
	        this.isPlaying = true;
	        this.playingClip = clip;
	        this.rootMotionFrameIndex = -1;
	        this.time = nomrmalizeTime * clip.length;
	        this.timeDiff = Random.range(0, clip.length);
	    }
	    Stop() {
	        this.isPlaying = false;
	    }
	    Resume() {
	        if (this.playingClip != null) {
	            this.isPlaying = true;
	        }
	    }
	    Update(timeDelta) {
	        if (!this.isPlaying || this.playingClip == null) {
	            return;
	        }
	        timeDelta *= this.speed;
	        if (this.isRandomPlayClip) {
	            this.randomPlayClipI++;
	            if (this.randomPlayClipI >= Random.range(100, 500)) {
	                this.randomPlayClipI = 0;
	                var i = Random.range(0, this.res.anim.clips.length);
	                i = Math.floor(i);
	                this.Play(this.res.anim.clips[i].name);
	            }
	        }
	        let currMtrl = this.mtrl;
	        let playingClip = this.playingClip;
	        switch (playingClip.wrapMode) {
	            case GPUSkinningWrapMode.Loop:
	                this.UpdateMaterial(timeDelta, currMtrl);
	                break;
	            case GPUSkinningWrapMode.Once:
	                if (this.time >= playingClip.length) {
	                    this.time = playingClip.length;
	                    this.UpdateMaterial(timeDelta, currMtrl);
	                }
	                else {
	                    this.UpdateMaterial(timeDelta, currMtrl);
	                    this.time += timeDelta;
	                    if (this.time > playingClip.length || this.__frameIndex == this.GetTheLastFrameIndex_WrapMode_Once(this.playingClip)) {
	                        this.time = playingClip.length;
	                    }
	                }
	                break;
	            default:
	                console.error(`GPUSkinningPlayer.Update 未知 播放模式 playingClip.wrapMode=${playingClip.wrapMode}`);
	                break;
	        }
	        this.crossFadeProgress += timeDelta;
	        this.lastPlayedTime += timeDelta;
	        this.lastPlayingClip = this.playingClip;
	        this.lastPlayingFrameIndex = this.__frameIndex;
	        this.nextFrameIndex = this.__frameIndex;
	        this.nextLerpProgress += timeDelta;
	    }
	    onRenderUpdate(context, transform, render) {
	        console.log(render['__id'], "onRenderUpdate");
	    }
	    UpdateMaterial(deltaTime, currMtrl) {
	        let res = this.res;
	        let frameIndex = this.GetFrameIndex();
	        this.__frameIndex = frameIndex;
	        this.nextFrameIndex = this.GetNextFrameIndex(frameIndex);
	        if (this.lastPlayingClip == this.playingClip && this.lastPlayingFrameIndex == frameIndex) ;
	        else {
	            this.nextLerpProgress = 0;
	        }
	        let lastPlayedClip = this.lastPlayingClip;
	        let playingClip = this.playingClip;
	        let blend_crossFade = 1;
	        let frameIndex_crossFade = -1;
	        let frame_crossFade = null;
	        if (res.IsCrossFadeBlending(lastPlayedClip, this.crossFadeTime, this.crossFadeProgress)) {
	            frameIndex_crossFade = this.GetCrossFadeFrameIndex();
	            frame_crossFade = lastPlayedClip.frames[frameIndex_crossFade];
	            blend_crossFade = res.CrossFadeBlendFactor(this.crossFadeProgress, this.crossFadeTime);
	        }
	        let nextFrameFade = res.CrossFadeBlendFactor(this.nextLerpProgress, playingClip.fps * 0.001);
	        var mpb = currMtrl.material._shaderValues;
	        let frame = playingClip.frames[frameIndex];
	        if (this.Visible ||
	            this.CullingMode == GPUSKinningCullingMode.AlwaysAnimate) {
	            res.Update(deltaTime, currMtrl);
	            res.UpdatePlayingData(mpb, this.spriteShaderData, playingClip, frameIndex, this.nextFrameIndex, nextFrameFade, frame, playingClip.rootMotionEnabled && this.rootMotionEnabled, lastPlayedClip, this.GetCrossFadeFrameIndex(), this.crossFadeTime, this.crossFadeProgress);
	            this.UpdateJoints(frame);
	        }
	        if (playingClip.rootMotionEnabled && this.rootMotionEnabled && frameIndex != this.rootMotionFrameIndex) {
	            if (this.CullingMode != GPUSKinningCullingMode.CullCompletely) {
	                this.rootMotionFrameIndex = frameIndex;
	                this.DoRootMotion(frame_crossFade, 1 - blend_crossFade, false);
	                this.DoRootMotion(frame, blend_crossFade, true);
	            }
	        }
	        this.UpdateEvents(playingClip, frameIndex, frame_crossFade == null ? null : lastPlayedClip, frameIndex_crossFade);
	    }
	    UpdateJoints(frame) {
	        if (this.joints == null) {
	            return;
	        }
	        let res = this.res;
	        let joints = this.joints;
	        let playingClip = this.playingClip;
	        let matrices = frame.matrices;
	        let bones = res.anim.bones;
	        let numJoints = joints.length;
	        for (let i = 0; i < numJoints; ++i) {
	            let joint = joints[i];
	            let jointTransform = joint.Transform;
	            if (jointTransform != null) {
	                let jointMatrix = new Matrix4x4$4();
	                Matrix4x4$4.multiply(frame.matrices[joint.BoneIndex], bones[joint.BoneIndex].BindposeInv, jointMatrix);
	                if (playingClip.rootMotionEnabled && this.rootMotionEnabled) {
	                    let outM = new Matrix4x4$4();
	                    Matrix4x4$4.multiply(frame.RootMotionInv(res.anim.rootBoneIndex), jointMatrix, outM);
	                    jointMatrix = outM;
	                }
	                var vec3 = new Vector3$2();
	                jointMatrix.getTranslationVector(vec3);
	                jointTransform.localPosition = vec3;
	                vec3 = new Vector3$2();
	                jointMatrix.getForward(vec3);
	                var vec3_2 = new Vector3$2();
	                Quaternion$1.angleTo(new Vector3$2(1, 0, 0), vec3, vec3_2);
	                jointTransform.localRotationEuler = vec3_2;
	            }
	            else {
	                joints.splice(i, 1);
	                --i;
	                --numJoints;
	            }
	        }
	    }
	    DoRootMotion(frame, blend, doRotate) {
	    }
	    UpdateEvents(playingClip, playingFrameIndex, corssFadeClip, crossFadeFrameIndex) {
	        this.UpdateClipEvent(playingClip, playingFrameIndex);
	        this.UpdateClipEvent(corssFadeClip, crossFadeFrameIndex);
	    }
	    UpdateClipEvent(clip, frameIndex) {
	        if (clip == null || clip.events == null || clip.events.length == 0) {
	            return;
	        }
	        let events = clip.events;
	        let numEvents = events.length;
	        for (let i = 0; i < numEvents; ++i) {
	            if (events[i].frameIndex == frameIndex) {
	                this.sAnimEvent.dispatch(this, events[i].eventId);
	                break;
	            }
	        }
	    }
	}
	GPUSkinningPlayer._ShaderUID = 0;

	class GPUSkinningPlayerMono extends Laya.Script3D {
	    constructor() {
	        super(...arguments);
	        this.isEnable = false;
	        this.defaultPlayingClipIndex = 0;
	        this.rootMotionEnabled = false;
	        this.lodEnabled = true;
	        this.cullingMode = GPUSKinningCullingMode.CullUpdateTransforms;
	    }
	    get Player() {
	        return this.player;
	    }
	    _cloneTo(dest) {
	        dest.anim = this.anim;
	        dest.mesh = this.mesh;
	        dest.mtrl = this.mtrl;
	        dest.textureRawData = this.textureRawData;
	        dest.Init();
	    }
	    onAwake() {
	    }
	    onEnable() {
	        this.Init();
	        this.isEnable = true;
	    }
	    onStart() {
	    }
	    onUpdate() {
	        if (this.player != null) {
	            this.player.Update(Laya.timer.delta / 1000);
	        }
	    }
	    onPreRender() {
	    }
	    onDisable() {
	        this.isEnable = false;
	    }
	    onDestroy() {
	        GPUSkinningPlayerMono.playerManager.Unregister(this);
	        this.anim = null;
	        this.mesh = null;
	        this.mtrl = null;
	        this.textureRawData = null;
	        this.player = null;
	    }
	    SetData(anim, mesh, mtrl, textureRawData) {
	        if (this.player != null) {
	            return;
	        }
	        this.anim = anim;
	        this.mesh = mesh;
	        this.mtrl = mtrl;
	        this.textureRawData = textureRawData;
	        this.Init();
	    }
	    Init() {
	        this.gameObject = this.owner;
	        if (this.player != null) {
	            return;
	        }
	        let anim = this.anim;
	        let mesh = this.mesh;
	        let mtrl = this.mtrl;
	        let textureRawData = this.textureRawData;
	        if (anim != null && mesh != null && mtrl != null && textureRawData != null) {
	            let res = GPUSkinningPlayerMono.playerManager.Register(anim, mesh, mtrl, textureRawData, this);
	            let player = new GPUSkinningPlayer(this.gameObject, res);
	            player.RootMotionEnabled = this.rootMotionEnabled;
	            player.LODEnabled = this.lodEnabled;
	            player.CullingMode = this.cullingMode;
	            this.player = player;
	            if (anim != null && anim.clips != null && anim.clips.length > 0) {
	                player.Play(anim.clips[Mathf.clamp(this.defaultPlayingClipIndex, 0, anim.clips.length)].name);
	            }
	        }
	    }
	    initRender(renderer) {
	        var r = renderer;
	        if (!r._renderUpdate__MeshRenderer__Source) {
	            r._renderUpdate__MeshRenderer__Source = r._renderUpdate;
	        }
	        r._renderUpdate = this._renderUpdate;
	        r.onRenderUpdate = this.onRenderUpdate.bind(this);
	    }
	    onRenderUpdate(context, transform, render) {
	        if (this.player != null) {
	            this.player.onRenderUpdate(context, transform, render);
	        }
	    }
	    _renderUpdate(context, transform) {
	        this.onRenderUpdate(context, transform, this);
	        this._renderUpdate__MeshRenderer__Source(context, transform);
	    }
	    _renderUpdate__MeshRenderer__Source(context, transform) {
	    }
	}
	GPUSkinningPlayerMono.playerManager = new GPUSkinningPlayerMonoManager();

	var Shader3D$1 = Laya.Shader3D;
	class GPUSkinningBaseMaterial extends Laya.Material {
	    static getShaderVS(filename) {
	        return this.SHADER_PATH_ROOT + filename + ".vs";
	    }
	    static getShaderPS(filename) {
	        return this.SHADER_PATH_ROOT + filename + ".fs";
	    }
	    static getShaderGLSL(filename) {
	        return this.SHADER_PATH_ROOT + filename + ".glsl";
	    }
	    static async loadShaderGlslAsync(filename) {
	        let code = await this.loadAsync(this.getShaderGLSL(filename), Laya.Loader.TEXT);
	        return code.replace(/\r/g, "");
	    }
	    static async loadShaderVSAsync(filename) {
	        let code = await this.loadAsync(this.getShaderVS(filename), Laya.Loader.TEXT);
	        return code.replace(/\r/g, "");
	    }
	    static async loadShaderPSAsync(filename) {
	        let code = await this.loadAsync(this.getShaderPS(filename), Laya.Loader.TEXT);
	        return code.replace(/\r/g, "");
	    }
	    static async loadAsync(path, type) {
	        return new Promise((resolve) => {
	            Laya.loader.load(path, Laya.Handler.create(null, (res) => {
	                resolve(res);
	            }), null, type);
	        });
	    }
	    static __initDefine__() {
	        this.SHADERDEFINE_GPUSKINING_MATRIX_TEXTURE = Shader3D$1.getDefineByName("GPUSKINING_MATRIX_TEXTURE");
	    }
	    get GPUSkinning_TextureMatrix() {
	        return this._shaderValues.getTexture(GPUSkinningBaseMaterial.GPUSKINING_MATRIX_TEXTURE);
	    }
	    set GPUSkinning_TextureMatrix(value) {
	        if (value)
	            this._shaderValues.addDefine(GPUSkinningBaseMaterial.SHADERDEFINE_GPUSKINING_MATRIX_TEXTURE);
	        else
	            this._shaderValues.removeDefine(GPUSkinningBaseMaterial.SHADERDEFINE_GPUSKINING_MATRIX_TEXTURE);
	        this._shaderValues.setTexture(GPUSkinningBaseMaterial.GPUSKINING_MATRIX_TEXTURE, value);
	    }
	}
	GPUSkinningBaseMaterial.SHADER_PATH_ROOT = "res/shaders/GPUSkinning/";
	GPUSkinningBaseMaterial.GPUSKINING_MATRIX_TEXTURE = Shader3D$1.propertyNameToID("u_GPUSkinning_TextureMatrix");

	var Shader3D$2 = Laya.Shader3D;
	var SubShader = Laya.SubShader;
	var VertexMesh$1 = Laya.VertexMesh;
	var Vector4$1 = Laya.Vector4;
	var RenderState = Laya.RenderState;
	var Material = Laya.Material;
	class GPUSkinningUnlitMaterial extends GPUSkinningBaseMaterial {
	    constructor() {
	        super();
	        this._albedoColor = new Vector4$1(1.0, 1.0, 1.0, 1.0);
	        this._albedoIntensity = 1.0;
	        this._enableVertexColor = false;
	        this.setShaderName(GPUSkinningUnlitMaterial.shaderName);
	        this._shaderValues.setVector(GPUSkinningUnlitMaterial.ALBEDOCOLOR, new Vector4$1(1.0, 1.0, 1.0, 1.0));
	        this.renderMode = GPUSkinningUnlitMaterial.RENDERMODE_OPAQUE;
	    }
	    static async install() {
	        if (this._isInstalled) {
	            return;
	        }
	        this._isInstalled = true;
	        GPUSkinningUnlitMaterial.__initDefine__();
	        await GPUSkinningUnlitMaterial.initShader();
	        GPUSkinningUnlitMaterial.defaultMaterial = new GPUSkinningUnlitMaterial();
	        GPUSkinningUnlitMaterial.defaultMaterial.lock = true;
	    }
	    static async initShader() {
	        var vs = await GPUSkinningUnlitMaterial.loadShaderVSAsync(GPUSkinningUnlitMaterial.shaderName);
	        var ps = await GPUSkinningUnlitMaterial.loadShaderPSAsync(GPUSkinningUnlitMaterial.shaderName);
	        var attributeMap;
	        var uniformMap;
	        var stateMap;
	        var shader;
	        var subShader;
	        attributeMap =
	            {
	                'a_Position': VertexMesh$1.MESH_POSITION0,
	                'a_Color': VertexMesh$1.MESH_COLOR0,
	                'a_Texcoord0': VertexMesh$1.MESH_TEXTURECOORDINATE0,
	                'a_Texcoord1': VertexMesh$1.MESH_TEXTURECOORDINATE1,
	                'a_Texcoord2': GPUSkiningVertexMesh.MESH_TEXTURECOORDINATE2,
	                'a_MvpMatrix': VertexMesh$1.MESH_MVPMATRIX_ROW0
	            };
	        uniformMap =
	            {
	                'u_GPUSkinning_TextureMatrix': Shader3D$2.PERIOD_MATERIAL,
	                'u_GPUSkinning_TextureSize_NumPixelsPerFrame': Shader3D$2.PERIOD_MATERIAL,
	                'u_GPUSkinning_RootMotion': Shader3D$2.PERIOD_MATERIAL,
	                'u_GPUSkinning_RootMotion_CrossFade': Shader3D$2.PERIOD_MATERIAL,
	                'u_GPUSkinning_FrameIndex_PixelSegmentation': Shader3D$2.PERIOD_SPRITE,
	                'u_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade': Shader3D$2.PERIOD_SPRITE,
	                'u_AlbedoTexture': Shader3D$2.PERIOD_MATERIAL,
	                'u_AlbedoColor': Shader3D$2.PERIOD_MATERIAL,
	                'u_TilingOffset': Shader3D$2.PERIOD_MATERIAL,
	                'u_AlphaTestValue': Shader3D$2.PERIOD_MATERIAL,
	                'u_MvpMatrix': Shader3D$2.PERIOD_SPRITE,
	                'u_FogStart': Shader3D$2.PERIOD_SCENE,
	                'u_FogRange': Shader3D$2.PERIOD_SCENE,
	                'u_FogColor': Shader3D$2.PERIOD_SCENE
	            };
	        stateMap =
	            {
	                's_Cull': Shader3D$2.RENDER_STATE_CULL,
	                's_Blend': Shader3D$2.RENDER_STATE_BLEND,
	                's_BlendSrc': Shader3D$2.RENDER_STATE_BLEND_SRC,
	                's_BlendDst': Shader3D$2.RENDER_STATE_BLEND_DST,
	                's_DepthTest': Shader3D$2.RENDER_STATE_DEPTH_TEST,
	                's_DepthWrite': Shader3D$2.RENDER_STATE_DEPTH_WRITE
	            };
	        shader = Shader3D$2.add(GPUSkinningUnlitMaterial.shaderName, null, null, true);
	        subShader = new SubShader(attributeMap, uniformMap);
	        shader.addSubShader(subShader);
	        var mainPass = subShader.addShaderPass(vs, ps, stateMap);
	    }
	    static __initDefine__() {
	        GPUSkinningUnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE = Shader3D$2.getDefineByName("ALBEDOTEXTURE");
	        GPUSkinningUnlitMaterial.SHADERDEFINE_TILINGOFFSET = Shader3D$2.getDefineByName("TILINGOFFSET");
	        GPUSkinningUnlitMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D$2.getDefineByName("ENABLEVERTEXCOLOR");
	    }
	    get _ColorR() {
	        return this._albedoColor.x;
	    }
	    set _ColorR(value) {
	        this._albedoColor.x = value;
	        this.albedoColor = this._albedoColor;
	    }
	    get _ColorG() {
	        return this._albedoColor.y;
	    }
	    set _ColorG(value) {
	        this._albedoColor.y = value;
	        this.albedoColor = this._albedoColor;
	    }
	    get _ColorB() {
	        return this._albedoColor.z;
	    }
	    set _ColorB(value) {
	        this._albedoColor.z = value;
	        this.albedoColor = this._albedoColor;
	    }
	    get _ColorA() {
	        return this._albedoColor.w;
	    }
	    set _ColorA(value) {
	        this._albedoColor.w = value;
	        this.albedoColor = this._albedoColor;
	    }
	    get _AlbedoIntensity() {
	        return this._albedoIntensity;
	    }
	    set _AlbedoIntensity(value) {
	        if (this._albedoIntensity !== value) {
	            var finalAlbedo = this._shaderValues.getVector(GPUSkinningUnlitMaterial.ALBEDOCOLOR);
	            Vector4$1.scale(this._albedoColor, value, finalAlbedo);
	            this._albedoIntensity = value;
	            this._shaderValues.setVector(GPUSkinningUnlitMaterial.ALBEDOCOLOR, finalAlbedo);
	        }
	    }
	    get _MainTex_STX() {
	        return this._shaderValues.getVector(GPUSkinningUnlitMaterial.TILINGOFFSET).x;
	    }
	    set _MainTex_STX(x) {
	        var tilOff = this._shaderValues.getVector(GPUSkinningUnlitMaterial.TILINGOFFSET);
	        tilOff.x = x;
	        this.tilingOffset = tilOff;
	    }
	    get _MainTex_STY() {
	        return this._shaderValues.getVector(GPUSkinningUnlitMaterial.TILINGOFFSET).y;
	    }
	    set _MainTex_STY(y) {
	        var tilOff = this._shaderValues.getVector(GPUSkinningUnlitMaterial.TILINGOFFSET);
	        tilOff.y = y;
	        this.tilingOffset = tilOff;
	    }
	    get _MainTex_STZ() {
	        return this._shaderValues.getVector(GPUSkinningUnlitMaterial.TILINGOFFSET).z;
	    }
	    set _MainTex_STZ(z) {
	        var tilOff = this._shaderValues.getVector(GPUSkinningUnlitMaterial.TILINGOFFSET);
	        tilOff.z = z;
	        this.tilingOffset = tilOff;
	    }
	    get _MainTex_STW() {
	        return this._shaderValues.getVector(GPUSkinningUnlitMaterial.TILINGOFFSET).w;
	    }
	    set _MainTex_STW(w) {
	        var tilOff = this._shaderValues.getVector(GPUSkinningUnlitMaterial.TILINGOFFSET);
	        tilOff.w = w;
	        this.tilingOffset = tilOff;
	    }
	    get _Cutoff() {
	        return this.alphaTestValue;
	    }
	    set _Cutoff(value) {
	        this.alphaTestValue = value;
	    }
	    get albedoColorR() {
	        return this._ColorR;
	    }
	    set albedoColorR(value) {
	        this._ColorR = value;
	    }
	    get albedoColorG() {
	        return this._ColorG;
	    }
	    set albedoColorG(value) {
	        this._ColorG = value;
	    }
	    get albedoColorB() {
	        return this._ColorB;
	    }
	    set albedoColorB(value) {
	        this._ColorB = value;
	    }
	    get albedoColorA() {
	        return this._ColorA;
	    }
	    set albedoColorA(value) {
	        this._ColorA = value;
	    }
	    get albedoColor() {
	        return this._albedoColor;
	    }
	    set albedoColor(value) {
	        var finalAlbedo = this._shaderValues.getVector(GPUSkinningUnlitMaterial.ALBEDOCOLOR);
	        Vector4$1.scale(value, this._albedoIntensity, finalAlbedo);
	        this._albedoColor = value;
	        this._shaderValues.setVector(GPUSkinningUnlitMaterial.ALBEDOCOLOR, finalAlbedo);
	    }
	    get albedoIntensity() {
	        return this._albedoIntensity;
	    }
	    set albedoIntensity(value) {
	        this._AlbedoIntensity = value;
	    }
	    get albedoTexture() {
	        return this._shaderValues.getTexture(GPUSkinningUnlitMaterial.ALBEDOTEXTURE);
	    }
	    set albedoTexture(value) {
	        if (value)
	            this._shaderValues.addDefine(GPUSkinningUnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE);
	        else
	            this._shaderValues.removeDefine(GPUSkinningUnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE);
	        this._shaderValues.setTexture(GPUSkinningUnlitMaterial.ALBEDOTEXTURE, value);
	    }
	    get tilingOffsetX() {
	        return this._MainTex_STX;
	    }
	    set tilingOffsetX(x) {
	        this._MainTex_STX = x;
	    }
	    get tilingOffsetY() {
	        return this._MainTex_STY;
	    }
	    set tilingOffsetY(y) {
	        this._MainTex_STY = y;
	    }
	    get tilingOffsetZ() {
	        return this._MainTex_STZ;
	    }
	    set tilingOffsetZ(z) {
	        this._MainTex_STZ = z;
	    }
	    get tilingOffsetW() {
	        return this._MainTex_STW;
	    }
	    set tilingOffsetW(w) {
	        this._MainTex_STW = w;
	    }
	    get tilingOffset() {
	        return this._shaderValues.getVector(GPUSkinningUnlitMaterial.TILINGOFFSET);
	    }
	    set tilingOffset(value) {
	        if (value) {
	            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
	                this._shaderValues.addDefine(GPUSkinningUnlitMaterial.SHADERDEFINE_TILINGOFFSET);
	            else
	                this._shaderValues.removeDefine(GPUSkinningUnlitMaterial.SHADERDEFINE_TILINGOFFSET);
	        }
	        else {
	            this._shaderValues.removeDefine(GPUSkinningUnlitMaterial.SHADERDEFINE_TILINGOFFSET);
	        }
	        this._shaderValues.setVector(GPUSkinningUnlitMaterial.TILINGOFFSET, value);
	    }
	    get enableVertexColor() {
	        return this._enableVertexColor;
	    }
	    set enableVertexColor(value) {
	        this._enableVertexColor = value;
	        if (value)
	            this._shaderValues.addDefine(GPUSkinningUnlitMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	        else
	            this._shaderValues.removeDefine(GPUSkinningUnlitMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	    }
	    set renderMode(value) {
	        switch (value) {
	            case GPUSkinningUnlitMaterial.RENDERMODE_OPAQUE:
	                this.alphaTest = false;
	                this.renderQueue = Material.RENDERQUEUE_OPAQUE;
	                this.depthWrite = true;
	                this.cull = RenderState.CULL_BACK;
	                this.blend = RenderState.BLEND_DISABLE;
	                this.depthTest = RenderState.DEPTHTEST_LESS;
	                break;
	            case GPUSkinningUnlitMaterial.RENDERMODE_CUTOUT:
	                this.renderQueue = Material.RENDERQUEUE_ALPHATEST;
	                this.alphaTest = true;
	                this.depthWrite = true;
	                this.cull = RenderState.CULL_BACK;
	                this.blend = RenderState.BLEND_DISABLE;
	                this.depthTest = RenderState.DEPTHTEST_LESS;
	                break;
	            case GPUSkinningUnlitMaterial.RENDERMODE_TRANSPARENT:
	                this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
	                this.alphaTest = false;
	                this.depthWrite = false;
	                this.cull = RenderState.CULL_BACK;
	                this.blend = RenderState.BLEND_ENABLE_ALL;
	                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
	                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
	                this.depthTest = RenderState.DEPTHTEST_LESS;
	                break;
	            default:
	                throw new Error("GPUSkinningUnlitMaterial : renderMode value error.");
	        }
	    }
	    get depthWrite() {
	        return this._shaderValues.getBool(GPUSkinningUnlitMaterial.DEPTH_WRITE);
	    }
	    set depthWrite(value) {
	        this._shaderValues.setBool(GPUSkinningUnlitMaterial.DEPTH_WRITE, value);
	    }
	    get cull() {
	        return this._shaderValues.getInt(GPUSkinningUnlitMaterial.CULL);
	    }
	    set cull(value) {
	        this._shaderValues.setInt(GPUSkinningUnlitMaterial.CULL, value);
	    }
	    get blend() {
	        return this._shaderValues.getInt(GPUSkinningUnlitMaterial.BLEND);
	    }
	    set blend(value) {
	        this._shaderValues.setInt(GPUSkinningUnlitMaterial.BLEND, value);
	    }
	    get blendSrc() {
	        return this._shaderValues.getInt(GPUSkinningUnlitMaterial.BLEND_SRC);
	    }
	    set blendSrc(value) {
	        this._shaderValues.setInt(GPUSkinningUnlitMaterial.BLEND_SRC, value);
	    }
	    get blendDst() {
	        return this._shaderValues.getInt(GPUSkinningUnlitMaterial.BLEND_DST);
	    }
	    set blendDst(value) {
	        this._shaderValues.setInt(GPUSkinningUnlitMaterial.BLEND_DST, value);
	    }
	    get depthTest() {
	        return this._shaderValues.getInt(GPUSkinningUnlitMaterial.DEPTH_TEST);
	    }
	    set depthTest(value) {
	        this._shaderValues.setInt(GPUSkinningUnlitMaterial.DEPTH_TEST, value);
	    }
	    clone() {
	        var dest = new GPUSkinningUnlitMaterial();
	        this.cloneTo(dest);
	        dest._albedoIntensity = this._albedoIntensity;
	        this._albedoColor.cloneTo(dest._albedoColor);
	        return dest;
	    }
	}
	GPUSkinningUnlitMaterial.shaderName = "GPUSkinningUnlit";
	GPUSkinningUnlitMaterial._isInstalled = false;
	GPUSkinningUnlitMaterial.RENDERMODE_OPAQUE = 0;
	GPUSkinningUnlitMaterial.RENDERMODE_CUTOUT = 1;
	GPUSkinningUnlitMaterial.RENDERMODE_TRANSPARENT = 2;
	GPUSkinningUnlitMaterial.RENDERMODE_ADDTIVE = 3;
	GPUSkinningUnlitMaterial.ALBEDOTEXTURE = Shader3D$2.propertyNameToID("u_AlbedoTexture");
	GPUSkinningUnlitMaterial.ALBEDOCOLOR = Shader3D$2.propertyNameToID("u_AlbedoColor");
	GPUSkinningUnlitMaterial.TILINGOFFSET = Shader3D$2.propertyNameToID("u_TilingOffset");
	GPUSkinningUnlitMaterial.CULL = Shader3D$2.propertyNameToID("s_Cull");
	GPUSkinningUnlitMaterial.BLEND = Shader3D$2.propertyNameToID("s_Blend");
	GPUSkinningUnlitMaterial.BLEND_SRC = Shader3D$2.propertyNameToID("s_BlendSrc");
	GPUSkinningUnlitMaterial.BLEND_DST = Shader3D$2.propertyNameToID("s_BlendDst");
	GPUSkinningUnlitMaterial.DEPTH_TEST = Shader3D$2.propertyNameToID("s_DepthTest");
	GPUSkinningUnlitMaterial.DEPTH_WRITE = Shader3D$2.propertyNameToID("s_DepthWrite");

	var Shader3D$3 = Laya.Shader3D;
	var SubShader$1 = Laya.SubShader;
	var VertexMesh$2 = Laya.VertexMesh;
	var Vector4$2 = Laya.Vector4;
	var RenderState$1 = Laya.RenderState;
	var Scene3DShaderDeclaration = Laya.Scene3DShaderDeclaration;
	var Material$1 = Laya.Material;
	class GPUSkinningCartoonMaterial extends GPUSkinningBaseMaterial {
	    constructor() {
	        super();
	        this._albedoColor = new Vector4$2(1.0, 1.0, 1.0, 1.0);
	        this._albedoIntensity = 1.0;
	        this._enableVertexColor = false;
	        this.setShaderName(GPUSkinningCartoonMaterial.shaderName);
	        this._albedoIntensity = 1.0;
	        this._shaderValues.setVector(GPUSkinningCartoonMaterial.ALBEDOCOLOR, new Vector4$2(1.0, 1.0, 1.0, 1.0));
	        this._shaderValues.setVector(GPUSkinningCartoonMaterial.TILINGOFFSET, new Vector4$2(1.0, 1.0, 0.0, 0.0));
	        this.CartoonShadowColor = new Vector4$2(0.1764706, 0.1764706, 0.1764706, 1.0);
	        this.CartoonColorRange = 0.08;
	        this.CartoonColorDeep = 88.4;
	        this.CartoonOutlineWidth = 0.004;
	        this._shaderValues.setNumber(Material$1.ALPHATESTVALUE, 0.5);
	        this._enableLighting = true;
	        this.renderMode = GPUSkinningCartoonMaterial.RENDERMODE_OPAQUE;
	    }
	    static async install() {
	        if (this._isInstalled) {
	            return;
	        }
	        this._isInstalled = true;
	        GPUSkinningCartoonMaterial.__initDefine__();
	        await GPUSkinningCartoonMaterial.initShader();
	        GPUSkinningCartoonMaterial.defaultMaterial = new GPUSkinningCartoonMaterial();
	        GPUSkinningCartoonMaterial.defaultMaterial.lock = true;
	    }
	    static async initShader() {
	        var vs = await GPUSkinningCartoonMaterial.loadShaderVSAsync(GPUSkinningCartoonMaterial.shaderName);
	        var ps = await GPUSkinningCartoonMaterial.loadShaderPSAsync(GPUSkinningCartoonMaterial.shaderName);
	        var attributeMap;
	        var uniformMap;
	        var stateMap;
	        var shader;
	        var subShader;
	        attributeMap =
	            {
	                'a_Position': VertexMesh$2.MESH_POSITION0,
	                'a_Color': VertexMesh$2.MESH_COLOR0,
	                'a_Normal': VertexMesh$2.MESH_NORMAL0,
	                'a_Texcoord0': VertexMesh$2.MESH_TEXTURECOORDINATE0,
	                'a_Texcoord1': VertexMesh$2.MESH_TEXTURECOORDINATE1,
	                'a_Texcoord2': GPUSkiningVertexMesh.MESH_TEXTURECOORDINATE2,
	                'a_MvpMatrix': VertexMesh$2.MESH_MVPMATRIX_ROW0,
	                'a_WorldMat': VertexMesh$2.MESH_WORLDMATRIX_ROW0
	            };
	        uniformMap =
	            {
	                'u_GPUSkinning_TextureMatrix': Shader3D$3.PERIOD_MATERIAL,
	                'u_GPUSkinning_TextureSize_NumPixelsPerFrame': Shader3D$3.PERIOD_MATERIAL,
	                'u_GPUSkinning_RootMotion': Shader3D$3.PERIOD_MATERIAL,
	                'u_GPUSkinning_RootMotion_CrossFade': Shader3D$3.PERIOD_MATERIAL,
	                'u_GPUSkinning_FrameIndex_PixelSegmentation': Shader3D$3.PERIOD_SPRITE,
	                'u_GPUSkinning_FrameIndex_PixelSegmentation_Blend_CrossFade': Shader3D$3.PERIOD_SPRITE,
	                'u_CartoonShadowColor': Shader3D$3.PERIOD_MATERIAL,
	                'u_CartoonColorRange': Shader3D$3.PERIOD_MATERIAL,
	                'u_CartoonColorDeep': Shader3D$3.PERIOD_MATERIAL,
	                'u_CartoonOutlineWidth': Shader3D$3.PERIOD_MATERIAL,
	                'u_AlbedoTexture': Shader3D$3.PERIOD_MATERIAL,
	                'u_AlbedoColor': Shader3D$3.PERIOD_MATERIAL,
	                'u_TilingOffset': Shader3D$3.PERIOD_MATERIAL,
	                'u_AlphaTestValue': Shader3D$3.PERIOD_MATERIAL,
	                'u_WorldMat': Shader3D$3.PERIOD_SPRITE,
	                'u_MvpMatrix': Shader3D$3.PERIOD_SPRITE,
	                'u_FogStart': Shader3D$3.PERIOD_SCENE,
	                'u_FogRange': Shader3D$3.PERIOD_SCENE,
	                'u_FogColor': Shader3D$3.PERIOD_SCENE,
	                'u_DirationLightCount': Shader3D$3.PERIOD_SCENE,
	                'u_LightBuffer': Shader3D$3.PERIOD_SCENE,
	                'u_LightClusterBuffer': Shader3D$3.PERIOD_SCENE,
	                'u_AmbientColor': Shader3D$3.PERIOD_SCENE,
	                'u_DirectionLight.color': Shader3D$3.PERIOD_SCENE,
	                'u_DirectionLight.direction': Shader3D$3.PERIOD_SCENE,
	                'u_PointLight.position': Shader3D$3.PERIOD_SCENE,
	                'u_PointLight.range': Shader3D$3.PERIOD_SCENE,
	                'u_PointLight.color': Shader3D$3.PERIOD_SCENE,
	                'u_SpotLight.position': Shader3D$3.PERIOD_SCENE,
	                'u_SpotLight.direction': Shader3D$3.PERIOD_SCENE,
	                'u_SpotLight.range': Shader3D$3.PERIOD_SCENE,
	                'u_SpotLight.spot': Shader3D$3.PERIOD_SCENE,
	                'u_SpotLight.color': Shader3D$3.PERIOD_SCENE,
	                'u_CameraPos': Shader3D$3.PERIOD_CAMERA
	            };
	        stateMap =
	            {
	                's_Cull': Shader3D$3.RENDER_STATE_CULL,
	                's_Blend': Shader3D$3.RENDER_STATE_BLEND,
	                's_BlendSrc': Shader3D$3.RENDER_STATE_BLEND_SRC,
	                's_BlendDst': Shader3D$3.RENDER_STATE_BLEND_DST,
	                's_DepthTest': Shader3D$3.RENDER_STATE_DEPTH_TEST,
	                's_DepthWrite': Shader3D$3.RENDER_STATE_DEPTH_WRITE
	            };
	        shader = Shader3D$3.add(GPUSkinningCartoonMaterial.shaderName, null, null, true);
	        subShader = new SubShader$1(attributeMap, uniformMap);
	        shader.addSubShader(subShader);
	        var mainPass = subShader.addShaderPass(vs, ps, stateMap);
	    }
	    static __initDefine__() {
	        GPUSkinningCartoonMaterial.SHADERDEFINE_ALBEDOTEXTURE = Shader3D$3.getDefineByName("ALBEDOTEXTURE");
	        GPUSkinningCartoonMaterial.SHADERDEFINE_TILINGOFFSET = Shader3D$3.getDefineByName("TILINGOFFSET");
	        GPUSkinningCartoonMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Shader3D$3.getDefineByName("ENABLEVERTEXCOLOR");
	    }
	    get _ColorR() {
	        return this._albedoColor.x;
	    }
	    set _ColorR(value) {
	        this._albedoColor.x = value;
	        this.albedoColor = this._albedoColor;
	    }
	    get _ColorG() {
	        return this._albedoColor.y;
	    }
	    set _ColorG(value) {
	        this._albedoColor.y = value;
	        this.albedoColor = this._albedoColor;
	    }
	    get _ColorB() {
	        return this._albedoColor.z;
	    }
	    set _ColorB(value) {
	        this._albedoColor.z = value;
	        this.albedoColor = this._albedoColor;
	    }
	    get _ColorA() {
	        return this._albedoColor.w;
	    }
	    set _ColorA(value) {
	        this._albedoColor.w = value;
	        this.albedoColor = this._albedoColor;
	    }
	    get _AlbedoIntensity() {
	        return this._albedoIntensity;
	    }
	    set _AlbedoIntensity(value) {
	        if (this._albedoIntensity !== value) {
	            var finalAlbedo = this._shaderValues.getVector(GPUSkinningCartoonMaterial.ALBEDOCOLOR);
	            Vector4$2.scale(this._albedoColor, value, finalAlbedo);
	            this._albedoIntensity = value;
	            this._shaderValues.setVector(GPUSkinningCartoonMaterial.ALBEDOCOLOR, finalAlbedo);
	        }
	    }
	    get _MainTex_STX() {
	        return this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET).x;
	    }
	    set _MainTex_STX(x) {
	        var tilOff = this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET);
	        tilOff.x = x;
	        this.tilingOffset = tilOff;
	    }
	    get _MainTex_STY() {
	        return this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET).y;
	    }
	    set _MainTex_STY(y) {
	        var tilOff = this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET);
	        tilOff.y = y;
	        this.tilingOffset = tilOff;
	    }
	    get _MainTex_STZ() {
	        return this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET).z;
	    }
	    set _MainTex_STZ(z) {
	        var tilOff = this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET);
	        tilOff.z = z;
	        this.tilingOffset = tilOff;
	    }
	    get _MainTex_STW() {
	        return this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET).w;
	    }
	    set _MainTex_STW(w) {
	        var tilOff = this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET);
	        tilOff.w = w;
	        this.tilingOffset = tilOff;
	    }
	    get _Cutoff() {
	        return this.alphaTestValue;
	    }
	    set _Cutoff(value) {
	        this.alphaTestValue = value;
	    }
	    get albedoColorR() {
	        return this._ColorR;
	    }
	    set albedoColorR(value) {
	        this._ColorR = value;
	    }
	    get albedoColorG() {
	        return this._ColorG;
	    }
	    set albedoColorG(value) {
	        this._ColorG = value;
	    }
	    get albedoColorB() {
	        return this._ColorB;
	    }
	    set albedoColorB(value) {
	        this._ColorB = value;
	    }
	    get albedoColorA() {
	        return this._ColorA;
	    }
	    set albedoColorA(value) {
	        this._ColorA = value;
	    }
	    get albedoColor() {
	        return this._albedoColor;
	    }
	    set albedoColor(value) {
	        var finalAlbedo = this._shaderValues.getVector(GPUSkinningCartoonMaterial.ALBEDOCOLOR);
	        Vector4$2.scale(value, this._albedoIntensity, finalAlbedo);
	        this._albedoColor = value;
	        this._shaderValues.setVector(GPUSkinningCartoonMaterial.ALBEDOCOLOR, finalAlbedo);
	    }
	    get albedoIntensity() {
	        return this._albedoIntensity;
	    }
	    set albedoIntensity(value) {
	        this._AlbedoIntensity = value;
	    }
	    get albedoTexture() {
	        return this._shaderValues.getTexture(GPUSkinningCartoonMaterial.ALBEDOTEXTURE);
	    }
	    set albedoTexture(value) {
	        if (value)
	            this._shaderValues.addDefine(GPUSkinningCartoonMaterial.SHADERDEFINE_ALBEDOTEXTURE);
	        else
	            this._shaderValues.removeDefine(GPUSkinningCartoonMaterial.SHADERDEFINE_ALBEDOTEXTURE);
	        this._shaderValues.setTexture(GPUSkinningCartoonMaterial.ALBEDOTEXTURE, value);
	    }
	    get tilingOffsetX() {
	        return this._MainTex_STX;
	    }
	    set tilingOffsetX(x) {
	        this._MainTex_STX = x;
	    }
	    get tilingOffsetY() {
	        return this._MainTex_STY;
	    }
	    set tilingOffsetY(y) {
	        this._MainTex_STY = y;
	    }
	    get tilingOffsetZ() {
	        return this._MainTex_STZ;
	    }
	    set tilingOffsetZ(z) {
	        this._MainTex_STZ = z;
	    }
	    get tilingOffsetW() {
	        return this._MainTex_STW;
	    }
	    set tilingOffsetW(w) {
	        this._MainTex_STW = w;
	    }
	    get tilingOffset() {
	        return this._shaderValues.getVector(GPUSkinningCartoonMaterial.TILINGOFFSET);
	    }
	    set tilingOffset(value) {
	        if (value) {
	            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
	                this._shaderValues.addDefine(GPUSkinningCartoonMaterial.SHADERDEFINE_TILINGOFFSET);
	            else
	                this._shaderValues.removeDefine(GPUSkinningCartoonMaterial.SHADERDEFINE_TILINGOFFSET);
	        }
	        else {
	            this._shaderValues.removeDefine(GPUSkinningCartoonMaterial.SHADERDEFINE_TILINGOFFSET);
	        }
	        this._shaderValues.setVector(GPUSkinningCartoonMaterial.TILINGOFFSET, value);
	    }
	    get enableVertexColor() {
	        return this._enableVertexColor;
	    }
	    set enableVertexColor(value) {
	        this._enableVertexColor = value;
	        if (value)
	            this._shaderValues.addDefine(GPUSkinningCartoonMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	        else
	            this._shaderValues.removeDefine(GPUSkinningCartoonMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
	    }
	    set renderMode(value) {
	        switch (value) {
	            case GPUSkinningCartoonMaterial.RENDERMODE_OPAQUE:
	                this.alphaTest = false;
	                this.renderQueue = Material$1.RENDERQUEUE_OPAQUE;
	                this.depthWrite = true;
	                this.cull = RenderState$1.CULL_BACK;
	                this.blend = RenderState$1.BLEND_DISABLE;
	                this.depthTest = RenderState$1.DEPTHTEST_LESS;
	                break;
	            case GPUSkinningCartoonMaterial.RENDERMODE_CUTOUT:
	                this.renderQueue = Material$1.RENDERQUEUE_ALPHATEST;
	                this.alphaTest = true;
	                this.depthWrite = true;
	                this.cull = RenderState$1.CULL_BACK;
	                this.blend = RenderState$1.BLEND_DISABLE;
	                this.depthTest = RenderState$1.DEPTHTEST_LESS;
	                break;
	            case GPUSkinningCartoonMaterial.RENDERMODE_TRANSPARENT:
	                this.renderQueue = Material$1.RENDERQUEUE_TRANSPARENT;
	                this.alphaTest = false;
	                this.depthWrite = false;
	                this.cull = RenderState$1.CULL_BACK;
	                this.blend = RenderState$1.BLEND_ENABLE_ALL;
	                this.blendSrc = RenderState$1.BLENDPARAM_SRC_ALPHA;
	                this.blendDst = RenderState$1.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
	                this.depthTest = RenderState$1.DEPTHTEST_LESS;
	                break;
	            default:
	                throw new Error("GPUSkinningCartoonMaterial : renderMode value error.");
	        }
	    }
	    get depthWrite() {
	        return this._shaderValues.getBool(GPUSkinningCartoonMaterial.DEPTH_WRITE);
	    }
	    set depthWrite(value) {
	        this._shaderValues.setBool(GPUSkinningCartoonMaterial.DEPTH_WRITE, value);
	    }
	    get cull() {
	        return this._shaderValues.getInt(GPUSkinningCartoonMaterial.CULL);
	    }
	    set cull(value) {
	        this._shaderValues.setInt(GPUSkinningCartoonMaterial.CULL, value);
	    }
	    get blend() {
	        return this._shaderValues.getInt(GPUSkinningCartoonMaterial.BLEND);
	    }
	    set blend(value) {
	        this._shaderValues.setInt(GPUSkinningCartoonMaterial.BLEND, value);
	    }
	    get blendSrc() {
	        return this._shaderValues.getInt(GPUSkinningCartoonMaterial.BLEND_SRC);
	    }
	    set blendSrc(value) {
	        this._shaderValues.setInt(GPUSkinningCartoonMaterial.BLEND_SRC, value);
	    }
	    get blendDst() {
	        return this._shaderValues.getInt(GPUSkinningCartoonMaterial.BLEND_DST);
	    }
	    set blendDst(value) {
	        this._shaderValues.setInt(GPUSkinningCartoonMaterial.BLEND_DST, value);
	    }
	    get depthTest() {
	        return this._shaderValues.getInt(GPUSkinningCartoonMaterial.DEPTH_TEST);
	    }
	    set depthTest(value) {
	        this._shaderValues.setInt(GPUSkinningCartoonMaterial.DEPTH_TEST, value);
	    }
	    get enableLighting() {
	        return this._enableLighting;
	    }
	    set enableLighting(value) {
	        if (this._enableLighting !== value) {
	            if (value) {
	                this._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
	            }
	            else {
	                this._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT);
	            }
	            this._enableLighting = value;
	        }
	    }
	    get CartoonShadowColor() {
	        return this._cartoonShadowColor;
	    }
	    set CartoonShadowColor(value) {
	        this._cartoonShadowColor = value;
	        this._shaderValues.setVector(GPUSkinningCartoonMaterial.CARTOON_SHADOWCOLOR, value);
	    }
	    get CartoonColorRange() {
	        return this._shaderValues.getNumber(GPUSkinningCartoonMaterial.CARTOON_CORLORRANGE);
	    }
	    set CartoonColorRange(value) {
	        value = Math.max(0.0, Math.min(2, value));
	        this._shaderValues.setNumber(GPUSkinningCartoonMaterial.CARTOON_CORLORRANGE, value);
	    }
	    get CartoonColorDeep() {
	        return this._shaderValues.getNumber(GPUSkinningCartoonMaterial.CARTOON_CORLORDEEP);
	    }
	    set CartoonColorDeep(value) {
	        value = Math.max(-1.0, Math.min(100.0, value));
	        this._shaderValues.setNumber(GPUSkinningCartoonMaterial.CARTOON_CORLORDEEP, value);
	    }
	    get CartoonOutlineWidth() {
	        return this._shaderValues.getNumber(GPUSkinningCartoonMaterial.CARTOON_OUTLINEWIDTH);
	    }
	    set CartoonOutlineWidth(value) {
	        this._shaderValues.setNumber(GPUSkinningCartoonMaterial.CARTOON_OUTLINEWIDTH, value);
	    }
	    clone() {
	        var dest = new GPUSkinningCartoonMaterial();
	        this.cloneTo(dest);
	        this._albedoColor.cloneTo(dest._albedoColor);
	        return dest;
	    }
	    cloneTo(destObject) {
	        super.cloneTo(destObject);
	        var destMaterial = destObject;
	        destMaterial._enableLighting = this._enableLighting;
	        destMaterial._albedoIntensity = this._albedoIntensity;
	        destMaterial._enableVertexColor = this._enableVertexColor;
	        this._albedoColor.cloneTo(destMaterial._albedoColor);
	        this._cartoonShadowColor.cloneTo(destMaterial._cartoonShadowColor);
	    }
	}
	GPUSkinningCartoonMaterial.shaderName = "GPUSkinningCartoon";
	GPUSkinningCartoonMaterial._isInstalled = false;
	GPUSkinningCartoonMaterial.RENDERMODE_OPAQUE = 0;
	GPUSkinningCartoonMaterial.RENDERMODE_CUTOUT = 1;
	GPUSkinningCartoonMaterial.RENDERMODE_TRANSPARENT = 2;
	GPUSkinningCartoonMaterial.RENDERMODE_ADDTIVE = 3;
	GPUSkinningCartoonMaterial.CARTOON_SHADOWCOLOR = Shader3D$3.propertyNameToID("u_CartoonShadowColor");
	GPUSkinningCartoonMaterial.CARTOON_CORLORRANGE = Shader3D$3.propertyNameToID("u_CartoonColorRange");
	GPUSkinningCartoonMaterial.CARTOON_CORLORDEEP = Shader3D$3.propertyNameToID("u_CartoonColorDeep");
	GPUSkinningCartoonMaterial.CARTOON_OUTLINEWIDTH = Shader3D$3.propertyNameToID("u_CartoonOutlineWidth");
	GPUSkinningCartoonMaterial.ALBEDOTEXTURE = Shader3D$3.propertyNameToID("u_AlbedoTexture");
	GPUSkinningCartoonMaterial.ALBEDOCOLOR = Shader3D$3.propertyNameToID("u_AlbedoColor");
	GPUSkinningCartoonMaterial.TILINGOFFSET = Shader3D$3.propertyNameToID("u_TilingOffset");
	GPUSkinningCartoonMaterial.CULL = Shader3D$3.propertyNameToID("s_Cull");
	GPUSkinningCartoonMaterial.BLEND = Shader3D$3.propertyNameToID("s_Blend");
	GPUSkinningCartoonMaterial.BLEND_SRC = Shader3D$3.propertyNameToID("s_BlendSrc");
	GPUSkinningCartoonMaterial.BLEND_DST = Shader3D$3.propertyNameToID("s_BlendDst");
	GPUSkinningCartoonMaterial.DEPTH_TEST = Shader3D$3.propertyNameToID("s_DepthTest");
	GPUSkinningCartoonMaterial.DEPTH_WRITE = Shader3D$3.propertyNameToID("s_DepthWrite");

	class LayaUtil {
	    static GetComponentsInChildren(go, componentType, outComponents) {
	        if (!outComponents) {
	            outComponents = [];
	        }
	        for (let i = 0, len = go.numChildren; i < len; i++) {
	            let child = go.getChildAt(i);
	            let component = child.getComponent(componentType);
	            if (component) {
	                outComponents.push(component);
	            }
	            this.GetComponentsInChildren(child, componentType, outComponents);
	        }
	        return outComponents;
	    }
	}

	class LayaExtends_Node {
	    constructor() {
	        Laya.Node.prototype.getComponentsInChildren = this.getComponentsInChildren;
	    }
	    static Init() {
	        if (this.isInited)
	            return;
	        this.isInited = true;
	        new LayaExtends_Node();
	    }
	    getComponentsInChildren(componentType, outComponents) {
	        if (outComponents) {
	            outComponents.length = 0;
	        }
	        else {
	            outComponents = [];
	        }
	        LayaUtil.GetComponentsInChildren(this, componentType, outComponents);
	        return outComponents;
	    }
	}
	LayaExtends_Node.isInited = false;

	var LoaderManager = Laya.LoaderManager;
	var Loader = Laya.Loader;
	var Event = Laya.Event;
	var Shader3D$4 = Laya.Shader3D;
	class GPUSkining {
	    static async InitAsync() {
	        window['GPUSkining'] = GPUSkining;
	        window['GPUSkinningPlayerMonoManager'] = GPUSkinningPlayerMonoManager;
	        window['GPUSkinningPlayerMono'] = GPUSkinningPlayerMono;
	        window['GPUSkinningPlayerResources'] = GPUSkinningPlayerResources;
	        window['GPUSkinningPlayer'] = GPUSkinningPlayer;
	        window['GPUSkinningPlayerJoint'] = GPUSkinningPlayerJoint;
	        window['GPUSkiningMesh'] = GPUSkiningMesh;
	        window['GPUSkiningLoadModelV05'] = GPUSkiningLoadModelV05;
	        window['GPUSkiningVertexMesh'] = GPUSkiningVertexMesh;
	        window['GPUSkinningBaseMaterial'] = GPUSkinningBaseMaterial;
	        window['GPUSkinningUnlitMaterial'] = GPUSkinningUnlitMaterial;
	        window['GPUSkinningAnimation'] = GPUSkinningAnimation;
	        window['GPUSkinningClip'] = GPUSkinningClip;
	        var GPUSkinningIncludegGLSL = await GPUSkinningBaseMaterial.loadShaderGlslAsync("GPUSkinningInclude");
	        Shader3D$4.addInclude("GPUSkinningInclude.glsl", GPUSkinningIncludegGLSL);
	        GPUSkinningBaseMaterial.__initDefine__();
	        await GPUSkinningUnlitMaterial.install();
	        await GPUSkinningCartoonMaterial.install();
	        LayaExtends_Node.Init();
	        Laya3D.SKING_MESH = "SKING_MESH";
	        var createMap = LoaderManager.createMap;
	        createMap["skinlm"] = [Laya3D.SKING_MESH, GPUSkiningMesh._parse];
	        var parserMap = Loader.parserMap;
	        parserMap[Laya3D.SKING_MESH] = this._loadMesh;
	    }
	    static _loadMesh(loader) {
	        loader.on(Event.LOADED, null, this._onMeshLmLoaded, [loader]);
	        loader.load(loader.url, Loader.BUFFER, false, null, true);
	    }
	    static _onMeshLmLoaded(loader, lmData) {
	        loader._cache = loader._createCache;
	        var mesh = GPUSkiningMesh._parse(lmData, loader._propertyParams, loader._constructParams);
	        Laya3D._endLoad(loader, mesh);
	    }
	    static GetAnimName(name) {
	        return `GPUSKinning_${name}_Anim.bin`;
	    }
	    static GetMeshName(name) {
	        return `GPUSKinning_${name}_Mesh.bin`;
	    }
	    static GetMatrixTextureName(name) {
	        return `GPUSKinning_${name}_MatrixTexture.bin`;
	    }
	    static GetMainTextureName(name) {
	        return `GPUSKinning_${name}_MainTexture.png`;
	    }
	    static GetPath(name) {
	        return this.resRoot + name;
	    }
	    static LoadAnimTextureAsync(path, width, height) {
	        return new Promise((resolve) => {
	            Laya.loader.load(path, Laya.Handler.create(this, (arrayBuffer) => {
	                var texture;
	                if (arrayBuffer instanceof ArrayBuffer) {
	                    var f32 = new Float32Array(arrayBuffer);
	                    texture = new Laya.Texture2D(width, height, Laya.TextureFormat.R32G32B32A32, false, true);
	                    texture.wrapModeU = Laya.BaseTexture.WARPMODE_CLAMP;
	                    texture.wrapModeV = Laya.BaseTexture.WARPMODE_CLAMP;
	                    texture.filterMode = Laya.BaseTexture.FILTERMODE_POINT;
	                    texture.anisoLevel = 0;
	                    texture.lock = true;
	                    texture.setSubPixels(0, 0, width, height, f32, 0);
	                    texture._url = Laya.URL.formatURL(path);
	                    Laya.Loader.clearRes(path);
	                    Laya.Loader.cacheRes(path, texture);
	                }
	                else {
	                    texture = arrayBuffer;
	                }
	                resolve(texture);
	            }), null, Laya.Loader.BUFFER);
	        });
	    }
	    static LoadAsync(path, type) {
	        return new Promise((resolve) => {
	            Laya.loader.load(path, Laya.Handler.create(this, (data) => {
	                resolve(data);
	            }), null, type);
	        });
	    }
	    static Load3DAsync(path, type) {
	        return new Promise((resolve) => {
	            Laya.loader.create(path, Laya.Handler.create(this, (data) => {
	                Laya.timer.frameOnce(1, this, () => {
	                    resolve(data);
	                });
	            }), null, type);
	        });
	    }
	    static async CreateByNameAsync(name, isUnloadBin, mainTexturePath, materialCls) {
	        if (!materialCls) {
	            materialCls = GPUSkinningUnlitMaterial;
	        }
	        var animPath = this.GetPath(this.GetAnimName(name));
	        var meshPath = this.GetPath(this.GetMeshName(name));
	        var matrixTexturePath = this.GetPath(this.GetMatrixTextureName(name));
	        if (mainTexturePath == null || mainTexturePath == "") {
	            mainTexturePath = this.GetPath(this.GetMainTextureName(name));
	        }
	        var anim = await GPUSkinningAnimation.LoadAsync(animPath);
	        if (anim == null) {
	            console.error("GPUSkinning资源加载失败", name);
	            return;
	        }
	        var mesh = await GPUSkiningMesh.LoadAsync(meshPath);
	        var mainTexture = await this.Load3DAsync(mainTexturePath, Laya.Loader.TEXTURE2D);
	        var animTexture = await this.LoadAnimTextureAsync(matrixTexturePath, anim.textureWidth, anim.textureHeight);
	        var material = new materialCls();
	        material.albedoTexture = mainTexture;
	        material.GPUSkinning_TextureMatrix = animTexture;
	        var sprite = new Laya.MeshSprite3D();
	        var mono = sprite.addComponent(GPUSkinningPlayerMono);
	        mono.SetData(anim, mesh, material, animTexture);
	        return mono;
	    }
	}
	GPUSkining.EXT_SKING_MESH = "skinlm";
	GPUSkining.resRoot = "res3d/Conventional/";
	window['GPUSkining'] = GPUSkining;

	return GPUSkining;

}());
//# sourceMappingURL=bundle.js.map
