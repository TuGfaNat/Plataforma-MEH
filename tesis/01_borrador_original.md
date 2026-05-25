**UNIVERSIDAD MAYOR DE SAN ANDRÉS**

FACULTAD DE CIENCIAS PURAS Y NATURALES

CARRERA DE INFORMÁTICA

**PERFIL DE ****PROYECTO DE GRADO**

**“****PLATAFORMA WEB INTEGRAL PARA LA GESTIÓN ACADÉMICA Y COMUNITARIA CASO: MICROSOFT EDUCATION ****HUB****”**

**PARA OPTAR AL TÍTULO DE LICENCIATURA EN INFORMÁTICA**

**MENCIÓN: **INGENIERÍA DE SISTEMAS INFORMÁTICOS

**POSTULANTE:** NATALY ALEJANDRA GEMIO MORALES

**TUTOR: **LIC.** **ALBERT JHONATAN QUISBERT MÚJICA

**LA PAZ - BOLIVIA**

**20****26**


# CAPÍTULO 1


## INTRODUCCIÓN

En la tercera década del siglo XXI, la educación ha experimentado una metamorfosis irreversible impulsada por la convergencia estratégica de las Tecnologías de la Información y la Comunicación (TIC). Este fenómeno no se limita únicamente a la digitalización superficial de contenidos, sino que representa una reconfiguración estructural de los ecosistemas de aprendizaje. Como señalan Cables Fernández y Alcívar Loor (2024), la integración de plataformas virtuales en la formación técnica no solo facilita el acceso democratizado al conocimiento, sino que actúa como un catalizador para el aprendizaje autónomo, permitiendo que los estudiantes desarrollen competencias críticas y habilidades blandas para un entorno profesional altamente competitivo, volátil y cambiante.

En este escenario, las comunidades de aprendizaje tecnológico emergen como nodos vitales para la transferencia de conocimiento especializado y la innovación constante. Según Dialnet (2025), las plataformas digitales actúan hoy como un eje estructurador que permite la consolidación de las denominadas "comunidades de práctica", espacios virtuales y físicos donde la interacción constante, la retroalimentación técnica y la colaboración trascienden las barreras geográficas. No obstante, para que estas comunidades sean sostenibles y escalables, requieren de una infraestructura digital robusta que permita una gestión centralizada y eficiente. La dispersión de datos y la fragmentación de procesos en la administración educativa suele derivar en una pérdida crítica de eficiencia operativa y en la incapacidad institucional de generar métricas de impacto real y trazabilidad sobre el progreso de sus integrantes (Colegium, 2024).

En el contexto boliviano, la adopción de modelos de aprendizaje híbridos y el auge de las microcredenciales se han posicionado como las tendencias dominantes proyectadas para el año 2025 (Unifranz, 2024). Las instituciones y comunidades tecnológicas en el país están reconociendo que la validación del conocimiento a través de insignias digitales (*badges*) es un pilar fundamental para la nueva empleabilidad. Estas credenciales no solo motivan la participación activa mediante mecánicas de gamificación, sino que funcionan como una validación en tiempo real del talento frente a un mercado laboral global que exige certificaciones verificables, granulares y actualizadas (Universidad Católica, 2024).

Bajo esta óptica, la comunidad Microsoft Education Hub (MEH), como actor relevante en la formación tecnológica y brazo de extensión en la Universidad Mayor de San Andrés, se encuentra en un punto de inflexión. Si bien desarrolla actividades de alto valor académico, como talleres y programas de capacitación especializada, su actual modelo de gestión descentralizado dificulta el seguimiento estratégico y la fidelización de sus miembros. La carencia de una herramienta integral impide centralizar los registros históricos, automatizar la emisión de certificados y consolidar una identidad digital para sus participantes, lo cual es crítico dado el volumen de datos generado en cada gestión.

Bajo esta premisa, el presente proyecto de grado propone el desarrollo e implementación de una Plataforma Web Integral. Esta solución, fundamentada en tecnologías de alto rendimiento como FastAPI para la lógica asíncrona y React con el sistema de diseño Fluent UI, no solo busca optimizar los procesos administrativos internos de MEH (tales como la gestión de *events**, **attendance** y **payments*), sino también potenciar la experiencia del usuario mediante un sistema de gamificación basado en reconocimientos digitales. Al centralizar la gestión de eventos, cursos y perfiles de usuarios bajo un esquema de persistencia sólido en PostgreSQL, se pretende transformar la dinámica de la comunidad, convirtiéndola en un ecosistema digital robusto, escalable y plenamente alineado con los estándares internacionales de educación tecnológica y seguridad de la información (Stallings, 2023).


## ANTECEDENTES

La evolución de las plataformas de gestión educativa y comunitaria ha transitado, de manera acelerada, desde sistemas de registro estáticos y meramente informativos hacia ecosistemas dinámicos de aprendizaje, gestión y certificación automatizada. Este progreso histórico y tecnológico está marcado por la necesidad imperante de validar competencias y habilidades específicas en un entorno global donde la educación no formal y continua adquiere un peso significativo, y a menudo determinante, en el currículum profesional contemporáneo. En este contexto, la trazabilidad de la participación y la integridad de la certificación se han convertido en los pilares sobre los cuales se construye la confianza en las comunidades de aprendizaje tecnológico.


### ANTECEDENTES INTERNACIONALES

A  nivel global, el paradigma de los Entornos Virtuales de Aprendizaje (EVA) ha mutado hacia arquitecturas más sofisticadas denominadas Sistemas de Gestión de Experiencias de Aprendizaje (LXP, por sus siglas en inglés). Según la UNESCO (2023), si bien la digitalización de la educación técnica ha permitido una democratización sin precedentes del conocimiento, también ha generado un reto crítico en la verificación y validación de habilidades técnicas ante terceros. En respuesta a esta problemática de autenticidad, surgió en el año 2011 el estándar Open Badges, desarrollado originalmente por la Fundación Mozilla y Peer 2 Peer University. Este estándar revolucionó la certificación digital al introducir metadatos cifrados dentro de imágenes digitales, permitiendo que cualquier logro académico sea portable, seguro y, sobre todo, verificable mediante protocolos criptográficos.

Bajo esta óptica, plataformas líderes de la industria tecnológica como Microsoft Learn y LinkedIn Learning han establecido el estándar global de las "micro-certificaciones". Estas herramientas han demostrado empíricamente que el seguimiento granular y en tiempo real del progreso del usuario —implementado a través de dashboards personalizados, rutas de aprendizaje críticas y sistemas de insignias digitales— incrementa el compromiso (engagement) del estudiante en un 35% en comparación con los métodos tradicionales de enseñanza pasiva (Smith & Miller, 2024).

Estos sistemas internacionales no solo sirven como un referente de éxito comercial, sino que constituyen la base teórica y técnica para la arquitectura de la plataforma propuesta para el Microsoft Education Hub. La implementación de microservicios y el uso de estándares de interoperabilidad observados en estos antecedentes justifican la elección de un stack tecnológico moderno, como FastAPI, que permite gestionar grandes volúmenes de solicitudes de validación de insignias de manera asíncrona y eficiente, emulando la robustez de las soluciones líderes a nivel mundial.


### ANTECEDENTES NACIONALES

En el Estado Plurinacional de Bolivia, el proceso de transformación digital ha experimentado una aceleración sin precedentes, impulsada tanto por políticas estatales de soberanía tecnológica como por la necesidad imperativa de adaptación en el escenario post-pandemia. Según los informes técnicos de la Agencia de Gobierno Electrónico y Tecnologías de Información y Comunicación (AGETIC, 2024), el despliegue y uso de plataformas web para la gestión de trámites ciudadanos y procesos educativos ha crecido de manera exponencial, estableciendo una base de usuarios más familiarizada con los entornos virtuales. Sin embargo, esta madurez digital en los servicios gubernamentales no se ha reflejado con la misma intensidad en el ámbito de las comunidades tecnológicas y académicas de carácter voluntario o autogestionado.

Dentro de este ecosistema, aún predomina el uso de herramientas genéricas y fragmentadas, tales como formularios de Google (Google Forms) para el registro de participantes y redes sociales convencionales para la difusión de actividades. Bajo esta óptica, la gestión de la información carece de una estructura relacional que permita la trazabilidad a largo plazo. Si bien existen esfuerzos locales significativos —como las plataformas de gestión de eventos desarrolladas por cámaras de industria o universidades privadas que permiten la inscripción y descarga de certificados en formato PDF—, estas soluciones suelen basarse en sistemas de código cerrado o arquitecturas rígidas que no se adaptan a la dinámica fluida de una "comunidad de práctica" tecnológica (Salgado, 2023).

La brecha identificada a nivel nacional radica en la inexistencia de una plataforma integral que logre amalgamar la gestión logística de eventos con un sistema de fidelización y reconocimiento digital basado en méritos técnicos. Las soluciones actuales en el mercado boliviano no contemplan la emisión de micro-certificaciones verificables (como los Open Badges) ni ofrecen un historial de progreso de competencias específicas en tecnologías de vanguardia (como el ecosistema de Microsoft). Esta carencia de una infraestructura tecnológica propia y adaptable limita la capacidad de las comunidades locales para proyectar el talento de sus miembros hacia mercados internacionales, donde la validación granular del conocimiento es un requisito indispensable. Por consiguiente, el desarrollo de una solución basada en estándares modernos de ingeniería, como el uso de FastAPI para garantizar la concurrencia y PostgreSQL para la integridad de los datos, se presenta como un aporte necesario para elevar el estándar de la gestión tecnológica académica en el país.


