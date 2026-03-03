import React from 'react';
import { Title1, Title2, Title3, Body1, Caption1 } from '@fluentui/react-components';

/**
 * MEHTypography: Estandariza el uso de textos en la plataforma.
 */
export const MEHTypography = ({ variant = 'body', children, ...props }) => {
  switch (variant) {
    case 'h1': return <Title1 {...props}>{children}</Title1>;
    case 'h2': return <Title2 {...props}>{children}</Title2>;
    case 'h3': return <Title3 {...props}>{children}</Title3>;
    case 'caption': return <Caption1 {...props}>{children}</Caption1>;
    case 'body':
    default:
      return <Body1 {...props}>{children}</Body1>;
  }
};
