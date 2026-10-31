# Pagina-para-mi-mejor-amiga

Página de cumpleaños estática. Carpeta de publicación: `Una pagina para mi amiga/erika-birthday/dist`. No requiere compilación.

La sección de la distancia usa Leaflet 1.9.4 (licencia incluida en `dist/assets/leaflet/LICENSE`), mapas de [OpenStreetMap](https://www.openstreetmap.org/copyright) y el límite de Paraguay de [Natural Earth](https://www.naturalearthdata.com/). Las atribuciones se muestran en el mapa.

El recorrido por carretera de Asunción a Hernandarias, pasando por Caaguazú, se obtuvo de [OSRM](https://project-osrm.org/docs/v5.24.0/api/) y se guarda localmente en `dist/assets/amistad-route.json`. No se consulta un servicio de rutas al abrir la página ni se solicita la ubicación del visitante. El viaje de 15 segundos es una animación de la sorpresa.

Prueba manual: abre la sección, inicia el viaje, pausa y continúa; al llegar al 100 % aparece la frase final. También se puede repetir el viaje, explorar Paraguay, acercar el mapa y usar el teclado. Con movimiento reducido, el botón muestra directamente la llegada.