### ANTECEDENTES INSTITUCIONALES (MICROSOFT EDUCATION HUB Y UMSA)

En el seno de la Universidad Mayor de San Andrés (UMSA), específicamente dentro de la Facultad de Ciencias Puras y Naturales, la Carrera de Informática se ha consolidado como un referente nacional en la formación de profesionales de alto nivel, siendo pionera en el desarrollo de sistemas de información para la gestión académica interna. No obstante, la dinámica universitaria contemporánea ha dado lugar al surgimiento de nodos de aprendizaje extracurricular que complementan la formación curricular. Entre ellos destaca el Microsoft Education Hub (MEH), una comunidad de entusiastas, profesionales y estudiantes cuya misión es fomentar el intercambio de conocimientos y experiencias en torno al ecosistema tecnológico de Microsoft, apoyando directamente programas de relevancia global como el Microsoft Student Ambassadors (Plan MEH-MCC, 2024).

A pesar de su relevancia estratégica y de organizar eventos de alto impacto como el Microsoft Tech Day, Azure Fest y el Road to Imagine Cup, la gestión operativa de MEH ha operado históricamente bajo procesos manuales y descentralizados. Hasta la fecha, el registro de participantes y el control de hitos académicos se ha realizado mediante el uso de hojas de cálculo dispersas y formularios aislados. Bajo esta óptica, la administración de la comunidad enfrenta tres desafíos críticos que limitan su visión de convertirse en un referente tecnológico en Bolivia:

Pérdida de Trazabilidad y Memoria Institucional: La fragmentación de los datos impide consolidar un historial fidedigno de capacitación. Resulta complejo determinar con precisión el progreso de un miembro a lo largo de varias gestiones, lo que debilita la capacidad de la comunidad para identificar y promover talentos destacados.

Ineficiencia en la Gestión de Activos y Certificación: La emisión de certificados de asistencia y aprobación requiere un procesamiento manual intensivo. Esta carga administrativa no solo es propensa a errores humanos en la transcripción de datos, sino que retrasa la entrega de valores a los estudiantes, afectando la percepción de profesionalismo de la organización.

Ausencia de una Identidad Digital Unificada: Los miembros de MEH carecen de un espacio personal o dashboard donde visualizar sus logros, insignias y competencias adquiridas. Esta falta de visibilidad reduce el sentido de pertenencia y desaprovecha el potencial de las micro-certificaciones como motor de motivación. (Plan MEH-MCC, 2024)

Si bien la Carrera de Informática cuenta con antecedentes de sistemas robustos, como el Sistema de Seguimiento Académico (SSA), estos están diseñados exclusivamente para la educación formal y administrativa de la facultad. El SSA no contempla la flexibilidad ni los módulos específicos que requiere una comunidad tecnológica, tales como la gestión de hackathons, la validación de pagos para kits de eventos o el otorgamiento de Open Badges. El presente proyecto surge, por tanto, de la necesidad imperante de cerrar esta brecha, trasladando la eficiencia de las plataformas internacionales al ecosistema local de la UMSA, mediante una solución que integre la robustez técnica de FastAPI y la elegancia visual de Fluent UI, garantizando un entorno seguro, escalable y auditable.


### TRABAJOS AFINES

El análisis de soluciones tecnológicas preexistentes permite identificar las brechas funcionales que el presente proyecto pretende subsanar. A continuación, se describen los referentes técnicos a nivel internacional, nacional e institucional que han servido como base comparativa para el diseño de la Plataforma Web Integral MEH.


#### A NIVEL INTERNACIONAL

Uno de los referentes más influyentes en la arquitectura de reconocimientos digitales es la iniciativa Open Badges, impulsada originalmente por la Fundación Mozilla. Según Casilli (2023), el estándar de insignias abiertas revolucionó la forma en que las plataformas de aprendizaje reconocen los logros no formales, permitiendo que el conocimiento adquirido sea portable, interoperable y verificable a través de metadatos encriptados dentro de archivos de imagen. Este trabajo es fundamental, ya que establece el protocolo de confianza que la plataforma MEH adopta para asegurar que una insignia otorgada en la UMSA tenga validez técnica auditable.

Asimismo, ecosistemas líderes como Credly y Microsoft Learn han institucionalizado el uso de "micro-certificaciones" para gestionar el currículo digital de millones de profesionales. Investigaciones publicadas por Education Week (2024) demuestran que la implementación de mecánicas de gamificación y reconocimiento visual mediante dashboards personalizados aumenta la retención y el compromiso del estudiante en un 40% en comparación con entornos estáticos. Estos sistemas internacionales demuestran que el éxito de una comunidad tecnológica no reside solo en el contenido, sino en la capacidad de la plataforma para visibilizar el progreso del usuario de manera estética y funcional.


#### A NIVEL NACIONAL

En el contexto boliviano, los esfuerzos por centralizar la gestión académica y administrativa han cobrado fuerza a través de la Agencia de Gobierno Electrónico y Tecnologías de Información y Comunicación (AGETIC). Según el informe sobre Transformación Digital en Bolivia (2024), el país ha normalizado el uso de firmas digitales y certificados con validación mediante códigos QR para procesos estatales. No obstante, al analizar comunidades tecnológicas voluntarias —tales como los Google Developer Groups (GDG) o Women Techmakers— se observa que la gestión operativa sigue dependiendo de herramientas externas y transnacionales como Meetup.com o Eventbrite.

Esta dependencia genera una fragmentación de la identidad digital de los participantes bolivianos, ya que los datos de asistencia y méritos quedan alojados en servidores externos sin posibilidad de integrarse a un historial académico local. La plataforma propuesta para el Microsoft Education Hub se diferencia de estos esfuerzos nacionales al ofrecer una solución soberana, adaptada a las necesidades específicas de la universidad boliviana y capaz de centralizar la logística de pagos y asistencia en una sola base de datos relacional.


#### A NIVEL INSTITUCIONAL (CARRERA DE INFORMÁTICA - UMSA)

Dentro de la Facultad de Ciencias Puras y Naturales de la UMSA, existen precedentes sólidos de sistemas de gestión, siendo el Sistema de Seguimiento Académico (SSA) el más relevante. Sin embargo, el análisis de este trabajo afín revela que su enfoque es estrictamente administrativo y curricular (gestión de notas, inscripciones y matriculación formal). Investigaciones previas desarrolladas en la Carrera de Informática, como el estudio de Salgado (2023) sobre modelos de monitoreo participativo, sugieren que la implementación de herramientas personalizadas y de autoría local mejora significativamente la interacción y el sentido de pertenencia entre los actores de una comunidad.

El presente proyecto de grado se distancia de los sistemas administrativos tradicionales de la facultad al proponer un modelo de Ingeniería de Software que implementa un motor de insignias digitales específico para competencias en tecnologías Microsoft. A diferencia del SSA, esta plataforma integra la validación de pagos mediante carga de comprobantes, el escaneo de asistencia QR en tiempo real y la visualización de analíticas de participación, llenando el vacío técnico entre la formación extracurricular y la validación profesional dentro de la Carrera de Informática.


## 1.3. PLANTEAMIENTO DEL PROBLEMA


### 1.3.1. DESCRIPCIÓN DEL PROBLEMA

La gestión de comunidades tecnológicas en entornos académicos de alto rendimiento, como es el caso de la Universidad Mayor de San Andrés, demanda una infraestructura digital robusta que permita no solo el almacenamiento de datos, sino la trazabilidad granular y el reconocimiento inmediato del aprendizaje. Actualmente, la comunidad Microsoft Education Hub (MEH) enfrenta un escenario de fragmentación operativa crítica que compromete su escalabilidad y sostenibilidad institucional. El problema central radica en la descentralización de los procesos administrativos y la ausencia de un flujo de datos unificado, lo cual se manifiesta en tres ejes críticos que afectan la calidad del servicio educativo y la experiencia del miembro:

Primero: Inconsistencia y Fragmentación de la Información de Usuario

El registro, control de inscripciones y el seguimiento longitudinal de los participantes se realiza mediante herramientas aisladas y heterogéneas, tales como formularios externos y hojas de cálculo manuales. Según Arévalo-Vera et al. (2023), el uso de sistemas de gestión de datos no integrados en entornos educativos provoca una pérdida de integridad y consistencia de la información de hasta un 30%, dificultando la consolidación de una base de datos histórica. En MEH, esta "entropía informativa" impide identificar con precisión el itinerario formativo de un miembro a lo largo de las gestiones. Al carecer de un modelo relacional normalizado, la comunidad pierde la capacidad de realizar analíticas de crecimiento y de generar perfiles de usuario basados en competencias reales.

Segundo: Ineficiencia en la Validación de Competencias y Reconocimiento Inmediato

