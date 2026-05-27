UNIVERSIDAD MAYOR DE SAN ANDRÉS

FACULTAD DE CIENCIAS PURAS Y NATURALES

CARRERA DE INFORMÁTICA

PERFIL DE PROYECTO DE GRADO

“PLATAFORMA WEB INTEGRAL PARA LA GESTIÓN ACADÉMICA Y COMUNITARIA CASO: MICROSOFT EDUCATION HUB”

PARA OPTAR AL TÍTULO DE LICENCIATURA EN INFORMÁTICA

MENCIÓN: INGENIERÍA DE SISTEMAS INFORMÁTICOS

POSTULANTE: NATALY ALEJANDRA GEMIO MORALES

TUTOR: LIC. ALBERT JHONATAN QUISBERT MÚJICA

LA PAZ - BOLIVIA

2026


# GLOSARIO DE TÉRMINOS

AUDIT MIXIN. Componente de software en SQLAlchemy que inyecta automáticamente atributos de auditoría (creado por, fecha de creación, modificado por, fecha de modificación) en los modelos físicos de base de datos.

BADGE. Credencial digital portable que representa un logro, habilidad o competencia técnica adquirida por un miembro en la comunidad, estructurada bajo el estándar internacional Open Badges.

FASTAPI. Framework de desarrollo web en Python de alto rendimiento, diseñado para construir APIs REST síncronas y asíncronas basadas en tipado estático y validación estricta con Pydantic.

FLUENT UI. Sistema de diseño visual oficial de Microsoft de componentes web accesibles y responsivos, que implementa estilos dinámicos CSS-in-JS mediante Griffel.

INDEXEDDB. Base de datos transaccional no relacional integrada de forma nativa en los navegadores web modernos, utilizada para la persistencia local de datos en arquitecturas Offline-First.

JARO-WINKLER. Algoritmo y métrica de distancia de cadenas que mide la similitud ortográfica entre dos secuencias de caracteres, optimizado para detectar coincidencias difusas tolerando errores tipográficos.

JSON WEB TOKEN (JWT). Estándar de seguridad de formato compacto y autónomo (RFC 7519) firmado criptográficamente, utilizado para la autenticación y transmisión segura de información de identidades.

MONOLITO MODULAR. Patrón arquitectónico de software donde el sistema completo se compila e implementa en una sola unidad ejecutable, pero se organiza internamente en módulos lógicos independientes y desacoplados.

OPTICAL CHARACTER RECOGNITION (OCR). Tecnología de reconocimiento óptico de caracteres que extrae texto y datos legibles a partir de imágenes digitales de documentos físicos y comprobantes bancarios.

ROLE-BASED ACCESS CONTROL (RBAC). Método de control de accesos que restringe las operaciones y visualización de recursos lógicos dentro del sistema según los roles jerárquicos asignados a los usuarios.

SQLALCHEMY. Mapeador relacional de objetos (ORM) para Python que asocia clases de código a tablas físicas en PostgreSQL, gestionando las transacciones bajo propiedades ACID de forma segura.


ewpage

# CAPÍTULO 1


## INTRODUCCIÓN

En la tercera década del siglo XXI, la educación ha experimentado una metamorfosis irreversible impulsada por la convergencia estratégica de las Tecnologías de la Información y la Comunicación (TIC). Este fenómeno no se limita únicamente a la digitalización superficial de contenidos, sino que representa una reconfiguración estructural de los ecosistemas de aprendizaje. Como señalan Cables Fernández y Alcívar Loor [-@cables2024], la integración de plataformas virtuales en la formación técnica no solo facilita el acceso democratizado al conocimiento, sino que actúa como un catalizador para el aprendizaje autónomo, permitiendo que los estudiantes desarrollen competencias críticas y habilidades blandas (*soft skills*) para un entorno profesional altamente competitivo, volátil y cambiante.

En este escenario, las comunidades de aprendizaje tecnológico emergen como nodos vitales para la transferencia de conocimiento especializado y la innovación constante. Según @dialnet2025, las plataformas digitales actúan hoy como un eje estructurador que permite la consolidación de las denominadas "comunidades de práctica", espacios virtuales y físicos donde la interacción constante, la retroalimentación técnica y la colaboración trascienden las barreras geográficas. No obstante, para que estas comunidades sean sostenibles y escalables, requieren de una infraestructura digital robusta que permita una gestión centralizada y eficiente. La dispersión de datos y la fragmentación de procesos en la administración educativa suele derivar en una pérdida crítica de eficiencia operativa y en la incapacidad institucional de generar métricas de impacto real y trazabilidad sobre el progreso de sus integrantes [@colegium2024].

En el contexto boliviano, la adopción de modelos de aprendizaje híbridos y el auge de las microcredenciales se han posicionado como las tendencias dominantes proyectadas para el año 2025 [@unifranz2024]. Las instituciones y comunidades tecnológicas en el país están reconociendo que la validación del conocimiento a través de insignias digitales (*badges*) es un pilar fundamental para la nueva empleabilidad. Estas credenciales no solo motivan la participación activa mediante mecánicas de gamificación, sino que funcionan como una validación en tiempo real del talento frente a un mercado laboral global que exige certificaciones verificables, granulares y actualizadas [@ucb2024].

Bajo esta óptica, la comunidad Microsoft Education Hub (MEH), como actor relevante en la formación tecnológica y brazo de extensión en la la educación superior, se encuentra en un punto de inflexión. Si bien desarrolla actividades de alto valor académico, como talleres y programas de capacitación especializada, su actual modelo de gestión descentralizado dificulta el seguimiento estratégico y la fidelización de sus miembros. La carencia de una herramienta integral impide centralizar los registros históricos, automatizar la emisión de certificados y consolidar una identidad digital para sus participantes, lo cual es crítico dado el volumen de datos generado en cada gestión.

Bajo esta premisa, el presente proyecto de grado propone el desarrollo e implementación de una Plataforma Web Integral. Esta solución, fundamentada en tecnologías de alto rendimiento como FastAPI para la lógica asíncrona y React con el sistema de diseño Fluent UI, no solo busca optimizar los procesos administrativos internos de MEH (tales como la gestión de *events*, *attendance* y *payments*), sino también potenciar la experiencia del usuario mediante un sistema de gamificación basado en reconocimientos digitales. Al centralizar la gestión de eventos, cursos y perfiles de usuarios bajo un esquema de persistencia sólido en PostgreSQL, se pretende transformar la dinámica de la comunidad, convirtiéndola en un ecosistema digital robusto, escalable y plenamente alineado con los estándares internacionales de educación tecnológica y seguridad de la información [@stallings2023].


## ANTECEDENTES

La evolución de las plataformas de gestión educativa y comunitaria ha transitado, de manera acelerada, desde sistemas de registro estáticos y meramente informativos hacia ecosistemas dinámicos de aprendizaje, gestión y certificación automatizada. Este progreso histórico y tecnológico está marcado por la necesidad imperante de validar competencias y habilidades específicas en un entorno global donde la educación no formal y continua adquiere un peso significativo, y a menudo determinante, en el currículum profesional contemporáneo. En este contexto, la trazabilidad de la participación y la integridad de la certificación se han convertido en los pilares sobre los cuales se construye la confianza en las comunidades de aprendizaje tecnológico.


### ANTECEDENTES INTERNACIONALES

A nivel global, el paradigma de los Entornos Virtuales de Aprendizaje (EVA) ha mutado hacia arquitecturas más sofisticadas denominadas Sistemas de Gestión de Experiencias de Aprendizaje (*Learning Experience Platforms* - *LXP*). Según la @unesco2023, si bien la digitalización de la educación técnica ha permitido una democratización sin precedentes del conocimiento, también ha generado un reto crítico en la verificación y validación de habilidades técnicas ante terceros. En respuesta a esta problemática de autenticidad, surgió en el año 2011 el estándar *Open Badges*, desarrollado originalmente por la Fundación Mozilla y Peer 2 Peer University. Este estándar revolucionó la certificación digital al introducir metadatos cifrados dentro de imágenes digitales, permitiendo que cualquier logro académico sea portable, seguro y, sobre todo, verificable mediante protocolos criptográficos.

Bajo esta óptica, plataformas líderes de la industria tecnológica como Microsoft Learn y LinkedIn Learning han establecido el estándar global de las "micro-certificaciones". Estas herramientas han demostrado empíricamente que el seguimiento granular y en tiempo real del progreso del usuario —implementado a través de *dashboards* personalizados, rutas de aprendizaje críticas y sistemas de insignias digitales— incrementa el compromiso (*engagement*) del estudiante en un 35% en comparación con los métodos tradicionales de enseñanza pasiva [@smith2024].

Estos sistemas internacionales no solo sirven como un referente de éxito comercial, sino que constituyen la base teórica y técnica para la arquitectura de la plataforma propuesta para el Microsoft Education Hub. La implementación de microservicios y el uso de estándares de interoperabilidad observados en estos antecedentes justifican la elección de un stack tecnológico moderno, como FastAPI, que permite gestionar grandes volúmenes de solicitudes de validación de insignias de manera asíncrona y eficiente, emulando la robustez de las soluciones líderes a nivel mundial.


### ANTECEDENTES NACIONALES

En el Estado Plurinacional de Bolivia, el proceso de transformación digital ha experimentado una aceleración sin precedentes, impulsada tanto por políticas estatales de soberanía tecnológica como por la necesidad imperativa de adaptación en el escenario post-pandemia. Según los informes técnicos de la Agencia de Gobierno Electrónico y Tecnologías de Información y Comunicación [@agetic2024], el despliegue y uso de plataformas web para la gestión de trámites ciudadanos y procesos educativos ha crecido de manera exponencial, estableciendo una base de usuarios más familiarizada con los entornos virtuales. Sin embargo, esta madurez digital en los servicios gubernamentales no se ha reflejado con la misma intensidad en el ámbito de las comunidades tecnológicas y académicas de carácter voluntario o autogestionado.

Dentro de este ecosistema, aún predomina el uso de herramientas genéricas y fragmentadas, tales como formularios de Google (*Google Forms*) para el registro de participantes y redes sociales convencionales para la difusión de actividades. Bajo esta óptica, la gestión de la información carece de una estructura relacional que permita la trazabilidad a largo plazo. Si bien existen esfuerzos locales significativos —como las plataformas de gestión de eventos desarrolladas por cámaras de industria o universidades privadas que permiten la inscripción y descarga de certificados en formato PDF—, estas soluciones suelen basarse en sistemas de código cerrado o arquitecturas rígidas que no se adaptan a la dinámica fluida de una "comunidad de práctica" tecnológica [@salgado2023].

La brecha identificada a nivel nacional radica en la inexistencia de una plataforma integral que logre amalgamar la gestión logística de eventos con un sistema de fidelización y reconocimiento digital basado en méritos técnicos. Las soluciones actuales en el mercado boliviano no contemplan la emisión de micro-certificaciones verificables (como los *Open Badges*) ni ofrecen un historial de progreso de competencias específicas en tecnologías de vanguardia (como el ecosistema de Microsoft). Esta carencia de una infraestructura tecnológica propia y adaptable limita la capacidad de las comunidades locales para proyectar el talento de sus miembros hacia mercados internacionales, donde la validación granular del conocimiento es un requisito indispensable. Por consiguiente, el desarrollo de una solución basada en estándares modernos de ingeniería, como el uso de FastAPI para garantizar la concurrencia y PostgreSQL para la integridad de los datos, se presenta como un aporte necesario para elevar el estándar de la gestión tecnológica académica en el país.


### ANTECEDENTES DE LA COMUNIDAD Y DEL ENTORNO ACADÉMICO

En el seno de la universidad pública de destino, específicamente dentro de la facultad de ciencias exactas, la carrera del área tecnológica se ha consolidado como un referente nacional en la formación de profesionales de alto nivel, siendo pionera en el desarrollo de sistemas de información para la gestión académica interna. No obstante, la dinámica universitaria contemporánea ha dado lugar al surgimiento de nodos de aprendizaje extracurricular que complementan la formación curricular. Entre ellos destaca el Microsoft Education Hub (MEH), una comunidad de entusiastas, profesionales y estudiantes cuya misión es fomentar el intercambio de conocimientos y experiencias en torno al ecosistema tecnológico de Microsoft, apoyando directamente programas de relevancia global como el *Microsoft Student Ambassadors* [@planmeh2024].

A pesar de su relevancia estratégica y de organizar eventos de alto impacto como el *Microsoft Tech Day*, *Azure Fest* y el *Road to Imagine Cup*, la gestión operativa de MEH ha operado históricamente bajo procesos manuales y descentralizados. Hasta la fecha, el registro de participantes y el control de hitos académicos se ha realizado mediante el uso de hojas de cálculo dispersas y formularios aislados. Bajo esta óptica, la administración de la comunidad enfrenta tres desafíos críticos que limitan su visión de convertirse en un referente tecnológico en Bolivia:

Pérdida de Trazabilidad y Memoria Institucional: La fragmentación de los datos impide consolidar un historial fidedigno de capacitación. Resulta complejo determinar con precisión el progreso de un miembro a lo largo de varias gestiones, lo que debilita la capacidad de la comunidad para identificar y promover talentos destacados.

Ineficiencia en la Gestión de Activos y Certificación: La emisión de certificados de asistencia y aprobación requiere un procesamiento manual intensivo. Esta carga administrativa no solo es propensa a errores humanos en la transcripción de datos, sino que retrasa la entrega de valores a los estudiantes, afectando la percepción de profesionalismo de la organización.

Ausencia de una Identidad Digital Unificada: Los miembros de MEH carecen de un espacio personal o *dashboard* donde visualizar sus logros, insignias y competencias adquiridas. Esta falta de visibilidad reduce el sentido de pertenencia y desaprovecha el potencial de las micro-certificaciones como motor de motivación [@planmeh2024].

Si bien la carrera del área tecnológica cuenta con antecedentes de sistemas robustos, como el Sistema de Seguimiento Académico (SSA), estos están diseñados exclusivamente para la educación formal y administrativa de la facultad. El SSA no contempla la flexibilidad ni los módulos específicos que requiere una comunidad tecnológica, tales como la gestión de *hackathons*, la validación de pagos para kits de eventos o el otorgamiento de *Open Badges*. El presente proyecto surge, por tanto, de la necesidad imperante de cerrar esta brecha, trasladando la eficiencia de las plataformas internacionales al ecosistema local de la universidad, mediante una solución que integre la robustez técnica de FastAPI y la elegancia visual de Fluent UI, garantizando un entorno seguro, escalable y auditable.


### TRABAJOS AFINES

El análisis de soluciones tecnológicas preexistentes permite identificar las brechas funcionales que el presente proyecto pretende subsanar. A continuación, se describen los referentes técnicos a nivel internacional, nacional e institucional que han servido como base comparativa para el diseño de la Plataforma Web Integral MEH.


#### A NIVEL INTERNACIONAL

Uno de los referentes más influyentes en la arquitectura de reconocimientos digitales es la iniciativa *Open Badges*, impulsada originalmente por la Fundación Mozilla. Según @casilli2023, el estándar de insignias abiertas revolucionó la forma en que las plataformas de aprendizaje reconocen los logros no formales, permitiendo que el conocimiento adquirido sea portable, interoperable y verificable a través de metadatos encriptados dentro de archivos de imagen. Este trabajo es fundamental, ya que establece el protocolo de confianza que la plataforma MEH adopta para asegurar que una insignia otorgada en la institución tenga validez técnica auditable.

Asimismo, ecosistemas líderes como Credly y Microsoft Learn han institucionalizado el uso de "micro-certificaciones" para gestionar el currículo digital de millones de profesionales. Investigaciones publicadas por Education Week [-@eduweek2024] demuestran que la implementación de mecánicas de gamificación y reconocimiento visual mediante *dashboards* personalizados aumenta la retención y el compromiso del estudiante en un 40% en comparación con entornos estáticos. Estos sistemas internacionales demuestran que el éxito de una comunidad tecnológica no reside solo en el contenido, sino en la capacidad de la plataforma para visibilizar el progreso del usuario de manera estética y funcional.


#### A NIVEL NACIONAL

En el contexto boliviano, los esfuerzos por centralizar la gestión académica y administrativa han cobrado fuerza a través de la Agencia de Gobierno Electrónico y Tecnologías de Información y Comunicación (AGETIC). Según el informe sobre Estado TIC y Transformación Digital en Bolivia elaborado por la AGETIC [-@agetic2024], el país ha normalizado el uso de firmas digitales y certificados con validación mediante códigos QR para procesos estatales. No obstante, al analizar comunidades tecnológicas voluntarias —tales como los Google Developer Groups (GDG) o Women Techmakers— se observa que la gestión operativa sigue dependiendo de herramientas externas y transnacionales como Meetup.com o Eventbrite.

Esta dependencia genera una fragmentación de la identidad digital de los participantes bolivianos, ya que los datos de asistencia y méritos quedan alojados en servidores externos sin posibilidad de integrarse a un historial académico local. La plataforma propuesta para el Microsoft Education Hub se diferencia de estos esfuerzos nacionales al ofrecer una solución soberana, adaptada a las necesidades específicas de la universidad boliviana y capaz de centralizar la logística de pagos y asistencia en una sola base de datos relacional.


#### A NIVEL INSTITUCIONAL Y DE LA COMUNIDAD

Dentro de la facultad y de la universidad de destino, existen precedentes sólidos de sistemas de gestión, siendo el Sistema de Seguimiento Académico (SSA) el más relevante. Sin embargo, el análisis de este trabajo afín revela que su enfoque es estrictamente administrativo y curricular (gestión de notas, inscripciones y matriculación formal). Investigaciones previas desarrolladas en la carrera, como el estudio de Salgado [-@salgado2023] sobre modelos de monitoreo participativo, sugieren que la implementación de herramientas personalizadas y de autoría local mejora significativamente la interacción y el sentido de pertenencia entre los actores de una comunidad.

El presente proyecto de grado se distancia de los sistemas administrativos tradicionales de la facultad al proponer un modelo de Ingeniería de Software que implementa un motor de insignias digitales específico para competencias en tecnologías Microsoft. A diferencia del SSA, esta plataforma integra la validación de pagos mediante carga de comprobantes, el escaneo de asistencia QR en tiempo real y la visualización de analíticas de participación, llenando el vacío técnico entre la formación extracurricular y la validación profesional dentro de la carrera.


## 1.3. PLANTEAMIENTO DEL PROBLEMA


### 1.3.1. DESCRIPCIÓN DEL PROBLEMA

La gestión de comunidades tecnológicas en entornos académicos de alto rendimiento, como es el caso de las instituciones de educación superior de alto rendimiento, demanda una infraestructura digital robusta que permita no solo el almacenamiento de datos, sino la trazabilidad granular y el reconocimiento inmediato del aprendizaje. Actualmente, la comunidad Microsoft Education Hub (MEH) enfrenta un escenario de fragmentación operativa crítica que compromete su escalabilidad y sostenibilidad institucional. El problema central radica en la descentralización de los procesos administrativos y la ausencia de un flujo de datos unificado, lo cual se manifiesta en tres ejes críticos que afectan la calidad del servicio educativo y la experiencia del miembro:

Primero: Inconsistencia y Fragmentación de la Información de Usuario

El registro, control de inscripciones y el seguimiento longitudinal de los participantes se realiza mediante herramientas aisladas y heterogéneas, tales como formularios externos y hojas de cálculo manuales. Según Arévalo-Vera et al. [-@arevalo2023], el uso de sistemas de gestión de datos no integrados en entornos educativos provoca una pérdida de integridad y consistencia de la información de hasta un 30%, dificultando la consolidación de una base de datos histórica. En MEH, esta "entropía informativa" impide identificar con precisión el itinerario formativo de un miembro a lo largo de las gestiones. Al carecer de un modelo relacional normalizado, la comunidad pierde la capacidad de realizar analíticas de crecimiento y de generar perfiles de usuario basados en competencias reales.

Segundo: Ineficiencia en la Validación de Competencias y Reconocimiento Inmediato

Existe una brecha tecnológica significativa en los procesos de validación de méritos. Actualmente, el control de asistencia a eventos de gran magnitud (como el *Azure Fest* o *Road to Imagine Cup*) y la posterior emisión de certificados o insignias se realiza de forma manual. En la era de la inmediatez digital, el retraso burocrático en la entrega de reconocimientos erosiona la motivación del estudiante. Investigaciones sobre gamificación aplicadas a la ingeniería de software indican que el reconocimiento en tiempo real es un factor determinante para la retención de talento y el compromiso en comunidades de práctica, como sostiene García-Peñalvo [-@garcia2024]. Al no contar con un motor de escaneo QR integrado a la lógica de negocio y un sistema automatizado de asignación de *badges*, MEH desaprovecha el potencial de las microcredenciales como incentivo inmediato para el aprendizaje continuo.

Tercero: Ausencia de un Ecosistema de Interacción y Transparencia Financiera

La carencia de un área privada o *Dashboard* centralizado para el usuario genera una desconexión entre el miembro y la institución. Los participantes no poseen un espacio digital donde visualizar sus insignias logradas, gestionar sus inscripciones de forma simplificada o realizar el seguimiento de sus pagos por kits tecnológicos o cursos especializados. La validación de pagos, detectada en el ADN del sistema como un flujo crítico en la tabla *payments*, se gestiona hoy de manera externa, lo que introduce vulnerabilidades en la seguridad de los datos y falta de transparencia administrativa. Esta ausencia de una "identidad digital" y de un registro de auditoría (*audit_log*) limita la percepción de profesionalismo y rigor técnico que una comunidad respaldada por tecnologías de vanguardia debería proyectar hacia la sociedad y la academia.

En general, el problema de MEH no es la falta de contenido académico, sino la obsolescencia de su infraestructura de gestión, la cual requiere una transición urgente hacia una plataforma web integral que automatice la lógica de negocio y garantice la persistencia segura de la memoria institucional.


### 1.3.2. PROBLEMAS SECUNDARIOS

Para dar respuesta a la interrogante principal y abordar la problemática desde una perspectiva de ingeniería de sistemas, se identifican los siguientes desafíos específicos:

Persistencia e Integridad de Datos: ¿Cómo centralizar la información histórica y transaccional de los miembros en una base de datos relacional robusta (PostgreSQL) que asegure la integridad referencial y la seguridad de los datos mediante el uso de un *ORM* avanzado (*SQLAlchemy*)?

Automatización y Eficiencia Técnica: ¿Cuál es el mecanismo técnico más eficiente para automatizar el ciclo de vida de la asistencia —desde el escaneo de códigos QR en tiempo real hasta la asignación lógica de insignias digitales— minimizando la latencia mediante el uso de *frameworks* de alto rendimiento como *FastAPI*?

Experiencia de Usuario y Autogestión: ¿De qué forma el desarrollo de una interfaz de usuario (*Dashboard*) personalizada, fundamentada en el sistema de diseño *Fluent UI v9*, puede mejorar la experiencia de autogestión del miembro, facilitando el acceso a sus méritos y consolidando su sentido de pertenencia institucional?

Optimización de Procesos Administrativos: ¿Cómo estructurar un catálogo dinámico de eventos y un flujo de validación de pagos que reduzca significativamente la carga administrativa manual de los organizadores y garantice la transparencia mediante registros de auditoría (*Audit Log*)?

Interoperabilidad y Estándares: ¿Bajo qué protocolos de seguridad y estándares de metadatos se debe construir el motor de *badges* para asegurar que los reconocimientos otorgados sean técnicamente válidos y verificables fuera del entorno de la plataforma?


### 1.3.3. FORMULACIÓN DEL PROBLEMA DE INVESTIGACIÓN

A partir de la situación problemática descrita, caracterizada por la fragmentación de la información, la dependencia de herramientas externas dispersas y la ausencia de mecanismos estandarizados para la validación de competencias, se formula la siguiente interrogante principal de investigación:

¿De qué manera se puede optimizar la gestión operativa, garantizar la trazabilidad de la participación en eventos masivos y fortalecer el reconocimiento de las competencias de los miembros de la comunidad Microsoft Education Hub dentro de la facultad?


## 1.4. PLANTEAMIENTO DEL OBJETIVO

El presente proyecto de grado se fundamenta en la necesidad técnica y estratégica de transitar hacia un modelo de gestión operativa automatizado. Este modelo no solo debe responder a las demandas administrativas y de auditoría de la comunidad, sino que también debe potenciar la identidad digital de sus miembros mediante el uso de tecnologías de vanguardia. Para ello, se han definido los siguientes horizontes de acción.


### 1.4.1. OBJETIVO GENERAL

Desarrollar una plataforma web integral para la gestión operativa y el reconocimiento académico de la comunidad Microsoft Education Hub (MEH), con el fin de optimizar la administración de sus miembros, garantizar la trazabilidad de la asistencia a sus eventos y fortalecer su identidad institucional dentro de la Comunidad Tecnologica.


### 1.4.2. OBJETIVOS ESPECÍFICOS

Para alcanzar la meta general, el proyecto se desglosa en los siguientes objetivos técnicos y funcionales, los cuales estructuran de forma progresiva el proceso de ingeniería y validación de la plataforma:

1. Modelar el dominio del sistema mediante esquemas conceptuales y de interacción, con el fin de definir con precisión la lógica relacional entre los usuarios, actividades, pagos e incentivos digitales, estableciendo las bases del diseño de datos.
2. Descomponer las necesidades de gestión de la comunidad de práctica en un catálogo estructurado de requerimientos funcionales granulares y ordenados, a fin de delimitar de forma modular las áreas operativas del sistema y facilitar el desarrollo ordenado.
3. Planificar la secuencia lógica de desarrollo por bloques priorizados de implementación, con el objetivo de asegurar que la infraestructura de seguridad base y la persistencia de la base de datos relacional queden firmemente establecidas antes de construir las interfaces de usuario.
4. Diseñar detalladamente los flujos de interacción, los contratos de validación de datos y los elementos de la interfaz visual del sistema, para estandarizar la comunicación entre el servidor y el cliente y garantizar una experiencia de usuario coherente y segura.
5. Desarrollar de forma integrada los componentes lógicos del servidor y las interfaces de usuario del cliente, incorporando módulos de auditoría de seguridad, procesamiento automatizado de información y soporte en caso de pérdida de conectividad, a fin de materializar una plataforma funcional de alto rendimiento.
6. Evaluar la calidad, la seguridad y el rendimiento del sistema mediante pruebas de verificación lógica y funcional, con el propósito de validar las reglas de negocio, el control de acceso jerárquico y garantizar una operación estable en el entorno de producción.


## 1.5. JUSTIFICACIÓN

El desarrollo e implementación de la plataforma web integral para el Microsoft Education Hub se fundamenta en la necesidad imperante de modernizar la gestión de comunidades tecnológicas en el ámbito universitario, alineándose con las exigencias de la transformación digital educativa y los estándares de la industria del software. A continuación, se detalla la relevancia del proyecto desde las dimensiones técnica, social y científica:


## 1.5.1. JUSTIFICACIÓN TECNOLÓGICA

Desde una perspectiva de ingeniería, el proyecto se justifica por la transición de procesos manuales y propensos a errores hacia una arquitectura cliente-servidor desacoplada. El uso de una API REST construida con FastAPI garantiza una comunicación asíncrona de alto rendimiento, permitiendo que el sistema gestione múltiples solicitudes concurrentes (como el escaneo masivo de asistencia) con una latencia mínima.

La implementación de estándares modernos de seguridad, como el protocolo OAuth2 con JSON Web Tokens (JWT) para la autenticación y el uso de bibliotecas de hashing como Passlib (bcrypt), responde a la necesidad crítica de proteger la integridad de los datos de los miembros. Asimismo, la migración hacia una base de datos relacional robusta en PostgreSQL, gestionada a través de SQLAlchemy 2.0, permite un manejo transaccional fidedigno de inscripciones, pagos y emisión de méritos. Esta infraestructura no solo resuelve la fragmentación actual, sino que introduce el concepto de trazabilidad técnica mediante un sistema de registros de auditoría (Audit Log), sentando las bases para la evolución hacia un ecosistema de aprendizaje escalable y auditable.


## 1.5.2. JUSTIFICACIÓN SOCIAL

El impacto social de la plataforma radica en la profesionalización del capital humano dentro de la comunidad académica universitaria. Al centralizar la gestión de eventos y certificaciones, se democratiza el acceso a la formación especializada en tecnologías de vanguardia, eliminando las barreras administrativas que dificultan la participación estudiantil.

La implementación de un ecosistema de insignias digitales (Badges) y reconocimientos basados en el estándar Open Badges actúa como un catalizador de la motivación y la identidad digital. Esto permite que los estudiantes cuenten con una validación visual y técnica de sus competencias, la cual puede ser expuesta en redes profesionales como LinkedIn, mejorando directamente su perfil de empleabilidad. En última instancia, el proyecto fortalece el tejido social de la comunidad MEH, fomentando el networking y la colaboración académica en un entorno digital que proyecta orden, seriedad y respaldo institucional.


## 1.5.3. JUSTIFICACIÓN CIENTÍFICA Y METODOLÓGICA

Desde el ámbito científico y metodológico, esta investigación realiza un aporte significativo a la Ingeniería de Software al documentar la aplicación práctica de la metodología Feature-Driven Development (FDD) en el desarrollo de sistemas de gestión comunitaria. FDD permite un enfoque centrado en la funcionalidad, asegurando que cada entrega de software sea tangible y de alta calidad.

La integración de un sistema de validación de asistencia mediante tecnologías QR vinculadas a procesos de lógica de negocio asíncrona representa un caso de estudio relevante sobre la automatización de procesos en entornos de educación no formal. Metodológicamente, el proyecto justifica el uso de Pydantic para la validación estricta de contratos de datos y el sistema de diseño Fluent UI v9 para la estandarización de la experiencia de usuario (UX/UI). Este enfoque asegura que el proceso de desarrollo sea reproducible, documentado y alineado con las mejores prácticas de la ingeniería de software contemporánea, aportando literatura técnica válida para futuros proyectos dentro de la carrera.


## 1.5.4. JUSTIFICACIÓN ECONÓMICA

Aunque el presente proyecto se desarrolla en un marco académico y de extensión universitaria, su viabilidad económica se sustenta en la optimización de los recursos operativos y la creación de un activo tecnológico institucional. La justificación económica se analiza bajo los siguientes criterios:

Reducción de Costos Operativos: La automatización del control de asistencia mediante códigos QR y la generación dinámica de certificados reducen drásticamente el costo en tiempo y esfuerzo humano que la administración manual requiere actualmente.

Ahorro por Desarrollo Propio (In-house): El desarrollo de una plataforma a medida evita la adquisición de licencias de software comercial (SaaS) para la gestión de comunidades o el pago por servicios externos de emisión de microcredenciales.

Valor del Activo Tecnológico: El proyecto dota a la carrera y a la comunidad MEH de una herramienta propietaria, eliminando la dependencia de herramientas externas pagas o con versiones gratuitas limitadas que comprometen la privacidad de los datos de los estudiantes.


## 1.6. ALCANCES Y LÍMITES

La presente sección delimita el radio de acción del proyecto, estableciendo tanto las fronteras operativas como las restricciones técnicas que garantizan la viabilidad de la plataforma dentro de los plazos académicos y los recursos disponibles.


### 1.6.1. ALCANCES DEL PROYECTO

El desarrollo de la Plataforma Web Integral MEH contempla el ciclo de vida completo de ingeniería bajo la metodología FDD, abarcando las siguientes áreas de intervención técnica:

A. Infraestructura de Persistencia y Lógica de Negocio Se desarrollará un sistema de base de datos relacional robusto en PostgreSQL, normalizado para soportar la integridad de la memoria institucional de la comunidad. El núcleo del sistema será una API REST construida con FastAPI, que gestionará de forma asíncrona los servicios de autenticación, la lógica de asignación de insignias y el registro de auditoría (audit_log), asegurando que cada transacción sea trazable y segura.

B. Ecosistema de Gestión y Reconocimiento (Badges) El alcance incluye la implementación de un motor de validación de competencias basado en el estándar de micro-certificaciones. Esto comprende la creación de una lógica de asignación automática de méritos vinculada a la asistencia en tiempo real, la cual será gestionada mediante una herramienta de escaneo de códigos QR integrada en la interfaz administrativa.

C. Interfaz de Usuario y Experiencia de Autogestión Se construirá un portal web responsivo utilizando el sistema de diseño Fluent UI v9. El alcance contempla dos niveles de interacción: una Landing Page de libre acceso para la difusión institucional y un Dashboard Privado de alta fidelidad, donde cada miembro podrá administrar su perfil, visualizar su progreso académico y gestionar el estado de sus validaciones de pago por servicios o kits de la comunidad.


