import { AppUser, StoredUserAccount } from '../../types';
import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../../config/api';

const AUTH_STORAGE_KEY = 'norcelis_current_auth_user';
const REGISTERED_ACCOUNTS_KEY = 'norcelis_registered_accounts';

/**
 * Servicio modular de Autenticación & Usuarios de Nor Celis.
 * Separa la lógica de inicio de sesión, registro, control de roles (RBAC) y persistencia.
 */
export const authService = {
  /**
   * Obtiene el usuario autenticado actualmente en sesión
   */
  getCurrentUser(): AppUser | null {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.name === 'string' && parsed.isLoggedIn) {
          return parsed as AppUser;
        }
      }
    } catch (e) {
      console.error('Error leyendo usuario actual:', e);
    }
    return null;
  },

  /**
   * Guarda o actualiza el usuario activo en sesión
   */
  setCurrentUser(user: AppUser | null): void {
    try {
      if (user && user.isLoggedIn) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error guardando usuario:', e);
    }
  },

  /**
   * Obtiene todas las cuentas registradas
   */
  getRegisteredAccounts(): StoredUserAccount[] {
    try {
      const saved = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error leyendo cuentas registradas:', e);
    }
    return [];
  },

  /**
   * Guarda cuentas registradas en almacenamiento local
   */
  saveRegisteredAccounts(accounts: StoredUserAccount[]): void {
    try {
      localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Error guardando cuentas registradas:', e);
    }
  },

  /**
   * Intento de login remoto si el servidor en Hostinger está habilitado
   */
  async remoteLogin(emailOrDoc: string, password: string): Promise<AppUser | null> {
    if (!apiClient.isRemoteEnabled()) return null;

    return await apiClient.post<AppUser>(API_ENDPOINTS.auth.login, {
      identifier: emailOrDoc,
      password,
    });
  },
};