Existe una brecha tecnológica significativa en los procesos de validación de méritos. Actualmente, el control de asistencia a eventos de gran magnitud (como el Azure Fest o Road to Imagine Cup) y la posterior emisión de certificados o insignias se realiza de forma manual. En la era de la inmediatez digital, el retraso burocrático en la entrega de reconocimientos erosiona la motivación del estudiante. Investigaciones sobre gamificación aplicadas a la ingeniería de software indican que el reconocimiento en tiempo real es un factor determinante para la retención de talento y el compromiso en comunidades de práctica (García-Peñalvo, 2024). Al no contar con un motor de escaneo QR integrado a la lógica de negocio y un sistema automatizado de asignación de badges, MEH desaprovecha el potencial de las microcredenciales como incentivo inmediato para el aprendizaje continuo.

Tercero: Ausencia de un Ecosistema de Interacción y Transparencia Financiera

La carencia de un área privada o Dashboard centralizado para el usuario genera una desconexión entre el miembro y la institución. Los participantes no poseen un espacio digital donde visualizar sus insignias logradas, gestionar sus inscripciones de forma simplificada o realizar el seguimiento de sus pagos por kits tecnológicos o cursos especializados. La validación de pagos, detectada en el ADN del sistema como un flujo crítico en la tabla payments, se gestiona hoy de manera externa, lo que introduce vulnerabilidades en la seguridad de los datos y falta de transparencia administrativa. Esta ausencia de una "identidad digital" y de un registro de auditoría (audit_log) limita la percepción de profesionalismo y rigor técnico que una comunidad respaldada por tecnologías de vanguardia debería proyectar hacia la sociedad y la academia.

En general, el problema de MEH no es la falta de contenido académico, sino la obsolescencia de su infraestructura de gestión, la cual requiere una transición urgente hacia una plataforma web integral que automatice la lógica de negocio y garantice la persistencia segura de la memoria institucional.


### 1.3.2. PROBLEMAS SECUNDARIOS

Para dar respuesta a la interrogante principal y abordar la problemática desde una perspectiva de ingeniería de sistemas, se identifican los siguientes desafíos específicos:

Persistencia e Integridad de Datos: ¿Cómo centralizar la información histórica y transaccional de los miembros en una base de datos relacional robusta (PostgreSQL) que asegure la integridad referencial y la seguridad de los datos mediante el uso de un ORM avanzado (SQLAlchemy)?

Automatización y Eficiencia Técnica: ¿Cuál es el mecanismo técnico más eficiente para automatizar el ciclo de vida de la asistencia —desde el escaneo de códigos QR en tiempo real hasta la asignación lógica de insignias digitales— minimizando la latencia mediante el uso de frameworks de alto rendimiento como FastAPI?

Experiencia de Usuario y Autogestión: ¿De qué forma el desarrollo de una interfaz de usuario (Dashboard) personalizada, fundamentada en el sistema de diseño Fluent UI v9, puede mejorar la experiencia de autogestión del miembro, facilitando el acceso a sus méritos y consolidando su sentido de pertenencia institucional?

Optimización de Procesos Administrativos: ¿Cómo estructurar un catálogo dinámico de eventos y un flujo de validación de pagos que reduzca significativamente la carga administrativa manual de los organizadores y garantice la transparencia mediante registros de auditoría (Audit Log)?

Interoperabilidad y Estándares: ¿Bajo qué protocolos de seguridad y estándares de metadatos se debe construir el motor de badges para asegurar que los reconocimientos otorgados sean técnicamente válidos y verificables fuera del entorno de la plataforma?


### 1.3.3. FORMULACIÓN DEL PROBLEMA DE INVESTIGACIÓN

A partir de la situación problemática descrita, caracterizada por la fragmentación de la información, la dependencia de herramientas externas dispersas y la ausencia de mecanismos estandarizados para la validación de competencias, se formula la siguiente interrogante principal de investigación:

¿De qué manera se puede optimizar la gestión operativa, garantizar la trazabilidad de la participación en eventos masivos y fortalecer el reconocimiento de las competencias de los miembros de la comunidad Microsoft Education Hub dentro de la Facultad de Ciencias Puras y Naturales?


## 1.4. PLANTEAMIENTO DEL OBJETIVO

El presente proyecto de grado se fundamenta en la necesidad técnica y estratégica de transitar hacia un modelo de gestión operativa automatizado. Este modelo no solo debe responder a las demandas administrativas y de auditoría de la comunidad, sino que también debe potenciar la identidad digital de sus miembros mediante el uso de tecnologías de vanguardia. Para ello, se han definido los siguientes horizontes de acción.


### 1.4.1. OBJETIVO GENERAL

Desarrollar una plataforma web integral para la gestión operativa y el reconocimiento académico de la comunidad Microsoft Education Hub (MEH), con el fin de optimizar la administración de sus miembros, garantizar la trazabilidad de la asistencia a sus eventos y fortalecer su identidad institucional dentro de la Comunidad Tecnologica.


### 1.4.2. OBJETIVOS ESPECÍFICOS

Para alcanzar la meta general, el proyecto se desglosa en los siguientes objetivos técnicos y funcionales, alineados con las fases de la metodología Feature-Driven Development (FDD):

Especificar los requerimientos operativos y de información de la comunidad MEH mediante técnicas de ingeniería de requerimientos, orientados a la centralización de los registros históricos de sus miembros.

Diseñar una arquitectura de software asíncrona y modular bajo el paradigma desacoplado (FastAPI-React), estructurando un modelo relacional robusto en PostgreSQL que garantice la integridad de los datos y la consistencia del sistema.

Implementar los módulos de gestión administrativa para la creación y control dinámico de eventos, cursos y cupos, integrando esquemas de validación estrictos para optimizar la logística de la organización.

Desarrollar los mecanismos de automatización y gamificación del sistema, mediante un motor de control de asistencia basado en códigos QR en tiempo real y un submódulo de microcredenciales digitales (Open Badges), asegurando la trazabilidad de las acciones mediante un registro de auditoría (Audit Log).

Construir las interfaces de usuario (Landing Page y Dashboard de autogestión) empleando el sistema de diseño Fluent UI v9, con el fin de proporcionar una experiencia de usuario optimizada, responsiva y coherente con la identidad institucional.

Validar la calidad, rendimiento y seguridad de la plataforma mediante la ejecución de pruebas de software funcionales (caja negra), pruebas unitarias y evaluaciones de usabilidad con los actores reales de la comunidad en el entorno de la comunidad.


## 1.5. JUSTIFICACIÓN

El desarrollo e implementación de la plataforma web integral para el Microsoft Education Hub se fundamenta en la necesidad imperante de modernizar la gestión de comunidades tecnológicas en el ámbito universitario, alineándose con las exigencias de la transformación digital educativa y los estándares de la industria del software. A continuación, se detalla la relevancia del proyecto desde las dimensiones técnica, social y científica:


## 1.5.1. JUSTIFICACIÓN TECNOLÓGICA

Desde una perspectiva de ingeniería, el proyecto se justifica por la transición de procesos manuales y propensos a errores hacia una arquitectura cliente-servidor desacoplada. El uso de una API REST construida con FastAPI garantiza una comunicación asíncrona de alto rendimiento, permitiendo que el sistema gestione múltiples solicitudes concurrentes (como el escaneo masivo de asistencia) con una latencia mínima.

La implementación de estándares modernos de seguridad, como el protocolo OAuth2 con JSON Web Tokens (JWT) para la autenticación y el uso de bibliotecas de hashing como Passlib (bcrypt), responde a la necesidad crítica de proteger la integridad de los datos de los miembros. Asimismo, la migración hacia una base de datos relacional robusta en PostgreSQL, gestionada a través de SQLAlchemy 2.0, permite un manejo transaccional fidedigno de inscripciones, pagos y emisión de méritos. Esta infraestructura no solo resuelve la fragmentación actual, sino que introduce el concepto de trazabilidad técnica mediante un sistema de registros de auditoría (Audit Log), sentando las bases para la evolución hacia un ecosistema de aprendizaje escalable y auditable.


## 1.5.2. JUSTIFICACIÓN SOCIAL

El impacto social de la plataforma radica en la profesionalización del capital humano dentro de la comunidad académica de la UMSA. Al centralizar la gestión de eventos y certificaciones, se democratiza el acceso a la formación especializada en tecnologías de vanguardia, eliminando las barreras administrativas que dificultan la participación estudiantil.

La implementación de un ecosistema de insignias digitales (Badges) y reconocimientos basados en el estándar Open Badges actúa como un catalizador de la motivación y la identidad digital. Esto permite que los estudiantes cuenten con una validación visual y técnica de sus competencias, la cual puede ser expuesta en redes profesionales como LinkedIn, mejorando directamente su perfil de empleabilidad. En última instancia, el proyecto fortalece el tejido social de la comunidad MEH, fomentando el networking y la colaboración académica en un entorno digital que proyecta orden, seriedad y respaldo institucional.


## 1.5.3. JUSTIFICACIÓN CIENTÍFICA Y METODOLÓGICA

Desde el ámbito científico y metodológico, esta investigación realiza un aporte significativo a la Ingeniería de Software al documentar la aplicación práctica de la metodología Feature-Driven Development (FDD) en el desarrollo de sistemas de gestión comunitaria. FDD permite un enfoque centrado en la funcionalidad, asegurando que cada entrega de software sea tangible y de alta calidad.