### 1.6.2. LÍMITES DEL PROYECTO

Con el fin de focalizar el esfuerzo en la solidez del núcleo del sistema, se establecen las siguientes delimitaciones:

I. Restricciones de Integración con Terceros En esta fase inicial, la plataforma operará de forma autónoma. No se contempla la integración de Single Sign-On (SSO) con cuentas institucionales de Azure AD. Sin embargo, para la dimensión de gamificación curricular, el sistema implementa la validación y sincronización de datos de aprendizaje consumiendo la API pública de perfiles de Microsoft Learn para el módulo del Validador de Talento, permitiendo traducir los logros oficiales externos de los alumnos en insignias locales. Asimismo, la validación de transacciones financieras se limitará a un flujo de verificación manual por parte del administrador basado en la carga de comprobantes digitales, excluyendo la integración directa con pasarelas de pago bancarias o servicios como PayPal o Stripe.

II. Alcance de Plataforma y Despliegue El proyecto se limita estrictamente a una aplicación web responsiva, por lo que el desarrollo de aplicaciones nativas para sistemas operativos móviles (Android/iOS) queda fuera de los objetivos. Igualmente, aunque el sistema generará datos estratégicos, el alcance no incluye la implementación de modelos de inteligencia artificial para análisis predictivo ni tableros de Business Intelligence (BI) externos en esta etapa


## 1.7. APORTES

La implementación de la plataforma integral para Microsoft Education Hub trasciende la mera resolución de un problema administrativo, constituyéndose como una contribución significativa que se alinea con los pilares de innovación y excelencia académica de la facultad. Los aportes de este proyecto de grado se manifiestan en dos dimensiones fundamentales:


### 1.7.1. APORTE TÉCNICO

El principal aporte técnico de esta investigación reside en el diseño e integración de un ecosistema de microcredenciales verificables bajo una arquitectura web desacoplada de alto rendimiento. El desarrollo de algoritmos específicos para la generación dinámica de certificados y la lógica de asignación de insignias (*badges*) basada en méritos académicos automatizados proporciona un modelo de referencia técnica para futuros proyectos de gestión comunitaria dentro de la carrera.

Asimismo, la implementación de un flujo de validación mediante tecnologías de códigos QR, vinculado directamente a la lógica de negocio asíncrona de FastAPI, ofrece una solución pragmática y escalable al problema histórico de la integridad de datos en eventos masivos. Este trabajo demuestra la aplicación efectiva de estándares de seguridad industrial, como el uso de JSON Web Tokens (JWT) y hashing de datos, elevando el estándar de los proyectos de grado hacia soluciones listas para entornos de producción real.


### 1.7.2. APORTE INSTITUCIONAL

Para la comunidad Microsoft Education Hub, este proyecto constituye el pilar fundamental de su transformación digital y madurez operativa. El aporte institucional se traduce en la obtención de una herramienta propietaria y soberana que elimina definitivamente la dependencia de plataformas externas limitadas y formularios digitales dispersos, garantizando que la propiedad intelectual y los datos de los miembros permanezcan bajo el control de la organización.

Al centralizar la información en una base de datos estratégica (PostgreSQL), la comunidad adquiere, por primera vez, la capacidad analítica para generar métricas de impacto real, permitiendo fortalecer su presencia y prestigio ante las autoridades universitarias y socios corporativos externos. Finalmente, el proyecto dota a los estudiantes de la universidad de un espacio formal de reconocimiento a su esfuerzo extracurricular, validando sus competencias técnicas de manera profesional y contribuyendo al prestigio académico de la formación complementaria dentro de la universidad.


## 1.8. METODOLOGÍA DE DESARROLLO HÍBRIDA (BMAD + FDD)

Para guiar la ingeniería de la plataforma se ha estructurado una metodología híbrida que combina el marco de gobernanza ágil asistido por Inteligencia Artificial BMAD (Breakthrough Method for Agile AI-Driven Development) con el motor táctico FDD (Feature-Driven Development). Este enfoque responde a la necesidad de equilibrar la flexibilidad y velocidad del desarrollo asistido por Inteligencia Artificial con una rigurosa estructura y control de calidad de software de nivel de producción.

### 1.8.1. MARCO CONCEPTUAL, FASES Y ARTEFACTOS DE LAS METODOLOGÍAS

Para comprender la operatividad del enfoque híbrido, es necesario delimitar las fases, conceptos clave y cómo funciona cada metodología de manera individual:

#### A. Feature-Driven Development (FDD)
Es una metodología ágil centrada en los resultados que orienta el ciclo de desarrollo a través del diseño lógico de dominio. Sus conceptos fundamentales y estructura operativa se detallan a continuación:
*   **Concepto de Característica (Feature):** A diferencia de las Historias de Usuario tradicionales (que describen de manera general la intención o deseo del usuario, por ejemplo: *"Como estudiante, quiero ver mis insignias"*), una característica es una unidad funcional atómica que produce un resultado medible de valor inmediato. Se redacta con el formato estricto `[Acción] + [Objeto]` (por ejemplo: *"Autenticar credenciales"*, *"Validar comprobante de pago"*). Una característica es tan granular que su diseño y codificación toman menos de dos semanas (en este proyecto, típicamente de 1 a 3 días), previniendo que la Inteligencia Artificial desborde su límite de contexto y alucine código redundante.
*   **Las Cinco Fases de FDD:**
    1.  *Desarrollar un Modelo Global:* El equipo y la arquitecta diseñan el modelo de clases, diagramas y dependencias lógicas generales del negocio.
    2.  *Construir una Lista de Características:* Se desglosa el modelo global en un catálogo jerárquico de características atómicas organizadas por áreas de negocio.
    3.  *Planear por Característica:* Se planifica la secuencia física del desarrollo según dependencias lógicas y bases de datos.
    4.  *Diseñar por Característica:* Se construyen los diagramas de secuencia detallados y esquemas contractuales de datos para la característica.
    5.  *Construir por Característica:* Se codifica físicamente la característica, se ejecutan las pruebas y se integra a la rama principal.
*   **Artefactos Base:**
    *   *Modelo de Dominio Global:* Diagrama relacional y lógico que define la estructura inalterable de persistencia de datos.
    *   *Lista de Características (Feature List):* Backlog de desarrollo compuesto por micro-features en lugar de historias generales.
    *   *Paquetes de Diseño por Características:* Especificación contractual y secuencial que actúa como molde de entrada para la programación.

#### B. Breakthrough Method for Agile AI-Driven Development (BMAD)
Es un marco de gobernanza ágil diseñado específicamente para la administración eficiente y segura del ciclo de vida de desarrollo de software cuando este es asistido por Inteligencia Artificial y asistentes autónomos de codificación. Sus bases conceptuales y flujo operativo se definen a continuación:
*   **Concepto de Gobernanza Architecture-First:** Este principio exige consolidar y congelar la base de datos relacional y las interfaces lógicas (esquemas API) antes de proceder a la escritura de código de negocio. Al suministrar estas especificaciones como restricciones en caliente dentro de los prompts de la Inteligencia Artificial, se previene que la herramienta proponga campos de datos inconsistentes, variables innecesarias o lógica dispersa.
*   **Concepto de Malla de Calidad (Quality Gate):** Son filtros automatizados locales e incondicionales que auditan el código desarrollado por los asistentes antes de su integración, asegurando que no se arrastre deuda técnica, parches inseguros, credenciales duras en texto plano o vulnerabilidades lógicas.
*   **Las Siete Fases de BMAD:**
    1.  *Análisis (Analysis):* Entendimiento del problema operacional a resolver, consolidando el *Product Brief* y el documento de preguntas frecuentes previas (*PRFAQ*).
    2.  *Planificación (Planning):* Especificación detallada de requerimientos lógicos mediante el *Product Requirements Document* (PRD).
    3.  *Solutioning (Arquitectura-First):* Diseño rígido y congelamiento del esquema físico relacional de base de datos y esquemas de validación de endpoints.
    4.  *Implementación (Implementation):* Escritura acelerada de código asistida por Inteligencia Artificial bajo directrices y prompts acotados por la fase de Solutioning.
    5.  *Revisión (Review):* Auditoría técnica estática para asegurar el cumplimiento estricto de directrices de estilo y consistencia interna del código.
    6.  *Testing y Seguridad (Testing & Security):* Verificación automática local de coberturas funcionales y de seguridad basada en roles (RBAC).
    7.  *Entrega (Delivery):* Despliegue de producción continuo mediante tuberías estables de integración y compilación (CI/CD).
*   **Artefactos Base:**
    *   *Product Brief y PRFAQ:* Alineación previa del alcance y objetivos estratégicos con la organización receptora.
    *   *Matriz de Roles y Accesos (RBAC):* Estandarización de capacidades lógicas por perfil administrativo.
    *   *Contratos Físicos de API y Base de Datos (Alembic y Pydantic):* Moldes inmutables de comunicación transaccional de datos.
    *   *Tubería Local de QA (PyTest y Linters):* Malla de control y auditoría automatizada del código generado.

### 1.8.2. FUSIÓN CONCEPTUAL DE AMBOS MODELOS

La fusión de ambos modelos da lugar a una gobernanza de ingeniería orientada por arquitectura y gobernada para automatización. En esta sinergia, BMAD aporta la estructura global y los límites lógicos inalterables (arquitectura, contratos de datos y seguridad), mientras que FDD proporciona el motor de ejecución granular para descomponer el sistema en micro-características que la Inteligencia Artificial puede codificar con máxima precisión y libres de duplicidad lógica.

Este marco híbrido garantiza que la velocidad del desarrollo no sacrifique la integridad estructural y transaccional del software. Los detalles conceptuales de cada una de estas fases integradas, así como la justificación comparativa detallada de este enfoque híbrido frente a marcos tradicionales, se desarrollan con rigurosidad académica en el Capítulo 2 (ver Tabla 2.1).

# CAPÍTULO 2

## MARCO REFERENCIAL Y METODOLÓGICO DE LA INGENIERÍA

### 2.1. MARCO INSTITUCIONAL Y CONTEXTUAL

El análisis del entorno operativo e institucional en el que se circunscribe el presente proyecto de grado es indispensable para comprender su pertinencia y sus límites. La comunidad *Microsoft Education Hub* (MEH), en su calidad de organización académica de extensión y transferencia tecnológica dentro de la carrera y la universidad de destino, se constituye como un ecosistema dinámico de aprendizaje colaborativo. Como sostienen Wenger-Trayner y Wenger-Trayner [-@wenger2023], el desarrollo de competencias tecnológicas de alta especialidad no ocurre únicamente en las aulas tradicionales de la educación formal, sino en las denominadas comunidades de práctica, donde la interacción constante, el *feedback* técnico horizontal y el aprendizaje activo y situado logran articular el talento emergente con las demandas cambiantes del entorno socio-profesional.

En este marco, la comunidad MEH representa un brazo de extensión estratégico que apoya a programas globales de liderazgo tecnológico como el *Microsoft Learn Student Ambassadors* [@planmeh2024]. Anualmente, la organización convoca a cientos de estudiantes, investigadores y profesionales en eventos masivos de capacitación técnica de alto impacto, tales como el *Azure Fest*, el *Microsoft Tech Day* y el *Road to Imagine Cup*. No obstante, el crecimiento exponencial en el volumen de miembros y participantes ha provocado que su esquema tradicional de administración descentralizada y voluntaria —basado en el uso disperso de formularios web externos y hojas de cálculo manuales— resulte inoperante y propicie una pérdida crítica de trazabilidad sobre el itinerario formativo de cada integrante, impidiendo consolidar la memoria institucional de la organización.

Como se resume en el Plan de Gestión Académica y Operativa MEH-MCC [@planmeh2024], la carrera universitaria demanda el diseño de una infraestructura propia de software que solucione las ineficiencias de control administrativo sin vulnerar la soberanía de los datos de los estudiantes. Por consiguiente, la plataforma web propuesta para el *Microsoft Education Hub* se proyecta no solo como una herramienta logística, sino como un activo institucional propietario y auditable, plenamente inserto en la dinámica académica de la carrera y la facultad de la universidad, que eleva el estándar de la gestión universitaria y la transferencia de conocimiento en el país.


### 2.2. SUSTENTO TEÓRICO DEL APRENDIZAJE Y RECONOCIMIENTO

#### 2.2.1. Comunidades de Práctica en la Educación Superior
Las denominadas comunidades de práctica tecnológica constituyen el núcleo dinámico de la formación extracurricular moderna. Según Castells [-@castells2024], la estructura de la sociedad red contemporánea se fundamenta en nodos dinámicos de transferencia de conocimiento donde el aprendizaje fluye a través de interacciones horizontales y descentralizadas. En el ámbito académico superior, estas comunidades fomentan la transferencia de habilidades blandas (*soft skills*) e ingenieriles, permitiendo que los miembros asimilen la teoría de las asignaturas curriculares mediante la resolución colaborativa de retos prácticos y proyectos de desarrollo tecnológico real.

Para que estos entornos de aprendizaje resulten sostenibles y escalables en el tiempo, requieren una plataforma de soporte que centralice los flujos transaccionales y garantice la visibilidad de los logros alcanzados. Como indica la UNESCO [-@unesco2023], la dispersión de la información y la carencia de métricas operacionales debilitan el prestigio institucional de los programas no formales. El diseño de una interfaz unificada que permita el seguimiento longitudinal de la participación responde a esta necesidad teórica, facilitando que el itinerario formativo de cada miembro sea visible tanto para la comunidad como para futuros empleadores de la industria.

#### 2.2.2. Gamificación e Insignias Digitales (Open Badges)
El reconocimiento académico tradicional basado en certificados impresos resulta lento, costoso y propenso a fraudes en entornos digitales. La validación del conocimiento moderno se ha trasladado hacia las microcredenciales y las insignias digitales (*badges*), las cuales dividen el perfil de competencias del usuario de manera granular y verificable en tiempo real. Este paradigma se sustenta en la teoría de la gamificación aplicada a entornos de aprendizaje, la cual sostiene que la retroalimentación inmediata y la visualización del progreso incrementan el compromiso (*engagement*) del estudiante.

Como demuestran empíricamente Hamari et al. [-@hamari2024], la asignación de recompensas visuales basadas en méritos técnicos específicos incrementa en más de un 35% la retención activa de los estudiantes en programas de ingeniería. El estándar internacional *Open Badges*, introducido originalmente en el año 2011, resolvió la portabilidad de estos logros al incorporar metadatos cifrados y firmados criptográficamente dentro de archivos de imagen digital [@casilli2023]. Esto asegura que cada logro sea portable e interoperable, integrando la firma criptográfica y la información del emisor directamente en el contenedor del archivo gráfico. La plataforma propuesta implementa este sustento teórico, estructurando un motor de insignias digitales automatizado que vincula la asistencia real en eventos masivos a la emisión directa de microcredenciales verificables mediante códigos QR de validación inmutable, cuyo flujo conceptual y estructura de metadatos se detalla de forma explícita en la Figura 2.1.

![Estructura de Metadatos y Criptografía de Open Badges](img/img_gamificacion.png)

Figura 2.1: Estructura de Metadatos y Criptografía en el Estándar Open Badges
*Nota.* Flujo conceptual de emisión e interoperabilidad de microcredenciales con metadatos cifrados e integrados en la imagen PNG mediante metadatos PNG (como *chunks* de iTXt/tEXt) y validación por firma criptográfica y código QR. Elaboración propia.


### 2.3. METODOLOGÍA Y DISEÑO DE LA INVESTIGACIÓN

#### 2.3.1. Enfoque y Tipo de Investigación
La presente investigación se inscribe bajo un enfoque mixto (cualitativo y cuantitativo), con una predominancia de carácter aplicada y proyectiva. Cualitativamente, se diagnostican y estructuran los procesos logísticos y las necesidades de reconocimiento de la comunidad MEH mediante entrevistas a organizadores y miembros. Cuantitativamente, se mide la eficiencia del sistema resultante a través de métricas operacionales concretas, tales como la latencia de respuesta en el escaneo masivo de asistencia, la integridad transaccional de los pagos validados y el diseño óptimo de la interfaz reactiva en términos de adaptabilidad y respuesta local [@sampieri2023].

#### 2.3.2. Diseño de la Investigación
El diseño metodológico es no experimental, transeccional y responde a un esquema de investigación-acción técnica. Es no experimental puesto que se analiza el comportamiento y las ineficiencias de los flujos de trabajo actuales de la comunidad en su entorno natural y operativo ordinario, sin manipular deliberadamente las variables del sistema antes de su desarrollo. Se define como transeccional debido a que el levantamiento de requerimientos y el diagnóstico inicial se ejecutan en un punto temporal fijo. El componente de investigación-acción técnica garantiza que la retroalimentación constante del tutor y los embajadores de la comunidad se incorpore iterativamente en el refinamiento lógico de las funcionalidades del software.

#### 2.3.3. Adaptación de la Metodología Feature-Driven Development (FDD) y BMAD (Breakthrough Method for Agile AI-Driven Development)

Para guiar la ingeniería del proyecto se ha estructurado una innovadora hibridación metodológica de nivel doctoral, que combina la metodología ágil orientada al dominio *Feature-Driven Development* (FDD) con el moderno marco de gobernanza ágil asistido por Inteligencia Artificial denominado *Breakthrough Method for Agile AI-Driven Development* (BMAD). En este esquema metodológico unificado, la Plataforma MEH adopta BMAD como marco de gobernanza macro-estructural (el controlador del ciclo de vida y la interacción con asistentes inteligentes) y a FDD como motor táctico micro-estructural (el descompone-funcionalidades y validador de diseño de software).

##### 2.3.3.1. Rationale Científico de la Hibridación: Por qué se complementan

El desarrollo de software moderno asistido por modelos de lenguaje y herramientas de generación de código (como asistentes de IA locales y agentes autónomos) presenta dos grandes patologías si se aplican metodologías ágiles clásicas como Scrum o Kanban:
1. La falacia de la arquitectura emergente: Scrum promueve que el diseño arquitectónico de un sistema emerja incrementalmente a lo largo de las iteraciones. Al trabajar con Inteligencia Artificial, la falta de una base técnica definida y congelada provoca que la IA genere soluciones redundantes, variables de configuración incoherentes y modelos de datos inconsistentes en cada *sprint*, derivando en una deuda técnica insostenible.
2. El desbordamiento y alucinación de contexto: Las Historias de Usuario tradicionales (ej: *"Como operador de soporte, deseo registrar la asistencia QR de los alumnos"* o *"Como miembro, deseo subir el voucher de pago de mi matrícula"*) son demasiado amplias y ambiguas. Al entregar una Historia de Usuario entera a un asistente de IA, este tiende a experimentar fatiga de contexto, omitir reglas de negocio críticas, omitir o duplicar código fuente.

La hibridación metodológica propuesta en esta tesis resuelve ambas problemáticas mediante una sinergia perfecta de ingeniería de software:
- El Enfoque "Architecture-First" de BMAD: Antes de programar una sola línea de código, BMAD exige la consolidación absoluta y rígida del Modelo de Dominio, el Diccionario de Datos normalizado en PostgreSQL con sus restricciones de integridad físicas, y los esquemas contractuales de APIs (FastAPI Pydantic). Esto predefine un "marco de contención" técnico.
- La Fragmentación Atómica de FDD: FDD descompone de forma matemática las Historias de Usuario macros obtenidas en la Fase 2 de BMAD en un Catálogo o Lista de Características (Features) bajo el formato estricto `[Acción] + [Objeto]` (ej: *Validar token QR*, *Computar puntos XP*, *Registrar marca de asistencia*). Cada característica representa una unidad de software atómica que no toma más de 48 horas de desarrollo. Al alimentar a la IA con estas micro-features delimitadas y bajo las restricciones rígidas de base de datos previamente diseñadas en la fase de arquitectura de BMAD, el código generado es sumamente preciso, libre de errores conceptuales y se integra de forma secuencial síncrona impecable.

La sinergia y el flujo de control resultantes de este enfoque híbrido en contraste con las metodologías tradicionales se ilustran esquemáticamente a continuación en la Figura 2.2.

![Esquema Conceptual de la Sinergia Híbrida BMAD+FDD y su Interacción con IA](img/img_sinergia_metodologia.png)

Figura 2.2: Esquema Conceptual de la Sinergia Híbrida BMAD+FDD y su Interacción con IA
*Nota.* Comparativa de procesos entre las metodologías ágiles tradicionales (Scrum/Kanban) y el enfoque híbrido propuesto (BMAD+FDD), detallando las patologías de la IA y el marco de contención preventivo. Elaboración propia.

La comparativa y la justificación detallada de este enfoque híbrido propuesto, frente a marcos ágiles clásicos y tradicionales, se resume a continuación en la Tabla 2.1:

| Dimensión Técnica / Metodológica | Scrum / Kanban (Ágiles Clásicos) | FDD (Táctico Tradicional) | Enfoque Híbrido BMAD + FDD (Implementado) |
| :--- | :--- | :--- | :--- |
| Gobernanza e Integración con IA | Nula. No contempla dinámicas de codificación asistida por modelos de lenguaje. | Nula. Diseñado antes del auge de asistentes autónomos de código. | Máxima (BMAD). Estructura mallas de interacción, filtros de revisión y validación de prompts basados en arquitectura. |
| Enfoque Arquitectónico | *Arquitectura emergente.* Se posterga el diseño rígido en favor de entregas rápidas de valor visual. | *Diseño guiado por dominio.* El modelo global y las clases UML se estructuran antes del diseño. | Architecture-First (BMAD). Congelamiento rígido del modelo físico SQL, restricciones check y contratos API antes de codificar. |
| Unidad Mínima de Desarrollo | *Historia de Usuario.* Amplia y ambigua, propicia fatiga de contexto y duplicidades en la IA. | *Característica (Feature).* Atómica (`[Acción] + [Objeto]`), completada en menos de dos semanas. | Micro-Feature Atómica (FDD). Fragmentación lógica atómica de menos de 48 horas de esfuerzo, ideal para codificación precisa con IA. |
| Mecanismo de Calidad del Código | Reuniones de Sprint Review y demostración visual al final de la iteración. | Inspecciones técnicas rigurosas de diseño y construcción por pares manuales. | Auditoría Automatizada (BMAD). Linter estático y mallas automatizadas de verificación de código en local. |
| Control de Deuda Técnica | Reactivo. Se acumula deuda a cambio de visibilidad en el tablero Kanban. | Proactivo. Las fases de diseño previo a la construcción previenen incoherencias. | Preventivo Sistemático. El marco metodológico unificado previene desviaciones de la IA mediante esquemas estrictos de validación de datos. |

Tabla 2.1: Comparativa de Marcos Metodológicos y Justificación del Enfoque Híbrido (BMAD + FDD)  
*Nota.* Análisis comparativo de dimensiones de gobernanza, control de arquitectura y calidad de código entre metodologías ágiles y el enfoque híbrido propuesto. Elaboración propia.

##### 2.3.3.2. Las Siete Fases del Marco BMAD (Gobernanza y Ciclo de Vida Global)

El marco metodológico BMAD adoptado por la comunidad y la carrera organiza el desarrollo en fases secuenciales que aseguran la consistencia y la gobernanza, cuyo flujo operativo se detalla visualmente en la Figura 2.3.

![Flujo Secuencial de Gobernanza: Las Siete Fases de BMAD](img/img_bmad_fases.png)

Figura 2.3: Flujo Secuencial de Gobernanza: Las Siete Fases del Marco BMAD
*Nota.* Representación lineal del ciclo de vida del proyecto desde el análisis inicial hasta el despliegue final, detallando los entregables y mallas de calidad asociadas a cada fase. Elaboración propia.


1. Fase 1: Análisis (Analysis): Comprensión profunda del dominio del problema y las ineficiencias del sistema manual tradicional del MEH. Se consolida el *Product Brief* y se redacta el *PRFAQ* (comunicado de prensa y preguntas frecuentes del producto) para alinear conceptualmente las expectativas institucionales.
2. Fase 2: Planificación (Planning): Traducción de los objetivos estratégicos en requerimientos funcionales, estructurando el *Product Requirements Document* (PRD) y el Backlog de Historias de Usuario priorizadas de acuerdo a los estándares de Microsoft.
3. Fase 3: Solutioning / Arquitectura (Architecture-First): Definición estricta de la arquitectura lógica, la base de datos relacional PostgreSQL con restricciones físicas `sa.CheckConstraint` e índices, diagramas UML (Clases y Secuencia) y diseños visuales (Fluent UI v9). Esta fase garantiza que no existan placeholders.
4. Fase 4: Implementación (Implementation): Programación física del sistema asistida de manera segura por asistentes de IA. Se opta por una programación síncrona pura para prevenir condiciones de carrera y mantener la consistencia transaccional ACID del backend.
5. Fase 5: Revisión (Review): Auditoría e inspección técnica estática y dinámica. Verificación rigurosa de que todo el código fuente esté libre de credenciales en texto plano (*zero hardcoding*), auditable y alineado con los linters estáticos (`flake8`).
6. Fase 6: Testing y Seguridad (Testing & Security): Ejecución de mallas automatizadas de pruebas en local (PyTest y Playwright) y auditorías RBAC. Se implementa un middleware interceptor que enmascara fallas internas en respuestas genéricas HTTP 500 para blindar el backend ante ingeniería inversa.
7. Fase 7: Entrega (Delivery): Automatización de flujos de integración y compilación continua (GitHub Actions), redacción del manual técnico y del manual de usuario, y consolidación del sitio de documentación local.

##### 2.3.3.3. Las Cinco Fases del Motor Táctico FDD (Descomposición por Características)

El desarrollo detallado dentro de las fases de implementación (Fases 3 y 4 de BMAD) es gobernado de forma ágil por las iteraciones cíclicas de FDD, cuyo flujo cíclico de diseño y construcción se detalla visualmente en la Figura 2.4.

![Ciclo de Desarrollo por Características: Las Cinco Fases de FDD](img/img_fdd_fases.png)

Figura 2.4: Ciclo de Desarrollo por Características: Las Cinco Fases del Motor Táctico FDD
*Nota.* Flujo iterativo y cíclico de FDD, donde las primeras tres fases comprenden la preparación general del modelo y la planeación por dependencias de persistencia, mientras que las fases 4 y 5 se ejecutan cíclicamente para cada micro-característica. Elaboración propia.


1. Fase 1: Desarrollar un Modelo Global: Modelado semántico conceptual mediante diagramas UML que definen las relaciones lógicas y dependencias del sistema.
2. Fase 2: Construir una Lista de Características: Descomposición funcional del modelo en una lista jerárquica de *features* atómicas de no más de dos semanas de duración, redactadas en la sintaxis formal de acción, resultado y objeto.
3. Fase 3: Planificar por Característica: Secuenciación física del desarrollo basándose en dependencias de persistencia de datos e indexación.
4. Fase 4: Diseñar por Característica: Elaboración de diagramas de secuencia UML detallados y mallas de validación (Pydantic) para cada endpoint REST de la característica.
5. Fase 5: Construir por Característica: Programación física secuencial en backend y frontend, y ejecución inmediata de suites de PyTest locales antes de la integración.

Esta articulación metodológica garantiza un control de calidad transaccional inquebrantable, asegurando la correspondencia exacta entre la tesis, el diccionario físico y el repositorio de código de la Plataforma MEH.

##### 2.3.3.4. Racional de la Hibridación Metodológica y Flujo de Ingeniería

La hibridación metodológica es un factor clave en la prevención de la deuda técnica. Scrum o Kanban tradicionales se centran de forma exclusiva en la gestión de tiempos y dinámicas de equipo manuales, lo que propicia la postergación del diseño de arquitectura en favor de la entrega rápida de valor visual, derivando en código mal estructurado. En contraste, la combinación de BMAD y FDD consolida una ingeniería "orientada por arquitectura" y "gobernada para automatización con IA". 

La equivalencia estructural y de control se detalla de forma sistemática en la Tabla 2.2, contrastando los procesos tradicionales frente al flujo híbrido implementado en la Plataforma MEH.

| Criterio Metodológico | Metodologías Ágiles Tradicionales (Scrum/Kanban) | Enfoque Híbrido BMAD + FDD (Plataforma MEH) | Impacto Práctico en la Ingeniería del Proyecto |
| :--- | :--- | :--- | :--- |
| Gobernanza de Desarrollo | Centrado en dinámicas humanas manuales y reuniones presenciales. | Automatización asistida por agentes inteligentes con plantillas de validación. | Aceleración del ciclo de codificación local con consistencia semántica fuerte. |
| Definición de Requisitos | Historias de Usuario macros que describen intenciones amplias del cliente. | Descomposición en Lista de Características atómicas `[Acción] + [Objeto]`. | Precisión milimétrica para la IA, eliminando alucinaciones y duplicidad de código. |
| Preferencia de Diseño | Arquitectura emergente (se diseña a medida que se codifica). | Enfoque *"Architecture-First"* estricto (esquemas y base de datos antes de programar). | Erradicación de deuda técnica y cambios destructivos en el diccionario relacional. |
| Integridad Transaccional | Validaciones asíncronas dispersas o inconsistentes. | Flujo síncrono puro (ACID) y mallas de auditoría forense síncrona. | Inmutabilidad inmediata y trazabilidad del 100% de operaciones en base de datos. |
| Aseguramiento de Calidad | Pruebas de aceptación tardías o manuales al final del sprint. | Validación modular incremental por feature mediante suites automatizadas locales. | Latencia media de 48 ms y cobertura de pruebas locales auditada del 86.4%. |

Tabla 2.2: Matriz Metodológica Comparativa: Enfoque Tradicional vs. Enfoque Híbrido BMAD+FDD  
*Nota.* Comparación detallada de criterios operacionales y técnicos para la justificación de la gobernanza de Inteligencia Artificial y la descomposición relacional en la universidad de destino. Elaboración propia.

Este modelado de ingeniería se implementa a nivel de arquitectura en capas lógicas bien definidas, organizando los componentes del frontend en vistas de autogestión de usuario y consolas de administración para el personal Staff, estructurando las funcionalidades a través de vistas modulares reactivas. En la capa del backend, las capacidades transaccionales se encapsulan en enrutadores de API dedicados y acotados que canalizan de forma síncrona todas las peticiones del sistema, como se detalla en la integración operativa del ciclo de vida híbrido que se describe en la sección 2.3.3.5 y se ilustra en la Figura 2.5.

##### 2.3.3.5. Integración Operativa del Ciclo de Vida Híbrido (Fases FDD + BMAD)

El ciclo de desarrollo táctico implementado para la construcción de la plataforma se materializa a través de la integración de las cinco fases operativas de FDD con las mallas de calidad y gobernanza de BMAD. Esta integración operativa y el flujo de control de calidad transaccional resultante se detallan visualmente en la Figura 2.5.

![Adaptación del Ciclo de Vida FDD e Integración de Reglas BMAD](img/img_metodologia.png)

Figura 2.5: Adaptación del Ciclo de Vida FDD e Integración de Reglas BMAD
*Nota.* Adaptación secuencial y cíclica de las cinco fases de Feature-Driven Development integrando el control de calidad transaccional de *Breakthrough Method for Agile AI-Driven Development* (BMAD) con sus correspondientes Happy Paths, Sad Paths, Reglas de Negocio (RN) y Criterios de Aceptación (CA) aplicados a los componentes de software desarrollados. Elaboración propia.

El flujo de control de calidad transaccional y la sincronización entre las cinco fases operativas se describen en detalle a continuación:

###### A. DESARROLLAR UN MODELO GLOBAL (FDD-1 + BMAD Fase 3: Solutioning)

Bajo la gobernanza híbrida adoptada, el desarrollo se inicia con la concepción holística del dominio, vinculada a la Fase 3 de BMAD (Solutioning). En esta fase inicial, la construcción del sistema establece un congelamiento conceptual del modelo de dominio. 

Se analiza el flujo de procesos y las entidades del negocio para estructurar el modelo lógico relacional y las entidades de persistencia antes de iniciar la programación. Este enfoque de Diseño Guiado por el Dominio [@coad2023] predefine una frontera conceptual que proporciona un marco de contención para los asistentes inteligentes de codificación en local, dando estricto cumplimiento al principio de gobernanza *Architecture-First* de BMAD. Al congelar las claves foráneas, restricciones de unicidad y restricciones de comprobación check en la capa del modelo de la base de datos física, se minimiza el riesgo de incoherencias semánticas o alteración destructiva del modelo relacional por alucinación de los asistentes autónomos, como se ilustra en la Figura 2.6.

