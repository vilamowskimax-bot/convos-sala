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
window.CONVOS_AUTO=1.5;         // segundos entre parte y parte de una diapositiva, si no dice otra cosa
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
  {id:'problema',act:1,label:'Problema',secs:20,view:'slide',steps:2,auto:3,
   slide:{type:'converge',kicker:'El problema',t1:'Todos vamos al mismo lugar.',t2:'Cada uno por su cuenta.',dest:'ITBA'},
   phone:{text:'Mirá la pantalla'},proj:'Autos con una persona que llegan todos al ITBA. Después, la segunda frase.',cel:'Mensaje de compañía.',
   notes:['Todos los días hacemos el mismo viaje al ITBA, cada uno en su auto o en dos colectivos.','Cada uno por su cuenta: contaminación, tránsito, plata, y no nos conocemos.']},
  {id:'autos',act:1,label:'Autos',secs:30,view:'slide',steps:3,auto:[3,4],
   slide:{type:'cars',kicker:'Hoy',n:12,per:4,t1:'Un auto, una persona.',t2:'Un auto, cuatro personas.',cap:'Cada auto que entra o sale de la Ciudad lleva, en promedio, 1,3 personas.',src:'GCBA, Partición modal 2026 (base ENMODO 2018)'},
   phone:{text:'Un auto, una persona'},proj:'Doce autos con una persona. Al final se juntan en tres.',cel:'Mensaje de compañía.',
   notes:['Mirá cuántos autos y cuánta gente adentro.','1,3 personas por auto: casi siempre va uno solo, con más de tres asientos vacíos. (Los que entran desde la Provincia llevan 1,38; los que salen de la Ciudad, 1,21.) Y 1 de cada 3 viajes del AMBA se hace en auto particular.','¿Y si esa misma gente viajara junta?']},
  {id:'tiempo',act:1,label:'Tiempo',secs:25,view:'slide',steps:2,auto:1.2,
   slide:{type:'bars',kicker:'El viaje',title:'Cuánto dura un viaje en el AMBA',rows:[{l:'Promedio',w:31,v:'34 min'},{l:'Con 2 medios',w:70,v:'77 min'},{l:'Con 3 medios',w:100,v:'109 min'}],src:'Encuesta de Movilidad Domiciliaria (ENMODO) 2018'},
   phone:{text:'¿Y en tu caso?'},proj:'Un gráfico de barras que se dibuja.',cel:'Mensaje de compañía.',
   notes:['Un viaje en el AMBA dura 34 minutos en promedio.','Si combinás dos medios, 77; con tres, casi dos horas. (Cuenta todos los motivos de viaje.) Solo para ir a trabajar: 1 h 35 min por día, ida y vuelta, en el Gran Buenos Aires, el máximo del país (INDEC, ENUT 2021).']},
  {id:'planeta',act:1,label:'Planeta',secs:20,view:'slide',steps:2,auto:1,
   slide:{type:'stat',kicker:'Emisiones',n:'31%',cap:'de los gases de efecto invernadero de la Ciudad sale del transporte.',src:'Inventario de GEI de la Ciudad de Buenos Aires, 2023'},
   phone:{text:'Mirá la pantalla'},proj:'Un número grande.',cel:'Mensaje de compañía.',
   notes:['Casi un tercio de los gases de la Ciudad sale del transporte, y casi todo de lo que va por la calle.','En todo el país, el transporte por carretera es el 12,5% (2022). Cada auto menos cuenta.']},
  {id:'existe',act:1,label:'Qué existe',secs:25,view:'slide',steps:3,auto:[1.2,4],
   slide:{type:'list',kicker:'Lo que ya existe',title:'No somos los primeros.',rows:[{l:'Tenés Lugar',v:'Red de 12 empresas en 2018. Hoy no está en línea.'},{l:'Waze Carpool',v:'Cerró en 2022, cuando bajaron los viajes al trabajo.'},{l:'BlaBlaCar',v:'En 2026 negocia vender su negocio de viajes al trabajo.'}],end:'Lo difícil es encontrar con quién. Dentro de una comunidad cerrada, 20 o 30 personas alcanzan.',src:'Parabrisas, 2018 · Waze vía 9to5Google, 2022 · Journal de l’Automobile, 2026 · Mühlethaler, STRC 2012'},
   phone:{text:'¿Usaste alguna?'},proj:'Tres intentos anteriores, uno abajo del otro, y al final lo que aprendimos.',cel:'Mensaje de compañía.',
   notes:['Esto ya se intentó.','Tenés Lugar, de Mercedes-Benz, arrancó en 2013 y en 2018 sumaba 12 empresas. Nunca publicó cuántos viajes se hicieron (el comunicado de 2017 habla de "7.000 usuarios beneficiados", sin decir cuántos viajaban) y no sabemos si sigue. Waze cerró su carpooling en 2022. BlaBlaCar está vendiendo su negocio de viajes al trabajo. (Si preguntan: Carpoolear + hizo algo parecido para organizaciones en Córdoba en 2019.)','El problema no son las ganas: es encontrar con quién. En un programa abierto de San Mateo (EE. UU.), aun pagando 2 dólares por viaje, solo 1 de cada 7 inscriptos compartió algún viaje en el mes (2018). En una ciudad abierta hacen falta decenas de miles; dentro de una comunidad cerrada, como una facultad o una empresa, 20 o 30 con el mismo destino y horario. Por eso ConVos es cerrada.']},
  {id:'escuchar',act:1,label:'Entrevistas',secs:35,view:'slide',steps:5,auto:1.5,draft:true,
   slide:{type:'people',kicker:'Antes de diseñar nada',title:'Salimos a escuchar',people:[
     {n:'Entrevistado 1',r:'[cargo · organización]',q:'[qué nos validó o qué nos advirtió, en una frase]'},
     {n:'Entrevistado 2',r:'[cargo · organización]',q:'[qué nos validó o qué nos advirtió, en una frase]'},
     {n:'Entrevistado 3',r:'[cargo · organización]',q:'[qué nos validó o qué nos advirtió, en una frase]'},
     {n:'Entrevistado 4',r:'[cargo · organización]',q:'[qué nos validó o qué nos advirtió, en una frase]'}]},
   phone:{text:'Mirá la pantalla'},proj:'El título y, de a uno, cuatro tarjetas: nombre, cargo y su frase.',cel:'Mensaje de compañía.',
   notes:['Antes de diseñar nada, salimos a escuchar. Los entrevistados aparecen de a uno.','Entrevistado 1: qué nos validó o qué nos advirtió.','Entrevistado 2: una frase.','Entrevistado 3: una frase.','Entrevistado 4: una frase.']},
  {id:'encuesta',act:1,label:'Encuesta',secs:40,view:'slide',steps:4,auto:[4,3,'La frase final'],
   slide:{type:'survey',kicker:'Encuesta a estudiantes del ITBA',title:'Lo que nos dijeron',n:28,
     q1:{q:'¿Qué te frena a compartir el viaje?',opts:[{l:'Perder flexibilidad de horarios',k:19,c:'hot'},{l:'Desviarme o esperar a otros',k:14,c:'hot'},{l:'No sentirme seguro/a',k:10,c:'cool'}],leg:'= 1 estudiante'},
     q2:{q:'¿Qué te daría confianza para viajar con alguien?',opts:[{l:'Que sea de mi carrera o año',k:22,c:'hot'},{l:'Conocerlo antes en la facu',k:21,c:'hot2'},{l:'Que sea de mi mismo género',k:3,c:'cool'}]},
     punch:'No es miedo: *es rigidez.*\nY la confianza *la da la comunidad.*',src:'Encuesta propia a estudiantes del ITBA, octubre 2026 (28 respuestas, muestra no aleatoria)'},
   phone:{text:'Mirá la pantalla'},proj:'Las dos preguntas; después se llenan solos los muñequitos y los anillos. La frase final sale con otro Siguiente.',cel:'Mensaje de compañía.',
   notes:['Apenas aparece, preguntá: «¿Qué creen que frena más: el miedo o los horarios?»','Se llenan los muñequitos: la flexibilidad le gana a la seguridad.','Los anillos: misma carrera y conocerse antes, contra mismo género.','Tocá Siguiente para la frase final: no es miedo, es rigidez. «Y la confianza la da la comunidad.» (Si preguntan: son los mismos motivos por los que fallaron otros programas; en Wellington, el 44% de los que abandonaron habló de falta de flexibilidad. La muestra no es aleatoria ni está abierta por sexo y edad.)']},
  {id:'solucion',act:1,label:'La solución',secs:20,view:'slide',steps:2,auto:4,
   slide:{type:'reveal',q:'Apps para compartir el auto hay muchas.',sub:'Ninguna se volvió costumbre.',word:'ConVos',tag:'Comunidad ITBA',line:'No inventamos el carpooling. Lo diseñamos para que se adopte.',next:'Cómo funciona →'},
   phone:{text:'ConVos'},proj:'La frase, y después el logo que se dibuja: ConVos, Comunidad ITBA.',cel:'ConVos.',
   notes:['Las apps existen (ya vimos que Waze Carpool cerró). Ninguna se volvió costumbre.','Se revela ConVos. Pasar a la demo.']},

  /* ============ ACTO 2 · LA SOLUCIÓN ============ */
  /* Sin grupos fijos: cada uno publica su viaje el día anterior (decisión del informe, por el 68% de la encuesta) */
  {id:'como',act:2,label:'Cómo funciona',secs:20,view:'slide',steps:3,auto:1.5,
   slide:{type:'how',kicker:'Cómo funciona',title:'Tres pasos. *Todos los días.*',
     items:[{i:'cal',t:'Publicás tu viaje',d:'El día anterior: a qué sede vas y a qué hora.'},
            {i:'ppl',t:'Elegís con quién',d:'La app te muestra quién del ITBA va para tu lado, a la misma hora.'},
            {i:'car',t:'Viajan juntos',d:'Comparten la nafta. Y al otro día, elegís de nuevo.'}]},
   phone:{text:'Así de simple',sub:'Publicás tu viaje, elegís con quién y viajan juntos.'},proj:'Los tres pasos, que aparecen de a uno.',cel:'Mensaje de compañía.',
   notes:['Publicás tu viaje el día anterior: a qué sede vas y a qué hora.','La app te muestra quién del ITBA va para tu lado. Vos elegís con quién.','Viajan juntos y comparten la nafta. No hay grupos fijos: cada día se elige de nuevo.']},
  {id:'porque',act:2,label:'Por qué esta sí',secs:25,view:'slide',steps:3,auto:2,
   slide:{type:'answers',kicker:'Lo que nos dijeron, resuelto',title:'Cada miedo, *una respuesta.*',
     rows:[{p:'68%',f:'teme perder flexibilidad',t:'Sin grupos fijos',d:'Cada día decidís si viajás y con quién.'},
           {p:'50%',f:'teme desviarse o esperar',t:'Un mismo destino',d:'Todos van a las dos sedes del ITBA: más coincidencias, menos desvío.'},
           {p:'36%',f:'no se siente seguro/a',t:'Solo gente del ITBA',d:'Cuentas verificadas. El 79% confiaría en alguien de su carrera o año.'}],
     src:'Encuesta propia a estudiantes del ITBA, octubre 2026 (28 respuestas, muestra no aleatoria)'},
   phone:{text:'Lo pensamos con ustedes',sub:'Cada miedo de la encuesta tiene su respuesta.'},proj:'Los tres miedos de la encuesta, cada uno con su respuesta.',cel:'Mensaje de compañía.',
   notes:['Volvemos a la encuesta: el 68% teme perder flexibilidad, por eso no hay grupos fijos.','El 50% teme desviarse o esperar: todos van a las mismas dos sedes, así hay más coincidencias y menos desvío.','El 36% no se siente seguro: solo entra gente verificada del ITBA. La confianza la da la comunidad. Ahora, la app.']},
  {id:'inicio',act:2,opts:['qr'],label:'Inicio',secs:10,view:'app',tab:'Inicio',
   desc:'Tu próximo viaje de un vistazo. Todo empieza acá.',tryit:'Tocá “Ver quién va cerca”',
   proj:'La app y sus 4 pestañas, con la actual resaltada.',cel:'La misma pestaña, lista para tocar.',
   notes:['Esta es ConVos. Cuatro pestañas: Inicio, Cerca mío, Mis viajes y Perfil.','Todos ya la tienen en el celular: pedí que la toquen.']},
  {id:'cerca',act:2,label:'Cerca mío',secs:15,view:'app',tab:'Cerca mío',
   desc:'Un mapa real con la gente de la empresa que hace tu mismo camino, y por qué aparece cada uno.',tryit:'Tocá un perfil en el mapa',
   proj:'La pantalla “Cerca mío”, ampliada.',cel:'Cerca mío, para tocar los perfiles.',
   notes:['Un mapa real con compañeros que hacen tu camino.','Cada uno dice por qué aparece: distancia, horario y quién maneja.']},
  {id:'swipe',act:2,label:'Swipe',secs:10,view:'app',tab:'Cerca mío',sub:'Deslizar perfiles',
   desc:'Deslizá perfiles: a la derecha si te interesa. Si es mutuo, se arma el viaje.',tryit:'Deslizá una tarjeta',
   proj:'El mazo de perfiles, ampliado.',cel:'El mazo para deslizar.',
   notes:['Derecha si te interesa, izquierda si no.','Si es mutuo, se arma el viaje. Solo gente de la empresa.']},
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
  {id:'red',act:2,opts:['names','fit','fill'],label:'Tu red',secs:30,view:'map',steps:4,auto:[2.5,4,3.5],hint:['Así llegarían juntos a la sede','Cada raíz es un camino real. Cuanto más gruesa, más gente pasa por ahí'],
   proj:'Puntos → raíces hacia la sede → grupos de colores y números → CO₂.',cel:'Tu red: quién vive cerca de vos y cómo podrían volver juntos.',
   notes:['Cada punto es una persona de esta sala.','Cada raíz es el camino real hasta la sede; donde se juntan, engorda.','Los círculos son grupos posibles: alguien maneja y los lleva.','Y esto es lo que se evita. Es un máximo: no descuenta el desvío del conductor.']},
  {id:'organizacion',act:2,label:'Para la organización',secs:20,view:'slide',steps:3,auto:[1.2,4],
   slide:{type:'list',kicker:'Para la organización',title:'Lo que funciona ya está estudiado.',
     rows:[{l:'Lugar preferencial',v:'Estacionamiento para quien comparte y emparejamiento interno: hasta 20% más de carpooling.'},
           {l:'Vuelta garantizada',v:'Si el viaje falla, la vuelta está cubierta. Casi no se usa y es barata: saca una objeción.'},
           {l:'Que la impulse',v:'Los programas organizados por la institución pesan más que las ganas de ahorrar.'}],
     end:'Y la organización ve el resultado. Sin nombres.',src:'EPA, 2005 · Menczer, 2007 · Neoh, Chipulu y Marshall, 2017'},
   phone:{text:'Mirá la pantalla'},proj:'Tres cosas medidas que hacen funcionar el carpooling en una organización; al final, el pase al panel.',cel:'Mensaje de compañía.',
   notes:['Para que funcione, la organización tiene que estar adentro.','Lugar preferencial, vuelta garantizada y que la institución lo impulse: está medido (EPA, Menczer, Neoh).','Y la organización ve el resultado, sin nombres.']},
  {id:'empresa',act:2,opts:['fill'],label:'Empresa',secs:15,view:'map',hint:['Lo que ve la organización','Zonas, no personas. Siempre agregado, sin nombres'],
   proj:'Burbujas por zona y números. Sin nombres.',cel:'El panel de la empresa, para recorrer.',
   notes:['Lo que ve la empresa: zonas, no personas.','Cuánta gente comparte, autos menos y CO₂ evitado.']},
  {id:'cierre',act:2,label:'Cierre',secs:15,view:'slide',steps:2,auto:1.5,
   slide:{type:'logo',pre:'',word:'ConVos',tag:'Volver juntos.'},
   phone:{text:'Gracias'},proj:'ConVos. Volver juntos.',cel:'Gracias, con tu camino de vuelta.',
   notes:['Menos tiempo, menos plata, menos contaminación.','Volver juntos. Gracias.']}
];
