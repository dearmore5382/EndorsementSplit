from pathlib import Path
from unittest.mock import patch
import importlib,json,sys
import pytest
from gltest.direct import VMContext,create_address,deploy_contract
ROOT=Path(__file__).resolve().parents[1];FILE=ROOT/'contracts'/'EndorsementSplit.py'
ROUND=(ROOT/'samples'/'round.json').read_text();C1=(ROOT/'samples'/'claim-primary.json').read_text();C2=(ROOT/'samples'/'claim-supporting.json').read_text()
def eth(x):return '0x'+bytes(x).hex() if isinstance(x,bytes) else str(x).replace('addr#','0x')
def deploy():
 s,o=create_address('sponsor'),create_address('other');vm=VMContext(create_address('deployer'))
 with patch('os.unlink',lambda _:None),vm.activate():
  c=deploy_contract(FILE,vm,eth(s));g=c._instance.open_round.__globals__['gl'];_=g.nondet;_=g.vm
  sdk=str(Path(g._cached_gl.__file__).resolve().parents[2]);sys.path.insert(0,sdk) if sdk not in sys.path else None;importlib.import_module('genlayer')
 return vm,c,s,o
def sync(vm,c):
 g=c._instance.open_round.__globals__['gl'];s=vm.sender;s=type(g.message.sender_address)(s) if isinstance(s,bytes) else s
 g._cached_gl.message=g.message._replace(sender_address=s,origin_address=s,value=type(g.message.value)(vm.value));g._cached_gl.message_raw['sender_address']=s;g._cached_gl.message_raw['origin_address']=s
def matrix(c,bands=('SUPPORTING','PRIMARY'),overlap=False):
 d=c.get_state()['round_sha256'];rows=[]
 for i,b in enumerate(bands):rows.append({'claim_id':i,'band':b,'milestone_coverage':['M1'] if i==0 else ['M2'],'overlap_with':[1-i] if overlap else [],'evidence_boundary':'WALLET_SIGNED_STATEMENTS_ONLY'})
 return {'round_digest':d,'status':'ALLOCATABLE','assessments':rows}
def ready():
 vm,c,s,o=deploy()
 with vm.prank(s):sync(vm,c);assert c.open_round(ROUND)=='OPEN';assert c.submit_claim(C2)==0
 with vm.prank(o):sync(vm,c);assert c.submit_claim(C1)==1;assert c.attest_claim(0,'ENDORSE','Observed the threat-model review work.')==0
 with vm.prank(s):sync(vm,c);assert c.attest_claim(1,'ENDORSE','Reviewed the implementation changes.')==1;assert c.close_intake()=='CLOSED'
 mod=c._instance.open_round.__globals__
 with vm.activate(),patch.dict(mod,{'_judge':lambda *_:matrix(c)}):sync(vm,c);assert c.adjudicate()=='READY'
 return vm,c,s,o
def snapshot(c):
 st=c.get_state();return {'state':st,'claims':[c.get_claim(i) for i in range(st['claim_count'])],'attestations':[c.get_attestation(i) for i in range(st['attestation_count'])],'allocations':[c.get_allocation(i) for i in range(st['claim_count'])]}
def test_full_lifecycle_and_exact_allocation():
 vm,c,s,o=ready();assert c.get_allocation(0)['bps']==0
 with vm.prank(o):sync(vm,c);assert c.finalize_allocation()=='FINALIZED'
 assert c.get_allocation(0)['bps']==3750 and c.get_allocation(1)['bps']==6250;assert sum(c.get_allocation(i)['bps'] for i in range(2))==10000
 before=snapshot(c)
 with vm.prank(s):sync(vm,c);assert c.finalize_allocation()=='WRONG_PHASE'
 assert snapshot(c)==before
def test_roles_scope_self_attestation_replay_and_closed_intake():
 vm,c,s,o=deploy()
 with vm.prank(o):sync(vm,c);assert c.open_round(ROUND)=='SPONSOR_ONLY'
 with vm.prank(s):sync(vm,c);c.open_round(ROUND);assert c.submit_claim(C2)==0;assert c.submit_claim(C2)=='DUPLICATE_CLAIM_SCOPE';assert c.attest_claim(0,'ENDORSE','self')=='SELF_ATTESTATION'
 with vm.prank(o):sync(vm,c);assert c.attest_claim(0,'ENDORSE','reviewed')==0;before=snapshot(c);assert c.attest_claim(0,'OBJECT','changed mind')=='ATTESTATION_REPLAY';assert snapshot(c)==before
 with vm.prank(s):sync(vm,c);c.close_intake();before=snapshot(c)
 with vm.prank(o):sync(vm,c);assert c.submit_claim(C1)=='INTAKE_CLOSED';assert c.attest_claim(0,'OBJECT','late')=='INTAKE_CLOSED'
 assert snapshot(c)==before
def test_unresolved_is_fail_closed_and_retryable():
 vm,c,s,o=deploy()
 with vm.prank(s):sync(vm,c);c.open_round(ROUND);c.submit_claim(C2);c.close_intake()
 mod=c._instance.open_round.__globals__;before=snapshot(c)
 unresolved={'round_digest':c.get_state()['round_sha256'],'status':'UNRESOLVED','assessments':[]}
 with vm.activate(),patch.dict(mod,{'_judge':lambda *_:unresolved}):sync(vm,c);assert c.adjudicate()=='UNRESOLVED'
 assert snapshot(c)==before
def test_double_primary_overlap_and_bad_matrices_rejected_without_state():
 vm,c,s,o=deploy()
 with vm.prank(s):sync(vm,c);c.open_round(ROUND);c.submit_claim(C2)
 with vm.prank(o):sync(vm,c);c.submit_claim(C1)
 with vm.prank(s):sync(vm,c);c.close_intake()
 mod=c._instance.open_round.__globals__;before=snapshot(c)
 bads=[matrix(c,('PRIMARY','PRIMARY'),True),matrix(c,overlap=True),matrix(c)]
 bads[1]['assessments'][1]['overlap_with']=[];bads[2]['assessments'][0]['claim_id']=1
 for bad in bads:
  with vm.activate(),patch.dict(mod,{'_judge':lambda *_,v=bad:v}):
   sync(vm,c)
   with pytest.raises(Exception):c.adjudicate()
  assert snapshot(c)==before
def test_round_and_claim_binding_validation():
 vm,c,s,o=deploy()
 with vm.prank(s):
  sync(vm,c);assert c.open_round('{}')=='INVALID_ROUND';assert c.open_round(ROUND)=='OPEN';assert c.submit_claim('{}')=='INVALID_CLAIM'
  wrong=json.dumps({'schema':'contribution-claim-v1','milestone_ids':['M9'],'statement':'work'});assert c.submit_claim(wrong)=='INVALID_CLAIM'
def test_deployer_has_no_role():
 vm,c,s,o=deploy()
 with vm.activate():sync(vm,c);assert c.open_round(ROUND)=='SPONSOR_ONLY';assert c.close_intake()=='SPONSOR_ONLY'
