from pathlib import Path
import re


BASE = Path(r"C:\Users\ivan.iencinella\Documents\workspaces\fosforo\src\apps\portal\src\content\apps-catalog")


PHASE_DEFAULTS = {
    "agenda-comunitaria.md": "Fase 3 - Comunidad",
    "biblia.md": "Fase 1 - Fundación",
    "biblioteca-vaticano.md": "Fase 5 - Expansion",
    "bibliotecario-ia.md": "Fase 5 - Expansion",
    "buscador.md": "Fase 4 - Extendido",
    "calendario-de-adviento.md": "Fase 5 - Expansion",
    "calendario-de-cuaresma.md": "Fase 5 - Expansion",
    "calendario-liturgico.md": "Fase 1 - Fundación",
    "cancionero.md": "Fase 3 - Comunidad",
    "carisma.md": "Fase 3 - Comunidad",
    "chatbot.md": "Fase 4 - Extendido",
    "confesiones.md": "Fase 3 - Comunidad",
    "emprendedor.md": "Fase 4 - Extendido",
    "espiritualidad-diaria.md": "Fase 1 - Fundación",
    "historia-de-mi-iglesia.md": "Fase 3 - Comunidad",
    "horarios-de-misas.md": "Fase 2 - Esencial",
    "lectio-divina.md": "Fase 2 - Esencial",
    "meditvoz.md": "Fase 4 - Extendido",
    "misal.md": "Fase 2 - Esencial",
    "motus.md": "Fase 5 - Expansion",
    "newsletter.md": "Fase 3 - Comunidad",
    "oraciones.md": "Fase 2 - Esencial",
    "peticionario.md": "Fase 3 - Comunidad",
    "santopedia.md": "Fase 2 - Esencial",
    "servicio-sacerdotal-al-difunto.md": "Fase 3 - Comunidad",
    "servicios-pastorales.md": "Fase 3 - Comunidad",
    "vida-de-misionero.md": "Fase 1 - Fundación",
    "visita-7-iglesias.md": "Fase 2 - Esencial",
    "voluntariado.md": "Fase 3 - Comunidad",
}