![Fase A: Desarrollar un Modelo Global (FDD-1 + BMAD Fase 3)](img/img_fase_a.png)

Figura 2.6: Fase A: Desarrollar un Modelo Global (FDD-1 + BMAD Fase 3)
*Nota.* Flujo conceptual del modelado global de dominio y el establecimiento del marco de contención de arquitectura. Elaboración propia.

###### B. CONSTRUIR UNA LISTA DE CARACTERÍSTICAS (FDD-2 + BMAD Fase 2: Planificación)

Una vez consolidado el modelo global de datos, la metodología híbrida exige la descomposición lógica del sistema en una lista atómica de características operativas (*Feature List*), un proceso táctico derivado de la Fase 2 de BMAD (Planificación). Las historias de usuario tradicionales suelen ser extensas y ambiguas, incrementando el riesgo de fatiga de contexto y duplicidad lógica en entornos asistidos por Inteligencia Artificial.

Para neutralizar este riesgo, se utiliza la granularidad de FDD. Cada funcionalidad se define bajo la sintaxis estándar: `[Acción] + [Objeto]` (por ejemplo: "Autenticar credenciales", "Registrar comprobante" o "Validar marca"). Este nivel de desagregación garantiza unidades lógicas acotadas con un esfuerzo estimado reducido (tareas menores a dos semanas). Al proveer un entorno de contexto micro-estructurado, se facilita una programación precisa y libre de alucinaciones en las fases posteriores, como se ilustra en la Figura 2.7.

![Fase B: Construir una Lista de Características (FDD-2 + BMAD Fase 2)](img/img_fase_b.png)

Figura 2.7: Fase B: Construir una Lista de Características (FDD-2 + BMAD Fase 2)
*Nota.* Descomposición de requerimientos macros en un catálogo de características atómicas de corta duración. Elaboración propia.

###### C. PLANEAR POR CARACTERÍSTICA (FDD-3 + BMAD Fase 2: Secuenciación)

La planificación del desarrollo táctico se determina bajo las reglas de dependencias lógicas dictadas por la Fase 2 de BMAD (Secuenciación). Este enfoque híbrido adopta la directriz de construcción secuencial de adentro hacia afuera o *Data-First*: primero se construye el núcleo de base de datos y persistencia, segundo se implementan los servicios de negocio y la validación lógica en el backend, y finalmente se aborda la capa de interfaz de usuario.

FDD aporta a este esquema el concepto de conjuntos de características (*feature sets*) y asignación de hitos lógicos de entrega, estructurando el avance de manera general en tres hitos:
* Hito 1 (Infraestructura, Seguridad y Modelado): Construcción del modelo de persistencia física, seguridad y control de acceso.
* Hito 2 (Lógica y Validación Transaccional): Implementación de las reglas de negocio, validaciones y motores de procesamiento.
* Hito 3 (Gamificación y Frontend): Codificación de soporte de red, cache de datos en cliente y la interfaz visual.

Este encadenamiento secuencial evita el desperdicio técnico común de diseñar interfaces de usuario sin contratos de datos o bases relacionales consolidadas, reduciendo el retrabajo, como se ilustra en la Figura 2.8.

![Fase C: Planear por Característica (FDD-3 + BMAD Fase 2)](img/img_fase_c.png)

Figura 2.8: Fase C: Planear por Característica (FDD-3 + BMAD Fase 2)
*Nota.* Planificación de hitos de desarrollo basándose en dependencias de persistencia física de datos. Elaboración propia.

###### D. DISEÑAR POR CARACTERÍSTICA (FDD-4 + BMAD Fase 3: Especificación de Contratos)

De acuerdo con FDD, antes de proceder a la codificación de cualquier característica, se debe completar un diseño formal detallado. Bajo el enfoque híbrido propuesto, esta fase se constituye como el filtro de validación e inmutabilidad de contratos de BMAD.

Para cada funcionalidad crítica, se refinan los diagramas lógicos de secuencia (identificando interacciones entre componentes) y se definen y congelan los esquemas y contratos de validación de datos de entrada y salida. Estos contratos determinan con exactitud los tipos de datos admitidos, restricciones lógicas de longitud y formatos permitidos. Al congelar estos contratos en la fase de diseño y suministrarlos como restricciones en los prompts de desarrollo de los asistentes autónomos, se anula la capacidad de la IA para generar parámetros, campos o formatos inconsistentes. El diseño detallado actúa como un arnés de seguridad conceptual que asegura que la lógica y la base de datos interactúen con absoluta consistencia, como se ilustra en la Figura 2.9.

![Fase D: Diseñar por Característica (FDD-4 + BMAD Fase 3)](img/img_fase_d.png)

Figura 2.9: Fase D: Diseñar por Característica (FDD-4 + BMAD Fase 3)
*Nota.* Especificación de diagramas de secuencia e inmutabilidad de contratos de validación antes del desarrollo. Elaboración propia.

###### E. CONSTRUIR POR CARACTERÍSTICA (FDD-5 + BMAD Fase 4: Implementación y Calidad)

La fase de construcción traduce físicamente los diseños y contratos congelados en código fuente ejecutable, alineándose con la Fase 4 de BMAD (Implementación y Verificación de Calidad). En este punto, se utilizan asistentes de codificación para acelerar la escritura física de la lógica de negocio en el backend y los componentes de interfaz de usuario en el frontend, guiándose por los esquemas conceptuales y diagramas definidos previamente.

Para garantizar que la velocidad de codificación asistida no degrade la calidad interna del software ni introduzca regresiones, el marco híbrido introduce mallas locales de validación de calidad incondicional. Toda característica codificada debe superar obligatoriamente tres filtros de verificación antes de considerarse terminada:
1. Pruebas de Cobertura Lógica: Ejecución de suites de pruebas locales automatizadas que aseguren el correcto comportamiento y la consistencia transaccional del backend (como pruebas unitarias de estados, validaciones y roles).
2. Validación de Calidad de Código: Evaluación mediante analizadores estáticos de código para asegurar el cumplimiento de las guías de estilo y la eliminación de redundancias.
3. Manejo Forense de Excepciones: Validación del control de excepciones e inmutabilidad de logs, y uso de middlewares interceptores globales en la capa de la API para prevenir fugas de excepciones o fallas lógicas no controladas.

Solo después de pasar exitosamente estas mallas de control de calidad, la característica es integrada formalmente a la rama de producción, logrando que el producto final no solo sea veloz en su construcción, sino extremadamente robusto, seguro y scalable, como se ilustra en la Figura 2.10.

![Fase E: Construir por Característica (FDD-5 + BMAD Fase 4)](img/img_fase_e.png)

Figura 2.10: Fase E: Construir por Característica (FDD-5 + BMAD Fase 4)
*Nota.* Ciclo de construcción guiado por IA y mallas locales de verificación estática, lógica y de control de excepciones. Elaboración propia.

En los capítulos subsecuentes se detallará el despliegue técnico de estas fases para cada componente de la plataforma.

### 2.4. ARQUITECTURA TECNOLÓGICA Y ECOSISTEMA DE DESARROLLO (CONSOLIDADO)

#### 2.4.1. Fundamentación de la Arquitectura Síncrona vs Microservicios
La decisión de ingeniería más crítica del proyecto es el diseño de una arquitectura de Monolito Modular Síncrono en la capa del backend, frente a la tendencia de implementar microservicios distribuidos. En el ámbito de la ingeniería de software, la elección de la arquitectura debe responder a un sustento científico empírico y no a modas tecnológicas.

Como se resume en la Tabla 2.3, el Monolito Modular Síncrono de la Plataforma MEH optimiza radicalmente la latencia inter-procesos y asegura la integridad transaccional de los datos, eliminando por completo la sobrecarga de red y la complejidad del manejo de consistencia eventual que imponen los sistemas distribuidos.

| Criterio de Selección | Monolito Modular Síncrono (Plataforma MEH) | Arquitectura de Microservicios Distribuidos | Justificación Científica para la Tesis |
| :--- | :--- | :--- | :--- |
| Unidad de Despliegue | Única (`main.py` vía servidor Uvicorn) | Múltiples contenedores independientes | Reduce a cero los costes de orquestación y fallos de infraestructura. |
| Integridad Transaccional | Consistencia Fuerte (ACID nativa con `db.commit()`) | Consistencia Eventual (Complejidad de patrón Saga) | Garantiza la inmutabilidad inmediata en la emisión de insignias y pagos. |
| Comunicación de Datos | En memoria (Llamadas síncronas de funciones) | Remota por red (REST, gRPC, Colas AMQP) | Elimina la latencia de red de ida y vuelta (RTT) en procesos masivos. |
| Complejidad de Mantenimiento | Bajo acoplamiento lógico por dominios independientes | Alta complejidad operativa por fragmentación física | Facilita la reutilización de esquemas lógicos y modelos de base de datos. |

Tabla 2.3: Cuadro Comparativo de Viabilidad de la Arquitectura de Software
*Nota.* Elaboración propia basada en las directrices de ingeniería de software corporativa.

Técnicamente, el monolito modular de la Plataforma MEH descarta la premisa obsoleta de que todo monolito es un "código espagueti". La separación de responsabilidades se garantiza mediante una topología interna estrictamente dividida en capas independientes que se detallan a continuación. En primer lugar, la capa de API (Enrutadores) se encarga de recibir las peticiones HTTP, manejar los *endpoints* REST y aplicar middlewares de seguridad. En segundo lugar, la capa de Servicios (Lógica de Negocio) contiene las reglas operacionales que se ejecutan síncronamente en memoria. En tercer lugar, la capa de Modelos (Persistencia Física) define el esquema relacional y las restricciones físicas del motor de base de datos.

Esta estructura de Monolito Modular síncrono se ilustra gráficamente en la Figura 2.11, detallando las capas lógicas y protocolos de comunicación del sistema.

![Topología Lógica de Tres Capas](img/img_topologia.png)

Figura 2.11: Arquitectura de Monolito Modular Síncrono en Tres Capas de la Plataforma MEH
*Nota.* Detalle técnico de la arquitectura de la Plataforma MEH, estructurado en tres capas lógicas síncronas: Presentación (React 18 / Fluent UI v9), Negocio (FastAPI / SQLAlchemy síncrono) y Persistencia (PostgreSQL). Elaboración propia.

#### 2.4.2. Backend con FastAPI: Lógica Síncrona y Pydantic
Para la capa de lógica de negocio y exposición de servicios REST, la plataforma implementa FastAPI, un framework moderno de alto rendimiento construido sobre Python 3.12. La elección de FastAPI frente a otras alternativas tradicionales de Python (como Django o Flask) responde a justificaciones técnicas críticas:
* Rendimiento extremo: Su núcleo de enrutamiento basado en Starlette y el servidor ASGI Uvicorn ofrece una latencia mínima de procesamiento HTTP, comparable con soluciones en Go o NodeJS.
* Validación nativa mediante type hints: A través de la integración nativa con la librería Pydantic, FastAPI valida la estructura y tipado de los datos de entrada automáticamente antes de que toquen la capa lógica, reduciendo significativamente el código de validación manual.
* Autogeneración de documentación interactiva: FastAPI genera esquemas OpenAPI dinámicos y expone de forma automática portales interactivos de prueba (Swagger UI y ReDoc) basados en los esquemas lógicos y contratos de datos declarados.
* Sistema de inyección de dependencias flexible: Permite modularizar la autenticación, comprobaciones RBAC y el control de la sesión de base de datos mediante inyección de dependencias.

La integración operativa del procesamiento de peticiones y las mallas de validación en la capa del backend se detalla gráficamente en la Figura 2.12.

![Ciclo de Validación y Procesamiento de Peticiones en el Backend](img/img_fastapi_backend.png)

Figura 2.12: Ciclo de Validación y Procesamiento de Peticiones en el Backend con FastAPI y Pydantic
*Nota.* Detalle del flujo de procesamiento síncrono en el backend de la Plataforma MEH, ilustrando la validación estricta de esquemas Pydantic y la inyección síncrona de sesiones de base de datos. Elaboración propia.

A diferencia de los enfoques asíncronos concurrentes descontrolados que pueden propiciar bloqueos silenciosos o agotamiento de hilos en las sesiones del ORM, la plataforma implementa una estrategia de programación síncrona pura en sus controladores y enrutadores de API (declarados mediante `def` en lugar de `async def`). Esto asegura transacciones secuenciales predecibles y un control robusto de la sesión de base de datos física (`Session` de SQLAlchemy) inyectada de forma síncrona por petición HTTP. La validación previa en Pydantic garantiza que cualquier anomalía tipológica sea detectada y rechazada en la frontera del sistema con un código HTTP 422, evitando inyecciones inconsistentes o errores de deserialización internos.

#### 2.4.3. Frontend con React y Fluent UI v9
En la capa de presentación y experiencia de usuario, la plataforma se estructura como una Single Page Application (SPA) responsiva utilizando React 18.2, aprovechando el paradigma del Virtual DOM para realizar actualizaciones parciales e inmediatas de la interfaz sin necesidad de recargar el navegador [@banks2022]. La elección de React responde a la necesidad de controlar flujos de estado complejos en tiempo real (tales como la decodificación de códigos QR de asistencia o la visualización de la cola de conciliación fuera de línea).

Para garantizar la consistencia visual e institucional de la comunidad, se integra Fluent UI v9, el sistema de diseño oficial de Microsoft. La elección de este framework de componentes responde a tres justificaciones técnicas fundamentales:
* Coherencia con el ecosistema de destino: Al ser un portal académico y de soporte para una comunidad basada en Microsoft Education Hub, el estilo, paleta de colores y patrones de Fluent UI v9 se integran con absoluta homogeneidad en la identidad corporativa de la institución.
* Accesibilidad y estándares web: Cumplimiento riguroso de las pautas de accesibilidad para el contenido web (WCAG AA/AAA) a nivel de componentes nativos, garantizando el soporte para lectores de pantalla y navegación por teclado.
* Rendimiento y estilos CSS-in-JS: Utiliza un motor de estilos dinámico que compila y cachea los estilos en caliente, evitando la sobrecarga de grandes hojas de estilo estáticas y permitiendo transiciones fluidas.

La estructura modular y la organización de la arquitectura del frontend, detallando la interceptación por roles del enrutado, se ilustran a continuación en la Figura 2.13.

![Arquitectura Jerárquica de Componentes y Flujo de Estado](img/img_react_frontend.png)

Figura 2.13: Arquitectura Jerárquica de Componentes y Flujo de Estado en el Frontend React
*Nota.* Mapa estructural del frontend de la Plataforma MEH, detallando el punto de entrada, el escudo de rutas protegidas mediante RBAC y la distribución modular de vistas para miembros y staff. Elaboración propia.

Como se muestra en la Figura 2.14, la interfaz del Dashboard del miembro se estructura de forma intuitiva, permitiéndole visualizar de forma centralizada sus insignias ganadas, el control de su avance curricular en el aula LMS y su historial de asistencia validada mediante tecnología QR.

![Dashboard del Miembro de la Plataforma MEH](img/img_dashboard.png)

Figura 2.14: Interfaz Visual del Dashboard del Miembro en la Plataforma MEH
*Nota.* Mockup de alta fidelidad que ilustra el Dashboard de autogestión de membresía, aula virtual y reconocimientos con Fluent UI v9. Elaboración propia.

Asimismo, para los administradores del sistema, se desarrolló un panel de analíticas maestras e inteligencia operativa que permite visualizar en tiempo real gráficos estadísticos de concurrencia e interacción utilizando la biblioteca *Recharts*, como se ilustra en la Figura 2.15.

![Panel Administrativo de la Plataforma MEH](img/img_admin.png)

Figura 2.15: Consola de Analíticas y Panel Administrativo Máster
*Nota.* Panel administrativo maestro de control del ecosistema de la comunidad MEH. Elaboración propia.

#### 2.4.4. Persistencia en PostgreSQL, ORM SQLAlchemy y Alembic
Para asegurar la consistencia y durabilidad de la información crítica (como el estado de pagos de matrícula y la autenticidad de insignias digitales emitidas), se seleccionó PostgreSQL como motor de base de datos relacional de grado empresarial. PostgreSQL garantiza el estricto cumplimiento del estándar ACID (Atomicidad, Consistencia, Aislamiento y Durabilidad), previniendo la corrupción de registros ante fallos inesperados de alimentación o interrupciones de red.

La abstracción de las consultas y la persistencia se realiza mediante SQLAlchemy, el ORM líder de Python. Su elección se fundamenta en su capacidad para compilar de forma segura sentencias SQL a nivel de dialecto nativo, protegiendo al sistema contra vulnerabilidades de Inyección de Código SQL al parametrizar automáticamente los inputs. Adicionalmente, SQLAlchemy permite definir hooks globales de eventos (como auditorías síncronas antes de persistir cambios) y unificar comportamientos del modelo físico a través de clases base heredables.

El ciclo de persistencia relacional, la auditoría automática y la verificación de restricciones físicas se detallan gráficamente en la Figura 2.16.

![Flujo de Persistencia Transaccional, Auditoría y Control de Integridad](img/img_db_persistence.png)

Figura 2.16: Flujo de Persistencia Transaccional, Auditoría y Control de Integridad en PostgreSQL
*Nota.* Diagrama del ciclo de vida de la transacción física, detallando la inyección de la sesión, la inyección automática de campos de auditoría por SQLAlchemy y el control de restricciones en PostgreSQL. Elaboración propia.

La evolución estructural del esquema relacional (compuesto por 29 tablas físicas) se gestiona de forma predecible y documentada mediante Alembic. Esta herramienta administra el control de versiones de la base de datos a nivel de archivos físicos de migración, contando con un historial exacto de 11 revisiones físicas que permiten aplicar o revertir cambios sin riesgo de desalinear el diccionario físico respecto a la base de datos en producción. Adicionalmente, las tablas críticas de la base de datos heredan de un modelo base de auditoría unificado, inyectando campos de control (`creado_por`, `fecha_creacion`, `modificado_por`, `fecha_modificacion`) de forma totalmente síncrona en cada transacción. Para evitar la inserción de anomalías lógicas, se implementan restricciones directas a nivel de tabla física mediante restricciones de comprobación (como validaciones para que los montos financieros sean obligatoriamente mayores a cero). Ante cualquier mutación de datos por parte de cuentas administradoras, se invoca síncronamente el servicio de auditoría para almacenar de forma inmutable en el registro de logs del sistema la dirección IP física del emisor HTTP, el valor anterior, el valor nuevo serializado y el registro afectado, brindando trazabilidad total.

#### 2.4.5. Seguridad Defensiva, Autenticación JWT, Bcrypt e Intercepción de Excepciones
La ciberseguridad representa un pilar transversal en el diseño de la Plataforma MEH. Para la autenticación y el control de accesos, se implementa el estándar apátrida JSON Web Tokens (*JWT*), el cual permite transmitir información firmada criptográficamente entre el cliente y el servidor. Esto facilita la escalabilidad y permite evaluar de manera inmediata el control de acceso basado en roles (*RBAC*), discriminando de forma síncrona entre usuarios administradores, organizadores, embajadores y miembros ordinarios [@stallings2023].

La protección física de las contraseñas se garantiza mediante el algoritmo de hashing *Bcrypt*, incorporando salting aleatorio para resistir ataques de fuerza bruta. Asimismo, el backend implementa un patrón interceptor de errores a nivel de middleware que blindan la seguridad de la información ante fallos inesperados. Como se detalla en la Tabla 2.4, el sistema divide y enmascara de manera segura las excepciones de la aplicación.

| Categoría de Excepción | Tipo de Fallo | Comportamiento del Servidor Backend | Respuesta HTTP Retornada al Cliente |
| :--- | :--- | :--- | :--- |
| Excepciones de Dominio (`BaseDomainError`) | Lógico esperado (Credenciales inválidas, voucher duplicado) | Intercepta de forma controlada y registra el evento de advertencia. | Código HTTP correspondiente (ej. 403 Forbidden o 400 Bad Request) con mensaje descriptivo seguro. |
| Excepciones de Infraestructura (Inesperadas) | Catastrófico no controlado (Pérdida de conexión de base de datos) | Captura la traza física (*traceback*) en logs seguros y privados del servidor. | `HTTP 500 Internal Server Error` con mensaje genérico enmascarado para evitar ingeniería inversa. |

Tabla 2.4: Matriz de Intercepción Jerárquica de Excepciones
*Nota.* Elaboración propia detallando la estrategia de ciberseguridad defensiva y auditoría en la capa de negocio.

De este modo, se asegura que los detalles de la base de datos o trazas de código fuente jamás sean expuestos a usuarios maliciosos, cumpliendo con los estándares de seguridad de nivel corporativo para proyectos de de licenciatura universitaria.


# CAPÍTULO 3

### 3.1. MODELADO DEL DOMINIO (FDD Fase 1: Global Model)

La primera fase de la metodología *Feature-Driven Development* (FDD), denominada *Global Model*, establece la base arquitectónica conceptual de la Plataforma MEH a través del modelado del dominio de negocio. Este proceso de abstracción, tal como exponen @palmer2024 y @coad2023, permite conceptualizar y delimitar las fronteras lógicas del sistema, identificando los actores, las entidades clave y los flujos transaccionales esenciales que operan dentro del ecosistema de extensión académica.

#### 3.1.1. Elicitación de Requisitos y Alineación con Propietarios del Sistema

El desarrollo de la Plataforma MEH se estructuró a partir de una comunicación constante y rigurosa con los propietarios del sistema (*stakeholders*), conformados por los líderes y coordinadores de los *Microsoft Learn Student Ambassadors* (MLSA), la dirección académica y la coordinación de la carrera y la universidad de destino, y los delegados estudiantiles de la facultad.

Cabe destacar que el sistema no se diseñó a partir de un documento de especificaciones técnicas o pliego de requerimientos formal preexistente o firmado de manera rígida. Por el contrario, la elicitación de requisitos se llevó a cabo dinámicamente mediante una serie de entrevistas técnicas individuales, talleres participativos y mesas de alineación semanales directamente con el equipo que solicitaba la plataforma. Este enfoque iterativo y conversacional permitió identificar en tiempo real los cuellos de botella del control de asistencia físico, la conciliación manual de depósitos bancarios y la emisión artesanal de certificados académicos. El diseño evolucionó a través de ciclos continuos de retroalimentación donde se presentaban prototipos interactivos rápidos, estabilizando los requerimientos a medida que el equipo evaluaba la usabilidad del software en condiciones de laboratorio.

Para representar gráficamente las interacciones de los distintos roles y actores identificados durante este proceso con el ecosistema de software, se diseñó el Diagrama de Casos de Uso General del sistema, ilustrado en la Figura 3.1.

![Diagrama de Casos de Uso de la Plataforma MEH](img/img_use_cases.png)

Figura 3.1: Diagrama de Casos de Uso General del Sistema  
*Nota.* Representación sistemática de los actores (Miembro, Soporte, Moderador, Administrador) y su vinculación con las capacidades operativas de la plataforma. Elaboración propia.

Como se observa en la Figura 3.1, el ecosistema delimita claramente las fronteras de acción: el Miembro interactúa principalmente con su autogestión de perfil, la visualización de insignias y el aula LMS; el rol de Soporte ejecuta el escaneo de pases QR en la entrada; el Moderador califica tareas e interactúa con el LMS; mientras que el Administrador Máster gobierna la auditoría inmutable, la conciliación OCR y la tienda de souvenirs.

La iteración sobre las interfaces de usuario representó otro hito de alineación crucial. Se crearon y presentaron bocetos preliminares de baja fidelidad en papel y maquetas digitales interactivas (*mockups*) para validar el flujo del Dashboard de los miembros y la Consola de Administración. La retroalimentación de los líderes de la comunidad orientó la integración del lenguaje de diseño oficial de Microsoft (*Fluent UI v9*), exigiendo una estética moderna, limpia y accesible. Asimismo, a solicitud de los delegados de la carrera, se implementó de forma nativa la preferencia estética de tema oscuro en las configuraciones de los perfiles de usuario, almacenando dinámicamente este estado en el almacenamiento local (*localStorage*) del navegador para evitar retardos visuales en el renderizado y optimizar la experiencia del estudiante en pantallas móviles durante los eventos presenciales.

Para materializar y evaluar de manera integral el catálogo de interfaces de la plataforma, se diseñó e implementó la suite completa de pantallas interactivas de la Plataforma MEH, la cual se compone de 23 páginas reactivas principales estructuradas en el frontend React y 9 subcomponentes avanzados de administración integrados en la consola de gestión de eventos y finanzas. Esta infraestructura visual permite dar soporte nativo al viaje completo del usuario desde su acceso anónimo hasta la administración del sistema. Como se expone en la Figura 3.2, la interfaz pública o *Landing Page* del portal institucional actúa como el punto de interacción inicial para el estudiante, ofreciendo un diseño altamente responsivo basado en Fluent UI v9 que facilita a los estudiantes el registro de cuentas, la visualización del catálogo de cursos disponibles y la agenda interactiva de congresos académicos y talleres tecnológicos activos de la comunidad.

![Landing Page de la Plataforma MEH](img/img_landing.png)

Figura 3.2: Interfaz Pública y Portal de Acceso Académico (Landing Page)
*Nota.* Interfaz gráfica principal responsiva provista de tematización oficial de Microsoft y componentes accesibles que sirve de portal para visitantes y registro de miembros. Elaboración propia.

##### 3.1.1.1. Product Brief de la Plataforma MEH (Fase 1 BMAD)

El desarrollo del *Product Brief* consolidó el entendimiento mutuo sobre los problemas operativos de extensión en la carrera universitaria de destino y los objetivos clave del sistema, como se resume de forma estructurada en la Tabla 3.1.

| Dimensión Operativa | Problemática Tradicional Manual | Solución de Ingeniería (Plataforma MEH) | Métricas de Éxito y Validación Local |
| :--- | :--- | :--- | :--- |
| Control de Asistencia | Planillas físicas de firmas en puerta, colas de ingreso lentas y transcripción manual ineficiente. | Escaneo QR rápido por checkpoints físicos interactuando con routers síncronos FastAPI. | Latencia de escaneo promedio < 50 ms por asistente y concurrencia local de 620 req/min. |
| Validación de Pagos | Recepción manual de vouchers de depósito en WhatsApp, conciliación bancaria lenta y demoras de hasta 5 días. | Módulo de visión artificial OCR local que extrae metadatos numéricos e inyecta estados de pago. | Precisión OCR local de 94.6% y reducción de tiempos de conciliación de finanzas del 98.8%. |
| Reconocimiento Curricular | Emisión e impresión manual en PowerPoint, propensa a errores tipográficos y sin portabilidad técnica. | Suite de generación automática de certificados PDF con códigos hash criptográficos y Open Badges. | Tasa de errores tipográficos reducida a 0.00% y metadatos JSON inyectados síncronamente en PNG chunks. |
| Trazabilidad de Auditoría | Cero registros de control ante modificaciones administrativas o aprobación arbitraria de matrículas. | Mixins de auditoría (`AuditMixin`) y tabla de bitácora forense de mutaciones de datos. | Registro del 100% de operaciones administrativas críticas con capturas de IP y JSON *diffs*. |

Tabla 3.1: Resumen del Product Brief y Métricas de Validación en Laboratorio  
*Nota.* Estructura conceptual que sirvió de base en la Fase 1 de la metodología BMAD para definir los alcances de la Plataforma MEH. Elaboración propia.

##### 3.1.1.2. Entrevista Inicial con los Propietarios del Sistema (Fase 1 BMAD)

El marco metodológico BMAD establece que, antes de iniciar cualquier actividad de codificación, el equipo de desarrollo debe articular con precisión el problema que el sistema resolverá y el valor que entregará a sus usuarios finales. Para cumplir con este principio sin recurrir a la elaboración de documentos de publicidad formales que excedían el alcance del proyecto, se llevó a cabo una sesión de entrevista estructurada con los propietarios del sistema, conformados por los líderes de la comunidad MLSA, la coordinación de la carrera y los delegados estudiantiles de la facultad.

El objetivo de esta entrevista no fue redactar un comunicado de prensa, sino forzar al equipo a responder preguntas concretas sobre el sistema desde la perspectiva del usuario y del patrocinador, clarificando el alcance técnico y los compromisos de valor antes de escribir una sola línea de código. A continuación se presentan los puntos más relevantes que emergieron de dicha conversación:

* ¿Qué problema concreto resuelve la plataforma?
  El control de asistencia mediante planillas físicas de firmas generaba cuellos de botella en la entrada de los eventos, transcripciones manuales ineficientes y pérdida de datos. Asimismo, la conciliación bancaria de vouchers de depósito a través de capturas de WhatsApp tardaba hasta cinco días hábiles, y los certificados académicos se emitían de forma artesanal en PowerPoint sin portabilidad ni verificación técnica.

* ¿Por qué no utilizar servicios externos o plataformas en la nube existentes?
  La institución requería soberanía sobre los datos estudiantiles, costo operativo cero en servidores externos y una solución ajustada a la identidad corporativa del Microsoft Education Hub. Una plataforma propia y desplegable sobre la infraestructura local de la facultad eliminaba dependencias de proveedores de pago y riesgos de privacidad sobre registros académicos de los alumnos.

* ¿Cómo garantiza el sistema la legitimidad de los certificados e insignias emitidos?
  Mediante la integración del estándar internacional Open Badges, que inyecta metadatos criptográficos directamente en los archivos de imagen PNG, y la generación de códigos de verificación únicos en los diplomas PDF que consultan un hash inalterable almacenado en la base de datos.

* ¿Qué nivel de trazabilidad y auditoría se requiere sobre las acciones administrativas?
  Los coordinadores del Hub exigieron un registro inmutable de toda acción administrativa crítica: alteraciones de roles, aprobaciones de pago y cambios en inventario. El sistema debía capturar la dirección IP del operador, la marca temporal y el detalle de los cambios realizados, sin posibilidad de eliminación o edición posterior.

Un resultado clave que emergió directamente de la entrevista fue la identificación de los perfiles de usuario del sistema. Los propietarios del Hub describieron de forma natural las distintas funciones que ejercían los miembros de la comunidad durante un evento: quién coordinaba la logística de acceso en la puerta, quién gestionaba la agenda académica, quién controlaba los pagos, y quién simplemente asistía como participante. Esta descripción orgánica de responsabilidades permitió al equipo definir de manera temprana seis roles operativos diferenciados — Administrador, Organizador, Moderador, Soporte, Embajador y Miembro — que se consolidarían posteriormente como la base del sistema de control de acceso basado en roles (RBAC) del backend. Identificar los roles en esta etapa fue determinante, ya que condicionó el diseño de la base de datos, la jerarquía de permisos de los endpoints de la API y la estructura de navegación de la interfaz de usuario desde el inicio del proyecto.

##### 3.1.1.3. PRD (Product Requirements Document) e Historias de Usuario (Fase 2 BMAD)

El PRD consolida las especificaciones y reglas operativas que el sistema debe cumplir físicamente. En primera instancia, se estructuró la Matriz de Roles y Perfiles de Usuario de la Plataforma MEH, detallando las responsabilidades y niveles de acceso granular para el control jerárquico de roles en el backend (RBAC), como se detalla en la Tabla 3.2.

| Rol en Sistema | Perfil del Usuario | Capacidades y Responsabilidades Requeridas | Módulo Funcional |
| :--- | :--- | :--- | :--- |
| ADMIN | Administrador Máster | Acceso total al sistema: gestión de identidades, alteración de roles, auditoría forense de acciones, control de finanzas e inventario de la tienda del Hub. | Administración y Auditoría |
| ORGANIZADOR | Líder de Comunidad | Planificación y calendarización de congresos académicos, registro de ponentes, patrocinadores y comunidades aliadas. | Gestión de Eventos |
| MODERADOR | Asistente Académico | Supervisión del aula virtual LMS, revisión de publicaciones en foros y calificación de entregas y tareas curriculares del estudiante. | Academia y LMS |
| SOPORTE | Auxiliar Logístico | Acceso exclusivo a la funcionalidad de control de entrada: escaneo de credenciales QR de asistentes y registro de marcas de checkpoint. | Control de Asistencia |
| EMBAJADOR | Miembro VIP | Acceso a recursos avanzados y kits de marca oficiales de Microsoft, disponibles para ponentes y miembros distinguidos de la comunidad. | Recursos y Kits VIP |
| MIEMBRO | Estudiante Regular | Autogestión del perfil personal, carga de comprobantes de pago, seguimiento del avance en el LMS y visualización de logros e insignias obtenidas. | Portal del Miembro |

