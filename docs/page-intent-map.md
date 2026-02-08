# Page intent map

Each primary route has a defined 10-second outcome, 60-second outcome, primary CTA, proof expectation, and audience. Used by the Content Operating System and by `content-os-validate` to ensure intent mappings exist. Align meta.title, meta.description, and contentOS intents with this map.

| Route           | Page intent (10s)                                                                          | Page intent (60s)                                                                                           | Primary CTA                                                         | Proof expectation                                                            | Audience                              |
| --------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------- |
| `/`             | Reader knows this is an authority verification site for executive evaluation.              | Reader can choose Executive Brief, Case Studies, or Public Record as next step.                             | Open executive brief                                                | Home does not make standalone claims; routes to proof surfaces.              | Evaluators, board reviewers.          |
| `/brief`        | Reader understands the Executive Brief is the primary authority hub for structured review. | Reader can reach Claims, Case Studies, or Public Record and see evidence routing.                           | See Claims Index / See Case Studies / See Public Record (read path) | Claims link to Public Record; outcomes and case studies are evidence-linked. | Evaluators, institutional reviewers.  |
| `/casestudies`  | Reader knows case studies are structured demonstrations with evidence links.               | Reader can open a case study and see context, constraints, actions, outcomes, and Public Record references. | View case study details                                             | Each case study references Public Record where applicable.                   | Evaluators, hiring committees.        |
| `/books`        | Reader knows books are published volumes with verification-linked references.              | Reader can see metadata, verified references, and availability per book.                                    | (per entry: view book / excerpts)                                   | Books may reference Public Record; no claim without proof.                   | Evaluators, readers.                  |
| `/publicrecord` | Reader knows the Public Record holds verification artifacts supporting claims.             | Reader can open a record and see type, date, source, verification, and claim linkage.                       | View linked claim / open record                                     | All entries are artifacts; support claims or case studies.                   | Evaluators, verification reviewers.   |
| `/contact`      | Reader knows contact is controlled intake for role, media, and public record requests.     | Reader can select a pathway and send a message by email.                                                    | Send role inquiry by email (or pathway-specific CTA)                | No proof claim on contact; pathways are descriptive.                         | Recruiters, media, general inquiries. |

## contentOS intents

The following i18n keys (namespace `contentOS`) store short, evaluator-grade intent lines for tooling and parity checks. Required by `validate-content-os` and `validate-i18n`:

- `intents.home.tenSecond`, `intents.home.sixtySecond`
- `intents.brief.tenSecond`, `intents.brief.sixtySecond`
- `intents.casestudies.tenSecond`, `intents.casestudies.sixtySecond`
- `intents.books.tenSecond`, `intents.books.sixtySecond`
- `intents.publicrecord.tenSecond`, `intents.publicrecord.sixtySecond`
- `intents.contact.tenSecond`, `intents.contact.sixtySecond`

See `libs/i18n/src/messages/<locale>/contentOS.json`. No filler; keep lines short and factual.
