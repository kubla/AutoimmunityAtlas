export function renderControls(root, state, derived, handlers) {
  const clusterButtons = state.clusters
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((cluster) => {
      const active = state.activeClusters.has(cluster.id) ? "active" : "";
      const count = derived.visibleByCluster.get(cluster.id) || 0;
      return `<button class="filter-btn ${active}" data-cluster="${cluster.id}" style="border-left: 8px solid ${cluster.color}">${cluster.name} (${count})</button>`;
    })
    .join("");

  const tagButtons = Array.from(derived.tagIndex.keys())
    .sort()
    .map((tag) => {
      const active = state.activeTags.has(tag) ? "active" : "";
      return `<button class="filter-btn ${active}" data-tag="${tag}">${tag}</button>`;
    })
    .join("");

  const geneOptions = ['<option value="">All genes</option>']
    .concat(
      Array.from(derived.geneIndex.keys())
        .sort()
        .map((gene) => `<option value="${gene}" ${state.activeGene === gene ? "selected" : ""}>${gene}</option>`)
    )
    .join("");

  root.innerHTML = `
    <div class="section">
      <h3>Clusters</h3>
      ${clusterButtons}
    </div>
    <div class="section">
      <h3>Phenotype tags</h3>
      ${tagButtons}
    </div>
    <div class="section">
      <h3>Gene filter</h3>
      <label for="gene-filter" class="muted">Filter disorders by gene symbol</label>
      <select id="gene-filter">${geneOptions}</select>
    </div>
    <div class="section">
      <button id="clear-filters" class="filter-btn">Clear filters</button>
    </div>
  `;

  root.querySelectorAll("[data-cluster]").forEach((button) => {
    button.addEventListener("click", () => handlers.onToggleCluster(button.dataset.cluster));
  });
  root.querySelectorAll("[data-tag]").forEach((button) => {
    button.addEventListener("click", () => handlers.onToggleTag(button.dataset.tag));
  });
  root.querySelector("#gene-filter").addEventListener("change", (event) => {
    handlers.onSetGene(event.target.value);
  });
  root.querySelector("#clear-filters").addEventListener("click", handlers.onClearFilters);
}

function renderRelated(title, ids, byId, onSelect) {
  if (!ids.length) {
    return `<div class="section"><h3>${title}</h3><p class="muted">None listed.</p></div>`;
  }
  return `
    <div class="section">
      <h3>${title}</h3>
      <ul>
        ${ids
          .map((id) => byId.get(id))
          .filter(Boolean)
          .map((item) => `<li><button class="filter-btn related-btn" data-related="${item.id}">${item.name}</button></li>`)
          .join("")}
      </ul>
    </div>
  `;
}

export function renderInspector(root, state, derived, linkifyText) {
  if (!state.selectedDisorderId) {
    root.innerHTML = `<p class="muted">Select a node to inspect its mechanism chain, hallmarks, and references.</p>`;
    return;
  }

  const disorder = derived.byId.get(state.selectedDisorderId);
  if (!disorder) {
    root.innerHTML = `<p class="muted">Selected disorder not found.</p>`;
    return;
  }

  const clusterName = (clusterId) => state.clusters.find((c) => c.id === clusterId)?.name || clusterId;
  const clusterBadges = [disorder.primaryCluster, ...(disorder.secondaryClusters || [])]
    .map((id) => `<span class="badge">${clusterName(id)}</span>`)
    .join("");

  const geneChips = disorder.genes
    .map((gene) => {
      const url = state.links[gene];
      return `<a class="chip" href="${url}" target="_blank" rel="noopener noreferrer">${gene}</a>`;
    })
    .join("");

  const mechanism = disorder.mechanismChain
    .map((step) => `<li>${linkifyText(step)}</li>`)
    .join("");

  const hallmarks = disorder.hallmarks.map((item) => `<li>${linkifyText(item)}</li>`).join("");

  const references = disorder.references
    .map((ref) => `<li><a href="${ref.url}" target="_blank" rel="noopener noreferrer">${ref.label}</a></li>`)
    .join("");

  root.innerHTML = `
    <h2>${disorder.name}</h2>
    <div class="section"><h3>Aliases</h3><p>${disorder.aliases.length ? disorder.aliases.join(", ") : '<span class="muted">No common aliases listed.</span>'}</p></div>
    <div class="section"><h3>Clusters</h3>${clusterBadges}</div>
    <div class="section"><h3>Genes</h3>${geneChips}</div>
    <div class="section"><h3>Inheritance</h3>${disorder.inheritance.map((x) => `<span class="badge">${x}</span>`).join("")}</div>
    <div class="section"><h3>Mechanism chain</h3><ol>${mechanism}</ol></div>
    <div class="section"><h3>Hallmarks</h3><ul>${hallmarks}</ul></div>
    ${renderRelated("Related by pathway", disorder.relatedPathway, derived.byId)}
    ${renderRelated("Related by phenotype", disorder.relatedPhenotype, derived.byId)}
    <div class="section"><h3>References</h3><ul>${references}</ul></div>
  `;

  root.querySelectorAll(".related-btn").forEach((button) => {
    button.addEventListener("click", () => onSelect(button.dataset.related));
  });

  function onSelect(id) {
    state.selectedDisorderId = id;
    renderInspector(root, state, derived, linkifyText);
    state.onSelectionChanged?.();
  }
}