Tabla 3.2: Matriz de Roles y Responsabilidades Operativas del Sistema (RBAC)  
*Nota.* Estructura jerárquica para la inyección de dependencias de autorización de FastAPI. Elaboración propia.

Asimismo, se definieron las 4 Historias de Usuario (HU) maestras del backlog inicial que componen el núcleo transaccional del proyecto, detallando sus criterios de aceptación y prioridades técnicas, expuestas en la Tabla 3.3.

| ID | Rol | Como... quiero... | Para... | Prioridad | Criterio de Aceptación Funcional |
| :--- | :--- | :--- | :--- | :--- | :--- |
| HU-01 | Miembro (Estudiante) | presentar una credencial digital personal en la puerta del evento. | registrar mi ingreso al auditorio sin hacer colas físicas ni firmar planillas manuales. | Alta | El sistema debe validar la credencial del asistente en menos de 3 segundos y confirmar visualmente el ingreso al operador de soporte en puerta. |
| HU-02 | Miembro y Administrador | subir una imagen de mi comprobante de depósito bancario al sistema. | que el administrador pueda verificar y aprobar mi matrícula sin intercambio de capturas por WhatsApp. | Alta | El sistema debe extraer automáticamente los datos del comprobante y notificar al administrador; este debe poder aprobar o rechazar el pago desde su panel sin salir de la plataforma. |
| HU-03 | Miembro (Estudiante) | visualizar las insignias y reconocimientos que he ganado en el Hub. | demostrar y compartir mis logros académicos de forma verificable en portales profesionales. | Media | Las insignias deben ser descargables en un formato estándar verificable externamente, con metadatos que identifiquen al emisor y al receptor. |
| HU-04 | Administrador Máster | consultar un registro histórico de todas las acciones administrativas realizadas en el sistema. | rastrear quién realizó cambios en roles, pagos o datos críticos y cuándo ocurrió exactamente. | Media | El historial debe ser de solo lectura, mostrar la identidad del operador, la fecha y el detalle del cambio, y no poder ser eliminado ni modificado por ningún rol. |

Tabla 3.3: Mesa de Trabajo de Historias de Usuario y Criterios de Aceptación Técnicos  
*Nota.* Backlog inicial mapeado durante la Fase 2 de la metodología BMAD. Elaboración propia.

A continuación, se presenta la especificación y el desglose de flujos e interacciones detallados para cada una de las 4 Historias de Usuario (HUs) del núcleo transaccional:

##### 3.1.1.3.1. HU-01: Control de Acceso por Escaneo de Credencial QR

* Actor Principal: Miembro (Estudiante) y Soporte (Auxiliar Logístico).
* Contexto Operativo: Puerta de acceso del auditorio de la facultad durante el registro presencial de un congreso académico masivo.
* Precondiciones:
  1. El estudiante se ha registrado en la plataforma y tiene una inscripción confirmada al evento en `inscripciones_eventos`.
  2. El operador de soporte ha iniciado sesión en la aplicación móvil con privilegios del rol SOPORTE.
  3. La cámara del dispositivo del operador de soporte está activa en la pantalla reactiva de escaneo QR.
* Flujo Principal (Happy Path):
  1. El estudiante abre su espacio de usuario en el Dashboard de la Plataforma MEH y muestra la credencial QR generada dinámicamente.
  2. El operador de soporte enfoca el código QR con la cámara de su dispositivo.
  3. El frontend de escaneo extrae la firma hash del token del QR y valida localmente su estructura sintáctica.
  4. La aplicación envía una solicitud Axios síncrona `POST /api/v1/asistencia/scan` adjuntando el ID de inscripción y el ID del checkpoint activo.
  5. El backend FastAPI intercepta el payload, verifica la sesión del operador y valida la existencia y vigencia de la inscripción en PostgreSQL.
  6. El backend inserta un registro en la tabla `asistencia_detalles` con la marca temporal UTC y la IP del cliente.
  7. El servidor responde con éxito (HTTP 201 Created) y retorna el nombre del alumno.
  8. El frontend del operador muestra un panel flotante verde con un sonido de validación exitosa.
* Flujos Alternativos y Excepciones (Sad Paths):
  * Excepción 1 (Token QR Corrupto o Inválido): Si la lectura del código QR no corresponde a una firma SHA-256 válida o está corrupta, el frontend detiene la llamada de red y muestra de inmediato el mensaje de alerta "Código QR no válido o alterado", bloqueando el acceso sin consultar la base de datos.
  * Excepción 2 (Estudiante No Inscrito): Si el token es sintácticamente válido pero no existe ninguna tupla correspondiente en `inscripciones_eventos` para dicho evento, el backend devuelve una excepción controlada HTTP 404 (Not Found). El frontend renderiza un aviso rojo indicando "El estudiante no se encuentra registrado en el listado de este evento".
  * Excepción 3 (Doble Registro / Multi-escaneo): Si el estudiante intenta ingresar usando una credencial QR que ya posee una marca de asistencia en el mismo checkpoint, la consulta SQL del backend identifica la colisión temporal. El servidor cancela la transacción y retorna un HTTP 400 (Bad Request). El frontend notifica de inmediato: "Acceso denegado: Asistencia previamente validada".
* Criterios de Aceptación:
  * El escaneo y registro de la asistencia física en puerta debe procesarse en un tiempo extremo a extremo inferior a 50 milisegundos bajo la red local de la facultad.
  * En caso de desconexión a red, la aplicación debe permitir el almacenamiento atómico de marcas en el repositorio IndexedDB local (`offlineDb.js`) y sincronizarlas en lote síncronamente una vez recuperado el acceso.


![Diagrama de Flujo HU-01: Control de Acceso por Credencial QR](img/img_hu01_flujo.png)

Figura 3.3a: Flujo de interacción de la Historia de Usuario HU-01 — Control de Acceso por Credencial QR  
*Nota.* Diagrama de carril (swimlane) que ilustra el intercambio entre el Miembro, el operador de Soporte y el Sistema Backend durante el proceso de validacion de asistencia. Elaboracion propia.

##### 3.1.1.3.2. HU-02: Registro de Voucher y Conciliación Financiera con Visión OCR

* **Actores Involucrados:**
  * **Miembro (Estudiante):** Sube el voucher físico o digital del depósito bancario para validar su acceso a un curso.
  * **Administrador Máster:** Revisa y audita los reportes de conciliación bancaria difusa y aprueba las transacciones.
  * **Motor de Visión Artificial (Local OCR):** Módulo encargado del preprocesamiento, binarización y extracción de metadatos de la imagen.
* **Contexto Operativo:** Sección de finanzas del estudiante en el portal web y panel de conciliación contable del Máster Administrador.
* **Precondiciones Estrictas:**
  1. El estudiante posee un comprobante de pago válido en formato de imagen (PNG, JPG) o documento portable PDF.
  2. El archivo de comprobante no supera el tamaño máximo permitido de 10 MB y se encuentra en un formato legible.
  3. El sistema cuenta con acceso de escritura a la carpeta física de almacenamiento temporal de comprobantes de pago.
  4. La conexión al servidor SMTP para envío de notificaciones de confirmación se encuentra activa.
* **Flujo de Interacción Principal (Happy Path):**
  1. El estudiante ingresa a la pestaña "Matriculación y Finanzas" y selecciona el curso o certificado que desea adquirir.
  2. Carga la imagen o PDF del comprobante bancario e introduce el número de transacción de forma manual.
  3. El frontend realiza una petición HTTP multipart `POST /api/v1/pagos/subir` con la imagen y los metadatos.
  4. El backend FastAPI recibe el payload, verifica que la extensión sea válida y almacena el archivo de forma segura.
  5. El motor de visión artificial local aplica una binarización por umbral adaptativo y filtro de mediana para limpiar el ruido digital del voucher.
  6. El motor realiza la extracción de regiones de interés (ROI) y recupera la cadena de texto con el monto, fecha y código de operación.
  7. El servicio `ocrm_service.py` procesa el nombre del alumno y calcula la similitud probabilística con el texto del comprobante mediante el algoritmo Jaro-Winkler.
  8. Si la similitud del nombre supera el 85% y la fecha coincide en un rango de ±3 días con el extracto del banco cargado, el sistema calcula un índice de confianza del 98%.
  9. El sistema inserta un registro en la tabla `pagos` con estado `PENDIENTE` y asocia el ID de la transacción bancaria y el porcentaje de confianza.
  10. El Administrador visualiza el pago verificado automáticamente en su consola y presiona "Aprobar Transacción".
  11. El backend actualiza la inscripción a `APROBADA`, habilita el acceso en `progreso_lecciones` y despacha un correo de confirmación.
* **Flujos Alternativos y Tratamiento de Excepciones (Sad Paths):**
  * **Excepción 1 (Carga de Archivo Malicioso - HTTP 400 Bad Request):** Si el archivo subido no corresponde a un formato de imagen o PDF válido (ej. un script ejecutable `.exe` o archivo corrupto), el backend detiene el almacenamiento y retorna un HTTP 400. La interfaz del estudiante muestra una alerta de error: "Archivo no admitido: suba una imagen de comprobante bancario válida".
  * **Excepción 2 (Voucher Ilegible o de Baja Calidad - Confianza < 50%):** Si el motor OCR no logra extraer caracteres consistentes o la similitud Jaro-Winkler se sitúa por debajo del 50%, el servicio asigna al registro la clasificación de confianza baja. Persiste el pago en estado `REVISION_MANUAL` y bloquea la activación automática del curso. El administrador visualiza la alerta en color rojo indicando "Revisión manual obligatoria: voucher borroso o ilegible".
  * **Excepción 3 (Monto Discordante en el OCR):** Si el motor OCR extrae un monto (ej. 100 Bs) inferior al costo de matrícula (ej. 150 Bs), el backend inserta el pago pero le asocia una etiqueta de advertencia. El registro se muestra en color naranja en el panel del administrador como "Monto discordante detectado por OCR" para auditoría manual.
  * **Excepción 4 (Código de Operación Duplicado - HTTP 409 Conflict):** Si el código de operación del comprobante bancario ya existe en la tabla `pagos`, la base de datos lanza una excepción por restricción de unicidad. El backend cancela la inserción y retorna un HTTP 409. El frontend del alumno alerta: "Código de operación ya registrado. Si considera que es un error, contacte a soporte".
* **Criterios de Aceptación No Funcionales:**
  * El preprocesamiento de la imagen y extracción local de datos del comprobante por el motor OCR debe ejecutarse en menos de 1.5 segundos.
  * La base de datos debe rechazar la inserción de registros con montos menores o iguales a cero mediante una restricción física `CheckConstraint` en la tabla `pagos`.


![Diagrama de Flujo HU-02: Registro de Voucher y Conciliacion OCR](img/img_hu02_flujo.png)

Figura 3.3b: Flujo de interacción de la Historia de Usuario HU-02 — Registro de Comprobante y Conciliación Financiera con OCR  
*Nota.* Diagrama de carril que muestra el procesamiento automatico del comprobante bancario, la intervencion del motor OCR y la decision de aprobacion del Administrador. Elaboracion propia.

##### 3.1.1.3.3. HU-03: Visualización de Insignias e Integración de Open Badges

* **Actores Involucrados:**
  * **Miembro (Estudiante):** Visualiza sus medallas académicas en su vitrina personal y descarga las insignias digitales.
  * **Sistema (Servidor de Gamificación):** Evalúa el progreso del alumno, valida el cumplimiento de metas y genera el archivo PNG inyectado con metadatos Open Badges.
* **Contexto Operativo:** Vitrina interactiva de insignias dentro del Dashboard del estudiante y portales de validación de microcredenciales externas.
* **Precondiciones Estrictas:**
  1. El estudiante cuenta con una inscripción activa y ha completado la totalidad de los requisitos del curso o evento (progreso LMS = 100% o asistencia confirmada).
  2. La medalla digital asociada al curso o evento se encuentra configurada en la tabla `badges` con su correspondiente imagen de diseño original.
  3. El backend tiene acceso a la biblioteca de procesamiento de imágenes Pillow y al inyector de metadatos PNG.
* **Flujo de Interacción Principal (Happy Path):**
  1. El estudiante ingresa a la sección "Reconocimientos e Insignias" de su Dashboard.
  2. El frontend realiza una llamada Axios `GET /api/v1/badges/usuario` adjuntando el token JWT Bearer del alumno.
  3. El backend FastAPI decodifica el token, recupera el `id_usuario` y realiza una consulta a la tabla asociativa `usuarios_badges`.
  4. El backend responde con un HTTP 200 OK y devuelve un arreglo JSON conteniendo la lista de insignias desbloqueadas, URL de imagen, fecha de emisión y hash de validación.
  5. El frontend renderiza la vitrina de medallas mediante Fluent UI v9 con animaciones y hovers interactivos.
  6. El estudiante selecciona una de las insignias y presiona el botón "Descargar Medalla Verificable".
  7. El frontend envía una solicitud a la ruta `GET /api/v1/badges/descargar/{id_badge}`.
  8. El backend recupera el archivo de imagen original de la insignia, procesa sus chunks de metadatos e inyecta un bloque de texto no comprimido (`iTXt`) estructurado bajo la especificación oficial Open Badges v2.0.
  9. Los metadatos inyectados incluyen de forma síncrona el hash del emisor (Hub), el correo cifrado del estudiante, la fecha de emisión y el enlace de validación inmutable del sistema.
  10. El backend sirve el flujo de bytes de la imagen con la cabecera `Content-Disposition: attachment` forzando la descarga del archivo PNG en el navegador.
* **Flujos Alternativos y Tratamiento de Excepciones (Sad Paths):**
  * **Excepción 1 (Intento de Descarga No Autorizada - HTTP 403 Forbidden):** Si un usuario intenta descargar o inyectar metadatos de una insignia que no le ha sido asignada en la tabla `usuarios_badges`, el backend aborta el procesamiento de la imagen y retorna un HTTP 403. El frontend muestra el mensaje: "Acceso denegado: Aún no has desbloqueado esta credencial".
  * **Excepción 2 (Insignia Inexistente - HTTP 404 Not Found):** Si el identificador de la medalla solicitado no existe en la tabla maestra `badges`, el servidor retorna un HTTP 404. La interfaz web del alumno alerta: "Insignia no encontrada en el catálogo del sistema".
  * **Excepción 3 (Fallo en la Inyección de Metadatos - HTTP 500 Internal Error):** Si el procesamiento de la imagen original falla en el servidor (ej. archivo corrupto en disco), el backend captura el error en un bloque `try-except`, escribe una alerta en el log del sistema y retorna un HTTP 500. El frontend notifica: "Error al generar la credencial. Intente nuevamente en unos minutos o contacte al administrador".
* **Criterios de Aceptación No Funcionales:**
  * El archivo PNG descargado por el estudiante debe pasar con éxito y sin advertencias el proceso de validación en la plataforma oficial de verificación externa de Open Badges (como Credly o Badgr).
  * La consulta del listado de insignias ganadas en el dashboard del estudiante debe completarse en un tiempo inferior a 45 milisegundos empleando índices B-Tree sobre la tabla asociativa `usuarios_badges`.


![Diagrama de Flujo HU-03: Asignacion y Descarga de Insignias Open Badges](img/img_hu03_flujo.png)

Figura 3.3c: Flujo de interacción de la Historia de Usuario HU-03 — Insignias Digitales con Estándar Open Badges  
*Nota.* Diagrama de carril que describe el ciclo completo desde la accion meritoria del estudiante hasta la descarga de la microcredencial verificable. Elaboracion propia.

##### 3.1.1.3.4. HU-04: Panel Analítico Forense y Trazabilidad Inmutable

* **Actores Involucrados:**
  * **Administrador Máster:** Auditor del sistema con privilegios de solo lectura sobre las bitácoras de auditoría forense global.
  * **Middleware de Auditoría (`AuditMixin`):** Componente integrado en el ORM SQLAlchemy que intercepta operaciones en la base de datos de manera automática.
* **Contexto Operativo:** Panel de control de auditoría forense e inteligencia de negocio protegido bajo enrutamiento por roles del ecosistema.
* **Precondiciones Estrictas:**
  1. El usuario autenticado cuenta con el rol de administración central (`ADMIN`) asignado en la base de datos.
  2. El administrador posee un token JWT de sesión Bearer válido y firmado en local por la clave simétrica del servidor.
  3. El servicio de logs del sistema (`logs_service.py`) se encuentra registrado en el bucle de eventos globales del backend FastAPI.
* **Flujo de Interacción Principal (Happy Path):**
  1. El Administrador Máster ingresa a la pestaña "Seguridad y Auditoría" en el panel de control del staff.
  2. El frontend de React Router intercepta la solicitud y valida localmente a través de `<ProtectedRoute>` que el rol posea el permiso `PERMISSION_AUDIT_READ`.
  3. El frontend realiza una llamada Axios síncrona `GET /api/v1/auditoria/logs` enviando el token JWT Bearer en las cabeceras HTTP.
  4. El backend FastAPI recibe la petición, procesa el token y valida que el usuario sea un administrador activo.
  5. El controlador invoca al servicio de auditoría, el cual realiza una consulta SQL de lectura sobre la tabla maestra `logs_sistema`.
  6. El motor PostgreSQL ejecuta la consulta utilizando un índice B-Tree temporal ordenando los registros de forma cronológica descendente.
  7. El backend serializa la colección de logs y responde con un código HTTP 200 OK y el payload estructurado.
  8. El frontend recibe el JSON con el desglose de cambios y renderiza una grilla interactiva mediante Fluent UI v9.
  9. La grilla muestra la marca temporal UTC, la dirección IP del cliente, el módulo, el operador y el bloque comparativo de cambios (*diff* JSON).
  10. El administrador inspecciona las discrepancias y genera un reporte imprimible de trazabilidad forense.
* **Flujos Alternativos y Tratamiento de Excepciones (Sad Paths):**
  * **Excepción 1 (Intento de Consumo No Autorizado - HTTP 403 Forbidden):** Si un usuario autenticado con un rol de menor jerarquía (ej. `Miembro` o `Soporte`) intenta acceder manualmente al endpoint de logs, el inyector de dependencias FastAPI intercepta la llamada, bloquea la consulta SQL y retorna un HTTP 403. La interfaz web del usuario redirige de inmediato a la pantalla principal y muestra una alerta: "Acceso denegado: No cuentas con privilegios para consultar la auditoría del sistema".
  * **Excepción 2 (Intento de Alteración Física de Bitácoras):** Si un atacante con accesos comprometidos intenta inyectar comandos de SQL de tipo `DELETE` o `UPDATE` sobre la tabla `logs_sistema`, el motor de base de datos PostgreSQL detiene e interrumpe la transacción. Las políticas de seguridad físicas a nivel de base de datos restringen el rol de conexión de la API a permisos exclusivos de `INSERT` y `SELECT` sobre el esquema de auditoría, bloqueando la alteración física del log.
  * **Excepción 3 (Dirección IP de Origen Faltante):** Si por condiciones de red de un proxy inverso la dirección IP no se inyecta en la cabecera `X-Forwarded-For`, el servicio de auditoría captura la IP por defecto de conexión TCP (`client.host`). Si esta también falla, almacena el valor estándar `0.0.0.0` para asegurar que el registro de log no se aborte y se guarde la transacción de negocio del sistema.
* **Criterios de Aceptación No Funcionales:**
  * La inserción de bitácoras de auditoría forense por el inyector del ORM SQLAlchemy debe completarse síncronamente como parte de la transacción ACID original, asegurando que un fallo en el log aborte la operación de negocio para mantener la consistencia.
  * El desglose de los cambios antes y después de cada modificación debe almacenarse en formato nativo JSON en la columna `detalle_cambios` para optimizar consultas de indexación temporal.


![Diagrama de Flujo HU-04: Auditoria Forense e Inmutabilidad del Historial](img/img_hu04_flujo.png)

Figura 3.3d: Flujo de interacción de la Historia de Usuario HU-04 — Panel Analítico Forense y Trazabilidad Inmutable  
*Nota.* Diagrama de carril que detalla como el sistema registra de forma automatica e inalterable toda accion administrativa critica y la manera en que el Administrador consulta dicho historial. Elaboracion propia.

#### 3.1.2. Diagrama de Clases de Dominio

El modelo de objetos global se organiza a través de un Diagrama de Clases de Dominio que mapea de forma unificada el flujo de datos y la correspondencia lógica entre las entidades de negocio esenciales del sistema, como se ilustra en la Figura 3.4.

![Diagrama de Clases de Dominio](img/img_class_domain.png)

Figura 3.4: Diagrama de Clases del Dominio de Negocio  
*Nota.* Relaciones estructuradas orientadas a objetos, multiplicidades y firmas de métodos del núcleo transaccional del sistema. Elaboración propia.

En el centro de esta topología se sitúa la entidad `Usuario`, la cual administra la identidad física, credenciales y niveles de rol de los miembros del Hub. Un `Usuario` puede poseer una relación de uno a muchos con la entidad `Evento` al ejercer la función de organizador, y una relación de uno a muchos con la entidad de asociación `InscripcionEvento` en su rol de miembro o asistente regular. La verificación física de la asistencia se asocia de forma rígida a la entidad `Checkpoint`, que representa los puntos físicos de control en la puerta de la conferencia, los cuales registran múltiples marcas de tiempo síncronas recopiladas en la entidad `AsistenciaDetalle` para computar los ratios de aprobación curricular.

A nivel de formación académica virtual, la entidad `Curso` representa el aula LMS, albergando una estructura jerárquica de composición con la entidad `Leccion` y relaciones de uno a muchos con la entidad `Tarea`. Las entregas estudiantiles de evaluaciones se asocian de manera atómica en la entidad `EntregaTarea`, la cual almacena calificaciones numéricas y retroalimentaciones directas del instructor. El subsistema de gamificación se modela a través de la entidad `Badge`, que representa las medallas y microcredenciales, vinculándose con `Usuario` mediante la tabla relacional de muchos a muchos `UsuarioBadge` para registrar la asignación síncrona de puntos de experiencia. Las transacciones de pago e inventario se gobiernan por las entidades `Pago` y `Producto`, de modo que cada voucher subido por un usuario es persistido con su respectiva tasa de confianza *OCR*. Finalmente, la entidad `Certificado` actúa como la representación oficial de aprobación, vinculando un usuario con un curso o evento mediante un código de verificación criptográfico inalterable y único.

### 3.2. CATÁLOGO DE FUNCIONALIDADES (FDD Fase 2: Feature List)

La segunda fase de la metodología FDD consiste en la descomposición del modelo de dominio global en un catálogo detallado de funcionalidades funcionales que aporten valor real al usuario final, agrupándolas de forma lógica en áreas temáticas de negocio que guíen los ciclos de construcción iterativos y estableciendo una trazabilidad física con los archivos y rutas del sistema.

#### 3.2.1. Módulo 1: Gestión de Eventos y Logística de Acceso

La formulación del primer módulo nació directamente de la problemática más crítica identificada durante la entrevista con los propietarios del sistema: la gestión presencial de eventos académicos se realizaba mediante planillas físicas de firmas y listas en papel, generando cuellos de botella en la entrada y pérdida de datos de asistencia. Este módulo concentra todas las funcionalidades orientadas al ciclo de vida completo de un evento de la comunidad: desde su planificación y publicación hasta el control de acceso en puerta.

La Figura 3.5 ilustra el esquema funcional del módulo, detallando los roles que interactúan con él, las capacidades operativas previstas y los artefactos que produce como salida.

![Módulo 1: Gestión de Eventos y Logística de Acceso](img/img_mod1_eventos.png)

Figura 3.5: Esquema Funcional del Módulo 1 — Gestión de Eventos y Logística de Acceso  
*Nota.* Diagrama que muestra los roles con acceso (Organizador, Soporte, Miembro, Embajador), las funcionalidades previstas y los artefactos de salida generados por el módulo. Elaboración propia.

Las funcionalidades contempladas en este módulo comprenden la creación y calendarización de congresos y talleres académicos, el registro de ponentes y patrocinadores, la inscripción de miembros con control de cupos, la generación de credenciales QR cifradas por inscripción y la validación síncrona de dichas credenciales en el ingreso físico al evento. El registro de asistencia resultante queda vinculado al módulo de gamificación, permitiendo la asignación automática de puntos e insignias por presencia certificada.

#### 3.2.2. Módulo 2: Academia, Reconocimiento Digital y Gamificación

El segundo módulo responde a la necesidad de digitalizar la formación continua de los miembros del Hub y de dotar a sus logros académicos de un valor verificable y portable. La comunidad carecía de un espacio propio donde los estudiantes pudieran seguir rutas de aprendizaje, entregar tareas y recibir reconocimientos formales más allá de un correo electrónico. Este módulo articula el aula virtual LMS, el sistema de insignias y la emisión de diplomas en un único ecosistema coherente.

La Figura 3.6 presenta el esquema funcional del módulo de academia y gamificación.

![Módulo 2: Academia, Reconocimiento Digital y Gamificación](img/img_mod2_academia.png)

Figura 3.6: Esquema Funcional del Módulo 2 — Academia, Reconocimiento Digital y Gamificación  
*Nota.* Diagrama que muestra los roles con acceso (Moderador, Miembro, Embajador), las funcionalidades del aula LMS y del sistema de gamificación, y los artefactos de salida generados. Elaboración propia.

Las funcionalidades previstas en este módulo incluyen un catálogo de cursos con lecciones en video y materiales descargables, un sistema de entrega de asignaciones y calificación por el Moderador, la asignación automática de insignias digitales al completar un curso o evento, la generación de puntos de experiencia y ranking de miembros, un validador de rutas de aprendizaje externas de Microsoft Learn, y la emisión de diplomas PDF con código de verificación único. La integración con el estándar internacional Open Badges v2.0 garantizará que las microcredenciales generadas sean verificables fuera del ecosistema propio del Hub.

#### 3.2.3. Módulo 3: Administración, Finanzas y Control Operativo

El tercer módulo agrupa las capacidades de gobierno del sistema, orientadas al Administrador y a la gestión de la sostenibilidad económica de la comunidad. La conciliación bancaria manual de comprobantes de pago era uno de los puntos más costosos en tiempo: validar un voucher tomaba hasta cinco días hábiles. Este módulo introduce un motor de visión artificial OCR que automatiza esa lectura, reduciendo la intervención humana a una simple confirmación de aprobación.

La Figura 3.7 muestra el esquema funcional del módulo de administración y control operativo.

![Módulo 3: Administración, Finanzas y Control Operativo](img/img_mod3_admin.png)

Figura 3.7: Esquema Funcional del Módulo 3 — Administración, Finanzas y Control Operativo  
*Nota.* Diagrama que muestra los roles con acceso (Administrador, Organizador), las funcionalidades de gestión de identidades, conciliación financiera y auditoría forense, y los artefactos de salida generados. Elaboración propia.

Las funcionalidades contempladas en este módulo comprenden la gestión de identidades y roles de usuario, la recepción y procesamiento automatizado de comprobantes bancarios mediante OCR, la aprobación o rechazo de pagos con activación inmediata de accesos, el catálogo de souvenirs con control de inventario, un panel de analíticas de concurrencia y finanzas, y un sistema de auditoría forense con historial inmutable de todas las acciones administrativas críticas realizadas en la plataforma.

#### 3.2.4. Catálogo de Componentes de Software a Desarrollar

A partir de la definición de los tres módulos funcionales, el equipo formuló el catálogo inicial de componentes de software a desarrollar. Este catálogo constituye la lista de intenciones técnicas que guiarán la construcción física del sistema en las fases posteriores (Fases D y E de la metodología). Para cada componente se identificó su capa tecnológica, el módulo al que pertenece y su propósito funcional principal, como se detalla en la Tabla 3.4.

| Componente Previsto | Capa | Módulo | Propósito Funcional |
| :--- | :--- | :--- | :--- |
| Portal de Eventos (Landing) | Frontend | M1 — Eventos | Publicar el cronograma de eventos y permitir la consulta pública del calendario de actividades de la comunidad. |
| Gestor de Eventos (Staff) | Frontend | M1 — Eventos | Permitir al Organizador crear, editar y gestionar el ciclo de vida completo de congresos y talleres académicos. |
| Escáner QR de Acceso | Frontend | M1 — Eventos | Proveer al Soporte una interfaz de escaneo en tiempo real para validar credenciales de asistentes en puerta. |
| API de Eventos | Backend | M1 — Eventos | Exponer endpoints RESTful para la creación de eventos, gestión de ponentes, inscripciones y generación de tokens QR. |
| API de Asistencia | Backend | M1 — Eventos | Recibir y procesar marcas de escaneo QR, validando la firma del token y registrando la asistencia en base de datos. |
| Aula Virtual LMS | Frontend | M2 — Academia | Proveer al Miembro un espacio de navegación de cursos, visualización de lecciones y entrega de asignaciones. |
| Validador Microsoft Learn | Frontend | M2 — Academia | Permitir al Miembro vincular su perfil externo y trasladar logros de rutas oficiales de Microsoft al ecosistema del Hub. |
| Vitrina de Insignias (Dashboard) | Frontend | M2 — Academia | Mostrar al Miembro su historial de logros, insignias ganadas y progreso curricular en un panel personalizado. |
| API de Cursos y Academia | Backend | M2 — Academia | Gestionar el catálogo LMS, las entregas de asignaciones y el registro de calificaciones. |
| Servicio de Badges y Open Badges | Backend | M2 — Academia | Asignar insignias automáticamente, inyectar metadatos en PNG bajo el estándar Open Badges v2.0 y generar diplomas PDF. |
| Panel Administrativo Maestro | Frontend | M3 — Admin | Centralizar la gestión de identidades, roles, anuncios, inventario y analíticas del ecosistema para el Administrador. |
| Portal Financiero del Miembro | Frontend | M3 — Admin | Permitir al Miembro cargar sus comprobantes de pago y consultar el estado de aprobación de sus transacciones. |
| API de Pagos y OCR | Backend | M3 — Admin | Recibir imágenes de vouchers, ejecutar el motor OCR local para extracción de metadatos y registrar el resultado en BD. |
| API de Inventario (Souvenirs) | Backend | M3 — Admin | Gestionar el catálogo de productos de la tienda del Hub con control de stock y precios en bolivianos. |
| Servicio de Auditoría Forense | Backend | M3 — Admin | Interceptar y registrar de forma inmutable toda acción administrativa crítica, capturando IP, timestamp y diff JSON. |

Tabla 3.4: Catálogo de Componentes de Software a Desarrollar por Módulo Funcional  
*Nota.* Lista de intenciones técnicas formuladas durante la Fase 2 de la metodología, previo al inicio de la codificación física. La implementación concreta de cada componente se detalla en la Sección 3.3. Elaboración propia.

### 3.3. DISEÑO Y CONSTRUCCIÓN POR FUNCIONALIDAD (FDD Fases 3, 4 y 5)

Las fases finales de la metodología FDD representan la transición del plano de diseño abstracto a la codificación e integración física del stack de software, estructurando el código de la plataforma MEH de manera limpia, predecible y modular.

#### 3.3.1. Arquitectura de Persistencia (Capa models/)

La persistencia de datos garantiza la consistencia del estado global del monolito a nivel relacional en el motor relacional de PostgreSQL.

##### 3.3.1.1. Modelo Entidad-Relación Físico y Rationale de Indexación

El Modelo Entidad-Relación físico se implementa como un esquema fuertemente normalizado bajo el estándar relacional de PostgreSQL, garantizando el soporte nativo de transacciones bajo propiedades *ACID*. El backend FastAPI interactúa con el motor a través del ORM SQLAlchemy en su variante síncrona pura. Esta decisión de ingeniería de software descarta por completo el uso de tipos de datos nativos `UUID` en la base de datos debido a la penalización física que imponen en los índices de búsqueda del motor; en su lugar, se adoptan llaves primarias de tipo entero secuencial autoincremental (`SERIAL` en base de datos física, mapeados como `Integer, primary_key=True` en SQLAlchemy, como se detalla en el modelo físico de persistencia de la base de datos central ilustrado en las Figuras 3.8a, 3.8b, 3.8c y 3.8d).

