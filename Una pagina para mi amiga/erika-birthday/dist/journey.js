(() => {
  const section = document.querySelector('#distancia');
  const play = document.querySelector('#journey-play');
  const restart = document.querySelector('#journey-restart');
  const status = document.querySelector('#journey-status');
  const progress = document.querySelector('#journey-progress');
  const percent = document.querySelector('#journey-percent');
  const arrival = document.querySelector('#arrival-message');
  const loading = document.querySelector('#map-loading');
  const countryView = document.querySelector('#country-view');
  const routeView = document.querySelector('#route-view');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let map, country, points, travelled, heart, cumulative, total;
  let frame = 0, fraction = 0, running = false, ready = false;
  let lastTime = null, loadingRoute = false;
  const duration = 15000;

  function fitRoute() {
    map.fitBounds(L.latLngBounds(points), {padding: [48, 65], maxZoom: 9, animate: !reduceMotion.matches});
  }

  function update(value) {
    fraction = Math.min(1, Math.max(0, value));
    const distance = total * fraction;
    // Interpolate by distance so the heart moves evenly through dense road geometry.
    let low = 0, high = cumulative.length - 1;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (cumulative[mid] < distance) low = mid + 1;
      else high = mid;
    }
    const next = Math.max(1, low);
    const previous = next - 1;
    const segment = cumulative[next] - cumulative[previous];
    const t = segment ? (distance - cumulative[previous]) / segment : 0;
    const position = L.latLng(
      points[previous].lat + (points[next].lat - points[previous].lat) * t,
      points[previous].lng + (points[next].lng - points[previous].lng) * t
    );
    heart.setLatLng(position);
    travelled.setLatLngs([...points.slice(0, next), position]);
    progress.value = fraction * 100;
    percent.textContent = `${Math.floor(fraction * 100)} %`;
  }

  function finish() {
    running = false;
    lastTime = null;
    update(1);
    play.innerHTML = 'Repetir viaje <span aria-hidden="true">↻</span>';
    restart.hidden = true;
    status.textContent = 'Llegamos a Hernandarias. Siempre cerquita de ti ♡';
    arrival.classList.add('arrived');
    arrival.setAttribute('aria-hidden', 'false');
    if (typeof celebrate === 'function') celebrate();
  }

  function tick(now) {
    if (!running) return;
    if (lastTime !== null) update(fraction + Math.min(now - lastTime, 100) / duration);
    lastTime = now;
    if (fraction >= 1) finish();
    else frame = requestAnimationFrame(tick);
  }

  function pause() {
    running = false;
    cancelAnimationFrame(frame);
    lastTime = null;
    play.innerHTML = 'Continuar viaje <span aria-hidden="true">↗</span>';
    status.textContent = 'Una pausita. Nuestro camino sigue aquí ♡';
  }

  function reset() {
    running = false;
    cancelAnimationFrame(frame);
    lastTime = null;
    arrival.classList.remove('arrived');
    arrival.setAttribute('aria-hidden', 'true');
    update(0);
    restart.hidden = true;
    play.innerHTML = 'Comenzar viaje <span aria-hidden="true">↗</span>';
    status.textContent = 'Todo listo. ¿Vamos de visita?';
  }

  async function initialize() {
    if (loadingRoute || ready) return;
    loadingRoute = true;
    play.disabled = true;
    status.textContent = 'Cargando el mapa…';
    try {
      if (!window.L) throw new Error('Map library unavailable');
      const responses = await Promise.all([
        fetch('assets/paraguay.geojson'), fetch('assets/amistad-route.json')
      ]);
      if (responses.some(response => !response.ok)) throw new Error('Map data unavailable');
      const [boundary, routeData] = await Promise.all(responses.map(response => response.json()));
      const geometry = routeData.routes?.[0]?.geometry?.coordinates;
      if (!geometry || geometry.length < 2) throw new Error('Invalid route');
      points = geometry.map(([lng, lat]) => L.latLng(lat, lng));
      map = L.map('friendship-map', {scrollWheelZoom: false, zoomControl: false, zoomSnap: .25, minZoom: 5, maxZoom: 15}).setView([-23.5, -58], 6);
      L.control.zoom({zoomInTitle: 'Acercar', zoomOutTitle: 'Alejar'}).addTo(map);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      map.attributionControl.addAttribution('<a href="https://www.naturalearthdata.com/">Natural Earth</a> · Ruta: <a href="https://project-osrm.org/">OSRM</a>');
      country = L.geoJSON(boundary, {interactive: false, style: {color: '#ad597b', weight: 2, fillColor: '#eeb7cc', fillOpacity: .13}}).addTo(map);
      L.polyline(points, {color: '#fff8fb', weight: 10, opacity: .95, interactive: false}).addTo(map);
      L.polyline(points, {color: '#c99bb0', weight: 4, opacity: .7, dashArray: '2 9', interactive: false}).addTo(map);
      travelled = L.polyline([], {color: '#ac3d69', weight: 5, lineCap: 'round', interactive: false}).addTo(map);
      const endpoint = (latlng, name, destination) => {
        const marker = L.circleMarker(latlng, {radius: 7, color: '#fff8fb', weight: 3, fillColor: '#a43e65', fillOpacity: 1}).addTo(map);
        marker.bindTooltip(name, {permanent: true, direction: destination ? 'top' : 'bottom', offset: [0, destination ? -11 : 11], className: 'city-label'});
        marker.bindPopup(`<strong>${name}</strong><br>${destination ? 'Hasta donde estás tú ♡' : 'Aquí comienza nuestro viaje ♡'}`);
      };
      endpoint(points[0], 'Asunción', false);
      endpoint(points[points.length - 1], 'Hernandarias', true);
      heart = L.marker(points[0], {
        icon: L.divIcon({className: 'travelling-heart', html: '<span aria-hidden="true">♥</span>', iconSize: [34, 34], iconAnchor: [17, 17]}),
        keyboard: false, interactive: false, zIndexOffset: 1000
      }).addTo(map);
      cumulative = [0];
      for (let i = 1; i < points.length; i++) cumulative.push(cumulative[i - 1] + points[i - 1].distanceTo(points[i]));
      total = cumulative[cumulative.length - 1];
      map.fitBounds(country.getBounds(), {padding: [24, 24], animate: false});
      loading.hidden = true;
      ready = true;
      countryView.disabled = routeView.disabled = false;
      reset();
      new ResizeObserver(() => map.invalidateSize({pan: false})).observe(document.querySelector('#friendship-map'));
    } catch (error) {
      console.error('No se pudo cargar el recorrido de la amistad:', error);
      if (map) { try { map.remove(); } catch {} map = null; }
      loading.querySelector('p').textContent = 'El mapa no pudo cargarse. Lo intentamos de nuevo ♡';
      status.textContent = 'No se pudo preparar el recorrido.';
      play.textContent = 'Reintentar';
    } finally {
      loadingRoute = false;
      play.disabled = false;
    }
  }

  play.addEventListener('click', () => {
    if (!ready) { initialize(); return; }
    if (running) { pause(); return; }
    if (fraction >= 1) reset();
    fitRoute();
    restart.hidden = false;
    status.textContent = 'En camino hasta tu corazón, con mucho cariño…';
    // A still arrival preserves the interaction for visitors who reduce motion.
    if (reduceMotion.matches) { finish(); return; }
    running = true;
    lastTime = null;
    play.innerHTML = 'Pausar viaje <span aria-hidden="true">Ⅱ</span>';
    frame = requestAnimationFrame(tick);
  });
  restart.addEventListener('click', reset);
  countryView.addEventListener('click', () => map.fitBounds(country.getBounds(), {padding: [24, 24], animate: !reduceMotion.matches}));
  routeView.addEventListener('click', fitRoute);
  document.addEventListener('visibilitychange', () => { if (document.hidden && running) pause(); });
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches && running) { cancelAnimationFrame(frame); finish(); } });

  // Load only when this part of the birthday page is near the screen.
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { initialize(); observer.disconnect(); }
  }, {rootMargin: '300px'});
  observer.observe(section);
})();