La integración de un sistema de validación de asistencia mediante tecnologías QR vinculadas a procesos de lógica de negocio asíncrona representa un caso de estudio relevante sobre la automatización de procesos en entornos de educación no formal. Metodológicamente, el proyecto justifica el uso de Pydantic para la validación estricta de contratos de datos y el sistema de diseño Fluent UI v9 para la estandarización de la experiencia de usuario (UX/UI). Este enfoque asegura que el proceso de desarrollo sea reproducible, documentado y alineado con las mejores prácticas de la ingeniería de software contemporánea, aportando literatura técnica válida para futuros proyectos dentro de la Carrera de Informática.


## 1.5.4. JUSTIFICACIÓN ECONÓMICA

Aunque el presente proyecto se desarrolla en un marco académico y de extensión universitaria, su viabilidad económica se sustenta en la optimización de los recursos operativos y la creación de un activo tecnológico institucional. La justificación económica se analiza bajo los siguientes criterios:

Reducción de Costos Operativos: La automatización del control de asistencia mediante códigos QR y la generación dinámica de certificados reducen drásticamente el costo en tiempo y esfuerzo humano que la administración manual requiere actualmente.

Ahorro por Desarrollo Propio (In-house): El desarrollo de una plataforma a medida evita la adquisición de licencias de software comercial (SaaS) para la gestión de comunidades o el pago por servicios externos de emisión de microcredenciales.

Valor del Activo Tecnológico: El proyecto dota a la Carrera de Informática y a la comunidad MEH de una herramienta propietaria, eliminando la dependencia de herramientas externas pagas o con versiones gratuitas limitadas que comprometen la privacidad de los datos de los estudiantes.


## 1.6. ALCANCES Y LÍMITES

La presente sección delimita el radio de acción del proyecto, estableciendo tanto las fronteras operativas como las restricciones técnicas que garantizan la viabilidad de la plataforma dentro de los plazos académicos y los recursos disponibles.


### 1.6.1. ALCANCES DEL PROYECTO

El desarrollo de la Plataforma Web Integral MEH contempla el ciclo de vida completo de ingeniería bajo la metodología FDD, abarcando las siguientes áreas de intervención técnica:

A. Infraestructura de Persistencia y Lógica de Negocio Se desarrollará un sistema de base de datos relacional robusto en PostgreSQL, normalizado para soportar la integridad de la memoria institucional de la comunidad. El núcleo del sistema será una API REST construida con FastAPI, que gestionará de forma asíncrona los servicios de autenticación, la lógica de asignación de insignias y el registro de auditoría (audit_log), asegurando que cada transacción sea trazable y segura.

B. Ecosistema de Gestión y Reconocimiento (Badges) El alcance incluye la implementación de un motor de validación de competencias basado en el estándar de micro-certificaciones. Esto comprende la creación de una lógica de asignación automática de méritos vinculada a la asistencia en tiempo real, la cual será gestionada mediante una herramienta de escaneo de códigos QR integrada en la interfaz administrativa.

C. Interfaz de Usuario y Experiencia de Autogestión Se construirá un portal web responsivo utilizando el sistema de diseño Fluent UI v9. El alcance contempla dos niveles de interacción: una Landing Page de libre acceso para la difusión institucional y un Dashboard Privado de alta fidelidad, donde cada miembro podrá administrar su perfil, visualizar su progreso académico y gestionar el estado de sus validaciones de pago por servicios o kits de la comunidad.


### 1.6.2. LÍMITES DEL PROYECTO

Con el fin de focalizar el esfuerzo en la solidez del núcleo del sistema, se establecen las siguientes delimitaciones:

I. Restricciones de Integración con Terceros En esta fase inicial, la plataforma operará de forma autónoma. No se contempla la integración de Single Sign-On (SSO) con cuentas institucionales de Azure AD ni la sincronización de datos con las APIs de Microsoft Learn. Asimismo, la validación de transacciones financieras se limitará a un flujo de verificación manual por parte del administrador basado en la carga de comprobantes digitales, excluyendo la integración directa con pasarelas de pago bancarias o servicios como PayPal o Stripe.

II. Alcance de Plataforma y Despliegue El proyecto se limita estrictamente a una aplicación web responsiva, por lo que el desarrollo de aplicaciones nativas para sistemas operativos móviles (Android/iOS) queda fuera de los objetivos. Igualmente, aunque el sistema generará datos estratégicos, el alcance no incluye la implementación de modelos de inteligencia artificial para análisis predictivo ni tableros de Business Intelligence (BI) externos en esta etapa


## 1.7. APORTES

La implementación de la plataforma integral para **Microsoft ****Education**** ****Hub** trasciende la mera resolución de un problema administrativo, constituyéndose como una contribución significativa que se alinea con los pilares de innovación y excelencia académica de la Facultad de Ciencias Puras y Naturales. Los aportes de este proyecto de grado se manifiestan en dos dimensiones fundamentales:


### 1.7.1. APORTE TÉCNICO

El principal aporte técnico de esta investigación reside en el diseño e integración de un ecosistema de microcredenciales verificables bajo una arquitectura web desacoplada de alto rendimiento. El desarrollo de algoritmos específicos para la generación dinámica de certificados y la lógica de asignación de insignias (*badges*) basada en méritos académicos automatizados proporciona un modelo de referencia técnica para futuros proyectos de gestión comunitaria dentro de la Carrera de Informática.

Asimismo, la implementación de un flujo de validación mediante tecnologías de códigos QR, vinculado directamente a la lógica de negocio asíncrona de FastAPI, ofrece una solución pragmática y escalable al problema histórico de la integridad de datos en eventos masivos. Este trabajo demuestra la aplicación efectiva de estándares de seguridad industrial, como el uso de JSON Web Tokens (JWT) y hashing de datos, elevando el estándar de los proyectos de grado hacia soluciones listas para entornos de producción real.


### 1.7.2. APORTE INSTITUCIONAL

Para la comunidad Microsoft Education Hub, este proyecto constituye el pilar fundamental de su transformación digital y madurez operativa. El aporte institucional se traduce en la obtención de una herramienta propietaria y soberana que elimina definitivamente la dependencia de plataformas externas limitadas y formularios digitales dispersos, garantizando que la propiedad intelectual y los datos de los miembros permanezcan bajo el control de la organización.

Al centralizar la información en una base de datos estratégica (PostgreSQL), la comunidad adquiere, por primera vez, la capacidad analítica para generar métricas de impacto real, permitiendo fortalecer su presencia y prestigio ante las autoridades universitarias y socios corporativos externos. Finalmente, el proyecto dota a los estudiantes de la UMSA de un espacio formal de reconocimiento a su esfuerzo extracurricular, validando sus competencias técnicas de manera profesional y contribuyendo al prestigio académico de la formación complementaria dentro de la universidad


## 1.8. METODOLOGÍA DE DESARROLLO (FDD - Feature-Driven Development)

Para el desarrollo de la Plataforma Web Integral MEH, se ha seleccionado la metodología Feature-Driven Development (FDD). A diferencia de otros marcos ágiles, FDD se caracteriza por ser un proceso iterativo orientado a resultados tangibles y centrados en la funcionalidad. Esta elección se justifica por la necesidad de construir un sistema con una arquitectura sólida y un diseño de datos riguroso, permitiendo que cada entrega de software aporte valor real a la gestión de la comunidad desde las primeras iteraciones (Palmer & Felsing, 2024).

FDD se estructura en cinco fases secuenciales y cíclicas, las cuales se detallan a continuación aplicadas al contexto del proyecto:


### 1.8.1. DESARROLLAR UN MODELO GLOBAL

El proceso de desarrollo inicia con una visión holística del sistema. En esta fase, el equipo de desarrollo (en este caso, la postulante en coordinación con los stakeholders de MEH) realiza un análisis exhaustivo del dominio para identificar las entidades clave y sus interacciones.

Para el proyecto MEH, el modelo global se fundamenta en la arquitectura Modular-Layered, separando claramente las responsabilidades en capas de API, Servicios y Modelos de persistencia. Según Coad et al. (2023), el modelado por objetos en esta fase es crucial para asegurar que el sistema sea escalable y fácil de mantener. En esta etapa se definen los diagramas de clases de alto nivel que representan la lógica de la comunidad: la relación entre los usuarios (users), la programación de eventos (events), la validación de transacciones de pago (payments) y el motor de gamificación (badges).

Este modelo global permite anticipar los desafíos de integridad de datos y seguridad antes de entrar a la codificación masiva, asegurando que la estructura de la base de datos en PostgreSQL responda a todas las reglas de negocio detectadas en la descripción del problema.


### 1.8.2. CONSTRUIR UNA LISTA DE FUNCIONALIDADES (FEATURE LIST)

Tras la consolidación del modelo global, la metodología FDD exige la descomposición del sistema en una lista exhaustiva de funcionalidades, expresadas desde la perspectiva del usuario final. En esta fase, el proyecto abandona las definiciones genéricas para centrarse en "unidades de valor" que pueden ser completadas en periodos cortos de tiempo (generalmente no mayores a dos semanas).