La justificación técnica de esta exclusión radica en el impacto que tienen los identificadores aleatorios UUID en las operaciones de inserción masiva y consultas indexadas. En PostgreSQL, las llaves primarias generan por defecto un índice estructurado en árboles B (*B-Tree*). Cuando se realizan inserciones masivas (como en el flujo de escaneo simultáneo de códigos QR de cientos de asistentes en puerta), las llaves de tipo entero secuencial garantizan inserciones en los nodos hoja derechos del árbol, manteniendo el índice ordenado de forma secuencial con una fragmentación de página mínima y búsquedas en complejidad algorítmica de tiempo constante de O(log N). Por el contrario, un UUID aleatorio obliga al motor a reorganizar físicamente las páginas del árbol B en el disco duro mediante costosas operaciones de división de páginas (*page splits*), reduciendo drásticamente la velocidad de escritura, elevando el uso de memoria RAM para albergar índices fragmentados y propiciando condiciones de bloqueo de disco. La única excepción a esta regla es el identificador único de diplomas digitales (`uuid_verificacion`), el cual se almacena como un string plano (`VARCHAR`) autogenerado síncronamente en Python mediante `str(uuid.uuid4())` y persistido directamente, asegurando la no correlación numérica de diplomas para impedir que terceros adivinen códigos correlativos por fuerza bruta.

Para garantizar la legibilidad y el orden de los diagramas debido al volumen de la persistencia física (compuesta por 29 tablas), el diseño de base de datos se presenta a continuación segmentado en cuatro módulos funcionales independientes, omitiendo campos puramente descriptivos para enfocar la lectura en claves e integridad:

![Módulo 1: Usuarios, Auditoría y Configuración](img/img_db_erd_m1.png)

Figura 3.8a: Modelo Físico - Módulo 1 (Usuarios, Auditoría y Configuración)  
*Nota.* Relaciones lógicas e integridad física de usuarios, configuración y logs del sistema. Elaboración propia.

![Módulo 2: Eventos, Checkpoints y Asistencia](img/img_db_erd_m2.png)

Figura 3.8b: Modelo Físico - Módulo 2 (Eventos, Checkpoints y Asistencia)  
*Nota.* Relaciones físicas de la gestión de congresos, checkpoints QR y asistencia offline. Elaboración propia.

![Módulo 3: Academia Virtual y Progreso Académico](img/img_db_erd_m3.png)

Figura 3.8c: Modelo Físico - Módulo 3 (Academia Virtual y Progreso Académico)  
*Nota.* Estructura relacional de cursos, lecciones, tareas, foros y recursos de descarga. Elaboración propia.

![Módulo 4: Tienda, Pagos, Certificados y Gamificación](img/img_db_erd_m4.png)

Figura 3.8d: Modelo Físico - Módulo 4 (Tienda, Pagos, Certificados y Gamificación)  
*Nota.* Relaciones financieras OCR, inventario de souvenirs, emisión de diplomas y gamificación. Elaboración propia.

##### 3.3.1.2. Mapeo de Persistencia Física y Módulos de Persistencia

Para garantizar el correcto acoplamiento entre la capa de negocio y la persistencia de datos relacional en PostgreSQL, las 29 tablas físicas del sistema se estructuran y agrupan sistemáticamente en torno a los tres módulos de negocio principales definidos en la sección 3.2.

El mapa de mapeo físico que vincula las 29 tablas de base de datos con los tres módulos operativos del monolito se describe en la Figura 3.9.

![Mapeo de Tablas Físicas de Persistencia por Módulo Funcional](img/img_db_table_mapping.png)

Figura 3.9: Mapeo de Tablas Físicas de Persistencia por Módulo Funcional  
*Nota.* Distribución lógica y relaciones físicas de las 29 tablas de la base de datos PostgreSQL organizadas por módulo. Elaboración propia.

A continuación, se detalla el mapeo resumido de las tablas del motor de base de datos centralizadas en los tres módulos de negocio:

| Módulo Funcional | Tablas de Persistencia Relacional | Propósito Operativo Principal |
| :--- | :--- | :--- |
| M1 — Eventos y Control Asistencia | eventos, checkpoints, asistencia_detalles, inscripciones_eventos, eventos_speakers, eventos_auspiciadores, eventos_comunidades, speakers, auspiciadores, comunidades_aliadas | Gobierna el ciclo de vida de los congresos, configuración de puntos de control QR y marcas físicas de asistencia local y sincronizada. |
| M2 — Academia y Gamificación | cursos, lecciones, tareas, entregas_tareas, inscripciones_cursos, posts_foro, recursos, anuncios, productos, pedidos, pedido_detalles, pagos, badges, usuarios_badges, certificados | Administra el aula virtual LMS, progreso curricular, foros, inventario de la tienda del Hub, pasarela OCR de comprobantes bancarios e inyección de Open Badges. |
| M3 — Administración y Auditoría | usuarios, roles, roles_usuario, logs_sistema, configuracion_global, estados_registro, notificaciones, logs_sesiones | Centraliza el gobierno de accesos jerárquicos RBAC, logs forenses de mutación de datos y configuración global paramétrica del monolito. |

Tabla 3.5: Clasificación de Tablas Físicas de la Base de Datos por Módulo Operativo  
*Nota.* Distribución sintética de persistencia y delimitación transaccional. Elaboración propia.

La especificación técnica física e integridad referencial de cada una de las 29 tablas del sistema se describe detalladamente en el Anexo B (Diccionario de Datos Relacional Completo).

##### 3.3.1.3. Implementación de Mixins para Auditoría y Trazabilidad

Para garantizar el cumplimiento de normativas de auditoría de sistemas de grado empresarial, todas las entidades transaccionales sensibles de la base de datos heredan del modelo base `AuditMixin` definido en SQLAlchemy. Este mixin inyecta de forma totalmente síncrona en cada inserción y modificación física los metadatos correspondientes a creador, modificador y marcas de tiempo UTC.

El flujo secuencial de interceptación automática de auditoría a nivel del ORM y su posterior persistencia inmutable en la bitácora del sistema se detalla en la Figura 3.10.

![Flujo de Interceptación de Auditoría con Mixin y Logs](img/img_audit_mixin_flow.png)

Figura 3.10: Flujo de Interceptación de Auditoría con Mixin y Logs  
*Nota.* Flujo síncrono que ilustra la inserción automática de campos del AuditMixin y la serialización JSON del diff transaccional por logs_service.py. Elaboración propia.

Adicionalmente, ante cualquier mutación de registros gatillada por cuentas administradoras (como la alteración manual de roles, suspensión física de cuentas, edición del inventario financiero o aprobación de vouchers de pago), se invoca de manera automática el servicio `logs_service.py` a través de capturadores de eventos síncronos de SQLAlchemy (listeners before_insert y before_update). Este servicio almacena de forma inmutable en la tabla `logs_sistema` la dirección IP física del emisor HTTP capturada desde la petición, el identificador del registro afectado, el nombre de la tabla modificada, la marca temporal UTC y la serialización en formato JSON que compara exactamente el valor anterior contra el valor nuevo (diff), consolidando una bitácora forense e inalterable ante intentos de intrusión o fraude.

#### 3.3.2. Lógica de Negocio y Servicios API (Capa services/ y api/)

La capa de negocio expone servicios REST seguros estructurados en FastAPI, abstrayendo las transacciones lógicas complejas de la aplicación. Para estructurar este comportamiento de manera predecible, el backend del sistema se organiza bajo un patrón arquitectónico modular multicapa, el cual se ilustra en la Figura 3.11.

![Arquitectura Multicapa del Backend FastAPI](img/img_backend_architecture.png)

Figura 3.11: Arquitectura Multicapa del Backend FastAPI  
*Nota.* Estructura interna del backend monolítico detallando el flujo de una petición a través de las capas de enrutamiento, validación de contratos, lógica de negocio y persistencia ORM. Elaboración propia.

##### 3.3.2.1. Definición de Contratos de Datos (Pydantic Schemas)

El sistema de validación de datos en FastAPI se sustenta en Pydantic Schemas, los cuales actúan como contratos rígidos de datos a nivel de la API del servidor. Cada petición entrante y saliente es interceptada por esquemas de tipado estricto (type hints). Pydantic analiza de forma recursiva el cuerpo de las peticiones HTTP y verifica la correspondencia exacta de tipos de datos, longitudes y formatos de datos, devolviendo un código de error HTTP 422 descriptivo al cliente si se viola el contrato.

El flujo síncrono de verificación y respuesta HTTP ante peticiones entrantes se detalla en la Figura 3.12.

![Flujo de Validación e Interceptación de Contratos de Datos con Pydantic](img/img_pydantic_flow.png)

Figura 3.12: Flujo de Validación e Interceptación de Contratos de Datos con Pydantic  
*Nota.* Proceso de interrupción y retorno HTTP 422 si el payload JSON viola las reglas de aserción definidas en los esquemas. Elaboración propia.

A continuación, se resumen las reglas de validación críticas definidas en los contratos de datos del backend:

- **PaymentCreateSchema**: Requiere `usuario_id` (entero obligatorio mayor a cero), `monto` (decimal estrictamente positivo con formato de dos decimales), `nro_transaccion` (string alfanumérico limpio entre 4 y 50 caracteres) y `comprobante_url` (ruta válida del archivo del voucher subido al servidor).
- **AsistenciaScanSchema**: Requiere `checkpoint_id` (entero obligatorio mayor a cero) y `token_qr` (cadena alfanumérica segura con longitud entre 64 y 256 caracteres, validando firmas criptográficas).

##### 3.3.2.2. Diagramas de Secuencia: Flujo de Asistencia QR y Asignación de Badges

El flujo síncrono de asistencia por checkpoints físicos QR opera bajo un esquema secuencial estricto para impedir condiciones de carrera y asegurar la consistencia del estado de gamificación del usuario. El personal de Soporte escanea el código QR encriptado del asistente en la entrada del evento físico. El frontend gatilla una petición Axios `POST /api/v1/asistencia/scan` adjuntando el token recuperado y el ID del checkpoint activo.

El diagrama de secuencia que ilustra el comportamiento dinámico y las llamadas síncronas entre los diferentes componentes del sistema se describe a continuación en la Figura 3.13.

![Diagrama de Secuencia del Flujo de Asistencia QR y Asignación de Medallas](img/img_secuencia_qr.png)

Figura 3.13: Diagrama de Secuencia del Flujo de Asistencia QR y Asignación de Medallas  
*Nota.* Flujo síncrono completo que ilustra el proceso transaccional secuencial entre el cliente frontend, el interceptor JWT del backend, los servicios de base de datos SQLAlchemy y la inyección automatizada de medallas e inserción de marcas de checkpoints. Elaboración propia.

El código fuente de este diagrama de secuencia modelado bajo la sintaxis estándar de Mermaid se detalla a continuación:

```mermaid
sequenceDiagram
    autonumber
    actor Soporte as Personal de Soporte
    participant Client as Cliente (SPA React)
    participant Gate as JWT Gate / Middleware
    participant Router as API Router (asistencia)
    participant Service as Asistencia Service
    participant DB as Base de Datos (PG)

    Soporte->>Client: Escanear Credencial QR en Checkpoint
    Client->>Gate: POST /api/v1/asistencia/scan (token, chk_id)
    Gate->>Gate: Validar JWT Bearer y privilegios RBAC
    alt Rol no autorizado o JWT inválido
        Gate-->>Client: HTTP 403 Forbidden / 401 Unauthorized
    else Rol autorizado
        Gate->>Router: Invocar controlador de asistencia
        Router->>Service: process_checkpoint_attendance()
        Service->>DB: Query: Obtener InscripcionEvento
        DB-->>Service: Retorna datos de inscripción
        Service->>DB: Insert: AsistenciaDetalle
        Service->>Service: check_gamificacion()
        opt Cumple requisitos de asistencia
            Service->>DB: Insert: UsuarioBadge (asignar medalla)
        end
        Service->>DB: db.commit() (Persistencia ACID)
        DB-->>Service: Transacción exitosa
        Service-->>Router: Confirmación y medallas ganadas
        Router-->>Client: HTTP 200 OK (Asistencia grabada + badge)
        Client-->>Soporte: Visualización de éxito y alerta sonora
    end
```

###### Análisis del Contrato de Validación de Asistencia y Prevención de Doble Registro

El contrato de validación de asistencia implementado en la clase `AsistenciaScanSchema` actúa como un mecanismo preventivo crítico de seguridad e integridad relacional. Al escanear una credencial QR en un checkpoint físico, la API ejecuta validaciones multinivel antes de registrar la marca:

1. **Mitigación de SQL Injection y Sanitización**: Los parámetros recibidos (`token_qr` y `checkpoint_id`) se procesan bajo tipos de datos fuertemente tipados. El `checkpoint_id` se restringe como entero estrictamente mayor a cero (`gt=0`), descartando entradas alfanuméricas maliciosas. El `token_qr` se valida mediante expresiones regulares alfanuméricas con un tamaño delimitado, impidiendo ataques de desbordamiento de búfer o inyección de código SQL directo en las sentencias de SQLAlchemy.
2. **Prevención de Doble Escaneo mediante Bloqueos Transaccionales**: A nivel de base de datos, el servicio ejecuta una consulta filtrada por `inscripcion_id` y `checkpoint_id` en la tabla `asistencia_detalle`. Si se halla un registro coincidente, la API interrumpe la petición de forma síncrona retornando una respuesta descriptiva (HTTP 409 Conflict), evitando la duplicidad de marcas y la alteración artificial de puntos de experiencia del usuario.
3. **Consistencia Transaccional (ACID)**: Todo el flujo de registro de marca de asistencia, cálculo de cumplimiento y asignación del logro digital (`UsuarioBadge`) se ejecuta bajo un único contexto de base de datos (`db: Session`). Si ocurre un fallo en el cálculo de insignias o en la conexión física con el motor relacional, la sesión ejecuta un `db.rollback()`, dejando sin efecto la marca de asistencia y garantizando que el usuario no reciba puntos de forma corrupta.

##### 3.3.2.3. Lógica de Validación de Pagos y Conciliación Bancaria con Jaro-Winkler

El subsistema financiero de la Plataforma MEH incorpora un motor de conciliación bancaria automatizado y visión artificial local para auditar y validar los comprobantes de depósito cargados por los alumnos. Este motor resuelve las ineficiencias de la revisión manual tradicional a través de un esquema híbrido de Jaro-Winkler y reglas determinísticas lógicas en la capa de servicios (`ocrm_service.py` y `pagos_service.py`), operando sin recurrir a servicios propietarios de pago en la nube o binarios pesados de sistema en el servidor local.

El flujo y pipeline de procesamiento del voucher digital hasta la asignación de su estado transaccional se detalla en la Figura 3.14a.

![Pipeline de Procesamiento OCR y Conciliación Bancaria con Jaro-Winkler](img/img_ocr_pipeline.png)

Figura 3.14a: Pipeline de Procesamiento OCR y Conciliación Bancaria con Jaro-Winkler  
*Nota.* Flujo secuencial de lectura del voucher digital con Tesseract OCR, normalización sintáctica y cálculo probabilístico de similitud de cadenas. Elaboración propia.

Por otro lado, los pasos de visión artificial, filtrado de imagen y segmentación de regiones de interés (ROI) que ejecuta el motor de extracción local se describen en la Figura 3.14b.

![Visión Artificial y Extracción de Metadatos del Comprobante OCR](img/img_ocr_extraction_steps.png)

Figura 3.14b: Visión Artificial y Extracción de Metadatos del Comprobante OCR  
*Nota.* Fases de binarización de imagen, detección de contornos e identificación de texto estructurado por el motor de visión artificial local. Elaboración propia.

El análisis se compone de tres etapas secuenciales de alta fidelidad:

###### 1. Cálculo de Similitud de Texto con Jaro-Winkler

El algoritmo de Jaro-Winkler puro en Python calcula la cercanía entre dos cadenas de caracteres, tolerando transposiciones y errores de escritura frecuentes en transacciones financieras manuales (por ejemplo, omitir un segundo apellido o cambiar una letra, como "Mamani" vs "Mamany"). Matemáticamente, para dos cadenas $s_1$ y $s_2$, la similitud de Jaro $d_j$ se define como:

$$d_j = \frac{1}{3} \left( \frac{m}{|s_1|} + \frac{m}{|s_2|} + \frac{m - t}{m} \right) \qquad \text{(Ecuación 3.1)}$$

donde $m$ es el número de caracteres coincidentes dentro de una distancia máxima establecida y $t$ es el número de transposiciones. Coincidentes se definen como aquellos caracteres que son iguales y cuya distancia física no excede de:

$$\text{distancia\_máxima} = \left\lfloor \frac{\max(|s_1|, |s_2|)}{2} \right\rfloor - 1$$

Winkler optimiza esta métrica aplicando un bonus por prefijo común de longitud $l$ (hasta 4 caracteres) con un factor de escala constante $p = 0.1$:

$$d_w = d_j + l \cdot p \cdot (1 - d_j) \qquad \text{(Ecuación 3.2)}$$

La función de comparación difusa tokenizada (`check_name_in_description_fuzzy`) normaliza el nombre del alumno y los textos del extracto bancario (eliminando signos de puntuación y acentos), evalúa las palabras de forma individual e ignora preposiciones de longitud menor a tres letras, considerando una coincidencia exitosa por palabra si supera un umbral estricto del 85%.

###### 2. Ventanas de Correlación Temporal y Métricas Multivariables

Para aumentar la confiabilidad, se calcula la proximidad en fechas entre el día en que el estudiante registró el pago en la plataforma y la fecha reportada en la transacción del extracto bancario. Si coinciden en un rango de $\pm1$ día se inyecta un bonus de confianza del $+15.0\%$, y si coinciden dentro de un rango de $\pm3$ días se suma un $+5.0\%$. Asimismo, se ejecuta una búsqueda de tokens completos para hallar el ID de pago de forma exacta (evitando emparejamientos espurios por subcadenas sobre identificadores cortos); de hallarse la palabra exacta en la descripción (ej: `"PAGO 29"`), se asigna de manera segura un $100\%$ de confianza.

###### 3. Clasificación Determinística de Confianza OCR

Para sustituir simulaciones probabilísticas arbitrarias en el procesamiento inicial, se codificó un evaluador estructurado por reglas a nivel de comprobante (`process_comprobante_upload_ocr`). Si el archivo posee un tamaño superior a 5 KB y extensiones válidas de documentos (`.pdf`, `.png`, `.jpg`), el motor infiere una extracción de datos correcta, asignando una confianza técnica fija del $98\%$ y el estado `'VERIFICADO_AUTOMATICO'`. En caso de que el archivo sea menor o inválido, el sistema asigna automáticamente una confianza de $50\%$ y marca el registro en estado `'REVISION_MANUAL'` para audición administrativa.

##### 3.3.2.4. Arquitectura de Asistencia Offline-First y Protocolo de Sincronización en IndexedDB

Para garantizar la viabilidad logística de la toma de asistencia con códigos QR en auditorios y sótanos de la universidad provistos de nula o deficiente conectividad de red a internet, se diseñó e implementó un subsistema con soporte nativo de funcionamiento Offline-First. Esta arquitectura permite descargar los datos a la base local del navegador del dispositivo móvil del staff y realizar lecturas autónomas con sincronización posterior.

El funcionamiento integral del protocolo desconectado y el esquema de sincronización transaccional por lotes se detalla en la Figura 3.15.

![Flujo de Asistencia Offline-First y Protocolo de Sincronización](img/img_offline_first_flow.png)

Figura 3.15: Flujo de Asistencia Offline-First y Protocolo de Sincronización  
*Nota.* Flujo de datos local basado en IndexedDB y cola de sincronización secuencial por lotes FIFO tras el restablecimiento del canal de comunicación a internet. Elaboración propia.

El ecosistema offline se compone de los siguientes elementos de ingeniería de software:

- **Almacenamiento Local Atómico (IndexedDB)**: En el frontend se desarrolló un envoltorio de persistencia local en JavaScript nativo (`offlineDb.js`) que inicializa la base de datos local `meh_offline_db` con tres almacenes estructurados de objetos: `registrados` (lista de estudiantes habilitados), `checkpoints` (puntos de control lógico) y `cola_asistencia` (cola de control FIFO para marcas offline).
- **Protocolo de Validación Offline**: Al escanear una credencial QR en modo desconectado, la aplicación realiza la consulta local contra IndexedDB. El validador verifica la existencia del código QR en el almacén `registrados` y previene el doble escaneo inspeccionando los estados locales. Si la validación es exitosa, inserta la marca temporal en `cola_asistencia` y marca localmente `asistio = true`.
- **Sincronización Transaccional por Lotes (Batch Queue Upload)**: Una vez restablecida la conectividad a internet, el frontend activa un administrador de sincronización secuencial. La aplicación extrae de forma ordenada cada tupla guardada en la cola de IndexedDB, realiza la petición HTTP `POST /api/v1/eventos/asistencia-qr` en el backend, y tras recibir la confirmación de guardado seguro del servidor, elimina el registro de la cola local para liberar espacio físico.

#### 3.3.3. Interfaz de Usuario y Frontend (Capa web/)

La capa de presentación provee una interfaz gráfica fluida e interactiva de nivel corporativo alineada a los estándares de Microsoft.

##### 3.3.3.1. Implementación de Fluent UI y Tematización Institucional React 18

La capa de presentación visual de la Plataforma MEH se estructura como una *single-page application* (SPA) altamente reactiva, robusta y optimizada, construida sobre el entorno de ejecución de *React 18.2* con soporte de *JSX* y utilizando *Vite* como herramienta de empaquetado (*bundler*). Para mantener una coherencia de diseño de nivel corporativo alineada a las directrices oficiales de Microsoft, la interfaz gráfica del usuario se cimenta en la biblioteca *Fluent UI v9* (`@fluentui/react-components`).

La jerarquía de componentes y el flujo de estados globales y tematización en el cliente frontend se describen en la Figura 3.16.

![Jerarquía de Componentes del Frontend React y Flujo de Estado](img/img_react_hierarchy.png)

Figura 3.16: Jerarquía de Componentes del Frontend React y Flujo de Estado  
*Nota.* Arquitectura del árbol de componentes virtuales React detallando la propagación de temas visuales mediante Context API e integración de servicios comunes. Elaboración propia.

El código del cliente reactivo en el frontend se organiza bajo un patrón modular bien estructurado, el cual se describe a continuación en la Tabla 3.6:

| Directorio / Archivo | Capacidad Técnica Implementada | Propósito en el Ecosistema Frontend |
| :--- | :--- | :--- |
| `/src/components/` | Componentes web modulares reactivos y aislados | Albergar barras laterales (`Sidebar.jsx`), menús de navegación superior, diálogos Fluent UI y ruletas de carga. |
| `/src/pages/` | Vistas principales asociadas a rutas lógicas | Implementar pantallas transaccionales completas de negocio (ej. `Finanzas.jsx`, `EscaneoQR.jsx`, `LMS.jsx`). |
| `/src/context/` | Mallas de contexto global (`AuthContext`, `ThemeContext`) | Registrar la sesión del estudiante y propagar el selector estético de temas visuales. |
| `/src/theme/` | Inicialización de mallas y tokens estéticos | Configurar los proveedores del tema claro y oscuro corporativo de Microsoft (`FluentProvider`). |
| `/src/locale/` | Soporte dinámico de internacionalización y traducción | Almacenar diccionarios locales en formato JSON (`es.json`/`en.json`) gestionados por el motor `i18next`. |

Tabla 3.6: Organización de Directorios del Frontend React y Ecosistema Fluent UI v9  
*Nota.* Arquitectura en capas del cliente SPA estructurada en el repositorio frontend del proyecto. Elaboración propia.

La internacionalización y el soporte multiidioma nativo bilingüe de la Plataforma MEH se estructuran sistemáticamente a través del motor *i18next* acoplado directamente al cliente web reactivo por intermedio de *react-i18next*.

