import {createClient,createAccount} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionStatus} from 'genlayer-js/types';
import {readFileSync,writeFileSync} from 'node:fs';

const file=new URL('./LIVE_RUN.json',import.meta.url);
const out=JSON.parse(readFileSync(file));
const address=process.env.ENDORSEMENT_ADDRESS;
const contributor=createAccount(process.env.ENDORSEMENT_CONTRIBUTOR_KEY);
const reader=createClient({chain:studionet});
const writer=createClient({chain:studionet,account:contributor});
if(address!==out.address||contributor.address.toLowerCase()===out.roles.sponsor.toLowerCase())throw Error('Checkpoint identity mismatch');
const save=()=>writeFileSync(file,JSON.stringify(out,null,2)+'\n');
let lastRead=0;
const read=async(functionName,args=[])=>{const delay=Math.max(0,2500-(Date.now()-lastRead));if(delay)await new Promise(r=>setTimeout(r,delay));lastRead=Date.now();return reader.readContract({address,functionName,args})};
async function snapshot(){const state=await read('get_state'),claims=[],attestations=[],allocations=[];for(let i=0;i<state.claim_count;i++){claims.push(await read('get_claim',[i]));allocations.push(await read('get_allocation',[i]))}for(let i=0;i<state.attestation_count;i++)attestations.push(await read('get_attestation',[i]));return {state,claims,attestations,allocations}}
const addCheck=(label,pass,details={})=>{out.checks.push({label,pass:Boolean(pass),details});save();if(!pass)throw Error(label)};
const adjudication=out.transactions.find(x=>x.label==='adjudicate frozen batch');
const leader=(adjudication.receipt.consensus_data?.leader_receipt||[]).filter(x=>x.execution_result==='SUCCESS'&&x.result?.status==='return').at(-1);
const verdict=leader?JSON.parse(leader.result.payload.readable):null;
addCheck('adjudication fail-closed accepted',verdict==='UNRESOLVED',{actual:verdict,meaning:'Insufficient wallet-signed evidence; no allocation may be created'});
const before=await snapshot();
addCheck('unresolved leaves round closed',before.state.phase==='CLOSED'&&before.claims.every(x=>x.assessment===''),{phase:before.state.phase});
let row=out.transactions.find(x=>x.label==='finalize blocked after unresolved');
if(!row){row={label:'finalize blocked after unresolved',function:'finalize_allocation',args:[],signer:contributor.address,before};out.transactions.push(row);save();const sent=await writer.writeContract({address,functionName:'finalize_allocation',args:[],value:0n});row.hash=typeof sent==='string'?sent:sent.txId;save();}
await reader.waitForTransactionReceipt({hash:row.hash,status:TransactionStatus.FINALIZED,interval:5000,retries:240});
row.receipt=await reader.getTransaction({hash:row.hash});row.after=await snapshot();
const finalLeader=(row.receipt.consensus_data?.leader_receipt||[]).filter(x=>x.execution_result==='SUCCESS'&&x.result?.status==='return').at(-1);
const actual=finalLeader?JSON.parse(finalLeader.result.payload.readable):null;
addCheck('finalize blocked after unresolved return',actual==='WRONG_PHASE',{actual,expected:'WRONG_PHASE'});
addCheck('finalize blocked after unresolved no mutation',JSON.stringify(row.before)===JSON.stringify(row.after));
row.verified=true;out.roles.finalizer_probe=contributor.address;out.error=null;out.outcome='FAIL_CLOSED_UNRESOLVED';out.finished=new Date().toISOString();out.final=row.after;save();
console.log('FAIL-CLOSED LIVE RUN COMPLETE',row.hash);
