import type { CSSProperties, ReactElement } from 'react';

export type IconName = 'check' | 'plus' | 'x' | 'sun' | 'moon' | 'leaf' | 'sliders';

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
}

/** The tiny inline-SVG icon set, ported from the prototype. Decorative. */
export function Icon({ name, size = 22, stroke = 1.6, style }: IconProps): ReactElement {
  const p = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const paths: Record<IconName, ReactElement> = {
    check: <path {...p} d="M5 12.5 9.5 17 19 7" />,
    plus: <path {...p} d="M12 5v14M5 12h14" />,
    x: <path {...p} d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />,
    sun: (
      <>
        <circle {...p} cx="12" cy="12" r="4" />
        <path
          {...p}
          d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19"
        />
      </>
    ),
    moon: <path {...p} d="M19 13.5A7.5 7.5 0 1 1 10.5 5a6 6 0 0 0 8.5 8.5Z" />,
    leaf: (
      <>
        <path {...p} d="M6 18C6 9 12 5 19 5c0 9-6 13-13 13Z" />
        <path {...p} d="M9 15c2-3 5-5 8-6" />
      </>
    ),
    sliders: (
      <>
        <path {...p} d="M5 8h9M18 8h1M5 16h1M10 16h9" />
        <circle {...p} cx="16" cy="8" r="2.2" />
        <circle {...p} cx="8" cy="16" r="2.2" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
