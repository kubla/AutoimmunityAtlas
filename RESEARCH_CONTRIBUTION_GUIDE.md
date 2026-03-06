# Research Contribution Guide: Adding Monogenic Disorders

This guide is for research agents adding new disorders to the atlas.

## Files you usually need to edit

### 1) `data/disorders.json` (required)
Add a new disorder object to the top-level JSON array.

### 2) `data/links.json` (required if any new gene symbol appears)
Every gene symbol listed in a disorder **must** exist as a key in this file with a stable URL value.

### 3) `data/clusters.json` (only if absolutely necessary)
Only edit this when a disorder cannot fit any existing mechanism cluster.
Prefer reusing existing clusters to keep filtering stable.

### 4) `data/glossary.json` (optional)
Only add glossary terms if a truly important technical term appears repeatedly and needs curation.
Do not add terms aggressively.

---

## Required schema for a disorder (`data/disorders.json`)

Use the current camelCase schema exactly:

```json
{
  "id": "unique_snake_case_id",
  "name": "Disorder Name",
  "aliases": ["Alias 1", "Alias 2"],
  "primaryCluster": "existing_cluster_id",
  "secondaryClusters": ["optional_other_cluster_ids"],
  "genes": ["GENE1", "GENE2"],
  "inheritance": ["Autosomal dominant"],
  "mechanismChain": [
    "Step 1...",
    "Step 2...",
    "Step 3..."
  ],
  "hallmarks": ["Short hallmark", "Another hallmark"],
  "tags": ["stable lowercase tag", "another stable tag"],
  "relatedPathway": ["other_disorder_id"],
  "relatedPhenotype": ["other_disorder_id"],
  "references": [
    {
      "label": "GeneReviews: Example Disorder",
      "url": "https://www.ncbi.nlm.nih.gov/books/..."
    },
    {
      "label": "MedlinePlus: Example Disorder",
      "url": "https://medlineplus.gov/genetics/..."
    }
  ]
}
```

---

## Format rules you must follow

## ID and structure
- `id` must be unique across all disorders.
- Keep fields in the same shape and naming style as existing entries.
- Keep JSON valid (no trailing commas, double quotes only).

## Mechanism-first writing
- `mechanismChain` must have **3 to 7** short, causal steps.
- Each step should explain:
  1. what changed,
  2. what broke,
  3. why phenotype follows.
- Avoid tautologies like “causes immune dysregulation.”
- Avoid symptom-only lists.

## Hallmarks and tags
- `hallmarks`: short, filter-friendly phrases (not full sentences).
- `tags`: lowercase, stable vocabulary; avoid inventing near-duplicate tags.

## Genes and links (hard requirement)
- Every gene symbol in `genes` must have an exact matching key in `data/links.json`.
- Do **not** rely on generated/runtime links.
- Use explicit registry entries only.

## Clusters
- `primaryCluster` must match an existing `data/clusters.json` id.
- Use `secondaryClusters` only when there is clear mechanism overlap.

## References
- Include at least 2 stable public references when possible.
- Preferred order:
  1. GeneReviews / NCBI Bookshelf
  2. MedlinePlus Genetics
  3. Strong public review pages
  4. Grokipedia
  5. Wikipedia only when needed

---

## Minimal pre-submit checklist

1. Disorder `id` is unique.
2. `primaryCluster` exists in `data/clusters.json`.
3. Every `genes` symbol exists in `data/links.json`.
4. `mechanismChain` has 3–7 causal steps.
5. `hallmarks` are short and useful.
6. `tags` are stable and not redundant.
7. `references` are public and stable URLs.

---

## Practical tip

If you are only adding a new disorder in an existing cluster with known genes, the common edit set is:

- `data/disorders.json`
- `data/links.json` (only for any gene not already registered)

Keep changes narrow and explicit for easy review.
