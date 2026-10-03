import React from 'react';

const ITEMS = [
  { icon: 'local_shipping', title: 'Envío a todo el Perú', text: 'Seguimiento en tiempo real' },
  { icon: 'verified_user', title: 'Garantía oficial', text: 'Respaldo Nor Celis' },
  { icon: 'lock', title: 'Pago 100% seguro', text: 'Tarjeta, transferencia o Culqi' },
  { icon: 'autorenew', title: 'Cambios sin complicaciones', text: 'Devolución en 30 días' },
];

/** Franja de confianza para reforzar la decisión de compra en las fichas de producto. */
export const TrustStrip: React.FC = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    {ITEMS.map((item) => (
      <div
        key={item.title}
        className="flex items-center gap-3 bg-surface-container-lowest rounded-2xl border border-surface-container p-4"
      >
        <span className="w-10 h-10 shrink-0 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-xl">{item.icon}</span>
        </span>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-bold text-on-surface leading-tight">{item.title}</p>
          <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5 hidden sm:block">{item.text}</p>
        </div>
      </div>
    ))}
  </div>
);
