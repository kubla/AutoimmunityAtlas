# AGENTS.md

## Purpose

This file tells humans and AI agents how to work in this part of the repository.

This project has a narrow aim: build a static mechanism atlas of monogenic autoimmunity and immune dysregulation. It should remain tight, legible, and mechanically honest.

## First principles

1. The atlas is **mechanism-first**.
2. The writing must explain **causal chains**, not merely list symptoms.
3. The implementation must remain **static, simple, and GitHub Pages-friendly**.
4. Gene links must be **explicit and complete**.
5. Glossary links must be **curated and conservative**.

## Hard constraints

Do not violate these:

- no React
- no build step
- no TypeScript requirement
- no framework creep
- no backend
- no search box
- no runtime-generated gene URLs
- no uncontrolled auto-linking of jargon
- no dumping long encyclopedia prose into the inspector

## Repo expectations

When working on the final website files, use this structure:

- `index.html`
- `assets/styles.css`
- `assets/app.js`
- `assets/viz.js`
- `assets/ui.js`
- `assets/linkify.js`
- `data/clusters.json`
- `data/disorders.json`
- `data/glossary.json`
- `data/links.json`

Do not introduce extra layers without a compelling reason.

## Content rules

### Mechanism chains
Mechanism chains are sacred.

Each disorder must have 3 to 7 short causal steps.

Every step should answer:
- what changed
- what that broke
- why the phenotype follows

Do not write:
- padded prose
- “immune dysregulation” tautologies

### Hallmarks
Keep hallmarks short and filterable.

### Tags
Use stable shared vocabulary.
Do not mint near-duplicate tags casually.

### References
Prefer:
1. GeneReviews or NCBI Bookshelf
2. MedlinePlus Genetics
3. strong public review pages
4. Grokipedia
5. Wikipedia only when necessary

## Link rules

### Genes
Every gene symbol displayed to the user must exist in `data/links.json`.

No exceptions.

### Technical terms
Only terms present in `data/glossary.json` may be auto-linked.

Do not add aggressive regexes that will create nonsense links in prose.

## Code rules

### JavaScript
Use plain ES modules.

Keep responsibilities clean:
- `app.js` owns state and initialization
- `viz.js` draws the map
- `ui.js` renders controls and inspector
- `linkify.js` handles glossary linking

Do not turn D3 into the app architecture.

### CSS
Keep the CSS crisp and boring in the best way.
Prefer durable layout and readable typography over decorative flourishes.

### Dependencies
Use D3 v7 from CDN.
Do not add more libraries unless there is a truly hard requirement.

## GitHub Pages assumptions

Always remember the deployment target is GitHub Pages.

That means:
- static files only
- relative paths
- no build artifacts
- easy diff review in pull requests
- simple local preview

Choose approaches that are robust under those conditions.

## Change policy

When making changes, prefer:
- editing data files over hardcoding content
- explicit registries over magic
- fixed conventions over cleverness
- fewer moving parts over more abstraction

## Review checklist for content edits

Before merging or accepting content changes, verify:

1. disorder id is unique
2. primary cluster exists
3. every gene has a link registry entry
4. mechanism chain is causal and compact
5. hallmarks are useful
6. tags use the canonical vocabulary
7. references are public and stable

## Review checklist for code edits

Before merging or accepting code changes, verify:

1. no new framework was introduced
2. no build step was introduced
3. GitHub Pages compatibility remains intact
4. filters still work
5. inspector still renders complete entries
6. map remains legible on mobile and desktop
7. there are no dead links or console errors

## Style guidance

Aim for prose that is:
- exact
- compact
- lucid
- unsentimental

Aim for code that is:
- explicit
- readable
- unsurprising
- easy to diff in GitHub

## Default behavior for future agents

If you are an AI agent modifying this project, do the following by default:

1. preserve the static architecture
2. preserve the three-region layout
3. preserve the no-search decision
4. preserve the mechanism-first content model
5. preserve explicit link registries
6. refuse gratuitous complexity

When in doubt, choose the simpler design that keeps the atlas sharp.
