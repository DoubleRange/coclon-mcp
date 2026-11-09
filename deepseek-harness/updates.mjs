import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';

const runningVersion=JSON.parse(await readFile(new URL('./package.json',import.meta.url),'utf8')).version;
const versionPattern=/^(0|[1-9]\d{0,5})\.(0|[1-9]\d{0,5})\.(0|[1-9]\d{0,5})$/;
const newer=(a,b)=>{const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<3;i++){if(x[i]!==y[i])return x[i]>y[i];}return false;};
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
export class PluginUpdates {
 constructor(origin,{cacheDir,fetcher=fetch,version=runningVersion}){this.origin=origin;this.cacheDir=cacheDir;this.fetcher=fetcher;this.version=version;}
 async check(){
  const response=await this.fetcher(this.origin+'/deepseek-harness.json',{redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('暂时无法检查更新 · 请重试');
  const manifest=await response.json(),version=manifest.version;
  if(manifest.name!=='dsh-plugin-coclon'||!versionPattern.test(version||'')||!/^[a-f0-9]{64}$/.test(manifest.sha256||''))throw Error('更新信息无效 · 当前版本不变');
  const url=this.origin+'/downloads/dsh-plugin-coclon-'+version+'.tgz';
  if(manifest.archiveUrl!==url)throw Error('更新来源不匹配 · 当前版本不变');
  return {origin:this.origin,current:this.version,latest:version,available:newer(version,this.version),sha256:manifest.sha256};
 }
 async prepare(expected){
  const update=await this.check();
  if(!update.available)throw Error('当前已是最新版');
  if(expected.version!==update.latest||expected.sha256!==update.sha256)throw Error('版本信息已变化 · 请重新检查更新');
  const file=join(this.cacheDir,'dsh-plugin-coclon-'+update.latest+'-'+update.sha256+'.tgz');
  try{if(digest(await readFile(file))===update.sha256)return {version:update.latest,source:file};}catch(e){if(e.code!=='ENOENT')throw e;}
  const response=await this.fetcher(this.origin+'/downloads/dsh-plugin-coclon-'+update.latest+'.tgz',{redirect:'error',signal:AbortSignal.timeout(60000)});
  if(!response.ok||!response.body)throw Error('安装包下载失败 · 当前版本不变');
  const reader=response.body.getReader(),parts=[];let length=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>2097152)throw Error('安装包过大 · 当前版本不变');parts.push(value);}}finally{await reader.cancel();}
  const bytes=Buffer.concat(parts);
  if(digest(bytes)!==update.sha256)throw Error('安装包校验失败 · 当前版本不变');
  await mkdir(this.cacheDir,{recursive:true,mode:0o700});const temp=file+'.'+randomUUID();await writeFile(temp,bytes,{mode:0o600});await rename(temp,file);
  return {version:update.latest,source:file};
 }
}
