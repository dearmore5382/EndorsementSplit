# Proof obligation and architecture

Claim: given a complete frozen round of wallet-signed claims and attestations, validators can establish bounded contribution bands and material overlap sufficient for a deterministic allocation snapshot.

Falsifiers include unsupported milestone coverage, omitted material overlap, asymmetric overlap edges, two overlapping PRIMARY claims, missing claims, fabricated claim IDs, or treating signed assertions as objective proof.

Sufficient evidence is the immutable on-chain round, claims, claimant addresses, attestor addresses, stances and notes. This evidence establishes signed statements only. It cannot establish real-world completion, identity beyond wallet control, fair market value, or payment.

The nondeterministic boundary is the semantic mapping from the frozen signed record to bands, coverage and overlap. Validators independently re-evaluate the whole record and require exact equality of consequential fields. Explanatory prose is excluded.

The deterministic boundary validates completeness, object binding, symmetry and overlap safety; derives weights and basis points; assigns rounding remainder; and makes the final snapshot immutable. UNRESOLVED or consensus failure leaves CLOSED state unchanged and may be retried against the same frozen evidence.

Architecture: immutable batch intake → whole-round prover/falsifier judgment → deterministic normalization → terminal allocation snapshot. It does not use policy compilation, operational modes, version/re-consent, event routing, web fetching, or external source claims.
