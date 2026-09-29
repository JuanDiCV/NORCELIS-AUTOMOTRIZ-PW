import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ActiveGarageVehicle } from '../types';
import {
  getNotificationPermission,
  getPriceAlertsEnabled,
  setPriceAlertsEnabled,
  requestNotificationPermission as requestBrowserNotificationPermission,
  checkPriceVariationsForGarage,
  triggerTestPriceAlertNotification,
  NotificationPermissionStatus,
  PriceAlertCheckResult,
} from '../services/notificationService';

export interface GarageContextType {
  garageVehicles: ActiveGarageVehicle[];
  activeGarage: ActiveGarageVehicle | null;
  setActiveGarage: (garage: ActiveGarageVehicle | null) => void;
  addGarageVehicle: (vehicle: Omit<ActiveGarageVehicle, 'id'>) => ActiveGarageVehicle;
  updateGarageVehicle: (vehicleIdOrPlate: string, updatedData: Partial<ActiveGarageVehicle>) => void;
  deleteGarageVehicle: (vehicleIdOrPlate: string) => void;
  clearGarage: () => void;
  isGarageModalOpen: boolean;
  setIsGarageModalOpen: (open: boolean) => void;
  hasVehicles: boolean;

  // Web Notification & Price Alerts State and Methods
  alertsEnabled: boolean;
  permissionStatus: NotificationPermissionStatus;
  requestNotificationPermission: () => Promise<NotificationPermissionStatus>;
  setPriceAlertsSubscription: (enabled: boolean) => Promise<boolean>;
  checkGaragePriceChanges: (onNavigateToVehicle?: (vehicleId: string) => void) => PriceAlertCheckResult;
  sendTestPriceAlert: (onNavigateToVehicle?: (vehicleId: string) => void) => boolean;
}

export const GarageContext = createContext<GarageContextType | undefined>(undefined);

const GUEST_VEHICLES_KEY = 'norcelis_garage_vehicles_guest';
const GUEST_ACTIVE_KEY = 'norcelis_active_garage_guest';

interface GarageProviderProps {
  children: React.ReactNode;
  userId?: string | null;
  onToastMessage?: (msg: string) => void;
}

