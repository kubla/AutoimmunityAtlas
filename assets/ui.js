export function renderControls(root, state, derived, handlers) {
  const clusterButtons = state.clusters
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((cluster) => {
      const active = state.activeClusters.has(cluster.id) ? "active" : "";
      const count = derived.visibleByCluster.get(cluster.id) || 0;
      return `
        <div class="cluster-row">
          <button class="filter-btn ${active}" data-cluster="${cluster.id}" style="border-left: 8px solid ${cluster.color}">${cluster.name} (${count})</button>
          <p class="muted helper-text">${cluster.one_liner}</p>
        </div>
      `;
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
    <div class="section onboarding">
      <h3>How to read this atlas</h3>
      <ul>
        <li>Each node is one disorder.</li>
        <li>Node color marks the primary mechanism cluster.</li>
        <li>Node shape marks broad pathway family.</li>
        <li>Dashed borders indicate cross-cluster overlap.</li>
        <li>Click a node to inspect its causal mechanism chain.</li>
      </ul>
    </div>
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

export function renderMapToolbar(root, state, handlers) {
  root.innerHTML = `
    <div class="view-toggle" role="group" aria-label="Choose atlas view">
      <button class="filter-btn ${state.activeView === "map" ? "active" : ""}" data-view="map">Map view</button>
      <button class="filter-btn ${state.activeView === "list" ? "active" : ""}" data-view="list">Cluster list view</button>
    </div>
    <div class="map-legend" aria-label="Visual encoding legend">
      <span><strong>Color</strong>: primary cluster</span>
      <span><strong>Shape</strong>: pathway family</span>
      <span><strong>Dashed border</strong>: cross-cluster overlap</span>
      <span><strong>Dotted border</strong>: autoinflammatory prominence</span>
    </div>
  `;

  root.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => handlers.onSetView(button.dataset.view));
  });
}

export function renderClusterList(root, state, derived, onSelect) {
  const visibleIds = new Set(derived.visibleDisorders.map((item) => item.id));

  const sections = state.clusters
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((cluster) => {
      const disorders = state.disorders.filter((disorder) => visibleIds.has(disorder.id) && disorder.primaryCluster === cluster.id);

      return `
      <section class="cluster-list-section">
        <h3>${cluster.name} (${disorders.length})</h3>
        <p class="muted helper-text">${cluster.one_liner}</p>
        ${
          disorders.length
            ? `<div class="chip-grid">${disorders
                .map(
                  (disorder) =>
                    `<button class="filter-btn list-item-btn ${state.selectedDisorderId === disorder.id ? "active" : ""}" data-disorder="${disorder.id}">${disorder.name}</button>`
                )
                .join("")}</div>`
            : '<p class="muted">No visible disorders in this cluster.</p>'
        }
      </section>
    `;
    })
    .join("");

  root.innerHTML = sections;
  root.querySelectorAll("[data-disorder]").forEach((button) => {
    button.addEventListener("click", () => onSelect(button.dataset.disorder));
  });
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
  const primaryCluster = state.clusters.find((cluster) => cluster.id === disorder.primaryCluster);
  const clusterBadges = [disorder.primaryCluster, ...(disorder.secondaryClusters || [])]
    .map((id) => `<span class="badge">${clusterName(id)}</span>`)
    .join("");

  const geneChips = disorder.genes
    .map((gene) => {
      const url = state.links[gene];
      return `<a class="chip" href="${url}" target="_blank" rel="noopener noreferrer">${gene}</a>`;
    })
    .join("");

  const mechanism = disorder.mechanismChain.map((step) => `<li>${linkifyText(step)}</li>`).join("");

  const hallmarks = disorder.hallmarks.map((item) => `<li>${linkifyText(item)}</li>`).join("");

  const references = disorder.references
    .map((ref) => `<li><a href="${ref.url}" target="_blank" rel="noopener noreferrer">${ref.label}</a></li>`)
    .join("");

  root.innerHTML = `
    <h2>${disorder.name}</h2>
    <div class="section"><h3>Aliases</h3><p>${disorder.aliases.length ? disorder.aliases.join(", ") : '<span class="muted">No common aliases listed.</span>'}</p></div>
    <div class="section"><h3>Clusters</h3>${clusterBadges}<p class="muted helper-text">Grouped here because ${primaryCluster?.one_liner?.toLowerCase() || "its primary mechanism maps to this cluster."}</p></div>
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
