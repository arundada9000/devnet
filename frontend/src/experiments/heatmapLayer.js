const HEATMAP_GRID_SIZE = 0.005;

export function generateHeatmapGrid(points, radius = 3) {
  const grid = {};

  for (const p of points) {
    const latIdx = Math.round(p.lat / HEATMAP_GRID_SIZE);
    const lngIdx = Math.round(p.lng / HEATMAP_GRID_SIZE);
    const key = `${latIdx}:${lngIdx}`;

    if (!grid[key]) {
      grid[key] = {
        lat: latIdx * HEATMAP_GRID_SIZE,
        lng: lngIdx * HEATMAP_GRID_SIZE,
        count: 0,
        types: {},
      };
    }
    grid[key].count++;
    if (p.type) {
      grid[key].types[p.type] = (grid[key].types[p.type] || 0) + 1;
    }
  }

  const maxCount = Math.max(...Object.values(grid).map((g) => g.count), 1);
  return Object.values(grid)
    .filter((g) => g.count > 0)
    .map((g) => ({
      ...g,
      intensity: g.count / maxCount,
      dominantType: Object.entries(g.types).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown",
    }));
}

export function getHeatmapColor(intensity) {
  if (intensity < 0.2) return "#440154";
  if (intensity < 0.4) return "#3b528b";
  if (intensity < 0.6) return "#21918c";
  if (intensity < 0.8) return "#5ec962";
  return "#fde725";
}