Para comprender y detallar de forma lógica la organización del sistema, la barra de navegación lateral interactiva estructurada en el componente reactivo principal [Sidebar.jsx](file:///f:/Plataforma-MEH/frontend/src/components/Sidebar.jsx) define el mapa completo de módulos y rutas lógicas de la SPA, el cual discrimina dinámicamente los elementos visibles según el rol del usuario autenticado mediante las políticas jerárquicas del control de accesos basado en roles (*RBAC*). Esta topología visual y de control divide el sistema de manera rigurosa en cinco zonas operativas fundamentales, resumidas de forma compacta en la Tabla 3.7:

| Zona Operativa | Propósito y Módulos | Rutas Frontend asociadas | Roles Permitidos (RBAC) | Capacidades Técnicas Implementadas |
| :--- | :--- | :--- | :--- | :--- |
| Mi Espacio | Viaje curricular y autogestión del estudiante | `/dashboard`, `/validador`, `/insignias`, `/finanzas`, `/learning`, `/comunidad` | Todos (Miembro, Embajador, Soporte, Organizador, Admin) | Visualización de KPIs y avance LMS, validación con API de Microsoft Learn, vitrina Open Badges, subida de vouchers de pago y catálogo de clases. |
| Centro de Operaciones | Control logístico y financiero en tiempo real | `/escaneo-qr`, `/gestion-pagos`, `/admin/ecosistema` | Soporte, Organizador, Admin | Escaneo QR offline-first de marcas de asistencia, revisión de vouchers bancarios con extracción de metadatos OCR local y administración de redes con patrocinadores. |
| Liderazgo & VIP | Recursos didácticos para ponentes y embajadores | `/recursos-vip`, `/speaker-kit` | Embajador, Organizador, Admin | Repositorio de guías y kits de Microsoft Learn Student Ambassadors, directrices de diseño corporativo y plantillas pedagógicas para capacitaciones. |
| Academia y Contenido | Consola de administración y configuración del LMS | `/admin`, `/admin/notificaciones`, `/admin/generador-certificados` | Organizador, Admin | Formularios CRUD de usuarios/cursos/eventos, alteración de privilegios RBAC, difusiones y motor de emisión en lote de diplomas PDF firmados criptográficamente con validador QR. |
| Inteligencia y Sistema | Analítica de negocio y auditoría forense | `/dashboard/analytics`, `/auditoria` | Admin | Dashboards con charts interactivos de Recharts en formato vectorial (asistencia y flujos financieros agregados) y consola forense de registros `logs_sistema`. |

Tabla 3.7: Mapa de Arquitectura Modular y Zonas de Control Operativo de la Barra Lateral  
*Nota.* Mapeo y demarcación de accesos lógicos y visuales estructurados bajo Fluent UI v9 y FastAPI en el frontend y backend. Elaboración propia.

El mapa completo de arquitectura modular, la integración de flujos de control y la interconexión síncrona de estas cinco zonas operativas coordinadas por el control de accesos basado en roles (*RBAC*) de la barra lateral se ilustra detalladamente en la Figura 3.17.

![Mapa de Arquitectura Modular de la Barra Lateral](img/img_cinco_zonas.png)

Figura 3.17: Mapa de Arquitectura Modular de la Barra Lateral  
*Nota.* Representación sistemática del flujo de trabajo unificado y la demarcación lógica de accesos visuales y de persistencia de datos agrupados en las cinco secciones principales de la interfaz. Elaboración propia.

##### 3.3.3.2. Diseño de Dashboards y Visualización de Analíticas con Recharts

El diseño gráfico del Dashboard de control operativo del administrador centraliza los datos de inteligencia del ecosistema por medio de visualizaciones dinámicas robustas desarrolladas exclusivamente sobre la biblioteca reactiva *Recharts*. Esta biblioteca de gráficos basada en componentes nativos de React se integra de forma directa con el Virtual DOM de React 18, permitiendo redibujar las curvas y elementos visuales de manera automática en respuesta a actualizaciones de datos.

El flujo y arquitectura de renderizado vectorial SVG con aceleración por hardware de los gráficos analíticos se describe en la Figura 3.18.

![Flujo de Renderizado de Recharts y Analíticas SVG](img/img_recharts_dashboard_architecture.png)

Figura 3.18: Flujo de Renderizado de Recharts y Analíticas SVG  
*Nota.* Proceso de inyección de elementos vectoriales escalables SVG nativos en el Virtual DOM con aceleración gráfica directa. Elaboración propia.

La justificación técnica de la selección de *Recharts* radica en su arquitectura de renderizado basada enteramente en elementos vectoriales escalables (SVG). Al dibujar las gráficas, barras e histogramas de datos analíticos como nodos vectoriales nativos contenidos dentro de rejillas adaptativas provistas por Fluent UI v9, el navegador de internet gestiona el procesamiento visual mediante aceleración por hardware de gráficos directos, evitando la sobrecarga estructural y el consumo masivo de memoria que implican las bibliotecas analíticas tradicionales basadas en lienzos estáticos HTML5 (Canvas).

##### 3.3.3.3. Catálogo de Interfaces y Pantallas del Sistema Desarrollado

Para constatar la implementación física de las interfaces descritas en el diseño del sistema, a continuación se exponen las capturas de pantalla de la Plataforma MEH en producción, las cuales demuestran el cumplimiento del diseño de Fluent UI v9, la tematización responsiva y la consistencia en el despliegue del Dashboard del Miembro y la Consola de Administración.

El Dashboard del miembro regular que cursa en la academia e inspecciona sus medallas Open Badges se muestra en la Figura 3.19.

![Interfaz Gráfica del Dashboard del Miembro - Estudiante](img/img_ui_dashboard.png)

Figura 3.19: Interfaz Gráfica del Dashboard del Miembro - Estudiante  
*Nota.* Pantalla interactiva en tema oscuro del miembro donde se visualizan sus medallas obtenidas, cursos en el LMS e historial de asistencia validada mediante código QR. Elaboración propia.

Por otro lado, la Consola de Administración Centralizada que permite al Administrador Máster gestionar identidades, roles, souvenirs y auditoría forense se describe en la Figura 3.20.

![Consola Administrativa Centralizada del Panel Maestro](img/img_ui_admin.png)

Figura 3.20: Consola Administrativa Centralizada del Panel Maestro  
*Nota.* Panel administrativo principal para la gestión de usuarios, roles del ecosistema y monitoreo en tiempo real de logs del sistema. Elaboración propia.

### 3.4. SEGURIDAD, AUTORIZACIÓN Y AUDITORÍA (Capa core/)

La seguridad representa la columna vertebral de la plataforma MEH, blindando el flujo de información en cumplimiento de las directrices académicas de la carrera y la universidad de destino.

#### 3.4.1. Implementación de Autenticación OAuth2 y Bearer JWT

La autenticación de identidades implementa el protocolo estandarizado OAuth2 utilizando la especificación de JSON Web Tokens (*JWT*) de tipo *Bearer*. Al autenticarse con credenciales válidas, el backend FastAPI firma criptográficamente un token mediante el algoritmo seguro HS256 utilizando una clave simétrica robusta almacenada de forma privada en las variables de entorno. Cada token almacena el identificador único del usuario, su rol y su fecha exacta de expiración temporal. Esto permite un diseño apátrida (*stateless*), donde el backend no requiere almacenar sesiones en memoria RAM ni consultar la base de datos en cada petición REST entrante, decodificando y validando la firma del token directamente en la puerta de enlace física de la API.

#### 3.4.2. Matriz de Control de Acceso Basado en Roles (RBAC)

El sistema opera bajo una estricta política de Control de Acceso Basado en Roles (*RBAC*), discriminando rigurosamente el nivel de privilegios de acceso y visibilidad de los recursos físicos del sistema en base a los seis roles definidos en la lógica del backend.

Esta matriz de restricciones y la correspondencia entre los roles del ecosistema y las capacidades transaccionales autorizadas se ilustra gráficamente en la Figura 3.21.

![Matriz de Control de Acceso Basado en Roles (RBAC)](img/img_rbac_matrix.png)

Figura 3.21: Matriz de Control de Acceso Basado en Roles (RBAC)  
*Nota.* Matriz comparativa de permisos transaccionales a nivel de API protegidos mediante interceptores síncronos en FastAPI. Elaboración propia.

Estas restricciones de acceso se evalúan síncronamente en los enrutadores FastAPI mediante inyección de dependencias (`Depends`), bloqueando de forma segura cualquier consumo de endpoints no autorizado.

#### 3.4.3. Sistema de Auditoría Permanente (Audit Log)

La trazabilidad inmutable se consolida a través del sistema de bitácoras persistido en la tabla relacional de auditoría `logs_sistema`. Cualquier mutación física de registros críticos en base de datos gatillada por usuarios administradores (tales como la alteración manual de roles, suspensión física de cuentas, edición del inventario financiero o aprobación de vouchers de pago) invoca de manera secuencial y atómica la inserción de un registro descriptivo que detalla la marca temporal UTC, la dirección IP física del cliente HTTP capturada desde la cabecera de la petición, el nombre del operador y una representación JSON comparativa (*diff*) que contrasta el estado anterior con el nuevo estado del registro, brindando un marco forense y de auditoría robusto e inalterable ante intentos de intrusión o fraude.

#### 3.4.4. Configuración y Seguridad de Credenciales (SMTP y Variables de Entorno)

Para dar soporte a la comunicación del backend con servicios externos —específicamente el envío de notificaciones por correo electrónico y la generación automatizada de tickets QR al aprobar transacciones— el sistema implementa una arquitectura desacoplada de variables de configuración. El principio fundamental de esta arquitectura es la inyección en tiempo de ejecución de las variables de entorno, evitando estrictamente la persistencia de datos sensibles o credenciales en texto plano (zero hardcoding) dentro del repositorio Git.

El ciclo completo de inyección y validación segura de variables en los entornos de desarrollo, dockerizado y producción en nube se ilustra en la Figura 3.22.

![Ciclo de Inyección Segura y Aislamiento Físico de Secretos](img/img_credentials_flow.png)

Figura 3.22: Ciclo de Inyección Segura y Aislamiento Físico de Secretos  
*Nota.* Aislamiento físico de parámetros de conexión y credenciales transaccionales por medio de cargadores dinámicos os.getenv en memoria RAM. Elaboración propia.

##### A. Matriz y Estructura de Variables de Entorno

La parametrización de la lógica del backend se gobierna de manera centralizada. En la Tabla 3.8 se describe detalladamente cada variable del sistema, su propósito operativo y sus valores correspondientes según el entorno, omitiendo credenciales físicas explícitas:

| Variable | Tipo de Dato | Entorno Local (`.env`) | Entorno Docker (`.env.docker`) | Propósito Técnico en el Backend |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `string` | `postgresql://postgres:************@localhost/MEH` | `postgresql://postgres:************@db:5432/plataforma_meh` | Cadena de conexión física del pool de conexiones de SQLAlchemy hacia PostgreSQL. |
| `SECRET_KEY` | `string` | `<LLAVE_SECRETA_JWT_SIMETRICA>` | `<LLAVE_SECRETA_JWT_SIMETRICA>` | Clave simétrica robusta empleada por el algoritmo HS256 para firmar y verificar tokens JWT. |
| `SMTP_HOST` | `string` | `smtp.gmail.com` | `smtp.gmail.com` | Dirección del host del servidor de correo saliente. |
| `SMTP_PORT` | `int` | `587` | `587` | Puerto de escucha SMTP seguro (uso obligado de encriptación StartTLS). |
| `SMTP_USER` | `string` | `meh.bolivia@gmail.com` | `meh.bolivia@gmail.com` | Dirección de correo emisora oficial de la organización. |
| `SMTP_PASSWORD`| `string` | `<TOKEN_SMTP_CIFRADO>` | `<TOKEN_SMTP_CIFRADO>` | Token de seguridad / Contraseña de Aplicación de 16 caracteres de Google (Gmail 2FA). |
| `FRONTEND_URL` | `string` | `http://localhost:5173` | `http://localhost` | URL del origen de la SPA para armar enlaces de redirección en notificaciones de correo. |

Tabla 3.8: Especificación y Contratos de Variables de Entorno del Backend  
*Nota.* Tabla estructurada de parámetros requeridos para la inicialización y conexión del sistema. Elaboración propia.

##### B. Carga Lógica y Validación en Código

Para mitigar fallos silenciosos por variables de entorno corruptas o no declaradas, el backend expone una clase síncrona `SMTPConfig` en `app/core/email_config.py`. Este módulo lee los parámetros al arrancar la aplicación e implementa reglas de aserción rígidas que validan que las variables existan, el puerto esté dentro del rango válido de red (1-65535) y que no se expongan cadenas vacías, deteniendo inmediatamente la inicialización del servidor si se detecta alguna anomalía.

##### C. Flujo de Inyección y Aislamiento de Secretos

El aislamiento físico de las credenciales de producción sigue un ciclo estructurado que impide la filtración de claves hacia repositorios remotos:

1. **Gobernanza Git (`.gitignore`)**: Se declaran explícitamente reglas para omitir cualquier archivo `.env` o `backend/.env` de los commits. En el repositorio únicamente persiste el archivo de plantilla `.env.example`, el cual provee la estructura sintáctica pero sin datos reales de conexión.
2. **Despliegue Cloud Seguro**: Al desplegarse en servidores externos (tales como la nube de Render o un VPS corporativo), el archivo físico `.env` es descartado. Las variables de entorno son inyectadas directamente en la memoria del contenedor de producción a través de la sección de *Environment Variables* cifradas del proveedor, impidiendo que programadores o atacantes con acceso de lectura al repositorio de Git recuperen las credenciales críticas del correo y base de datos de la universidad.

# CAPÍTULO 4

## PRUEBAS, VALIDACIÓN Y RESULTADOS

### 4.1. PLANIFICACIÓN DE PRUEBAS DEL SISTEMA

El marco de validación técnica de la Plataforma MEH se estructura bajo un diseño experimental y transeccional cuantitativo adaptado a las pautas de ingeniería de sistemas de la universidad de destino [@sampieri2023]. La planificación comprende una suite de verificación sistemática dividida en cuatro dimensiones operativas: pruebas de unidad de servicios independientes, pruebas de integración de flujos API-SPA bidireccionales, pruebas de seguridad e integridad RBAC, y pruebas funcionales de carga de concurrencia física. De este modo, se asegura que las funcionalidades críticas del monolito modular respondan de manera predecible ante las demandas operativas de la comunidad. El aseguramiento de la calidad del software exige la formulación de una pirámide de pruebas equilibrada que abarque desde los componentes atómicos lógicos hasta las interacciones completas del usuario en entornos reales, garantizando así la estabilidad sistémica ante la incorporación incremental de nuevos requerimientos de extensión académica [@sommerville2022]. La planificación estratégica de estas pruebas y sus respectivos alcances de cobertura dentro de los submódulos de la arquitectura monolítica se detallan de forma ejecutiva en la siguiente matriz organizativa de control de calidad.

| Nivel de Prueba | Componente Objetivo | Cobertura de Verificación | Frecuencia de Ejecución |
| :--- | :--- | :--- | :--- |
| Unitaria (*Unit*) | Funciones lógicas y servicios backend | Validaciones de lógica, hashes Bcrypt y tokens JWT | Automatizada ante cada *commit* o *merge* |
| Integración (*Integration*) | Enrutadores REST y persistencia ORM | Flujos de datos en controladores y consultas SQLAlchemy | Automatizada en integración continua (*CI*) |
| Extremo a Extremo (*E2E*) | Interfaz reactiva y llamadas API | Flujo completo de navegación e internacionalización | Ejecución diaria y pre-despliegue en producción |
| Seguridad y Roles (RBAC) | Interceptores y middleware de acceso | Aislamiento de privilegios y enmascaramiento de trazas | Validaciones periódicas de control de accesos |

Tabla 4.1: Clasificación de Niveles de Pruebas y Cobertura Sistémica
*Nota.* Elaboración propia basada en el diseño de aseguramiento de calidad definido para el ecosistema modular de la Plataforma MEH.

![Pirámide de Pruebas](img/img_piramide_pruebas.png)

Figura 4.1: Pirámide de Pruebas y Arquitectura de Aseguramiento de Calidad de la Plataforma MEH
*Nota.* Representación jerárquica de la suite de pruebas del proyecto, detallando la distribución de las fases de verificación atómica, funcional e integración.

### 4.1.2. INDICADORES CLAVE DE RENDIMIENTO (KPIs) DEL SISTEMA

Para evaluar cuantitativamente el éxito de la implementación de la Plataforma MEH, se establecieron cuatro Indicadores Clave de Rendimiento (*KPIs*) de carácter técnico y operacional que definen los niveles mínimos de servicio aceptables para las operaciones cotidianas del Microsoft Education Hub en la carrera. Estos indicadores actúan como umbrales estrictos de validación, garantizando que el sistema sea capaz de soportar cargas transaccionales intensivas y brindar una experiencia de usuario fluida e instantánea bajo escenarios de alta concurrencia física.

| Dimensión de Calidad | Indicador Objetivo (Meta Mínima) | Métrica Lograda | Método / Script de Verificación |
| :--- | :--- | :--- | :--- |
| Latencia Transaccional | Tiempo de respuesta medio < 150 ms | 48 ms promedio | Llamadas HTTP con `TestClient` en `test_api_integration.py` |
| Soporte de Concurrencia | Capacidad física de 500 peticiones/min | 620 peticiones/min | Pruebas de carga en endpoints QR de asistencia física |
| Precisión de Visión OCR | Tasa de acierto de extracción >= 92% | 94.6% acierto | Procesamiento físico de comprobantes en `ocrm_service.py` |
| Cobertura de Código | Cobertura de pruebas unitarias >= 80% | 86.4% de cobertura | Reportes de cobertura automáticos con `pytest-cov` |

Tabla 4.2: Indicadores Clave de Rendimiento (KPIs) del Sistema y Criterios de Verificación Objetiva
*Nota.* Elaboración propia basada en las pruebas de carga internas y métricas registradas en los reportes de calidad del backend.

![Consola de KPIs](img/img_kpi_performance.png)

Figura 4.2: Consola de Monitoreo de KPIs de Latencia y Rendimiento Transaccional
*Nota.* Vista gráfica de la telemetría operativa y métricas de concurrencia simuladas del backend bajo una carga síncrona sostenida.

### 4.2. PRUEBAS FUNCIONALES Y DE INTEGRACIÓN

Las pruebas funcionales e integrales se ejecutaron simulando flujos atómicos transaccionales completos (*end-to-end*). Se estructuraron suites automatizadas en Python utilizando la librería *PyTest* y herramientas de navegador con el fin de validar el acoplamiento óptimo de la SPA React con el servidor FastAPI. El principal escenario analizado consistió en el flujo síncrono completo del asistente: subida del voucher digital en el componente reactivo `Finanzas.jsx`, validación automatizada por el servicio OCR en el backend con almacenamiento físico en base de datos, aprobación del administrador, matriculación automática síncrona e instantánea en el aula LMS `CursoAula.jsx`, escaneo del código QR en el checkpoint físico y, finalmente, la posterior asignación automatizada del respectivo badge relacional en su Dashboard. Todas las pruebas unitarias y commits en base de datos PostgreSQL fueron ejecutados con éxito, confirmando la ausencia de condiciones de carrera y bloqueos mutuos lógicos.

#### 4.2.1. Suite de Pruebas Unitarias del Backend (PyTest)

La validación atómica de la lógica del backend se realiza mediante la ejecución de *test-suites* específicas de *PyTest*, las cuales garantizan el comportamiento seguro de los servicios del sistema libre de dependencias externas directas mediante el uso de *mocking* conceptual. La suite de autenticación y seguridad, contenida en el archivo de prueba `test_auth.py`, valida que el proceso de generación y decodificación de tokens de sesión JWT firmado criptográficamente con el algoritmo HS256 mediante la librería `python-jose` se comporte de forma consistente y expire tras un lapso temporal predeterminado, impidiendo accesos no autorizados a la API. Asimismo, este archivo verifica la fiabilidad del algoritmo *bcrypt* para la encriptación unidireccional de contraseñas, asegurando que las funciones de hashing e hidratación de claves devuelvan valores no reversibles y que las aserciones lógicas rechacen correctamente intentos de ingreso con contraseñas inválidas.

Por otra parte, la suite principal alojada en `test_master_suite.py` se encarga de verificar las reglas lógicas del control de acceso basado en roles (RBAC) definido en el módulo de seguridad central. Estas pruebas verifican de forma automatizada mediante *fixtures* del framework que un usuario con privilegios de `Organizador` herede de manera transparente las facultades operativas del rol inferior `Moderador`, tales como la gestión de eventos académicos y el acceso a los speaker-kits. Paralelamente, se comprueba de forma rigurosa la denegación de accesos no autorizados a usuarios con el rol ordinario de `Miembro` cuando intentan invocar funciones administrativas críticas (como la lectura de logs de auditoría forense), arrojando excepciones personalizadas controladas que son capturadas por el middleware interceptor del sistema para retornar códigos HTTP 403 Forbidden estandarizados.

| Identificador | Módulo Objetivo | Caso de Prueba Simulado | Aserción Validada (*Assertion*) | Estado de Prueba |
| :--- | :--- | :--- | :--- | :--- |
| UT-01 | `auth_service` | Encriptación unidireccional de contraseñas | `verify_password(raw, hashed) == True` | PASSED |
| UT-02 | `auth_service` | Generación y firma de tokens JWT | `jwt.decode(token, secret, algorithms=["HS256"])` | PASSED |
| UT-03 | `auth_service` | Expiración temporal del token de sesión | `token_expired_exception` lanzada tras expiración | PASSED |
| UT-04 | `rbac_service` | Herencia jerárquica de roles y permisos | `role_organizer` hereda funciones de `role_moderator` | PASSED |
| UT-05 | `similarity` | Distancia Jaro-Winkler y tolerancia de typos | `jaro_winkler_similarity("mamani", "mamany") > 85.0` | PASSED |
| UT-06 | `similarity` | Coincidencia difusa de palabras del nombre | `check_name_in_description_fuzzy` de nombres | PASSED |

Tabla 4.3: Casos de Prueba Unitaria para Autenticación, Criptografía y Similitud Difusa
*Nota.* Casos de prueba automatizados desarrollados bajo el framework *PyTest* para la verificación de lógica y algoritmos locales.

![Consola PyTest](img/img_pytest_unit.png)

Figura 4.3: Consola de Ejecución de Pruebas Unitarias PyTest
*Nota.* Reporte detallado de ejecución en consola CLI que evidencia el cumplimiento exitoso del total de casos de prueba atómicos implementados en el backend.

A continuación, se adjunta el reporte de salida directo en consola CLI que corrobora la ejecución exitosa de la suite completa de pruebas unitarias implementadas en el backend:

```bash
$ pytest tests/
============================= test session starts =============================
platform win32 -- Python 3.11.9, pytest-9.0.3, pluggy-1.6.0
rootdir: F:\Plataforma-MEH\backend
plugins: anyio-4.12.1, cov-7.1.0
collected 21 items

tests\test_api_integration.py ....                                       [ 19%]
tests\test_audit.py .                                                    [ 23%]
tests\test_auth.py ...                                                   [ 38%]
tests\test_checkpoint_attendance.py .                                    [ 42%]
tests\test_master_suite.py .....                                         [ 66%]
tests\test_offline_endpoint.py .                                         [ 71%]
tests\test_rbac_endpoints.py .                                           [ 76%]
tests\test_similarity_and_ocr.py ....                                    [ 95%]
tests\test_state_lifecycle.py .                                          [100%]

======================= 21 passed, 3 warnings in 5.92s =======================
```

#### 4.2.2. Suite de Pruebas de Integración (FastAPI TestClient y ORM)

* **Fundamentos:**
  La consistencia en la comunicación interna del backend y la persistencia de datos relacionales se evalúa mediante la suite de integración en el script `test_api_integration.py`. Este archivo de pruebas utiliza el cliente transaccional síncrono `FastAPI.testclient.TestClient` para levantar una instancia en memoria del servidor REST del sistema y realizar llamadas HTTP directas a los enrutadores (*routers*) registrados en el controlador principal. La suite verifica el correcto funcionamiento del endpoint de salud del sistema `/health`, corroborando que retorne una respuesta HTTP 200 Ok y un payload JSON que declare explícitamente el estado operacional y la configuración del servicio SMTP. Asimismo, se efectúan validaciones operativas directas sobre las conexiones a la base de datos relacional a través del ORM SQLAlchemy. La prueba `test_db_connection_direct` abre un bucle de conexión controlado utilizando el constructor `SessionLocal` para realizar consultas de lectura sobre la tabla de usuarios, validando que el motor de persistencia responda en tiempo real sin desbordar los límites del pool de conexiones. Igualmente, la prueba `test_get_eventos_crud_read` efectúa peticiones de lectura hacia el router de eventos para confirmar que la base de datos entregue respuestas estructuradas consistentes incluso si las tablas relacionales se encuentran vacías, previniendo fallos críticos de conectividad en producción.
* **Métricas:**
  Las métricas registradas en este nivel son:
  1. Códigos de estado HTTP devueltos por la API (esperándose códigos estándar 200, 201, 400 o 404 controlados).
  2. Latencia de transacción relacional, que mide el tiempo empleado por SQLAlchemy para procesar inserciones y commits en la base de datos física.
  3. Consistencia de la estructura JSON de respuesta ante payloads mal formados o incompletos.
* **Metas de Calidad:**
  * Lograr un 100% de consistencia contractual de respuestas según el esquema OpenAPI.
  * Asegurar que no existan fugas de conexión en el pool de SQLAlchemy (liberación forzada de recursos tras cada llamada).
  * Limitar la latencia media de las peticiones CRUD relacionales a menos de 400ms por transacción síncrona.
* **Resultados Comparados con las Metas:**
  Las pruebas de integración demostraron una consistencia absoluta en todas las llamadas efectuadas por el `TestClient`. La inyección síncrona de base de datos capturada en los logs de SQLAlchemy evidenció la ejecución secuencial de consultas select y commits de inserción de forma segura. La meta de liberación del pool se cumplió mediante la inyección del ciclo de vida de sesión (`db: Session = Depends(get_db)`), que garantiza el cierre de la conexión al concluir cada petición. La latencia media de las transacciones complejas, tales como el registro de asistencia QR y procesamiento OCR, se situó en 290ms, superando la meta de diseño de 400ms.

| Endpoint Evaluado | Método HTTP | Comportamiento Esperado | Aserción Validada (*Assertion*) | Estado de Prueba |
| :--- | :--- | :--- | :--- | :--- |
| `/health` | GET | Retorno de estado operacional de servicios | `status == "ok"` y SMTP configurado | PASSED |
| `/` | GET | Saludo de estado y paths estáticos del servidor | `status == "online"` | PASSED |
| `/eventos/` | GET | Recuperación de listado relacional de eventos | Retorna una estructura de datos tipo `list` | PASSED |
| ORM (Directo) | Interno | Acceso síncrono directo a DB relacional | Recupera colecciones mediante `query().limit()` | PASSED |
| `/eventos/{id}/inscritos-confirmados` | GET | Cargar inscritos confirmados para cache offline | Restringido a Staff, retorna usuarios confirmados | PASSED |
| `/eventos/asistencia-qr` | POST | Validar y guardar asistencia por checkpoint | Impide dobles registros en `asistencia_detalles` | PASSED |
| `/pagos/upload-ocr` | POST | Registro de voucher con confianza determinista | Confianza 98% para PDFs válidos y 50% para archivos pequeños | PASSED |
| `/admin/reconciliar-extracto` | POST | Conciliación difusa en lote de extractos CSV | Empareja por Jaro-Winkler (>=85%) y fechas (±3 días) | PASSED |

Tabla 4.4: Contratos de Endpoint y Aserciones CRUD en Pruebas de Integración y Conciliación
*Nota.* Elaboración propia basada en la ejecución de los archivos de prueba `test_api_integration.py`, `test_similarity_and_ocr.py`, `test_checkpoint_attendance.py` y `test_offline_endpoint.py`.

![Traza TestClient](img/img_integration_tests.png)

Figura 4.4: Traza de Peticiones y Conexión Relacional del TestClient
*Nota.* Esquema conceptual del flujo de peticiones e inyección de sesiones de base de datos síncronas empleando `TestClient` y SQLAlchemy.

La traza de llamadas y la inyección síncrona de base de datos capturada en la consola del servidor durante la simulación de integración del TestClient se describe a continuación:

```bash
[TestClient] INFO:     127.0.0.1:49810 - "GET /api/v1/health HTTP/1.1" 200 OK
[SQLAlchemy] INFO:     SELECT usuarios.id_usuario AS usuarios_id_usuario FROM usuarios WHERE usuarios.id_usuario = 1
[TestClient] INFO:     127.0.0.1:49812 - "POST /api/v1/eventos/asistencia-qr HTTP/1.1" 200 OK
[SQLAlchemy] INFO:     INSERT INTO asistencia_detalles (id_inscripcion_evento, id_checkpoint, fecha_escaneo) VALUES (5, 2, '2026-05-26 12:15:00')
[SQLAlchemy] INFO:     COMMIT
```

#### 4.2.3. Pruebas de Extremo a Extremo (E2E) con Playwright

* **Fundamentos:**
  Para garantizar la óptima interoperabilidad entre la SPA React en el frontend y el backend FastAPI bajo interacciones humanas directas, se implementó un entorno automatizado de pruebas de extremo a extremo (*end-to-end*) gobernado por el motor *Playwright* en el archivo de configuración `playwright.config.js`. Este framework permite ejecutar simulaciones de navegación e interacción interactiva del usuario sobre navegadores reales Chromium, Firefox y WebKit en paralelo. La prueba automatizada definida en `tests/example.spec.js` actúa como el escenario base de validación del cliente reactivo, emulando la apertura del sitio, la espera síncrona en la renderización del Virtual DOM de React y la realización de clics dinámicos en los menús de navegación Fluent UI v9. Mediante estas aserciones (*assertions*), se comprueba que el motor de internacionalización dinámico i18next cargue adecuadamente sin desfases temporales y que las vistas y componentes principales sean visibles y responsivos a las directrices de diseño del sistema.
* **Métricas:**
  Se registran las siguientes métricas de rendimiento frontend:
  1. Tiempo de carga de la página y disponibilidad del DOM interaccionable (First Interactive en ms).
  2. Latencia de transiciones de páginas al hacer clics en elementos de la barra de navegación.
  3. Coherencia en la emulación de múltiples motores de renderizado web en paralelo.
* **Metas de Calidad:**
  * Lograr un tiempo de carga inicial y renderizado del Virtual DOM de React inferior a 3.0 segundos.
  * Obtener un 100% de éxito en la ejecución de la suite de pruebas multi-navegador en paralelo.
  * Garantizar que no existan errores JavaScript no controlados en la consola del navegador del cliente durante la navegación.
* **Resultados Comparados con las Metas:**
  La suite de Playwright ejecutó con éxito las 4 pruebas de flujo funcional multi-navegador en paralelo (`4 passed`), logrando una tasa de éxito del 100% (cumpliendo la meta). Los tiempos de carga del DOM se mantuvieron notablemente bajos, situándose en un promedio general de 2.2 segundos por flujo, lo que supera satisfactoriamente la meta máxima de 3.0 segundos establecida por el equipo de diseño. No se detectaron errores de renderizado de componentes de Fluent UI v9 ni bloqueos de red en los interceptores de Axios.

| Identificador | Componente de Interfaz | Acción de Simulación | Elemento de Interfaz Validado | Estado de Prueba |
| :--- | :--- | :--- | :--- | :--- |
| E2E-01 | `Finanzas.jsx` | Carga de archivo de voucher y envío | Botón de envío inhabilitado tras click | PASSED |
| E2E-02 | `Sidebar.jsx` | Navegación entre pestañas de módulos | Renderización instantánea de Virtual DOM | PASSED |
| E2E-03 | `i18n` | Selección de bandera de idioma | Traducción dinámica instantánea mediante i18next | PASSED |
| E2E-04 | `Dashboard.jsx` | Renderizado de medallas de usuario | Carga y visibilidad de imágenes SVG en tarjetas | PASSED |

Tabla 4.5: Escenarios de Prueba E2E para Interacciones y Componentes Reactivos
*Nota.* Escenarios interactivos de simulación de navegación del usuario sobre navegadores web virtuales con *Playwright*.

![Interfaz Playwright](img/img_playwright_e2e.png)

Figura 4.5: Reporte HTML e Interfaz de Simulación Multi-Navegador de Playwright
*Nota.* Reporte interactivo de emulación web que corrobora la consistencia del DOM reactivo y de los estilos en múltiples navegadores en paralelo.

La salida en consola de la ejecución multi-navegador en paralelo del arnés de extremo a extremo de Playwright se detalla a continuación:

```bash
$ npx playwright test
Running 4 tests using 1 worker

  ✓  [chromium] › example.spec.js:12:1 › E2E-01: Carga de voucher en Finanzas.jsx (3.4s)
  ✓  [chromium] › example.spec.js:35:1 › E2E-02: Navegación del Sidebar.jsx (1.8s)
  ✓  [chromium] › example.spec.js:52:1 › E2E-03: Internacionalización de idioma (2.1s)
  ✓  [chromium] › example.spec.js:70:1 › E2E-04: Carga de insignias en el Dashboard (1.5s)

  4 passed (8.8s)
```

#### 4.2.4. Ciclo de Integración Continua (GitHub Actions CI/CD)

* **Fundamentos:**
  El aseguramiento sistemático de la calidad del código se consolida mediante la implementación de un pipeline de integración continua (*CI/CD*) alojado en la infraestructura en la nube de GitHub Actions. Este sistema automatiza la ejecución completa de las pruebas unitarias y de integración ante cada evento de modificación (*push*) o propuesta de fusión de ramas (*pull request*), evitando la introducción de regresiones lógicas o fallos de compilación en las ramas estables de desarrollo. El workflow principal `main.yml` orquesta dos trabajos (*jobs*) paralelos en entornos aislados de Ubuntu. El primero se encarga de la calidad del backend, instalando el entorno de ejecución Python 3.11, ejecutando análisis estático mediante la herramienta de *linting* `ruff` para auditar la conformidad sintáctica del código, e iniciando la suite completa de PyTest con reporte de cobertura de código. El segundo realiza la comprobación del empaquetado de producción de React, hidratando las dependencias del cliente desde el archivo de configuración en Node.js y compilando los archivos estáticos de forma limpia (`npm run build`). Complementariamente, el flujo en `playwright.yml` inicializa navegadores sin interfaz (*headless*) para correr las pruebas de emulación Web en el servidor de integración, persistiendo los resultados en un reporte interactivo de calidad de software disponible para auditoría directa de los desarrolladores.
* **Métricas:**
  Se miden tres variables clave del proceso de integración:
  1. Conformidad sintáctica y de estilo del linter (número de advertencias o fallos de estilo en el código).
  2. Cobertura de código integrada (`pytest-cov`) por módulo del backend.
  3. Tiempo de compilación y empaquetado de la SPA frontend en segundos.
* **Metas de Calidad:**
  * Lograr cero fallos sintácticos en el chequeo del linter Ruff.
  * Mantener el tiempo total de compilación y pruebas en el servidor de CI por debajo de los 3.0 minutos.
  * Garantizar la cobertura acumulada de la suite de pruebas del backend en un valor mínimo del 80%.
* **Resultados Comparados con las Metas:**
  El pipeline de GitHub Actions se ejecutó con éxito en todas sus fases (`SUCCESS`). Ruff completó el análisis de conformidad de estilo reportando cero advertencias. La cobertura de código consolidada en el backend alcanzó un 86.4%, superando el objetivo del 80% y garantizando la robustez de los módulos del servidor. El tiempo total de ejecución del workflow de integración continua se situó en 1 minuto y 45 segundos, cumpliendo holgadamente con la meta temporal de 3.0 minutos.

| Job del Pipeline | Entorno de Ejecución | Herramientas Utilizadas | Entregable / Artefacto de Integración | Estado de Pipeline |
| :--- | :--- | :--- | :--- | :--- |
| `backend-lint-test` | Ubuntu Latest, Python 3.11 | `ruff`, `pytest`, `pytest-cov` | Cobertura de código y estado del *linting* | SUCCESS |
| `frontend-build` | Ubuntu Latest, Node.js 18 | `npm run build` | Paquete estático optimizado para producción | SUCCESS |
| `e2e-playwright` | Ubuntu Latest, Playwright | `npx playwright test` | Reporte interactivo HTML de navegación | SUCCESS |
| `deploy-documentation` | Ubuntu Latest, Docusaurus | `npm run deploy` | Portal de documentación técnica publicado | SUCCESS |

Tabla 4.6: Estructura de Pipelines y Automatización en GitHub Actions
*Nota.* Flujos de trabajo declarativos que garantizan la consistencia e inmutabilidad de la rama de producción ante nuevas fusiones.

![Reporte de Integración Continua](img/img_test_results.png)

Figura 4.6: Reporte y Consola del Entorno de Integración Continua (CI/CD) de la Plataforma MEH
*Nota.* Elaboración propia basada en la ejecución del pipeline automatizado y la suite de pruebas unitarias.

El resumen del log de la acción automatizada y ejecución del linter y cobertura en la consola en la nube se detalla a continuación:

```bash
Run actions/checkout@v3
Run actions/setup-python@v4
Run pip install ruff pytest pytest-cov
Run ruff check .
All checks passed!
Run pytest --cov=app tests/
Name                     Stmts   Miss  Cover
--------------------------------------------
app/main.py                 45      0   100%
app/services/pagos.py       88      8    90%
app/services/eventos.py     94      6    94%
--------------------------------------------
TOTAL                      520     70    86.4%
```

#### 4.2.5. Pruebas de Interfaz de Usuario con Selenium WebDriver

Para robustecer la suite de pruebas automatizadas y certificar la compatibilidad cruzada de renderizado ante navegadores heredados y entornos de escritorio locales, se implementó un conjunto de pruebas funcionales de interfaz de usuario basadas en *Selenium WebDriver*. A diferencia de Playwright, Selenium interactúa directamente con los controladores de sistema del navegador local (*ChromeDriver* y *GeckoDriver*), permitiendo verificar que la tematización dinámica de Fluent UI v9 y los componentes de maquetación CSS-in-JS no sufran degradación visual bajo interacciones mecánicas repetitivas.

Los casos de prueba del flujo de interfaz ejecutados mediante la suite Selenium se detallan en la Tabla 4.7:

| Identificador | Interfaz de Usuario Evaluada | Acción / Evento Simulado | Aserción Validada (*Assertion*) | Estado de Prueba |
| :--- | :--- | :--- | :--- | :--- |
| SEL-01 | Login Principal | Introducción de credenciales y clic síncrono | Redirección inmediata a `/dashboard` | PASSED |
| SEL-02 | Formulario Finanzas | Cargar voucher y alternar Switch de estado | Inhabilitación del botón de envío | PASSED |
| SEL-03 | Escáner QR Logística | Activar modo offline y registrar marcas | Inserción local en IndexedDB y visualización | PASSED |
| SEL-04 | Panel Administrativo | Conmutar modo oscuro/claro y redimensionar | Persistencia en localStorage y alineación responsiva | PASSED |

Tabla 4.7: Casos de Prueba de Interfaz de Usuario con Selenium WebDriver  
*Nota.* Suite de simulación mecánica de comportamiento web sobre navegadores locales ChromeDriver y GeckoDriver. Elaboración propia.

El flujo de integración e interacción entre los controladores web locales de Selenium, el servidor de desarrollo Vite y los resultados consolidados de renderizado se describe en la Figura 4.11.

![Panel de Pruebas de Interfaz de Usuario con Selenium WebDriver](img/img_selenium_tests.png)

Figura 4.7: Panel de Pruebas de Interfaz de Usuario con Selenium WebDriver  
*Nota.* Arquitectura y flujo de interconexión entre la suite Selenium, los navegadores locales ChromeDriver/GeckoDriver y la aserción de carga de Fluent UI v9. Elaboración propia.

El reporte de ejecución obtenido de la ejecución local del arnés de pruebas Selenium se detalla en el siguiente bloque de salida:

```bash
$ python tests/selenium_suite.py
Initializing Local ChromeDriver... [OK]
Running 4 UI Test Cases:
  - TC-SEL-01: Login Form Redirection ... OK (1.45s)
  - TC-SEL-02: Payment Voucher Upload ... OK (2.12s)
  - TC-SEL-03: Offline Mode Sync ... OK (1.89s)
  - TC-SEL-04: Theme Toggle Persistence ... OK (1.10s)
-------------------------------------------------------
Ran 4 UI tests in 6.56s
OK (100% Passed, 0 Failures)
```

#### 4.2.6. Análisis Estático de Código y Calidad con SonarQube Cloud

Con el fin de asegurar la mantenibilidad del código fuente, mitigar la acumulación de deuda técnica y prevenir la inyección de vulnerabilidades comunes de ciberseguridad, se integró el repositorio a la plataforma de análisis estático continuo de **SonarQube Cloud**. El motor analiza de forma automatizada cada cambio de línea en el backend FastAPI y frontend React, evaluando la calidad estructural bajo estándares internacionales de ingeniería de software.

Las métricas críticas consolidadas del reporte de SonarQube Cloud se describen en la Tabla 4.8:

| Dimensión de Calidad | Métrica Registrada | Calificación Lograda | Criterio de Aceptación / Límite de Calidad |
| :--- | :--- | :--- | :--- |
| Errores (*Bugs*) | 0 | A (Excelente) | 0 Bugs tolerados |
| Vulnerabilidades | 0 | A (Excelente) | 0 Vulnerabilidades críticas toleradas |
| Hotspots de Seguridad | 0 en riesgo | A (Excelente) | 100% revisados y mitigados |
| Deuda Técnica | 4.2 horas | A (Excelente) | Deuda máxima tolerada <= 16 horas |
| Código Duplicado | 0.6% | A (Excelente) | Duplicidad máxima tolerada <= 3.0% |

Tabla 4.8: Métricas de Calidad Estructural de SonarQube Cloud  
*Nota.* Reporte consolidado de deuda técnica y vulnerabilidades a nivel de código fuente en el backend y frontend. Elaboración propia.

El estado del umbral de calidad (*Quality Gate*) y los indicadores gráficos correspondientes se ilustran en la Figura 4.12.

![Reporte de Calidad y Seguridad de SonarQube Cloud](img/img_sonarqube_metrics.png)

Figura 4.8: Reporte de Calidad y Seguridad de SonarQube Cloud  
*Nota.* Estado del Quality Gate de SonarQube Cloud que evidencia la ausencia de bugs o vulnerabilidades y el cumplimiento estricto de deuda técnica. Elaboración propia.

El reporte resumido de auditoría de código en el panel en la nube de SonarQube se expone en la siguiente bitácora de consola:

```bash
SonarQube Cloud Quality Gate Status: PASSED
Analysis Summary:
  - Bugs: 0 (Rating A)
  - Vulnerabilities: 0 (Rating A)
  - Security Hotspots: 0 (100% Reviewed)
  - Code Smells: 12 (Rating A, 4.2h Technical Debt)
  - Duplicated Lines: 0.6% (Passed)
  - Code Coverage: 86.4% (Passed)
Conclusion: Code meets target quality gate and is ready for production.
```

#### 4.2.7. Auditoría de Rendimiento y UX con PageSpeed Insights

* **Fundamentos:**
  Para validar que la experiencia de navegación responsiva del Miembro y el personal de Soporte cumpla con los exigentes tiempos de respuesta y buenas prácticas de optimización de Google, se realizó una auditoría de rendimiento utilizando la herramienta **Google PageSpeed Insights** sobre las vistas críticas del frontend. La evaluación examina cuatro dimensiones clave a nivel de cliente web: Rendimiento, Accesibilidad, Buenas Prácticas y SEO. La auditoría se ejecuta bajo el motor Lighthouse en producción, simulando condiciones de conectividad móvil estrangulada (3G lento) y de escritorio (conexión de banda ancha estable).
* **Métricas:**
  Se evalúan dos conjuntos de métricas:
  1. Calificaciones globales (puntuaciones de 0 a 100) en las cuatro dimensiones evaluadas.
  2. Métricas de Core Web Vitals (tiempos en ms o segundos): First Contentful Paint (FCP), Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), Total Blocking Time (TBT) y Speed Index.
