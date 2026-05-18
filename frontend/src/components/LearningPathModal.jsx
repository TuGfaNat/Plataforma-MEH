import React, { useState } from 'react';
import { 
  makeStyles, 
  tokens, 
  shorthands,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Button,
  Text,
  Body1
} from '@fluentui/react-components';
import { useNavigate } from 'react-router-dom';
import { BookOpen24Regular, Target24Regular, Rocket24Regular } from '@fluentui/react-icons';
import { MEHButton, MEHTypography } from './ui';

const useStyles = makeStyles({
  surface: {
    maxWidth: '500px',
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    backdropFilter: 'blur(20px)',
    ...shorthands.border('1px', 'solid', 'rgba(255, 255, 255, 0.1)'),
    color: '#ffffff',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginTop: '10px',
  },
  section: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  icon: {
    color: tokens.colorBrandForeground1,
    marginTop: '4px',
  }
});

const LearningPathModal = ({ curso }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!curso) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(event, data) => setIsOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        <MEHButton appearance="outline" style={{ width: '100%' }}>
          Ver Detalles de Ruta
        </MEHButton>
      </DialogTrigger>
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Rocket24Regular className={styles.icon} />
              {curso.nombre_curso}
            </div>
          </DialogTitle>
          <DialogContent className={styles.content}>
            <div className={styles.section}>
              <BookOpen24Regular className={styles.icon} />
              <div>
                <Text weight="bold" block>Descripción</Text>
                <Body1 style={{ opacity: 0.8 }}>
                  {curso.descripcion || "Explora los fundamentos y aplicaciones avanzadas en esta ruta de aprendizaje oficial."}
                </Body1>
              </div>
            </div>
            
            <div className={styles.section}>
              <Target24Regular className={styles.icon} />
              <div>
                <Text weight="bold" block>Objetivos</Text>
                <ul style={{ margin: 0, paddingLeft: '18px', opacity: 0.8, fontSize: '0.9rem', lineHeight: '1.6' }}>
                  <li>Dominio de herramientas del ecosistema Microsoft.</li>
                  <li>Implementación de soluciones escalables.</li>
                  <li>Certificación oficial tras completar el examen final.</li>
                </ul>
              </div>
            </div>

            <Text italic size={200} style={{ opacity: 0.5, textAlign: 'center', marginTop: '10px' }}>
              Duración estimada: {curso.horas_academicas} horas académicas
            </Text>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">Cerrar</Button>
            </DialogTrigger>
            <Button appearance="primary" onClick={() => navigate('/login')}>
              Comenzar ahora
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default LearningPathModal;