CONTENT = {
    "agenda-comunitaria.md": {
        "resume": "Calendario comúnitario para enterarte de actividades, encuentros y eventos importantes.",
        "intro": [
            "Agenda Comunitaria reune en un solo lugar las actividades de la parroquia, los grupos, los movimientos y las propuestas abiertas de la comúnidad.",
            "La idea es que cualquier persona pueda saber que esta pasando, cuando ocurre y como sumarse, sin depender de cadenas de mensajes o avisos dispersos.",
        ],
        "purpose": "Sirve para mantenerte cerca de la vida comunitaria y ayudarte a organizar tu participación con tiempo y claridad.",
        "audience": [
            "personas que quieren enterarse de eventos y encuentros",
            "grupos parroquiales y comúnidades que organizan actividades",
            "servidores o coordinadores que necesitan una agenda común",
        ],
        "actions": [
            "ver actividades en calendario o listado",
            "filtrar por tipo de evento, comúnidad o fecha",
            "consultar lugar, horario, responsable y detalles de cada propuesta",
            "descubrir encuentros abiertos a toda la comúnidad",
        ],
        "relationships": [
            "Puede complementarse con Newsletter para enviar recordatorios o novedades importantes.",
            "Tambien ayuda a que otras apps del ecosistema puedan mostrar actividades relaciónadas con su tematica.",
        ],
    },
    "biblia.md": {
        "resume": "Lectura sencilla de la Biblia con búsqueda, favoritos y acceso rápido a las lecturas del día.",
        "intro": [
            "Biblia esta pensada para acercar la Palabra de Dios de una manera simple, ordenada y accesible para cualquier persona.",
            "No busca reemplazar la experiencia de la lectura orante, sino acompanarla con una herramienta clara para leer, buscar y volver facilmente a los pasajes importantes.",
        ],
        "purpose": "Sirve para leer la Escritura en cualquier momento, encontrar rapidamente un pasaje y seguir las lecturas que acompanian la vida liturgica de cada día.",
        "audience": [
            "personas que quieren leer la Biblia con mas frecuencia",
            "quienes buscan el Evangelio o las lecturas del día",
            "usuarios que rezan, estudian o preparan encuentros de formación",
        ],
        "actions": [
            "leer por libro, capitulo y versiculo",
            "buscar palabras, temas o citas puntuales",
            "guardar pasajes favoritos o personales de referencia",
            "seguir el Evangelio y las lecturas propuestas para cada jornada",
        ],
        "relationships": [
            "Se conecta con Calendario Liturgico para mostrar las lecturas correspondientes de cada día.",
            "Tambien nutre otras experiencias del ecosistema, como Lectio Divina y algunos recorridos de Formación.",
        ],
    },
    "biblioteca-vaticano.md": {
        "resume": "Acceso guiado a documentos, textos y materiales valiosos de la tradicion de la Iglesia.",
        "intro": [
            "Biblioteca Vaticano quiere acercar al usuario común una seleccion cuidada de documentos y textos de gran valor para la vida de la Iglesia.",
            "La meta no es abrumar con material academico, sino abrir una puerta amigable a fuentes importantes para estudiar, rezar y profundizar.",
        ],
        "purpose": "Sirve para descubrir documentos significativos, comprender mejor la historia de la Iglesia y consultar materiales que normalmente resultan lejanos o dificiles de encontrar.",
        "audience": [
            "personas interesadas en la historia y el pensamiento de la Iglesia",
            "usuarios en procesos de estudio o formación",
            "quienes quieren explorar documentos confiables de referencia",
        ],
        "actions": [
            "explorar documentos seleccionados",
            "leer textos historicos y magisteriales",
            "buscar materiales por tema o interes",
            "usar recursos para acompañar estudio personal o comúnitario",
        ],
        "relationships": [
            "Puede complementar recorridos de Formación y consultas dentro del ecosistema cuando se necesiten fuentes de referencia mas profundas.",
        ],
    },
    "bibliotecario-ia.md": {
        "resume": "Asistente inteligente para orientarte entre contenidos, recursos y aplicaciónes del ecosistema.",
        "intro": [
            "Bibliotecario IA esta pensado como un acompanante digital que te ayuda a encontrar contenido util sin perderte entre tantas opciones.",
            "En lugar de obligarte a saber de antemano que app necesitas, busca orientarte, sugerirte caminos y mostrarte recursos relevantes segun lo que estas buscando.",
        ],
        "purpose": "Sirve para que el ecosistema se sienta mas cercano y facil de recorrer, especialmente para quienes recien llegan o no saben por donde empezar.",
        "audience": [
            "usuarios nuevos del ecosistema",
            "personas que buscan contenido puntual y no saben en que app esta",
            "quienes quieren recomendaciónes segun sus intereses",
        ],
        "actions": [
            "hacer preguntas en lenguaje simple",
            "recibir sugerencias personalizadas",
            "obtener recomendaciónes de lectura, oración o formación",
            "encontrar mas rápido la aplicación o contenido adecuado",
        ],
        "relationships": [
            "Su valor principal es transversal: ayuda a recorrer y conectar las distintas apps del ecosistema desde un solo punto de entrada.",
        ],
    },
    "buscador.md": {
        "resume": "Búsqueda unificada para encontrar contenido en distintas aplicaciónes desde un solo lugar.",
        "intro": [
            "Buscador quiere resolver una necesidad muy concreta: saber donde esta aquello que una persona necesita sin obligarla a entrar una por una en cada app.",
            "La experiencia apunta a que escribir una palabra, una cita o un tema alcance para descubrir resultados utiles dentro del ecosistema.",
        ],
        "purpose": "Sirve para ahorrar tiempo, ordenar la exploración del contenido y hacer mas facil el descubrimiento de recursos que hoy pueden estar repartidos en varias aplicaciónes.",
        "audience": [
            "personas que quieren encontrar algo rápido",
            "usuarios que no saben cual app consultar",
            "quienes buscan un punto de acceso unico al contenido",
        ],
        "actions": [
            "buscar desde una sola barra",
            "ver resultados agrupados por tema o tipo de contenido",
            "entrar directamente a la app donde esta el resultado",
            "explorar recursos relaciónados con lo que acabas de buscar",
        ],
        "relationships": [
            "Puede reunir resultados de apps como Biblia, Cancionero, Santopedia, Formación e Historia de mi Iglesia.",
            "Su funcion dentro del ecosistema es actuar como puente entre aplicaciónes y no como catalogo aislado.",
        ],
    },
    "calendario-de-adviento.md": {
        "resume": "Compañía diaria para vivir el Adviento con oraciones, reflexiones y propuestas para el hogar.",
        "intro": [
            "Calendario de Adviento esta pensado para ayudar a vivir este tiempo con sentido, paso a paso y día por día.",
            "Busca ofrecer pequeñas ayudas concretas para preparar el corazon antes de Navidad, tanto en lo personal como en familia.",
        ],
        "purpose": "Sirve para convertir el Adviento en un camino cotidiano de preparación, esperanza y encuentro con Cristo.",
        "audience": [
            "familias que quieren vivir el Adviento juntas",
            "personas que buscan una propuesta espiritual diaria",
            "usuarios que desean acompanamiento sencillo durante este tiempo",
        ],
        "actions": [
            "abrir una propuesta distinta para cada día",
            "leer reflexiones breves y faciles de compartir",
            "usar oraciones y gestos concretos para el hogar",
            "recibir recordatorios para no perder el ritmo del camino",
        ],
        "relationships": [
            "Puede convivir con otras apps del ecosistema para enriquecer el tiempo liturgico con recursos complementarios.",
        ],
    },
    "calendario-de-cuaresma.md": {
        "resume": "Acompanamiento diario para vivir la Cuaresma con oración, ayuno y obras concretas.",
        "intro": [
            "Calendario de Cuaresma busca transformar este tiempo en un camino claro, cercano y posible para la vida cotidiana.",
            "En vez de ofrecer solo fechas, quiere proponer pequenos pasos diarios que ayuden a rezar mas, revisar la vida y abrirse a la caridad.",
        ],
        "purpose": "Sirve para acompañar la conversion personal durante la Cuaresma con propuestas simples, profundas y aplicables al día a día.",
        "audience": [
            "personas que quieren vivir mejor la Cuaresma",
            "familias que buscan una guia común",
            "usuarios que desean ideas concretas para este tiempo liturgico",
        ],
        "actions": [
            "seguir una reflexion diaria",
            "encontrar propuestas de oración y silencio",
            "recibir ideas para ayuno y caridad",
            "acompañar el tiempo liturgico con contenido para toda la familia",
        ],
        "relationships": [
            "Puede nutrirse del resto del ecosistema con lecturas, oraciones y materiales que ayuden a vivir cada jornada con mas profundidad.",
        ],
    },
    "calendario-liturgico.md": {
        "resume": "Referencia diaria para conocer celebraciónes, santo del día, tiempo liturgico y lecturas.",
        "intro": [
            "Calendario Liturgico es una de las piezas centrales del ecosistema porque ayuda a entender que celebra la Iglesia en cada día del ano.",
            "Su objetivo es volver comprensible algo que a veces se percibe lejano o dificil: el ritmo liturgico que organiza la vida de la fe.",
        ],
        "purpose": "Sirve para ubicarte en el tiempo liturgico, conocer la celebración del día y acceder rapidamente a la información que acompana esa jornada.",
        "audience": [
            "personas que quieren saber que celebra la Iglesia hoy",
            "usuarios que siguen las lecturas diarias",
            "comúnidades que preparan encuentros, cantos o celebraciónes",
        ],
        "actions": [
            "ver el tiempo liturgico y el color del día",
            "consultar santo o celebración principal",
            "seguir las lecturas y referencias de la jornada",
            "recorrer el calendario por fechas y temporadas",
        ],
        "relationships": [
            "Acompana y alimenta a otras apps del ecosistema como Biblia, Lectio Divina, Misal, Cancionero y Horarios de Misas.",
            "Tambien puede enlazar con Santopedia para ampliar información sobre santos y celebraciónes.",
        ],
    },
    "cancionero.md": {
        "resume": "Repertorio de cantos para celebraciónes, con letras, acordes y sugerencias segun el momento liturgico.",
        "intro": [
            "Cancionero nace para ayudar a que comúnidades, coros y servidores de la musica tengan un lugar común donde encontrar cantos adecuados para cada celebración.",
            "Mas que una simple lista de canciones, busca convertirse en un punto de encuentro que facilite compartir repertorio, ordenar materiales y cuidar mejor lo que se canta.",
        ],
        "purpose": "Sirve para preparar celebraciónes con mayor claridad, encontrar cantos apropiados y contar con materiales utiles para ensayar o acompañar la liturgia.",
        "audience": [
            "coros y ministerios de musica",
            "personas que preparan la liturgia",
            "comúnidades que necesitan un repertorio claro y facil de consultar",
        ],
        "actions": [
            "buscar cantos por nombre o tema",
            "leer letras y acordes en un formato comodo",
            "filtrar por momento de la Misa o tiempo liturgico",
            "armar listas de cantos para una celebración concreta",
        ],
        "relationships": [
            "Se apoya en Calendario Liturgico para sugerir repertorios segun el tiempo del ano.",
            "Tambien puede aparecer dentro de Buscador para facilitar el acceso desde otros recorridos del ecosistema.",
        ],
    },
    "carisma.md": {
        "resume": "Guia para descubrir movimientos, comúnidades y distintas formas de vivir la fe en la Iglesia.",
        "intro": [
            "Carisma esta pensado para acercar a las personas a la riqueza de comúnidades, movimientos y espiritualidades que conviven dentro de la Iglesia.",
            "La aplicación quiere ayudar a descubrir que no todas las personas viven su camino del mismo modo, y que esa diversidad tambien es un don.",
        ],
        "purpose": "Sirve para explorar distintos carismas, conocer mejor su identidad y encontrar espacios donde cada persona pueda sentirse llamada y acompanada.",
        "audience": [
            "personas que buscan una comúnidad o movimiento",
            "usuarios que quieren conocer distintas espiritualidades",
            "quienes desean ubicarse mejor dentro de la vida eclesial",
        ],
        "actions": [
            "descubrir comúnidades y movimientos",
            "leer una descripcion sencilla de cada carisma",
            "saber donde esta presente o como contactarlo",
            "comparar propuestas segun intereses o búsqueda personal",
        ],
        "relationships": [
            "Puede enriquecer otras experiencias comúnitarias del ecosistema ayudando a conectar personas con grupos concretos.",
        ],
    },
    "chatbot.md": {
        "resume": "Asistente conversaciónal para resolver dudas y ayudarte a encontrar recursos dentro del ecosistema.",
        "intro": [
            "Chatbot esta pensado para ofrecer una ayuda rapida y cercana cuando una persona necesita orientación, no sabe por donde empezar o tiene una duda puntual.",
            "La experiencia busca sentirse simple: preguntar como si hablaras con alguien que conoce el ecosistema y puede guiarte.",
        ],
        "purpose": "Sirve para resolver preguntas frecuentes, orientar al usuario y facilitar el acceso a recursos o aplicaciónes relaciónadas con su consulta.",
        "audience": [
            "usuarios que quieren respuestas rapidas",
            "personas que necesitan orientación inicial",
            "quienes prefieren una experiencia conversaciónal",
        ],
        "actions": [
            "hacer preguntas en lenguaje natural",
            "recibir respuestas claras y breves",
            "obtener sugerencias de contenido o apps",
            "usar la conversación como punto de entrada al ecosistema",
        ],
        "relationships": [
            "Puede actuar como puerta de acceso a varias apps del ecosistema segun la necesidad concreta del usuario.",
        ],
    },
    "confesiones.md": {
        "resume": "Ayuda para encontrar horarios de confesion y prepararte con serenidad para el sacramento.",
        "intro": [
            "Confesiones esta pensada para acompañar a quienes desean acercarse al sacramento de la reconciliación con mas paz y claridad.",
            "Busca unir dos necesidades muy concretas: saber donde y cuando confesarse, y contar con una guia sencilla para prepararse interiormente.",
        ],
        "purpose": "Sirve para facilitar el acceso al sacramento y quitar obstaculos practicos o personales que muchas veces postergan ese encuentro.",
        "audience": [
            "personas que quieren volver a confesarse",
            "usuarios que necesitan orientación previa",
            "quienes buscan horarios o lugares cercanos",
        ],
        "actions": [
            "buscar iglesias o lugares donde confesarse",
            "consultar horarios disponibles",
            "seguir una guia breve de preparación",
            "leer oraciones y ayudas para revisar la propia vida",
        ],
        "relationships": [
            "Puede vincularse naturalmente con Horarios de Misas para mostrar información complementaria en una misma iglesia.",
            "Tambien puede sugerir contenidos de Oraciones para acompañar la preparación y el agradecimiento.",
        ],
    },
    "emprendedor.md": {
        "resume": "Espacio para descubrir, apoyar y comprar productos o servicios de emprendedores católicos.",
        "intro": [
            "Emprendedor quiere abrir un espacio donde proyectos, oficios y propuestas impulsadas por emprendedores católicos puedan darse a conocer de manera clara y confiable.",
            "La idea es facilitar el encuentro entre quienes ofrecen y quienes desean apoyar iniciativas con identidad y valores compartidos.",
        ],
        "purpose": "Sirve para visibilizar emprendimientos, acercar productos y servicios a la comúnidad, y favorecer una economia mas conectada con la vida del ecosistema.",
        "audience": [
            "emprendedores que desean mostrar lo que hacen",
            "personas interesadas en productos o servicios con identidad catolica",
            "usuarios que buscan apoyar proyectos de la comúnidad",
        ],
        "actions": [
            "recorrer perfiles de emprendedores",
            "explorar un catalogo de productos o servicios",
            "ver detalles, fotos y precios",
            "avanzar en un proceso de compra sencillo y claro",
        ],
        "relationships": [
            "Funcionaria como una propuesta propia, pero conectada desde el portal Fósforo para ganar visibilidad dentro del ecosistema.",
        ],
    },
    "espiritualidad-diaria.md": {
        "resume": "Contenido breve para alimentar cada día la oración, la reflexion y el crecimiento interior.",
        "intro": [
            "Espiritualidad Diaria busca ofrecer pequeñas ayudas cotidianas para sostener la vida espiritual de forma sencilla y constante.",
            "No esta pensada solo para grandes momentos, sino para el día a día: unos minutos de lectura, una frase, una reflexion o una invitación a rezar.",
        ],
        "purpose": "Sirve para que cada jornada tenga un pequeno punto de apoyo espiritual, incluso en ritmos de vida cargados o dispersos.",
        "audience": [
            "personas que desean una rutina espiritual diaria",
            "usuarios que buscan mensajes breves y significativos",
            "quienes quieren acompanamiento simple y constante",
        ],
        "actions": [
            "leer reflexiones diarias",
            "encontrar frases o ensenanzas inspiradoras",
            "seguir contenidos relaciónados con el tiempo liturgico",
            "recibir recordatorios para volver cada día",
        ],
        "relationships": [
            "Puede enriquecerse con contenidos de Biblia, Santopedia o Calendario Liturgico para acompañar mejor cada jornada.",
        ],
    },
    "historia-de-mi-iglesia.md": {
        "resume": "Espacio para conocer la historia, memoria y vida de una comúnidad local de fe.",
        "intro": [
            "Historia de mi Iglesia quiere ayudar a que una comúnidad no pierda su memoria y pueda compartirla con nuevas generaciónes, visitantes y miembros actuales.",
            "La aplicación busca hacer visible aquello que muchas veces queda disperso en recuerdos, fotos, testimonios o documentos guardados.",
        ],
        "purpose": "Sirve para contar la historia viva de una parroquia o comúnidad, fortalecer el sentido de pertenencia y conservar un patrimonio que tambien evangeliza.",
        "audience": [
            "parroquias y comúnidades que quieren preservar su historia",
            "personas interesadas en conocer su Iglesia local",
            "visitantes que desean entender mejor el lugar que visitan",
        ],
        "actions": [
            "leer relatos e hitos importantes",
            "recorrer galerias de fotos y recuerdos",
            "seguir una linea de tiempo de la comúnidad",
            "conocer testimonios y momentos significativos",
        ],
        "relationships": [
            "Puede integrarse con Buscador para que los contenidos historicos aparezcan junto con otros recursos del ecosistema.",
        ],
    },
    "horarios-de-misas.md": {
        "resume": "Buscador de horarios de Misa para encontrar una celebración cerca tuyo o en la fecha que necesites.",
        "intro": [
            "Horarios de Misas esta pensada para resolver una necesidad muy concreta y cotidiana: encontrar facilmente una celebración cuando la necesitas.",
            "Ya sea en tu ciudad, cerca de donde estas o en una fecha especial, la propuesta apunta a darte información clara para que llegar a la Misa sea mas simple.",
        ],
        "purpose": "Sirve para acercar a las personas a la celebración, reducir la desinformación y facilitar la participación, especialmente cuando no se conoce una zona o parroquia.",
        "audience": [
            "personas que buscan una Misa cercana",
            "viajeros o usuarios fuera de su parroquia habitual",
            "quienes necesitan horarios para celebraciónes especiales",
        ],
        "actions": [
            "buscar por iglesia, ciudad o cercania",
            "filtrar por día o tipo de celebración",
            "ver ubicaciónes de templos de forma clara",
            "encontrar rapidamente la opcion que mejor se adapte a tu necesidad",
        ],
        "relationships": [
            "Puede apoyarse en Calendario Liturgico para destacar fechas especiales o celebraciónes particulares.",
            "Tambien puede enlazar con Confesiones cuando un mismo lugar ofrezca ambos servicios.",
        ],
    },
    "lectio-divina.md": {
        "resume": "Guia diaria para rezar con la Palabra a traves de un recorrido simple y acompasado.",
        "intro": [
            "Lectio Divina esta pensada para ayudar a rezar con la Biblia de una forma guiada, serena y profunda.",
            "La propuesta quiere acercar una practica tradicional de la Iglesia a personas que tal vez no saben por donde empezar o desean sostenerla con mas constancia.",
        ],
        "purpose": "Sirve para transformar la lectura biblica en un momento personal de escucha, meditación, oración y contemplación.",
        "audience": [
            "personas que desean rezar con la Palabra",
            "usuarios que buscan una estructura clara para la reflexion",
            "quienes valoran un espacio personal de silencio y anotaciónes",
        ],
        "actions": [
            "abrir la lectura del día",
            "recorrer paso a paso la Lectio, Meditatio, Oratio y Contemplatio",
            "encontrar preguntas o ayudas para reflexionar",
            "guardar notas personales de tu camino espiritual",
        ],
        "relationships": [
            "Se apoya en Biblia y Calendario Liturgico para ofrecer el contenido adecuado en cada jornada.",
            "Tambien puede convivir con Oraciones como parte de un recorrido espiritual mas amplio.",
        ],
    },
    "meditvoz.md": {
        "resume": "Audios y meditaciónes guiadas para encontrar calma, silencio y profundidad espiritual.",
        "intro": [
            "Meditvoz esta pensada para quienes conectan mejor con la escucha, la musica y la palabra hablada como camino de interioridad.",
            "Su propuesta busca ofrecer un espacio de pausa y acompanamiento espiritual a traves de audios, meditaciónes y recursos sonoros.",
        ],
        "purpose": "Sirve para regalar momentos de calma, favorecer la oración guiada y acercar contenido espiritual en un formato facil de escuchar en cualquier lugar.",
        "audience": [
            "personas que prefieren contenido en audio",
            "usuarios que buscan meditaciónes guiadas",
            "quienes necesitan un momento breve de recogimiento durante el día",
        ],
        "actions": [
            "escuchar meditaciónes o guias espirituales",
            "acompanarte con audios breves de reflexion",
            "usar el contenido durante tiempos de silencio, descanso o camino",
            "integrar la escucha como parte de tu vida espiritual cotidiana",
        ],
        "relationships": [
            "Puede complementarse con otras apps de oración y formación para ofrecer una experiencia mas amplia y sensible.",
        ],
    },
    "misal.md": {
        "resume": "Textos liturgicos para seguir mejor la Misa y comprender lo que se celebra cada día.",
        "intro": [
            "Misal quiere acercar los textos de la celebración de una manera clara y amigable para quienes participan de la liturgia.",
            "La propuesta no esta pensada solo para especialistas, sino tambien para personas que quieren seguir mejor la Misa y comprender lo que rezan y escuchan.",
        ],
        "purpose": "Sirve para consultar oraciones, lecturas y partes de la celebración, y asi vivir la liturgia con mayor comprension y participación.",
        "audience": [
            "personas que quieren seguir mejor la Misa",
            "servidores o equipos liturgicos",
            "usuarios que buscan textos de celebraciónes puntuales",
        ],
        "actions": [
            "consultar el ordinario de la Misa",
            "ver las oraciones y textos del día",
            "acceder a celebraciónes o ritos particulares",
            "acompañar la liturgia con mas claridad y sentido",
        ],
        "relationships": [
            "Se apoya en Calendario Liturgico para ubicar los textos correspondientes a cada jornada o celebración.",
        ],
    },
    "motus.md": {
        "resume": "Herramienta para acompañar grupos juveniles, encuentros y procesos comúnitarios de jovenes.",
        "intro": [
            "Motus esta pensado para la vida de los grupos juveniles y para todo aquello que necesita dinamismo, acompanamiento y organización.",
            "La propuesta quiere ser util tanto para quienes coordinan como para los jovenes que participan y buscan un espacio donde crecer en comúnidad.",
        ],
        "purpose": "Sirve para sostener la vida del grupo, ordenar encuentros y acercar recursos adecuados a la realidad juvenil.",
        "audience": [
            "jovenes que participan en grupos o movimientos",
            "coordinadores y animadores juveniles",
            "comúnidades que buscan herramientas para acompañar procesos",
        ],
        "actions": [
            "acceder a recursos pensados para jovenes",
            "organizar encuentros y actividades",
            "seguir la participación del grupo",
            "fortalecer la vida comunitaria entre pares",
        ],
        "relationships": [
            "Puede complementarse con otras apps de formación y comúnidad segun las necesidades de cada grupo.",
        ],
    },
    "newsletter.md": {
        "resume": "Canal de novedades para recibir noticias, avisos y recordatorios importantes de la comúnidad.",
        "intro": [
            "Newsletter esta pensada para que la comunicación de la comúnidad llegue de forma ordenada, clara y oportuna.",
            "La propuesta busca evitar que la información importante se pierda y ayudar a que las personas esten al tanto de lo que realmente les interesa.",
        ],
        "purpose": "Sirve para mantener informada a la comúnidad sobre actividades, cambios, propuestas pastorales y novedades relevantes.",
        "audience": [
            "personas que quieren recibir novedades periodicas",
            "comúnidades que necesitan comúnicar mejor",
            "equipos organizadores que desean llegar con claridad a sus miembros",
        ],
        "actions": [
            "suscribirte para recibir novedades",
            "enterarte de eventos, avisos y noticias",
            "recibir recordatorios utiles en momentos clave",
            "mantenerte cerca de la vida comunitaria aunque no puedas estar siempre presente",
        ],
        "relationships": [
            "Puede trabajar junto con Agenda Comunitaria para comúnicar actividades y acompañar recordatorios.",
            "Tambien se integra naturalmente con el portal Fósforo como canal general de comunicación.",
        ],
    },
    "oraciones.md": {
        "resume": "Biblioteca de oraciones para encontrar palabras de fe en distintos momentos de la vida.",
        "intro": [
            "Oraciones esta pensada para acercar un repertorio amplio y ordenado de oraciones catolicas, de modo que cualquier persona pueda encontrar facilmente una palabra para rezar.",
            "La aplicación busca acompañar tanto a quien ya tiene habito de oración como a quien necesita una ayuda sencilla para empezar.",
        ],
        "purpose": "Sirve para tener a mano oraciones para distintos momentos, necesidades, fiestas o tiempos liturgicos, sin perder tiempo buscando en muchos lugares.",
        "audience": [
            "personas que quieren rezar con mas frecuencia",
            "usuarios que buscan oraciones segun una necesidad concreta",
            "quienes desean construir una rutina espiritual sencilla",
        ],
        "actions": [
            "explorar una biblioteca de oraciones",
            "buscar por texto, tema o necesidad",
            "filtrar por tipo de oración o tiempo liturgico",
            "guardar favoritas para volver a ellas rapidamente",
        ],
        "relationships": [
            "Puede complementar recorridos de Confesiones y Lectio Divina cuando el usuario necesita profundizar su momento de oración.",
            "Tambien puede dialogar con el calendario liturgico para destacar contenidos segun el tiempo del ano.",
        ],
    },
    "peticionario.md": {
        "resume": "Espacio para compartir intenciones y acercar pedidos de oración a la comúnidad.",
        "intro": [
            "Peticionario esta pensado para dar un lugar sencillo y respetuoso a las intenciones de oración de las personas.",
            "Busca que nadie sienta que tiene que atravesar solo sus necesidades, preocupaciónes o agradecimientos, sino que pueda confiarlos a una comúnidad orante.",
        ],
        "purpose": "Sirve para acercar intenciones personales o comúnitarias y abrir un canal de acompanamiento espiritual compartido.",
        "audience": [
            "personas que desean pedir oración",
            "usuarios que quieren compartir una necesidad o agradecimiento",
            "comúnidades que buscan acompañar mejor a sus miembros",
        ],
        "actions": [
            "enviar una intencion de oración",
            "compartir pedidos de forma simple y cuidada",
            "acercar necesidades a la comúnidad",
            "sentirte acompanado en momentos importantes de la vida",
        ],
        "relationships": [
            "Puede integrarse con el portal Fósforo y con Horarios de Misas para ofrecer caminos concretos de participación y acompanamiento.",
        ],
    },
    "santopedia.md": {
        "resume": "Perfiles de santos para conocer su historia, inspirarte y encontrar modelos de vida cristiana.",
        "intro": [
            "Santopedia quiere acercar la vida de los santos de una forma viva, clara y atractiva para distintas edades.",
            "La propuesta no se limita a datos biograficos: busca mostrar por que esas vidas siguen diciendo algo hoy y como pueden inspirar la fe cotidiana.",
        ],
        "purpose": "Sirve para descubrir la historia, virtudes y testimonio de los santos, y encontrar en ellos compañía, ejemplo y formación.",
        "audience": [
            "personas que quieren conocer mejor a los santos",
            "familias, catequistas y comúnidades formativas",
            "usuarios de distintas edades interesados en modelos de vida cristiana",
        ],
        "actions": [
            "leer perfiles de santos con información relevante y cercana",
            "explorar recursos para la formación y la catequesis",
            "compartir contenidos inspiradores",
            "acompañar celebraciónes y memorias a lo largo del ano",
        ],
        "relationships": [
            "Puede complementarse con Calendario Liturgico y con otros recorridos formativos del ecosistema.",
            "Tambien puede aportar contexto a quienes llegan desde celebraciónes, fiestas o fechas especiales.",
        ],
    },
    "servicio-sacerdotal-al-difunto.md": {
        "resume": "Acompanamiento para familias y comúnidades en momentos de duelo y despedida.",
        "intro": [
            "Servicio Sacerdotal al Difunto esta pensado para ofrecer una ayuda concreta y serena en uno de los momentos mas delicados de la vida: la despedida de un ser querido.",
            "La propuesta quiere reunir orientación, apoyo espiritual y recursos pastorales para que las familias no tengan que afrontar solas ese camino.",
        ],
        "purpose": "Sirve para acompañar con sensibilidad el duelo, orientar sobre celebraciónes y ayudar a vivir la despedida con fe, respeto y contencion.",
        "audience": [
            "familias que atraviesan una perdida",
            "agentes pastorales que acompanan este momento",
            "comúnidades que desean ofrecer un mejor servicio de cercania",
        ],
        "actions": [
            "consultar orientaciónes para este momento",
            "acceder a materiales y ayudas pastorales",
            "encontrar apoyo espiritual para el duelo",
            "recibir claridad sobre pasos y celebraciónes posibles",
        ],
        "relationships": [
            "Puede convivir con otros servicios pastorales del ecosistema y fortalecer el acompanamiento comúnitario en momentos de dolor.",
        ],
    },
    "servicios-pastorales.md": {
        "resume": "Organización simple de ministerios, equipos y servicios dentro de la vida parroquial.",
        "intro": [
            "Servicios Pastorales esta pensado para ayudar a que la organización interna de la comúnidad sea mas clara, humana y ordenada.",
            "La propuesta quiere facilitar la coordinación de equipos y ministerios para que el servicio cotidiano no dependa solo de mensajes sueltos o memoria personal.",
        ],
        "purpose": "Sirve para ordenar la vida de los equipos, mejorar la comunicación y hacer mas facil la distribucion de tareas y responsabilidades.",
        "audience": [
            "coordinadores de ministerios o equipos",
            "personas que sirven en distintas areas pastorales",
            "comúnidades que buscan organizar mejor su vida cotidiana",
        ],
        "actions": [
            "conocer equipos, ministerios y funciones",
            "ordenar turnos o tareas",
            "mejorar la comunicación entre quienes sirven",
            "seguir de forma clara la vida de cada servicio",
        ],
        "relationships": [
            "Puede complementarse con Agenda Comunitaria, Newsletter y otras herramientas de organización del ecosistema.",
        ],
    },
    "vida-de-misionero.md": {
        "resume": "Espacio de relatos, novedades y testimonios para seguir de cerca la vida del proyecto y su mision.",
        "intro": [
            "Vida de Misionero esta pensada como una ventana abierta al camino del proyecto, sus historias, aprendizajes y testimonios.",
            "La idea es que el usuario no solo vea herramientas o funcionalidades, sino tambien el pulso humano y espiritual que da vida al ecosistema.",
        ],
        "purpose": "Sirve para compartir experiencias, novedades y relatos que ayuden a comprender la mision del proyecto y a sentirse parte de ella.",
        "audience": [
            "personas interesadas en el crecimiento del ecosistema",
            "usuarios que valoran testimonios y experiencias reales",
            "quienes desean seguir la vida y el espiritu del proyecto",
        ],
        "actions": [
            "leer publicaciónes y testimonios",
            "seguir novedades del proyecto",
            "recorrer contenidos por tema o categoria",
            "mantenerte conectado con la dimension humana y misionera de Fósforo",
        ],
        "relationships": [
            "Puede compartir sus novedades dentro del portal Fósforo y servir como rostro narrativo del ecosistema.",
        ],
    },
    "visita-7-iglesias.md": {
        "resume": "Guia para vivir la tradicion de visitar siete iglesias durante Semana Santa.",
        "intro": [
            "Visita 7 Iglesias esta pensada para acompañar una tradicion muy querida por muchos fieles durante Semana Santa.",
            "La propuesta busca hacerla mas facil de organizar y mas rica espiritualmente, sin quitarle su sentido de recogimiento y peregrinación.",
        ],
        "purpose": "Sirve para ayudar a vivir esta practica con mayor orden, mejor orientación y un acompanamiento espiritual acorde al momento liturgico.",
        "audience": [
            "personas que realizan la visita de las siete iglesias",
            "familias o grupos que quieren organizar el recorrido",
            "usuarios que desean una guia simple para esta tradicion",
        ],
        "actions": [
            "encontrar iglesias para el recorrido",
            "seguir un itinerario mas claro",
            "rezar con textos o ayudas para cada parada",
            "vivir la experiencia con mayor sentido y continuidad",
        ],
        "relationships": [
            "Puede nutrirse de otros contenidos liturgicos del ecosistema para ofrecer contexto y ayudas durante Semana Santa.",
        ],
    },
    "voluntariado.md": {
        "resume": "Espacio para sumarte a actividades solidarias y organizar mejor el servicio comúnitario.",
        "intro": [
            "Voluntariado quiere facilitar el encuentro entre personas dispuestas a ayudar y actividades concretas que necesitan manos, tiempo y compromiso.",
            "La propuesta busca hacer mas visible el servicio solidario y volver mas simple el paso de querer colaborar a efectivamente sumarse.",
        ],
        "purpose": "Sirve para ordenar oportunidades de servicio, invitar a nuevas personas a participar y fortalecer el compromiso solidario dentro del ecosistema.",
        "audience": [
            "personas que quieren ofrecer tiempo y ayuda",
            "organizaciónes o comúnidades que coordinan actividades solidarias",
            "usuarios que buscan una manera concreta de comprometerse",
        ],
        "actions": [
            "conocer actividades disponibles",
            "ver de que se trata cada propuesta y si hay cupos",
            "anotarte para participar",
            "seguir de forma mas clara tu colaboración en iniciativas solidarias",
        ],
        "relationships": [
            "Puede mostrarse de forma destacada en Fósforo para acercar oportunidades de servicio a toda la comúnidad.",
            "Tambien puede complementarse con herramientas de organización comunitaria y comunicación.",
        ],
    },
}


