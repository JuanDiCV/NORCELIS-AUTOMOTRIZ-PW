import { ActiveGarageVehicle, Vehicle } from '../types';
import { VEHICLES_DATA } from '../data/mockData';

const STORAGE_KEY_ALERTS_ENABLED = 'norcelis_garage_price_alerts_enabled';
const STORAGE_KEY_PRICE_SNAPSHOTS = 'norcelis_garage_price_snapshots';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export interface PriceAlertCheckResult {
  hasChanges: boolean;
  alerts: Array<{
    vehicle: ActiveGarageVehicle;
    oldPriceSoles?: number;
    newPriceSoles: number;
    differenceSoles: number;
    formattedDifference: string;
  }>;
  totalChecked: number;
}

/**
 * Check if the browser supports the Notification API
 */
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * Get current browser notification permission
 */
export const getNotificationPermission = (): NotificationPermissionStatus => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission as NotificationPermissionStatus;
};

/**
 * Check if the user enabled price alerts in Nor Celis Garage
 */
export const getPriceAlertsEnabled = (): boolean => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ALERTS_ENABLED);
    return saved === 'true';
  } catch {
    return false;
  }
};

/**
 * Save user preference for price alerts
 */
export const setPriceAlertsEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEY_ALERTS_ENABLED, String(enabled));
  } catch (e) {
    console.error('Error saving price alerts setting to localStorage', e);
  }
};

/**
 * Request permission from browser for Web Notifications
 */
export const requestNotificationPermission = async (): Promise<NotificationPermissionStatus> => {
  if (!isNotificationSupported()) return 'unsupported';

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setPriceAlertsEnabled(true);
    } else if (permission === 'denied') {
      setPriceAlertsEnabled(false);
    }
    return permission as NotificationPermissionStatus;
  } catch (e) {
    console.error('Error requesting notification permission', e);
    return 'default';
  }
};

/**
 * Send a compact price change notification using the Web Notification API
 */
export const sendCompactPriceAlertNotification = (
  vehicleName: string,
  newPriceSoles: number,
  oldPriceSoles?: number,
  onClickCallback?: () => void
): boolean => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const title = `🚨 Precio Actualizado: ${vehicleName}`;
    const diffText = oldPriceSoles && oldPriceSoles !== newPriceSoles
      ? ` (Antes: S/ ${oldPriceSoles.toLocaleString()})`
      : '';
    const body = `Nuevo precio: S/ ${newPriceSoles.toLocaleString()}${diffText}. Haz clic para ver detalles.`;

    const notification = new Notification(title, {
      body,
      icon: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=192&q=80',
      badge: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=96&q=80',
      tag: `norcelis-price-alert-${Date.now()}`,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (onClickCallback) {
        onClickCallback();
      }
    };

    return true;
  } catch (e) {
    console.error('Error creating Web Notification', e);
    return false;
  }
};

/**
 * Compare garage vehicles with current catalog vehicle prices and dispatch compact notifications
 */
export const checkPriceVariationsForGarage = (
  garageVehicles: ActiveGarageVehicle[],
  availableVehicles: Vehicle[] = VEHICLES_DATA,
  onNavigateToVehicle?: (vehicleId: string) => void
): PriceAlertCheckResult => {
  if (!garageVehicles || garageVehicles.length === 0) {
    return { hasChanges: false, alerts: [], totalChecked: 0 };
  }

  let savedSnapshots: Record<string, number> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRICE_SNAPSHOTS);
    if (raw) savedSnapshots = JSON.parse(raw);
  } catch {
    savedSnapshots = {};
  }

  const updatedSnapshots: Record<string, number> = { ...savedSnapshots };
  const alerts: PriceAlertCheckResult['alerts'] = [];

  garageVehicles.forEach((gVeh) => {
    const key = `${gVeh.brand}_${gVeh.model}_${gVeh.year}`.toLowerCase().replace(/\s+/g, '_');
    
    // Find matching catalog vehicle by brand and model
    const catalogMatch = availableVehicles.find((v) => {
      const vBrand = v.brand.toLowerCase();
      const vName = v.name.toLowerCase();
      const gBrand = gVeh.brand.toLowerCase();
      const gModel = gVeh.model.toLowerCase();
      return (
        (vBrand.includes(gBrand) || gBrand.includes(vBrand)) &&
        (vName.includes(gModel) || gModel.includes(vName.split(' ')[0]))
      );
    }) || availableVehicles[0];

    const currentPrice = catalogMatch ? catalogMatch.priceSoles : 115000;
    const recordedPrice = savedSnapshots[key];

    // If there is a recorded price and it changed, or if it's the first check and we simulate an alert
    if (recordedPrice !== undefined && recordedPrice !== currentPrice) {
      const diff = currentPrice - recordedPrice;
      alerts.push({
        vehicle: gVeh,
        oldPriceSoles: recordedPrice,
        newPriceSoles: currentPrice,
        differenceSoles: diff,
        formattedDifference: `${diff > 0 ? '+' : ''}S/ ${diff.toLocaleString()}`,
      });

      sendCompactPriceAlertNotification(
        `${gVeh.brand} ${gVeh.model}`,
        currentPrice,
        recordedPrice,
        () => {
          if (catalogMatch && onNavigateToVehicle) {
            onNavigateToVehicle(catalogMatch.id);
          }
        }
      );
    }

    updatedSnapshots[key] = currentPrice;
  });

  try {
    localStorage.setItem(STORAGE_KEY_PRICE_SNAPSHOTS, JSON.stringify(updatedSnapshots));
  } catch (e) {
    console.error('Error updating price snapshots in localStorage', e);
  }

  return {
    hasChanges: alerts.length > 0,
    alerts,
    totalChecked: garageVehicles.length,
  };
};

/**
 * Trigger an immediate test/verification notification for the active vehicle
 */
export const triggerTestPriceAlertNotification = (
  vehicle: ActiveGarageVehicle,
  catalogVehicles: Vehicle[] = VEHICLES_DATA,
  onNavigateToVehicle?: (vehicleId: string) => void
): boolean => {
  const match = catalogVehicles.find((v) =>
    v.brand.toLowerCase().includes(vehicle.brand.toLowerCase()) ||
    v.name.toLowerCase().includes(vehicle.model.toLowerCase())
  ) || catalogVehicles[0];

  const currentPrice = match ? match.priceSoles : 124900;
  const previousPrice = match && match.oldPriceSoles ? match.oldPriceSoles : currentPrice + 3200;

  return sendCompactPriceAlertNotification(
    `${vehicle.brand} ${vehicle.model}`,
    currentPrice,
    previousPrice,
    () => {
      if (match && onNavigateToVehicle) {
        onNavigateToVehicle(match.id);
      }
    }
  );
};
