
// src/components/mapPicker.js

// Export for other files
export function renderMapPicker(
  container,
  { initial = {}, onChange, country = 'CO', maxMeters = 15 } = {}
) {
  const mapboxgl = window.mapboxgl;
  if (!mapboxgl) {
    container.innerHTML = '<div class="p-4 text-red-400">❌ Mapbox no está disponible</div>';
    return;
  }

  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  if (!token) {
    container.innerHTML = `
      <div class="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
        <h4 class="font-semibold mb-2">⚠️ Token de Mapbox requerido</h4>
        <p class="text-sm">Agrega VITE_MAPBOX_ACCESS_TOKEN a tu archivo .env</p>
        <p class="text-xs mt-2 opacity-70">https://account.mapbox.com/access-tokens</p>
      </div>`;
    return;
  }
  mapboxgl.accessToken = token;

  // Parse seguro
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const initLat = toNum(initial.lat);
  const initLng = toNum(initial.lng ?? initial.lon);
  const hasInitial = initLat !== undefined && initLng !== undefined;

  const lat0 = hasInitial ? initLat : 10.9884167;
  const lng0 = hasInitial ? initLng : -74.7806216;
  const zoom0 = hasInitial ? 16 : 2;

  // Reset anterior
  if (container._map) {
    try { container._map.remove(); } catch {}
    container._map = null;
  }
  container.innerHTML = '';

  const map = new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [lng0, lat0],
    zoom: zoom0,
    attributionControl: false,
    pitchWithRotate: false
  });
  container._map = map;

  map.addControl(new mapboxgl.NavigationControl(), 'top-right');

  const marker = new mapboxgl.Marker({ draggable: true, color: '#00ffff' })
    .setLngLat([lng0, lat0])
    .addTo(map);
  container._marker = marker;

  // ---- Emisión consistente ---------------------------------------------------
  let seq = 0;
// Function emit
  const emit = async (lng, lat) => {
    const cur = ++seq;
    const info = await reverseGeocodeStrict(lng, lat, token, { country, maxMeters });
    if (cur !== seq) return; // descarta respuestas viejas

    onChange?.({
      lat,
      lng,
      address: info.address,           // '' si no hubo match exacto
      matched: info.matched,
      feature_id: info.feature_id || '',
      map_links: {
        google: `https://www.google.com/maps?q=${lat},${lng}`,
        osm: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`
      }
    });
  };

  // ---- Click exacto con unproject (ignora transforms del DOM) ---------------
  function setFromPixel(x, y) {
    const { lng, lat } = map.unproject([x, y]);
    marker.setLngLat([lng, lat]);
    map.easeTo({ center: [lng, lat] });
    emit(lng, lat);
  }

// Function clickExact
  function clickExact(e) {
    const canvas = map.getCanvas();
    const rect = canvas.getBoundingClientRect();
    const oe = e.originalEvent; // MouseEvent | PointerEvent | TouchEvent
    let clientX, clientY;

    if (oe.touches && oe.touches[0]) {
      clientX = oe.touches[0].clientX; clientY = oe.touches[0].clientY;
    } else if (oe.changedTouches && oe.changedTouches[0]) {
      clientX = oe.changedTouches[0].clientX; clientY = oe.changedTouches[0].clientY;
    } else {
      clientX = oe.clientX; clientY = oe.clientY;
    }
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setFromPixel(x, y);
  }

  // Evita “click fantasma” tras drag
  let dragging = false;
  marker.on('dragstart', () => { dragging = true; });
  marker.on('dragend', () => {
    const { lng, lat } = marker.getLngLat();
    map.easeTo({ center: [lng, lat] });
    emit(lng, lat);
    setTimeout(() => { dragging = false; }, 50);
  });

  map.on('click', (e) => {
    if (dragging) return;
    clickExact(e);
  });

  // ---- Geolocaliza y mueve pin si no hay initial ----------------------------
  let geolocate;
  if (!hasInitial) {
    geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
      showAccuracyCircle: false
    });
    map.addControl(geolocate, 'top-left');

// Function onGeo
    const onGeo = (pos) => {
      const { longitude, latitude } = pos.coords;
      marker.setLngLat([longitude, latitude]);
      map.easeTo({ center: [longitude, latitude], zoom: 16 });
      emit(longitude, latitude);
      geolocate.off('geolocate', onGeo); // solo una vez
    };
    geolocate.on('geolocate', onGeo);
  }

  // ---- Lifecycle -------------------------------------------------------------
  map.on('load', () => {
    container.classList.remove('opacity-50');
    if (!hasInitial && geolocate) { try { geolocate.trigger(); } catch {} }
    map.resize();
    setTimeout(() => map.resize(), 120);
  });
  container.classList.add('opacity-50');

  const ro = new ResizeObserver(() => map.resize());
  ro.observe(container);
  map.on('remove', () => ro.disconnect());

  // Estado inicial al montar
  emit(lng0, lat0);

  return map;
}

// Reverse geocoding ESTRICTO: solo 'address' y a ≤ maxMeters del pin.
async function reverseGeocodeStrict(lng, lat, token, { country = 'CO', maxMeters = 15 } = {}) {
  try {
    const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`);
    url.searchParams.set('access_token', token);
    url.searchParams.set('language', 'es');
    url.searchParams.set('reverseMode', 'distance');
    url.searchParams.set('types', 'address'); // evita street/place/poi
    url.searchParams.set('limit', '10');
    if (country) url.searchParams.set('country', country);

// API request
    const r = await fetch(url.toString());
    if (!r.ok) return { address: '', matched: false };

    const data = await r.json();
    const feats = Array.isArray(data.features) ? data.features : [];
    if (!feats.length) return { address: '', matched: false };

    // Distancia en metros
    const R = 6371000;
    const toRad = x => x * Math.PI / 180;
// Function distM
    const distM = (lon1, lat1, lon2, lat2) => {
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat/2)**2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
      return 2 * R * Math.asin(Math.sqrt(a));
    };

    const candidates = feats
      .filter(f => (f.place_type || []).includes('address') && Array.isArray(f.geometry?.coordinates))
      .map(f => {
        const [flng, flat] = f.geometry.coordinates;
        return { f, d: distM(lng, lat, flng, flat) };
      })
      .filter(x => x.d <= maxMeters)
      .sort((a, b) => a.d - b.d);

    if (!candidates.length) return { address: '', matched: false };

    const best = candidates[0].f;
    return {
      address: best.place_name || '',
      matched: true,
      feature_id: best.id || ''
    };
  } catch {
    console.warn('Reverse geocoding failed');
    return { address: '', matched: false };
  }
}

// Búsqueda de lugares (forward). Devuelve coordenadas exactas del feature.
export async function searchPlaces(query, token, opts = {}) {
  try {
    const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`);
    url.searchParams.set('access_token', token);
    url.searchParams.set('types', 'address,poi,place');
    url.searchParams.set('limit', String(opts.limit ?? 5));
    url.searchParams.set('language', 'es');
    if (opts.country) url.searchParams.set('country', opts.country);
    if (Array.isArray(opts.proximity) && opts.proximity.length === 2) {
      url.searchParams.set('proximity', `${opts.proximity[0]},${opts.proximity[1]}`); // [lng, lat]
    }

// API request
    const r = await fetch(url.toString());
    if (!r.ok) return [];
    const data = await r.json();
    return (data.features || []).map(f => ({
      id: f.id,
      name: f.place_name,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      type: (f.place_type || [])[0] || '',
    }));
  } catch {
    console.warn('Places search failed');
    return [];
  }
}