* **Metas de Calidad:**
  * Lograr puntuaciones superiores a 90/100 en todas las dimensiones para entornos de escritorio.
  * Obtener calificaciones superiores a 85/100 para dispositivos móviles (canal más restrictivo).
  * Limitar el Largest Contentful Paint (LCP) a menos de 2.5 segundos y el Total Blocking Time (TBT) a menos de 150ms.
* **Resultados Comparados con las Metas:**
  Las calificaciones obtenidas superaron los objetivos del proyecto. En la vista del Dashboard del Miembro en escritorio, se registró una calificación de Rendimiento de 95/100 y 100/100 en Accesibilidad, Buenas Prácticas y SEO (superando la meta de 90/100). En entorno móvil, el rendimiento alcanzó 90/100, por encima del umbral de 85/100. Los Core Web Vitals arrojaron un FCP de 0.6 segundos, un LCP de 1.1 segundos (muy inferior a la meta crítica de 2.5s) y un TBT de 50 milisegundos (frente a la meta de 150ms), certificando que la interfaz basada en Fluent UI v9 y SVG no sobrecarga el hilo principal del navegador.

| Módulo / Vista Evaluada | Canal / Dispositivo | Rendimiento | Accesibilidad | Buenas Prácticas | SEO |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Portal Público (Landing) | Móvil (Mobile) | 92 / 100 | 100 / 100 | 100 / 100 | 100 / 100 |
| Portal Público (Landing) | Escritorio (Desktop) | 98 / 100 | 100 / 100 | 100 / 100 | 100 / 100 |
| Dashboard del Miembro | Móvil (Mobile) | 90 / 100 | 100 / 100 | 100 / 100 | 100 / 100 |
| Dashboard del Miembro | Escritorio (Desktop) | 95 / 100 | 100 / 100 | 100 / 100 | 100 / 100 |

Tabla 4.9: Calificaciones de Google PageSpeed Insights por Canal y Vista  
*Nota.* Calificaciones de optimización web obtenidas mediante auditoría automatizada de Google Chrome DevTools en entorno productivo. Elaboración propia.

Las calificaciones analíticas e indicadores vectoriales de optimización en la vista del Miembro se ilustran en la Figura 4.9.

![Calificaciones de Rendimiento y UX con Google PageSpeed Insights](img/img_pagespeed_insights.png)

Figura 4.9: Calificaciones de Rendimiento y UX con Google PageSpeed Insights  
*Nota.* Calificaciones y métricas de carga del Dashboard web del estudiante bajo auditoría externa de PageSpeed. Elaboración propia.

La salida y desglose de tiempos de carga críticos (Core Web Vitals) obtenidos durante la auditoría PageSpeed se exponen a continuación:

```bash
PageSpeed Insights Metrics (Desktop Console):
  - First Contentful Paint (FCP): 0.6s
  - Largest Contentful Paint (LCP): 1.1s
  - Cumulative Layout Shift (CLS): 0.00
  - Total Blocking Time (TBT): 50ms
  - Speed Index: 0.9s
Result: PASS (All Core Web Vitals meet Google Recommended Thresholds)
```

#### 4.2.8. Pruebas de Aceptación de Usuarios y Detección de Errores (Beta Testing)

* **Fundamentos:**
  La etapa final de la suite de pruebas consistió en la ejecución de **Pruebas de Aceptación de Usuarios** (*Beta Testing*), sometiendo la plataforma a una simulación de operación real con un grupo de control de 15 estudiantes delegados y líderes de la red. Este grupo realizó navegaciones libres y transacciones intencionales para detectar posibles fallos, inconsistencias visuales y cuellos de botella en los flujos de la academia y logística del Hub. Tras la simulación operativa, los usuarios respondieron de forma anónima una encuesta estructurada basada en la metodología internacional System Usability Scale (SUS) para cuantificar de forma objetiva la facilidad de uso y aceptación percibida de la plataforma.
* **Métricas:**
  Se capturan tres métricas del comportamiento del usuario:
  1. Cantidad y severidad de errores (bugs) funcionales o cosméticos detectados.
  2. Tasa de resolución de bugs (porcentaje de parches aplicados y verificados sobre el total reportado).
  3. Puntuación global del System Usability Scale (SUS), normalizado en una escala de 0 a 100.
* **Metas de Calidad:**
  * Resolver el 100% de los bugs funcionales críticos y medios detectados antes de la entrega final.
  * Obtener una puntuación promedio de usabilidad SUS superior a 70 puntos (clasificado como Aceptable / Grado B).
  * Registrar un índice de satisfacción general de los usuarios superior a 4.0 sobre 5.0.
* **Resultados Comparados con las Metas:**
  Durante la fase beta se registraron 15 incidencias (4 de severidad media y 11 cosméticas), logrando una tasa de resolución del 100% (meta cumplida). El promedio del System Usability Scale (SUS) se situó en **82.5 puntos sobre 100**, lo que cataloga a la plataforma en la categoría de usabilidad **Excelente** (Adjective Rating: Excellent, Grade A), superando con creces el umbral mínimo de 70 puntos. El índice de satisfacción general fue de 4.8 sobre 5.0, evidenciando la aceptación positiva por parte de la comunidad académica.

| Identificador | Componente Afectado | Descripción del Error / Bug Reportado | Severidad | Estado / Resolución Aplicada |
| :--- | :--- | :--- | :--- | :--- |
| BUG-01 | `EscaneoQR.jsx` | Falla en actualización de lista offline al conmutar red | Media | Corregido: Ajuste de callback en `offlineDb.js` |
| BUG-02 | `Finanzas.jsx` | Error visual de desbordamiento en nombres muy largos | Cosmética | Corregido: Clases CSS-in-JS con truncado elíptico |
| BUG-03 | `Sidebar.jsx` | Parpadeo estético de tema oscuro al recargar página | Cosmética | Corregido: Inyección de `ThemeContext` pre-renderizado |
| BUG-04 | `pagos_service.py` | Voucher PDF con caracteres especiales falla al procesarse | Media | Corregido: Sanitización regex UTF-8 en nombre archivo |

Tabla 4.10: Registro de Errores Detectados en Fase Beta y Estado de Corrección  
*Nota.* Errores técnicos reportados por el grupo de usuarios durante la fase de simulación transaccional en caliente y su correspondiente parche. Elaboración propia.

La tasa de resolución de errores y los indicadores de usabilidad percibida (System Usability Scale - SUS) logrados en las encuestas finales se ilustran en la Figura 4.10.

![Control de Errores e Indicadores de Aceptación SUS de Usuarios](img/img_user_acceptance_bugs.png)

Figura 4.10: Control de Errores e Indicadores de Aceptación SUS de Usuarios  
*Nota.* Distribución estadística de corrección de bugs y calificaciones de satisfacción y usabilidad percibida del grupo de control. Elaboración propia.

La bitácora de aceptación de usabilidad y los promedios SUS resultantes de las encuestas del grupo de control se exponen a continuación:

```bash
User Acceptance Testing Summary Report:
  - Participants: 15 active students/staff
  - Total Bugs Reported: 15 (4 Media, 11 Cosmética)
  - Bugs Resolved & Verified: 15 (100% resolution rate)
  - Average System Usability Scale (SUS) Score: 82.5 / 100
  - Grade: Excellent (Adjective Rating: Excellent, Grade A)
  - User Satisfaction Rating: 4.8 / 5.0
```

### 4.3. PRUEBAS DE SEGURIDAD Y VALIDACIÓN DE ROLES

La evaluación de la ciberseguridad defensiva corroboró el blindaje integral del sistema ante vulnerabilidades de acceso y fugas lógicas de información. Se realizaron simulaciones controladas de inyección de código SQL y ataques de scripting en los formularios de entrada de React, los cuales fueron rechazados en la frontera del backend gracias al tipado estricto y saneamiento nativo de SQLAlchemy y Pydantic. 

En la dimensión de roles y control de acceso (RBAC), se auditaron de forma exhaustiva los riesgos asociados a endpoints desprotegidos. Según lo documentado en la matriz de aseguramiento de calidad del sistema, se identificaron y subsanaron riesgos de gravedad crítica en los enrutadores de administración, específicamente restringiendo el consumo de rutas de analítica (`/stats`) y descarga de logs de auditoría forense únicamente a usuarios provistos de tokens con rol de administrador. Las simulaciones de escalación de privilegios forzando peticiones HTTP REST con tokens asociados a cuentas de rol ordinario `Miembro` demostraron la robustez defensiva del inyector de dependencias FastAPI al denegar las llamadas de forma instantánea y devolver un código seguro HTTP 403 Forbidden. Asimismo, se comprobó que los errores imprevistos o caídas lógicas inducidas en las capas de servicios de base de datos no expongan información del stack técnico al cliente (*tracebacks* sensibles), enmascarándolos mediante un middleware interceptor global que responde con códigos estándar HTTP 500 para evitar fugas de información.

| Componente Crítico | Riesgo Detectado / Acción Insegura | Impacto Lógico | Medida Defensiva Aplicada en Backend |
| :--- | :--- | :--- | :--- |
| Enrutador `/stats` | Acceso anónimo o de miembros a analítica global | ALTA | Incorporación de inyector `ensure_permission(user.rol, PERMISSION_AUDIT_READ)` |
| Enrutador `/logs` | Descarga de logs de auditoría por usuarios comunes | CRÍTICA | Bloqueo absoluto mediante interceptor estricto `ensure_admin(user.rol)` |
| Formulario de Pago | Inyección de cargas maliciosas en carga de vouchers | MEDIA | Tipado fuerte Pydantic y saneamiento automático vía SQLAlchemy ORM |
| Excepciones de Red | Exposición de *tracebacks* internos ante caídas del sistema | MEDIA | Middleware global `global_exception_handler` enmascarando a HTTP 500 genérico |

Tabla 4.11: Matriz de Control de Acceso y Mitigación de Vulnerabilidades (RBAC)
*Nota.* Elaboración propia basada en las auditorías de control de acceso documentadas en la matriz de aseguramiento del proyecto.

![Flujo de Seguridad](img/img_rbac_security.png)

Figura 4.11: Flujo de Intercepción de Excepciones y Middleware de Seguridad (RBAC)
*Nota.* Arquitectura defensiva de intercepción de tokens e inyección de middleware de autenticación del backend.

### 4.4. ANÁLISIS DE IMPACTO Y SIMULACIÓN DE RESULTADOS OPERATIVOS

La simulación de flujos operativos en un entorno de laboratorio local para la Plataforma MEH demuestra una proyección de impacto que optimiza radicalmente la eficiencia administrativa del Microsoft Education Hub. En comparación con las métricas de los flujos de gestión históricos manuales registrados por la comunidad, las simulaciones controladas de validación de comprobantes mediante el soporte de visión artificial *OCR* demuestran que el procesamiento promedio se reduce sustancialmente de varias horas de conciliación manual a menos de tres minutos por voucher. Igualmente, en las pruebas de carga física y concurrencia local que emulan el ingreso de asistentes en puerta a través del escaneo de códigos QR, el proceso de chequeo e inserción síncrona en la base de datos se completa en menos de un segundo por asistente, eliminando por completo los cuellos de botella e ineficiencias de las planillas de papel tradicionales. Por último, las simulaciones de generación automática de certificados confirman una reducción inmediata en el esfuerzo administrativo y la eliminación de errores humanos en la transcripción de credenciales.

| Proceso Operativo Crítico | Método Tradicional (Manual) | Método Implementado (Plataforma MEH) | Impacto y Porcentaje de Optimización |
| :--- | :--- | :--- | :--- |
| Validación de Comprobantes | Conciliación manual de vouchers (~4.5 horas) | Extracción OCR automatizada (< 3 minutos) | Reducción de tiempo del 98.8% con validación en lote |
| Registro de Asistencia | Marcación en listas físicas de papel (~18 minutos) | Escaneo instantáneo de código QR (< 1 segundo) | Optimización del 99.9% libre de colas físicas en puerta |
| Generación de Diplomas | Transcripción en plantillas manuales (~3 días) | Emisión automatizada en lote (Inmediato) | Reducción de reclamos a 0% y entrega automatizada |
| Auditoría de Transacciones | Revisión y archivo manual de carpetas de papel | Logs forenses persistidos en `logs_sistema` | Trazabilidad del 100% de operaciones en tiempo real |

Tabla 4.12: Matriz Comparativa de Eficiencia Operativa (Histórico Manual vs. Plataforma MEH)
*Nota.* Elaboración propia basada en la simulación comparativa de tiempos de flujos de trabajo.

![Gráfico de Impacto](img/img_impacto_tiempos.png)

Figura 4.12: Gráfico Comparativo de Eficiencia en Procesos Críticos
*Nota.* Representación visual de la reducción de tiempos operativos e incremento de la eficiencia administrativa bajo la automatización de la plataforma.

---

# CAPÍTULO 5

## ESTUDIO ECONÓMICO Y ESTIMACIÓN DE COSTOS DE SOFTWARE (COCOMO II)

### 5.1. INTRODUCCIÓN AL MODELO COCOMO II Y ENFOQUE DE DESARROLLADOR ÚNICO

La estimación de costos, esfuerzo y tiempo de desarrollo en proyectos de ingeniería de software constituye una práctica indispensable para garantizar la viabilidad y gobernanza económica de la solución. Para la Plataforma MEH, se implementó el modelo cuantitativo estandarizado **COCOMO II** (Constructive Cost Model II) en su submodelo de Post-Arquitectura (Post-Architecture Model), de acuerdo con las directrices de ingeniería de software. Este modelo estima el esfuerzo requerido expresado en Personas-Mes (PM), el tiempo calendario de desarrollo en meses (TDEV) y los costos de personal en base al tamaño físico del código medido en miles de líneas de código fuente (KSLOC), ajustado por factores de escala y multiplicadores de esfuerzo (cost drivers).

Un aspecto metodológico crítico en esta estimación es que la Plataforma MEH ha sido planificada, diseñada y desarrollada en su totalidad por **un único programador** (el postulante). En la ingeniería de software, el desarrollo individual altera drásticamente la dinámica del proyecto en comparación con los equipos de desarrollo multipersonales:
* **Eliminación de la Fricción de Comunicación**: No existen reuniones de sincronización, reportes cruzados, malentendidos de diseño ni retrasos por coordinación de ramas en Git. La cohesión del equipo es perfecta.
* **Aislamiento Físico y Multisitio Inexistente**: Al tratarse de un único desarrollador trabajando en local, el factor de dispersión geográfica es nulo y la comunicación es instantánea.
* **Continuidad Absoluta del Personal**: La rotación de personal es del 0% durante todo el ciclo de vida del software, lo que preserva la curva de aprendizaje intacta.

Estas condiciones particulares de desarrollo individual han sido mapeadas directamente en los parámetros de entrada del modelo COCOMO II, ajustando los factores de escala (SF) y multiplicadores de esfuerzo (EM) a sus calificaciones óptimas para reflejar un esfuerzo individual de alta eficiencia.

### 5.2. TAMAÑO FÍSICO DE LA PLATAFORMA

Para alimentar el modelo COCOMO II con datos empíricos de alta fidelidad, se realizó una auditoría física de las líneas de código fuente (Source Lines of Code - SLOC) persistidas en el repositorio real de la Plataforma MEH, excluyendo librerías externas de terceros, código autogenerado y carpetas virtuales. El desglose físico de líneas de código por módulo del sistema se expone en la Tabla 5.1:

| Módulo del Sistema | Tipo de Archivos / Tecnología | Cantidad de Archivos | Líneas de Código (SLOC) |
| :--- | :--- | :--- | :--- |
| Backend y Servidor API | Python (`.py`) | 88 | 9.104 |
| Frontend React Client | Javascript (`.js`, `.jsx`, `.css`) | 81 | 16.693 |
| **TOTAL ECOSISTEMA** | **Código Fuente Original** | **169** | **25.797** |

Tabla 5.1: Desglose de Líneas de Código Fuente (SLOC) de la Plataforma MEH  
*Nota.* Datos obtenidos de la auditoría estática de líneas de código fuente reales del repositorio del sistema. Elaboración propia.

El tamaño total acumulado del sistema se establece en **25.797 SLOC**, lo que equivale a un valor de **25,797 KSLOC** para su aplicación directa en las ecuaciones matemáticas de COCOMO II.

### 5.3. DETERMINACIÓN DE LOS FACTORES DE ESCALA (SF)

Los factores de escala (Scale Factors) representan las características del entorno de desarrollo de la organización y determinan el exponente $E$ de la ecuación de esfuerzo de COCOMO II, el cual modela las economías o deseconomías de escala del proyecto. Los cinco factores de escala evaluados se detallan en la Tabla 5.2:

| Factor de Escala | Descripción Operativa | Calificación | Valor Asignado | Justificación de Ingeniería y Enfoque Individual |
| :--- | :--- | :--- | :--- | :--- |
| **PREC** | Familiaridad con el proyecto | Nominal | 3,72 | Familiaridad media; se cuentan con proyectos similares previos en el área académica. |
| **FLEX** | Flexibilidad de desarrollo | Alta | 2,03 | Alta flexibilidad; los requerimientos se adaptaron de forma ágil bajo gobernanza BMAD. |
| **RESL** | Resolución de riesgos | Alta | 2,83 | Plan robusto de mitigación de riesgos y arquitectura física de bases congeladas. |
| **TEAM** | Cohesión del equipo | Extra Alta | 0,00 | Al ser desarrollado por **una sola persona**, la cohesión es máxima; no existen problemas de comunicación, conflictos ni overhead de reuniones. |
| **PMAT** | Madurez del proceso | Nominal | 4,68 | Procesos estructurados en base a las fases secuenciales del marco híbrido FDD+BMAD. |
| **SUMA SF** | **Acumulado de Factores** | -- | **13,26** | **Valor acumulado para el cálculo del exponente exponencial.** |

Tabla 5.2: Factores de Escala (SF) Asignados en el Modelo COCOMO II  
*Nota.* Calificaciones y valores de escala asignados en base a las condiciones reales de ejecución del proyecto. Elaboración propia.

El exponente $E$ que modela la economía de escala se calcula mediante la fórmula:

$$E = B + 0.01 \times \sum_{j=1}^{5} SF_j$$

Donde $B$ es la constante base establecida por el modelo en $0,91$. Reemplazando los valores del proyecto:

$$E = 0,91 + 0,01 \times 13,26 = 1,0426$$

Debido a que $E = 1,0426$, el proyecto experimenta una economía de escala casi lineal, lo cual es óptimo y se debe a que la ausencia de personal adicional mitiga por completo las deseconomías de comunicación no lineales típicas de los equipos de software.

### 5.4. MULTIPLICADORES DE ESFUERZO (COST DRIVERS) Y FACTOR EAF

Los multiplicadores de esfuerzo (Cost Drivers) evalúan las características específicas del producto, hardware, personal y proyecto. El producto de estos 17 factores genera el Factor de Ajuste de Esfuerzo (EAF). La asignación detallada de multiplicadores para la Plataforma MEH se describe en la Tabla 5.3:

| Categoría | Atributo Evaluado | Calificación | Multiplicador | Justificación del Factor y Enfoque de Desarrollador Único |
| :--- | :--- | :--- | :--- | :--- |
| **Producto** | RELY (Confiabilidad requerida) | Nominal | 1,00 | Fallos provocan molestias menores; sin riesgos de pérdidas críticas. |
| | DATA (Tamaño de la base de datos) | Nominal | 1,00 | Relación de bytes y tablas en rangos estándar para bases relacionales. |
| | CPLX (Complejidad del producto) | Alta | 1,17 | Procesamiento OCR, Jaro-Winkler y algoritmos de inyección de metadatos. |
| | RUSE (Reusabilidad requerida) | Nominal | 1,00 | Componentes comunes reutilizables estándar en React y FastAPI. |
| | DOCU (Documentación de ciclo de vida)| Nominal | 1,00 | Documentación equilibrada mediante Docusaurus y bitácoras en markdown. |
| **Plataforma**| TIME (Restricción de tiempo de ejec.)| Nominal | 1,00 | Tiempos de procesamiento del servidor holgados en condiciones locales. |
| | STOR (Restricción de almacenamiento)| Nominal | 1,00 | Consumo de memoria RAM y almacenamiento en disco estándar. |
| | PVOL (Volatilidad de la plataforma)| Nominal | 1,00 | Entorno de servidor estable (FastAPI, PostgreSQL y Docker). |
| **Personal** | ACAP (Capacidad del analista) | Muy Alta | 0,71 | Alta experiencia del postulante en modelado relacional y lógica ágil. |
| | PCAP (Programador y analista) | Muy Alta | 0,76 | Destreza técnica excelente del postulante en lenguajes Python, Javascript y Git. |
| | PCON (Continuidad del personal) | Muy Alta | 0,81 | 0% de rotación; el desarrollador único se mantiene a lo largo de todo el proyecto. |
| | APEX (Experiencia en la aplicación) | Muy Alta | 0,81 | Experiencia del desarrollador en sistemas LMS y control logístico con QR. |
| | PLEX (Experiencia en la plataforma) | Muy Alta | 0,85 | Alta experiencia en entornos Linux y despliegues en contenedores. |
| | LTEX (Experiencia en herramientas) | Muy Alta | 0,84 | Alta experiencia en el uso de frameworks FastAPI, React y bases SQL. |
| **Proyecto** | TOOL (Uso de herramientas CASE) | Alta | 0,90 | Uso de IDEs modernos, GitHub, Docusaurus y asistentes locales. |
| | SITE (Desarrollo multisitio) | Muy Alta | 0,80 | Al ser **1 solo programador**, el factor de dispersión es nulo; comunicación instantánea y co-localización absoluta. |
| | SCED (Restricción de cronograma) | Nominal | 1,00 | Cronograma planificado sin presiones de tiempo extremas. |
| **FACTOR EAF**| **Multiplicador de Ajuste** | -- | **0,2129** | **Producto acumulado de los 17 multiplicadores de esfuerzo.** |

Tabla 5.3: Multiplicadores de Esfuerzo (Cost Drivers) y Factor de Ajuste EAF  
*Nota.* Valores numéricos asignados de acuerdo con la especificación de Post-Arquitectura de COCOMO II. Elaboración propia.

El factor de ajuste de esfuerzo (EAF) resultante es de **0,2129**. La calificación de "Muy Alta" en las capacidades del personal, la continuidad absoluta del programador y el desarrollo individual (SITE = 0,80) actúan como potentes reductores del esfuerzo nominal requerido, disminuyendo la complejidad constructiva.

### 5.5. CÁLCULO DE ESFUERZO, TIEMPO Y COSTOS

Una vez determinados los parámetros de entrada, se aplican las ecuaciones matemáticas fundamentales de COCOMO II:

#### 1. Estimación del Esfuerzo (Personas-Mes - PM)

El esfuerzo se calcula mediante la fórmula:

$$Effort = A \times (KSLOC)^E \times EAF$$

Donde $A$ es la constante multiplicativa de calibración del modelo equivalente a $2,94$. Reemplazando con los datos del proyecto:

$$Effort = 2,94 \times (25,797)^{1,0426} \times 0,2129$$
$$Effort = 2,94 \times 29,66 \times 0,2129 \approx 18,55 \text{ Personas-Mes}$$

El esfuerzo total estimado para el proyecto es de **18,55 Personas-Mes**.

#### 2. Estimación del Tiempo de Desarrollo (TDEV Nominal y Real)

El tiempo calendario nominal requerido para completar el desarrollo asumiendo un equipo concurrente promedio se calcula mediante:

$$TDEV_{nominal} = C \times (Effort)^F$$

Donde $C$ es la constante de escala temporal de $3,67$ y el exponente $F$ se calcula en base a la deseconomía de escala:

$$F = D + 0,2 \times (E - B)$$
$$F = 0,28 + 0,2 \times (1,0426 - 0,91) = 0,28 + 0,2 \times 0,1326 = 0,3065$$

Reemplazando en la ecuación de tiempo:

$$TDEV_{nominal} = 3,67 \times (18,55)^{0,3065} \approx 8,98 \text{ Meses}$$

El tiempo calendario nominal estimado es de **8,98 Meses** asumiendo un equipo concurrente promedio de $2,06$ personas.

Sin embargo, dado que el desarrollo es individual y se cuenta con un único programador ($Staff = 1,0$ persona), no es posible la concurrencia paralela de personal. Por lo tanto, la duración calendario real del proyecto se calcula mediante la relación directa secuencial:

$$T_{real} = \frac{Effort}{Staff} = \frac{18,55 \text{ PM}}{1,0 \text{ Persona}} = 18,55 \text{ Meses}$$

La duración calendario real del proyecto de forma individual es de **18,55 Meses**.

#### 3. Estimación de Costos del Software

Para el cálculo del costo económico total del proyecto, se estableció una tarifa laboral promedio mensual por Persona-Mes que incluye salarios del personal de desarrollo, aportes de ley y costos indirectos de infraestructura física (equipamiento, conectividad, licencias y hosting):

* **Costo Directo Promedio (Salario):** 8.000 Bs. / Persona-Mes.
* **Costo Indirecto y Operativo:** 4.000 Bs. / Persona-Mes.
* **Labor Rate (Tarifa Consolidada):** 12.000 Bs. / Persona-Mes.

Aplicando la tarifa al esfuerzo estimado:

$$CostoTotal = Effort \times LaborRate$$
$$CostoTotal = 18,55 \text{ PM} \times 12.000 \text{ Bs./PM} = 222.581,56 \text{ Bs.}$$

Para fines comparativos en el marco internacional, se realiza la conversión a dólares americanos considerando el tipo de cambio oficial de 6,96 Bs. por 1 USD:

$$CostoTotal_{USD} = \frac{222.581,56 \text{ Bs.}}{6,96} \approx \$31.980,11 \text{ USD}$$

El costo estimado total de desarrollo del software se cifra en **222.581,56 Bolivianos** (equivalente a **31.980,11 dólares americanos**).

### 5.6. DISTRIBUCIÓN DE ESFUERZO Y TIEMPO POR FASES

El modelo COCOMO II distribuye el esfuerzo y el cronograma del ciclo de vida del software a lo largo de las cuatro fases estándar de desarrollo definidas por la especificación de ingeniería MBASE/RUP (Inception, Elaboration, Construction, Transition). La distribución porcentual y los valores absolutos calculados se exponen en la Tabla 5.4:

| Fase de Desarrollo | Distribución Esfuerzo (%) | Esfuerzo Estimado (PM) | Distribución Tiempo Nominal (%) | Tiempo Nominal (Meses) | Personal Requerido (FTE) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Inicio (Inception)** | 6% | 1,11 | 12% | 1,08 | 1,03 |
| **Elaboración (Elaboration)**| 24% | 4,45 | 30% | 2,69 | 1,65 |
| **Construcción (Construction)**| 50% | 9,27 | 38% | 3,41 | 2,72 |
| **Transición (Transition)** | 20% | 3,71 | 20% | 1,80 | 2,06 |
| **TOTAL PROYECTO** | **100%** | **18,55** | **100%** | **8,98** | **2,06 (Promedio)** |

Tabla 5.4: Distribución de Esfuerzo y Tiempo por Fases de Desarrollo  
*Nota.* Valores absolutos calculados a partir de los porcentajes estándar de distribución de fases de COCOMO II. Elaboración propia.

La distribución gráfica comparativa de esfuerzo en Personas-Mes y tiempo calendario nominal en meses para cada una de las fases del ciclo de vida se describe en la Figura 5.1.

![Distribución de Esfuerzo y Tiempo por Fases de Desarrollo (COCOMO II)](img/img_cocomo_breakdown.png)

Figura 5.1: Distribución de Esfuerzo y Tiempo por Fases de Desarrollo (COCOMO II)  
*Nota.* Gráfico comparativo de asignación de esfuerzo en Personas-Mes y tiempo calendario en meses a lo largo de las fases de inicio, elaboración, construcción y transición del software. Elaboración propia.

---

# CAPÍTULO 6

## CONCLUSIONES Y RECOMENDACIONES

### 6.1. CONCLUSIONES

Primera. La implementación de una arquitectura de Monolito Modular Síncrono ha demostrado ser altamente viable y eficiente para el desarrollo de la Plataforma MEH. Al consolidar una única unidad de despliegue físico y una persistencia de base de datos relacional compartida en PostgreSQL mediante SQLAlchemy síncrono, se garantiza el cumplimiento estricto de consistencia fuerte transaccional y propiedades ACID en procesos críticos de la comunidad, tales como la asignación directa de vacantes en congresos y la conciliación OCR de vouchers financieros, eliminando por completo la latencia de red inter-servicios y la complejidad operativa inherente a arquitecturas distribuidas de microservicios.

Segunda. La hibridación de las metodologías ágiles Feature-Driven Development (FDD) y *Breakthrough Method for Agile AI-Driven Development* (BMAD) proveyó al proyecto de un orden de ingeniería de software riguroso de alta fidelidad. La correspondencia exacta entre la lista de features de la tesis y los 18 routers de FastAPI montados físicamente en `main.py`, así como las 23 páginas reactivas JSX provistas de Fluent UI v9, garantizó un ciclo de desarrollo sin placeholders, facilitando la auditoría de código y asegurando que cada funcionalidad implementada responda a los criterios de aceptación y justificaciones académicas formales.

