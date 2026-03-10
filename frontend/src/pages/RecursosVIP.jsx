import React from 'react';
import { 
  makeStyles, 
  shorthands, 
  tokens, 
  Button,
  Body1,
  Caption1
} from '@fluentui/react-components';
import { 
  BookToolbox24Filled, 
  ArrowDownload24Regular,
  VideoClip24Regular,
  DocumentPdf24Regular,
  Presenter24Regular
} from '@fluentui/react-icons';
import MainLayout from '../components/layout/MainLayout';
import { MEHCard, MEHTypography } from '../components/ui';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  resourceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    ...shorthands.gap('24px'),
  },
  resourceItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    ...shorthands.padding('24px'),
  },
  iconContainer: {
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(127, 19, 236, 0.1)',
    ...shorthands.borderRadius('12px'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorBrandForeground1,
  }
});

const RecursosVIP = () => {
  const styles = useStyles();

  const recursos = [
    {
      title: "Guía de Marca MEH 2026",
      desc: "Logos oficiales, paleta de colores y tipografías para tus presentaciones.",
      icon: <Presenter24Regular />,
      type: "PDF"
    },
    {
      title: "Azure Workshop Kit",
      desc: "Slides y código base para dictar el taller 'Azure Fundamentals'.",
      icon: <BookToolbox24Filled />,
      type: "ZIP"
    },
    {
      title: "Técnicas de Oratoria Tech",
      desc: "Video exclusivo sobre cómo dar charlas de impacto en comunidades.",
      icon: <VideoClip24Regular />,
      type: "Video"
    },
    {
      title: "Plantilla de Certificados",
      desc: "Formato editable para reconocimientos locales de tu comunidad.",
      icon: <DocumentPdf24Regular />,
      type: "DOCX"
    }
  ];

  return (
    <MainLayout>
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BookToolbox24Filled style={{ color: tokens.colorBrandForeground1, fontSize: '32px' }} />
          <MEHTypography variant="h1">Recursos VIP para Embajadores</MEHTypography>
        </div>

        <MEHTypography variant="body" style={{ opacity: 0.6 }}>
          Como Embajador MEH, tienes acceso a materiales exclusivos para liderar tu comunidad local y potenciar tu marca personal.
        </MEHTypography>

        <div className={styles.resourceGrid}>
          {recursos.map((rec, index) => (
            <MEHCard key={index} className={styles.resourceItem}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className={styles.iconContainer}>
                  {rec.icon}
                </div>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', ...shorthands.padding('4px', '12px'), ...shorthands.borderRadius('20px') }}>
                  <Caption1 style={{ fontWeight: 'bold' }}>{rec.type}</Caption1>
                </div>
              </div>
              
              <div>
                <MEHTypography variant="h3" style={{ marginBottom: '8px', display: 'block' }}>{rec.title}</MEHTypography>
                <MEHTypography variant="caption" style={{ opacity: 0.7 }}>{rec.desc}</MEHTypography>
              </div>

              <Button icon={<ArrowDownload24Regular />} appearance="outline" style={{ marginTop: 'auto' }}>
                Descargar recurso
              </Button>
            </MEHCard>
          ))}
        </div>

        <MEHCard style={{ backgroundColor: 'rgba(127, 19, 236, 0.05)', textAlign: 'center', ...shorthands.padding('40px') }}>
          <MEHTypography variant="h3">¿Necesitas apoyo para un evento?</MEHTypography>
          <MEHTypography variant="body" style={{ display: 'block', margin: '16px 0', opacity: 0.8 }}>
            Si estás organizando un taller en tu universidad o ciudad, podemos apoyarte con swag, licencias de Azure o difusión.
          </MEHTypography>
          <Button appearance="primary" size="large">Solicitar Apoyo Oficial</Button>
        </MEHCard>
      </div>
    </MainLayout>
  );
};

export default RecursosVIP;
