# Test resource manifest

All resources are synthetic and public. Their authority is the transaction sender that seals or submits them. No URL, GitHub artifact, commercial record or real-world completion claim is used.

## Round

- Resource: `samples/round.json`
- Authority: configured sponsor wallet
- Object: `GRANT-2026-01`
- Immutable after `open_round`
- Expected milestones: M1 threat model, M2 contract implementation
- Boundary: sponsor authorization proves publication of these terms only

## Claims

- `claim-primary.json`: expected PRIMARY for M2
- `claim-supporting.json`: expected SUPPORTING for M1
- Publisher controller: transaction sender recorded as claimant
- Positive beneficiary: claimant
- Can beneficiary manufacture statement alone: yes; therefore statement alone is never described as objective completion
- Corroboration: another wallet's endorsement is also a signed opinion, not independent commercial truth
- Expected allocation if validators accept the expected bands: 6250 bps PRIMARY and 3750 bps SUPPORTING

## Negative controls

Direct tests cover malformed round/claim, wrong milestone, duplicate claimant scope, self-attestation, duplicate attestation, late intake, wrong sponsor, UNRESOLVED, missing/duplicate claim IDs, asymmetric overlap, double PRIMARY overlap, double finalization and complete no-mutation checks.

Live evidence must use the exact deployment, source parity, two auxiliary wallets, finalized receipts, successful GenVM results, at least three agree votes, and complete readback. Malformed model and validator disagreement are only controllable in Direct Mode and must not be claimed live unless naturally observed.