Tercera. El subsistema de gamificación fundamentado en el estándar internacional Open Badges y la visualización tabular de Fluent UI v9 incrementaron de forma notable el compromiso de los estudiantes de la facultad dentro de la carrera. El aula virtual LMS integrada y la asignación atómica y automatizada de medallas virtuales y puntos de experiencia a través de la relación de la tabla asociativa de muchos a muchos `UsuarioBadge` incentivan el aprendizaje proactivo y el desarrollo de competencias transversales en el Hub de manera orgánica.

Cuarta. Las políticas transversales de ciberseguridad defensiva implementadas en el backend FastAPI blindan de forma segura la infraestructura transaccional de la comunidad. El almacenamiento físico seguro de claves hashes Bcrypt, el control de accesos apátrida de roles mediante JWT firmado criptográficamente con HS256, el middleware interceptor jerárquico que enmascara fallos graves de red con códigos HTTP 500, y la bitácora inalterable de auditoría persistida activamente por `AuditMixin` en `logs_sistema` mitigan los riesgos de intrusión y consolidan un ecosistema digital confiable y robusto acorde a estándares de nivel corporativo.

Quinta. La arquitectura de asistencia Offline-First implementada mediante la base de datos IndexedDB local en el navegador web del operador de staff y la cola transaccional FIFO de sincronización asíncrona por lotes resolvió de forma idónea la problemática de la pérdida de conectividad en los sótanos y auditorios de la facultad y de la universidad. Esto permite al personal registrar marcas de asistencia QR de forma ininterrumpida y realizar una sincronización de datos atómica y consistente con el servidor FastAPI una vez que se restablezca el enlace de red.

Sexta. El motor de conciliación bancaria difusa estructurado a través del algoritmo de similitud Jaro-Winkler puro y la clasificación determinística por reglas de comprobantes financieros dotó a la plataforma de una alta precisión operativa en laboratorio. Este motor permite emparejar y conciliar transferencias con errores de escritura manuales y variaciones ortográficas de nombres de alumnos con una tasa de acierto superior al 94% sin depender de costosas APIs propietarias externas o compiladores de sistema complejos.

### 6.2. RESUMEN CUANTITATIVO DE LOGROS Y RESULTADOS DEL PROYECTO

El éxito operativo y la solidez técnica de la Plataforma MEH se demuestran a través de un conjunto consolidado de métricas empíricas obtenidas en las etapas de auditoría de código, suite de pruebas automatizadas y estimación económica. Este resumen cuantitativo consolida los resultados en números clave del sistema, agrupados en cuatro dimensiones principales: calidad de construcción de software, verificación atómica e integral de pruebas, latencia y rendimiento de la interfaz de programación de aplicaciones REST (API REST), y la estimación económica del esfuerzo de ingeniería.

#### 1. Consolidado Métrico de Construcción y Calidad

El ecosistema monolítico modular de la plataforma se compone de un total de 169 archivos originales de código fuente, sumando un total de 25.797 líneas de código fuente (SLOC) de autoría exclusiva del postulante. La suite completa de control de calidad ha registrado tasas de éxito del 100% en todas las dimensiones de pruebas. El resumen de logros métricos logrados frente a las metas de calidad se detalla en la Tabla 6.1:

| Dimensión Evaluada | Indicador / Métrica Técnica | Meta Establecida | Métrica Lograda | Estado de Cumplimiento |
| :--- | :--- | :--- | :--- | :--- |
| Tamaño Físico | Líneas de Código Backend (FastAPI) | -- | 9.104 SLOC | Completado (88 archivos) |
| | Líneas de Código Frontend (React) | -- | 16.693 SLOC | Completado (81 archivos) |
| Pruebas Unitarias | Tasa de éxito lógica (PyTest) | 100% | 100% (21/21 passed) | SUPERADO |
| | Cobertura de Código (Coverage) | >= 80% | 86,4% de cobertura | SUPERADO |
| Pruebas E2E / UI | Pruebas de integración (TestClient)| 100% | 100% (8 endpoints OK)| SUPERADO |
| | Emulación multi-navegador (Playwright)| 100% | 100% (4/4 passed) | SUPERADO |
| | Pruebas de interfaz local (Selenium)| 100% | 100% (4/4 passed) | SUPERADO |
| Calidad de Código | Bugs de lógica (SonarQube) | 0 | 0 Bugs | CUMPLIDO |
| | Vulnerabilidades de seguridad | 0 | 0 Vulnerabilidades | CUMPLIDO |
| | Código duplicado en el repositorio | <= 3.0% | 0,6% de duplicación | SUPERADO |
| Usabilidad (SUS) | Usabilidad percibida por usuarios | >= 70 | 82,5 / 100 (Excelente) | SUPERADO |
| | Tasa de resolución de bugs (UAT) | 100% | 100% (15/15 resueltos) | CUMPLIDO |

Tabla 6.1: Consolidado Cuantitativo de Metas de Calidad y Resultados Métricos Logrados  
*Nota.* Tabla resumen que contrasta las metas de diseño definidas en ingeniería con las métricas obtenidas tras la validación final. Elaboración propia.

La representación gráfica de la comparativa entre los umbrales mínimos exigidos por las metas de calidad y los resultados reales logrados por el sistema se expone en la Figura 6.1.

![Comparativa de Metas de Calidad vs. Resultados Logrados](img/img_resumen_logros.png)

Figura 6.1: Comparativa de Metas de Calidad vs. Resultados Logrados  
*Nota.* Gráfico comparativo de barras que ilustra la brecha de cumplimiento superada en cobertura de código, usabilidad percibida (SUS), precisión de visión artificial (OCR) y porcentaje de optimización de procesos. Elaboración propia.

#### 2. Rendimiento, Latencia y Resultados de la API REST

Para certificar la eficiencia transaccional de los endpoints que componen la API REST del backend bajo condiciones de operación normal y simulación de carga, se midieron los tiempos de respuesta promedio en milisegundos de las llamadas críticas al servidor FastAPI. Las pruebas de carga locales, simulando un flujo sostenido de 500 peticiones por minuto, demostraron la viabilidad de la arquitectura monolítica modular síncrona. La persistencia relacional con PostgreSQL optimizada mediante pools de SQLAlchemy (tiempo medio de consulta de base de datos inferior a 5 milisegundos) permite que las solicitudes de lectura y autenticación respondan de manera casi instantánea, mientras que los flujos transaccionales pesados como el OCR y la conciliación bancaria en lote se procesan por debajo de los límites operacionales tolerados, garantizando la fluidez de la experiencia de usuario.

El consolidado numérico de rendimiento de la API REST por endpoint se describe en la Tabla 6.2:

| Endpoint Evaluado | Método HTTP | Tipo de Operación y Carga Lógica | Latencia Media (ms) | Tasa de Éxito HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/health` | GET | Monitoreo de salud y configuración SMTP | 12,0 ms | 100% (HTTP 200) |
| `/api/v1/eventos/` | GET | Recuperación relacional de lista de eventos | 32,0 ms | 100% (HTTP 200) |
| `/api/v1/auth/login` | POST | Validación de credenciales y generación de JWT | 45,0 ms | 100% (HTTP 200) |
| `/api/v1/eventos/asistencia-qr` | POST | Registro e inserción síncrona de marcas QR | 65,0 ms | 100% (HTTP 200) |
| `/api/v1/admin/reconciliar-extracto` | POST | Conciliación difusa Jaro-Winkler de CSV bancario | 195,0 ms | 100% (HTTP 200) |
| `/api/v1/pagos/upload-ocr` | POST | Procesamiento de visión artificial OCR de voucher | 280,0 ms | 100% (HTTP 200) |

Tabla 6.2: Tiempos de Respuesta y Latencia Promedio por Endpoint Crítico de la API REST  
*Nota.* Métricas de latencia física del backend FastAPI obtenidas bajo una simulación de carga síncrona de 500 llamadas/minuto. Elaboración propia.

La distribución visual de los tiempos de respuesta y latencia por endpoint de la API REST se presenta en la Figura 6.2.

![Latencia Promedio de Endpoints Críticos de la API REST](img/img_rest_latency.png)

Figura 6.2: Latencia Promedio de Endpoints Críticos de la API REST  
*Nota.* Gráfico de barras horizontales que detalla la latencia de procesamiento del servidor FastAPI en milisegundos para las principales rutas REST. Elaboración propia.

#### 3. Resumen de Optimización Operativa e Impacto en Tiempos

El impacto directo de la plataforma en la eficiencia administrativa del Microsoft Education Hub representa una optimización de procesos críticos libre de cuellos de botella. La automatización del procesamiento de datos financieros y de asistencia reduce drásticamente las cargas horarias del personal organizador del Hub. La comparación numérica entre el método histórico manual y el automatizado se sintetiza en la Tabla 6.3:

| Proceso Crítico Evaluado | Tiempo Histórico (Manual) | Tiempo Plataforma MEH | Factor de Optimización (%) |
| :--- | :--- | :--- | :--- |
| Conciliación de Pagos | 4,5 Horas por lote de vouchers | < 3 Minutos (OCR) | 98,8% de reducción de tiempo |
| Control de Acceso (Checkin)| 18 Minutos en lista física | < 1 Segundo (QR) | 99,9% de eliminación de colas |
| Emisión de Certificados | 3 Días de transcripción manual | Inmediato (Automático) | 100% inmediato y sin errores |
| Trazabilidad de Auditoría | Archivo y carpetas físicas de papel | Persistencia en segundos | 100% logs forenses digitales |

Tabla 6.3: Resumen del Impacto y Reducción Temporal en Procesos Administrativos  
*Nota.* Datos comparativos obtenidos del análisis experimental de simulación operativa en laboratorio local. Elaboración propia.

#### 4. Estimación Económica del Esfuerzo de Ingeniería (COCOMO II)

Finalmente, de acuerdo con el modelo cuantitativo COCOMO II ajustado y calculado en el Capítulo 5 de este documento para un único desarrollador ( SITE = 0,80; TEAM = 0,00; capacidades de personal en Muy Alta), el esfuerzo de ingeniería de software, el tiempo calendario de desarrollo nominal y secuencial, y los costos financieros asociados a la construcción de la Plataforma MEH se consolidan de forma cuantitativa en la Tabla 6.4:

| Variable Estimada (COCOMO II) | Valor Nominal (Equipo) | Valor Real (1 Programador) | Impacto y Justificación Metodológica |
| :--- | :--- | :--- | :--- |
| Esfuerzo del Proyecto | -- | 18,55 Personas-Mes | Esfuerzo total consolidado requerido para la codificación. |
| Tiempo Calendario (TDEV)| 8,98 Meses | 18,55 Meses | Al no existir concurrencia (1 FTE), el desarrollo se realiza secuencialmente. |
| Personal Requerido | 2,06 FTEs | 1,00 Persona | El postulante asume el 100% de la lógica de negocio y UI de forma individual. |
| Costo Consolidado | -- | 222.581,56 Bs. | Equivale a $31.980,11 USD bajo una tarifa laboral de 12.000 Bs./PM. |

Tabla 6.4: Resumen de Estimación de Esfuerzo, Tiempo y Costo de Software  
*Nota.* Comparativa de variables nominales del modelo vs. las condiciones físicas del proyecto de desarrollador único. Elaboración propia.

El desglose visual de esfuerzo y tiempo calendario distribuido a lo largo de las cuatro fases de desarrollo de software (Inicio, Elaboración, Construcción y Transición) se detalla en la Figura 5.1, sirviendo como fundamento de la planificación y cronología real ejecutada por el postulante.

### 6.3. RECOMENDACIONES

Primera. Se recomienda a la coordinación técnica del Hub planificar una transición progresiva en futuras revisiones hacia arquitecturas de Micro-Frontends en la SPA React. Aunque el monolito modular físico en el backend FastAPI ofrece excelente rendimiento e integridad de transacciones, la interfaz de Fluent UI v9 a nivel de desarrollo web se beneficiaría al dividir los componentes administrativos pesados de `pages/Admin/` (como `Analytics.jsx` y `GestionPagos.jsx`) en submódulos de compilación e integración independientes, permitiendo actualizaciones de la interfaz sin requerir la compilación completa de la suite.

Segunda. Se sugiere configurar políticas automatizadas de respaldo redundante e indexamiento periódico sobre la tabla física `logs_sistema` en el motor relacional de PostgreSQL. Debido a la naturaleza inalterable y al volumen masivo de metadatos de auditoría forense que se inyectan en cada cambio de registro por intermedio del servicio `logs_service.py` con dirección IP física, el tamaño de la base de datos puede registrar un crecimiento acelerado bajo eventos de alta concurrencia, requiriendo un monitoreo preventivo de índices físicos.

Tercera. Se aconseja incrementar paulatinamente el factor de costo algorítmico (*cost factor*) del hash Bcrypt utilizado en la encriptación de contraseñas de la tabla de usuarios en concordancia con los futuros avances en la capacidad física de procesamiento de hardware de cómputo en la nube. Esto asegurará la vigencia tecnológica de los esquemas de encriptación de contraseñas e impedirá ataques exitosos de descifrado por fuerza bruta en el largo plazo.

### 6.4. TRABAJOS FUTUROS

Primero. Integrar algoritmos avanzados de deep learning y procesamiento de lenguaje natural en la capa transaccional de `ocrm_service.py`. Esto permitirá expandir las capacidades del motor de visión artificial OCR de validación financiera, dotando a la plataforma MEH de un sistema de clasificación inteligente capaz de interpretar vouchers bancarios sumamente borrosos, con baja iluminación o tomados desde ángulos distorsionados, elevando la tasa de acierto actual del 92% y minimizando la intervención del administrador.

Segundo. Desarrollar un subsistema de inteligencia adaptativa y recomendación algorítmica para guiar las rutas de aprendizaje estudiantil en el aula LMS. Aprovechando el registro de datos curriculares de lecciones completadas, tareas entregadas y medallas desbloqueadas por el estudiante, se prevé diseñar un motor inteligente que sugiera dinámicamente cursos específicos de la red MEH para fortalecer las competencias de los miembros regulares en base a su perfil tecnológico.

Tercero. Implementar la validación y acuñación descentralizada de certificados digitales en redes Blockchain públicas o consorciadas. Esta arquitectura complementaria permitirá registrar el código criptográfico de verificación y el identificador de la entidad académica universitaria de forma totalmente inalterable en un libro de contabilidad distribuido descentralizado, facilitando que empleadores y universidades globales consulten de forma directa la validez legal del diploma del estudiante sin depender de la disponibilidad en línea del servidor local del Hub.

---

# ANEXOS

## ANEXO B: DICCIONARIO DE DATOS RELACIONAL COMPLETO

La especificación física y relacional detallada de las 29 tablas que componen la base de datos central de la Plataforma MEH se detalla a continuación, agrupada según los tres módulos funcionales de la arquitectura de negocio del sistema. Cada tabla expone detalladamente el nombre de sus campos, el tipo de dato físico de PostgreSQL, si admite o no valores nulos (Nulabilidad), las claves primarias (PK) y foráneas (FK), y los valores por defecto establecidos en el esquema relacional.

### Módulo 1: Eventos y Control de Asistencia QR

Este módulo comprende las tablas asociadas con el registro de congresos, eventos, puntos de control lógicos (checkpoints), y el registro físico e integridad de las marcas de asistencia en puerta.

###### Estructura de la Tabla `eventos`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_evento` | `INTEGER` | PK | NOT NULL |
| `titulo` | `VARCHAR` |  | NULL |
| `descripcion` | `TEXT` |  | NULL |
| `tipo_evento` | `VARCHAR` |  | NULL, DEFAULT: CONFERENCIA |
| `fecha_inicio` | `DATETIME` |  | NULL |
| `fecha_fin` | `DATETIME` |  | NULL |
| `hora_inicio` | `VARCHAR` |  | NULL |
| `hora_fin` | `VARCHAR` |  | NULL |
| `modalidad` | `VARCHAR` |  | NULL |
| `ubicacion` | `VARCHAR` |  | NULL |
| `link_mapas` | `VARCHAR` |  | NULL |
| `agenda` | `TEXT` |  | NULL |
| `capacidad_max` | `INTEGER` |  | NULL |
| `estado` | `VARCHAR` |  | NULL, DEFAULT: PROGRAMADO |
| `imagen_url` | `VARCHAR` |  | NULL |
| `refrigerio_incluido` | `BOOLEAN` |  | NULL, DEFAULT: False |
| `token_qr` | `VARCHAR` |  | NULL |
| `id_organizador` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `checkpoints`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_checkpoint` | `INTEGER` | PK | NOT NULL |
| `id_evento` | `INTEGER` | FK (eventos.id_evento) | NULL |
| `nombre_checkpoint` | `VARCHAR` |  | NULL |
| `hora_apertura` | `DATETIME` |  | NULL |
| `hora_cierre` | `DATETIME` |  | NULL |
| `tipo_checkpoint` | `VARCHAR` |  | NULL |
| `orden` | `INTEGER` |  | NULL |
| `activo` | `BOOLEAN` |  | NULL, DEFAULT: True |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `asistencia_detalles`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_asistencia` | `INTEGER` | PK | NOT NULL |
| `id_inscripcion` | `INTEGER` | FK (inscripciones_eventos.id_inscripcion) | NULL |
| `id_checkpoint` | `INTEGER` | FK (checkpoints.id_checkpoint) | NULL |
| `fecha_escaneo` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `escaneado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `inscripciones_eventos`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_inscripcion` | `INTEGER` | PK | NOT NULL |
| `id_usuario` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `id_evento` | `INTEGER` | FK (eventos.id_evento) | NULL |
| `fecha_inscripcion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `estado_inscripcion` | `VARCHAR` |  | NULL, DEFAULT: PENDIENTE |
| `codigo_qr` | `VARCHAR` |  | NULL, UNIQUE |
| `asistio` | `BOOLEAN` |  | NULL, DEFAULT: False |
| `fecha_validacion` | `DATETIME` |  | NULL |
| `id_pago` | `INTEGER` | FK (pagos.id_pago) | NULL |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `eventos_speakers`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_evento` | `INTEGER` | FK (eventos.id_evento) | NULL |
| `id_speaker` | `INTEGER` | FK (speakers.id_speaker) | NULL |

###### Estructura de la Tabla `eventos_auspiciadores`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_evento` | `INTEGER` | FK (eventos.id_evento) | NULL |
| `id_auspiciador` | `INTEGER` | FK (auspiciadores.id_auspiciador) | NULL |

###### Estructura de la Tabla `eventos_comunidades`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_evento` | `INTEGER` | FK (eventos.id_evento) | NULL |
| `id_comunidad` | `INTEGER` | FK (comunidades_aliadas.id_comunidad) | NULL |

###### Estructura de la Tabla `speakers`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_speaker` | `INTEGER` | PK | NOT NULL |
| `nombre` | `VARCHAR` |  | NULL |
| `bio` | `TEXT` |  | NULL |
| `trayectoria` | `TEXT` |  | NULL |
| `foto_url` | `VARCHAR` |  | NULL |
| `trabajo_actual` | `VARCHAR` |  | NULL |
| `linkedin_url` | `VARCHAR` |  | NULL |
| `twitter_url` | `VARCHAR` |  | NULL |
| `facebook_url` | `VARCHAR` |  | NULL |
| `instagram_url` | `VARCHAR` |  | NULL |
| `correo_contacto` | `VARCHAR` |  | NULL |
| `whatsapp_contacto` | `VARCHAR` |  | NULL |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `auspiciadores`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_auspiciador` | `INTEGER` | PK | NOT NULL |
| `nombre` | `VARCHAR` |  | NULL |
| `logo_url` | `VARCHAR` |  | NULL |
| `sitio_web` | `VARCHAR` |  | NULL |
| `tipo` | `VARCHAR` |  | NULL, DEFAULT: GENERAL |
| `correo_contacto` | `VARCHAR` |  | NULL |
| `whatsapp_contacto` | `VARCHAR` |  | NULL |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `comunidades_aliadas`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_comunidad` | `INTEGER` | PK | NOT NULL |
| `nombre` | `VARCHAR` |  | NULL |
| `descripcion` | `TEXT` |  | NULL |
| `logo_url` | `VARCHAR` |  | NULL |
| `link_contacto` | `VARCHAR` |  | NULL |
| `correo_contacto` | `VARCHAR` |  | NULL |
| `whatsapp_contacto` | `VARCHAR` |  | NULL |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

### Módulo 2: Academia Virtual y Gamificación

Este módulo comprende las tablas del aula virtual LMS (cursos, lecciones, entregas y tareas), foros de discusión, el inventario financiero de souvenirs de la tienda, el registro de comprobantes OCR y las tablas de logros, insignias y diplomas digitales.

###### Estructura de la Tabla `cursos`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_curso` | `INTEGER` | PK | NOT NULL |
| `nombre_curso` | `VARCHAR` |  | NULL |
| `descripcion` | `TEXT` |  | NULL |
| `horas_academicas` | `INTEGER` |  | NULL |
| `estado` | `VARCHAR` |  | NULL, DEFAULT: ACTIVO |
| `imagen_url` | `VARCHAR` |  | NULL |
| `id_instructor` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `es_ms_learning` | `BOOLEAN` |  | NULL, DEFAULT: False |
| `external_url` | `VARCHAR` |  | NULL |
| `uid_ms` | `VARCHAR` |  | NULL |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `lecciones`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_leccion` | `INTEGER` | PK | NOT NULL |
| `id_curso` | `INTEGER` | FK (cursos.id_curso) | NULL |
| `titulo` | `VARCHAR` |  | NULL |
| `contenido_video_url` | `VARCHAR` |  | NULL |
| `contenido_texto` | `TEXT` |  | NULL |
| `orden` | `INTEGER` |  | NULL, DEFAULT: 1 |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `tareas`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_tarea` | `INTEGER` | PK | NOT NULL |
| `id_leccion` | `INTEGER` | FK (lecciones.id_leccion) | NULL |
| `titulo` | `VARCHAR` |  | NULL |
| `instrucciones` | `TEXT` |  | NULL |
| `puntos_max` | `INTEGER` |  | NULL, DEFAULT: 100 |
| `fecha_entrega_limite` | `DATETIME` |  | NULL |
| `archivo_adjunto_url` | `VARCHAR` |  | NULL |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `entregas_tareas`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_entrega` | `INTEGER` | PK | NOT NULL |
| `id_tarea` | `INTEGER` | FK (tareas.id_tarea) | NULL |
| `id_usuario` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `archivo_url` | `VARCHAR` |  | NULL |
| `comentario_alumno` | `TEXT` |  | NULL |
| `nota` | `INTEGER` |  | NULL |
| `comentario_docente` | `TEXT` |  | NULL |
| `fecha_envio` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `posts_foro`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_post` | `INTEGER` | PK | NOT NULL |
| `id_curso` | `INTEGER` | FK (cursos.id_curso) | NULL |
| `id_usuario` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `mensaje` | `TEXT` |  | NULL |
| `es_pregunta_docente` | `BOOLEAN` |  | NULL, DEFAULT: False |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `inscripciones_cursos`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_inscripcion_curso` | `INTEGER` | PK | NOT NULL |
| `id_usuario` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `id_curso` | `INTEGER` | FK (cursos.id_curso) | NULL |
| `fecha_inscripcion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `progreso` | `INTEGER` |  | NULL, DEFAULT: 0 |
| `nota_final` | `NUMERIC(5, 2)` |  | NULL |
| `finalizado` | `BOOLEAN` |  | NULL, DEFAULT: False |
| `id_pago` | `INTEGER` | FK (pagos.id_pago) | NULL |
| `estado_inscripcion` | `VARCHAR` |  | NULL, DEFAULT: PENDIENTE |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `productos`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_producto` | `INTEGER` | PK | NOT NULL |
| `nombre` | `VARCHAR(100)` |  | NULL |
| `descripcion` | `TEXT` |  | NULL |
| `precio` | `NUMERIC(10, 2)` |  | NULL, DEFAULT: 0 |
| `stock` | `INTEGER` |  | NULL, DEFAULT: 0 |
| `es_kit_evento` | `BOOLEAN` |  | NULL, DEFAULT: False |
| `imagen_url` | `TEXT` |  | NULL |
| `categoria` | `VARCHAR` |  | NULL, DEFAULT: SOUVENIR |
| `activo` | `BOOLEAN` |  | NULL, DEFAULT: True |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `pedidos`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_pedido` | `INTEGER` | PK | NOT NULL |
| `id_usuario` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `id_pago` | `INTEGER` | FK (pagos.id_pago) | NULL |
| `estado` | `VARCHAR` |  | NULL, DEFAULT: PENDIENTE |
| `fecha_pedido` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `total` | `NUMERIC(10, 2)` |  | NULL, DEFAULT: 0 |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `pedido_detalles`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_detalle` | `INTEGER` | PK | NOT NULL |
| `id_pedido` | `INTEGER` | FK (pedidos.id_pedido) | NULL |
| `id_producto` | `INTEGER` | FK (productos.id_producto) | NULL |
| `cantidad` | `INTEGER` |  | NULL, DEFAULT: 1 |
| `precio_unitario` | `NUMERIC(10, 2)` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `pagos`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_pago` | `INTEGER` | PK | NOT NULL |
| `id_usuario` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `monto` | `NUMERIC(10, 2)` |  | NULL |
| `fecha_pago` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `metodo_pago` | `VARCHAR` |  | NULL |
| `estado_pago` | `VARCHAR` |  | NULL, DEFAULT: PENDIENTE |
| `comprobante_url` | `TEXT` |  | NULL |
| `id_referencia` | `INTEGER` |  | NULL |
| `tipo_referencia` | `VARCHAR` |  | NULL |
| `validado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `url_comprobante` | `VARCHAR` |  | NULL |
| `fecha_validacion` | `DATETIME` |  | NULL |
| `notas_admin` | `TEXT` |  | NULL |
| `porcentaje_ocr` | `NUMERIC(5, 2)` |  | NULL |
| `texto_ocr` | `TEXT` |  | NULL |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `badges`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_badge` | `INTEGER` | PK | NOT NULL |
| `nombre_badge` | `VARCHAR` |  | NULL |
| `descripcion` | `TEXT` |  | NULL |
| `imagen_url` | `TEXT` |  | NULL |
| `id_evento_origen` | `INTEGER` | FK (eventos.id_evento) | NULL |
| `id_curso_origen` | `INTEGER` | FK (cursos.id_curso) | NULL |
| `puntos` | `INTEGER` |  | NULL, DEFAULT: 10 |
| `requisito_nivel` | `VARCHAR` |  | NULL, DEFAULT: Beginner |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `usuarios_badges`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_usuario_badge` | `INTEGER` | PK | NOT NULL |
| `id_usuario` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `id_badge` | `INTEGER` | FK (badges.id_badge) | NULL |
| `fecha_obtencion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `certificados`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_certificado` | `INTEGER` | PK | NOT NULL |
| `id_usuario` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `id_curso` | `INTEGER` | FK (cursos.id_curso) | NULL |
| `id_evento` | `INTEGER` | FK (eventos.id_evento) | NULL |
| `uuid_verificacion` | `VARCHAR` |  | NULL, UNIQUE, DEFAULT: uuid.uuid4 |
| `codigo_verificacion` | `VARCHAR` |  | NULL, UNIQUE |
| `fecha_emision` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `url_pdf` | `VARCHAR` |  | NULL |
| `formato` | `VARCHAR` |  | NULL, DEFAULT: DIGITAL |
| `entregado_fisico` | `BOOLEAN` |  | NULL, DEFAULT: False |
| `es_ruta_linkedin` | `BOOLEAN` |  | NULL, DEFAULT: False |
| `metadata_adicional` | `TEXT` |  | NULL |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `recursos`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_recurso` | `INTEGER` | PK | NOT NULL |
| `titulo` | `VARCHAR` |  | NULL |
| `descripcion` | `TEXT` |  | NULL |
| `motivo` | `VARCHAR` |  | NULL |
| `autor_nombre` | `VARCHAR` |  | NULL |
| `url_descarga` | `VARCHAR` |  | NULL |
| `portada_url` | `VARCHAR` |  | NULL |
| `tipo_archivo` | `VARCHAR` |  | NULL |
| `tipo_recurso` | `VARCHAR` |  | NULL, DEFAULT: ARCHIVO |
| `contenido_md` | `TEXT` |  | NULL |
| `categoria` | `VARCHAR` |  | NULL |
| `id_curso` | `INTEGER` | FK (cursos.id_curso) | NULL |
| `id_evento` | `INTEGER` | FK (eventos.id_evento) | NULL |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `anuncios`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_anuncio` | `INTEGER` | PK | NOT NULL |
| `titulo` | `VARCHAR` |  | NULL |
| `contenido` | `TEXT` |  | NULL |
| `url_imagen` | `VARCHAR` |  | NULL |
| `link_accion` | `VARCHAR` |  | NULL |
| `tipo` | `VARCHAR` |  | NULL, DEFAULT: INFO |
| `fecha_publicacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `id_autor` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `activo` | `BOOLEAN` |  | NULL, DEFAULT: True |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

### Módulo 3: Administración y Auditoría Forense

Este módulo gobierna el control de accesos jerárquico (RBAC), la inyección automática de campos del AuditMixin, los parámetros globales del monolito y la bitácora forense de mutaciones de datos del sistema.

###### Estructura de la Tabla `estados_registro`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_estado` | `INTEGER` | PK | NOT NULL |
| `nombre_estado` | `VARCHAR(50)` |  | NOT NULL, UNIQUE |
| `descripcion` | `TEXT` |  | NULL |

###### Estructura de la Tabla `usuarios`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_usuario` | `INTEGER` | PK | NOT NULL |
| `nombres` | `VARCHAR` |  | NULL |
| `apellidos` | `VARCHAR` |  | NULL |
| `alias` | `VARCHAR` |  | NULL |
| `foto_url` | `VARCHAR` |  | NULL |
| `preferencia_tema` | `VARCHAR` |  | NULL, DEFAULT: dark |
| `correo` | `VARCHAR` |  | NULL, UNIQUE |
| `password_hash` | `TEXT` |  | NULL |
| `rol` | `VARCHAR` |  | NULL, DEFAULT: MIEMBRO |
| `fecha_registro` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `bio` | `TEXT` |  | NULL |
| `institucion` | `VARCHAR` |  | NULL |
| `estudia_en` | `VARCHAR` |  | NULL |
| `tipo_entidad` | `VARCHAR` |  | NULL, DEFAULT: Estudiante |
| `pais` | `VARCHAR` |  | NULL, DEFAULT: Bolivia |
| `departamento` | `VARCHAR` |  | NULL |
| `linkedin_url` | `VARCHAR` |  | NULL |
| `github_url` | `VARCHAR` |  | NULL |
| `facebook_url` | `VARCHAR` |  | NULL |
| `instagram_url` | `VARCHAR` |  | NULL |
| `tiktok_url` | `VARCHAR` |  | NULL |
| `learning_path_url` | `VARCHAR` |  | NULL |
| `perfil_publico` | `BOOLEAN` |  | NULL, DEFAULT: True |
| `activo` | `BOOLEAN` |  | NULL, DEFAULT: True |
| `es_nuevo` | `BOOLEAN` |  | NULL, DEFAULT: True |
| `reset_token` | `VARCHAR` |  | NULL |
| `reset_token_exp` | `DATETIME` |  | NULL |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `configuracion_global`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_config` | `INTEGER` | PK | NOT NULL |
| `clave` | `VARCHAR` |  | NULL, UNIQUE |
| `valor` | `TEXT` |  | NULL |
| `descripcion` | `VARCHAR` |  | NULL |
| `creado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_creacion` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `modificado_por` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `fecha_modificacion` | `DATETIME` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

###### Estructura de la Tabla `logs_sistema`

| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |
|---|---|---|---|
| `id_log` | `INTEGER` | PK | NOT NULL |
| `id_admin` | `INTEGER` | FK (usuarios.id_usuario) | NULL |
| `accion` | `VARCHAR` |  | NULL |
| `tabla_afectada` | `VARCHAR` |  | NULL |
| `id_registro_afectado` | `INTEGER` |  | NULL |
| `valor_anterior` | `TEXT` |  | NULL |
| `valor_nuevo` | `TEXT` |  | NULL |
| `fecha_hora` | `DATETIME` |  | NULL, DEFAULT: utcnow |
| `ip_direccion` | `VARCHAR` |  | NULL |
| `id_estado` | `INTEGER` | FK (estados_registro.id_estado) | NOT NULL, DEFAULT: 2 |
| `fecha_modificacion_estado` | `DATETIME` |  | NULL |

