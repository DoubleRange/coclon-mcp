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
  ctx.inject(['systemPrompt'],inner=>inner.systemPrompt.section({name:'coclon-selected-twin',order:inner.systemPrompt.getSectionOrder('MCP_SERVERS'),interpolate:false,text:()=>this.control.selectedId?'COCLON panel selection: '+this.control.selectedId+'. Use this exact authorized profession_id when the user requests the selected COCLON twin. An explicit request for another person takes precedence. Selection never grants permission or starts work.':''}));
 }
 async action(input){if(principalOf(this.ctx.invocation))throw Error('仅当前 Harness 所有者可管理 COCLON 连接');await this.ready;return this.control.action(input);}
}
// Apply the public standard-decorator contract without requiring an install-time TS build.
Remote(CoclonControl.prototype.action,{kind:'method',name:'action',static:false,private:false,addInitializer:init=>initializers.push(init)});
