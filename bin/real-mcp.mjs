#!/usr/bin/env node
import {createInterface} from 'node:readline';
import {readFile,writeFile,mkdir,rename,unlink} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join,dirname} from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
const option=name=>{const n=process.argv.indexOf(name);return n>=0?process.argv[n+1]:undefined;};
if(process.argv.includes('--help')){console.log('coclon-mcp --url https://COCLON_HOST [--profession SLUG] [--trial-code CODE]\nPublic twins: ten shared trial tasks, no browser sign-in. Existing paid grants remain scoped. real-mcp is an alias.');process.exit(0);}
const raw=option('--url')||process.env.REAL_API_BASE_URL;if(!raw){console.error('C.AI URL required');process.exit(1);}
const url=new URL(raw);if(url.username||url.password||url.search||url.hash||url.pathname!=='/'||url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname))){console.error('C.AI requires an HTTPS origin or loopback');process.exit(1);}
const origin=url.origin,configPath=process.env.REAL_CONNECTOR_CONFIG||join(homedir(),'.real','mcp',createHash('sha256').update(origin).digest('hex').slice(0,20)+'.json');
const pendingPath=configPath+'.pending',trialPath=configPath+'.trial-init',client=String(option('--client')||'Agent').slice(0,54),preferred=option('--profession')||'',initialCode=option('--trial-code')||'';
const {tools,instructions}=JSON.parse(await readFile(new URL('../tools.json',import.meta.url),'utf8'));
async function read(path){try{return JSON.parse(await readFile(path,'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw Error('C.AI private configuration could not be read');}}
async function save(path,value){await mkdir(dirname(path),{recursive:true,mode:0o700});const temp=path+'.'+randomBytes(6).toString('hex')+'.next';await writeFile(temp,JSON.stringify(value),{mode:0o600,flag:'wx'});await rename(temp,path);}
const credentials=value=>{if(!value)return null;const {accountConnection,trialConnection,requestedMode,...rest}=value;return rest;};
async function http(path,body,token){
 const response=await fetch(origin+path,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token,Accept:'application/json, text/event-stream','MCP-Protocol-Version':'2025-11-25'}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(token?150000:20000),redirect:'error'});
 let value;try{value=await response.json();}catch{throw Error('C.AI service response unavailable; keep saved credentials and retry. Do not reinstall or authorize again.');}return {status:response.status,value};
}
async function establishTrial(config,code){
 const previous=config?.mode==='trial'?config:config?.trialConnection;
 let init=await read(trialPath);if(!init){init={clientToken:previous?.trialClientToken||randomBytes(32).toString('base64url')};await save(trialPath,init);}
 const {status,value}=await http('/trial/connect',{client_token:init.clientToken,create:true,...(code?{code}:{})});
 if(status!==200||!value.access_token)throw Error(status===402?'C.AI ten trial tasks are used up. Stop; ask whether to connect a paid account. Never fall back to paid credentials automatically.':status===429?'C.AI trial limit reached. Keep this trial identity and retry later; do not reset credentials.':'C.AI trial connection unavailable. Keep the current connection; do not silently use a paid grant.');
 const account=credentials(config?.mode==='trial'?config.accountConnection:config);
 await save(configPath,{baseUrl:origin,token:value.access_token,maxCost:5,mode:'trial',trialClientToken:init.clientToken,expiresAt:Date.now()+value.expires_in*1000,...(account?.token?{accountConnection:account}:{})});
 await unlink(trialPath);return connect({});
}
async function connect({replace=false,trial=false,account=false,code=initialCode}={}){
 let config=await read(configPath);if(config?.baseUrl&&config.baseUrl!==origin)throw Error('C.AI private configuration belongs to a different origin');
 if(account&&config)delete config.requestedMode;
 if(config?.requestedMode==='trial'&&!account)trial=true;
 const trialBackup=config?.mode==='trial'?credentials(config):config?.trialConnection;
 if(account&&config?.mode==='trial'){
  config=config.accountConnection?{...config.accountConnection,trialConnection:trialBackup}:null;
  // Retain the trial identity if account approval is still pending.
 }
 if(trial&&config?.mode!=='trial'){if(config?.token)await save(configPath,{...config,requestedMode:'trial'});return establishTrial(config,code);}
 if(config?.token&&!replace){
  const test=await http('/mcp',{jsonrpc:'2.0',id:'check',method:'tools/call',params:{name:'real_roles',arguments:{}}},config.token);
  if(test.status===200&&test.value.result&&!test.value.result.isError){if(account)await save(configPath,config);return {status:'connected',...(test.value.result.structuredContent||{}),...(preferred?{preferredProfession:preferred}:{}),reused:true,instruction:config.mode==='trial'?'Trial connection reused. A successful task uses one shared trial. If remaining is zero, stop. Never switch to paid work without explicit user permission.':'Use this saved scoped connection. Do not reinstall or open authorization. A different twin hint does not expand access.'};}
  if(test.status!==401)throw Error('C.AI connection check failed; keep saved credentials and retry. Do not reinstall or authorize again.');
  if(config.mode==='trial')return establishTrial(config,'');
 }
 let pending=replace?null:await read(pendingPath);
 if(!config?.token&&!pending&&!account&&!replace)return establishTrial(config,code);
 if(pending?.deadline>Date.now()){
  if(!pending.nextPollAt||pending.nextPollAt<=Date.now()){
   const {status,value}=await http('/connect/token',{grant_type:'urn:ietf:params:oauth:grant-type:device_code',device_code:pending.device_code});
   if(status>=500||status===429)throw Error('C.AI authorization check temporarily unavailable; reuse this pending request.');
   if(value.access_token){await save(configPath,{baseUrl:origin,token:value.access_token,maxCost:value.max_cost,clientName:client,mode:'account',expiresAt:Date.now()+value.expires_in*1000,...(trialBackup?{trialConnection:trialBackup}:{})});await unlink(pendingPath);return {status:'connected',roles:value.roles,maxCost:value.max_cost,spendLimit:value.spend_limit,preferredProfession:preferred,reused:false,instruction:'Account connection saved privately. Reuse it. Do not start paid work during installation.'};}
   if(value.error!=='authorization_pending')throw Error('C.AI authorization expired or denied; request a fresh approval only when the user asks.');
   pending.nextPollAt=Date.now()+Math.max(5,pending.interval||5)*1000;await save(pendingPath,pending);
  }
 }else{
  const {status,value}=await http('/connect/device',{client_name:'MCP · '+client});if(status!==200||!value.device_code)throw Error('C.AI authorization could not start');pending={...value,deadline:Date.now()+value.expires_in*1000};await save(pendingPath,pending);
 }
 return {status:'authorization_required',authorizationUrl:pending.verification_uri_complete+(preferred?'&profession='+encodeURIComponent(preferred):''),userCode:pending.user_code,retryAfterSeconds:Math.max(5,pending.interval||5),instruction:'Show this single account authorization link once. Public trial does not need it. Do not open multiple windows or ask setup questions. Wait for approval, then call real_connect with account=true. Do not start paid work.'};
}
async function rpc(input){
 if(input.jsonrpc!=='2.0'||typeof input.method!=='string')throw Error('Invalid JSON-RPC request');
 if(input.method==='initialize')return {protocolVersion:['2025-11-25','2025-06-18','2025-03-26'].includes(input.params?.protocolVersion)?input.params.protocolVersion:'2025-11-25',capabilities:{tools:{}},serverInfo:{name:'COCLON',version:'1.5.0'},instructions};
 if(input.method==='ping')return {};
 if(input.method==='tools/list')return {tools:tools.map(t=>t.name==='real_connect'?{...t,description:'Reuse COCLON. New clients get ten public trial tasks without browser sign-in. trial=true explicitly selects trial and preserves an existing paid grant. account=true selects a paid/private/editing account; requires user approval only if no valid grant is saved. Do not switch a trial to paid automatically.',inputSchema:{type:'object',properties:{replace:{type:'boolean'},trial:{type:'boolean'},account:{type:'boolean'},code:{type:'string',pattern:'^[A-Za-z0-9_-]{43}$'}},additionalProperties:false}}:t)};
 if(input.method!=='tools/call')throw Error('Method not supported');
 try{
  if(input.params?.name==='real_connect'){
   const a=input.params.arguments||{};if(['replace','trial','account'].some(k=>a[k]!==undefined&&typeof a[k]!=='boolean')||a.trial&&a.account||a.code!==undefined&&!/^[A-Za-z0-9_-]{43}$/.test(a.code))throw Error('C.AI connection arguments invalid');
   const result=await connect(a);return {content:[{type:'text',text:JSON.stringify(result)}],structuredContent:result};
  }
  const config=await read(configPath);if(!config?.token||config.baseUrl!==origin)throw Error('C.AI connection required; call real_connect');
  if(config.requestedMode==='trial'&&config.mode!=='trial')throw Error('C.AI trial setup is incomplete. Paid fallback is blocked; retry trial or explicitly select account mode.');
  const {status,value}=await http('/mcp',input,config.token);if(status===401)throw Error('C.AI connection expired or revoked; call real_connect. Preserve the saved trial identity.');if(status!==200||!value.result)throw Error('C.AI request failed; preserve the request_key before retrying');return value.result;
 }catch(e){return {isError:true,content:[{type:'text',text:e.message.startsWith('C.AI')?e.message:'C.AI network connection failed. Keep saved credentials; retry with the same request_key. Do not reinstall or authorize again.'}]};}
}
let queue=Promise.resolve();
for await(const line of createInterface({input:process.stdin,crlfDelay:Infinity})){
 if(line.length>2000000){console.error('C.AI request exceeds 2 MB');continue;}
 queue=queue.then(async()=>{let input;try{input=JSON.parse(line);if(input.id===undefined)return;const result=await rpc(input);process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:input.id,result})+'\n');}catch{process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:input?.id??null,error:{code:-32600,message:'Invalid or unsupported C.AI MCP request'}})+'\n');}});
}
await queue;
