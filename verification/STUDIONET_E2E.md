# EndorsementSplit — StudioNet evidence

Contract: [0x795081AF06BB1093B036D094aFd4cBa5110aF29f](https://explorer-studio.genlayer.com/address/0x795081AF06BB1093B036D094aFd4cBa5110aF29f)

Source SHA-256: `66074197d0616f7f4a6c7b80447a9c94f2b013a3ec07acfdee9f4728cbe99a06`. Exact deployed-source parity passed. 13 finalized transactions and 33 assertions passed. Sponsor and contributor auxiliary wallets performed the lifecycle; auxiliary wallet `0x736A168247e3f0C52F7907c9a8fDac572DF9c8bB` performed the final public-method probe. The deployer wallet was not used for testing (`deployer_used=false`).

## Live outcome

The frozen round returned `UNRESOLVED` with validator agreement because wallet-signed claims and cross-endorsements establish authorship, not objective milestone completion. The contract failed closed: phase remained `CLOSED`, no assessments or allocations were written, and a subsequent finalize transaction returned `WRONG_PHASE` with a byte-for-byte identical application snapshot. We did not retry adjudication to shop for a favorable model verdict.

The one recorded failed assertion is the original runner's happy-path expectation (`READY`); it is retained in the raw artifact intentionally and superseded by explicit fail-closed assertions.

| Case | Transaction |
|---|---|
| wrong round opener | [0x99c77eca2f1a3b88d36e71741670a9faf8b2776c57e43481f9155974cd3940d5](https://explorer-studio.genlayer.com/tx/0x99c77eca2f1a3b88d36e71741670a9faf8b2776c57e43481f9155974cd3940d5) |
| open round | [0x9317244f1305bc0eb9bc70a5a1bf8f612edc3262e2da5456195b52d411331d23](https://explorer-studio.genlayer.com/tx/0x9317244f1305bc0eb9bc70a5a1bf8f612edc3262e2da5456195b52d411331d23) |
| supporting claim | [0xca26c0710dd7d6bc9839c8079d9ffcd1a3a1f97dc766413b74ce45b3472c3335](https://explorer-studio.genlayer.com/tx/0xca26c0710dd7d6bc9839c8079d9ffcd1a3a1f97dc766413b74ce45b3472c3335) |
| primary claim | [0x463beb1e37c583327521d81671d3085939a947d68864c7cf141d2e8442392f66](https://explorer-studio.genlayer.com/tx/0x463beb1e37c583327521d81671d3085939a947d68864c7cf141d2e8442392f66) |
| self attestation | [0x6ce575dd8289cb08b30b8a85480aaa952c446e3c56898e95224b54a47806eac2](https://explorer-studio.genlayer.com/tx/0x6ce575dd8289cb08b30b8a85480aaa952c446e3c56898e95224b54a47806eac2) |
| endorse supporting | [0x6b100c444ce6fe09520f105077288cd1bae9a56f56e92e620b8d3ad5ce220669](https://explorer-studio.genlayer.com/tx/0x6b100c444ce6fe09520f105077288cd1bae9a56f56e92e620b8d3ad5ce220669) |
| endorse primary | [0xde213c72429c2172bf20017b93c6a7da101568094cbcdec9a1e690918d30585a](https://explorer-studio.genlayer.com/tx/0xde213c72429c2172bf20017b93c6a7da101568094cbcdec9a1e690918d30585a) |
| attestation replay | [0x03222904d2bb07e5ac4c42e3d0540d6c390abf9eaf6aaf3dabcd02131d6893fc](https://explorer-studio.genlayer.com/tx/0x03222904d2bb07e5ac4c42e3d0540d6c390abf9eaf6aaf3dabcd02131d6893fc) |
| wrong closer | [0x5a55a953bcd4f388b6c9f5baeca09f29123472d9ceca0b39963b5c6b377ae632](https://explorer-studio.genlayer.com/tx/0x5a55a953bcd4f388b6c9f5baeca09f29123472d9ceca0b39963b5c6b377ae632) |
| close intake | [0x35483cf5eede30338db7f5b1036f190535e89c8e013ef15da7bbaea7eef3d160](https://explorer-studio.genlayer.com/tx/0x35483cf5eede30338db7f5b1036f190535e89c8e013ef15da7bbaea7eef3d160) |
| late claim | [0x391863a1edd3c85827de36687ae8dd96f78c910bb83f60c9434a079338211d16](https://explorer-studio.genlayer.com/tx/0x391863a1edd3c85827de36687ae8dd96f78c910bb83f60c9434a079338211d16) |
| adjudicate frozen batch | [0xa5d29b09790c9264eebaae9e16f09604203a387ff0f0277b08f30e116ac9e873](https://explorer-studio.genlayer.com/tx/0xa5d29b09790c9264eebaae9e16f09604203a387ff0f0277b08f30e116ac9e873) |
| finalize blocked after unresolved | [0x240b10bd35285bc69e779848c120a159ad623420a07c5fcc92c2c4a36e6c7233](https://explorer-studio.genlayer.com/tx/0x240b10bd35285bc69e779848c120a159ad623420a07c5fcc92c2c4a36e6c7233) |

Raw receipts, consensus votes, inputs and complete pre/post readbacks: [LIVE_RUN.json](LIVE_RUN.json).

## Scope and limitations

Signed statements establish wallet attribution, not objective completion. This deployment therefore demonstrates the safe unresolved branch, authorization, replay protection, immutable intake closure, source parity, validator consensus and deterministic finalize blocking. The contract never holds or transfers funds. Malformed-model and validator-disagreement paths remain Direct Mode controls because they were not naturally observed live.
