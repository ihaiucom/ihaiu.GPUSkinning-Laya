// import { IndexBuffer3D } from "../graphics/IndexBuffer3D"
// import { VertexMesh } from "../graphics/Vertex/VertexMesh"
// import { VertexBuffer3D } from "../graphics/VertexBuffer3D"
// import { VertexDeclaration } from "../graphics/VertexDeclaration"
// import { HalfFloatUtils } from "../math/HalfFloatUtils"
// import { Matrix4x4 } from "../math/Matrix4x4"
// import { Mesh } from "../resource/models/Mesh"
// import { SubMesh } from "../resource/models/SubMesh"
// import { Byte } from "../../utils/Byte"
// import { LayaGL } from "../../layagl/LayaGL";
// import { IndexFormat } from "../graphics/IndexFormat"

import IndexBuffer3D = Laya.IndexBuffer3D;
import VertexBuffer3D = Laya.VertexBuffer3D;
import VertexDeclaration = Laya.VertexDeclaration;
import HalfFloatUtils = Laya.HalfFloatUtils;
import Matrix4x4 = Laya.Matrix4x4;
import Mesh = Laya.Mesh;
import SubMesh = Laya.SubMesh;
import Byte = Laya.Byte;
import IndexFormat = Laya.IndexFormat;
import LayaGL = Laya.LayaGL;
import GPUSkiningVertexMesh from "./GPUSkiningVertexMesh";


/**
 * @internal
 * <code>LoadModelV05</code> 类用于模型加载。
 */
export class GPUSkiningLoadModelV05 {

	/**@internal */
	private static _BLOCK: any = { count: 0 };
	/**@internal */
	private static _DATA: any = { offset: 0, size: 0 };

	/**@internal */
	private static _strings: any[] = [];
	/**@internal */
	private static _readData: Byte;
	/**@internal */
	private static _version: string;
	/**@internal */
	private static _mesh: Mesh;
	/**@internal */
	private static _subMeshes: SubMesh[];
	/**@internal */
	 static _bindPoseIndices: number[] = [];

