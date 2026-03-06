# Monogenic Autoimmunity Atlas Spec

## Purpose

Build a single-page static website that maps monogenic autoimmune and immune-dysregulation disorders by mechanism cluster, explains the causal chain from gene defect to phenotype, and presents the material in a clean, legible, mechanism-first interface.

The site will be committed to a GitHub repository and hosted on GitHub Pages.

## Product definition

The website is a visual atlas of rare monogenic disorders in which autoimmunity, immune dysregulation, lymphoproliferation, autoinflammation, or lupus-like phenotypes arise from a single-gene defect.

The site is not a diagnostic tool, not a treatment guide, and not a comprehensive catalog of all inborn errors of immunity. It is a tightly curated mechanism atlas.

## Non-negotiable constraints

- Single page
- Static site
- No React
- No build step
- No backend
- No search box
- No user accounts
- No CMS
- No client-side routing
- No runtime dependence on private APIs

## Hosting and repository assumptions

The site will live in a GitHub repo and be published with GitHub Pages.

That means the implementation will assume:
- static assets served over HTTPS
- module scripts allowed
- static JSON files fetchable from relative paths
- durable public hosting
- easy review of content diffs in pull requests

These assumptions favor:
- small, separate, human-readable data files
- minimal dependencies
- explicit link registries
- plain ES modules
- direct inspection of data and content in GitHub

## Primary user experience

The page has three persistent regions on desktop:

1. Left rail: legend and filters
2. Center: mechanism map
3. Right rail: inspector

On mobile, the order becomes:
1. mechanism map
2. inspector
3. legend and filters

The page opens with the full mechanism map visible and the first cluster highlighted in the legend, but no disorder selected in the inspector.

## Core interaction model

The site is browse-first and filter-first.

There is no search field.

Users navigate by:
- clicking a cluster in the legend
- clicking phenotype tags
- clicking gene symbols in a gene index
- clicking nodes in the map
- clicking related disorders in the inspector

## Primary visualization

The main visualization is an SVG cluster map.

### Node model

Each node represents one disorder.

Node color indicates the disorder’s primary mechanism cluster.

Node border style indicates overlap:
- solid border: single-cluster disease
- double border: meaningful cross-cluster overlap
- dotted border: prominent autoinflammatory component

### Cluster model

Each cluster is rendered as a soft translucent hull behind its nodes.

The clusters are arranged as a conceptual immune-regulation landscape, not an arbitrary graph.

The spatial ordering is fixed:

1. Central tolerance defects
2. Peripheral tolerance / Treg and checkpoint failure
3. Apoptosis / contraction failure
4. Inflammatory brake failure
5. Interferonopathies
6. JAK–STAT pathway GOF
7. Complement / clearance defects
8. B-cell tolerance / CVID-like autoimmunity overlap

### Relationship model

The map does not show network edges.

Relationships are shown in the inspector, where they are intelligible.

This is a deliberate decision. Edge-rich graphs on a dense mechanism atlas quickly become visual mud.

## Inspector behavior

Clicking a disorder node populates the inspector with the following sections, in this exact order:

1. Disorder name
2. Aliases
3. Cluster badges
4. Gene chips
5. Inheritance badges
6. Mechanism chain
7. Hallmarks
8. Related by pathway
9. Related by phenotype
10. References

## Content requirements for every disorder

Every disorder entry must include:

- canonical name
- aliases if relevant
- one primary cluster
- zero or more secondary clusters
- one or more genes
- inheritance pattern
- mechanism chain of 3 to 7 steps
- hallmarks list of 3 to 10 items
- phenotype tags
- related disorders by pathway
- references

## Mechanism chain rules

The mechanism chain is the heart of the product.

Each step must be:
- causal
- short
- declarative
- mechanistic

Good pattern:

1. gene defect changes protein function
2. protein function change alters immune process
3. altered immune process breaks tolerance or inflammatory control
4. this produces a recognizable phenotype

Bad pattern:
- vague summary language
- long prose paragraphs
- list of symptoms without causal linkage
- hand-wavy statements like “the immune system gets confused”

## Link policy

### Gene links

Every cited gene symbol must link to a SNPedia gene page.

Gene links are resolved from a static registry in `data/links.json`.

The site must never guess gene URLs at runtime.

If a gene cannot be linked in the registry, the content is not ready to ship.

### Technical term links

Mechanism text and hallmarks are passed through a controlled glossary linker.

Only approved glossary terms are linkified.

This avoids false matches and keeps links auditable.

Preferred definition sources:
1. NCBI Bookshelf or GeneReviews when suitable
2. MedlinePlus Genetics or NIH pages
3. Wikipedia for generic molecular biology or immunology terms where better public sources are impractical

## Filters

The left rail contains exactly three filter systems:

### 1. Cluster legend
Click filters to one cluster.
Shift-click enables multi-cluster selection.

### 2. Phenotype tag panel
Multi-select chip list.
Examples:
- enteropathy
- autoimmune cytopenias
- endocrinopathy
- lymphoproliferation
- vasculitis
- lupus-like
- interstitial lung disease
- hypogammaglobulinemia

### 3. Gene index
Alphabetical list of all genes present in the dataset.
Clicking a gene filters to disorders that cite that gene.

## Technology decisions

### HTML
Single `index.html` file with semantic layout containers.

### CSS
One `assets/styles.css` file.
No CSS framework.
Use CSS custom properties for colors, spacing, typography, and dark-mode tuning.

### JavaScript
Use ES modules.

Files:
- `assets/app.js`
- `assets/viz.js`
- `assets/ui.js`
- `assets/linkify.js`

### Library
Use D3 v7 from CDN.

D3 is the only external library.

Use it only for:
- force simulation
- SVG selections
- cluster hull generation

Do not add any other dependency.

## File structure

The deliverable is broken into separate files because GitHub Pages and GitHub review workflows reward small, explicit, diffable files.

Use this layout:

- `index.html`
- `assets/styles.css`
- `assets/app.js`
- `assets/viz.js`
- `assets/ui.js`
- `assets/linkify.js`
- `assets/img/favicon.svg`
- `assets/img/og-image.png`
- `data/clusters.json`
- `data/disorders.json`
- `data/glossary.json`
- `data/links.json`

## Data architecture

### `data/clusters.json`
Defines the canonical mechanism clusters.
Each record includes:
- id
- name
- one_liner
- color
- order

### `data/disorders.json`
Defines each disorder.
This is the main content file.

### `data/glossary.json`
Defines approved technical terms and their URLs.
Also contains pattern lists for safe matching.

### `data/links.json`
Defines:
- gene symbol to SNPedia URL mapping
- default links for a small set of abbreviations or fixed tokens if needed

## Visual design direction

The site should look scholarly and sharp, not toy-like and not biotech-corporate fluff.

It should feel:
- crisp
- spare
- precise
- navigable
- calm under density

Visual style decisions:
- off-white or near-black background, depending on color scheme
- restrained color palette
- strong typographic hierarchy
- subtle cluster hulls
- no gratuitous animation
- no parallax
- no glassmorphism
- no trendy UI gimmicks

## Accessibility requirements

- Keyboard navigable controls
- Visible focus states
- Sufficient color contrast
- Node interaction not dependent on color alone
- Inspector content readable by screen readers
- External links marked clearly

## Performance requirements

- Combined local assets should stay comfortably lean
- Combined JSON should remain small and human-reviewable
- The map should settle quickly on modern desktop and mobile
- The site should remain perfectly usable if D3 simulation is slowed; label clutter must not be catastrophic

## Canonical v1 clusters

The v1 site will include these clusters:

### 1. Central tolerance defects
Examples:
- APECED / APS-1
- Omenn syndrome

### 2. Peripheral tolerance / Treg and checkpoint failure
Examples:
- IPEX
- IL2RA deficiency
- STAT5B deficiency
- CTLA-4 haploinsufficiency
- LRBA deficiency
- DEF6 deficiency
- ITCH deficiency
- BACH2 haploinsufficiency

### 3. Apoptosis / contraction failure
Examples:
- ALPS

### 4. Inflammatory brake failure
Examples:
- HA20
- OTULIN-related disease
- LUBAC-related disease
- IKBKG-related immune dysregulation

### 5. Interferonopathies
Examples:
- Aicardi–Goutières syndrome
- SAVI
- DADA2

### 6. JAK–STAT pathway GOF
Examples:
- STAT3 GOF disease
- STAT1 GOF disease

### 7. Complement / clearance defects
Examples:
- early complement deficiencies with lupus-like autoimmunity

### 8. B-cell tolerance / CVID-like autoimmunity overlap
Examples:
- PRKCD deficiency
- APDS

## Acceptance criteria

The site is ready to ship when all of the following are true:

1. GitHub Pages serves the site with no console errors.
2. Every displayed gene symbol links correctly to SNPedia.
3. Every linked technical term resolves from the glossary registry.
4. Cluster filters work.
5. Tag filters work.
6. Gene index filters work.
7. Clicking any disorder opens a complete inspector.
8. The visualization remains legible on desktop and mobile.
9. There are no empty placeholders, dead links, or unlabeled nodes.
10. The content reads as mechanism-first, not symptom-first.

## Final judgment summary

This project will be built as a static, three-region, filter-first mechanism atlas using plain HTML, CSS, ES modules, D3 from CDN, and static JSON files, deployed via GitHub Pages.