CATEGORY_VOICES = {
    "contenido": {
        "bridge": "La propuesta esta pensada para acercarte contenido claro, sereno y facil de recorrer, de modo que cada encuentro con la app pueda convertirse en una oportunidad real de oración, lectura o descubrimiento.",
        "value": "Su valor dentro de Fósforo esta en acercar contenido significativo al ritmo de cada persona, ayudando a que la fe no quede lejos ni encerrada en momentos aislados, sino que pueda formar parte de la vida cotidiana.",
    },
    "formación": {
        "bridge": "La experiencia busca acompañar procesos de aprendizaje y crecimiento sin volverlos frios ni pesados, para que cada paso sume comprension, cercania y deseo de profundizar.",
        "value": "Su valor dentro de Fósforo esta en ayudar a crecer con sentido, ofreciendo caminos de formación que no solo informan, sino que tambien iluminan decisiones, fortalecen la fe y abren nuevas preguntas.",
    },
    "comúnidad": {
        "bridge": "La propuesta pone el acento en el encuentro, la colaboración y la participación, para que nadie viva su camino en soledad y siempre existan puentes concretos hacia los demas.",
        "value": "Su valor dentro de Fósforo esta en fortalecer los lazos entre personas, grupos y comúnidades, ayudando a que la vida compartida sea mas visible, mas organizada y tambien mas acogedora.",
    },
    "vida-comunitaria": {
        "bridge": "La propuesta pone el acento en el encuentro, la colaboración y la participación, para que nadie viva su camino en soledad y siempre existan puentes concretos hacia los demas.",
        "value": "Su valor dentro de Fósforo esta en fortalecer los lazos entre personas, grupos y comúnidades, ayudando a que la vida compartida sea mas visible, mas organizada y tambien mas acogedora.",
    },
    "servicio": {
        "bridge": "La experiencia esta pensada para resolver necesidades concretas con claridad y sensibilidad, haciendo que cada herramienta sea util de verdad para acompañar situaciónes reales de la vida.",
        "value": "Su valor dentro de Fósforo esta en traducir la fe en ayuda concreta, facilitando acciones, decisiones y acompanamientos que muchas veces hacen falta justo en momentos importantes.",
    },
    "herramienta": {
        "bridge": "La propuesta busca simplificar tareas, orientar mejor y abrir caminos mas directos dentro del ecosistema, para que la tecnologia se sienta al servicio de la persona y no al reves.",
        "value": "Su valor dentro de Fósforo esta en ordenar, conectar y facilitar la experiencia general, ayudando a que cada usuario encuentre antes lo que necesita y pueda aprovechar mejor todo el ecosistema.",
    },
    "tecnologia": {
        "bridge": "La propuesta busca simplificar tareas, orientar mejor y abrir caminos mas directos dentro del ecosistema, para que la tecnologia se sienta al servicio de la persona y no al reves.",
        "value": "Su valor dentro de Fósforo esta en ordenar, conectar y facilitar la experiencia general, ayudando a que cada usuario encuentre antes lo que necesita y pueda aprovechar mejor todo el ecosistema.",
    },
}


