import React from 'react';
import { Title1, Title2, Title3, Subtitle2, Body1, Caption1 } from '@fluentui/react-components';

/**
 * MEHTypography: Estandariza el uso de textos en la plataforma.
 * Por defecto aplica display: 'block' para evitar que títulos y subtítulos
 * se concatenen en una misma línea cuando se colocan dentro de un contenedor normal.
 */
export const MEHTypography = ({ variant = 'body', children, style, ...props }) => {
  const mergedStyle = { display: 'block', ...style };
  switch (variant) {
    case 'h1': return <Title1 block style={mergedStyle} {...props}>{children}</Title1>;
    case 'h2': return <Title2 block style={mergedStyle} {...props}>{children}</Title2>;
    case 'h3': return <Title3 block style={mergedStyle} {...props}>{children}</Title3>;
    case 'h4': return <Subtitle2 block style={mergedStyle} {...props}>{children}</Subtitle2>;
    case 'caption': return <Caption1 block style={mergedStyle} {...props}>{children}</Caption1>;
    case 'body':
    default:
      return <Body1 block style={mergedStyle} {...props}>{children}</Body1>;
  }
};
