import React, { useState, useEffect } from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens,
  Avatar,
  Spinner,
  Badge
} from '@fluentui/react-components';
import { 
  People24Regular,
  ChatMultiple24Regular,
  Megaphone24Regular,
  Info24Regular,
  Star24Regular,
  Alert24Regular,
  Globe24Regular,
  Link24Regular
} from '@fluentui/react-icons';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import comunidadService from '../services/comunidadService';
import UserProfileModal from '../components/UserProfileModal';
import { resolveApiFileUrl } from '../services/api';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    animationName: {
      from: { opacity: 0, transform: 'translateY(10px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '0.5s',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  memberGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
    ...shorthands.gap('16px'),
  },
  memberCard: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding('18px'),
    gap: '12px',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.04)',
    }
  },
  memberTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  memberMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '2px',
  },
  memberDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px 10px',
    opacity: 0.9,
  },
  memberSocials: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '32px',
    '@media(max-width: 900px)': {
      gridTemplateColumns: '1fr',
    }
  },
  channelItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    ...shorthands.padding('16px'),
    backgroundColor: 'rgba(255,255,255,0.02)',
    ...shorthands.borderRadius('8px'),
    ...shorthands.border('1px', 'solid', 'rgba(255,255,255,0.05)'),
  },
  noticeItem: {
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  }
});

const OFFICIAL_CHANNELS = [
  {
    name: 'Grupo WhatsApp',
    description: 'Conversación diaria, networking y coordinación.',
    url: 'https://chat.whatsapp.com/LDxk8EbhDYo5s8U9S8OzLm',
    icon: 'https://img.icons8.com/color/48/000000/whatsapp--v1.png',
    button: 'Unirme',
  },
  {
    name: 'Canal Telegram',
    description: 'Comunicados rápidos y novedades oficiales.',
    url: 'https://t.me/microsoft_education_hub',
    icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png',
    button: 'Seguir',
  },
  {
    name: 'Canal WhatsApp',
    description: 'Anuncios institucionales y eventos importantes.',
    url: 'https://whatsapp.com/channel/0029VagyQcK6mYPQwwV0pc1M',
    icon: 'https://cdn-icons-png.flaticon.com/512/733/733585.png',
    button: 'Seguir',
  },
  {
    name: 'LinkedIn Oficial',
    description: 'Publicaciones profesionales y alianzas.',
    url: 'https://www.linkedin.com/company/microsoft-education-hub',
    icon: 'https://cdn-icons-png.flaticon.com/512/174/174857.png',
    button: 'Visitar',
  },
];

