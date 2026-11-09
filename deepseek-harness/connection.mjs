import {fileURLToPath} from 'node:url';

export const defaultOrigin='https://sellers-sleeping-accounting-retirement.trycloudflare.com';
// No shell strings, tokens, model keys, or agent environment are sent to COCLON.
export function connectionConfig(config,{node=process.execPath,ambient=process.env}={}){
 const url=new URL(config.baseUrl||defaultOrigin);
 if(url.username||url.password||url.search||url.hash||url.pathname!=='/'||url.protocol!=='https:'&&!(url.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(url.hostname)))throw Error('COCLON requires an HTTPS origin or loopback URL.');
 const serverName=config.serverName||'coclon';if(!/^[A-Za-z0-9_-]{1,32}$/.test(serverName))throw Error('COCLON serverName must contain 1–32 letters, digits, underscores or hyphens.');
 const preferred=config.preferredProfession||'';if(preferred&&!/^[A-Za-z0-9_-]{1,100}$/.test(preferred))throw Error('COCLON preferredProfession must be an exact twin id.');
 const timeout=config.toolCallTimeoutMs??180000;if(!Number.isInteger(timeout)||timeout<1000||timeout>600000)throw Error('COCLON toolCallTimeoutMs must be 1000–600000.');
 const credentialFile=config.credentialFile||ambient.REAL_CONNECTOR_CONFIG;
 return {serverName,transport:'stdio',command:config.nodeCommand||node,args:[fileURLToPath(new URL('./connector/bin/real-mcp.mjs',import.meta.url)),'--url',url.origin,'--client','DeepSeek Harness',...(preferred?['--profession',preferred]:[])],env:{...(credentialFile?{REAL_CONNECTOR_CONFIG:credentialFile}:{})},cwd:'',toolCallTimeoutMs:timeout,failOnStartupError:true};
}
