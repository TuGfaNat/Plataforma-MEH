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
  ChatBubblesQuestion24Regular,
  Megaphone24Regular,
  Info24Regular,
  Star24Regular,
  Alert24Regular
} from '@fluentui/react-icons';
import MainLayout from '../components/layout/MainLayout';
import { MEHCard, MEHButton, MEHTypography } from '../components/ui';
import comunidadService from '../services/comunidadService';

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
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    ...shorthands.gap('16px'),
  },
  memberCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    ...shorthands.padding('24px', '16px'),
    gap: '8px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.05)',
    }
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
  }
});

const Comunidad = () => {
  const styles = useStyles();
  const [miembros, setMiembros] = useState([]);
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <MainLayout>
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
                <ChatBubblesQuestion24Regular /> Canales Oficiales
              </MEHTypography>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className={styles.channelItem}>
                  <img src="https://img.icons8.com/color/48/000000/discord-logo.png" alt="Discord" style={{ width: '32px' }} />
                  <div style={{ flexGrow: 1 }}>
                    <MEHTypography variant="body" style={{ fontWeight: 'bold', display: 'block' }}>Servidor de Discord</MEHTypography>
                    <MEHTypography variant="caption" style={{ opacity: 0.6 }}>Preguntas, networking y memes tech.</MEHTypography>
                  </div>
                  <MEHButton appearance="primary" onClick={() => window.open('https://discord.com', '_blank')}>Unirme</MEHButton>
                </div>
                <div className={styles.channelItem}>
                  <img src="https://img.icons8.com/color/48/000000/whatsapp--v1.png" alt="WhatsApp" style={{ width: '32px' }} />
                  <div style={{ flexGrow: 1 }}>
                    <MEHTypography variant="body" style={{ fontWeight: 'bold', display: 'block' }}>Grupo de Anuncios</MEHTypography>
                    <MEHTypography variant="caption" style={{ opacity: 0.6 }}>Solo administradores (links y eventos).</MEHTypography>
                  </div>
                  <MEHButton appearance="outline" onClick={() => window.open('https://whatsapp.com', '_blank')}>Unirme</MEHButton>
                </div>
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
                      <Avatar name={`${m.nombres} ${m.apellidos}`} size={64} color="colorful" />
                      <div style={{ marginTop: '8px' }}>
                        <MEHTypography variant="body" style={{ fontWeight: 'bold', display: 'block' }}>{m.nombres}</MEHTypography>
                        <MEHTypography variant="caption" style={{ color: tokens.colorBrandForeground1 }}>{m.rol}</MEHTypography>
                      </div>
                      <MEHButton appearance="subtle" size="small">Ver perfil</MEHButton>
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
                    <div key={anuncio.id_anuncio} style={{ paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
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
                    </div>
                  ))
                ) : (
                  <MEHTypography variant="caption" style={{ opacity: 0.5, textAlign: 'center' }}>No hay avisos recientes.</MEHTypography>
                )}
              </div>
            </MEHCard>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default Comunidad;
