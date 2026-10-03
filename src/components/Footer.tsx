import React from 'react';
import {
  Truck,
  ShieldCheck,
  BadgeCheck,
  Headset,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Mail,
  Lock,
  BookOpen,
  ArrowRight,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NorCelisLogo } from './NorCelisLogo';
import { SITE_CONFIG } from '../config/siteConfig';

type FooterLink = { label: string; onClick: () => void; highlight?: boolean };

const TRUST_ITEMS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Truck, title: 'Envíos a todo el Perú', text: 'Despacho con Shalom, Olva y Marvisur, con guía de seguimiento.' },
  { icon: ShieldCheck, title: 'Pago 100% seguro', text: 'Tarjetas, Yape, Plin y transferencias con cifrado SSL.' },
  { icon: BadgeCheck, title: 'Garantía certificada', text: 'Repuestos originales con respaldo de fábrica.' },
  { icon: Headset, title: 'Asesoría técnica', text: 'Validamos tu repuesto por placa o chasis antes de comprar.' },
];

const PAYMENT_METHODS = [
  { name: 'Yape', className: 'bg-[#742284] text-white' },
  { name: 'Plin', className: 'bg-[#00D2D3] text-[#0f2430]' },
  { name: 'VISA', className: 'bg-white text-[#1a1f71] italic' },
  { name: 'Mastercard', className: 'bg-white text-[#1a1f71]' },
  { name: 'AMEX', className: 'bg-[#002663] text-white' },
  { name: 'Diners', className: 'bg-white text-[#004a97]' },
  { name: 'BCP', className: 'bg-[#002A8F] text-white' },
  { name: 'BBVA', className: 'bg-[#004481] text-white' },
];

const SHIPPING_PARTNERS = [
  { name: 'Shalom', className: 'bg-[#E31B23] text-white' },
  { name: 'Olva Courier', className: 'bg-[#FFCC00] text-[#1E1E1E]' },
  { name: 'Marvisur', className: 'bg-[#0C3B78] text-white' },
];

const SOCIALS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/norcelisautomotriz',
    hover: 'hover:bg-[#1877F2]',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/norcelis_automotriz/',
    hover: 'hover:bg-[#dc2743]',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@norcelis.automotriz',
    hover: 'hover:bg-black',
    path: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.88-4.47V8.65a8.28 8.28 0 0 0 3.89 1.47v-3.43z',
  },
];

const LinkColumn: React.FC<{ title: string; links: FooterLink[] }> = ({ title, links }) => (
  <nav aria-label={title}>
    <h4 className="text-sm font-bold text-white mb-4">{title}</h4>
    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={link.label}>
          <button
            type="button"
            onClick={link.onClick}
            className={`text-sm text-left transition-colors cursor-pointer hover:text-[#F07F00] ${
              link.highlight ? 'text-[#F07F00] font-semibold' : 'text-white/70'
            }`}
          >
            {link.label}
          </button>
        </li>
      ))}
    </ul>
  </nav>
);