Para la Plataforma MEH, la Feature List se ha categorizado en tres áreas temáticas principales, derivadas directamente de los requisitos del sistema:

Área de Gestión de Membresía y Acceso: Incluye funcionalidades como "Autenticar usuario mediante JWT", "Recuperar credenciales de acceso" y "Gestionar permisos granulares de administrador (RBAC)".

Área de Logística de Eventos y Asistencia: Contempla features críticas como "Generar código QR único por inscripción", "Escanear asistencia en tiempo real" y "Sincronizar estados de participación".

Área de Reconocimiento y Transaccionalidad: Agrupa funcionalidades como "Asignar insignia digital por mérito", "Validar comprobante de pago de kit" y "Visualizar historial de insignias en Dashboard".

Esta granularidad permite una trazabilidad absoluta del progreso, asegurando que el desarrollo no se detenga en "módulos" abstractos, sino en capacidades operativas reales verificables por los stakeholders de la UMSA.


### 1.8.3. PLANEAR POR FUNCIONALIDAD

Una vez consolidada la lista de funcionalidades (*Feature** List*), el proceso de FDD demanda la creación de un plan de desarrollo basado en secuencias lógicas y dependencias técnicas. En esta fase, se determina el orden de implementación de las características, asignando prioridades que aseguren la estabilidad del sistema desde sus cimientos.

Para el proyecto de la comunidad Microsoft Education Hub, la planificación se ha estructurado en tres bloques de ejecución iterativa:

Bloque de Infraestructura Base (Hito 1): Prioriza la construcción de los modelos de persistencia (users, roles) y los protocolos de seguridad JWT, ya que estas funcionalidades son transversales y obligatorias para el resto de los módulos.

Bloque de Gestión Operativa (Hito 2): Se enfoca en las funcionalidades de alta demanda administrativa detectadas en el planteamiento del problema, específicamente la gestión de eventos (events) y la lógica de validación de pagos (payments).

Bloque de Innovación y Gamificación (Hito 3): Contempla las características de mayor complejidad técnica y valor para el usuario, como el motor de asignación de insignias (badges) y la integración del escaneo de códigos QR para el control de asistencia.

Según Sommerville (2022), esta planificación por funcionalidades permite mitigar riesgos técnicos de manera temprana, ya que cada "feature" completada representa un incremento de software probado y funcional, evitando la acumulación de errores al final del ciclo de desarrollo. Además, este enfoque facilita la generación de reportes de avance precisos para la tutoría académica, demostrando un progreso tangible basado en hitos de ingeniería cumplidos.


### 1.8.4. DISEÑAR POR FUNCIONALIDAD

En esta etapa, la metodología FDD establece que antes de proceder con la codificación de cualquier característica, se debe realizar un diseño detallado que garantice la eficiencia de la lógica de negocio. Para el proyecto de la plataforma MEH, esta fase implica la elaboración de paquetes de diseño para cada funcionalidad crítica, asegurando que la arquitectura orientada a servicios (FastAPI) y el esquema de datos (SQLAlchemy) interactúen sin conflictos de concurrencia.

Durante el Diseño por Funcionalidad, se ejecutan las siguientes actividades técnicas:

Modelado Detallado (UML): Se desarrollan diagramas de secuencia para modelar la interacción entre los *endpoints* de la API y los servicios de persistencia, especialmente para procesos complejos como la validación de pagos en la tabla payments y la generación de códigos QR de asistencia.

Definición de Contratos de Datos: Se diseñan los esquemas de Pydantic que actuarán como la capa de validación de entrada y salida, asegurando que los datos que fluyen desde el frontend (React) cumplan con los tipos de datos definidos en PostgreSQL.

Refinamiento del Modelo de Objetos: Se ajustan las relaciones entre tablas (como la vinculación entre events y badges) para optimizar las consultas y evitar la redundancia, siguiendo las mejores prácticas de normalización de bases de datos.

Esta fase garantiza que la implementación no sea producto de la improvisación, sino de un análisis técnico previo que minimiza el retrabajo y asegura que cada "feature" sea robusta desde su concepción.


### 1.8.5. CONSTRUIR POR FUNCIONALIDAD

La fase final del proceso iterativo de la metodología FDD consiste en la implementación física y la validación de cada funcionalidad diseñada en la etapa previa. En este punto, el equipo de desarrollo traduce los modelos UML y los esquemas de datos en código fuente ejecutable, asegurando que cada incremento de software cumpla estrictamente con los criterios de aceptación definidos en la lista de funcionalidades (*Feature** List*).

Para el desarrollo de la plataforma del Microsoft Education Hub, esta fase se desglosa en tres actividades de ingeniería fundamentales:

Codificación y Pruebas Unitarias: Se realiza la programación de la lógica de negocio en el backend utilizando FastAPI, implementando los *endpoints* asíncronos que interactúan con la base de datos PostgreSQL a través de SQLAlchemy. Paralelamente, se desarrollan los componentes de interfaz en React utilizando las librerías de Fluent UI v9 para garantizar la fidelidad visual. Cada funcionalidad es sometida a pruebas unitarias para validar su correcto comportamiento de forma aislada.

Inspección de Diseño y Código: Siguiendo los principios de FDD, se realizan revisiones técnicas para asegurar que el código cumpla con los estándares de seguridad establecidos, tales como la correcta implementación de los protocolos JWT para la protección de rutas y el hashing de credenciales mediante Bcrypt. Esta práctica garantiza que la arquitectura modular se mantenga limpia y escalable.

Integración y Promoción de Funcionalidades: Una vez verificada, la funcionalidad se integra al modelo global del sistema. En este punto, procesos como el registro de auditoría (audit_log) y la vinculación entre eventos y asignación de insignias (badges) se sincronizan para asegurar que el flujo de datos sea coherente en todo el ecosistema.

Al finalizar esta fase, la funcionalidad se considera "completada" y se promociona a una versión estable del sistema, permitiendo un avance visible y auditable de los hitos del proyecto.


# CAPÍTULO 2


## 2.1. MARCO TEÓRICO

El sustento teórico de la presente investigación no se limita a una descripción operativa de herramientas, sino que establece el fundamento científico y organizacional que justifica la arquitectura de la plataforma. Este capítulo se articula a través de tres pilares estratégicos: la identidad institucional de la organización, las teorías de aprendizaje moderno basadas en el reconocimiento digital y el ecosistema tecnológico de alto rendimiento que sostiene la solución propuesta


## 2.2. MARCO INSTITUCIONAL Y CONTEXTUAL

El análisis del entorno donde se desarrolla el proyecto es fundamental para comprender la pertinencia de la plataforma. La comunidad Microsoft Education Hub (MEH) no representa únicamente un espacio de capacitación técnica, sino que se constituye como un ecosistema de innovación que articula el talento universitario con los estándares de la industria tecnológica global. Su presencia en la Facultad de Ciencias Puras y Naturales de la Universidad Mayor de San Andrés le otorga un carácter institucional que demanda una gestión administrativa rigurosa, transparente y capaz de soportar el crecimiento constante de su base de miembros.


### 2.2.1. IDENTIDAD, NATURALEZA Y ORIGEN DE LA ORGANIZACIÓN

La comunidad Microsoft Education Hub surge como una respuesta estratégica ante la brecha existente entre la formación académica tradicional y las competencias prácticas exigidas por el mercado laboral contemporáneo. Su naturaleza se define como una organización académica y tecnológica sin fines de lucro, conformada por una red de estudiantes y profesionales apasionados por la transferencia de conocimiento. Según el marco de gobernanza de este tipo de organizaciones, MEH funciona como un nodo donde convergen el capital intelectual universitario y los protocolos de la industria de software (Daft, 2023).

Desde su fundación, la organización ha evolucionado desde un grupo de interés hacia una comunidad estructurada que lidera eventos de impacto nacional, tales como el *Azure Fest* o el *Road **to** Imagine Cup*. Esta trayectoria ha consolidado a MEH como un referente en la formación extracurricular en Bolivia, lo que ha generado una presión operativa sobre sus sistemas de registro actuales. En este contexto, la plataforma propuesta se justifica no solo como una herramienta de software, sino como el soporte vital que permitirá profesionalizar la identidad de la comunidad y asegurar la persistencia de su memoria institucional frente a futuros desafíos.


### 2.2.2. MISIÓN Y VISIÓN ESTRATÉGICA

La orientación estratégica de Microsoft Education Hub se fundamenta en un compromiso inquebrantable con la excelencia técnica y la democratización del conocimiento. La misión de la organización se centra en empoderar a los estudiantes mediante el acceso a herramientas de vanguardia, facilitando que el aprendizaje teórico se transforme en habilidades prácticas verificables que potencien su empleabilidad en el sector tecnológico.

Por otro lado, la visión de la comunidad se proyecta hacia la consolidación como el principal referente de formación en tecnologías Microsoft dentro de la región. Se aspira a construir un ecosistema digital autosuficiente donde la validación de competencias, mediante microcredenciales y proyectos de impacto real, sea reconocida y valorada tanto por las instancias académicas de la UMSA como por el sector empresarial global. La plataforma objeto de este proyecto es el componente tecnológico que materializa esta visión, permitiendo que el éxito de cada integrante sea trazable, auditable y visualmente representativo de su crecimiento profesional (Microsoft News Center, 2024).