PHASE_VOICES = {
    "1": {
        "bridge": "Al estar pensada dentro de las primeras etapas del ecosistema, su enfoque busca responder necesidades centrales y abrir un camino solido para muchas otras experiencias futuras.",
        "value": "Tambien tiene un valor fundaciónal: ayuda a poner bases claras, cercanas y utiles para que el ecosistema crezca sobre experiencias que realmente importan a las personas.",
        "stage": "Esta aplicación forma parte de la Fase 1, pensada como etapa de base y arranque del ecosistema. Por eso su desarrollo se imagina como una prioridad estructural, llamada a sostener y orientar muchas experiencias posteriores.",
    },
    "2": {
        "bridge": "Dentro de esta etapa, la app aparece como una extension natural de lo ya construido, profundizando recorridos que ayudan a rezar, comprender mejor y vivir la fe con mas acompanamiento.",
        "value": "Ademas de su utilidad propia, aporta profundidad: toma lo que ya existe en el ecosistema y lo vuelve mas personal, mas cercano y mas facil de integrar en la vida cotidiana.",
        "stage": "Esta aplicación esta pensada para desarrollarse en Fase 2, una etapa orientada a ampliar y profundizar experiencias esenciales. La idea es que llegue cuando el ecosistema ya tenga una base firme y pueda acompañar procesos mas personales y sostenidos.",
    },
    "3": {
        "bridge": "Al estar ubicada en una fase comunitaria, la propuesta pone especial atencion en la participación, los vinculos y la vida compartida, ayudando a que la experiencia no se quede solo en lo individual.",
        "value": "Tambien suma un valor relaciónal: ayuda a tejer comúnidad, a visibilizar personas y espacios de encuentro, y a hacer que el ecosistema se sienta cada vez mas vivo y mas cercano.",
        "stage": "Esta aplicación esta pensada para desarrollarse en Fase 3, una etapa enfocada en fortalecer la dimension comunitaria del ecosistema. Su crecimiento se proyecta como parte de una experiencia mas compartida, participativa y conectada entre personas y grupos.",
    },
    "4": {
        "bridge": "Como parte de una etapa de expansion, la app se piensa con una mirada mas amplia, abriendo nuevas posibilidades, servicios o recorridos que enriquecen el ecosistema y lo vuelven mas versatil.",
        "value": "Su aporte tambien es expansivo: permite que Fosforo llegue a nuevas necesidades, nuevos perfiles de usuario y nuevas formas de acompañar, sin perder coherencia con su identidad general.",
        "stage": "Esta aplicación esta pensada para desarrollarse en Fase 4, una etapa de crecimiento extendido. En ese momento se proyecta sumar funciones y recorridos que amplien el alcance del ecosistema y lo hagan mas completo para distintos tipos de usuarios.",
    },
    "5": {
        "bridge": "Al pensarse para una etapa mas avanzada, la propuesta mira hacia adelante y explora horizontes nuevos, con iniciativas que pueden ampliar la madurez, la proyeccion y la riqueza general del ecosistema.",
        "value": "Tambien tiene un valor de vision: ayuda a imaginar hacia donde puede crecer Fosforo cuando ya exista una base madura, permitiendo sumar propuestas mas especializadas, exploratorias o innovadoras.",
        "stage": "Esta aplicación esta pensada para desarrollarse en Fase 5, una etapa de expansion y madurez. Su lugar en la hoja de ruta expresa una mirada de largo plazo, abierta a nuevas posibilidades para enriquecer el ecosistema con propuestas mas amplias o especializadas.",
    },
}


