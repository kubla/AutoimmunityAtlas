# Monogenic Autoimmunity Atlas

This directory contains the planning documents for a static, single-page site that maps monogenic autoimmune and immune-dysregulation disorders by mechanism.

The site is designed for:
- deployment from a GitHub repository
- hosting on GitHub Pages
- plain HTML, CSS, and JavaScript
- no React
- no build step
- static JSON data files committed to the repo

## Files

- `spec.md`: the product and technical spec
- `content-model.md`: the canonical content structure and authoring rules
- `implementation-plan.md`: the concrete build plan for the static site
- `AGENTS.md`: instructions for humans or AI agents working in this repo area

## Scope

This documentation defines a website that:
- clusters disorders by immune failure mode
- explains the causal chain from gene defect to phenotype
- links every cited gene to SNPedia
- links technical terms to curated definitions or further reading
- uses a static SVG mechanism map as the primary visualization

## Primary decisions already made

- No in-site search
- No edge-heavy network visualization
- No backend
- No build tooling
- D3 v7 from CDN for force layout and hull rendering
- Static JSON for content
- GitHub Pages as the deployment target

## Working principle

This project is mechanism-first, not encyclopedia-first.

Each disorder entry must answer one question clearly:

> What broke, and how does that failure produce autoimmunity or immune dysregulation?

## Deliverable shape

The eventual website repo structure should look like this:

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

These markdown files exist to pin down the architecture before implementation.
