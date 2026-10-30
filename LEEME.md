# ConVos · presentación interactiva (8 minutos)

Se presenta con tres pantallas que se complementan. No muestran lo mismo: el proyector cuenta y suma lo colectivo, el celular es personal e interactivo, y la consola maneja todo.

| Parte | Archivo | Quién la usa | Qué hace |
|---|---|---|---|
| **Proyector** | `sala.html` | La compu conectada al proyector | Solo muestra: diapositivas, la app, el mapa. Sin controles ni claves. Doble clic = pantalla completa. |
| **Celular** | `index.html` (el QR) | El público | La pestaña de la app que toca el presentador, la pregunta en vivo y "dónde vivís". |
| **Consola** | `control.html` (enlace privado) | El presentador, en otra compu | Un "Siguiente", notas de qué decir, cronómetro, pulso del público y opciones. |

La consola es la única que firma los cambios de escena. Los otros dos solo tienen la clave pública.

Archivos compartidos: `show.js` (guion), `sync.js` (sala en vivo y firmas), `match.js` (la animación del match), `locs.js` (localidades), `graph.json` y `t/` (mapa sin conexión), `config.js` (configuración pública).

## Guion

Está en `show.js` (una sola lista que leen las tres partes).

- Cada "Siguiente" pasa a la diapositiva siguiente.
- Si una diapositiva tiene varias partes, se sueltan solas, una cada uno o dos segundos (campo `auto` de cada escena). Si tocás "Siguiente" mientras se arma, aparece entera.
- La única parte que espera un toque es la frase final de la encuesta, porque reemplaza a los gráficos. La consola avisa "sigue: La frase final".
- De punta a punta son 23 toques (antes eran 49). Abajo del botón, la consola siempre dice qué hace el próximo toque.

**Antes de empezar · Previa (no cuenta en los 8 minutos).** Mientras la gente se acomoda, el proyector muestra el logo, un QR grande ("Escaneá y dejá el celular abierto") y cuántos celulares ya entraron. El celular dice "Mirá al frente". El cronómetro de la consola arranca solo con el primer "Siguiente".

**Acto 1 · El problema (≈4:05).** Suma lo que agregó el amigo de Max (equipo, autos que llegan al ITBA, entrevistas, encuesta y cierre) a nuestros datos con fuente.

| Escena | Qué muestra | Fuente |
|---|---|---|
| Equipo | "¿Cómo llegaste hoy a la facu?", los cuatro nombres y la foto del equipo | — (**borrador**: faltan nombres y foto) |
| Problema | Autos con una persona que llegan todos al ITBA: "Todos vamos al mismo lugar. Cada uno por su cuenta." | — |
| Autos | 12 autos con una persona que se juntan en 3; **1,3 personas por auto** | GCBA, Partición modal 2026 (base ENMODO 2018) |
| Tiempo | Barras: 34 min en promedio, 77 con 2 medios, 109 con 3 | ENMODO 2018 (todos los motivos de viaje) |
| Planeta | **31%** de los gases de efecto invernadero de la Ciudad sale del transporte | Inventario GEI CABA 2023 |
| Qué existe | "No somos los primeros.": Tenés Lugar, Waze Carpool, BlaBlaCar, y "dentro de una comunidad cerrada, 20 o 30 alcanzan" | Prensa 2018–2026 y Mühlethaler (STRC 2012) |
| Entrevistas | "Salimos a escuchar": cuatro tarjetas (nombre, cargo, frase), una por paso | — (**borrador**: faltan los entrevistados) |
| Encuesta | 28 estudiantes del ITBA: qué frena (flexibilidad 68%, desvío 50%, seguridad 36%) y qué da confianza (misma carrera 79%, conocerse 75%, mismo género 11%). Cierra con "No es miedo: es rigidez. Y la confianza la da la comunidad." | Encuesta propia, octubre 2026 (muestra no aleatoria) |
| La solución | "Apps para compartir el auto hay muchas. Ninguna se volvió costumbre." → se dibuja el logo: ConVos, Comunidad ITBA | — |

