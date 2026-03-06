import { createLinkifier } from "./linkify.js";
import { renderMap } from "./viz.js";
import { renderControls, renderInspector } from "./ui.js";

const state = {
  clusters: [],
  disorders: [],
  glossary: [],
  links: {},
  selectedDisorderId: null,
  activeClusters: new Set(),
  activeTags: new Set(),
  activeGene: "",
  onSelectionChanged: null
};

const controlsRoot = document.querySelector("#controls");
const inspectorRoot = document.querySelector("#inspector");
const svgElement = document.querySelector("#atlas-svg");

function unique(items) {
  return [...new Set(items)];
}

function normalizeLinks(rawLinks) {
  if (!rawLinks || typeof rawLinks !== "object") return {};

  if (rawLinks.gene_to_snpedia && typeof rawLinks.gene_to_snpedia === "object") {
    return rawLinks.gene_to_snpedia;
  }

  return rawLinks;
}

function validateData(clusters, disorders, glossary, links) {
  const messages = [];
  const clusterIds = new Set(clusters.map((cluster) => cluster.id));
  const seenIds = new Set();

  disorders.forEach((disorder) => {
    if (seenIds.has(disorder.id)) messages.push(`Duplicate disorder id: ${disorder.id}`);
    seenIds.add(disorder.id);
    if (!clusterIds.has(disorder.primaryCluster)) messages.push(`Missing primary cluster for ${disorder.id}: ${disorder.primaryCluster}`);
    if (!disorder.mechanismChain?.length) messages.push(`Empty mechanism chain for ${disorder.id}`);
    if (!disorder.hallmarks?.length) messages.push(`Empty hallmarks for ${disorder.id}`);
    disorder.genes.forEach((gene) => {
      if (!links[gene]) messages.push(`Missing gene link for ${gene} in ${disorder.id}`);
    });
  });

  glossary.forEach((entry) => {
    if (!entry.url) messages.push(`Glossary term missing URL: ${entry.term}`);
  });

  if (messages.length) {
    console.error("Validation errors:\n" + messages.join("\n"));
    const warning = document.createElement("div");
    warning.className = "warning";
    warning.innerHTML = `<strong>Data warnings</strong><ul>${messages.map((message) => `<li>${message}</li>`).join("")}</ul>`;
    controlsRoot.prepend(warning);
  }
}

function buildDerived() {
  const byId = new Map(state.disorders.map((item) => [item.id, item]));
  const clusterIndex = new Map();
  const tagIndex = new Map();
  const geneIndex = new Map();

  for (const disorder of state.disorders) {
    clusterIndex.set(disorder.primaryCluster, [...(clusterIndex.get(disorder.primaryCluster) || []), disorder.id]);
    for (const tag of disorder.tags) {
      tagIndex.set(tag, [...(tagIndex.get(tag) || []), disorder.id]);
    }
    for (const gene of disorder.genes) {
      geneIndex.set(gene, [...(geneIndex.get(gene) || []), disorder.id]);
    }
  }

  let visible = state.disorders.slice();

  if (state.activeClusters.size) {
    visible = visible.filter((disorder) => state.activeClusters.has(disorder.primaryCluster));
  }

  if (state.activeTags.size) {
    visible = visible.filter((disorder) => Array.from(state.activeTags).every((tag) => disorder.tags.includes(tag)));
  }

  if (state.activeGene) {
    visible = visible.filter((disorder) => disorder.genes.includes(state.activeGene));
  }

  const visibleByCluster = new Map(
    state.clusters.map((cluster) => [cluster.id, visible.filter((disorder) => disorder.primaryCluster === cluster.id).length])
  );

  if (state.selectedDisorderId && !visible.some((item) => item.id === state.selectedDisorderId)) {
    state.selectedDisorderId = null;
  }

  return { byId, clusterIndex, tagIndex, geneIndex, visibleDisorders: visible, visibleByCluster };
}

function render() {
  const derived = buildDerived();
  const linkifyText = createLinkifier(state.glossary);

  renderControls(controlsRoot, state, derived, {
    onToggleCluster(clusterId) {
      if (state.activeClusters.has(clusterId)) state.activeClusters.delete(clusterId);
      else state.activeClusters.add(clusterId);
      render();
    },
    onToggleTag(tag) {
      if (state.activeTags.has(tag)) state.activeTags.delete(tag);
      else state.activeTags.add(tag);
      render();
    },
    onSetGene(gene) {
      state.activeGene = gene;
      render();
    },
    onClearFilters() {
      state.activeClusters = new Set();
      state.activeTags = new Set();
      state.activeGene = "";
      render();
    }
  });

  renderMap(svgElement, state, derived, (disorderId) => {
    state.selectedDisorderId = disorderId;
    render();
  });

  state.onSelectionChanged = () => renderMap(svgElement, state, buildDerived(), (id) => {
    state.selectedDisorderId = id;
    render();
  });

  renderInspector(inspectorRoot, state, derived, linkifyText);
}

async function initialize() {
  const [clusters, disorders, glossary, rawLinks] = await Promise.all([
    fetch("./data/clusters.json").then((response) => response.json()),
    fetch("./data/disorders.json").then((response) => response.json()),
    fetch("./data/glossary.json").then((response) => response.json()),
    fetch("./data/links.json").then((response) => response.json())
  ]);

  const links = normalizeLinks(rawLinks);

  state.clusters = clusters;
  state.disorders = disorders;
  state.glossary = glossary;
  state.links = links;

  validateData(clusters, disorders, glossary, links);

  const firstClusterId = clusters.slice().sort((a, b) => a.order - b.order)[0]?.id;
  if (firstClusterId) state.activeClusters = new Set([firstClusterId]);

  const validGenes = unique(disorders.flatMap((item) => item.genes));
  for (const gene of validGenes) {
    if (!state.links[gene]) {
      throw new Error(`Gene ${gene} was referenced in disorders but missing in links registry.`);
    }
  }

  render();
}

initialize().catch((error) => {
  console.error(error);
  inspectorRoot.innerHTML = `<div class="warning"><strong>Initialization failed:</strong> ${error.message}</div>`;
});
