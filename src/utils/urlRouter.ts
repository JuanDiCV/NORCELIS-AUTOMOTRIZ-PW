import { ViewMode } from '../types';

export interface RouteState {
  view: ViewMode;
  vehicleId?: string;
  partSku?: string;
  category?: string;
  brand?: string;
  search?: string;
  trackingCode?: string;
  termsTab?: 'terms' | 'privacy' | 'warranty' | 'shipping';
  modal?: 'garage' | 'quote' | 'test-drive' | 'viewer-360' | 'pdf' | null;
}

export function parseCurrentUrl(): RouteState {
  if (typeof window === 'undefined') {
    return { view: 'home' };
  }

  const pathname = window.location.pathname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.toLowerCase();

  let modal: RouteState['modal'] = null;
  if (hash === '#garaje' || hash === '#garage') modal = 'garage';
  else if (hash === '#cotizar' || hash === '#quote') modal = 'quote';
  else if (hash === '#test-drive') modal = 'test-drive';
  else if (hash === '#visor-360' || hash === '#360') modal = 'viewer-360';
  else if (hash === '#documento-pdf' || hash === '#pdf') modal = 'pdf';

  // Specific routes
  if (pathname.startsWith('/repuesto/')) {
    const sku = window.location.pathname.split('/repuesto/')[1]?.split('?')[0]?.trim();
    return {
      view: 'part-pdp',
      partSku: sku ? decodeURIComponent(sku) : undefined,
      modal,
    };
  }

  if (pathname.startsWith('/vehiculo/')) {
    const id = window.location.pathname.split('/vehiculo/')[1]?.split('?')[0]?.trim();
    return {
      view: 'vehicle-pdp',
      vehicleId: id ? decodeURIComponent(id) : undefined,
      modal,
    };
  }

  if (pathname === '/repuestos' || pathname === '/autopartes' || pathname === '/catalogo-repuestos') {
    return {
      view: 'parts',
      category: searchParams.get('cat') || searchParams.get('categoria') || '',
      brand: searchParams.get('brand') || searchParams.get('marca') || '',
      search: searchParams.get('q') || searchParams.get('busqueda') || '',
      modal,
    };
  }

  if (pathname === '/vehiculos' || pathname === '/autos' || pathname === '/catalogo-autos') {
    return {
      view: 'cars',
      brand: searchParams.get('brand') || searchParams.get('marca') || '',
      category: searchParams.get('type') || searchParams.get('tipo') || '',
      search: searchParams.get('q') || '',
      modal,
    };
  }

  if (pathname === '/servicios' || pathname === '/taller') {
    return { view: 'services', modal };
  }

  if (pathname === '/carrito' || pathname === '/bolsa') {
    return { view: 'cart', modal };
  }

  if (pathname === '/favoritos' || pathname === '/wishlist') {
    return { view: 'wishlist', modal };
  }

  if (pathname === '/ingresar' || pathname === '/login' || pathname === '/registro') {
    return { view: 'login', modal };
  }

  if (pathname === '/plan-retoma' || pathname === '/retoma' || pathname === '/tasacion') {
    return { view: 'trade-in', modal };
  }

  if (pathname === '/financiamiento' || pathname === '/credito-vehicular') {
    return { view: 'financing', modal };
  }

  if (pathname === '/mi-cuenta' || pathname === '/cuenta' || pathname === '/perfil') {
    return { view: 'account', modal };
  }

  if (pathname === '/sedes' || pathname === '/concesionario' || pathname === '/ubicacion') {
    return { view: 'locations', modal };
  }

  if (pathname === '/libro-reclamaciones' || pathname === '/reclamaciones') {
    return { view: 'claims', modal };
  }

  if (pathname === '/nosotros' || pathname === '/quienes-somos') {
    return { view: 'about', modal };
  }

  if (
    pathname === '/portal-seguro-interno' ||
    pathname === '/sys-admin-norcelis' ||
    pathname === '/portal-gestion' ||
    pathname === '/admin' ||
    pathname === '/administrador'
  ) {
    return { view: 'admin', modal };
  }

  if (pathname === '/rastreo-pedido' || pathname === '/tracking' || pathname === '/seguimiento') {
    return {
      view: 'order-tracking',
      trackingCode: searchParams.get('code') || searchParams.get('orden') || '',
      modal,
    };
  }

  if (pathname === '/terminos-politicas' || pathname === '/terminos' || pathname === '/politicas') {
    const rawTab = searchParams.get('tab');
    const validTabs: Array<'terms' | 'privacy' | 'warranty' | 'shipping'> = ['terms', 'privacy', 'warranty', 'shipping'];
    const termsTab = validTabs.includes(rawTab as any) ? (rawTab as 'terms' | 'privacy' | 'warranty' | 'shipping') : 'terms';
    return {
      view: 'terms-policies',
      termsTab,
      modal,
    };
  }

  return { view: 'home', modal };
}

export function buildUrlForRoute(state: RouteState): string {
  let path = '/';
  const query = new URLSearchParams();

  switch (state.view) {
    case 'home':
      path = '/';
      break;
    case 'parts':
      path = '/repuestos';
      if (state.category) query.set('cat', state.category);
      if (state.brand) query.set('brand', state.brand);
      if (state.search) query.set('q', state.search);
      break;
    case 'part-pdp':
      path = `/repuesto/${encodeURIComponent(state.partSku || 'PART-TOY-BRK-01')}`;
      break;
    case 'cars':
      path = '/vehiculos';
      if (state.brand) query.set('brand', state.brand);
      if (state.category) query.set('type', state.category);
      if (state.search) query.set('q', state.search);
      break;
    case 'vehicle-pdp':
      path = `/vehiculo/${encodeURIComponent(state.vehicleId || 'veh-rav4-2025')}`;
      break;
    case 'services':
      path = '/servicios';
      break;
    case 'cart':
      path = '/carrito';
      break;
    case 'wishlist':
      path = '/favoritos';
      break;
    case 'login':
      path = '/ingresar';
      break;
    case 'trade-in':
      path = '/plan-retoma';
      break;
    case 'financing':
      path = '/financiamiento';
      break;
    case 'account':
      path = '/mi-cuenta';
      break;
    case 'locations':
      path = '/sedes';
      break;
    case 'claims':
      path = '/libro-reclamaciones';
      break;
    case 'about':
      path = '/nosotros';
      break;
    case 'admin':
      path = '/portal-seguro-interno';
      break;
    case 'order-tracking':
      path = '/rastreo-pedido';
      if (state.trackingCode) query.set('code', state.trackingCode);
      break;
    case 'terms-policies':
      path = '/terminos-politicas';
      if (state.termsTab) query.set('tab', state.termsTab);
      break;
    default:
      path = '/';
  }

  const queryString = query.toString();
  let fullUrl = queryString ? `${path}?${queryString}` : path;

  if (state.modal) {
    const modalHashes: Record<string, string> = {
      garage: '#garaje',
      quote: '#cotizar',
      'test-drive': '#test-drive',
      'viewer-360': '#visor-360',
      pdf: '#documento-pdf',
    };
    if (modalHashes[state.modal]) {
      fullUrl += modalHashes[state.modal];
    }
  }

  return fullUrl;
}
