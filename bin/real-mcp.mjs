#!/usr/bin/env node
import {createInterface} from 'node:readline';
import {readFile,writeFile,mkdir,rename,unlink} from 'node:fs/promises';
import {homedir} from 'node:os';
import {join,dirname} from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
const option=name=>{const n=process.argv.indexOf(name);return n>=0?process.argv[n+1]:undefined;};
if(process.argv.includes('--help')){console.log('coclon-mcp --url https://COCLON_HOST [--profession SLUG] [--client NAME]\nConnect once. Reuse the saved connection across sessions and twins. real-mcp remains an alias.');process.exit(0);}
const raw=option('--url')||process.env.REAL_API_BASE_URL;if(!raw){console.error('C.AI URL required: --url https://REAL_HOST');process.exit(1);}
const url=new URL(raw);if(url.username||url.password||url.search||url.hash||url.pathname!=='/'||url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname))){console.error('C.AI requires an HTTPS origin or loopback');process.exit(1);}
const origin=url.origin,configPath=process.env.REAL_CONNECTOR_CONFIG||join(homedir(),'.real','mcp',createHash('sha256').update(origin).digest('hex').slice(0,20)+'.json');
const pendingPath=configPath+'.pending',client=String(option('--client')||'Agent').slice(0,54),preferred=option('--profession')||'';
const {tools,instructions}=JSON.parse(await readFile(new URL('../tools.json',import.meta.url),'utf8'));
async function read(path){try{return JSON.parse(await readFile(path,'utf8'));}catch(e){if(e.code==='ENOENT')return null;throw Error('C.AI private configuration could not be read');}}
async function save(path,value){await mkdir(dirname(path),{recursive:true,mode:0o700});const temp=path+'.'+randomBytes(6).toString('hex')+'.next';await writeFile(temp,JSON.stringify(value),{mode:0o600,flag:'wx'});await rename(temp,path);}
async function http(path,body,token){const response=await fetch(origin+path,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token,Accept:'application/json, text/event-stream','MCP-Protocol-Version':'2025-11-25'}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(token?150000:20000),redirect:'error'});let value;try{value=await response.json();}catch{throw Error('C.AI service response unavailable; keep the saved connection and retry. Do not reinstall or authorize again.');}return {status:response.status,value};}
async function connect(replace=false){
 const config=await read(configPath);if(config?.baseUrl&&config.baseUrl!==origin)throw Error('Private configuration belongs to a different C.AI origin');
 if(config?.token&&!replace){const test=await http('/mcp',{jsonrpc:'2.0',id:'check',method:'tools/call',params:{name:'real_roles',arguments:{}}},config.token);if(test.status===200&&test.value.result&&!test.value.result.isError)return {status:'connected',...(test.value.result.structuredContent||{}),...(preferred?{preferredProfession:preferred}:{}),reused:true,instruction:'Use this saved connection. Do not reinstall, request credentials or open authorization. Match the requested twin against authorized roles; a different preferred twin never expands access.'};if(test.status!==401)throw Error('C.AI connection check failed; keep the saved connection and retry. Do not reinstall or authorize again.');}
 let pending=replace?null:await read(pendingPath);
 if(pending?.deadline>Date.now()){
  if(!pending.nextPollAt||pending.nextPollAt<=Date.now()){
  const {status,value}=await http('/connect/token',{grant_type:'urn:ietf:params:oauth:grant-type:device_code',device_code:pending.device_code});
  if(status>=500||status===429)throw Error('C.AI authorization check temporarily unavailable; keep this pending request and retry later. Do not open another authorization window.');
  if(value.access_token){await save(configPath,{baseUrl:origin,token:value.access_token,maxCost:value.max_cost,clientName:client,expiresAt:Date.now()+value.expires_in*1000});await unlink(pendingPath);return {status:'connected',roles:value.roles,maxCost:value.max_cost,spendLimit:value.spend_limit,preferredProfession:preferred,reused:false,instruction:'Connection saved privately. Reuse it in later sessions and for other authorized twins. Do not start paid work during installation.'};}
  if(value.error!=='authorization_pending')throw Error('C.AI authorization expired or denied; call real_connect with replace=true to request again');
  pending.nextPollAt=Date.now()+Math.max(5,pending.interval||5)*1000;await save(pendingPath,pending);
  }
 }else{
  const {status,value}=await http('/connect/device',{client_name:'MCP · '+client});if(status!==200||!value.device_code)throw Error('C.AI authorization could not start');pending={...value,deadline:Date.now()+value.expires_in*1000};await save(pendingPath,pending);
 }
 return {status:'authorization_required',authorizationUrl:pending.verification_uri_complete+(preferred?'&profession='+encodeURIComponent(preferred):''),userCode:pending.user_code,retryAfterSeconds:Math.max(5,pending.interval||5),instruction:'Show this single authorization link once. Reuse this pending request; do not open multiple windows or ask setup questions. The user selects roles and budgets on that page. After they confirm approval, call real_connect again. Do not request passwords or start work.'};
}
async function rpc(input){
 if(input.jsonrpc!=='2.0'||typeof input.method!=='string')throw Error('Invalid JSON-RPC request');
 if(input.method==='initialize')return {protocolVersion:['2025-11-25','2025-06-18','2025-03-26'].includes(input.params?.protocolVersion)?input.params.protocolVersion:'2025-11-25',capabilities:{tools:{}},serverInfo:{name:'COCLON',version:'1.4.0'},instructions};
 if(input.method==='ping')return {};
 if(input.method==='tools/list')return {tools:tools.map(t=>t.name==='real_connect'?{...t,description:'Connect C.AI. Show the returned browser authorization URL, wait for user approval, then call again. Never request passwords. replace starts a fresh approval.',inputSchema:{type:'object',properties:{replace:{type:'boolean'}},additionalProperties:false}}:t)};
 if(input.method!=='tools/call')throw Error('Method not supported');
 try{
  if(input.params?.name==='real_connect'){const result=await connect(input.params.arguments?.replace===true);return {content:[{type:'text',text:JSON.stringify(result)}],structuredContent:result};}
  const config=await read(configPath);if(!config?.token||config.baseUrl!==origin)throw Error('C.AI authorization required; call real_connect');
  const {status,value}=await http('/mcp',input,config.token);if(status===401)throw Error('C.AI authorization expired or revoked; call real_connect with replace=true');if(status!==200||!value.result)throw Error('C.AI request failed; preserve the request_key before retrying');return value.result;
 }catch(e){return {isError:true,content:[{type:'text',text:e.message.startsWith('C.AI')||e.message.startsWith('Private')?e.message:'C.AI network connection failed. Keep saved credentials; retry with the same request_key. Do not reinstall or authorize again.'}]};}
}
let queue=Promise.resolve();
for await(const line of createInterface({input:process.stdin,crlfDelay:Infinity})){
 if(line.length>2000000){console.error('C.AI request exceeds 2 MB');continue;}
 queue=queue.then(async()=>{let input;try{input=JSON.parse(line);if(input.id===undefined)return;const result=await rpc(input);process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:input.id,result})+'\n');}catch{process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:input?.id??null,error:{code:-32600,message:'Invalid or unsupported C.AI MCP request'}})+'\n');}});
}
await queue;
