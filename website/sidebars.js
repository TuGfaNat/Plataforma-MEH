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
            'usuario/01-introduccion/index',
            'usuario/01-introduccion/01-que-es-meh',
            'usuario/01-introduccion/02-roles-del-sistema',
            'usuario/01-introduccion/03-primeros-pasos',
          ],
        },
        {
          type: 'category',
          label: '2. Guía rápida',
          items: [
            'usuario/02-guia-rapida/index',
            'usuario/02-guia-rapida/01-inicio-de-sesion',
            'usuario/02-guia-rapida/02-mi-perfil',
            'usuario/02-guia-rapida/03-navegacion-general',
          ],
        },
        {
          type: 'category',
          label: '3. Para miembros',
          items: [
            'usuario/03-para-miembros/index',
            'usuario/03-para-miembros/01-explorar-eventos',
            'usuario/03-para-miembros/02-inscribirse-a-evento',
            'usuario/03-para-miembros/03-mi-qr-de-acceso',
            'usuario/03-para-miembros/04-asistencia-y-checkpoints',
            'usuario/03-para-miembros/05-explorar-cursos',
            'usuario/03-para-miembros/06-inscribirse-a-curso',
            'usuario/03-para-miembros/07-mis-certificados',
            'usuario/03-para-miembros/08-mis-badges',
            'usuario/03-para-miembros/09-comprar-souvenirs',
            'usuario/03-para-miembros/10-historial-de-pagos',
          ],
        },
        {
          type: 'category',
          label: '4. Para organizadores',
          items: [
            'usuario/04-para-organizadores/index',
            'usuario/04-para-organizadores/01-crear-evento',
            'usuario/04-para-organizadores/02-gestionar-speakers',
            'usuario/04-para-organizadores/03-gestionar-auspiciadores',
            'usuario/04-para-organizadores/04-gestionar-comunidades',
            'usuario/04-para-organizadores/05-checkpoints-del-evento',
            'usuario/04-para-organizadores/06-ver-inscripciones',
            'usuario/04-para-organizadores/07-escaneo-qr',
            'usuario/04-para-organizadores/08-crear-curso',
            'usuario/04-para-organizadores/09-gestionar-lecciones',
            'usuario/04-para-organizadores/10-calificar-tareas',
            'usuario/04-para-organizadores/11-emitir-certificados',
            'usuario/04-para-organizadores/12-crear-badges',
            'usuario/04-para-organizadores/13-gestionar-anuncios',
          ],
        },
        {
          type: 'category',
          label: '5. Para administradores',
          items: [
            'usuario/05-para-administradores/index',
            'usuario/05-para-administradores/01-panel-de-control',
            'usuario/05-para-administradores/02-gestion-de-usuarios',
            'usuario/05-para-administradores/03-validar-pagos',
            'usuario/05-para-administradores/04-conciliacion-ocrn',
            'usuario/05-para-administradores/05-gestionar-productos',
            'usuario/05-para-administradores/06-ver-pedidos',
            'usuario/05-para-administradores/07-configuracion-global',
            'usuario/05-para-administradores/08-logs-de-auditoria',
            'usuario/05-para-administradores/09-gestionar-recursos',
            'usuario/05-para-administradores/10-reportes',
          ],
        },
        {
          type: 'category',
          label: '6. Para soporte',
          items: [
            'usuario/06-para-soporte/index',
            'usuario/06-para-soporte/01-buscar-usuario',
            'usuario/06-para-soporte/02-ver-inscripciones',
            'usuario/06-para-soporte/03-consultar-pagos',
          ],
        },
        {
          type: 'category',
          label: '7. Solución de problemas',
          items: [
            'usuario/07-solucion-de-problemas/index',
            'usuario/07-solucion-de-problemas/01-no-puedo-iniciar-sesion',
            'usuario/07-solucion-de-problemas/02-no-veo-mi-qr',
            'usuario/07-solucion-de-problemas/03-mi-pago-no-se-refleja',
            'usuario/07-solucion-de-problemas/04-no-recibi-mi-certificado',
            'usuario/07-solucion-de-problemas/05-error-al-escaneal-qr',
            'usuario/07-solucion-de-problemas/06-contactar-soporte',
          ],
        },
        {
          type: 'category',
          label: '8. Preguntas frecuentes',
          items: [
            'usuario/08-preguntas-frecuentes/index',
            'usuario/08-preguntas-frecuentes/01-eventos',
            'usuario/08-preguntas-frecuentes/02-cursos',
            'usuario/08-preguntas-frecuentes/03-pagos',
            'usuario/08-preguntas-frecuentes/04-certificados',
            'usuario/08-preguntas-frecuentes/05-cuentas-y-perfiles',
          ],
        },
        'usuario/09-historial-cambios',
      ],
    },
  ],
};

export default sidebars;
