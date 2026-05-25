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
        'usuario/introduccion/index',
        'usuario/introduccion/roles-permisos',
        'usuario/guia-rapida/index',
        {
          type: 'category',
          label: 'Manual para Miembros',
          items: [
            'usuario/para-miembros/eventos',
            'usuario/para-miembros/inscripciones',
            'usuario/para-miembros/qr',
            'usuario/para-miembros/checkpoints',
            'usuario/para-miembros/cursos',
            'usuario/para-miembros/certificados',
            'usuario/para-miembros/badges',
            'usuario/para-miembros/souvenirs',
            'usuario/para-miembros/pagos',
            'usuario/para-miembros/academia'
          ]
        },
        'usuario/para-organizadores/index',
        'usuario/para-administradores/index',
        'usuario/para-soporte/index',
        'usuario/solucion-de-problemas/index',
        'usuario/preguntas-frecuentes/index',
        'usuario/historial-cambios'
      ],
    },
  ],
};

export default sidebars;
