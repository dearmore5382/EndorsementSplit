# Deployment

Deploy `contracts/EndorsementSplit.py` with the main wallet and constructor sponsor:

`0x686269f09C21aac57f39662855FA51b9758698b2`

The deployer receives no role. Live tests use that sponsor wallet and contributor wallet `0x48CCA889CF67A8420D82341e2fa9532Dc36Ba5c2`. Both require StudioNet faucet balance. Secrets belong only in local environment variables and must never enter source, evidence or Git history.

After deployment set `ENDORSEMENT_ADDRESS`, `ENDORSEMENT_SPONSOR_KEY`, and `ENDORSEMENT_CONTRIBUTOR_KEY`, then run `npm ci` and `npm run live`. The runner verifies deployed source and constructor role before sending writes, checkpoints every transaction before submission, and never retries an unknown send.
