/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Documentación Técnica',
      link: {
        type: 'generated-index',
        description: 'Detalles internos del sistema, arquitectura y base de datos.',
      },
      items: [
        'tecnico/arquitectura',
        'tecnico/persistencia-datos',
        'tecnico/seguridad-rbac',
        'tecnico/api-reference',
        'tecnico/devops-calidad',
      ],
    },
    {
      type: 'category',
      label: 'Manual de Usuario',
      link: {
        type: 'generated-index',
        description: 'Guías paso a paso para usuarios y administradores.',
      },
      items: [
        'usuario/01-dashboard',
        'usuario/02-insignias',
        'usuario/03-mis-pagos',
        'usuario/04-centro-aprendizaje',
        'usuario/05-comunidad',
        'usuario/06-recursos-vip',
        'usuario/07-speaker-kit',
        'usuario/08-analitica-estrategica',
        'usuario/09-panel-maestro',
        'usuario/10-directorio-red',
        'usuario/11-notificaciones',
        'usuario/12-validar-pagos',
        'usuario/13-escaneo-qr',
        'usuario/14-auditoria',
        'usuario/15-configuracion',
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
