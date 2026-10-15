// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: '1. Tutoriales',
      link: {
        type: 'generated-index',
        title: 'Tutoriales',
        description: 'Guías de aprendizaje y primeros pasos en la Plataforma MEH.',
      },
      collapsed: false,
      items: [
        'usuario/introduccion/index',
        'usuario/guia-rapida/index',
      ],
    },
    {
      type: 'category',
      label: '2. Guías Prácticas (How-To)',
      link: {
        type: 'generated-index',
        title: 'Guías Prácticas',
        description: 'Manuales de operación por rol y resolución de incidentes en el sistema.',
      },
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Manual para Miembros',
          link: {
            type: 'generated-index',
            title: 'Manual para Miembros',
            description: 'Operaciones para estudiantes y miembros participantes de la comunidad.',
          },
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
            'usuario/para-miembros/academia',
          ],
        },
        'usuario/para-organizadores/index',
        'usuario/para-administradores/index',
        'usuario/para-soporte/index',
        'usuario/solucion-de-problemas/index',
        'usuario/preguntas-frecuentes/index',
      ],
    },
    {
      type: 'category',
      label: '3. Referencia',
      link: {
        type: 'generated-index',
        title: 'Documentación de Referencia',
        description: 'Especificaciones técnicas, contratos REST M3, diccionario de datos y control de accesos.',
      },
      collapsed: false,
      items: [
        'tecnico/contratos-api',
        'tecnico/diccionario-datos',
        'tecnico/matriz-rbac',
      ],
    },
    {
      type: 'category',
      label: '4. Explicación',
      link: {
        type: 'generated-index',
        title: 'Explicación y Arquitectura',
        description: 'Fundamentación teórica, decisiones de diseño, modelo C4 y arquitectura de software.',
      },
      collapsed: false,
      items: [
        'tecnico/arquitectura-contexto',
        'tecnico/detalle-frontend',
        'tecnico/mapeo-paginas-jsx',
        'tecnico/detalle-backend',
        'tecnico/base-datos-seguridad',
        'tecnico/decisiones-arquitectonicas',
      ],
    },
    'historial-cambios',
  ],
};

export default sidebars;
