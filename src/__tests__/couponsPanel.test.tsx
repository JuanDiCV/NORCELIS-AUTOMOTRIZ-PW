import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within, cleanup } from '@testing-library/react';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { CouponsManager } from '../components/admin/CouponsManager';
import { listCoupons, createCoupon, validateCouponForCart, redeemCoupon } from '../../server/coupons';
import { installFakeBackend } from './helpers/fakeBackend';

const showToast = vi.fn();
vi.mock('../context/AppContext', () => ({ useApp: () => ({ showToast }) }));

const PASSWORD = 'clave-segura-12345';
let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coupons-ui-'));
  process.env.COUPONS_DATA_DIR = dir;
  process.env.ADMIN_PASSWORD = PASSWORD;
  sessionStorage.clear();
  showToast.mockClear();
  installFakeBackend();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  delete process.env.COUPONS_DATA_DIR;
  delete process.env.ADMIN_PASSWORD;
  fs.rmSync(dir, { recursive: true, force: true });
});

const login = async () => {
  render(<CouponsManager />);
  const input = await screen.findByLabelText('Clave de administración');
  fireEvent.change(input, { target: { value: PASSWORD } });
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
  await screen.findByText('Cupones de Descuento & Campañas');
};

const fill = (label: string | RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('panel de cupones', () => {
  it('sin ADMIN_PASSWORD en el servidor muestra cómo configurarlo', async () => {
    delete process.env.ADMIN_PASSWORD;
    render(<CouponsManager />);
    expect(await screen.findByText(/Falta configurar la clave de administración/)).toBeInTheDocument();
    expect(screen.getByText(/ADMIN_PASSWORD=/)).toBeInTheDocument();
  });

  it('pide la clave, rechaza una incorrecta y entra con la correcta', async () => {
    render(<CouponsManager />);
    const input = await screen.findByLabelText('Clave de administración');

    fireEvent.change(input, { target: { value: 'incorrecta-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Clave de administrador incorrecta.');

    fireEvent.change(input, { target: { value: PASSWORD } });
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByText('Cupones de Descuento & Campañas')).toBeInTheDocument();
    expect(screen.getByText('NORCELIS5')).toBeInTheDocument();
  });

  it('mantiene la sesión mientras la pestaña esté abierta y permite cerrarla', async () => {
    await login();
    cleanup();
    render(<CouponsManager />);
    expect(await screen.findByText('Cupones de Descuento & Campañas')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión de cupones' }));
    expect(await screen.findByLabelText('Clave de administración')).toBeInTheDocument();
  });

  it('crea un cupón con vigencia, tope y límites, y aparece en la lista', async () => {
    await login();
    fireEvent.click(screen.getByRole('button', { name: /Nuevo cupón/ }));

    fill('Código *', 'cyber-wow');
    fill('Nombre interno *', 'Cyber Wow frenos');
    fill('Campaña', 'Cyber Wow Octubre');
    fill('Porcentaje *', '20');
    fill('Tope de descuento (S/)', '50');
    fill('Compra mínima (S/)', '100');
    fill('Usos totales', '30');
    fill('Usos por cliente', '1');
    fill('Vence', '2099-12-31T23:59');
    expect(screen.getByText(/el cliente ahorra S\/ 50.00/)).toBeInTheDocument(); // 20% de 500 con tope 50

    fireEvent.click(screen.getByRole('button', { name: 'Crear cupón' }));
    await waitFor(() => expect(showToast).toHaveBeenCalledWith('Cupón CYBER-WOW creado'));

    const row = screen.getByText('CYBER-WOW').closest('tr')!;
    expect(within(row).getByText('20% (tope S/ 50)')).toBeInTheDocument();
    expect(within(row).getByText('Cyber Wow Octubre')).toBeInTheDocument();
    expect(within(row).getByText('0 / 30')).toBeInTheDocument();
    expect(within(row).getByText('Activo')).toBeInTheDocument();
    expect(within(row).getByText(/Máx\. 1 por cliente/)).toBeInTheDocument();
    // vence el 31/12/2099 23:59 hora de Lima (se muestra en hora de Lima aunque el servidor guarde UTC)
    expect(within(row).getByText(/Hasta: 31 dic.? 2099, 11:59/i)).toBeInTheDocument();
  });

  it('muestra errores de validación sin llamar al servidor', async () => {
    await login();
    fireEvent.click(screen.getByRole('button', { name: /Nuevo cupón/ }));
    fill('Porcentaje *', '150');
    fireEvent.click(screen.getByRole('button', { name: 'Crear cupón' }));

    expect(await screen.findByText('Escribe un nombre para identificar el cupón.')).toBeInTheDocument();
    expect(screen.getByText('El porcentaje no puede superar 100.')).toBeInTheDocument();
    expect(screen.getByText('Revisa los campos marcados.')).toBeInTheDocument();
    expect(listCoupons().map((c) => c.code)).toEqual(['NORCELIS5']);
  });

  it('muestra el error del servidor cuando el código ya existe', async () => {
    await login();
    fireEvent.click(screen.getByRole('button', { name: /Nuevo cupón/ }));
    fill('Código *', 'norcelis5');
    fill('Nombre interno *', 'Repetido');
    fireEvent.click(screen.getByRole('button', { name: 'Crear cupón' }));
    expect(await screen.findByText('Ese código ya está en uso.')).toBeInTheDocument();
    expect(listCoupons()).toHaveLength(1);
  });

  it('edita un cupón existente', async () => {
    await login();
    fireEvent.click(screen.getByRole('button', { name: 'Editar NORCELIS5' }));
    fill('Porcentaje *', '8');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(showToast).toHaveBeenCalledWith('Cupón NORCELIS5 actualizado'));
    expect(within(screen.getByText('NORCELIS5').closest('tr')!).getByText('8%')).toBeInTheDocument();
    expect(validateCouponForCart('NORCELIS5', [{ type: 'part', priceSoles: 100, quantity: 1 }], null)).toMatchObject({ valid: true, discountSoles: 8 });
  });

  it('pausa y reactiva un cupón, y el cliente deja de poder usarlo', async () => {
    await login();
    const items = [{ type: 'part', priceSoles: 100, quantity: 1 }];

    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }));
    await waitFor(() => expect(screen.getByText('Pausado')).toBeInTheDocument());
    expect(validateCouponForCart('NORCELIS5', items, null)).toMatchObject({ valid: false });

    fireEvent.click(screen.getByRole('button', { name: 'Activar' }));
    await waitFor(() => expect(screen.getByText('Activo')).toBeInTheDocument());
    expect(validateCouponForCart('NORCELIS5', items, null)).toMatchObject({ valid: true });
  });

  it('un cupón vencido o programado se muestra con su estado', async () => {
    createCoupon({ code: 'VIEJO', name: 'Viejo', type: 'fixed', value: 10, appliesTo: ['part'], expiresAt: '2020-01-01T00:00:00Z' });
    createCoupon({ code: 'FUTURO', name: 'Futuro', type: 'fixed', value: 10, appliesTo: ['part'], startsAt: '2099-01-01T00:00:00Z' });
    await login();
    expect(within(screen.getByText('VIEJO').closest('tr')!).getByText('Vencido')).toBeInTheDocument();
    expect(within(screen.getByText('FUTURO').closest('tr')!).getByText('Programado')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filtrar por estado'), { target: { value: 'expired' } });
    expect(screen.getByText('VIEJO')).toBeInTheDocument();
    expect(screen.queryByText('FUTURO')).not.toBeInTheDocument();
  });

  it('filtra por búsqueda y campaña', async () => {
    createCoupon({ code: 'BLACK15', name: 'Black', campaign: 'Black Friday', type: 'percent', value: 15, appliesTo: ['part'] });
    await login();
    fireEvent.change(screen.getByLabelText('Filtrar por campaña'), { target: { value: 'Black Friday' } });
    expect(screen.getByText('BLACK15')).toBeInTheDocument();
    expect(screen.queryByText('NORCELIS5')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filtrar por campaña'), { target: { value: 'all' } });
    fireEvent.change(screen.getByLabelText('Buscar cupones'), { target: { value: 'norcelis' } });
    expect(screen.getByText('NORCELIS5')).toBeInTheDocument();
    expect(screen.queryByText('BLACK15')).not.toBeInTheDocument();
  });

  it('duplica un cupón con un código nuevo', async () => {
    await login();
    fireEvent.click(screen.getByRole('button', { name: 'Duplicar NORCELIS5' }));
    const code = (screen.getByLabelText('Código *') as HTMLInputElement).value;
    expect(code).toMatch(/^NC[A-Z0-9]{6}$/);
    expect((screen.getByLabelText('Nombre interno *') as HTMLInputElement).value).toBe('Cupón de bienvenida (copia)');
    fireEvent.click(screen.getByRole('button', { name: 'Crear cupón' }));
    await waitFor(() => expect(listCoupons()).toHaveLength(2));
  });

  it('elimina un cupón solo tras confirmar', async () => {
    await login();
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar NORCELIS5' }));
    expect(screen.getByText('¿Eliminar el cupón NORCELIS5?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(listCoupons()).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar NORCELIS5' }));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(listCoupons()).toHaveLength(0));
    expect(await screen.findByText(/Aún no hay cupones/)).toBeInTheDocument();
  });

  it('muestra los canjes y el contador de usos', async () => {
    redeemCoupon('NORCELIS5', [{ type: 'part', priceSoles: 200, quantity: 1 }], '12345678', 'NC-2026-0001');
    await login();
    expect(within(screen.getByText('NORCELIS5').closest('tr')!).getByText('1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver canjes NORCELIS5' }));
    expect(await screen.findByText('NC-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('12345678')).toBeInTheDocument();
    expect(screen.getByText('S/ 10.00')).toBeInTheDocument();
  });

  it('si la sesión vence, vuelve a pedir la clave', async () => {
    await login();
    sessionStorage.setItem('norcelis_admin_api_token', 'token.invalido');
    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }));
    expect(await screen.findByLabelText('Clave de administración')).toBeInTheDocument();
  });
});
