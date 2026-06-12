export const CLUSTER_OPTIONS = {
  maxClusterRadius: 50,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16,
  removeOutsideVisibleBounds: true,
  iconCreateFunction: (cluster) => {
    const count = cluster.getChildCount()
    let size = 'small'
    if (count >= 10) size = 'medium'
    if (count >= 50) size = 'large'
    return L.divIcon({
      html: `<div class="cluster-icon cluster-${size}">${count}</div>`,
      className: 'custom-cluster',
      iconSize: L.point(40, 40)
    })
  }
}

export const MARKER_COLORS = {
  fire: '#dc2626',
  police: '#2563eb',
  flood: '#0284c7',
  accident: '#d97706',
  landslide: '#65a30d',
  earthquake: '#7c3aed',
  other: '#6b7280'
}

export function getMarkerIcon(type) {
  const color = MARKER_COLORS[type] || MARKER_COLORS.other
  return L.divIcon({
    html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
    className: 'custom-marker',
    iconSize: L.point(16, 16)
  })
}