### 2.2.3. ESTRUCTURA ORGANIZATIVA Y ROLES FUNCIONALES

Para el cumplimiento efectivo de sus objetivos estratégicos, la comunidad Microsoft Education Hub mantiene una estructura funcional jerárquica que permite la delegación de responsabilidades y la toma de decisiones basada en niveles de confianza y experiencia técnica. Esta división no solo responde a una necesidad logística, sino que constituye la base para el diseño del modelo de Control de Acceso Basado en Roles (RBAC) dentro de la plataforma, determinando la granularidad de los permisos y la visibilidad de los datos.

En la cúspide de la organización se encuentran los Administradores (Embajadores). Estos perfiles representan la máxima autoridad institucional y actúan como el enlace directo con Microsoft. Su rol es estratégico y de supervisión total; poseen el control absoluto sobre la plataforma, gestionando las alianzas, aprobando presupuestos y supervisando la integridad global de la comunidad. En términos de sistemas, este rol es el encargado de la gestión de roles de alto nivel y la auditoría de procesos críticos en la base de datos.

En el segundo nivel se ubican los Organizadores, quienes son miembros en una fase de postulación activa para convertirse en futuros embajadores (Microsoft Learn Student Ambassadors). Su función es operativa y táctica; son los responsables directos de la ejecución de eventos, la creación de contenido en los módulos de cursos y la gestión logística, como el control de asistencia y la validación de comprobantes de pago. Este nivel intermedio es fundamental para la escalabilidad de MEH, ya que actúan como moderadores y gestores del flujo académico.

Finalmente, el nivel de Miembros constituye el público en general y la base de la comunidad. Son los usuarios finales que interactúan con el sistema para consumir formación técnica, gestionar su identidad digital y recolectar sus méritos. Esta estructura tripartita permite que la plataforma segmente las funcionalidades de manera eficiente, asegurando que cada actor tenga acceso exclusivamente a las herramientas necesarias para su desempeño, garantizando así la seguridad y el orden administrativo (Daft, 2023).


### 2.2.4. ESTATUTO ORGÁNICO Y MARCO NORMATIVO INTERNO

El funcionamiento de Microsoft Education Hub no es arbitrario; se rige por un Estatuto Orgánico que define los derechos, deberes y principios éticos de todos sus integrantes. Este marco normativo interno es el que otorga validez legal y académica a las acciones realizadas dentro de la organización, estableciendo que la colaboración, la integridad técnica y la inclusión son los pilares de su gobernanza.

El estatuto estipula los mecanismos formales para la obtención de reconocimientos, dictando las condiciones bajo las cuales un miembro puede ser acreedor a insignias y certificados oficiales. Al ser la plataforma digital el único medio oficial para el registro de participación, el marco normativo se vincula directamente con la Protección de Datos Personales. Esto asegura que el tratamiento de la información de los miembros se realice bajo estrictos estándares de confidencialidad, cumpliendo con las políticas de privacidad que la academia y la industria exigen actualmente (Castells, 2024).

La implementación de la plataforma bajo los requerimientos del Término de Referencia (TDR) garantiza que estos principios estatutarios se materialicen a través de algoritmos de seguridad y un control de acceso estricto. De esta manera, el sistema no solo es una herramienta tecnológica, sino un instrumento de cumplimiento normativo que asegura que la comunidad opere bajo un régimen de legalidad, transparencia y orden institucional.


## 2.2. FUNDAMENTOS DEL APRENDIZAJE DIGITAL Y GAMIFICACIÓN

El soporte teórico y pedagógico de la plataforma propuesta trasciende la simple administración de registros, situándose en la intersección entre la psicología del aprendizaje y las nuevas tecnologías. Para que una comunidad tecnológica como Microsoft Education Hub prospere, no basta con ofrecer contenido de alta calidad; es imperativo diseñar un entorno digital que reconozca el esfuerzo, fomente la colaboración y valide las competencias adquiridas de manera dinámica. El desarrollo de este ecosistema se fundamenta en la comprensión de cómo el individuo interactúa en redes de conocimiento y cómo los estímulos visuales y competitivos pueden transformar una participación pasiva en un compromiso académico de largo plazo.


### 2.2.1. COMUNIDADES DE PRÁCTICA Y APRENDIZAJE SOCIAL EN ENTORNOS TECNOLÓGICOS

El concepto de Comunidades de Práctica (CoP), propuesto originalmente por Etienne Wenger, constituye el núcleo sociológico sobre el cual se erige Microsoft Education Hub. Una CoP no se define simplemente como un grupo de personas interesadas en un tema, sino como un colectivo que profundiza su conocimiento y experiencia mediante la interacción continua, compartiendo preocupaciones y pasiones sobre un dominio específico. En el contexto de la ingeniería de sistemas, estas comunidades permiten que el conocimiento tácito —aquel que se adquiere mediante la experiencia y la resolución de errores en código— se convierta en conocimiento explícito a través de la colaboración en proyectos y el intercambio de soluciones técnicas (Wenger-Trayner, 2023).

Para que una Comunidad de Práctica sea efectiva en un entorno digital, la plataforma debe facilitar la coexistencia de tres dimensiones fundamentales: el dominio, que representa el área de conocimiento de Microsoft; la comunidad, que se refiere a las relaciones de confianza y el sentido de pertenencia; y la práctica, que es el repertorio compartido de recursos, herramientas y experiencias acumuladas. La plataforma MEH actúa como el soporte tecnológico indispensable que permite que estas dimensiones operen de manera organizada, transformando la participación individual en un aprendizaje social colectivo que eleva el nivel técnico de toda la facultad.


### 2.2.2. EL ECOSISTEMA DE MICROCREDENCIALES Y EL ESTÁNDAR OPEN BADGES

En la actual era de la información, el aprendizaje ya no ocurre exclusivamente en ciclos largos de educación formal, sino que se fragmenta en experiencias de formación continua denominadas Educación 4.0. Esta nueva realidad demanda el reconocimiento de logros específicos y granulares que los títulos tradicionales a menudo no logran capturar. Aquí es donde surge el concepto de Microcredenciales, las cuales funcionan como certificaciones digitales que validan los resultados de aprendizaje obtenidos tras experiencias de formación breves pero intensivas, como talleres, hackathons o seminarios técnicos especializados. Según la UNESCO (2023), las microcredenciales son esenciales para el *lifelong** **learning*, ya que permiten a los estudiantes adaptar su perfil profesional a las demandas inmediatas y cambiantes del mercado laboral global.

La implementación técnica de estas microcredenciales en la plataforma MEH se realiza mediante el estándar internacional Open Badges. A diferencia de una imagen digital convencional o un diploma estático en formato PDF, un *Open Badge* es un archivo inteligente que contiene metadatos encriptados. Estos metadatos incluyen información detallada sobre la identidad del emisor, los criterios rigurosos de obtención, la evidencia del logro alcanzado y la fecha de emisión. Este estándar garantiza que el reconocimiento sea portable y técnicamente verificable ante cualquier plataforma de gestión de talento o red profesional como LinkedIn, permitiendo que el miembro de la comunidad demuestre sus competencias de manera fehaciente ante terceros y eliminando el riesgo de falsificación documental.


### 2.2.3. MECÁNICAS DE GAMIFICACIÓN Y RETENCIÓN DEL CONOCIMIENTO

La Gamificación se define científicamente como la aplicación de elementos de diseño de juegos en contextos que no son de entretenimiento para influir positivamente en el comportamiento de los usuarios y mejorar la retención del conocimiento. En los entornos de aprendizaje tecnológico, la gamificación no busca el entretenimiento superficial, sino la optimización de la experiencia del usuario (UX) mediante el refuerzo de la motivación intrínseca y extrínseca. Según las investigaciones de Hamari et al. (2024), la implementación de sistemas de reconocimiento visual activa circuitos de recompensa dopaminérgica en el cerebro, lo que favorece la persistencia del estudiante ante tareas complejas y reduce la tasa de deserción en los cursos.

En la arquitectura de la plataforma MEH, la gamificación se estructura de manera sistémica en tres niveles: las dinámicas, que representan el progreso y el estatus del usuario dentro de la comunidad; las mecánicas, que son los desafíos específicos de los cursos y la validación inmediata mediante códigos QR; y los componentes, materializados en el *Dashboard* personal y el catálogo visual de insignias logradas. Al integrar estos elementos, el sistema transforma la gestión administrativa en una experiencia de "progresión de carrera digital", donde cada interacción con la comunidad se traduce en un avance visible y gratificante en el perfil del usuario, fortaleciendo el compromiso y el sentido de logro académico institucional.


## 2.3. MARCO TECNOLÓGICO Y ARQUITECTURA DE SOFTWARE

