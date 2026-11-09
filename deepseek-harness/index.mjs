import Schema from '@deepseek-ai/schemastery';
import * as mcp from '@deepseek-ai/dsh-mcp-client';
import {connectionConfig,defaultOrigin} from './connection.mjs';

export const name='coclon';
export const inject=mcp.inject;
export const Config=Schema.object({
 baseUrl:Schema.string().default(defaultOrigin).description('COCLON server origin. No token or URL path.'),
 serverName:Schema.string().default('coclon').description('Stable tool namespace. Reuse it across sessions.'),
 preferredProfession:Schema.string().default('').description('Optional twin id. Does not change access.'),
 credentialFile:Schema.string().default('').description('Optional private connector credential file path. Never enter a token here.'),
 nodeCommand:Schema.string().default('').description('Optional Node.js executable. Defaults to the Harness runtime.'),
 toolCallTimeoutMs:Schema.number().min(1000).max(600000).step(1).default(180000).description('Call deadline, not an estimated task duration.'),
});

export async function apply(ctx,config){
 const result=await mcp.Config['~standard'].validate(connectionConfig(config));
 if(result.issues)throw Error('Invalid COCLON MCP configuration: '+result.issues.map(x=>x.message).join('; '));
 await mcp.apply(ctx,result.value);
}
