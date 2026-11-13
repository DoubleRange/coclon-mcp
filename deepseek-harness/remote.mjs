import {z} from 'zod';
import {createTypertRemoteInfo} from '@deepseek-ai/dsh-typert-protocol/remote-info';
import {controlInput} from './control-contract.mjs';

// Maintained contract for the single, allowlisted control-panel endpoint.
const input=()=>controlInput(z);
const codec={mode:'strict',typeSymbol:'dsh-plugin-coclon#input',create:input};
export const TYPERT_REMOTE=createTypertRemoteInfo({package:'dsh-plugin-coclon',methods:{'coclonControl/action':{service:'coclonControl',description:'Owner-only COCLON account, catalogue and active twin controls.',invocation:{kind:'direct'},parameters:[{name:'input',source:'json',codec,strictCodec:codec}],result:{mode:'strict',typeSymbol:'dsh-plugin-coclon#state',create:()=>z.json()}}}},z);
export const TYPERT={package:'dsh-plugin-coclon',face:'host',schemas:[],get invocations(){return TYPERT_REMOTE.descriptors;},model:{services:[{key:'coclonControl',exportName:'CoclonControl',members:[{kind:'method',name:'action',signature:'action(input)'}]}],events:[],objects:[]}};
export default TYPERT_REMOTE;