def resolve_voice(category: str) -> dict:
    return CATEGORY_VOICES.get(category, {
        "bridge": "La propuesta esta pensada para que la experiencia sea cercana, util y facil de entender, incluso para alguien que llega por primera vez al ecosistema.",
        "value": "Su valor dentro de Fósforo no pasa solo por lo que ofrece por si sola, sino por la forma en que acompana, conecta y enriquece el camino de fe, formación o vida comunitaria de cada persona.",
    })


def resolve_phase_voice(phase: str) -> dict:
    match = re.search(r"Fase\s+(\d+)", phase)
    if not match:
        return {
            "bridge": "Su etapa proyectada marca una orientación de crecimiento, pero tambien deja espacio para que la aplicación madure junto con las necesidades reales del ecosistema.",
            "value": "Eso tambien le da un valor abierto: puede evolucionar con el tiempo y encontrar su mejor forma a medida que el ecosistema crezca y se ordene.",
            "stage": f"Esta aplicación esta pensada para desarrollarse en {phase}. La fase indica el momento estimado en el que se proyecta su crecimiento dentro del ecosistema, y puede ajustarse a medida que el proyecto evolucione.",
        }

    return PHASE_VOICES.get(match.group(1), {
        "bridge": "Su etapa proyectada marca una orientación de crecimiento, pero tambien deja espacio para que la aplicación madure junto con las necesidades reales del ecosistema.",
        "value": "Eso tambien le da un valor abierto: puede evolucionar con el tiempo y encontrar su mejor forma a medida que el ecosistema crezca y se ordene.",
        "stage": f"Esta aplicación esta pensada para desarrollarse en {phase}. La fase indica el momento estimado en el que se proyecta su crecimiento dentro del ecosistema, y puede ajustarse a medida que el proyecto evolucione.",
    })


