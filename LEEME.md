# ConVos · presentación interactiva

La idea: el público escanea un QR, entra a "la sala" con su apodo y su localidad, y mientras ustedes presentan
la app, sus celulares siguen la presentación. Al final se muestra el mapa de conexiones de toda la sala y cada uno
ve en su celular quién vive cerca y con quién podría volver.

## Piezas

| Archivo | Qué es |
|---|---|
| `index.html` | La app ConVos (el prototipo) que ve el público en su celular. |
| `sala.html` | Pantalla grande **y** control del presentador (mismo archivo). |
| `sync.js` | La sala en vivo: quién está conectado y qué escena toca. Valida todo lo que llega. |
| `config.js` | Configuración pública. `backend:'sim'` = ensayo en una sola compu; `'supabase'` = celulares reales. |
| `locs.js`, `manifest.js`, `graph.json`, `t/` | Localidades, mapa y calles (salen del prototipo). |
| `private/` | Claves del presentador. **No se publica nunca.** |

## Cómo se maneja (presentador)

Se abre `sala.html` con el enlace privado del presentador y se proyecta esa pantalla.

| Tecla | Hace |
|---|---|
| `→` / `←` | Escena siguiente / anterior en todos los celulares |
| `1`…`8` | Bienvenida · Cerca mío · Swipe · Grupo · Viaje · Semana · Tu red · Empresa |
| `Q` | Mostrar / ocultar el QR grande |
| `S` | Activar / desactivar compañeros simulados |
| `N` | Mostrar / ocultar apodos en el mapa |
| `E` | Encuadrar el mapa |
| `C` | Forzar mostrar las conexiones |

Las conexiones aparecen solas al llegar a **Tu red** (escena 7). Ese es el momento del "reveal".

## Guion sugerido (4 minutos)

1. **0:00** Problema. Mostrar el QR (`Q`). Escena *Bienvenida*.
2. **1:00** Qué es ConVos. Escena *Cerca mío*. "Toquen un perfil".
3. **1:15** "¿Dónde viven?": se completa el formulario mientras se sigue hablando.
4. **1:45** *Swipe* y *Grupo*.
5. **2:45** Reveal: *Tu red*. Pantalla grande con los grupos; cada celular con sus conexiones y el interruptor "¿y si tuvieras auto?".
6. **3:30** *Empresa*: el panel con datos agregados. Cerrar con los números de la sala.

## Qué es real y qué es de ejemplo

- El mapa, las calles y las distancias salen del prototipo (reales).
- Los viajes, calificaciones, patentes y el resto de la app son de ejemplo.
- Los "compañeros simulados" (línea punteada) rellenan la sala si entra poca gente. Se apagan con `S`.
- El armado de grupos de la pantalla grande es una demostración sencilla: cada auto toma a los vecinos más
  cercanos (menos de 4,5 km) hasta llenar sus lugares. No es un optimizador.
- El CO₂ de la pantalla grande cuenta solo autos que dejan de circular (conductores que viajan con otro conductor).
  Es una estimación: 20 días al mes, ida y vuelta, 0,16 kg CO₂/km.

## Privacidad y seguridad

- Se pide apodo y localidad (de una lista de 44). Nunca dirección. El punto en el mapa se corre unos cientos de metros.
- No hay base de datos: se usa "presencia" en tiempo real, que desaparece cuando cada persona cierra la página.
- Los cambios de escena van firmados (ECDSA P-256). Los celulares solo tienen la clave pública, así que nadie de la
  sala puede cambiarle la pantalla al resto. La clave privada vive solo en `private/` y en el enlace del presentador.
- Todo lo que llega de otros se valida (largo, caracteres, localidad conocida) y nunca se pega como HTML.
- Riesgo que queda: alguien con el enlace puede sumar personas falsas al mapa. Se baja usando la sala solo durante la presentación.

## Plan B si falla la red

Con `backend:'sim'` y sin internet en los celulares: se proyecta `sala.html` con los simulados y se usa un solo
celular/compu como "público". El flujo es el mismo.
