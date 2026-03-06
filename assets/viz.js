const clusterCenters = {
  central_tolerance: { x: 180, y: 120 },
  peripheral_tolerance: { x: 320, y: 120 },
  apoptosis_contraction: { x: 500, y: 140 },
  inflammatory_brake_failure: { x: 360, y: 250 },
  interferonopathies: { x: 500, y: 330 },
  jak_stat_gof: { x: 610, y: 250 },
  complement_clearance: { x: 180, y: 320 },
  b_cell_tolerance: { x: 300, y: 330 }
};

const familySymbols = {
  adaptive_tolerance: d3.symbolCircle,
  innate_inflammatory: d3.symbolTriangle,
  mixed_or_clearance: d3.symbolDiamond
};

const adaptiveClusters = new Set(["central_tolerance", "peripheral_tolerance", "apoptosis_contraction", "b_cell_tolerance"]);
const innateClusters = new Set(["inflammatory_brake_failure", "interferonopathies", "jak_stat_gof"]);

function clusterFamily(clusterId) {
  if (adaptiveClusters.has(clusterId)) return "adaptive_tolerance";
  if (innateClusters.has(clusterId)) return "innate_inflammatory";
  return "mixed_or_clearance";
}

function convexHullPath(points) {
  if (points.length < 3) return null;
  const hull = d3.polygonHull(points);
  if (!hull) return null;
  return `M${hull.join("L")}Z`;
}

export function renderMap(svgElement, state, derived, onSelect) {
  const width = svgElement.clientWidth || 800;
  const height = svgElement.clientHeight || 520;
  const clusterById = new Map(state.clusters.map((cluster) => [cluster.id, cluster]));

  const allNodes = state.disorders.map((disorder) => {
    const c = clusterCenters[disorder.primaryCluster] || { x: width / 2, y: height / 2 };
    return { ...disorder, x: c.x + Math.random() * 20, y: c.y + Math.random() * 20, family: clusterFamily(disorder.primaryCluster) };
  });

  const simulation = d3
    .forceSimulation(allNodes)
    .force("x", d3.forceX((node) => clusterCenters[node.primaryCluster]?.x || width / 2).strength(0.2))
    .force("y", d3.forceY((node) => clusterCenters[node.primaryCluster]?.y || height / 2).strength(0.2))
    .force("collide", d3.forceCollide(18))
    .stop();

  for (let i = 0; i < 140; i += 1) simulation.tick();

  const visibleIds = new Set(derived.visibleDisorders.map((item) => item.id));
  const visibleNodes = allNodes.filter((node) => visibleIds.has(node.id));

  const svg = d3.select(svgElement);
  svg.selectAll("*").remove();
  svg.attr("viewBox", `0 0 ${width} ${height}`);

  const hullLayer = svg.append("g").attr("class", "hulls");
  const nodeLayer = svg.append("g").attr("class", "nodes");

  state.clusters.forEach((cluster) => {
    const points = visibleNodes
      .filter((node) => node.primaryCluster === cluster.id || (node.secondaryClusters || []).includes(cluster.id))
      .map((node) => [node.x, node.y]);

    if (points.length < 3) return;

    const expanded = points.flatMap((p) => [
      [p[0] - 30, p[1] - 30],
      [p[0] + 30, p[1] - 30],
      [p[0] + 30, p[1] + 30],
      [p[0] - 30, p[1] + 30]
    ]);

    const path = convexHullPath(expanded);
    if (!path) return;

    hullLayer
      .append("path")
      .attr("class", "hull")
      .attr("d", path)
      .attr("fill", cluster.color)
      .attr("fill-opacity", 0.12)
      .attr("stroke", cluster.color)
      .attr("stroke-opacity", 0.45);
  });

  const nodeSymbols = nodeLayer
    .selectAll("path")
    .data(visibleNodes)
    .enter()
    .append("path")
    .attr("class", (node) => `node ${state.selectedDisorderId === node.id ? "selected" : ""}`)
    .attr("transform", (node) => `translate(${node.x}, ${node.y})`)
    .attr("d", (node) => d3.symbol().type(familySymbols[node.family] || d3.symbolCircle).size(300)())
    .attr("fill", (node) => clusterById.get(node.primaryCluster)?.color || "#94a3b8")
    .attr("stroke", (node) => {
      if (node.tags.includes("autoinflammation")) return "#92400e";
      return "#1f2937";
    })
    .attr("stroke-width", (node) => (state.selectedDisorderId === node.id ? 3 : 1.5))
    .attr("stroke-dasharray", (node) => {
      if ((node.secondaryClusters || []).length > 0) return "3 2";
      if (node.tags.includes("autoinflammation")) return "1 4";
      return "0";
    })
    .on("click", (_, node) => onSelect(node.id));

  nodeSymbols.append("title").text((node) => node.name);

  const selected = visibleNodes.find((node) => node.id === state.selectedDisorderId);
  if (selected) {
    nodeLayer
      .append("text")
      .attr("class", "node-label")
      .attr("x", selected.x)
      .attr("y", selected.y - 16)
      .text(selected.name);
  } else {
    svg
      .append("text")
      .attr("class", "map-hint")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .text("Select a node to inspect its mechanism chain.");
  }
}