- Todas las cifras llevan su fuente corta al pie. El detalle de cada una (qué mide, año, enlace y límites) está en `resultados-investigacion.md`, que no se publica.
- Salieron del guion, para no pasar los 8 minutos: la pregunta en vivo del inicio (Hook), **Volver** (83% presencial, Randstad) y **En el camino** (44,6% de las muertes laborales, SRT). Siguen en `resultados-investigacion.md` por si preguntan.
- Las diapositivas del amigo de Max van en un escenario fijo de 1600 × 900 que se escala entero a la pantalla, con sus mismas animaciones.
- **Foto del equipo:** guardala como `equipo.jpg` en esta carpeta (horizontal o vertical, se recorta sola). Mientras no esté, el proyector muestra "Foto del equipo". Los nombres y los entrevistados se completan en `show.js` (escenas `equipo` y `escuchar`); al completarlos, sacá el `draft:true`.
- La encuesta es una foto fija de las 28 respuestas que traía el archivo del amigo. No se lee la hoja de Google en vivo: eso obligaría al proyector a ejecutar código de otro sitio. Si llegan más respuestas, se actualizan los números en `show.js` (escena `encuesta`).
- Las notas de la consola tienen el contexto de cada dato y lo que conviene aclarar si preguntan.
- Si una diapositiva lleva `draft:true`, el proyector la marca como "Borrador".

**Logos.** El proyector y la consola usan el de los dos caminos que se juntan en el destino (se dibuja al aparecer). El celular usa el del auto con dos personas (en la pantalla de espera anda en el lugar).

**Acto 2 · La solución (≈3:45).** Cómo funciona (3 pasos, sin grupos fijos) → Por qué esta sí (cada miedo de la encuesta con su respuesta) → la app (Inicio, Cerca mío, Swipe, En viaje) → Ahora ustedes (QR) → **La pregunta** → **Match** → **Tu red** → Para la organización → Empresa → Cierre.

- **La pregunta:** cada celular elige su localidad (nunca la dirección) y si tiene auto. El mapa del proyector se llena en vivo.
- **Match:** aparece HAY MATCH y se ve una avenida en perspectiva (desde arriba y de costado) con los autos siempre en movimiento.
  - **Paso 1:** un auto frena en la vereda donde lo esperan sus vecinos, que saludan. Cada uno se sube con un saltito, aparece "+Nombre" y su cara en la ventanilla. Después el auto acelera y vuelve a su carril.
  - **Paso 2:** los demás autos entran de a uno desde atrás, rápido, y se meten en la avenida como quien acelera para incorporarse. La cámara se aleja para que entren todos.
  - Cada auto lleva una tarjeta con el conductor y sus pasajeros.
  - Si alguien responde en ese momento, su auto frena a buscarlo, o entra un auto nuevo si es conductor.
  - Se ve solo en el proyector y se puede saltear. Los personajes son ilustraciones planas (piel, pelo, ropa y peinado varían por persona) y llevan su inicial en la remera.
- **Tu red:** puntos → raíces (el camino real de cada persona hasta la sede; donde se juntan, engorda) → grupos de colores y números → CO₂. En el celular, cada uno ve a quién tiene cerca y el interruptor "¿y si tuvieras auto?".
- **Empresa:** burbujas por zona, sin nombres.

## Opciones de la consola (se explican solas)

| Opción | Qué hace |
|---|---|
| Mostrar / ocultar QR | Código grande en el proyector para que entren. |
| Nombres en el mapa | Muestra u oculta los apodos. |
| Gente de ejemplo (− n +) | Suma o saca gente de ejemplo de a uno. Útil si entra poca gente y para ensayar el match. Se ven con borde punteado. |
| Encuadrar mapa | Ajusta el mapa a toda la sala. |
| Saltear escena | Pasa directo a la siguiente. |
| ↺ Reiniciar todo (abajo a la derecha) | Primera escena, tiempo en cero y 6 de ejemplo. Los celulares se recargan y olvidan lo que contestaron. |

Teclas: `→` siguiente · `←` anterior · `Q` QR · `N` nombres · `+` / `−` ejemplos · `E` encuadrar · `P` cronómetro.

Si la conexión se corta unos segundos, la luz de la tele dice "Reconectando…" (amarillo). Si sigue cortada a los 5 segundos, dice "Sin internet" (rojo).

## Gente de ejemplo y gente real

- La sala arranca con 6 personas de ejemplo (Nico, Sofi, Mica, Fede, Vero, Lucho). Se **suman** a la gente real, no la reemplazan, y siempre se ven con borde punteado. El panel las cuenta aparte ("14 reales · 6 simuladas").
- Para sacarlas: Más opciones → Gente de ejemplo → "−" hasta 0 (o la tecla `−` seis veces). Se puede hacer en cualquier momento: el mapa, el match y los números se rehacen solos.
- "Reiniciar todo" las vuelve a poner en 6. Si las querés sacar, hacelo después de reiniciar.
- En el match, los autos con más gente real salen primero.
- Si nadie real arma un grupo, la consola dice "Todavía no hay match · conviene saltear Match". Si igual lo mostrás, aparecen los de ejemplo.
- Probado con 14 celulares simulados (5 con auto, localidades al azar):
  - Con los 6 de ejemplo: 20 personas, 4 grupos y 436 kg de CO₂.
  - Sin ellos: 14 personas, 1 grupo (Joaco lleva a Facu, los dos de Núñez) y 103 kg.

