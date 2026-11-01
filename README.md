# Pagina-para-mi-mejor-amiga

Página de cumpleaños estática. Carpeta de publicación: `Una pagina para mi amiga/erika-birthday/dist`. No requiere compilación.

La sección de la distancia usa Leaflet 1.9.4 (licencia incluida en `dist/assets/leaflet/LICENSE`), mapas de [OpenStreetMap](https://www.openstreetmap.org/copyright) y el límite de Paraguay de [Natural Earth](https://www.naturalearthdata.com/). Las atribuciones se muestran en el mapa.

El recorrido por carretera de Asunción a Hernandarias, pasando por Caaguazú, se obtuvo de [OSRM](https://project-osrm.org/docs/v5.24.0/api/) y se guarda localmente en `dist/assets/amistad-route.json`. No se consulta un servicio de rutas al abrir la página ni se solicita la ubicación del visitante. El viaje de 15 segundos es una animación de la sorpresa.

Prueba manual: abre la sección, inicia el viaje, pausa y continúa; al llegar al 100 % aparece la frase final. También se puede repetir el viaje, explorar Paraguay, acercar el mapa y usar el teclado. Con movimiento reducido, el botón muestra directamente la llegada.

## Promesa del meñique

La sección `#promesa` admite arrastrar la mano derecha con ratón o dedo, o acercarla con las flechas del teclado. Al entrar en contacto los meñiques se sella la promesa y se intenta enviar el aviso automáticamente, sin un botón adicional. Cada visita empieza con las manos separadas y la mano derecha habilitada. El aviso se intenta una sola vez por gesto completado en esa visita. El aviso se envía a través de FormSubmit solo en la página publicada; localhost no envía avisos de prueba. La respuesta del servicio se comprueba antes de marcar el aviso como enviado, y se puede reintentar si falla.

El propietario debe confirmar el enlace Activate Form enviado por FormSubmit a su correo. Para recibir una alerta en el teléfono también debe activar las notificaciones de Gmail. El correo receptor figura en el código del sitio, tal como exige esta integración de formulario estático. La aceptación del servicio no garantiza la entrega en la bandeja principal; revisar spam si corresponde.
