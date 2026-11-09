import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {homedir} from 'node:os';
import {createHash,randomUUID} from 'node:crypto';
import {connectionConfig} from './connection.mjs';

const read=async path=>{try{return JSON.parse(await readFile(path,'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw Error('本地连接资料无法读取');}};
export class ControlPanel {
 constructor(config,{call,fetcher=fetch,ambient=process.env}={}){
  const connection=connectionConfig(config,{ambient});this.origin=connection.args[2];this.call=call;this.fetcher=fetcher;
  this.file=connection.env.REAL_CONNECTOR_CONFIG||join(homedir(),'.real','mcp',createHash('sha256').update(this.origin).digest('hex').slice(0,20)+'.json');
  this.selectionFile=this.file+'.selection';this.selectedId=config.preferredProfession||'';this.busy=null;
 }
 async load(){const saved=await read(this.selectionFile);if(saved?.origin===this.origin&&typeof saved.professionId==='string')this.selectedId=saved.professionId;}
 async json(path,token){
  const response=await this.fetcher(this.origin+path,{headers:token?{Authorization:'Bearer '+token}:{},redirect:'error',signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Object.assign(Error(response.status===401?'连接已过期 · 重新登录':response.status===403?'当前连接无此权限':'暂时无法连接 COCLON · 请重试'),{status:response.status});return response.json();
 }
 async status(){
  const config=await read(this.file);let account=null,roles=[],problem='';
  if(config?.token&&config.baseUrl===this.origin){try{account=await this.json('/v1/account',config.token);roles=(await this.json('/v1/professions',config.token)).professions||[];}catch(e){problem=e.message;}}
  const pending=await read(this.file+'.pending'),url=pending?.deadline>Date.now()?this.authorizationUrl(pending.verification_uri_complete):'';
  return {origin:this.origin,connected:Boolean(account),account,roles:roles.map(role=>this.role(role)),selectedId:this.selectedId,pendingUrl:url,problem};
 }
 role(r){return {id:r.id||r.slug||'',slug:r.slug||'',name:r.name||r.ownerName||'',title:r.serviceTitle||r.title||r.role||'赛博分身',price:r.price??0,personaSlug:r.personaSlug||'',summary:(r.serviceOutcome||r.intro||'').slice(0,240),skills:(r.skillNames||[]).filter(x=>typeof x==='string').slice(0,4).map(x=>x.slice(0,60))};}
 authorizationUrl(value){try{const u=new URL(value);return u.origin===this.origin&&u.pathname==='/connect'?u.href:'';}catch{return '';}}
 async connect(mode){
  if(!['account','trial'].includes(mode))throw Error('连接方式无效');if(this.busy)return this.busy;
  this.busy=(async()=>{const result=await this.call('real_connect',mode==='account'?{account:true}:{trial:true});
   if(result.status==='authorization_required')return {status:'authorization_required',url:this.authorizationUrl(result.authorizationUrl),retryAfterSeconds:Math.max(5,result.retryAfterSeconds||5)};
   if(result.status!=='connected')throw Error('连接尚未完成');return {status:'connected',state:await this.status()};
  })();try{return await this.busy;}finally{this.busy=null;}
 }
 async browse(query=''){
  if(typeof query!=='string'||query.length>100)throw Error('搜索内容过长');const result=await this.json('/api/creators?q='+encodeURIComponent(query));
  return {people:(result.creators||[]).map(person=>({slug:person.slug,name:person.name||'',headline:(person.role||person.publicExpert?.headline||'').slice(0,100),intro:(person.intro||'').slice(0,700),experience:(person.experienceSummaries||[]).filter(x=>typeof x==='string').slice(0,2).map(x=>x.slice(0,160)),portraitUrl:this.image(person.portraitUrl),roles:(person.professions||[]).map(r=>this.role({...r,personaSlug:person.slug,name:person.name}))}))};
 }
 image(value){try{const u=new URL(value,this.origin);return u.origin===this.origin&&(u.pathname.startsWith('/api/site/assets/')||u.pathname.startsWith('/assets/'))?u.href:'';}catch{return '';}}
 async select(id){
  if(typeof id!=='string'||!/^[A-Za-z0-9_-]{1,100}$/.test(id))throw Error('分身编号无效');const state=await this.status(),role=state.roles.find(r=>r.id===id||r.slug===id);if(!role)throw Error('请先连接，并授权此分身');
  const value={origin:this.origin,professionId:role.id};await mkdir(dirname(this.selectionFile),{recursive:true,mode:0o700});const temp=this.selectionFile+'.'+randomUUID();await writeFile(temp,JSON.stringify(value),{mode:0o600});await rename(temp,this.selectionFile);this.selectedId=role.id;return {...state,selectedId:role.id};
 }
 async action(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('操作无效');
  if(input.kind==='status')return this.status();if(input.kind==='browse')return this.browse(input.query||'');if(input.kind==='connect')return this.connect(input.mode);if(input.kind==='select')return this.select(input.id);throw Error('操作无效');
 }
}
