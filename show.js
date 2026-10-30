/* Guion de la presentación. Lo leen las tres partes:
   proyector (sala.html) · celulares (index.html) · consola del presentador (control.html).
   Cada "Siguiente" pasa a la diapositiva siguiente. Si tiene varias partes (steps), se sueltan solas, una cada `auto` segundos.
   Si se toca "Siguiente" mientras se está armando, aparece entera; el toque que sigue pasa a la próxima.

   Campos
     id      identificador (minúsculas y _)        act     0 = antes de empezar · 1 = el problema · 2 = la solución
     label   nombre corto                          secs    segundos sugeridos (la previa no cuenta: 0)
     view    'slide' (diapositiva) · 'app' (la app espejada) · 'map' (mapa de la sala)
     steps   cantidad de partes que se sueltan de a una (por defecto 1)
     auto    segundos entre una parte y la siguiente: un número, o uno por parte [a, b, …] (por defecto CONVOS_AUTO).
             Un texto en vez de segundos: esa parte espera un toque, y la consola dice "sigue: <texto>"
             (en la encuesta, porque la frase final reemplaza a los gráficos).
     draft   true = borrador: el proyector muestra "Borrador" (hay que completar con datos con fuente)
     qr      true = muestra un QR chico en el proyector
     slide   {type:'poll'|'stat'|'bars'|'cars'|'list'|'big'|'logo', ...}   (solo view 'slide')
             'list' = título, filas {l: nombre, v: qué pasó} que entran juntas, y una frase final (end)
             Las que diseñó el amigo de Max van en un escenario fijo de 1600×900 que se escala a la pantalla:
             'welcome' (QR grande y conectados) · 'team' (equipo y foto) · 'converge' (autos que llegan al mismo lugar)
             'people' (entrevistados, uno por paso) · 'survey' (encuesta: muñequitos, anillos y frase) · 'reveal' (logo)
             'how' (pasos en tarjetas, uno por paso) · 'answers' (miedo de la encuesta → respuesta, uno por paso) · 'cta' (pase a la parte en vivo, con QR)
             En sus textos, *así* va resaltado y \n corta la línea.
     phone   qué hace el celular en una diapositiva: {poll:true} o {text:'...', sub:'...'}
     tab/sub pestaña de la app que se resalta · desc/tryit texto para el público (view 'app')
     hint    [título, subtítulo] sobre el mapa (view 'map')
     opts    opciones sugeridas en la consola para esta escena ('qr','names','fill','fit','skip')
     skippable   true = la consola ofrece saltearla
     proj / cel   qué muestra cada pantalla (para el presentador)       notes   qué decir (solo consola) */
