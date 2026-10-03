import React, { useState } from 'react';
import { findCatalogModel, getModelsForBrand } from '../data/vehicleModels';

const OTHER = '__other__';

interface ModelSelectProps {
  id: string;
  brand: string;
  value: string;
  onChange: (model: string) => void;
}

/**
 * Selector de modelo/versión según la marca elegida.
 * Si el modelo no está en la lista, "Otro modelo" habilita escribirlo manualmente.
 */
export const ModelSelect: React.FC<ModelSelectProps> = ({ id, brand, value, onChange }) => {
  const models = getModelsForBrand(brand);
  const catalogMatch = value ? findCatalogModel(brand, value) : undefined;
  const [forceOther, setForceOther] = useState(false);

  // Marca sin lista: solo texto libre
  const showText = models.length === 0 || forceOther || (!!value && !catalogMatch);
  const selectValue = showText ? OTHER : (catalogMatch ?? '');

  const baseClass =
    'w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary';

  return (
    <div className="space-y-2">
      {models.length > 0 && (
        <select
          id={id}
          value={selectValue}
          onChange={(e) => {
            if (e.target.value === OTHER) {
              setForceOther(true);
              onChange('');
            } else {
              setForceOther(false);
              onChange(e.target.value);
            }
          }}
          className={`${baseClass} cursor-pointer`}
          required={!showText}
        >
          <option value="" disabled>
            Selecciona el modelo de {brand}
          </option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
          <option value={OTHER}>Otro modelo (escribir)</option>
        </select>
      )}

      {showText && (
        <input
          id={models.length === 0 ? id : `${id}-custom`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe el modelo y versión"
          className={baseClass}
          required
        />
      )}
    </div>
  );
};
