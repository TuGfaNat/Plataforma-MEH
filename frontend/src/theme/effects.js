import { shorthands, tokens } from '@fluentui/react-components';

export const effectMixins = {
  glass: {
    // We use tokens to be theme agnostic
    // tokens.colorNeutralBackground1 is typically #FFFFFF in light mode, #06020D in dark mode
    background: `color-mix(in srgb, ${tokens.colorNeutralBackground1} 30%, transparent)`,
    backdropFilter: 'blur(10px)',
    ...shorthands.border('1px', 'solid', `color-mix(in srgb, ${tokens.colorNeutralStroke1} 30%, transparent)`),
    boxShadow: `0 8px 32px color-mix(in srgb, ${tokens.colorNeutralShadowAmbient} 30%, transparent)`,
  },
  // We can add other effects like spotlight etc here later
};
