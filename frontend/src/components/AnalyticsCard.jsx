import React from 'react';
import { Card, CardHeader, CardFooter, Text, makeStyles, tokens, Caption1, shorthands } from '@fluentui/react-components';

const useStyles = makeStyles({
  card: {
    width: '100%',
    height: '350px',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  chartContainer: {
    height: '250px',
    ...shorthands.padding('10px'),
    position: 'relative',
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
  },
  title: {
    fontWeight: 'bold',
  }
});

const AnalyticsCard = ({ title, description, children, footerInfo }) => {
  const styles = useStyles();

  return (
    <Card className={styles.card}>
      <CardHeader
        header={<Text size={400} className={styles.title}>{title}</Text>}
        description={<Caption1>{description}</Caption1>}
      />
      <div className={styles.chartContainer}>
        {children}
      </div>
      {footerInfo && (
        <CardFooter>
          <Caption1 italic>{footerInfo}</Caption1>
        </CardFooter>
      )}
    </Card>
  );
};

export default AnalyticsCard;