def build_body(data: dict, phase: str, category: str) -> str:
    voice = resolve_voice(category)
    phase_voice = resolve_phase_voice(phase)
    lines = []
    lines.extend(data["intro"])
    lines.append("")
    lines.append(voice["bridge"])
    lines.append(phase_voice["bridge"])
    lines.append("")
    lines.append("## Para que sirve")
    lines.append("")
    lines.append(data["purpose"])
    lines.append("")
    lines.append("## A quien puede ayudar")
    lines.append("")
    for item in data["audience"]:
        lines.append(f"- {item.capitalize()}")
    lines.append("")
    lines.append("## Que vas a poder hacer")
    lines.append("")
    for item in data["actions"]:
        lines.append(f"- {item.capitalize()}")
    lines.append("")
    lines.append("## Como se integra con el ecosistema")
    lines.append("")
    for item in data["relationships"]:
        lines.append(f"- {item}")
    lines.append("")
    lines.append("## Por que puede ser valiosa")
    lines.append("")
    lines.append(voice["value"])
    lines.append("")
    lines.append(phase_voice["value"])
    lines.append("")
    lines.append("## Etapa planificada")
    lines.append("")
    lines.append(phase_voice["stage"])
    return "\n".join(lines)


def rewrite_file(path: Path, payload: dict, phase: str) -> None:
    text = path.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---\n\n?(.*)$", text, re.S)
    if not match:
        raise ValueError(f"No frontmatter found in {path.name}")

    frontmatter, _ = match.groups()
    category_match = re.search(r'(?m)^category:\s*"([^"]+)"\s*$', frontmatter)
    category = category_match.group(1) if category_match else ""
    frontmatter = re.sub(
        r'(?m)^resume:\s*".*"\s*$',
        f'resume: "{payload["resume"]}"',
        frontmatter,
    )

    new_body = build_body(payload, phase, category)
    path.write_text(f"---\n{frontmatter}\n---\n\n{new_body}\n", encoding="utf-8")


for file_name, payload in CONTENT.items():
    rewrite_file(BASE / file_name, payload, PHASE_DEFAULTS[file_name])