Desde la perspectiva de la ingeniería de sistemas, la plataforma para Microsoft Education Hub se fundamenta en un modelo de Arquitectura Cliente-Servidor bajo el paradigma de servicios web desacoplados. El uso de una API REST (Representational State Transfer) permite una comunicación estandarizada mediante el protocolo HTTP, facilitando que el frontend y el backend evolucionen de manera independiente. Esta separación de responsabilidades no solo garantiza que el sistema sea escalable, sino que también asegura que la lógica de negocio sea consumida de forma eficiente por diversas interfaces en el futuro. Para la capa de persistencia, se emplea un Sistema de Gestión de Bases de Datos Relacionales fundamentado en la teoría de la normalización, asegurando que la información de usuarios, eventos e insignias mantenga una integridad referencial estricta y garantice la consistencia de cada mérito emitido.


### 2.3.1. ARQUITECTURA DE BACKEND CON FASTAPI

Para la lógica de negocio y la gestión de servicios asíncronos, se ha seleccionado FastAPI, un marco de trabajo de alto rendimiento construido sobre Python. Su elección se justifica técnicamente por su capacidad para manejar operaciones asíncronas de manera nativa mediante el uso de async/await, lo cual resulta crítico para procesos de alta concurrencia como la validación masiva de asistencia en tiempo real.

FastAPI destaca en el ecosistema de desarrollo por su integración profunda con Pydantic, lo que permite una validación automática de datos a través de *type** **hints*. Según Ramírez (2024), esta arquitectura permite detectar errores de esquema antes de que la información sea procesada o persistida, optimizando el rendimiento del servidor a niveles comparables con tecnologías como Go o Node.js. Esto asegura que la comunicación entre la base de datos y el Dashboard de usuario sea fluida, segura y libre de inconsistencias tipográficas.


### 2.3.2. DESARROLLO DE INTERFAZ CON REACT Y FLUENT UI

En la capa de presentación, se implementa una arquitectura basada en componentes utilizando React, una biblioteca de JavaScript líder en la creación de interfaces de usuario dinámicas y reactivas. Al funcionar como una *Single** Page **Application* (SPA), React permite una transición fluida entre los módulos de la plataforma sin recargas innecesarias del navegador, mejorando drásticamente la experiencia del usuario (UX) y reduciendo la carga sobre el servidor.

Para cumplir con la identidad institucional y el rigor estético del ecosistema Microsoft, se integra Fluent UI, el sistema de diseño oficial de la corporación. Esta biblioteca proporciona componentes pre-construidos que siguen los más altos estándares de accesibilidad y responsividad. La combinación de React y Fluent UI asegura que el Dashboard no solo sea funcional, sino que proyecte una imagen profesional y coherente con las herramientas globales utilizadas en la industria tecnológica (Banks & Porcello, 2022).


### 2.3.3. GESTIÓN DE PERSISTENCIA EN POSTGRESQL

En la capa de presentación, se implementa una arquitectura basada en componentes utilizando React, una biblioteca de JavaScript líder en la creación de interfaces de usuario dinámicas y reactivas. Al funcionar como una *Single** Page **Application* (SPA), React permite una transición fluida entre los módulos de la plataforma sin recargas innecesarias del navegador, mejorando drásticamente la experiencia del usuario (UX) y reduciendo la carga sobre el servidor.

Para cumplir con la identidad institucional y el rigor estético del ecosistema Microsoft, se integra Fluent UI, el sistema de diseño oficial de la corporación. Esta biblioteca proporciona componentes pre-construidos que siguen los más altos estándares de accesibilidad y responsividad. La combinación de React y Fluent UI asegura que el Dashboard no solo sea funcional, sino que proyecte una imagen profesional y coherente con las herramientas globales utilizadas en la industria tecnológica (Banks & Porcello, 2022).


### 2.3.4. PROTOCOLOS DE SEGURIDAD: JWT Y BCRYPT

La seguridad y la gestión de la identidad representan componentes críticos en el diseño de la plataforma. Para la autenticación y autorización, se implementa el estándar JSON Web Tokens (JWT), el cual permite la transmisión segura de información firmada criptográficamente entre el cliente y el servidor. Al ser un protocolo apátrida (*stateless*), JWT facilita la escalabilidad del sistema al evitar el almacenamiento de sesiones en memoria, permitiendo una verificación rápida de los roles del usuario (Admin, Organizador o Miembro) en cada petición a la API.

Complementariamente, la protección de las credenciales de acceso se gestiona mediante Bcrypt, una función de *hashing* de contraseñas diseñada para resistir ataques de fuerza bruta. A través de la técnica de *salting* aleatorio y un factor de costo ajustable, Bcrypt asegura que, ante un eventual compromiso de la base de datos, la información sensible de los miembros permanezca protegida bajo algoritmos de cifrado de última generación, cumpliendo con los estándares internacionales de ciberseguridad (Stallings, 2023).


# CAPÍTULO 3


## 3.1. MARCO METODOLÓGICO Y PROCEDIMENTAL

El marco metodológico constituye la estructura estratégica de la investigación, definiendo los procedimientos, métodos y herramientas necesarias para transformar los requerimientos de la comunidad Microsoft Education Hub en una solución tecnológica funcional y escalable. En esta sección se establece el rigor científico del proyecto, detallando el enfoque de ingeniería que garantiza que el software resultante sea de alta calidad, seguro y responda fielmente a las necesidades del entorno universitario.


## 3.2. TIPO Y ENFOQUE DE INVESTIGACIÓN

La presente investigación se inscribe en un enfoque mixto, con una predominancia cuantitativa en su fase de validación técnica. Es de tipo aplicada y proyectiva, ya que no se limita a la descripción teórica de la problemática de gestión, sino que propone, diseña y ejecuta una solución tecnológica concreta para transformar la realidad operativa de la comunidad.

Según los estándares de la Ingeniería de Software, el estudio posee un carácter descriptivo en la fase de levantamiento de requerimientos y un carácter propositivo en la fase de implementación. Se busca optimizar procesos administrativos mediante la automatización, midiendo la eficiencia del sistema a través de indicadores de rendimiento, concurrencia de datos e integridad de los registros académicos. De este modo, la investigación aporta un valor práctico inmediato al ecosistema de la Carrera de Informática de la UMSA.


## 3.3. DISEÑO DE LA INVESTIGACIÓN

El diseño de la investigación es no experimental y transeccional. Se define como no experimental debido a que se observa la gestión actual de la comunidad MEH en su contexto natural (identificando procesos manuales, uso de herramientas dispersas y cuellos de botella) sin manipular las variables de forma deliberada antes de la implementación del sistema. Es transeccional porque la recolección de datos inicial para el diagnóstico se realiza en un momento único en el tiempo.

Asimismo, el proceso sigue un modelo de investigación-acción técnica. Este diseño permite que, a medida que se desarrollan los módulos bajo la metodología FDD, la interacción constante con los administradores y organizadores de la comunidad permita refinar las los estoy funcionalidades de la plataforma. Este ciclo de "planificación-acción-observación-reflexión" asegura que el producto final esté perfectamente alineado con las expectativas de los usuarios y las normativas institucionales (Hernández-Sampieri & Mendoza, 2023).


## 3.4. INGENIERÍA DE REQUERIMIENTOS (Técnicas e Instrumentos)

El desarrollo de sistemas de información modernos en entornos académicos y comunitarios exige un marco de trabajo que no solo permita la agilidad, sino que garantice una arquitectura técnica de alta fidelidad. Por esta razón, se ha seleccionado la metodología Feature-Driven Development (FDD) como el eje conductor de la ingeniería del proyecto.


### 3.4.1. JUSTIFICACIÓN DE LA METODOLOGÍA FEATURE-DRIVEN DEVELOPMENT (FDD)

La elección de FDD frente a otros marcos como Scrum o Cascada responde a la naturaleza transaccional y modular de la plataforma MEH. Mientras que Scrum se enfoca en la gestión de equipos y tiempos (Sprints), FDD se centra en la calidad del diseño y la construcción de funcionalidades tangibles, lo cual es vital cuando se integran tecnologías asíncronas como FastAPI con motores de base de datos relacionales como PostgreSQL.

Las razones fundamentales que justifican el uso de FDD en este proyecto son:

Enfoque en el Dominio: FDD prioriza la creación de un modelo de objetos global. Esto permite que, antes de programar, se comprenda profundamente la relación entre entidades críticas como el "Usuario", el "Evento" y la "Insignia", minimizando errores de lógica en la base de datos.

Granularidad y Trazabilidad: Al dividir el sistema en una lista de "Features" (funcionalidades que aportan valor al usuario en menos de dos semanas), se asegura un progreso constante y verificable. Esto facilita que procesos complejos, como la asignación automática de insignias tras el escaneo de un QR, sean diseñados, probados e integrados de forma aislada pero coherente.

Rigor en el Diseño: A diferencia de otras metodologías ágiles que pueden descuidar la documentación técnica, FDD exige una fase de "Diseño por Funcionalidad". Esto obliga a la elaboración de diagramas de secuencia y esquemas de validación (Pydantic) previos a la codificación, elevando la robustez y seguridad del sistema.


### 3.4.2. FASES DEL PROCESO FDD ADAPTADO AL PROYECTO

El ciclo de vida del desarrollo se ha estructurado siguiendo las cinco fases estándar de FDD, adaptadas específicamente a los requerimientos técnicos del Microsoft Education Hub:

