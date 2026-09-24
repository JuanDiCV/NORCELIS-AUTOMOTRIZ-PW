import React from 'react';

export interface NorCelisLogoProps {
  /**
   * Variante del logo oficial según el manual de marca:
   * - 'full': Isotipo + Logotipo "NOR CELIS" + Tagline "AUTOMOTRIZ"
   * - 'emblem' | 'isotipo': Solo el isotipo circular con líneas de velocidad y cuadrante a 90°
   * - 'text-only' | 'horizontal': Solo el logotipo "NOR CELIS" + "AUTOMOTRIZ" (sin isotipo)
   */
  variant?: 'full' | 'emblem' | 'isotipo' | 'text-only' | 'horizontal';
  /**
   * Tema cromático:
   * - 'light' | 'colored': Colores oficiales estándar (Azul Marino #16284F + Naranja #F28220)
   * - 'dark': Para fondos oscuros (Blanco #FFFFFF + Naranja #F28220)
   * - 'monochrome-white' | 'white': Todo blanco #FFFFFF (Monocromático para fondos oscuros)
   * - 'monochrome-navy' | 'navy': Todo azul marino #16284F (Monocromático para fondos claros)
   */
  theme?: 'light' | 'colored' | 'dark' | 'white' | 'monochrome-white' | 'navy' | 'monochrome-navy';
  /**
   * Tamaño predeterminado o 'custom' para controlar vía Tailwind (e.g. h-10 w-auto)
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
  showSubtext?: boolean;
}

export const NorCelisLogo: React.FC<NorCelisLogoProps> = ({
  variant = 'full',
  theme = 'light',
  size = 'md',
  className = '',
  showSubtext = true,
}) => {
  // Paleta oficial de marca Nor Celis Automotriz extraída de los artes oficiales
  const isAllWhite = theme === 'white' || theme === 'monochrome-white';
  const isAllNavy = theme === 'navy' || theme === 'monochrome-navy';
  const isDarkBg = theme === 'dark';

  const navyColor = '#16284F';
  const orangeColor = '#F28220';
  const whiteColor = '#FFFFFF';

  let emblemColor = navyColor;
  let norColor = navyColor;
  let celisColor = orangeColor;
  let taglineColor = navyColor;

  if (isAllWhite) {
    emblemColor = whiteColor;
    norColor = whiteColor;
    celisColor = whiteColor;
    taglineColor = whiteColor;
  } else if (isAllNavy) {
    emblemColor = navyColor;
    norColor = navyColor;
    celisColor = navyColor;
    taglineColor = navyColor;
  } else if (isDarkBg) {
    emblemColor = whiteColor;
    norColor = whiteColor;
    celisColor = orangeColor;
    taglineColor = whiteColor;
  }

  // Clases de tamaño predeterminado con proporciones armónicas
  const isSquare = variant === 'emblem' || variant === 'isotipo';
  const sizeClasses = {
    xs: isSquare ? 'h-6 w-6' : 'h-7',
    sm: isSquare ? 'h-8 w-8' : 'h-9',
    md: isSquare ? 'h-11 w-11' : 'h-12',
    lg: isSquare ? 'h-14 w-14' : 'h-16',
    xl: isSquare ? 'h-20 w-20' : 'h-24',
    custom: '',
  }[size];

  // 1. Variante: Solo Isotipo (Velocímetro / Indicador 90° con 3 líneas de aceleración)
  if (variant === 'emblem' || variant === 'isotipo') {
    return (
      <svg
        viewBox="0 0 250 250"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses} ${className} transition-transform overflow-visible`}
        aria-label="Isotipo Oficial Nor Celis Automotriz"
      >
        <g fill={emblemColor}>
          {/* Línea de velocidad central (más extendida hacia la izquierda) */}
          <rect x="6" y="113" width="76" height="24" />

          {/* Línea de velocidad superior */}
          <rect x="42" y="52" width="62" height="24" />

          {/* Línea de velocidad inferior */}
          <rect x="42" y="174" width="62" height="24" />

          {/* Aro exterior: Centro (140, 125), Radio Exterior 95, Radio Interior 71 (Grosor 24) */}
          <path
            fillRule="evenodd"
            d="M 140,30 A 95,95 0 1,0 140,220 A 95,95 0 1,0 140,30 Z M 140,54 A 71,71 0 1,1 140,196 A 71,71 0 1,1 140,54 Z"
          />

          {/* Ángulo recto interior: 12:00 hacia centro y centro hacia 3:00 */}
          <rect x="128" y="54" width="24" height="83" />
          <rect x="128" y="113" width="83" height="24" />
        </g>
      </svg>
    );
  }

  // 2. Variante: Solo Logotipo + Tagline (sin isotipo) con margen amplio para evitar cortes
  if (variant === 'text-only') {
    return (
      <svg
        viewBox="0 0 460 270"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses} ${className} select-none overflow-visible`}
        aria-label="Logotipo Nor Celis Automotriz"
      >
        <g>
          {/* "NOR" */}
          <text
            x="16"
            y="98"
            fill={norColor}
            style={{
              fontFamily: "'Montserrat', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              fontWeight: 900,
              fontSize: '112px',
              letterSpacing: '0.01em',
            }}
          >
            NOR
          </text>

          {/* "CELIS" */}
          <text
            x="16"
            y="206"
            fill={celisColor}
            style={{
              fontFamily: "'Montserrat', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
              fontWeight: 900,
              fontSize: '124px',
              letterSpacing: '-0.02em',
            }}
          >
            CELIS
          </text>

          {/* Tagline "AUTOMOTRIZ" */}
          {showSubtext && (
            <text
              x="20"
              y="254"
              fill={taglineColor}
              style={{
                fontFamily: "'Montserrat', 'Inter', system-ui, -apple-system, sans-serif",
                fontWeight: 800,
                fontSize: '23px',
                letterSpacing: '0.40em',
              }}
            >
              AUTOMOTRIZ
            </text>
          )}
        </g>
      </svg>
    );
  }

  // 3. Variante Completa: Isotipo + Logotipo + Tagline con márgenes laterales y viewBox holgado
  return (
    <svg
      viewBox="0 0 740 270"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClasses} ${className} select-none overflow-visible`}
      aria-label="Logo Oficial Nor Celis Automotriz"
    >
      {/* Isotipo Oficial Nor Celis (Izquierda) */}
      <g id="norcelis-emblem-official" fill={emblemColor}>
        {/* Línea de aceleración central (máxima proyección a la izquierda) */}
        <rect x="6" y="113" width="76" height="24" />

        {/* Línea de aceleración superior */}
        <rect x="42" y="52" width="62" height="24" />

        {/* Línea de aceleración inferior */}
        <rect x="42" y="174" width="62" height="24" />

        {/* Aro exterior del velocímetro/indicador: Centro (140, 125) */}
        <path
          fillRule="evenodd"
          d="M 140,30 A 95,95 0 1,0 140,220 A 95,95 0 1,0 140,30 Z M 140,54 A 71,71 0 1,1 140,196 A 71,71 0 1,1 140,54 Z"
        />

        {/* Ángulo recto interior: de 12:00 hacia centro y de centro hacia 3:00 */}
        <rect x="128" y="54" width="24" height="83" />
        <rect x="128" y="113" width="83" height="24" />
      </g>

      {/* Logotipo y Tagline (Derecha con amplio margen de seguridad) */}
      <g id="norcelis-typography-official">
        {/* "NOR" */}
        <text
          x="285"
          y="98"
          fill={norColor}
          style={{
            fontFamily: "'Montserrat', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: '112px',
            letterSpacing: '0.01em',
          }}
        >
          NOR
        </text>

        {/* "CELIS" */}
        <text
          x="285"
          y="206"
          fill={celisColor}
          style={{
            fontFamily: "'Montserrat', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            fontSize: '124px',
            letterSpacing: '-0.02em',
          }}
        >
          CELIS
        </text>

        {/* Tagline "AUTOMOTRIZ" */}
        {showSubtext && (
          <text
            x="290"
            y="254"
            fill={taglineColor}
            style={{
              fontFamily: "'Montserrat', 'Inter', system-ui, -apple-system, sans-serif",
              fontWeight: 800,
              fontSize: '23px',
              letterSpacing: '0.40em',
            }}
          >
            AUTOMOTRIZ
          </text>
        )}
      </g>
    </svg>
  );
};
