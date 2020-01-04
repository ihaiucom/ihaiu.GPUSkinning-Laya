!function(){"use strict";var e,t;!function(e){e.base64="base64",e.string="string",e.arraybuffer="arraybuffer"}(e||(e={}));class s{constructor(){this.assetId2Name={},this.zipId2Name={},this.zipAssets={},this.assetsDependencie={},this.prefabDependencie={},this.srcRootPath="",this.zipRootPath="",this.zipExt=".zip",this.assetName2Id={},this.assetId2ZipId={},this.assetId2DependencieZipNames={},this.assetName2DependencieZipNames={},this.assetId2DependencieZipPaths={},this.assetName2DependencieZipPaths={},this.assetName2DependencieAssetNames={},this.assetName2DependencieAssetPaths={},this.zipName2DependencieAssetNames={},this.tmpMap=new Map,this.tmpMap2=new Map}SetJson(e){window.assetManifest=this,this.assetId2Name=e.assetId2Name,this.zipId2Name=e.zipId2Name,this.zipAssets=e.zipAssets,this.assetsDependencie=e.assetsDependencie,this.prefabDependencie=e.prefabDependencie;var t=!1;if(this.assetsDependencie)for(let e in this.assetsDependencie){t=!0;break}t||(this.assetsDependencie=this.prefabDependencie);for(let e in this.assetId2Name){let t=this.assetId2Name[e];this.assetName2Id[t]=parseInt(e)}for(let e in this.zipAssets){let t=parseInt(e),s=this.zipAssets[e];for(let e of s)this.assetId2ZipId[e]=t}this.InitAssetDependencieZipPaths(),this.InitDebug()}InitAssetDependencieZipPaths(){for(let e in this.assetsDependencie)this.GetAssetDependencieZipPathList(parseInt(e))}InitDebug(){for(let i in this.assetsDependencie){var e=this.GetAssetName(i),t=this.assetName2DependencieAssetNames[e]=[],s=this.assetName2DependencieAssetPaths[e]=[],a=this.assetsDependencie[i];for(let e of a){let a=this.GetAssetName(e);t.push(a),s.push(this.GetAssetPathByAssetName(a))}}for(let e in this.zipAssets){var i=this.GetZipName(e);t=this.zipName2DependencieAssetNames[i]=[],a=this.zipAssets[e];for(let e of a)t.push(this.GetAssetName(e))}}HasAsset(e){return null!=this.GetAssetId(e)}HasAssetByPath(e){var t=this.GetAssetNameByPath(e);return this.HasAsset(t)}GetAssetId(e){return this.assetName2Id[e]}GetAssetName(e){return this.assetId2Name[e]}GetAssetNameByPath(e){return e.replace(this.srcRootPath,"")}GetAssetPathByAssetName(e){return this.srcRootPath+e}GetAssetZipId(e){return this.assetId2ZipId[e]}GetAssetZipName(e){let t=this.GetAssetZipId(e);return this.GetZipName(t)}GetAssetZipPath(e){let t=this.ToAssetId(e),s=this.GetAssetZipId(t),a=this.GetZipName(s);return a||console.error(`没找到资源的Zip asset=${e} `),this.GetZipPath(a)}GetAssetZipPathByPath(e){let t=this.GetAssetNameByPath(e);return this.GetAssetZipPath(t)}GetZipPath(e){return this.zipRootPath+e+this.zipExt}GetZipName(e){return this.zipId2Name[e]}ToAssetId(e){let t;return t="string"==typeof e?this.GetAssetId(e):e}GetAssetDependencieNameList(e){let t=this.ToAssetId(e),s=this.GetAssetName(t);return this.assetName2DependencieAssetNames[s]}GetAssetDependenciePathList(e){let t=this.ToAssetId(e),s=this.GetAssetName(t);return this.assetName2DependencieAssetPaths[s]}GetAssetDependenciePathListByAssetPath(e){let t=this.GetAssetNameByPath(e);return this.GetAssetDependenciePathList(t)}GetAssetDependencieZipNameList(e){let t=this.ToAssetId(e);if(this.assetId2DependencieZipNames[t])return this.assetId2DependencieZipNames[t];let s=[];if(!t)return console.error(`AssetManifest.GetAssetDependencieZipNameList,  assetId 不存在 assetId=${t},  asset=${e}`),s;let a=this.assetsDependencie[t];if(!a)return console.error(`AssetManifest.GetAssetDependencieZipNameList,  assetIdList 不存在,  asset=${this.GetAssetName(t)}`),s;var i=this.tmpMap;i.clear();for(let e of a){let t=this.GetAssetZipName(e);t&&(i.has(t)||(s.push(t),i.set(t,!0)))}i.clear();var n=this.GetAssetName(t);return this.assetId2DependencieZipNames[t]=s,this.assetName2DependencieZipNames[n]=s,s}GetAssetDependencieZipPathList(e){let t=this.ToAssetId(e);if(this.assetId2DependencieZipPaths[t])return this.assetId2DependencieZipPaths[t];let s=[],a=this.GetAssetDependencieZipNameList(t);for(let e of a){let t=this.GetZipPath(e);s.push(t)}var i=this.GetAssetName(t);return this.assetId2DependencieZipPaths[t]=s,this.assetName2DependencieZipPaths[i]=s,s}GetAssetListDependencieZipPathList(e){let t=[];if(0==e.length)return t;var s=this.tmpMap;s.clear();for(let a of e){let e=this.GetAssetDependencieZipPathList(a);for(let a of e)s.has(a)||(t.push(a),s.set(a,!0))}return s.clear(),t}GetEnumZipAssetDataType(t){let s=Laya.Loader.getTypeFromUrl(t);var a=Laya.Utils.getFileExtension(t);let i;switch(s){case"image":i=e.base64;break;default:switch(a){case"lmat":case"lh":i=e.string;break;default:i=e.arraybuffer}}return i}static get Instance(){return s._Instance||(s._Instance=new s),s._Instance}static async InitAsync(e,t,a,i){return s._Instance=await this.LoadAsync(e,t,a,i),s._Instance}static async LoadAsync(e,t,a,i){return new Promise(n=>{Laya.loader.load(e,Laya.Handler.create(null,e=>{let r=new s;t&&(r.srcRootPath=t),a&&(r.zipRootPath=a),i&&(r.zipExt=i),r.SetJson(e),n(r)}),null,Laya.Loader.JSON)})}}window.AssetManifest=s;class a{static InitCode(){(new a).InitCode()}InitCode(){var e=Laya.Loader;e.prototype.src_loadHttpRequestWhat=e.prototype._loadHttpRequestWhat,e.prototype._loadHttpRequestWhat=this._loadHttpRequestWhat,e.prototype.src_loadResourceFilter=e.prototype._loadResourceFilter,e.prototype._loadResourceFilter=this._loadResourceFilter,e.prototype.src_loadHttpRequest=e.prototype._loadHttpRequest,e.prototype._loadHttpRequest=this._loadHttpRequest,e.prototype.src_loadHtmlImage=e.prototype._loadHtmlImage,e.prototype._loadHtmlImage=this._loadHtmlImage}onProgress(e){}onError(e){}onLoaded(e=null){}_loadResource(e,t){}src_loadHttpRequestWhat(e,t){}_loadHttpRequestWhat(e,t){Laya.Utils.getFileExtension(e)!=o.Instance.zipExtName&&o.Instance.HasManifestAssetByUrl(e)?this._loadHttpRequest(e,t,this,this.onLoaded,this,this.onProgress,this,this.onError):this.src_loadHttpRequestWhat(e,t)}src_loadResourceFilter(e,t){}_loadResourceFilter(e,t){Laya.Utils.getFileExtension(t)!=o.Instance.zipExtName&&o.Instance.HasManifestAssetByUrl(t)?this._loadResource(e,t):this.src_loadResourceFilter(e,t)}src_loadHttpRequest(e,t,s,a,i,n,r,o){}async _loadHttpRequest(e,t,s,i,n,r,l,h){if(Laya.Utils.getFileExtension(e)!=o.Instance.zipExtName){var d;if(d=a.UseAsync?await o.Instance.GetAssetDataAsync(e):o.Instance.GetAssetData(e))return r&&r.call(s,1),void i.call(s,d);this.src_loadHttpRequest(e,t,s,i,n,r,l,h)}else this.src_loadHttpRequest(e,t,s,i,n,r,l,h)}src_loadHtmlImage(e,t,s,a,i){}async _loadHtmlImage(e,t,s,i,n){var r;(r=a.UseAsync?await o.Instance.GetAssetDataAsync(e):o.Instance.GetAssetData(e))?this.src_loadHtmlImage(r,t,s,i,n):this.src_loadHtmlImage(e,t,s,i,n)}}a.UseAsync=!0;class i{static loadPath(e,t,s,a){Laya.loader.load(e,Laya.Handler.create(null,t=>{if(!t)return console.error("没加载到资源:",e),void(a&&a.call(s,null));JSZip.loadAsync(t).then(e=>{a&&a.call(s,e)}).catch(e=>{console.error(e),a&&a.call(s,null)})}),null,t)}static async loadPathAsync(e,t){return new Promise(s=>{Laya.loader.load(e,Laya.Handler.create(null,t=>{if(o.Instance.zipMap.has(e)){let t=o.Instance.zipMap.get(e);s(t)}else JSZip.loadAsync(t).then(e=>{s(e)}).catch(e=>{console.error(e),s()})}),null,t)})}static async readAsync(e,t,s){return new Promise(a=>{e.file(t).async(s).then(e=>{a(e)}).catch(e=>{console.error(e),a()})})}static read(e,t,s,a,i){e.file(t).async(s).then(e=>{i&&i.call(a,e)}).catch(e=>{console.error(e),i&&i.call(a,null)})}}class n{static async MAwitFrame(e=1){return new Promise(t=>{Laya.timer.frameOnce(e,this,()=>{t()})})}static ResolveDelayCall(e,...t){Laya.timer.frameOnce(1,this,()=>{e(...t)})}static async Load3DAsync(e){return new Promise(t=>{Laya.loader.create(e,Laya.Handler.create(null,e=>{n.ResolveDelayCall(t,e)}))})}static Load3D(e,t,s){Laya.loader.create(e,Laya.Handler.create(null,e=>{s&&(t?s.call(t,e):s(e))}))}}window.AsyncUtil=n;class r{constructor(){this._loaderCount=0}static InitCode(){(new r).InitCode()}InitCode(){var e=Laya.LoaderManager;e.prototype.src_load=e.prototype.load,e.prototype.load=this.load,e.prototype.__loadWaitZipAsync=this.__loadWaitZipAsync,e.prototype.src_createLoad=e.prototype._createLoad,e.prototype._createLoad=this._createLoad,e.prototype.___createLoadWaitZipAsync=this.___createLoadWaitZipAsync}src_createLoad(e,t=null,s=null,a=null,i=null,n=null,r=1,o=!0,l=!1){return this}_createLoad(e,t=null,s=null,a=null,i=null,n=null,r=1,l=!0,h=!1){let d,c,p=!1,u=!1;return!o.enable||e instanceof Array||(p=(c=o.Instance).manifest.HasAssetByPath(e))&&(d=c.GetAssetZipPathByAssetUrl(e),u=c.HasZip(d)),!p||u?this.src_createLoad(e,t,s,a,i,n,r,h):(this.___createLoadWaitZipAsync(d,e,t,s,a,i,n,r,h),this)}async ___createLoadWaitZipAsync(e,t,s=null,a=null,i=null,r=null,l=null,h=1,d=!0,c=!1){await o.Instance.GetZipAsync(e);await n.MAwitFrame(),this._loaderCount--;var p=Handler.create(this,e=>{this._loaderCount++,s&&s.runWith(e)});return this.src_createLoad(t,p,a,i,r,l,h,c),this}src_load(e,t=null,s=null,a=null,i=1,n=!0,r=null,o=!1,l=Laya.WorkerLoader.enable){return this}load(e,t=null,s=null,a=null,i=1,n=!0,r=null,l=!1,h=Laya.WorkerLoader.enable){let d,c,p=!1,u=!1;return!o.enable||e instanceof Array||(p=(c=o.Instance).manifest.HasAssetByPath(e))&&(d=c.GetAssetZipPathByAssetUrl(e),u=c.HasZip(d)),!p||u?this.src_load(e,t,s,a,i,n,r,l,h):(this.__loadWaitZipAsync(d,e,t,s,a,i,n,r,l,h),this)}async __loadWaitZipAsync(e,t,s=null,a=null,i=null,r=1,l=!0,h=null,d=!1,c=Laya.WorkerLoader.enable){await o.Instance.GetZipAsync(e);await n.MAwitFrame(),this._loaderCount--;var p=Handler.create(this,e=>{this._loaderCount++,s&&s.runWith(e)});return this.src_load(t,p,a,i,r,l,h,d,c),this}src_doLoad(e){}_doLoad(e){if(o.enable)o.Instance.manifest.HasAssetByPath(e.url);this.src_doLoad(e)}}class o{constructor(){this.zipExt=".zip",this.zipExtName="zip",this.resourceVersionManifestReverse=new Map,this.zipMap=new Map,this.assetMap=new Map,this.loadImageCount=0,this.imageCount=0}static get Instance(){return o._Instance||(o._Instance=new o,window.zipManager=o._Instance),o._Instance}async InitAsync(e,t,a,i,n){!this.manifest||n?(i&&(this.zipExt=i,this.zipExtName=i.replace(".","")),await s.InitAsync(e,t,a,i),this.manifest=s.Instance,o.enable=!0,this.InitCode(),this.InitResourceVersion()):console.log("已经初始了Zip资源清单")}InitCode(){a.InitCode(),r.InitCode()}InitResourceVersion(){this.resourceVersionManifestReverse.clear();let e=Laya.ResourceVersion.manifest;for(let t in e){let s=e[t];this.resourceVersionManifestReverse.set(s,t)}}HasZip(e){return this.zipMap.has(e)}HasAsset(e){let t=this.AssetUrlToPath(e);return this.assetMap.has(t)}GetAssetZipPathByAssetUrl(e){let t=this.AssetUrlToName(e);return this.manifest.GetAssetZipPath(t)}AssetUrlToPath(e){if(window.AssetUrlCache){var t=AssetUrlCache.GetPath(e);if(t)return t}let s=e.replace(Laya.URL.basePath,"");return this.resourceVersionManifestReverse.has(s)?this.resourceVersionManifestReverse.get(s):s}AssetUrlToName(e){let t=this.AssetUrlToPath(e);return this.manifest.GetAssetNameByPath(t)}AssetNameToPath(e){return this.manifest.srcRootPath+e}ResFileNameToAssetPath(e){return this.manifest.srcRootPath+e+".lh"}AssetPathListToAssetNameList(e){let t=[];for(let s of e){let e=this.manifest.GetAssetNameByPath(s);t.push(e)}return t}async GetZipAsync(e){var t;return this.zipMap.has(e)?t=this.zipMap.get(e):(t=await i.loadPathAsync(e,Laya.Loader.BUFFER),this.zipMap.set(e,t)),t}HasManifestAssetByUrl(e){var t=this.AssetUrlToPath(e);return this.manifest.HasAssetByPath(t)}GetAssetData(t){var s,a=this.AssetUrlToPath(t);if(!this.manifest.HasAssetByPath(a))return null;return this.manifest.GetEnumZipAssetDataType(a)==e.base64&&this.loadImageCount++,this.assetMap.has(a)&&(s=this.assetMap.get(a)),s}async GetAssetDataAsync(t){var s,a=this.AssetUrlToPath(t);if(!this.manifest.HasAssetByPath(a))return null;return this.manifest.GetEnumZipAssetDataType(a)==e.base64&&this.loadImageCount++,this.assetMap.has(a)?s=this.assetMap.get(a):(s=await this.LoadAssetData(a),this.assetMap.set(a,s)),s}async LoadAssetData(t){let s=this.manifest.GetAssetNameByPath(t),a=this.manifest.GetAssetZipPath(s),n=this.manifest.GetEnumZipAssetDataType(s),r=await this.GetZipAsync(a);if(!r)return console.log("没有Zip",a,t),null;let o=await i.readAsync(r,s,n);switch(n){case e.string:o=JSON.parse(o);break;case e.base64:o="data:image/png;base64,"+o,this.imageCount++}return o}async LoadAssetZipListAsync(e,t,s){let a=this.AssetPathListToAssetNameList(e);var r=(e,a,i)=>{s&&(t?s.call(t,e,a,Math.ceil(e/a*100),i):s(e,a,Math.ceil(e/a*100),i))};let o=this.manifest.GetAssetListDependencieZipPathList(a);return new Promise(e=>{r(0,o.length,"");var t=0,s=o.length;if(0!=s)for(let a=0,l=o.length;a<l;a++){let l=o[a];this.zipMap.has(l)?(r(++t,s,l),t>=s&&n.ResolveDelayCall(e)):i.loadPath(l,Laya.Loader.BUFFER,this,a=>{this.zipMap.set(l,a),r(++t,s,l),t>=s&&e()})}else n.ResolveDelayCall(e)})}async ReadAllZipAsync(t,s,a){return new Promise(r=>{let o=[];this.zipMap.forEach((e,t)=>{o.push(t)});var l=(e,a,i)=>{s&&(t?s.call(t,e,a,Math.ceil(e/a*100),i):s(e,a,Math.ceil(e/a*100),i))},h=(e,s,i)=>{a&&(t?a.call(t,e,s,Math.ceil(e/s*100),i):a(e,s,Math.ceil(e/s*100),i))};l(0,o.length,"");var d=0,c=0,p=new Map;for(let e=0,t=o.length;e<t;e++){let t=o[e],s=this.zipMap.get(t),a=[];for(let e in s.files){if(!s.files[e].dir){let t=this.AssetNameToPath(e);if(this.assetMap.has(t))continue;a.push(e),d++}}p.set(t,a)}if(console.log("assetNameTotal=",d),0!=d)for(let t=0,s=o.length;t<s;t++){let s=o[t],a=this.zipMap.get(s),u=p.get(s);h(0,u.length,"");for(let t=0,o=u.length;t<o;t++){let p=u[t],m=this.AssetNameToPath(p),y=this.manifest.GetEnumZipAssetDataType(p);i.read(a,p,y,this,a=>{if(c++,a)switch(y){case e.string:a=JSON.parse(a);break;case e.base64:a="data:image/png;base64,"+a,this.imageCount++}this.assetMap.set(m,a),l(c,d,s),h(t,o,p),c>=d&&n.ResolveDelayCall(r)})}}else n.ResolveDelayCall(r)})}}o.enable=!1,window.ZipManager=o;class l{static InitCode(){(new l).InitCode()}InitCode(){var e=Laya.Loader;e.prototype.src_load=e.prototype.load,e.prototype.load=this.load,e.prototype.src_onLoaded=e.prototype.onLoaded,e.prototype.onLoaded=this.onLoaded,e.prototype.src_endLoad=e.prototype.endLoad,e.prototype.endLoad=this.endLoad,e.prototype.src_onError=e.prototype.onError,e.prototype.onError=this.onError}src_onError(e){}onError(e){c.onLoadError(this.url),this.src_onError(e)}src_endLoad(e=null){}endLoad(e=null){c.onLoadEnd(this.url),this.src_endLoad(e)}src_onLoaded(e=null){}onLoaded(e=null){c.onLoaded(this.url,e),this.src_onLoaded(e)}src_load(e,t=null,s=!0,a=null,i=!1,n=Laya.WorkerLoader.enable){}load(e,t=null,s=!0,a=null,i=!1,n=Laya.WorkerLoader.enable){c.onLoadBegin(e),this.src_load(e,t,s,a,i,n)}}class h{static InitCode(){(new h).InitCode()}InitCode(){var e=Laya.LoaderManager;e.prototype.src_createOne=e.prototype._createOne,e.prototype._createOne=this._createOne,e.prototype.src_create=e.prototype._create,e.prototype._create=this._create}src_createOne(e,t,s=null,a=null,i=null,n=null,r=null,o=1,l=!0){}_createOne(e,t,s=null,a=null,i=null,n=null,r=null,o=1,l=!0){c.onCreateOnceBegin(e);var h=Handler.create(this,t=>{s&&(c.onCreateOnceEnd(e,t),s.runWith(t))});this.src_createOne(e,t,h,a,i,n,r,o,l)}src_create(e,t,s=null,a=null,i=null,n=null,r=null,o=1,l=!0){}_create(e,t,s=null,a=null,i=null,n=null,r=null,o=1,l=!0){c.onCreateBegin(e);var h=Handler.create(this,t=>{s&&(c.onCreateEnd(e),s.runWith(t))});this.src_create(e,t,h,a,i,n,r,o,l)}}class d{static InitCode(){(new d).InitCode()}InitCode(){var e=Laya3D;e.src_endLoad=e._endLoad,e._endLoad=this._endLoad}src_endLoad(e,t=null,s=null){}_endLoad(e,t=null,s=null){c.onLaya3DEnd(e.url,t),this.src_endLoad(e,t,s)}}!function(e){e.Begin="Begin",e.LoadedSucess="LoadedSucess",e.LoadedFail="LoadedFail"}(t||(t={}));class c{static Init(){this.enable=!0,l.InitCode(),h.InitCode(),d.InitCode()}static onLaya3DBegin(e){this.laya3dStateMap.set(e,t.Begin);var s=0;this.laya3dBeginNumMap.has(e)&&(s=this.laya3dBeginNumMap.get(e)),this.laya3dBeginNumMap.set(e,s+1)}static onLaya3DEnd(e,s){this.laya3dStateMap.set(e,s?t.LoadedSucess:t.LoadedFail);var a=0;this.laya3dEndNumMap.has(e)&&(a=this.laya3dEndNumMap.get(e)),this.laya3dEndNumMap.set(e,a+1)}static onCreateOnceBegin(e){this.createrOnceStateMap.set(e,t.Begin);var s=0;this.createOnceBeginNumMap.has(e)&&(s=this.createOnceBeginNumMap.get(e)),this.createOnceBeginNumMap.set(e,s+1)}static onCreateOnceEnd(e,s){this.createrOnceResMap.set(e,s),this.createrOnceStateMap.set(e,s?t.LoadedSucess:t.LoadedFail);var a=0;this.createOnceEndNumMap.has(e)&&(a=this.createOnceEndNumMap.get(e)),this.createOnceEndNumMap.set(e,a+1)}static onCreateBegin(e){this.createrStateMap.set(e,t.Begin);var s=0;this.createeBeginNumMap.has(e)&&(s=this.createeBeginNumMap.get(e)),this.createeBeginNumMap.set(e,s+1)}static onCreateEnd(e){this.createrStateMap.set(e,t.LoadedSucess);var s=0;this.createEndNumMap.has(e)&&(s=this.createEndNumMap.get(e)),this.createEndNumMap.set(e,s+1)}static onPrefabBegin(e){if(this.enable){this.prefabStateMap.set(e,t.Begin);var s=0;this.prefabBeginNumMap.has(e)&&(s=this.prefabBeginNumMap.get(e)),this.prefabBeginNumMap.set(e,s+1)}}static onPrefabEnd(e){if(this.enable){this.prefabStateMap.set(e,t.LoadedSucess);var s=0;this.prefabEndNumMap.has(e)&&(s=this.prefabEndNumMap.get(e)),this.prefabEndNumMap.set(e,s+1)}}static onLoadBegin(e){this.stateMap.set(e,t.Begin);var s=0;this.loadBeginNumMap.has(e)&&(s=this.loadBeginNumMap.get(e)),this.loadBeginNumMap.set(e,s+1)}static onLoaded(e,s){"res/res3dzip/Hero_0001_LongQi_Skin1.zip"==e&&console.log(1),s?this.stateMap.set(e,t.LoadedSucess):this.stateMap.set(e,t.LoadedFail);var a=0;this.loadedNumMap.has(e)&&(a=this.loadedNumMap.get(e)),this.loadedNumMap.set(e,a+1)}static onLoadEnd(e){"res/res3dzip/Hero_0001_LongQi_Skin1.zip"==e&&console.log(1);var t=0;this.loadEndNumMap.has(e)&&(t=this.loadEndNumMap.get(e)),this.loadEndNumMap.set(e,t+1)}static onLoadError(e){var t=0;this.loadErrorNumMap.has(e)&&(t=this.loadErrorNumMap.get(e)),this.loadErrorNumMap.set(e,t+1)}static GetInfo(e){return`Loader: ${this.stateMap.get(e)},  beginNum=${this.loadBeginNumMap.get(e)},  loadedNum=${this.loadedNumMap.get(e)},  endNum=${this.loadEndNumMap.get(e)}, ErrorNum=${this.loadErrorNumMap.get(e)},  ${e}`}static GetPrefabInfo(e){return`Prefab: ${this.prefabStateMap.get(e)},  beginNum=${this.prefabBeginNumMap.get(e)},  endNum=${this.prefabEndNumMap.get(e)},  ${e}`}static GetCreateOnceInfo(e){return`CreateOnce: ${this.createrOnceStateMap.get(e)},  beginNum=${this.createOnceBeginNumMap.get(e)},  endNum=${this.createOnceEndNumMap.get(e)},  ${e}`}static GetCreateInfo(e){return`Create: ${this.createrStateMap.get(e)},  beginNum=${this.createeBeginNumMap.get(e)},  endNum=${this.createEndNumMap.get(e)},  ${e}`}static PrintPrefabAssetsInfo(e){if(!o.Instance.manifest)return void console.warn("没有ZipManager.Instance.manifest");console.log("CheckPrefab:",e);let s=o.Instance.AssetUrlToName(e),a=o.Instance.manifest.GetAssetDependenciePathList(s);for(let e of a){let s=this.createrOnceStateMap.get(e),a=this.laya3dStateMap.get(e),i=`${s}, laya3dState=${a},  createOnceBeginNumMap=${this.createOnceBeginNumMap.get(e)},  createOnceEndNumMap=${this.createOnceEndNumMap.get(e)}, ${e}, ${this.createrOnceResMap.get(e)}`;s!=t.LoadedSucess||a!=t.LoadedSucess?console.warn(i):console.log(i)}}static Check(){this.CheckNoLoaded()}static CheckNoLoaded(){console.log("CheckNoLoaded"),this.stateMap.forEach((e,s)=>{e!=t.LoadedSucess&&console.warn(this.GetInfo(s))}),this.loadErrorNumMap.forEach((e,t)=>{console.error(this.GetInfo(t))}),this.prefabStateMap.forEach((e,s)=>{e!=t.LoadedSucess&&console.warn(this.GetPrefabInfo(s))}),this.createrOnceStateMap.forEach((e,s)=>{e!=t.LoadedSucess&&console.warn(this.GetCreateOnceInfo(s))}),this.createrStateMap.forEach((e,s)=>{e!=t.LoadedSucess&&console.warn(this.GetCreateInfo(s))}),console.log("检测预设哪个文件没加载完成"),this.prefabStateMap.forEach((e,s)=>{e!=t.LoadedSucess&&this.PrintPrefabAssetsInfo(s)})}}c.enable=!1,c.stateMap=new Map,c.loadBeginNumMap=new Map,c.loadedNumMap=new Map,c.loadEndNumMap=new Map,c.loadErrorNumMap=new Map,c.prefabStateMap=new Map,c.prefabBeginNumMap=new Map,c.prefabEndNumMap=new Map,c.createrOnceResMap=new Map,c.createrOnceStateMap=new Map,c.createOnceBeginNumMap=new Map,c.createOnceEndNumMap=new Map,c.createrStateMap=new Map,c.createeBeginNumMap=new Map,c.createEndNumMap=new Map,c.laya3dStateMap=new Map,c.laya3dBeginNumMap=new Map,c.laya3dEndNumMap=new Map,window.DebugResources=c;class p{constructor(e,t){this.assetPathList=[],this.maxLoader=2,this.isStop=!1,this.total=0,this.loadIndex=0,this.unzipIndex=0,this.zipPathList=e,this.assetPathList=t,this.loadIndex=0,this.unzipIndex=0,this.total=e.length,this.maxLoader=Laya.loader.maxLoader-1,this.maxLoader=Math.max(this.maxLoader,2)}get IsWait(){return Laya.loader._loaderCount>=this.maxLoader}async StartAsync(){this.isStop=!1,await this.LoadListAsync(),await this.UnzipListAsync()}Stop(){this.isStop=!0}async LoadListAsync(){if(0!=this.total)for(;this.loadIndex<this.total&&!this.isStop&&(this.IsWait&&await n.MAwitFrame(),!this.isStop);){let e=this.zipPathList[this.loadIndex];if(await o.Instance.GetZipAsync(e),this.loadIndex++,this.isStop)break}}async UnzipListAsync(){if(0==this.total||this.isStop)return;this.unzipIndex=0,this.total=this.assetPathList.length;for(;this.unzipIndex<this.total&&!this.isStop;){for(let e=0;e<5&&!(this.unzipIndex>=this.total||this.isStop);e++){let t=this.assetPathList[this.unzipIndex];e<4?o.Instance.GetAssetDataAsync(t):await o.Instance.GetAssetDataAsync(t),this.unzipIndex++}if(this.isStop)break}}}class u{constructor(e){this.maxLoader=5,this.isStop=!1,this.total=0,this.loadIndex=0,this.assetPathList=e,this.loadIndex=0,this.total=e.length,this.maxLoader=Laya.loader.maxLoader-1,this.maxLoader=Math.max(this.maxLoader,2)}get IsWait(){return Laya.loader._loaderCount>=this.maxLoader}async StartAsync(){this.isStop=!1,await this.LoadListAsync()}Stop(){this.isStop=!0}async LoadListAsync(){if(0==this.total)return;for(;this.loadIndex<this.total&&!this.isStop&&(this.IsWait&&await n.MAwitFrame(),!this.isStop);){for(let e=0;e<5&&!(this.loadIndex>=this.total||this.isStop);e++){let t=this.assetPathList[this.loadIndex];e<4?n.Load3D(t):await n.Load3DAsync(t),this.loadIndex++}if(this.isStop)break;if(this.isStop)break}}}class m{static get Instance(){return m._Instance||(m._Instance=new m,window.prefabManager=m._Instance),m._Instance}Init(e){this.srcRootPath=e}ResFileNameToAssetPath(e){return this.srcRootPath+e+".lh"}async LoadPrefabListAsync(e,t,s){return new Promise(a=>{let i=0,r=e.length;if(0!=r)for(let o of e){let e=this.ResFileNameToAssetPath(o);c.onPrefabBegin(e),Laya.loader.create(e,Laya.Handler.create(null,o=>{i++,c.onPrefabEnd(e),s&&(t?s.call(t,i,r,Math.ceil(i/r*100),e,o):s(i,r,Math.ceil(i/r*100),e,o)),i>=r&&n.ResolveDelayCall(a)}))}else n.ResolveDelayCall(a)})}StopPreload(){this.preloadZip&&this.preloadZip.Stop(),this.preloadAsset&&this.preloadAsset.Stop(),this.preloadZip=null,this.preloadAsset=null}async PreloadPrefabList(e){if(this.StopPreload(),!o.enable)return void await this.PreloadPrefabList2(e);if(0==e.length)return;var t=o.Instance.manifest;let s=[],a=[];var i=new Map;for(let n of e){let e=this.ResFileNameToAssetPath(n);if(Laya.Loader.getRes(e))continue;if(!t.HasAssetByPath(e)){console.warn("Zip 文件清单中不存在资源",e);continue}let r=t.GetAssetDependenciePathListByAssetPath(e);for(let e of r){if(i.has(e))continue;Laya.Loader.getRes(e)||(a.push(e),i.set(e,!0))}a.push(e),s.push(e)}let n=o.Instance.AssetPathListToAssetNameList(s),r=t.GetAssetListDependencieZipPathList(n);this.preloadZip=new p(r,a),this.preloadAsset=new u(a),await this.preloadZip.StartAsync(),this.preloadAsset&&await this.preloadAsset.StartAsync()}async PreloadPrefabList2(e){let t=[];for(let s of e){let e=this.ResFileNameToAssetPath(s);t.push(e)}this.preloadAsset=new u(t),this.preloadAsset&&await this.preloadAsset.StartAsync()}}window.PrefabManager=m,window.AssetManifest=s,window.AsyncUtil=n,window.JsZipAsync=i,window.ZipLoader=a,window.ZipManager=o,window.PrefabManager=m,window.DebugResources=c}();