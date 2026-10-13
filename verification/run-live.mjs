import {createClient,createAccount} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionStatus} from 'genlayer-js/types';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const address=process.env.ENDORSEMENT_ADDRESS;
if(!/^0x[0-9a-f]{40}$/i.test(address||''))throw Error('Set ENDORSEMENT_ADDRESS');
const sponsor=createAccount(process.env.ENDORSEMENT_SPONSOR_KEY),contributor=createAccount(process.env.ENDORSEMENT_CONTRIBUTOR_KEY);
const r=createClient({chain:studionet}),s=createClient({chain:studionet,account:sponsor}),c=createClient({chain:studionet,account:contributor});
const file=new URL('./LIVE_RUN.json',import.meta.url);
const out=existsSync(file)?JSON.parse(readFileSync(file)):{address,roles:{sponsor:sponsor.address,contributor:contributor.address,deployer_used:false},transactions:[],checks:[]};
if(out.address!==address||out.roles.sponsor!==sponsor.address||out.roles.contributor!==contributor.address)throw Error('Checkpoint identity mismatch');
const save=()=>writeFileSync(file,JSON.stringify(out,null,2)+'\n');
let lastRead=0;const read=async(f,args=[])=>{const d=Math.max(0,2500-(Date.now()-lastRead));if(d)await new Promise(q=>setTimeout(q,d));lastRead=Date.now();return r.readContract({address,functionName:f,args})};
async function snapshot(){const state=await read('get_state'),claims=[],attestations=[],allocations=[];for(let i=0;i<state.claim_count;i++){claims.push(await read('get_claim',[i]));allocations.push(await read('get_allocation',[i]))}for(let i=0;i<state.attestation_count;i++)attestations.push(await read('get_attestation',[i]));return {state,claims,attestations,allocations}}
const check=(label,pass,details={})=>{if(out.checks.some(x=>x.label===label&&x.pass))return;out.checks.push({label,pass:Boolean(pass),details});save();if(!pass)throw Error(label)};
async function tx(w,label,f,args,expected,unchanged=false){
 let row=out.transactions.find(x=>x.label===label);if(row?.verified)return row;if(row&&!row.hash)throw Error('Unknown send: inspect '+label);
 if(!row){row={label,function:f,args,signer:w===s?sponsor.address:contributor.address,before:await snapshot()};out.transactions.push(row);save();const z=await w.writeContract({address,functionName:f,args,value:0n});row.hash=typeof z==='string'?z:z.txId;save();console.log(label,row.hash)}
 await r.waitForTransactionReceipt({hash:row.hash,status:TransactionStatus.FINALIZED,interval:5000,retries:240});row.receipt=await r.getTransaction({hash:row.hash});row.after=await snapshot();save();
 const leader=(row.receipt.consensus_data?.leader_receipt||[]).filter(x=>x.execution_result==='SUCCESS'&&x.result?.status==='return').at(-1);const actual=leader?JSON.parse(leader.result.payload.readable):null;
 check(label+' return',actual===expected,{actual,expected});check(label+' >=3 agrees',Object.values(row.receipt.consensus_data?.votes||{}).filter(x=>x==='agree').length>=3);
 if(unchanged)check(label+' complete no mutation',JSON.stringify(row.before)===JSON.stringify(row.after));row.verified=true;save();return row
}
try{
 const local=readFileSync(new URL('../contracts/EndorsementSplit.py',import.meta.url));const remote=Buffer.from(await r.request({method:'gen_getContractCode',params:[address]}),'base64');check('exact deployed source',local.equals(remote));out.source_sha256=createHash('sha256').update(local).digest('hex');
 const initial=await read('get_state');check('identity and sponsor',initial.name==='EndorsementSplit'&&initial.version===1&&initial.sponsor.toLowerCase()===sponsor.address.toLowerCase(),initial);
 const round=readFileSync(new URL('../samples/round.json',import.meta.url),'utf8'),primary=readFileSync(new URL('../samples/claim-primary.json',import.meta.url),'utf8'),supporting=readFileSync(new URL('../samples/claim-supporting.json',import.meta.url),'utf8');
 await tx(c,'wrong round opener','open_round',[round],'SPONSOR_ONLY',true);await tx(s,'open round','open_round',[round],'OPEN');
 await tx(s,'supporting claim','submit_claim',[supporting],0);await tx(c,'primary claim','submit_claim',[primary],1);
 await tx(c,'self attestation','attest_claim',[1,'ENDORSE','I endorse my own work.'],'SELF_ATTESTATION',true);
 await tx(c,'endorse supporting','attest_claim',[0,'ENDORSE','Observed the threat-model review and adversarial case design.'],0);
 await tx(s,'endorse primary','attest_claim',[1,'ENDORSE','Reviewed the state machine, guards, and direct tests.'],1);
 await tx(s,'attestation replay','attest_claim',[1,'OBJECT','Second stance must not replace the first.'],'ATTESTATION_REPLAY',true);
 await tx(c,'wrong closer','close_intake',[],'SPONSOR_ONLY',true);await tx(s,'close intake','close_intake',[],'CLOSED');
 await tx(c,'late claim','submit_claim',[primary],'INTAKE_CLOSED',true);await tx(c,'adjudicate frozen batch','adjudicate',[],'READY');
 const judged=await snapshot();const assessments=judged.claims.map(x=>JSON.parse(x.assessment));check('all claims assessed',assessments.length===2&&assessments.every((x,i)=>x.claim_id===i));
 check('no double-primary overlap',!assessments.some((x,i)=>x.band==='PRIMARY'&&x.overlap_with.some(j=>assessments[j].band==='PRIMARY')),{assessments});
 await tx(c,'finalize allocation','finalize_allocation',[],'FINALIZED');const final=await snapshot();const total=final.allocations.reduce((n,x)=>n+x.bps,0);check('allocation totals 10000',total===10000,{allocations:final.allocations});check('allocation digest present',/^[0-9a-f]{64}$/.test(final.state.allocation_sha256));
 await tx(s,'double finalization','finalize_allocation',[],'WRONG_PHASE',true);await tx(c,'post-final claim','submit_claim',[primary],'INTAKE_CLOSED',true);
 out.finished=new Date().toISOString();out.final=await snapshot();save();console.log('LIVE COMPLETE');
}catch(e){out.error=String(e);save();throw e}