export const GarageProvider: React.FC<GarageProviderProps> = ({
  children,
  userId = null,
  onToastMessage,
}) => {
  const getStorageKeys = useCallback(() => {
    if (userId) {
      return {
        vehiclesKey: `norcelis_garage_vehicles_${userId}`,
        activeKey: `norcelis_active_garage_${userId}`,
      };
    }
    return {
      vehiclesKey: GUEST_VEHICLES_KEY,
      activeKey: GUEST_ACTIVE_KEY,
    };
  }, [userId]);

  const [isGarageModalOpen, setIsGarageModalOpen] = useState(false);

  // Notification state
  const [alertsEnabled, setAlertsEnabledState] = useState<boolean>(() => getPriceAlertsEnabled());
  const [permissionStatus, setPermissionStatusState] = useState<NotificationPermissionStatus>(() =>
    getNotificationPermission()
  );

  // Update permission status and alert subscription on mount or modal open
  useEffect(() => {
    setPermissionStatusState(getNotificationPermission());
    setAlertsEnabledState(getPriceAlertsEnabled());
  }, [isGarageModalOpen]);

  // Load initial vehicles from localStorage for current session / guest
  const [garageVehicles, setGarageVehicles] = useState<ActiveGarageVehicle[]>(() => {
    try {
      const keys = getStorageKeys();
      const saved = localStorage.getItem(keys.vehiclesKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error al cargar vehículos del garaje desde localStorage:', e);
    }
    return [];
  });

  // Load initial active vehicle from localStorage for current session / guest
  const [activeGarage, setActiveGarageState] = useState<ActiveGarageVehicle | null>(() => {
    try {
      const keys = getStorageKeys();
      const savedActive = localStorage.getItem(keys.activeKey);
      if (savedActive) {
        const parsed = JSON.parse(savedActive);
        if (parsed && typeof parsed === 'object' && parsed.brand) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error al cargar vehículo activo desde localStorage:', e);
    }
    return null;
  });

  // Sync garageVehicles to localStorage whenever it changes or userId changes
  useEffect(() => {
    try {
      const keys = getStorageKeys();
      localStorage.setItem(keys.vehiclesKey, JSON.stringify(garageVehicles));
    } catch (e) {
      console.error('Error al guardar vehículos en localStorage:', e);
    }
  }, [garageVehicles, getStorageKeys]);

  // Sync activeGarage to localStorage whenever it changes or userId changes
  useEffect(() => {
    try {
      const keys = getStorageKeys();
      if (activeGarage) {
        localStorage.setItem(keys.activeKey, JSON.stringify(activeGarage));
      } else {
        localStorage.removeItem(keys.activeKey);
      }
    } catch (e) {
      console.error('Error al guardar vehículo activo en localStorage:', e);
    }
  }, [activeGarage, getStorageKeys]);

  // Reload garage state whenever authenticated userId changes
  useEffect(() => {
    const keys = getStorageKeys();
    try {
      const savedVehicles = localStorage.getItem(keys.vehiclesKey);
      const parsedVehicles = savedVehicles ? JSON.parse(savedVehicles) : [];
      setGarageVehicles(Array.isArray(parsedVehicles) ? parsedVehicles : []);

      const savedActive = localStorage.getItem(keys.activeKey);
      if (savedActive) {
        const parsedActive = JSON.parse(savedActive);
        setActiveGarageState(parsedActive && parsedActive.brand ? parsedActive : (parsedVehicles[0] || null));
      } else {
        setActiveGarageState(parsedVehicles[0] || null);
      }
    } catch (e) {
      setGarageVehicles([]);
      setActiveGarageState(null);
    }
  }, [userId, getStorageKeys]);

  const setActiveGarage = useCallback((vehicle: ActiveGarageVehicle | null) => {
    setActiveGarageState(vehicle);
    try {
      const keys = getStorageKeys();
      if (vehicle) {
        localStorage.setItem(keys.activeKey, JSON.stringify(vehicle));
      } else {
        localStorage.removeItem(keys.activeKey);
      }
    } catch (e) {}
  }, [getStorageKeys]);

  const addGarageVehicle = useCallback((newVeh: Omit<ActiveGarageVehicle, 'id'>): ActiveGarageVehicle => {
    const created: ActiveGarageVehicle = {
      ...newVeh,
      id: `gar-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    setGarageVehicles((prev) => {
      const updated = [created, ...prev.filter((v) => v.plate !== created.plate)];
      try {
        const keys = getStorageKeys();
        localStorage.setItem(keys.vehiclesKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setActiveGarageState(created);
    try {
      const keys = getStorageKeys();
      localStorage.setItem(keys.activeKey, JSON.stringify(created));
    } catch (e) {}

    if (onToastMessage) {
      onToastMessage(`¡${created.brand} ${created.model} registrado y guardado en tu sesión!`);
    }

    return created;
  }, [getStorageKeys, onToastMessage]);

  const updateGarageVehicle = useCallback((vehicleIdOrPlate: string, updatedData: Partial<ActiveGarageVehicle>) => {
    setGarageVehicles((prev) => {
      const updated = prev.map((v) => {
        const matches = v.id === vehicleIdOrPlate || v.plate === vehicleIdOrPlate || v.vin === vehicleIdOrPlate;
        if (!matches) return v;
        const item = { ...v, ...updatedData };
        return item;
      });

      try {
        const keys = getStorageKeys();
        localStorage.setItem(keys.vehiclesKey, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setActiveGarageState((prevActive) => {
      if (!prevActive) return null;
      const matches = prevActive.id === vehicleIdOrPlate || prevActive.plate === vehicleIdOrPlate || prevActive.vin === vehicleIdOrPlate;
      if (matches) {
        const updated = { ...prevActive, ...updatedData };
        try {
          const keys = getStorageKeys();
          localStorage.setItem(keys.activeKey, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      }
      return prevActive;
    });

    if (onToastMessage) {
      onToastMessage('Datos del vehículo actualizados correctamente.');
    }
  }, [getStorageKeys, onToastMessage]);

  const deleteGarageVehicle = useCallback((vehicleIdOrPlate: string) => {
    setGarageVehicles((prev) => {
      const remaining = prev.filter(
        (v) => !(v.id === vehicleIdOrPlate || v.plate === vehicleIdOrPlate || v.vin === vehicleIdOrPlate)
      );

      try {
        const keys = getStorageKeys();
        localStorage.setItem(keys.vehiclesKey, JSON.stringify(remaining));
      } catch (e) {}

      // Update active vehicle if the deleted one was active
      setActiveGarageState((prevActive) => {
        if (!prevActive) return null;
        const wasActive =
          prevActive.id === vehicleIdOrPlate ||
          prevActive.plate === vehicleIdOrPlate ||
          prevActive.vin === vehicleIdOrPlate;

        if (wasActive) {
          const nextActive = remaining.length > 0 ? remaining[0] : null;
          try {
            const keys = getStorageKeys();
            if (nextActive) {
              localStorage.setItem(keys.activeKey, JSON.stringify(nextActive));
            } else {
              localStorage.removeItem(keys.activeKey);
            }
          } catch (e) {}

          if (onToastMessage) {
            if (nextActive) {
              onToastMessage(`Vehículo eliminado. Se activó automáticamente ${nextActive.brand} ${nextActive.model}.`);
            } else {
              onToastMessage('Vehículo eliminado. Tu garaje ahora está vacío.');
            }
          }
          return nextActive;
        }
        return prevActive;
      });

      return remaining;
    });
  }, [getStorageKeys, onToastMessage]);

  const clearGarage = useCallback(() => {
    setGarageVehicles([]);
    setActiveGarageState(null);
    try {
      const keys = getStorageKeys();
      localStorage.removeItem(keys.vehiclesKey);
      localStorage.removeItem(keys.activeKey);
    } catch (e) {}
    if (onToastMessage) {
      onToastMessage('Se limpió el garaje de la sesión.');
    }
  }, [getStorageKeys, onToastMessage]);

  // Request browser notification permission explicitly
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermissionStatus> => {
    const status = await requestBrowserNotificationPermission();
    setPermissionStatusState(status);
    if (status === 'granted') {
      setAlertsEnabledState(true);
      setPriceAlertsEnabled(true);
      if (onToastMessage) {
        onToastMessage('✓ Permiso concedido: Alertas de precio web activadas para Mi Garaje.');
      }
    } else if (status === 'denied') {
      setAlertsEnabledState(false);
      setPriceAlertsEnabled(false);
      if (onToastMessage) {
        onToastMessage('Las notificaciones están bloqueadas en la configuración de tu navegador.');
      }
    }
    return status;
  }, [onToastMessage]);

  // Handle subscription state when user toggles the switch in GarageModal
  const setPriceAlertsSubscription = useCallback(async (enabled: boolean): Promise<boolean> => {
    if (enabled) {
      const currentPerm = getNotificationPermission();
      if (currentPerm === 'granted') {
        setAlertsEnabledState(true);
        setPriceAlertsEnabled(true);
        if (onToastMessage) {
          onToastMessage('✓ Alertas de precio web activadas para Mi Garaje.');
        }
        return true;
      } else {
        const result = await requestBrowserNotificationPermission();
        setPermissionStatusState(result);
        if (result === 'granted') {
          setAlertsEnabledState(true);
          setPriceAlertsEnabled(true);
          if (onToastMessage) {
            onToastMessage('✓ Permiso concedido: Alertas de precio web activadas para Mi Garaje.');
          }
          return true;
        } else {
          setAlertsEnabledState(false);
          setPriceAlertsEnabled(false);
          if (onToastMessage) {
            if (result === 'denied') {
              onToastMessage('Las notificaciones están bloqueadas en la configuración del navegador.');
            } else {
              onToastMessage('Permiso de notificaciones no otorgado.');
            }
          }
          return false;
        }
      }
    } else {
      setAlertsEnabledState(false);
      setPriceAlertsEnabled(false);
      if (onToastMessage) {
        onToastMessage('Alertas de precio desactivadas.');
      }
      return false;
    }
  }, [onToastMessage]);

  const checkGaragePriceChanges = useCallback((onNavigateToVehicle?: (vehicleId: string) => void): PriceAlertCheckResult => {
    return checkPriceVariationsForGarage(garageVehicles, undefined, onNavigateToVehicle);
  }, [garageVehicles]);

  const sendTestPriceAlert = useCallback((onNavigateToVehicle?: (vehicleId: string) => void): boolean => {
    const targetVeh = activeGarage || garageVehicles[0] || {
      brand: 'Toyota',
      model: 'Hilux Revo 4x4 D-Cab',
      year: 2025,
      plate: 'ABC-123',
      engine: '2.8L Turbo Diésel',
    };
    return triggerTestPriceAlertNotification(targetVeh, undefined, onNavigateToVehicle);
  }, [activeGarage, garageVehicles]);

  const value: GarageContextType = {
    garageVehicles,
    activeGarage,
    setActiveGarage,
    addGarageVehicle,
    updateGarageVehicle,
    deleteGarageVehicle,
    clearGarage,
    isGarageModalOpen,
    setIsGarageModalOpen,
    hasVehicles: garageVehicles.length > 0,
    alertsEnabled,
    permissionStatus,
    requestNotificationPermission,
    setPriceAlertsSubscription,
    checkGaragePriceChanges,
    sendTestPriceAlert,
  };

  return <GarageContext.Provider value={value}>{children}</GarageContext.Provider>;
};

export const useGarage = (): GarageContextType => {
  const context = useContext(GarageContext);
  if (!context) {
    throw new Error('useGarage must be used within a GarageProvider');
  }
  return context;
};