export const Footer: React.FC = () => {
  const {
    user,
    setCurrentView,
    showToast,
    setIsAdminUnlocked,
    navigateToTracking,
    navigateToTerms,
    navigateToPartsCatalog,
    setIsGarageModalOpen,
  } = useApp();

  const { company } = SITE_CONFIG;
  const year = new Date().getFullYear();

  const shopLinks: FooterLink[] = [
    { label: 'Autopartes y accesorios', onClick: () => navigateToPartsCatalog('todos') },
    { label: 'Vehículos nuevos y seminuevos', onClick: () => setCurrentView('cars') },
    { label: 'Servicios de taller', onClick: () => setCurrentView('services') },
    { label: 'Alquiler de maquinaria', onClick: () => setCurrentView('machinery') },
    { label: 'Plan Retoma', onClick: () => setCurrentView('trade-in') },
    { label: 'Financiamiento y cuotas', onClick: () => setCurrentView('financing') },
  ];

  const accountLinks: FooterLink[] = [
    { label: user.isLoggedIn ? 'Mi cuenta' : 'Iniciar sesión o registrarme', onClick: () => setCurrentView(user.isLoggedIn ? 'account' : 'login') },
    { label: 'Rastrear mi pedido', onClick: () => navigateToTracking() },
    { label: 'Lista de deseos', onClick: () => setCurrentView('wishlist') },
    { label: 'Mi garaje virtual', onClick: () => setIsGarageModalOpen(true) },
    { label: 'Carrito de compras', onClick: () => setCurrentView('cart') },
  ];

  const helpLinks: FooterLink[] = [
    { label: 'Sedes y horarios', onClick: () => setCurrentView('locations') },
    { label: 'Sobre Nor Celis', onClick: () => setCurrentView('about') },
    { label: 'Envíos y entregas', onClick: () => navigateToTerms('shipping') },
    { label: 'Cambios y devoluciones', onClick: () => navigateToTerms('warranty') },
  ];

  const legalLinks: FooterLink[] = [
    { label: 'Términos y condiciones', onClick: () => navigateToTerms('terms') },
    { label: 'Políticas generales de venta', onClick: () => navigateToTerms('sales') },
    { label: 'Garantías, reclamos y devoluciones', onClick: () => navigateToTerms('warranty') },
    { label: 'Política de privacidad y datos (Ley N° 29733)', onClick: () => navigateToTerms('privacy') },
    { label: 'Política de cookies', onClick: () => navigateToTerms('cookies') },
    { label: 'Libro de Reclamaciones', onClick: () => setCurrentView('claims'), highlight: true },
  ];

  return (
    <footer className="mt-16 sm:mt-24 text-white">
      {/* 1. Franja de confianza */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {TRUST_ITEMS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F07F00]/10 text-[#F07F00] flex items-center justify-center shrink-0">
                <Icon size={24} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#212955]">{title}</div>
                <p className="text-[13px] text-[#525866] leading-snug mt-0.5">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Navegación principal */}
      <div className="bg-[#181e40]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-2 lg:col-span-4 space-y-5">
            <button type="button" onClick={() => setCurrentView('home')} className="cursor-pointer" aria-label="Ir al inicio">
              <NorCelisLogo variant="full" theme="dark" size="custom" className="h-12 w-auto" />
            </button>
            <p className="text-sm text-white/70 leading-relaxed max-w-sm">
              Repuestos, accesorios y servicios para tu vehículo. Atendemos desde Cajamarca a todo el Perú con
              asesoría técnica y despacho a nivel nacional.
            </p>

            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#F07F00] shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  <strong className="text-white/90">{company.branch.name}:</strong> {company.address}, {company.city}
                  <br />
                  <span className="text-white/55">
                    Sede principal: {company.headquarters.address}, {company.headquarters.district}, {company.headquarters.city}
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={18} className="text-[#F07F00] shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  {company.businessHours}
                  <br />
                  {company.saturdayHours}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#F07F00] shrink-0" aria-hidden="true" />
                <a href={`tel:${company.primaryPhone.replace(/[^\d+]/g, '')}`} className="hover:text-white transition-colors">
                  {company.primaryPhone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle size={18} className="text-[#25D366] shrink-0" aria-hidden="true" />
                <a
                  href={`https://wa.me/${company.whatsappPhone}?text=Hola%20Nor%20Celis,%20deseo%20asesoria%20personalizada`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp {company.whatsappFormatted}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#F07F00] shrink-0" aria-hidden="true" />
                <a href={`mailto:${company.salesEmail}`} className="hover:text-white transition-colors">
                  {company.salesEmail}
                </a>
              </li>
            </ul>

            <div className="flex items-center gap-2.5 pt-1">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.label} de Nor Celis Automotriz`}
                  className={`w-10 h-10 rounded-full bg-white/10 ${s.hover} text-white flex items-center justify-center transition-colors`}
                >
                  <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <LinkColumn title="Compra con nosotros" links={shopLinks} />
          </div>
          <div className="lg:col-span-2">
            <LinkColumn title="Mi cuenta" links={accountLinks} />
          </div>
          <div className="lg:col-span-2">
            <LinkColumn title="Ayuda y atención" links={helpLinks} />
          </div>
          <div className="col-span-2 lg:col-span-2">
            <LinkColumn title="Información legal" links={legalLinks} />
          </div>
        </div>
      </div>

      {/* 3. Medios de pago, envíos y Libro de Reclamaciones */}
      <div className="bg-[#141a38] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-3">
            <h4 className="text-sm font-bold text-white">Medios de pago</h4>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((m) => (
                <span
                  key={m.name}
                  className={`h-8 px-3 rounded-md flex items-center text-xs font-extrabold shadow-sm ${m.className}`}
                >
                  {m.name}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white">Envíos con</h4>
            <div className="flex flex-wrap gap-2">
              {SHIPPING_PARTNERS.map((m) => (
                <span
                  key={m.name}
                  className={`h-8 px-3 rounded-md flex items-center text-xs font-extrabold shadow-sm ${m.className}`}
                >
                  {m.name}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <button
              type="button"
              onClick={() => setCurrentView('claims')}
              className="group w-full text-left flex items-center gap-4 p-4 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/15 hover:border-[#F07F00]/60 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-[#F07F00] text-white flex items-center justify-center shrink-0">
                <BookOpen size={24} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">Libro de Reclamaciones</div>
                <p className="text-xs text-white/65 leading-snug mt-0.5">
                  Conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571).
                </p>
              </div>
              <ArrowRight
                size={18}
                className="text-[#F07F00] group-hover:translate-x-1 transition-transform shrink-0"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Datos legales de la empresa */}
      <div className="bg-[#101530]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5 text-xs text-white/60 leading-relaxed">
          <p>
            Los precios publicados incluyen IGV y están expresados en soles (S/), salvo indicación contraria. Las
            imágenes son referenciales. El stock, los precios y las promociones están sujetos a disponibilidad y pueden
            variar sin previo aviso; las promociones son válidas hasta agotar stock o hasta la fecha indicada. La
            compatibilidad de cada repuesto debe validarse con tu placa o chasis antes de la compra. Emitimos
            comprobantes de pago electrónicos (boleta o factura).
          </p>

          <div className="pt-5 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div>
                <span className="font-semibold text-white/85">{company.legalName}</span>
                <span className="mx-2 text-white/30">•</span>
                RUC {company.ruc}
              </div>
              <div>
                Nombre comercial: {company.tradeName}. Domicilio fiscal: {company.headquarters.address},{' '}
                {company.headquarters.district}, {company.headquarters.city}, {company.country}
              </div>
              <div>
                © {year} {company.legalName}. Todos los derechos reservados.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <Lock size={14} aria-hidden="true" />
                Sitio seguro (SSL)
              </span>
              {user.isLoggedIn && user.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminUnlocked(true);
                    setCurrentView('admin');
                    showToast('Accediendo al Panel de Administración');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/85 hover:text-white transition-colors cursor-pointer font-semibold"
                >
                  <Settings size={14} aria-hidden="true" />
                  Panel Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
