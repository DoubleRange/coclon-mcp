import {Remote,TypertRemoteService,principalOf} from '@deepseek-ai/dsh-typert-protocol';
import {randomUUID} from 'node:crypto';
import {ControlPanel} from './control.mjs';

const initializers=[];
export class CoclonControl extends TypertRemoteService {
 static inject=['tools'];
 constructor(ctx,config){
  super(ctx,'coclonControl');for(const init of initializers)init.call(this);
  this.control=new ControlPanel(config,{call:async(name,args)=>{
   const batch=await ctx.tools.execute({calls:[{type:'tool-call',id:randomUUID(),name:'mcp__'+(config.serverName||'coclon')+'__'+name,arguments:JSON.stringify(args)}],signal:AbortSignal.timeout(config.toolCallTimeoutMs||180000)});
   const result=batch.results[0]?.result;if(!result||result.isError||result.value?.isError)throw Error(result?.content?.[0]?.text||'COCLON 连接失败 · 请重试');
   const value=result.value;return value.structuredContent||JSON.parse(value.content.find(x=>x.type==='text').text);
  }});
  this.ready=this.control.load();
  ctx.inject(['systemPrompt'],inner=>inner.systemPrompt.section({name:'coclon-task-routing',order:inner.systemPrompt.getSectionOrder('MCP_SERVERS'),interpolate:false,text:()=> 'COCLON: choose twins flexibly for the current task. Call real_roles to discover authorized twins of followed people. No global current twin is selected. An explicit person or twin request takes precedence. An empty followed list does not mean disconnected or unauthorized: use real_search with scope=catalog and the requested person or task, then use an authorized exact id. Do not ask the user to follow someone or authorize again merely to switch to an already authorized twin. For tasks spanning specialties, consult multiple relevant authorized twins and combine their guidance in the host. Check each quote and the saved budget. Following or panel browsing never grants permission or starts work.'}));
 }
 async action(input){if(principalOf(this.ctx.invocation))throw Error('仅当前 Harness 所有者可管理 COCLON 连接');await this.ready;return this.control.action(input);}
}
// Apply the public standard-decorator contract without requiring an install-time TS build.
Remote(CoclonControl.prototype.action,{kind:'method',name:'action',static:false,private:false,addInitializer:init=>initializers.push(init)});
