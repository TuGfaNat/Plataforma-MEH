import React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import Sidebar from '../Sidebar';
import { designTokens } from '../../theme/theme';

const useStyles = makeStyles({
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  content: {
    flexGrow: 1,
    padding: '32px',
    overflowY: 'auto',
    [designTokens.breakpoints.sm]: {
      padding: '16px',
    }
  }
});

/**
 * MainLayout: Estructura base para páginas internas con Sidebar.
 */
const MainLayout = ({ children }) => {
  const styles = useStyles();

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
