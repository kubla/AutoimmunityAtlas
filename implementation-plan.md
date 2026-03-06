# Implementation Plan

## Purpose

This document translates the spec into a concrete build plan for a static GitHub Pages site.

## Build target

A static site committed directly into the repository, with no build pipeline.

The implementation will use:
- `index.html`
- one CSS file
- four JavaScript modules
- four JSON data files

## File plan

### `index.html`
Responsibilities:
- page shell
- semantic regions
- CDN import for D3
- module bootstrap for `assets/app.js`
- static title, metadata, and social tags

### `assets/styles.css`
Responsibilities:
- layout grid
- typography
- color system
- node styles
- inspector styles
- filter styles
- tooltip styles
- responsive layout
- dark mode

### `assets/app.js`
Responsibilities:
- fetch all JSON files
- initialize app state
- hand data to renderer modules
- wire filters and selection changes
- own top-level state transitions

### `assets/viz.js`
Responsibilities:
- create SVG
- run force simulation
- draw cluster hulls
- draw nodes
- update filtered visibility
- emit node selection events

### `assets/ui.js`
Responsibilities:
- render legend
- render phenotype tag panel
- render gene index
- render inspector
- render related disorder links
- coordinate filter state with `app.js`

### `assets/linkify.js`
Responsibilities:
- compile glossary patterns
- safely link approved technical terms
- avoid linkifying inside existing anchors
- return HTML strings for inspector rendering

### `data/clusters.json`
Responsibilities:
- canonical cluster definitions
- color assignments
- display order

### `data/disorders.json`
Responsibilities:
- the substantive atlas content

### `data/glossary.json`
Responsibilities:
- controlled vocabulary for technical term links

### `data/links.json`
Responsibilities:
- gene-to-SNPedia registry
- tiny set of fixed fallback token links if needed

## HTML structure

`index.html` will contain these root regions:

- site header
- left rail
- map region
- inspector region
- footer

Suggested structure:

- `<header>`
- `<main class="layout">`
  - `<aside id="controls">`
  - `<section id="map">`
  - `<aside id="inspector">`
- `<footer>`

The HTML should stay skeletal. Do not hardcode content records into the page.

## State model

Top-level application state will include:

- loaded data
- selected disorder id
- active cluster filters
- active phenotype tag filters
- active gene filter

This state lives in `app.js`.

`viz.js` and `ui.js` are pure-ish consumers of state and emitters of user interaction events.

## Initialization sequence

1. Load D3 from CDN.
2. Load all JSON files with `fetch()`.
3. Validate that:
   - every disorder’s primary cluster exists
   - every disorder gene exists in `links.json`
   - no glossary entry has an empty URL
4. Build derived indexes:
   - cluster to disorders
   - gene to disorders
   - tag to disorders
   - disorder id to record
5. Render controls.
6. Render map.
7. Render empty inspector prompt or default selection.

## Filtering logic

Filtering proceeds in this order:

1. cluster filter
2. phenotype tag filter
3. gene filter

The final visible set is the intersection of all active filters.

Rules:
- no filter means “all”
- multiple clusters mean union within cluster dimension
- multiple tags mean intersection across selected tags
- single gene filter narrows to disorders citing that gene

## Map rendering plan

### Node placement

The force simulation begins with cluster-based seed coordinates.

Each cluster gets a fixed center in 2D space.

Example conceptual layout:
- central tolerance: upper left
- peripheral tolerance: upper center-left
- apoptosis: upper center-right
- inflammatory brake failure: center
- interferonopathies: lower center-right
- JAK–STAT GOF: center-right bridge
- complement / clearance: lower left
- B-cell tolerance overlap: lower center-left

This produces a stable conceptual map rather than a random blob.

### Hull rendering

For each cluster, compute a soft hull around visible nodes in that cluster.

The hull should be translucent and visually restrained.

### Labels

Persistent labels on every node are forbidden because clutter wins.

Instead:
- node tooltip on hover
- disorder name in inspector
- optional abbreviated label on selected node only

## Inspector rendering plan

When no disorder is selected, show a short instructional empty state.

When a disorder is selected, render:

- title
- aliases
- clusters
- genes with effect badges and links
- inheritance badges
- numbered mechanism chain
- hallmarks
- related by pathway
- related by phenotype
- references

Mechanism chain and hallmarks must be passed through `linkify.js`.

## Linkification plan

`linkify.js` will:
1. sort glossary patterns by descending pattern length
2. escape regex characters safely
3. replace only on word boundaries or controlled phrase boundaries
4. skip replacement inside anchor tags
5. return HTML

The glossary linker must be conservative. Better to miss a term than to create grotesque false positives.

## Validation plan

On load, run validation and fail loudly in the console for:
- missing cluster ids
- missing gene links
- duplicate disorder ids
- empty mechanism chains
- empty hallmarks
- empty glossary URLs

The page can still render a human-visible warning panel if desired, but the main purpose is to catch content drift during development.

## CSS plan

### Layout
Use CSS Grid for desktop.

Suggested grid:
- left rail: fixed or narrow flexible width
- map: dominant center width
- inspector: fixed or flexible readable width

### Typography
Use system fonts.
This is a static atlas, not a brand exercise.

Use:
- strong headings
- compact body text
- restrained line length
- crisp monospace or semi-monospace treatment for gene chips if desired

### Color
Assign cluster colors once in `clusters.json` and consume them from JS or mirrored CSS variables.

Colors should be:
- distinguishable
- sober
- readable in light and dark themes

## D3 usage boundaries

Use D3 only where it earns its keep:
- force simulation
- selections
- hull paths
- transitions if needed

Do not let D3 metastasize into whole-app state management.

App state and UI logic remain plain JavaScript.

## Mobile behavior

On small screens:
- stack sections vertically
- keep map visible and tappable
- collapse left rail into a simple section above or below inspector
- preserve filter usability without hidden complexity

The site must remain pleasant on mobile Safari.

## Deployment plan

Since the site is destined for GitHub Pages:

1. commit static files directly
2. enable Pages on the repo
3. serve from root or `/docs`
4. use relative asset paths
5. avoid absolute URLs for local assets

No compilation step means local testing is simple:
- serve locally with a tiny static server
- or preview via GitHub Pages branch

## Build order

Implement in this order:

1. create file skeleton
2. define `clusters.json`
3. define `links.json`
4. define `glossary.json`
5. define initial `disorders.json`
6. build static HTML shell
7. build CSS layout
8. build data loading and validation
9. build inspector rendering
10. build legend and filters
11. build D3 map
12. polish interaction and mobile layout
13. audit links and content quality

## Done definition

Implementation is done when:
- the site loads on GitHub Pages
- filters work
- inspector works
- every gene link works
- technical term links are sensible
- the map is legible
- mobile layout works
- content is internally consistent
