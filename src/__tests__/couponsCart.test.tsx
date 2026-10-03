import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { CartView } from '../views/CartView';
import { listCoupons, createCoupon, updateCoupon, redeemCoupon } from '../../server/coupons';
import { installFakeBackend } from './helpers/fakeBackend';

// ── Contexto simulado: lo mínimo que usa el carrito ───────────────────────────
const showToast = vi.fn();
const clearCart = vi.fn();
const store = {
  cartItems: [] as Array<Record<string, unknown>>,
  user: { isLoggedIn: false } as Record<string, unknown>,
};

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    cartItems: store.cartItems,
    cartSubtotalSoles: store.cartItems.reduce((a, i) => a + (i.priceSoles as number) * (i.quantity as number), 0),
    user: store.user,
    activeGarage: null,
    autoParts: [],
    removeFromCart: vi.fn(),
    updateCartQuantity: vi.fn(),
    toggleCartInstallation: vi.fn(),
    setIsGarageModalOpen: vi.fn(),
    setCurrentView: vi.fn(),
    addToCart: vi.fn(),
    navigateToTracking: vi.fn(),
    showToast,
    clearCart,
  }),
}));

const part = (priceSoles: number, quantity: number, extra: object = {}) => ({
  id: `p-${priceSoles}-${quantity}`, type: 'part', title: 'Pastillas de freno', skuOrCode: 'SKU-1',
  priceSoles, quantity, image: '', ...extra,
});

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coupons-cart-'));
  process.env.COUPONS_DATA_DIR = dir;
  store.cartItems = [part(200, 2)]; // S/ 400 en repuestos
  store.user = { isLoggedIn: false };
  showToast.mockClear();
  clearCart.mockClear();
  localStorage.clear();
  installFakeBackend();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  delete process.env.COUPONS_DATA_DIR;
  fs.rmSync(dir, { recursive: true, force: true });
});

const applyCoupon = async (code: string) => {
  fireEvent.change(screen.getByLabelText('Código de cupón'), { target: { value: code } });
  fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }));
};

const discountLine = () => screen.queryByText(/^Descuento /);