Fase 1: Desarrollar un Modelo Global: Se realizó un análisis de dominio junto a los embajadores de MEH para establecer el esquema general del sistema. En esta fase se definieron las fronteras de la plataforma y los actores principales, plasmados en el Diagrama de Contexto y el Modelo de Clases de Dominio que se detallan en el Capítulo 4.

Fase 2: Construir una Lista de Funcionalidades: Se descompuso el sistema en unidades mínimas de valor. Por ejemplo, en lugar de un módulo genérico de "Eventos", se definieron tareas específicas como "Generar token de asistencia QR", "Validar inscripción de usuario" y "Emitir badge digital".

Fase 3: Planear por Funcionalidad: Se estableció un cronograma basado en la complejidad y dependencia de las tareas. Se priorizó la infraestructura de seguridad (JWT) y el modelo de datos (SQLAlchemy) antes que las interfaces visuales, asegurando que el "músculo" del sistema sea sólido.

Fase 4: Diseñar por Funcionalidad: Por cada funcionalidad, se diseñaron los contratos de datos y la lógica de los servicios (services/). En este punto se definieron los *mixins* de auditoría para que cada acción administrativa en la plataforma deje un registro inalterable.

Fase 5: Construir por Funcionalidad: Se procedió a la implementación del código en Python y React, seguida de pruebas unitarias. Una vez que la funcionalidad superó los criterios de aceptación, fue integrada al tronco principal del proyecto.


## 3.5. HERRAMIENTAS Y ECOSISTEMA TECNOLÓGICO

La materialización de la plataforma MEH requiere de un stack tecnológico de vanguardia que garantice un alto rendimiento, seguridad de nivel industrial y una experiencia de usuario coherente con los estándares de Microsoft. La selección de herramientas se ha realizado bajo criterios de eficiencia en el manejo de procesos asíncronos y robustez en la persistencia de datos.


### 3.5.1. ENTORNO DE DESARROLLO Y LENGUAJES DE PROGRAMACIÓN

El pilar fundamental del sistema se asienta sobre Python 3.12, la versión más estable y optimizada del lenguaje al momento del desarrollo. Esta versión introduce mejoras significativas en la gestión de tipos de datos y en la eficiencia del intérprete, lo cual es vital para el procesamiento de la lógica de negocio compleja que requiere la comunidad.

Sobre este lenguaje se erige FastAPI, un framework de alto rendimiento que ha revolucionado la creación de APIs en el ecosistema Python. La decisión de utilizar FastAPI sobre alternativas como Django o Flask se fundamenta en su arquitectura basada en el estándar ASGI, que permite la ejecución de código asíncrono de manera nativa. En términos prácticos para MEH, esto significa que el servidor puede gestionar simultáneamente múltiples peticiones —como el escaneo masivo de códigos QR en un evento con cientos de personas— sin bloquear el hilo principal de ejecución. Además, la integración automática de OpenAPI (Swagger) facilita que el equipo de frontend visualice y pruebe los *endpoints* en tiempo real, acelerando el ciclo de integración.

En la capa del cliente, se utiliza React 18.2, aprovechando su paradigma de programación declarativa y su capacidad para manejar el Virtual DOM. React permite que la plataforma funcione como una *Single** Page **Application* (SPA), eliminando las recargas de página innecesarias y proporcionando una experiencia fluida al usuario. La versión 18.2 aporta mejoras en el renderizado concurrente, lo que permite que el *Dashboard* de los miembros se mantenga reactivo incluso cuando se están procesando grandes volúmenes de datos históricos de formación y certificaciones.

En la capa del cliente, se utiliza React 18.2, una biblioteca líder en el desarrollo de interfaces de usuario basadas en componentes. React permite la creación de una *Single** Page **Application* (SPA) donde el estado de la aplicación se gestiona de forma reactiva, asegurando que el Dashboard de los miembros y administradores sea dinámico y no requiera recargas constantes de página, optimizando así el consumo de ancho de banda y la fluidez operativa.


### 3.5.2. LIBRERÍAS DE INTERFAZ Y EXPERIENCIA DE USUARIO (FLUENT UI V9)

La experiencia de usuario (UX) y el diseño de la interfaz (UI) no son aspectos meramente estéticos, sino que representan la autoridad institucional de Microsoft. Por ello, se ha seleccionado Fluent UI v9, el lenguaje de diseño más reciente y avanzado de Microsoft. Esta librería no solo ofrece una estética "limpia" y moderna, sino que implementa tokens de diseño que permiten una personalización profunda y coherente.

Técnicamente, Fluent UI v9 destaca por su excelente rendimiento en el renderizado de componentes y su estricto cumplimiento de las normas de accesibilidad (Web Content Accessibility Guidelines - WCAG). Esto asegura que la plataforma sea inclusiva para todos los estudiantes de la facultad. Al utilizar los mismos componentes que herramientas globales como *Microsoft **Teams* o el portal de *Azure*, se reduce drásticamente la carga cognitiva de los usuarios de MEH, permitiéndoles navegar de forma intuitiva por los módulos de inscripción y visualización de insignias desde cualquier dispositivo, gracias a su diseño responsivo por defecto.


### 3.5.3. ECOSISTEMA DE PERSISTENCIA Y MIGRACIONES DE DATOS

La integridad y seguridad de los registros académicos dependen de PostgreSQL, un sistema de gestión de bases de datos relacionales de objetos de clase empresarial. PostgreSQL ha sido elegido por su capacidad para manejar transacciones complejas bajo el estándar ACID, asegurando que procesos críticos —como la validación de un pago y la posterior asignación de un cupo— se realicen de forma atómica y sin riesgo de corrupción de datos. Su robustez técnica lo hace ideal para almacenar el historial longitudinal de los miembros de la comunidad por tiempo indefinido.

Para la interacción entre la lógica de programación y la base de datos, se utiliza SQLAlchemy como el motor de Mapeo Objeto-Relacional (ORM). Esta herramienta permite definir la estructura de la base de datos como clases de Python, lo que facilita la implementación de Mixins para la auditoría automática de registros. Finalmente, el control de cambios en el esquema de la base de datos se gestiona con Alembic. Esta herramienta es indispensable en la ingeniería de software profesional, ya que permite realizar versiones de la base de datos (migraciones). Ante cualquier eventualidad o necesidad de escalar el sistema, Alembic permite evolucionar el esquema de datos de manera controlada, documentada y reversible, garantizando la continuidad operativa de la plataforma.

CAPÍTULO 4. DESARROLLO DE LA INGENIERÍA DEL PROYECTO

4.1. MODELADO DEL DOMINIO (FDD Fase 1: Global Model)

4.1.1. Diagrama de Contexto del Sistema MEH

4.1.2. Diagrama de Clases de Dominio (Entidades: User, Event, Badge, Payment)

4.2. CATÁLOGO DE FUNCIONALIDADES (FDD Fase 2: Feature List)

4.2.1. Área de Gestión de Eventos y Logística

4.2.2. Área de Reconocimiento Digital y Gamificación

4.2.3. Área de Administración y Validación Financiera

4.3. DISEÑO Y CONSTRUCCIÓN POR FUNCIONALIDAD (FDD Fases 3, 4 y 5)

4.3.1. Arquitectura de Persistencia (Capa models/)

4.3.1.1. Modelo Entidad-Relación Físico

4.3.1.2. Diccionario de Datos y Restricciones de Integridad

4.3.1.3. Implementación de Mixins para Auditoría y Trazabilidad

4.3.2. Lógica de Negocio y Servicios API (Capa services/ y api/)

4.3.2.1. Definición de Contratos de Datos (Pydantic Schemas)

4.3.2.2. Diagramas de Secuencia: Flujo de Asistencia QR y Asignación de Badges

4.3.2.3. Lógica de Validación de Pagos y Gestión de Estados

4.3.3. Interfaz de Usuario y Frontend (Capa web/)

4.3.3.1. Implementación de Fluent UI y Tematización Institucional

4.3.3.2. Diseño de Dashboards y Visualización de Analíticas con Recharts

4.4. SEGURIDAD, AUTORIZACIÓN Y AUDITORÍA (Capa core/)

4.4.1. Implementación de Autenticación OAuth2 y Bearer JWT

4.4.2. Matriz de Control de Acceso Basado en Roles (RBAC)

4.4.3. Sistema de Auditoría Permanente (Audit Log)

CAPÍTULO 5. PRUEBAS, VALIDACIÓN Y RESULTADOS

5.1. PLANIFICACIÓN DE PRUEBAS DEL SISTEMA

5.1.2. INDICADORES CLAVE DE RENDIMIENTO (KPIs) DEL SISTEMA

5.2. PRUEBAS FUNCIONALES Y DE INTEGRACIÓN

5.3. EVALUACIÓN DE USABILIDAD Y EXPERIENCIA DE USUARIO

5.4. PRUEBAS DE SEGURIDAD Y VALIDACIÓN DE ROLES

5.5. ANÁLISIS DE IMPACTO Y RESULTADOS OBTENIDOS

CAPÍTULO 6. CONCLUSIONES Y RECOMENDACIONES

6.1. CONCLUSIONES

6.2. RECOMENDACIONES

6.3. TRABAJOS FUTUROS
