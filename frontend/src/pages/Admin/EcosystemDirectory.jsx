import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  tokens,
  shorthands,
  TabList,
  Tab,
  Spinner,
  Avatar,
  Badge,
  Card,
  CardHeader,
  CardFooter,
  Caption1,
  Body1,
  Subtitle1,
  Link as FluentLink,
  Divider,
} from '@fluentui/react-components';
import {
  Mic24Regular,
  Reward24Regular,
  PeopleCommunity24Regular,
  Globe24Regular,
  Briefcase24Regular,
  ShareAndroid24Regular
} from '@fluentui/react-icons';
import { MEHCard, MEHButton, MEHTypography } from '../../components/ui';
import adminService from '../../services/adminService';
import { useNotify } from '../../App';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius('12px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralBackground3),
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: tokens.shadow16
    }
  },
  bio: {
    marginTop: '12px',
    color: tokens.colorNeutralForeground2,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  logo: {
    width: '100%',
    height: '140px',
    objectFit: 'contain',
    backgroundColor: 'white',
    ...shorthands.borderRadius('8px'),
    padding: '12px'
  }
});

const EcosystemDirectory = () => {
  const styles = useStyles();
  const { notify } = useNotify();
  const [selectedTab, setSelectedTab] = useState('speakers');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (selectedTab === 'speakers') res = await adminService.getSpeakers();
      if (selectedTab === 'auspiciadores') res = await adminService.getAuspiciadores();
      if (selectedTab === 'comunidades') res = await adminService.getComunidades();
      setData(res || []);
    } catch (err) {
      notify("Error", "No se pudo cargar el directorio", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTab]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <MEHTypography variant="h1">Directorio de Red y Ecosistema</MEHTypography>
      </div>

      <TabList selectedValue={selectedTab} onTabSelect={(e, d) => setSelectedTab(d.value)}>
        <Tab value="speakers" icon={<Mic24Regular />}>Speakers</Tab>
        <Tab value="auspiciadores" icon={<Reward24Regular />}>Auspiciadores</Tab>
        <Tab value="comunidades" icon={<PeopleCommunity24Regular />}>Comunidades Aliadas</Tab>
      </TabList>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <Spinner label="Explorando el ecosistema..." />
        </div>
      ) : (
        <div className={styles.grid}>
          {selectedTab === 'speakers' && data.map(s => (
            <Card key={s.id_speaker} className={styles.card}>
              <CardHeader
                header={<Subtitle1>{s.nombre}</Subtitle1>}
                description={<Caption1><Briefcase24Regular /> {s.trabajo_actual}</Caption1>}
                avatar={<Avatar size={48} src={s.foto_url} name={s.nombre} />}
              />
              <div style={{ padding: '0 12px' }}>
                <Badge color="brand" appearance="outline" style={{ marginBottom: '8px' }}>Speaker Invitado</Badge>
                <Body1 className={styles.bio}>{s.bio || "Sin biografía disponible."}</Body1>
                <Divider style={{ margin: '12px 0' }} />
                <MEHTypography variant="caption" style={{ opacity: 0.7 }}>
                  <strong>Trayectoria:</strong> {s.trayectoria || "No especificada"}
                </MEHTypography>
              </div>
              <CardFooter>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {s.linkedin_url && <FluentLink href={s.linkedin_url} target="_blank">LinkedIn</FluentLink>}
                  {s.twitter_url && <FluentLink href={s.twitter_url} target="_blank">Twitter</FluentLink>}
                </div>
              </CardFooter>
            </Card>
          ))}

          {selectedTab === 'auspiciadores' && data.map(a => (
            <Card key={a.id_auspiciador} className={styles.card}>
              <img src={a.logo_url} alt={a.nombre} className={styles.logo} />
              <CardHeader
                header={<Subtitle1>{a.nombre}</Subtitle1>}
                description={<Badge appearance="tint" color={a.tipo === 'GOLD' ? 'brand' : 'neutral'}>{a.tipo}</Badge>}
              />
              <CardFooter>
                <MEHButton size="small" icon={<Globe24Regular />} onClick={() => window.open(a.sitio_web, '_blank')}>
                  Visitar Sitio
                </MEHButton>
              </CardFooter>
            </Card>
          ))}

          {selectedTab === 'comunidades' && data.map(c => (
            <Card key={c.id_comunidad} className={styles.card}>
               <CardHeader
                header={<Subtitle1>{c.nombre}</Subtitle1>}
                avatar={<Avatar size={40} src={c.logo_url} name={c.nombre} />}
              />
              <div style={{ padding: '0 12px' }}>
                <Body1 className={styles.bio}>{c.descripcion}</Body1>
              </div>
              <CardFooter>
                <MEHButton size="small" icon={<ShareAndroid24Regular />} onClick={() => window.open(c.link_contacto, '_blank')}>
                  Contactar
                </MEHButton>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {data.length === 0 && !loading && (
        <MEHCard style={{ textAlign: 'center', padding: '48px' }}>
          <MEHTypography variant="body">No hay registros en esta categoría todavía.</MEHTypography>
        </MEHCard>
      )}
    </div>
  );
};

export default EcosystemDirectory;
