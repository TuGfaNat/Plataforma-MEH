/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Documentación Técnica',
      link: {
        type: 'generated-index',
        title: 'Documentación Técnica',
        description: 'Documentación formal de arquitectura, base de datos y mapeo del sistema Plataforma MEH.',
      },
      items: [
        'tecnico/arquitectura-contexto',
        'tecnico/detalle-frontend',
        'tecnico/mapeo-paginas-jsx',
        'tecnico/detalle-backend',
        'tecnico/base-datos-seguridad'
      ],
    },
    {
      type: 'category',
      label: 'Manual de Usuario',
      link: {
        type: 'generated-index',
        title: 'Manual de Usuario',
        description: 'Guía paso a paso de uso de la Plataforma MEH para cada uno de los 6 roles.',
      },
      items: [
        'usuario/introduccion-guia',
        'usuario/roles-permisos',
        'usuario/flujo-miembro-embajador',
        'usuario/flujo-soporte-organizador',
        'usuario/flujo-administrador'
      ],
    },
  ],
};

export default sidebars;
