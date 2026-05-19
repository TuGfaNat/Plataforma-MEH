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
        'usuario/01-onboarding-auth',
        'usuario/02-dashboard-central',
        'usuario/03-events-hub',
        'usuario/04-qr-operations',
        'usuario/05-learning-gamification',
        'usuario/06-admin-master-panel',
        'usuario/07-public-validator',
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
