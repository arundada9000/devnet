export const TILE_CONFIG = {
  carto: {
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  },
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: {
    carto: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    osm: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }
}

export function getTileUrl(style = 'light', provider = 'carto') {
  if (provider === 'carto') {
    return TILE_CONFIG.carto[style] || TILE_CONFIG.carto.light
  }
  return TILE_CONFIG.osm
}