## Qué es real y qué es de ejemplo

- El mapa, las calles y las distancias salen del prototipo y son reales.
- Los viajes, calificaciones y patentes de la app, y el panel de empresa del celular, son de ejemplo.
- Los compañeros "de ejemplo" son nombres inventados que rellenan el mapa. Se marcan siempre.
- El armado de grupos es una demostración sencilla: cada auto toma a los vecinos más cercanos (menos de 4,5 km) hasta llenar sus lugares. No es un optimizador.
- El CO₂ en vivo cuenta solo autos que dejan de circular (conductores que viajan con otro conductor): 20 días al mes, ida y vuelta, 0,16 kg de CO₂ por km.
  - El 0,16 está confirmado con el factor oficial argentino: un auto a nafta que gasta 8 litros cada 100 km, a 1,97 kg de CO₂ fósil por litro de nafta comercial (SNIGEIAR 2025).
  - Es un **máximo**: no descuenta el desvío del conductor. Así lo dice el pie del proyector y conviene decirlo en voz alta.
  - El proyector muestra también la equivalencia en litros de nafta (kg ÷ 1,97).
  - Entre los compañeros de ejemplo, **Mica tiene auto pero va con Nico** (viven a 2,4 km). Por eso, con los 6 de ejemplo, el CO₂ da unos 140 kg por mes (= 72 litros de nafta) y no 0. Con gente real, sube cuando alguien con auto vive cerca de otro conductor que tiene lugar.
- En el celular:
  - La comparación con árboles usa **60 kg de CO₂ por árbol urbano por año** (EPA, promedio de sus primeros 10 años). Si da menos de un árbol, se muestra en litros de nafta.
  - Los factores de nafta (1,97 kg por litro), gasoil (2,34 por litro) y GNC (1,95 por m³) son los oficiales argentinos (SNIGEIAR 2025). El de eléctrico sigue siendo de ejemplo.
  - El panel de empresa muestra **96 kg de CO₂ menos por mes por auto que no sale**, cálculo propio para 15 km por tramo. El resto del panel (personas, viajes, estacionamiento, zonas) es de ejemplo.

## Privacidad y seguridad

- Se pide apodo y localidad (de una lista de 44). Nunca la dirección. El punto se corre unos cientos de metros.
- No hay base de datos: se usa "presencia" en tiempo real y todo desaparece cuando cada uno cierra la página. Para volver a entrar después de recargar, el apodo y la localidad se guardan solo en esa pestaña del celular y se borran al cerrarla.
- Los cambios de escena van firmados (ECDSA P-256): nadie de la sala puede cambiarle la pantalla al resto. La clave privada vive solo en `private/` y en el enlace de la consola, y la página la saca de la barra de direcciones apenas abre.
- Todo lo que llega de otros se valida y nunca se pega como HTML.
- Riesgo que queda: quien tenga el link puede sumar personas falsas. Se baja usando la sala solo durante la presentación.

## Celulares (Android y iPhone)

- Funciona en Chrome de Android y en Safari de iPhone. Probado en emulación de Android (360 × 780) y en el simulador de iPhone. **Falta probarlo en celulares reales.**
- El celular entra a la sala apenas abre, sin esperar el mapa (que pesa unos 800 KB). Así puede votar aunque la conexión sea lenta.
- Si alguien recarga la página o se le cierra el navegador, vuelve a entrar solo con el mismo apodo y la misma localidad.
- Deslizar hacia abajo no recarga la página (en Android eso sacaba a la persona de la sala).
- Los campos de texto tienen 16 px para que el iPhone no haga zoom. La barra del navegador toma el color oscuro de la app.
- **Tiene que abrirse por https** (GitHub Pages ya lo es). Por http el celular no puede verificar las escenas firmadas y se queda quieto aunque la consola avance.

## Ensayo y plan B

- `config.js` con `backend:'sim'` funciona entre pestañas de **un mismo navegador**: abrí `control.html`, `sala.html` e `index.html` en tres pestañas.
- Para ver una pantalla puntual del celular: `index.html?escena=previa` (cualquier id de `show.js`).
- Si falla la red del lugar: proyector y consola en la misma compu (dos ventanas del mismo navegador) con `backend:'sim'`, y los compañeros de ejemplo.
- No sirve armar un servidor local en la red del lugar para los celulares: sería http y no seguirían las escenas (ver arriba). Para eso el plan B son los compañeros de ejemplo.
