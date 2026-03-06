# Content Model and Authoring Rules

## Purpose

This document defines exactly how disorder content should be structured and written.

The goal is consistency. A mechanism atlas dies by a thousand tiny inconsistencies if each entry is written in a different dialect.

## Canonical content objects

The site uses four content objects:

1. cluster
2. disorder
3. glossary term
4. link registry entry

## Cluster object

A cluster represents a failure mode in immune regulation.

Required fields:
- `id`
- `name`
- `one_liner`
- `color`
- `order`

### Cluster writing rule

The `one_liner` must define the broken mechanism, not the symptom cloud.

Good:
- Bad thymic education lets autoreactive T cells escape.

Bad:
- Rare diseases with endocrine problems and infections.

## Disorder object

Every disorder record must include these fields:

- `id`
- `name`
- `aliases`
- `primary_cluster`
- `secondary_clusters`
- `genes`
- `inheritance`
- `mechanism_steps`
- `hallmarks`
- `phenotype_tags`
- `related`
- `refs`

## Gene object inside a disorder

Each gene entry must include:
- `symbol`
- `effect`
- `notes`

Allowed `effect` values:
- `LOF`
- `GOF`
- `haploinsufficiency`
- `hypomorphic`
- `mixed`

Use `mixed` only where the biology genuinely demands it.

## Inheritance values

Allowed inheritance values:
- `AD`
- `AR`
- `XL`

If nuance is needed, put it in notes, not in a new inheritance code.

Examples:
- `AD` with frequent de novo occurrence goes in gene notes
- incomplete penetrance goes in gene notes
- genotype-phenotype nuance goes in gene notes

## Mechanism chain rules

Every disorder must have 3 to 7 mechanism steps.

Each step must satisfy all of these rules:
- one sentence
- causal
- concrete
- mechanistic
- short enough to scan

### Mechanism chain template

Use this pattern wherever possible:

1. Variant effect on gene or protein
2. Immediate molecular or cellular consequence
3. Effect on tolerance, apoptosis, signaling, sensing, or clearance
4. Clinical/immune phenotype consequence

### Good examples

#### APECED / APS-1
1. AIRE loss reduces ectopic tissue-antigen expression in the thymus.
2. Negative selection is weakened, so autoreactive T cells survive.
3. Escaped autoreactive cells attack multiple peripheral tissues.
4. Multi-organ autoimmunity emerges, often with endocrine disease.

#### CTLA-4 haploinsufficiency
1. Reduced CTLA-4 expression weakens inhibitory control of T-cell activation.
2. Costimulatory signaling remains too strong after activation.
3. Peripheral tolerance erodes and activated lymphocytes persist.
4. Autoimmunity and lymphoproliferation become common.

### Bad examples

Bad:
- The immune system does not work correctly and patients can have many symptoms.

Bad:
- This condition causes autoimmunity because the gene is important for immune regulation.

Bad:
- Patients get diarrhea, diabetes, rash, thyroid disease, and many other issues.

These are symptom lists or tautologies, not mechanism chains.

## Hallmarks rules

Each disorder must have 3 to 10 hallmarks.

Hallmarks are short phrases, not sentences.

Examples:
- autoimmune enteropathy
- autoimmune cytopenias
- lymphadenopathy
- endocrinopathy
- vasculitis
- lupus-like autoimmunity

Do not pad hallmarks with fluff.

## Phenotype tags

Phenotype tags are the filter vocabulary.

They must be:
- reusable
- lowercase
- concise
- stable across entries

Preferred tag set for v1:
- enteropathy
- autoimmune cytopenias
- endocrinopathy
- dermatitis
- lymphoproliferation
- vasculitis
- lupus-like
- interstitial lung disease
- hypogammaglobulinemia
- chronic candidiasis
- neuroinflammation
- recurrent infection
- autoantibodies
- granulomatous disease

Use the smallest tag vocabulary that still expresses meaningful filtering.

## Related disorders

`related.pathway` is curated by mechanism.

Use it when two disorders are genuinely near each other in causal logic.

Examples:
- CTLA4 haploinsufficiency and LRBA deficiency
- SAVI and Aicardi–Goutières syndrome
- ALPS and CTLA4 haploinsufficiency where lymphoproliferation meaningfully overlaps, if explicitly desired

`related.phenotype` is broader and can be derived from tag overlap, but it is still best reviewed by hand.

## References

Every disorder must include at least two references.

Preferred order:
1. GeneReviews or NCBI Bookshelf review
2. MedlinePlus Genetics
3. High-quality review article
4. Wikipedia only if necessary for an accessible public summary

References must be stable public URLs.

## Glossary term object

Required fields:
- `key`
- `patterns`
- `url`
- `kind`

### Glossary rules

Use glossary terms for technical concepts that a smart lay reader or cross-disciplinary expert may want to click.

Good glossary candidates:
- central tolerance
- negative selection
- peripheral tolerance
- regulatory T cell
- haploinsufficiency
- loss-of-function mutation
- gain-of-function mutation
- V(D)J recombination
- activation-induced cell death
- type I interferon
- NF-κB
- immune complex
- apoptotic debris
- hypomorphic variant

Do not create glossary entries for every gene, syndrome, or common English word.

## Link registry rules

The gene link registry is mandatory and explicit.

### Gene link requirements
Every symbol in `disorders.json` must exist in `links.json`.

Example:
- `AIRE` must resolve to a canonical SNPedia URL
- `FOXP3` must resolve to a canonical SNPedia URL

No runtime synthesis. No silent fallback. No “best effort.”

## Tone and prose rules

The tone should be:
- precise
- compact
- literate
- unsentimental

Avoid:
- startup clichés
- faux-pop-science language
- melodrama
- padded exposition
- unexplained jargon piles

Prefer:
- short words where possible
- exact mechanistic verbs
- crisp causal sequencing

## Authoring checklist per disorder

Before a disorder entry is considered done, verify:

1. Primary cluster is correct.
2. Secondary clusters are justified.
3. Every gene has symbol, effect, and notes.
4. Every gene symbol has a link registry entry.
5. Mechanism chain is 3 to 7 steps.
6. Mechanism steps are causal, not descriptive mush.
7. Hallmarks are short and useful.
8. Tags use the shared vocabulary.
9. Related disorders are sensible.
10. References are public and stable.

## Canonical disorder list for v1

### Central tolerance defects
- APECED / APS-1
- Omenn syndrome

### Peripheral tolerance / Treg and checkpoint failure
- IPEX
- IL2RA deficiency
- STAT5B deficiency
- CTLA-4 haploinsufficiency
- LRBA deficiency
- DEF6 deficiency
- ITCH deficiency
- BACH2 haploinsufficiency

### Apoptosis / contraction failure
- ALPS

### Inflammatory brake failure
- HA20
- OTULIN-related disease
- LUBAC-related disease
- IKBKG-related immune dysregulation

### Interferonopathies
- Aicardi–Goutières syndrome
- SAVI
- DADA2

### JAK–STAT pathway GOF
- STAT3 GOF disease
- STAT1 GOF disease

### Complement / clearance defects
- early complement deficiencies with lupus-like disease

### B-cell tolerance / CVID-like autoimmunity overlap
- PRKCD deficiency
- APDS

## Final editorial principle

Every entry must teach a reader one sharp thing:

> This is the machinery that failed, and this is why the phenotype follows.
