import L from 'leaflet'

export function createMapWithBounds(elementId, center = [27.7, 85.33], zoom = 12) {
  const map = L.map(elementId, {
    center,
    zoom,
    zoomControl: true,
    fadeAnimation: true,
    zoomAnimation: true
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map)

  const bounds = L.latLngBounds(
    [26.347, 80.058],
    [30.447, 88.201]
  )
  map.setMaxBounds(bounds)

  return map
}

export function fitMarkersInView(map, markers) {
  if (!markers.length) return
  const group = L.featureGroup(markers)
  map.fitBounds(group.getBounds().pad(0.1))
}

export function debouncedMapResize(map, delay = 300) {
  let timer
  return () => {
    clearTimeout(timer)
    timer = setTimeout(() => map.invalidateSize(), delay)
  }
}
