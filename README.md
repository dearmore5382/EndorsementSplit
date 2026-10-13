# EndorsementSplit

EndorsementSplit is a contract-only GenLayer application that evaluates a frozen set of wallet-signed contribution claims and deterministically converts validator-agreed contribution bands into a one-time 10,000-basis-point allocation snapshot.

The deployer configures a sponsor address but receives no role. The sponsor opens a round with immutable milestones and closes intake. Contributors submit their own claims. Other wallets may endorse or object once per claim; self-attestation is rejected. After closure, any wallet may trigger one whole-round adjudication. Validators independently evaluate every frozen claim and material overlap before any result is stored.

AI assigns only `PRIMARY`, `SUPPORTING`, `INCIDENTAL`, or `UNPROVEN` and exact milestone coverage/overlap. Code fixes their weights at 5/3/1/0, rejects incomplete or asymmetric matrices, rejects overlapping claims that are both PRIMARY, and calculates exact basis points. Rounding remainder goes deterministically to the lowest positive claim ID. Finalization is single-use.

Wallet signatures prove who made each statement. They do not prove objective completion, legal identity, or payment. The allocation snapshot is a non-custodial governance record; no funds are held or transferred. An external treasury must independently decide whether and how to consume it.

Run `python -m pytest tests -q -p no:cacheprovider` and `genvm-lint check contracts/EndorsementSplit.py`.

StudioNet deployment: [`0x795081AF06BB1093B036D094aFd4cBa5110aF29f`](https://explorer-studio.genlayer.com/address/0x795081AF06BB1093B036D094aFd4cBa5110aF29f). Live evidence: [`verification/STUDIONET_E2E.md`](verification/STUDIONET_E2E.md). The observed adjudication safely returned `UNRESOLVED`; the report preserves that fail-closed result and does not retry the model to obtain a preferred verdict.