	/**
	 * @internal
	 */
	static parse(readData: Byte, version: string, mesh: Mesh, subMeshes: SubMesh[]): void {
		GPUSkiningLoadModelV05._mesh = mesh;
		GPUSkiningLoadModelV05._subMeshes = subMeshes;
		GPUSkiningLoadModelV05._version = version;
		GPUSkiningLoadModelV05._readData = readData;


		GPUSkiningLoadModelV05.READ_DATA();
		GPUSkiningLoadModelV05.READ_BLOCK();
		GPUSkiningLoadModelV05.READ_STRINGS();
		for (var i: number = 0, n: number = GPUSkiningLoadModelV05._BLOCK.count; i < n; i++) {
			GPUSkiningLoadModelV05._readData.pos = GPUSkiningLoadModelV05._BLOCK.blockStarts[i];
			var index: number = GPUSkiningLoadModelV05._readData.getUint16();
			var blockName: string = GPUSkiningLoadModelV05._strings[index];
			var fn: Function = GPUSkiningLoadModelV05["READ_" + blockName];
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

	/**
	 * @internal
	 */
	private static _readString(): string {
		return GPUSkiningLoadModelV05._strings[GPUSkiningLoadModelV05._readData.getUint16()];
	}

	/**
	 * @internal
	 */
	private static READ_DATA(): void {
		GPUSkiningLoadModelV05._DATA.offset = GPUSkiningLoadModelV05._readData.getUint32();
		GPUSkiningLoadModelV05._DATA.size = GPUSkiningLoadModelV05._readData.getUint32();
	}

	/**
	 * @internal
	 */
	private static READ_BLOCK(): void {
		var count: number = GPUSkiningLoadModelV05._BLOCK.count = GPUSkiningLoadModelV05._readData.getUint16();
		var blockStarts: any[] = GPUSkiningLoadModelV05._BLOCK.blockStarts = [];
		var blockLengths: any[] = GPUSkiningLoadModelV05._BLOCK.blockLengths = [];
		for (var i: number = 0; i < count; i++) {
			blockStarts.push(GPUSkiningLoadModelV05._readData.getUint32());
			blockLengths.push(GPUSkiningLoadModelV05._readData.getUint32());
		}
	}

	/**
	 * @internal
	 */
	private static READ_STRINGS(): void {
		var offset: number = GPUSkiningLoadModelV05._readData.getUint32();
		var count: number = GPUSkiningLoadModelV05._readData.getUint16();
		var prePos: number = GPUSkiningLoadModelV05._readData.pos;
		GPUSkiningLoadModelV05._readData.pos = offset + GPUSkiningLoadModelV05._DATA.offset;

		for (var i: number = 0; i < count; i++)
			GPUSkiningLoadModelV05._strings[i] = GPUSkiningLoadModelV05._readData.readUTFString();

		GPUSkiningLoadModelV05._readData.pos = prePos;
	}

	/**
	 * @internal
	 */
	private static READ_MESH(): boolean {
		var gl: WebGLRenderingContext = LayaGL.instance;
		var i: number, n: number;
		var memorySize: number = 0;
		var name: string = GPUSkiningLoadModelV05._readString();
		var reader: Byte = GPUSkiningLoadModelV05._readData;
		var arrayBuffer: ArrayBuffer = reader.__getBuffer();
		var vertexBufferCount: number = reader.getInt16();
		var offset: number = GPUSkiningLoadModelV05._DATA.offset;
		for (i = 0; i < vertexBufferCount; i++) {//TODO:始终为1
			var vbStart: number = offset + reader.getUint32();
			var vertexCount: number = reader.getUint32();
			var vertexFlag: string = GPUSkiningLoadModelV05._readString();
			var vertexDeclaration: VertexDeclaration = GPUSkiningVertexMesh.getVertexDeclaration(vertexFlag, false);

			var vertexStride: number = vertexDeclaration.vertexStride;
			var vertexData: ArrayBuffer;
			var floatData: Float32Array;
			var uint8Data: Uint8Array;

			var subVertexFlags: any[] = vertexFlag.split(",");
			var subVertexCount: number = subVertexFlags.length;
			var mesh: Mesh = GPUSkiningLoadModelV05._mesh;

			switch (GPUSkiningLoadModelV05._version) {
				case "LAYAMODEL:05":
				case "LAYAMODEL:GPUSkining_05": 
				case "LAYAMODEL:GPUSkining_06": 
					vertexData = arrayBuffer.slice(vbStart, vbStart + vertexCount * vertexStride);
					floatData = new Float32Array(vertexData);
					uint8Data = new Uint8Array(vertexData);
					break;
				case "LAYAMODEL:COMPRESSION_05":
					vertexData = new ArrayBuffer(vertexStride * vertexCount);
					floatData = new Float32Array(vertexData);
					uint8Data = new Uint8Array(vertexData);
					var lastPosition: number = reader.pos;
					reader.pos = vbStart;

					for (var j: number = 0; j < vertexCount; j++) {
						var subOffset: number;
						var verOffset: number = j * vertexStride;
						for (var k: number = 0; k < subVertexCount; k++) {
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

			var vertexBuffer: VertexBuffer3D = new VertexBuffer3D(vertexData.byteLength, gl.STATIC_DRAW, true);
			vertexBuffer.vertexDeclaration = vertexDeclaration;
			vertexBuffer.setData(vertexData);
			var vertexCount: number = vertexBuffer._byteLength / vertexDeclaration.vertexStride;
			//TDDO:是否加标记
			if (vertexCount > 65535)
				mesh._indexFormat = IndexFormat.UInt32;
			else
				mesh._indexFormat = IndexFormat.UInt16;
			mesh._vertexBuffer = vertexBuffer;
			mesh._vertexCount += vertexCount;
			memorySize += floatData.length * 4;
		}

		var ibStart: number = offset + reader.getUint32();
		var ibLength: number = reader.getUint32();

		var ibDatas: Uint16Array | Uint32Array;
		if (mesh.indexFormat == <any>IndexFormat.UInt32)
			ibDatas = new Uint32Array(arrayBuffer.slice(ibStart, ibStart + ibLength));
		else
			ibDatas = new Uint16Array(arrayBuffer.slice(ibStart, ibStart + ibLength));

		var indexBuffer: IndexBuffer3D = new IndexBuffer3D(mesh.indexFormat, ibDatas.length, gl.STATIC_DRAW, true);
		indexBuffer.setData(ibDatas);
		mesh._indexBuffer = indexBuffer;

		mesh._setBuffer(mesh._vertexBuffer, indexBuffer);

		memorySize += indexBuffer.indexCount * 2;
		mesh._setCPUMemory(memorySize);
		mesh._setGPUMemory(memorySize);

		var boneNames: string[] = mesh._boneNames = [];
		var boneCount: number = reader.getUint16();
		boneNames.length = boneCount;
		for (i = 0; i < boneCount; i++)
			boneNames[i] = GPUSkiningLoadModelV05._strings[reader.getUint16()];//[兼容性]

		var bindPoseDataStart: number = reader.getUint32();
		var bindPoseDataLength: number = reader.getUint32();
		var bindPoseDatas: Float32Array = new Float32Array(arrayBuffer.slice(offset + bindPoseDataStart, offset + bindPoseDataStart + bindPoseDataLength));
		var bindPoseFloatCount: number = bindPoseDatas.length;
		var bindPoseCount: number = bindPoseFloatCount / 16;
		var bindPoseBuffer: ArrayBuffer = mesh._inverseBindPosesBuffer = new ArrayBuffer(bindPoseFloatCount * 4);//TODO:[NATIVE]临时
		mesh._inverseBindPoses = [];
		for (i = 0; i < bindPoseFloatCount; i += 16) {
			var inverseGlobalBindPose: Matrix4x4 = new Matrix4x4(bindPoseDatas[i + 0], bindPoseDatas[i + 1], bindPoseDatas[i + 2], bindPoseDatas[i + 3], bindPoseDatas[i + 4], bindPoseDatas[i + 5], bindPoseDatas[i + 6], bindPoseDatas[i + 7], bindPoseDatas[i + 8], bindPoseDatas[i + 9], bindPoseDatas[i + 10], bindPoseDatas[i + 11], bindPoseDatas[i + 12], bindPoseDatas[i + 13], bindPoseDatas[i + 14], bindPoseDatas[i + 15], new Float32Array(bindPoseBuffer, i * 4, 16));
			mesh._inverseBindPoses[i / 16] = inverseGlobalBindPose;
		}
		return true;
	}

	/**
	 * @internal
	 */
	private static READ_SUBMESH(): boolean {
		var reader: Byte = GPUSkiningLoadModelV05._readData;
		var arrayBuffer: ArrayBuffer = reader.__getBuffer();
		var subMesh: SubMesh = new SubMesh(GPUSkiningLoadModelV05._mesh);

		reader.getInt16();//TODO:vbIndex
		var ibStart: number = reader.getUint32();
		var ibCount: number = reader.getUint32();
		var indexBuffer: IndexBuffer3D = GPUSkiningLoadModelV05._mesh._indexBuffer;
		subMesh._indexBuffer = indexBuffer;
		subMesh._setIndexRange(ibStart, ibCount);
		var vertexBuffer: VertexBuffer3D = GPUSkiningLoadModelV05._mesh._vertexBuffer;
		subMesh._vertexBuffer = vertexBuffer;

		var offset: number = GPUSkiningLoadModelV05._DATA.offset;
		var subIndexBufferStart: number[] = subMesh._subIndexBufferStart;
		var subIndexBufferCount: number[] = subMesh._subIndexBufferCount;
		var boneIndicesList: Uint16Array[] = subMesh._boneIndicesList;
		var drawCount: number = reader.getUint16();
		subIndexBufferStart.length = drawCount;
		subIndexBufferCount.length = drawCount;
		boneIndicesList.length = drawCount;

		var pathMarks: any[][] = GPUSkiningLoadModelV05._mesh._skinDataPathMarks;
		var bindPoseIndices: number[] = GPUSkiningLoadModelV05._bindPoseIndices;
		var subMeshIndex: number = GPUSkiningLoadModelV05._subMeshes.length;
		for (var i: number = 0; i < drawCount; i++) {
			subIndexBufferStart[i] = reader.getUint32();
			subIndexBufferCount[i] = reader.getUint32();
			var boneDicofs: number = reader.getUint32();
			var boneDicCount: number = reader.getUint32();
			var boneIndices: Uint16Array = boneIndicesList[i] = new Uint16Array(arrayBuffer.slice(offset + boneDicofs, offset + boneDicofs + boneDicCount));
			for (var j: number = 0, m: number = boneIndices.length; j < m; j++) {
				var index: number = boneIndices[j];
				var combineIndex: number = bindPoseIndices.indexOf(index);
				if (combineIndex === -1) {
					boneIndices[j] = bindPoseIndices.length;
					bindPoseIndices.push(index);
					pathMarks.push([subMeshIndex, i, j]);
				} else {
					boneIndices[j] = combineIndex;
				}
			}
		}
		GPUSkiningLoadModelV05._subMeshes.push(subMesh);
		return true;
	}

}


