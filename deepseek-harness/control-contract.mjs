// One owner-panel contract for the host and browser. No agent work is started here.
export const controlInput=z=>z.discriminatedUnion('kind',[
 z.object({kind:z.literal('status')}).strict(),
 z.object({kind:z.literal('check_update')}).strict(),
 z.object({kind:z.literal('prepare_update'),version:z.string().regex(/^\d+\.\d+\.\d+$/),sha256:z.string().regex(/^[a-f0-9]{64}$/)}).strict(),
 z.object({kind:z.literal('browse'),query:z.string().max(100).optional(),scope:z.enum(['following','all']).optional()}).strict(),
 z.object({kind:z.literal('follow'),slug:z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),followed:z.boolean()}).strict(),
 z.object({kind:z.literal('connect'),mode:z.enum(['account','trial'])}).strict(),
 z.object({kind:z.literal('select'),id:z.string().regex(/^[A-Za-z0-9_-]{1,100}$/)}).strict(),
]);
export function twinPrompt(person,role){
 return '请用 COCLON 的「'+person.name+' · '+role.title+'」协助本次任务（分身 ID：'+role.id+'）。复用已有连接，通过 real_work 调用这个分身；不切换主模型。';
}