const Comunidad = () => {
  const styles = useStyles();
  const [miembros, setMiembros] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [miembrosData, anunciosData] = await Promise.all([
          comunidadService.getMiembros(),
          comunidadService.getAnuncios()
        ]);
        setMiembros(miembrosData);
        setAnuncios(anunciosData);
      } catch (err) {
        console.error("Error fetching comunidad data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getAnuncioIcon = (tipo) => {
    switch(tipo) {
      case 'NUEVO': return <Star24Regular style={{ color: '#FFD700' }} />;
      case 'ALERTA': return <Alert24Regular style={{ color: '#FF5722' }} />;
      default: return <Info24Regular style={{ color: tokens.colorBrandForeground1 }} />;
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.header}>
          <People24Regular style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
          <MEHTypography variant="h1">Comunidad</MEHTypography>
        </div>
        <MEHTypography variant="body" style={{ opacity: 0.6 }}>
          Conecta, colabora y crece con otros entusiastas de la tecnología.
        </MEHTypography>
      </div>

      <div className={styles.mainGrid}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Canales */}
          <section>
            <MEHTypography variant="h3" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ChatMultiple24Regular /> Canales Oficiales
            </MEHTypography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {OFFICIAL_CHANNELS.map((ch) => (
                <div key={ch.name} className={styles.channelItem}>
                  <img src={ch.icon} alt={ch.name} style={{ width: '32px' }} />
                  <div style={{ flexGrow: 1 }}>
                    <MEHTypography variant="body" style={{ fontWeight: 'bold', display: 'block' }}>{ch.name}</MEHTypography>
                    <MEHTypography variant="caption" style={{ opacity: 0.7 }}>{ch.description}</MEHTypography>
                  </div>
                  <MEHButton appearance="primary" onClick={() => window.open(ch.url, '_blank')}>{ch.button}</MEHButton>
                </div>
              ))}
            </div>
          </section>

          {/* Directorio Real */}
          <section>
            <MEHTypography variant="h3" style={{ marginBottom: '16px', display: 'block' }}>Directorio de Miembros</MEHTypography>
            {loading ? (
              <Spinner label="Cargando comunidad..." />
            ) : (
              <div className={styles.memberGrid}>
                {miembros.map(m => (
                  <MEHCard key={m.id_usuario} className={styles.memberCard}>
                    <div className={styles.memberTop}>
                      <Avatar name={`${m.nombres} ${m.apellidos}`} size={56} color="colorful" image={{ src: resolveApiFileUrl(m.foto_url) }} />
                      <div>
                        <MEHTypography variant="body" style={{ fontWeight: 'bold', display: 'block' }}>
                          {m.alias || `${m.nombres} ${m.apellidos}`}
                        </MEHTypography>
                        <MEHTypography variant="caption" style={{ opacity: 0.75 }}>
                          {m.nombres} {m.apellidos}
                        </MEHTypography>
                        <div className={styles.memberMeta}>
                          <Badge appearance="tint" color="brand">{m.rol}</Badge>
                          <Badge appearance="outline">{m.tipo_entidad || 'Miembro'}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className={styles.memberDetails}>
                      <MEHTypography variant="caption"><b>Institución:</b> {m.institucion || 'No definida'}</MEHTypography>
                      <MEHTypography variant="caption"><b>Ubicación:</b> {m.departamento || 'N/D'}, {m.pais || 'N/D'}</MEHTypography>
                    </div>

                    <MEHTypography variant="caption" style={{ opacity: 0.75 }}>
                      {m.bio ? (m.bio.length > 140 ? `${m.bio.slice(0, 140)}...` : m.bio) : 'Sin biografía pública.'}
                    </MEHTypography>

                    <div className={styles.memberSocials}>
                      {m.linkedin_url && <MEHButton size="small" appearance="subtle" icon={<Globe24Regular />} onClick={() => window.open(m.linkedin_url, '_blank')}>LinkedIn</MEHButton>}
                      {m.github_url && <MEHButton size="small" appearance="subtle" icon={<Globe24Regular />} onClick={() => window.open(m.github_url, '_blank')}>GitHub</MEHButton>}
                      {m.learning_path_url && <MEHButton size="small" appearance="subtle" icon={<Globe24Regular />} onClick={() => window.open(m.learning_path_url, '_blank')}>Learn</MEHButton>}
                    </div>

                    <MEHButton 
                      appearance="subtle" 
                      size="small"
                      onClick={() => {
                        setSelectedUser(m.id_usuario);
                        setIsModalOpen(true);
                      }}
                    >
                      Ver perfil completo
                    </MEHButton>
                  </MEHCard>
                ))}
                {miembros.length === 0 && (
                  <MEHTypography variant="caption" style={{ opacity: 0.5 }}>Aún no hay perfiles públicos.</MEHTypography>
                )}
              </div>
            )}
          </section>
        </div>

        <div>
          {/* Muro de Avisos Real */}
          <MEHCard style={{ position: 'sticky', top: '24px' }}>
            <MEHTypography variant="h3" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Megaphone24Regular /> Muro de Avisos
            </MEHTypography>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loading ? (
                <Spinner size="small" />
              ) : anuncios.length > 0 ? (
                anuncios.map(anuncio => (
                  <div key={anuncio.id_anuncio} className={styles.noticeItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <Badge color={anuncio.tipo === 'ALERTA' ? 'danger' : 'brand'} appearance="tint">
                        {anuncio.tipo}
                      </Badge>
                      <MEHTypography variant="caption" style={{ opacity: 0.5 }}>
                        {new Date(anuncio.fecha_publicacion).toLocaleDateString()}
                      </MEHTypography>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      {getAnuncioIcon(anuncio.tipo)}
                      <div>
                        <MEHTypography variant="body" style={{ display: 'block', fontWeight: 'bold' }}>{anuncio.titulo}</MEHTypography>
                        <MEHTypography variant="caption" style={{ opacity: 0.7, marginTop: '4px', display: 'block' }}>
                          {anuncio.contenido}
                        </MEHTypography>
                      </div>
                    </div>
                    {anuncio.url_imagen && (
                      <img
                        src={resolveApiFileUrl(anuncio.url_imagen)}
                        alt={anuncio.titulo}
                        style={{ width: '100%', borderRadius: '8px', maxHeight: '180px', objectFit: 'cover' }}
                      />
                    )}
                    {anuncio.link_accion && (
                      <MEHButton
                        appearance="outline"
                        size="small"
                        icon={<Link24Regular />}
                        onClick={() => window.open(anuncio.link_accion, '_blank')}
                      >
                        Ver más
                      </MEHButton>
                    )}
                  </div>
                ))
              ) : (
                <MEHTypography variant="caption" style={{ opacity: 0.5, textAlign: 'center' }}>No hay avisos recientes.</MEHTypography>
              )}
            </div>
          </MEHCard>
        </div>

      </div>

      <UserProfileModal 
        userId={selectedUser}
        isOpen={isModalOpen}
        onOpenChange={(e, d) => setIsModalOpen(d.open)}
      />
    </div>
  );
};

export default Comunidad;
