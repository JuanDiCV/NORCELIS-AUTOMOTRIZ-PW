/**
 * Barrel principal de la capa de servicios de Nor Celis Automotriz.
 * Agrupa y expone la lógica de negocio modularizada por dominios:
 * - Vehículos (0km y Seminuevos)
 * - Autopartes y Repuestos OEM
 * - Autenticación y Cuentas
 * - Taller Mecánico y Citas
 * - Cliente API unificado
 * - Conexión Intranet
 */

export * from './vehicles';
export * from './parts';
export * from './auth';
export * from './workshop';
export * from './api';
export * from './intranetService';
