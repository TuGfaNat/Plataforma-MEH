/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Documentación Técnica',
      link: {
        type: 'doc',
        id: 'tecnico/index',
      },
      items: [
        {
          type: 'category',
          label: '1. Visión General',
          items: [
            'tecnico/01-vision-general/index',
          ],
        },
        {
          type: 'category',
          label: '2. Mapa Dependencias',
          items: [
            'tecnico/02-mapa-dependencias/index',
          ],
        },
        {
          type: 'category',
          label: '3. Decisiones Arquitectónicas',
          items: [
            'tecnico/03-decisiones-arquitectonicas/index',
          ],
        },
        {
          type: 'category',
          label: '4. Módulos',
          items: [
            'tecnico/04-modulos/index',
            'tecnico/04-modulos/01-auth-identidad',
            'tecnico/04-modulos/02-eventos',
            'tecnico/04-modulos/03-inscripciones-asistencia',
            'tecnico/04-modulos/04-learning-hub-cursos',
            'tecnico/04-modulos/05-gamificacion-badges',
            'tecnico/04-modulos/06-certificados',
            'tecnico/04-modulos/07-pagos-ocrn',
            'tecnico/04-modulos/08-productos-souvenirs',
            'tecnico/04-modulos/09-academia',
            'tecnico/04-modulos/10-recursos',
            'tecnico/04-modulos/11-anuncios',
            'tecnico/04-modulos/12-dashboard-reportes',
            'tecnico/04-modulos/13-logs-auditoria',
            'tecnico/04-modulos/14-admin-configuracion',
            'tecnico/04-modulos/15-files',
          ],
        },
        {
          type: 'category',
          label: '5. Apéndices',
          items: [
            'tecnico/05-apendices/index',
          ],
        },
        'tecnico/06-historial-cambios',
      ],
    },
    {
      type: 'category',
      label: 'Manual de Usuario',
      link: {
        type: 'doc',
        id: 'usuario/index',
      },
      items: [
        {
          type: 'category',
          label: '1. Introducción',
          items: [
            'usuario/introduccion/index-01-introduccion',
            'usuario/introduccion/01-que-es-meh',
            'usuario/introduccion/02-roles-del-sistema',
            'usuario/introduccion/03-primeros-pasos',
          ],
        },
        {
          type: 'category',
          label: '2. Guía rápida',
          items: [
            'usuario/guia-rapida/index-02-guia-rapida',
            'usuario/guia-rapida/01-inicio-de-sesion',
            'usuario/guia-rapida/02-mi-perfil',
            'usuario/guia-rapida/03-navegacion-general',
          ],
        },
        {
          type: 'category',
          label: '3. Para miembros',
          items: [
            'usuario/para-miembros/index-03-para-miembros',
            'usuario/para-miembros/01-explorar-eventos',
            'usuario/para-miembros/02-inscribirse-a-evento',
            'usuario/para-miembros/03-mi-qr-de-acceso',
            'usuario/para-miembros/04-asistencia-y-checkpoints',
            'usuario/para-miembros/05-explorar-cursos',
            'usuario/para-miembros/06-inscribirse-a-curso',
            'usuario/para-miembros/07-mis-certificados',
            'usuario/para-miembros/08-mis-badges',
            'usuario/para-miembros/09-comprar-souvenirs',
            'usuario/para-miembros/10-historial-de-pagos',
          ],
        },
        {
          type: 'category',
          label: '4. Para organizadores',
          items: [
            'usuario/para-organizadores/index-04-para-organizadores',
            'usuario/para-organizadores/01-crear-evento',
            'usuario/para-organizadores/02-gestionar-speakers',
            'usuario/para-organizadores/03-gestionar-auspiciadores',
            'usuario/para-organizadores/04-gestionar-comunidades',
            'usuario/para-organizadores/05-checkpoints-del-evento',
            'usuario/para-organizadores/06-ver-inscripciones',
            'usuario/para-organizadores/07-escaneo-qr',
            'usuario/para-organizadores/08-crear-curso',
            'usuario/para-organizadores/09-gestionar-lecciones',
            'usuario/para-organizadores/10-calificar-tareas',
            'usuario/para-organizadores/11-emitir-certificados',
            'usuario/para-organizadores/12-crear-badges',
            'usuario/para-organizadores/13-gestionar-anuncios',
          ],
        },
        {
          type: 'category',
          label: '5. Para administradores',
          items: [
            'usuario/para-administradores/index-05-para-administradores',
            'usuario/para-administradores/01-panel-de-control',
            'usuario/para-administradores/02-gestion-de-usuarios',
            'usuario/para-administradores/03-validar-pagos',
            'usuario/para-administradores/04-conciliacion-ocrn',
            'usuario/para-administradores/05-gestionar-productos',
            'usuario/para-administradores/06-ver-pedidos',
            'usuario/para-administradores/07-configuracion-global',
            'usuario/para-administradores/08-logs-de-auditoria',
            'usuario/para-administradores/09-gestionar-recursos',
            'usuario/para-administradores/10-reportes',
          ],
        },
        {
          type: 'category',
          label: '6. Para soporte',
          items: [
            'usuario/para-soporte/index-06-para-soporte',
            'usuario/para-soporte/01-buscar-usuario',
            'usuario/para-soporte/02-ver-inscripciones',
            'usuario/para-soporte/03-consultar-pagos',
          ],
        },
        {
          type: 'category',
          label: '7. Solución de problemas',
          items: [
            'usuario/solucion-de-problemas/index-07-solucion-de-problemas',
            'usuario/solucion-de-problemas/01-no-puedo-iniciar-sesion',
            'usuario/solucion-de-problemas/02-no-veo-mi-qr',
            'usuario/solucion-de-problemas/03-mi-pago-no-se-refleja',
            'usuario/solucion-de-problemas/04-no-recibi-mi-certificado',
            'usuario/solucion-de-problemas/05-error-al-escaneal-qr',
            'usuario/solucion-de-problemas/06-contactar-soporte',
          ],
        },
        {
          type: 'category',
          label: '8. Preguntas frecuentes',
          items: [
            'usuario/preguntas-frecuentes/index-08-preguntas-frecuentes',
            'usuario/preguntas-frecuentes/01-eventos',
            'usuario/preguntas-frecuentes/02-cursos',
            'usuario/preguntas-frecuentes/03-pagos',
            'usuario/preguntas-frecuentes/04-certificados',
            'usuario/preguntas-frecuentes/05-cuentas-y-perfiles',
          ],
        },
        'usuario/09-historial-cambios',
      ],
    },
    {
      type: 'category',
      label: 'Histórico (Migrado desde /docs)',
      link: {
        type: 'generated-index',
        description: 'Documentación histórica consolidada desde la carpeta raíz docs/.',
      },
      items: [
        'historico/tecnico/arquitectura-raiz',
        'historico/tecnico/api-reference-raiz',
        'historico/tecnico/base-de-datos-raiz',
        'historico/usuario/gestion-eventos-raiz',
      ],
    },
  ],
};

export default sidebars;
