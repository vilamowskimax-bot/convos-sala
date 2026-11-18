# Pullup · video de venta (4:44)

Además de la presentación en vivo de esta carpeta, armamos un **video de venta** para mostrarle Pullup a empresas y universidades. Lo **narramos en vivo** encima, igual que la sala: por eso la música va baja y los textos clave están en pantalla.

- **Duración:** 4:44, en 1920×1080 a 30 fps.
- **Dos versiones del archivo:** con música (`Pullup_completo_musica.mp4`) y con los mismos efectos pero sin música (`Pullup_completo_efectos.mp4`), para narrar arriba sin que compita nada.
- **Guía para narrar:** [`GUIA_DE_TIEMPOS.md`](GUIA_DE_TIEMPOS.md) dice, segundo a segundo, qué se ve y qué conviene contar.

Los videos y el proyecto editable **no están en este repositorio** porque pesan mucho (el proyecto completo, con los videos, ocupa unos 530 MB). Se comparten aparte en un ZIP que trae un `CLAUDE.md` con todo el contexto para seguir editándolo con Claude Code. Pedíselo a Santiago.

## Qué cuenta

| Parte | Qué se ve |
|---|---|
| Portada y entrada | Tecnología y Sociedad · ITBA · 2026 · Grupo 7 y los cuatro nombres. La cámara baja hasta una ciudad que amanece y se llena de autos. |
| 01 · El problema | «Cada mañana, tu organización recibe cientos de asientos vacíos.» Los autos llegan a siete polos del AMBA y después a las tres sedes del ITBA. 1,38 personas por auto. Lo que cuestan los asientos vacíos. |
| 02 · La comunidad | La encuesta a 71 estudiantes del ITBA: qué frena a compartir y qué da confianza. «No es el miedo. Es la flexibilidad.» |
| 03 · La solución | «No faltan autos. No faltan ganas. Falta coordinación.» Cuatro autos se juntan en uno; con toda la comunidad, de 96 a 24 autos. Logo de Pullup. Cómo funciona en tres pasos. |
| 04 · La app | Demo de la app real en un celular: 10 pantallas, de la comunidad verificada a «Tu semana». |
| 05 · El match | 58 personas sobre el mapa real: 24 → 15 autos, 50 acompañadas, 819 kg de CO₂ menos por mes. |
| 06 · Para la organización | El panel (si 100 autos dejan de salir cada día: 100 lugares, 9,6 t de CO₂ y 4.800 L de nafta por mes), incentivos y por qué esta vez funciona. |
| Cierre | «Volver juntos.», la foto del equipo y «Llevalo a tu organización.» (sin contacto: el vínculo es por medio de la universidad). |

## Qué conviene que la sala tenga en cuenta

- **Nombre:** el video usa **Pullup** (antes Poolify). La sala todavía dice Poolify en los logos y en los textos. Si las dos piezas se muestran juntas, conviene unificar.
- **Sedes:** el video muestra las tres sedes, igual que el mapa de la sala: Rectorado, Distrito Tecnológico y Distrito Financiero. Los autos por sede son ilustrativos: 42, 24 y 9.
- **Cifras compartidas:** el CO₂ usa el mismo factor que la sala (0,16 kg por km: 8 L cada 100 km de nafta). La encuesta es la misma (n = 71 estudiantes, octubre–noviembre de 2026, muestra no aleatoria). Cada cifra lleva su fuente al pie.
- **Entrevistas:** el video no incluye nombres ni frases de las personas entrevistadas.

## Cómo está hecho

Con [HyperFrames](https://hyperframes.heygen.com): HTML, CSS y GSAP renderizados cuadro a cuadro. Sale del motor de la versión anterior del video (v6), con el mismo mapa real del AMBA, las capturas de la app y la misma paleta. La música y los efectos se mezclan aparte con un script de ffmpeg que respeta las decisiones de audio del equipo:
- tic-tac suave al inicio;
- sin campanita;
- pausa antes del logo;
- la segunda canción entra de a poco;
- al final se desvanece sin volver a subir.

## Pendientes

- Permiso del ITBA para usar su nombre y su logo en el video de venta.
- Dato real de autos al Distrito Tecnológico (hoy es ilustrativo).
- Verlo entero en la pantalla real donde se va a proyectar.