window.CONVOS_ACTS={0:'Antes de empezar',1:'El problema',2:'La solución'};
window.CONVOS_TOTAL_SECS=480;   // 8 minutos (sin contar la previa)
window.CONVOS_AUTO=2.5;         // segundos entre parte y parte: el mismo ritmo en todas las diapositivas (solo Match tiene el suyo, porque es una animación larga)
window.CONVOS_FILL=6;           // compañeros de ejemplo con los que arranca la sala (la consola los suma o saca de a uno)
window.CONVOS_SHOW=[
  /* ============ ANTES DE EMPEZAR · mientras la gente se acomoda, todos escanean ============ */
  {id:'previa',act:0,opts:['fill'],label:'Previa · QR',secs:0,view:'slide',
   slide:{type:'welcome',kicker:'Tecnología y Sociedad · ITBA',word:'ConVos',t1:'Escaneá',t2:'y dejá el celular abierto'},
   phone:{text:'Mirá al frente',sub:'Dejá esta página abierta: en un rato te vamos a necesitar.'},
   proj:'El logo, un QR grande y cuántos celulares ya entraron.',cel:'“Mirá al frente”: queda conectado y espera.',
   notes:['Mientras se acomodan: que escaneen y dejen el celular abierto.','Cuando haya suficientes conectados, arrancá. El cronómetro empieza solo con el primer “Siguiente”.']},

  /* ============ ACTO 1 · EL PROBLEMA ============ */
  {id:'equipo',act:1,label:'Equipo',secs:30,view:'slide',draft:true,
   slide:{type:'team',kicker:'ConVos · Tecnología y Sociedad · ITBA',title:'¿Cómo llegaste *hoy* a la facu?',names:['Integrante 1','Integrante 2','Integrante 3','Integrante 4'],photo:'equipo.jpg'},
   phone:{text:'Mirá la pantalla'},proj:'La pregunta, los cuatro nombres y la foto del equipo.',cel:'Mensaje de compañía.',
   notes:['Presentarnos: nombre y carrera.','¿Cómo llegaron hoy a la facu? (Que lo piensen: la respuesta aparece en lo que sigue.)']},
  {id:'problema',act:1,label:'Problema',secs:20,view:'slide',steps:2,
   slide:{type:'converge',kicker:'El problema',t1:'Todos vamos al mismo lugar.',t2:'Cada uno por su cuenta.',dest:'ITBA'},
   phone:{text:'Mirá la pantalla'},proj:'Autos con una persona que llegan todos al ITBA. Después, la segunda frase.',cel:'Mensaje de compañía.',
   notes:['Todos los días hacemos el mismo viaje al ITBA, cada uno en su auto o en dos colectivos.','Cada uno por su cuenta: más de la mitad de los que vienen manejando viaja solo (encuesta propia). Tiempo, estacionamiento, nafta y contaminación, y encima no nos conocemos.']},
  {id:'escuchar',act:1,label:'Entrevistas',secs:35,view:'slide',steps:5,draft:true,
   slide:{type:'people',kicker:'Antes de diseñar nada',title:'Salimos a escuchar',people:[
     {n:'Entrevistado 1',r:'[cargo · organización]',q:'[qué nos validó o qué nos advirtió, en una frase]'},
     {n:'Entrevistado 2',r:'[cargo · organización]',q:'[qué nos validó o qué nos advirtió, en una frase]'},
     {n:'Entrevistado 3',r:'[cargo · organización]',q:'[qué nos validó o qué nos advirtió, en una frase]'},
     {n:'Entrevistado 4',r:'[cargo · organización]',q:'[qué nos validó o qué nos advirtió, en una frase]'}]},
   phone:{text:'Mirá la pantalla'},proj:'El título y, de a uno, cuatro tarjetas: nombre, cargo y su frase.',cel:'Mensaje de compañía.',
   notes:['Antes de diseñar nada, salimos a escuchar. Los entrevistados aparecen de a uno.','Entrevistado 1: qué nos validó o qué nos advirtió.','Entrevistado 2: una frase.','Entrevistado 3: una frase.','Entrevistado 4: una frase.']},
  {id:'encuesta',act:1,label:'Encuesta',secs:40,view:'slide',steps:4,auto:[null,null,'La frase final'],
   slide:{type:'survey',kicker:'Encuesta a estudiantes del ITBA',title:'Lo que nos dijeron',n:40,
     q1:{q:'¿Qué te frena a compartir el viaje?',opts:[{l:'Perder flexibilidad de horarios',k:27,c:'hot'},{l:'Desviarme o esperar a otros',k:19,c:'hot'},{l:'No sentirme seguro/a',k:15,c:'cool'}],leg:'= 1 estudiante'},
     q2:{q:'¿Qué te daría confianza para viajar con alguien?',opts:[{l:'Conocerlo antes en la facu',k:32,c:'hot'},{l:'Que sea de mi carrera o año',k:29,c:'hot2'},{l:'Que sea de mi mismo género',k:5,c:'cool'}]},
     punch:'No es miedo: *es rigidez.*\nY la confianza *la da la comunidad.*',src:'Encuesta propia a estudiantes del ITBA, octubre 2026 (40 respuestas, muestra no aleatoria)'},
   phone:{text:'Mirá la pantalla'},proj:'Las dos preguntas; después se llenan solos los muñequitos y los anillos. La frase final sale con otro Siguiente.',cel:'Mensaje de compañía.',
   notes:['Apenas aparece, preguntá: «¿Qué creen que frena más: el miedo o los horarios?»','Se llenan los muñequitos: la flexibilidad le gana a la seguridad.','Las barras de confianza: conocerse en la facu (80%) y misma carrera (73%), contra mismo género (13%).','Tocá Siguiente para la frase final: no es miedo, es rigidez. «Y la confianza la da la comunidad.» (Si preguntan: 40 respuestas. 25 de 40 estarían dispuestos o muy dispuestos a compartir. La muestra no es aleatoria.)']},
  {id:'solucion',act:1,label:'La solución',secs:20,view:'slide',steps:2,
   slide:{type:'reveal',q:'Apps para compartir el auto hay muchas.',sub:'Ninguna se volvió costumbre.',word:'ConVos',tag:'Comunidad ITBA',line:'No inventamos el carpooling. Lo diseñamos para que se adopte.',next:'Cómo funciona →'},
   phone:{text:'ConVos'},proj:'La frase, y después el logo que se dibuja: ConVos, Comunidad ITBA.',cel:'ConVos.',
   notes:['Apps para compartir el auto existen (hasta Waze tuvo una, y cerró). Ninguna se volvió costumbre.','Se revela ConVos. Pasar a la demo.']},

  /* ============ ACTO 2 · LA SOLUCIÓN ============ */
  /* Sin grupos fijos: cada uno publica su viaje el día anterior (decisión del informe, por el 68% de la encuesta) */
  {id:'como',act:2,label:'Cómo funciona',secs:20,view:'slide',steps:3,
   slide:{type:'how',kicker:'Cómo funciona',title:'Tres pasos. *Todos los días.*',
     items:[{i:'cal',t:'Publicás tu viaje',d:'El día anterior: a qué sede vas y a qué hora.'},
            {i:'ppl',t:'Elegís con quién',d:'La app te muestra quién del ITBA va para tu lado, a la misma hora.'},
            {i:'car',t:'Viajan juntos',d:'Comparten la nafta. Y al otro día, elegís de nuevo.'}]},
   phone:{text:'Así de simple',sub:'Publicás tu viaje, elegís con quién y viajan juntos.'},proj:'Los tres pasos, que aparecen de a uno.',cel:'Mensaje de compañía.',
   notes:['Publicás tu viaje el día anterior: a qué sede vas y a qué hora.','La app te muestra quién del ITBA va para tu lado. Vos elegís con quién.','Viajan juntos y comparten la nafta. No hay grupos fijos: cada día se elige de nuevo.']},
  {id:'porque',act:2,label:'Por qué esta sí',secs:25,view:'slide',steps:3,
   slide:{type:'answers',kicker:'Lo que nos dijeron, resuelto',title:'Cada miedo, *una respuesta.*',
     rows:[{p:'68%',f:'teme perder flexibilidad',t:'Sin grupos fijos',d:'Cada día decidís si viajás y con quién.'},
           {p:'48%',f:'teme desviarse o esperar',t:'Un mismo destino',d:'Todos van a una de las tres sedes del ITBA: más coincidencias, menos desvío.'},
           {p:'38%',f:'no se siente seguro/a',t:'Solo gente del ITBA',d:'Cuentas verificadas. El 80% confiaría en alguien que conoció en la facu.'}],
     src:'Encuesta propia a estudiantes del ITBA, octubre 2026 (40 respuestas, muestra no aleatoria)'},
   phone:{text:'Lo pensamos con ustedes',sub:'Cada miedo de la encuesta tiene su respuesta.'},proj:'Los tres miedos de la encuesta, cada uno con su respuesta.',cel:'Mensaje de compañía.',
   notes:['Volvemos a la encuesta: el 68% teme perder flexibilidad, por eso no hay grupos fijos.','El 48% teme desviarse o esperar: todos van a las mismas tres sedes (Distrito Tecnológico, Rectorado y Distrito Financiero), así hay más coincidencias y menos desvío.','El 38% no se siente seguro: solo entra gente verificada del ITBA. La confianza la da la comunidad. Ahora, la app.']},
  {id:'inicio',act:2,opts:['qr'],label:'Inicio',secs:10,view:'app',tab:'Inicio',
   desc:'Tu próximo viaje de un vistazo. Todo empieza acá.',tryit:'Tocá “Ver quién va cerca”',
   proj:'La app y sus 4 pestañas, con la actual resaltada.',cel:'La misma pestaña, lista para tocar.',
   notes:['Esta es ConVos. Cuatro pestañas: Inicio, Cerca mío, Mis viajes y Perfil.','Todos ya la tienen en el celular: pedí que la toquen.']},
  {id:'cerca',act:2,label:'Cerca mío',secs:15,view:'app',tab:'Cerca mío',
   desc:'Un mapa real con la gente del ITBA que hace tu mismo camino, y por qué aparece cada uno.',tryit:'Tocá un perfil en el mapa',
   proj:'La pantalla “Cerca mío”, ampliada.',cel:'Cerca mío, para tocar los perfiles.',
   notes:['Un mapa real con compañeros que hacen tu camino.','Cada uno dice por qué aparece: distancia, horario y quién maneja.']},
  {id:'swipe',act:2,label:'Swipe',secs:10,view:'app',tab:'Cerca mío',sub:'Deslizar perfiles',
   desc:'Deslizá perfiles: a la derecha si te interesa. Si es mutuo, se arma el viaje.',tryit:'Deslizá una tarjeta',
   proj:'El mazo de perfiles, ampliado.',cel:'El mazo para deslizar.',
   notes:['Derecha si te interesa, izquierda si no.','Si es mutuo, se arma el viaje. Solo gente del ITBA.']},
  {id:'viaje',act:2,label:'En viaje',secs:10,view:'app',tab:'Mis viajes',sub:'En viaje',
   desc:'La app avisa cuándo salir y muestra el recorrido en tiempo real, con un contacto de confianza.',tryit:'Tocá “Compartir viaje”',
   proj:'El viaje en curso con el recorrido real.',cel:'El mismo viaje en vivo.',
   notes:['El día del viaje la app avisa cuándo salir.','El recorrido se ve en vivo y se puede compartir con alguien de confianza.']},
  {id:'ahora',act:2,opts:['qr'],label:'Ahora ustedes',secs:5,view:'slide',
   slide:{type:'cta',kicker:'Ahora ustedes',title:'¿Quién vuelve *con quién?*',sub:'Elegí tu localidad (nunca tu dirección) y si tenés auto. El mapa se arma en vivo.',t1:'Escaneá',t2:'y respondé'},
   phone:{text:'Ahora vos',sub:'En un segundo te preguntamos tu localidad y si tenés auto.'},proj:'El pase a la parte en vivo: la pregunta grande y el QR para quien no escaneó.',cel:'Aviso de que viene la pregunta.',
   notes:['Ahora ustedes: ¿quién vuelve con quién? El que no escaneó, es ahora.']},
  {id:'pregunta',act:2,opts:['qr','names','fit','fill'],label:'La pregunta',secs:30,view:'map',hint:['¿Dónde viven?','Escaneá, elegí tu localidad y mirá cómo se arma el mapa'],qr:true,
   proj:'Mapa de la sala: aparece un punto por cada respuesta, más el QR.',cel:'Formulario: apodo, localidad y si tenés auto.',
   notes:['¿Dónde viven? Cada respuesta es un punto en el mapa.','Elegí tu localidad (nunca tu dirección) y si tenés auto.','Esperá a que se llene el mapa.']},
  {id:'match',act:2,opts:['fill','skip','names'],skippable:true,label:'Match',secs:20,view:'slide',steps:3,auto:[1.6,8],slide:{type:'match'},
   proj:'HAY MATCH: entra un auto con su conductor y sus vecinos; después llegan los demás de a uno y la cámara se aleja. Si alguien suma su respuesta, camina hasta un auto y se sube.',cel:'No cambia: se ve solo en el proyector.',
   notes:['HAY MATCH.','Alguien con auto y vecinos que lo necesitan.','Y llegan más autos. Si alguien responde ahora, se suma al que le queda cerca.']},
  {id:'red',act:2,opts:['names','fit','fill'],label:'Tu red',secs:30,view:'map',steps:4,auto:[2.5,4,3.5],hint:['Así llegarían juntos a su sede','Cada raíz es un camino real. Cuanto más gruesa, más gente pasa por ahí'],
   proj:'Puntos → raíces hacia la sede → grupos de colores y números → CO₂.',cel:'Tu red: quién vive cerca de vos y cómo podrían volver juntos.',
   notes:['Cada punto es una persona de esta sala.','Cada raíz es el camino real hasta la sede; donde se juntan, engorda.','Los círculos son grupos posibles: alguien maneja y los lleva.','Y esto es lo que se evita. Es un máximo: no descuenta el desvío del conductor.']},
  {id:'cierre',act:2,label:'Cierre',secs:15,view:'slide',steps:2,
   slide:{type:'logo',pre:'',word:'ConVos',tag:'Volver juntos.'},
   phone:{text:'Gracias'},proj:'ConVos. Volver juntos.',cel:'Gracias, con tu camino de vuelta.',
   notes:['Menos tiempo, menos plata, menos contaminación.','Volver juntos. Gracias.']}
];
