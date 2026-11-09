import {z} from 'zod';
import {createTypertRemoteInfo} from '@deepseek-ai/dsh-typert-protocol/remote-info';

// Maintained contract for the single, allowlisted control-panel endpoint.
const input=()=>z.discriminatedUnion('kind',[
 z.object({kind:z.literal('status')}).strict(),
 z.object({kind:z.literal('browse'),query:z.string().max(100).optional()}).strict(),
 z.object({kind:z.literal('connect'),mode:z.enum(['account','trial'])}).strict(),
 z.object({kind:z.literal('select'),id:z.string().regex(/^[A-Za-z0-9_-]{1,100}$/)}).strict(),
]);
const codec={mode:'strict',typeSymbol:'dsh-plugin-coclon#input',create:input};
export const TYPERT_REMOTE=createTypertRemoteInfo({package:'dsh-plugin-coclon',methods:{'coclonControl/action':{service:'coclonControl',description:'Owner-only COCLON account, catalogue and active twin controls.',invocation:{kind:'direct'},parameters:[{name:'input',source:'json',codec,strictCodec:codec}],result:{mode:'strict',typeSymbol:'dsh-plugin-coclon#state',create:()=>z.json()}}}},z);
export const TYPERT={package:'dsh-plugin-coclon',face:'host',schemas:[],get invocations(){return TYPERT_REMOTE.descriptors;},model:{services:[{key:'coclonControl',exportName:'CoclonControl',members:[{kind:'method',name:'action',signature:'action(input)'}]}],events:[],objects:[]}};
export default TYPERT_REMOTE;