describe('carrito: cupones', () => {
  it('ya no aplica un cupón automáticamente', () => {
    render(<CartView />);
    expect(discountLine()).not.toBeInTheDocument();
    expect((screen.getByLabelText('Código de cupón') as HTMLInputElement).value).toBe('');
  });

  it('aplica un cupón válido y muestra el descuento calculado por el servidor', async () => {
    render(<CartView />);
    await applyCoupon('norcelis5');

    expect(await screen.findByText(/aplicado/)).toBeInTheDocument();
    expect(screen.getByText('Descuento NORCELIS5:')).toBeInTheDocument();
    expect(screen.getByText('-S/ 20')).toBeInTheDocument(); // 5% de 400
    expect(screen.getByRole('button', { name: 'Quitar cupón' })).toBeInTheDocument();
    expect(showToast).toHaveBeenCalledWith(expect.stringContaining('NORCELIS5'));
  });

  it('rechaza un código inexistente sin descontar nada', async () => {
    render(<CartView />);
    await applyCoupon('NOEXISTE');
    expect(await screen.findByRole('alert')).toHaveTextContent('Cupón inválido o expirado.');
    expect(discountLine()).not.toBeInTheDocument();
  });

  it('rechaza un cupón vencido, pausado o aún no vigente', async () => {
    createCoupon({ code: 'VIEJO', name: 'v', type: 'fixed', value: 10, appliesTo: ['part'], expiresAt: '2020-01-01T00:00:00Z' });
    createCoupon({ code: 'FUTURO', name: 'f', type: 'fixed', value: 10, appliesTo: ['part'], startsAt: '2099-01-01T00:00:00Z' });
    render(<CartView />);

    await applyCoupon('VIEJO');
    expect(await screen.findByRole('alert')).toHaveTextContent('ya venció');
    await applyCoupon('FUTURO');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('aún no está vigente'));
  });

  it('respeta la compra mínima y el tipo de producto', async () => {
    createCoupon({ code: 'MIN500', name: 'm', type: 'fixed', value: 50, appliesTo: ['part'], minPurchaseSoles: 500 });
    createCoupon({ code: 'SOLOSERV', name: 's', type: 'fixed', value: 50, appliesTo: ['service'] });
    render(<CartView />);

    await applyCoupon('MIN500');
    expect(await screen.findByRole('alert')).toHaveTextContent('Compra mínima de S/ 500.00');
    await applyCoupon('SOLOSERV');
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('no aplica a los productos'));
  });

  it('permite quitar el cupón', async () => {
    render(<CartView />);
    await applyCoupon('NORCELIS5');
    await screen.findByText('Descuento NORCELIS5:');
    fireEvent.click(screen.getByRole('button', { name: 'Quitar cupón' }));
    expect(discountLine()).not.toBeInTheDocument();
  });

  it('revalida al cambiar el carrito: recalcula el descuento', async () => {
    const { rerender } = render(<CartView />);
    await applyCoupon('NORCELIS5');
    expect(await screen.findByText('-S/ 20')).toBeInTheDocument();

    store.cartItems = [part(200, 4)]; // 800 → 5% = 40
    rerender(<CartView />);
    expect(await screen.findByText('-S/ 40')).toBeInTheDocument();
  });

  it('revalida al cambiar el carrito: quita el cupón si deja de aplicar', async () => {
    createCoupon({ code: 'MIN300', name: 'm', type: 'fixed', value: 30, appliesTo: ['part'], minPurchaseSoles: 300 });
    const { rerender } = render(<CartView />);
    await applyCoupon('MIN300');
    await screen.findByText('Descuento MIN300:');

    store.cartItems = [part(100, 1)]; // baja de 300
    rerender(<CartView />);
    await waitFor(() => expect(discountLine()).not.toBeInTheDocument());
    expect(showToast).toHaveBeenCalledWith(expect.stringContaining('Se quitó el cupón MIN300'));
  });

  it('si el administrador pausa el cupón mientras el cliente compra, deja de aplicar', async () => {
    const { rerender } = render(<CartView />);
    await applyCoupon('NORCELIS5');
    await screen.findByText('Descuento NORCELIS5:');

    const c = listCoupons().find((x) => x.code === 'NORCELIS5')!;
    updateCoupon(c.id, { ...c, active: false });
    store.cartItems = [part(200, 3)];
    rerender(<CartView />);
    await waitFor(() => expect(discountLine()).not.toBeInTheDocument());
  });

  it('descuenta del total final', async () => {
    render(<CartView />);
    await applyCoupon('NORCELIS5');
    await screen.findByText('Descuento NORCELIS5:');
    // 400 - 20 = 380 (Cajamarca bajo S/ 500: flete por coordinar, no suma)
    expect(screen.getAllByText(/S\/ 380/).length).toBeGreaterThan(0);
  });

  it('al confirmar el pedido consume un uso y guarda el cupón en el pedido', async () => {
    render(<CartView />);
    await applyCoupon('NORCELIS5');
    await screen.findByText('Descuento NORCELIS5:');

    fireEvent.click(screen.getByRole('button', { name: /Transferencia/ }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Pedido & Transferir/ }));

    await waitFor(() => expect(clearCart).toHaveBeenCalled(), { timeout: 4000 });
    expect(listCoupons().find((c) => c.code === 'NORCELIS5')?.usedCount).toBe(1);

    const [order] = JSON.parse(localStorage.getItem('norcelis_placed_orders') || '[]');
    expect(order).toMatchObject({ couponCode: 'NORCELIS5', discountSoles: 20, totalSoles: 380 });
  });

  it('si el cupón se agota justo antes de confirmar, el pedido no se emite y se avisa', async () => {
    createCoupon({ code: 'ULTIMO', name: 'u', type: 'fixed', value: 25, appliesTo: ['part'], usageLimit: 1 });
    render(<CartView />);
    await applyCoupon('ULTIMO');
    await screen.findByText('Descuento ULTIMO:');

    // Otra persona usa el último cupón antes de que este cliente confirme
    redeemCoupon('ULTIMO', [{ type: 'part', priceSoles: 100, quantity: 1 }], null, 'OTRO-PEDIDO');

    fireEvent.click(screen.getByRole('button', { name: /Transferencia/ }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Pedido & Transferir/ }));

    await waitFor(() => expect(discountLine()).not.toBeInTheDocument(), { timeout: 4000 });
    expect(clearCart).not.toHaveBeenCalled();
    expect(localStorage.getItem('norcelis_placed_orders')).toBeNull();
    expect(showToast).toHaveBeenCalledWith(expect.stringContaining('límite de usos'));
    expect(listCoupons().find((c) => c.code === 'ULTIMO')?.usedCount).toBe(1); // solo el de la otra persona
  });

  it('límite por cliente: el mismo correo no puede usar el cupón dos veces', async () => {
    createCoupon({ code: 'UNAVEZ', name: 'u', type: 'fixed', value: 25, appliesTo: ['part'], perCustomerLimit: 1 });
    store.user = { isLoggedIn: true, email: 'ana@test.com', name: 'Ana', phone: '900000000' };

    render(<CartView />);
    await applyCoupon('UNAVEZ');
    await screen.findByText('Descuento UNAVEZ:');
    fireEvent.click(screen.getByRole('button', { name: /Transferencia/ }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Pedido & Transferir/ }));
    await waitFor(() => expect(clearCart).toHaveBeenCalled(), { timeout: 4000 });

    cleanup();
    render(<CartView />);
    await applyCoupon('UNAVEZ');
    expect(await screen.findByRole('alert')).toHaveTextContent('máximo de veces');
  });

  it('un cupón con límite por cliente pide identificarse si no hay correo ni DNI', async () => {
    createCoupon({ code: 'UNAVEZ', name: 'u', type: 'fixed', value: 25, appliesTo: ['part'], perCustomerLimit: 1 });
    render(<CartView />);
    await applyCoupon('UNAVEZ');
    expect(await screen.findByRole('alert')).toHaveTextContent('DNI/RUC o inicia sesión');
  });

  it('si el servidor no responde, no aplica ningún descuento', async () => {
    vi.stubGlobal('fetch', async () => { throw new Error('sin red'); });
    render(<CartView />);
    await applyCoupon('NORCELIS5');
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos validar el cupón');
    expect(discountLine()).not.toBeInTheDocument();
  });

  it('sin cupón, el pedido se confirma normalmente', async () => {
    render(<CartView />);
    fireEvent.click(screen.getByRole('button', { name: /Transferencia/ }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Confirmar Pedido & Transferir/ }));
    });
    await waitFor(() => expect(clearCart).toHaveBeenCalled(), { timeout: 4000 });
    const [order] = JSON.parse(localStorage.getItem('norcelis_placed_orders') || '[]');
    expect(order.couponCode).toBeUndefined();
    expect(order.totalSoles).toBe(400);
  });
});
