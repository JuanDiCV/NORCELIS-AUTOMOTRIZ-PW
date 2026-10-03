import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AdminApiError,
  adminCouponRedemptions,
  adminCreateCoupon,
  adminDeleteCoupon,
  adminListCoupons,
  adminLogin,
  adminUpdateCoupon,
  clearAdminApiToken,
  type CouponRedemptionRow,
} from '../../services/couponsService';
import {
  COUPON_ITEM_KINDS,
  COUPON_ITEM_KIND_LABELS,
  COUPON_STATUS_LABELS,
  describeCouponBenefit,
  evaluateCoupon,
  getCouponStatus,
  isoToLimaLocal,
  limaLocalToIso,
  validateCouponInput,
  type CouponInput,
  type CouponItemKind,
  type CouponStatus,
  type CouponWithStats,
} from '../../utils/couponLogic';

type Phase = 'loading' | 'login' | 'not_configured' | 'ready' | 'error';

/** Campos del formulario como texto (lo que escribe la persona). */
interface Draft {
  code: string;
  name: string;
  campaign: string;
  description: string;
  type: 'percent' | 'fixed';
  value: string;
  maxDiscountSoles: string;
  minPurchaseSoles: string;
  startsLocal: string;
  expiresLocal: string;
  usageLimit: string;
  perCustomerLimit: string;
  appliesTo: CouponItemKind[];
  active: boolean;
}

const EMPTY_DRAFT: Draft = {
  code: '', name: '', campaign: '', description: '', type: 'percent', value: '10',
  maxDiscountSoles: '', minPurchaseSoles: '', startsLocal: '', expiresLocal: '',
  usageLimit: '', perCustomerLimit: '', appliesTo: ['part'], active: true,
};

const STATUS_STYLES: Record<CouponStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  expired: 'bg-gray-100 text-gray-600 border-gray-200',
  exhausted: 'bg-amber-50 text-amber-700 border-amber-200',
  paused: 'bg-gray-100 text-gray-500 border-gray-200',
};

const toDraft = (c: CouponWithStats): Draft => ({
  code: c.code,
  name: c.name,
  campaign: c.campaign,
  description: c.description,
  type: c.type,
  value: String(c.value),
  maxDiscountSoles: c.maxDiscountSoles === null ? '' : String(c.maxDiscountSoles),
  minPurchaseSoles: c.minPurchaseSoles === null ? '' : String(c.minPurchaseSoles),
  startsLocal: isoToLimaLocal(c.startsAt),
  expiresLocal: isoToLimaLocal(c.expiresAt),
  usageLimit: c.usageLimit === null ? '' : String(c.usageLimit),
  perCustomerLimit: c.perCustomerLimit === null ? '' : String(c.perCustomerLimit),
  appliesTo: c.appliesTo,
  active: c.active,
});

const draftToInput = (d: Draft): unknown => ({
  code: d.code,
  name: d.name,
  campaign: d.campaign,
  description: d.description,
  type: d.type,
  value: d.value === '' ? NaN : Number(d.value),
  maxDiscountSoles: d.maxDiscountSoles,
  minPurchaseSoles: d.minPurchaseSoles,
  startsAt: limaLocalToIso(d.startsLocal),
  expiresAt: limaLocalToIso(d.expiresLocal),
  usageLimit: d.usageLimit,
  perCustomerLimit: d.perCustomerLimit,
  appliesTo: d.appliesTo,
  active: d.active,
});

const fmtDate = (iso: string | null): string =>
  iso
    ? new Date(iso).toLocaleString('es-PE', { timeZone: 'America/Lima', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

/** Código aleatorio legible (sin 0/O/1/I). */
const generateCode = (): string => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return 'NC' + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
};

/** "YYYY-MM-DDT23:59" (hora de Lima) a N días desde hoy, o fin del mes actual. */
const limaEndOfDay = (daysFromNow: number | 'month'): string => {
  const lima = new Date(Date.now() - 5 * 3600 * 1000);
  const y = lima.getUTCFullYear();
  const m = lima.getUTCMonth();
  const target =
    daysFromNow === 'month'
      ? new Date(Date.UTC(y, m + 1, 0))
      : new Date(Date.UTC(y, m, lima.getUTCDate() + daysFromNow));
  return `${target.toISOString().slice(0, 10)}T23:59`;
};

const inputCls =
  'w-full min-h-[40px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#212955] focus:outline-none focus:border-[#212955] focus:bg-white';
const labelCls = 'block text-xs font-bold text-[#212955] mb-1';

export const CouponsManager: React.FC = () => {
  const { showToast } = useApp();

  const [phase, setPhase] = useState<Phase>('loading');
  const [coupons, setCoupons] = useState<CouponWithStats[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CouponStatus>('all');
  const [campaignFilter, setCampaignFilter] = useState('all');

  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<CouponWithStats | null>(null);
  const [redemptionsOf, setRedemptionsOf] = useState<{ coupon: CouponWithStats; rows: CouponRedemptionRow[] | null } | null>(null);

  const load = useCallback(async () => {
    setPhase((p) => (p === 'ready' ? p : 'loading'));
    try {
      setCoupons(await adminListCoupons());
      setPhase('ready');
    } catch (err) {
      const e = err as AdminApiError;
      if (e.code === 'admin_not_configured') setPhase('not_configured');
      else if (e.status === 401) setPhase('login');
      else {
        setErrorMsg(e.message || 'No pudimos cargar los cupones.');
        setPhase('error');
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Cierra los diálogos con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (editing && !saving) setEditing(null);
      else if (toDelete) setToDelete(null);
      else if (redemptionsOf) setRedemptionsOf(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing, saving, toDelete, redemptionsOf]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      await adminLogin(password);
      setPassword('');
      await load();
    } catch (err) {
      setLoginError((err as AdminApiError).message);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    clearAdminApiToken();
    setCoupons([]);
    setPhase('login');
  };

  /** Si la sesión vence en medio de una acción, vuelve al acceso. */
  const handleActionError = (err: unknown): string => {
    const e = err as AdminApiError;
    if (e.status === 401) {
      setEditing(null);
      setPhase('login');
      return 'Tu sesión venció. Ingresa nuevamente la clave.';
    }
    return e.message || 'Ocurrió un error inesperado.';
  };

  // ── Derivados ───────────────────────────────────────────────────────────────

  const now = new Date();
  const rows = useMemo(
    () => coupons.map((c) => ({ coupon: c, status: getCouponStatus(c, new Date()) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coupons]
  );
  const campaigns = useMemo(
    () => Array.from(new Set(coupons.map((c) => c.campaign).filter(Boolean))).sort(),
    [coupons]
  );
  const filtered = rows.filter(({ coupon, status }) => {
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    if (campaignFilter !== 'all' && coupon.campaign !== campaignFilter) return false;
    const q = search.trim().toLowerCase();
    return !q || `${coupon.code} ${coupon.name} ${coupon.campaign}`.toLowerCase().includes(q);
  });
  const countBy = (s: CouponStatus) => rows.filter((r) => r.status === s).length;
  const totalRedeemed = coupons.reduce((acc, c) => acc + c.usedCount, 0);

  // ── Acciones ────────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditing({ id: null, draft: { ...EMPTY_DRAFT, code: generateCode() } });
    setFieldErrors({});
    setFormError('');
  };
  const openEdit = (c: CouponWithStats) => {
    setEditing({ id: c.id, draft: toDraft(c) });
    setFieldErrors({});
    setFormError('');
  };
  const openDuplicate = (c: CouponWithStats) => {
    setEditing({ id: null, draft: { ...toDraft(c), code: generateCode(), name: `${c.name} (copia)` } });
    setFieldErrors({});
    setFormError('');
  };

  const setDraft = (patch: Partial<Draft>) => setEditing((prev) => (prev ? { ...prev, draft: { ...prev.draft, ...patch } } : prev));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    const parsed = validateCouponInput(draftToInput(editing.draft));
    if (!parsed.ok) {
      setFieldErrors(parsed.errors);
      setFormError('Revisa los campos marcados.');
      return;
    }

    setSaving(true);
    setFieldErrors({});
    setFormError('');
    try {
      const input: CouponInput = parsed.value;
      const saved = editing.id ? await adminUpdateCoupon(editing.id, input) : await adminCreateCoupon(input);
      setCoupons((prev) => (editing.id ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev]));
      showToast(editing.id ? `Cupón ${saved.code} actualizado` : `Cupón ${saved.code} creado`);
      setEditing(null);
    } catch (err) {
      const apiErr = err as AdminApiError;
      if (apiErr.fieldErrors) setFieldErrors(apiErr.fieldErrors);
      setFormError(handleActionError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (c: CouponWithStats) => {
    try {
      const saved = await adminUpdateCoupon(c.id, { ...c, active: !c.active });
      setCoupons((prev) => prev.map((x) => (x.id === saved.id ? saved : x)));
      showToast(`Cupón ${saved.code} ${saved.active ? 'activado' : 'pausado'}`);
    } catch (err) {
      showToast(handleActionError(err));
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await adminDeleteCoupon(toDelete.id);
      setCoupons((prev) => prev.filter((c) => c.id !== toDelete.id));
      showToast(`Cupón ${toDelete.code} eliminado`);
      setToDelete(null);
    } catch (err) {
      showToast(handleActionError(err));
      setToDelete(null);
    }
  };

  const openRedemptions = async (c: CouponWithStats) => {
    setRedemptionsOf({ coupon: c, rows: null });
    try {
      const list = await adminCouponRedemptions(c.id);
      setRedemptionsOf({ coupon: c, rows: list });
    } catch (err) {
      showToast(handleActionError(err));
      setRedemptionsOf(null);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast(`Código ${code} copiado`);
    } catch {
      showToast('No se pudo copiar el código');
    }
  };

  // ── Vista previa del ahorro en el formulario ────────────────────────────────

  const preview = useMemo(() => {
    if (!editing) return null;
    const parsed = validateCouponInput(draftToInput({ ...editing.draft, startsLocal: '', expiresLocal: '' }));
    if (!parsed.ok) return null;
    const kind = parsed.value.appliesTo[0];
    const sample = 500;
    const result = evaluateCoupon(
      { ...parsed.value, id: 'preview', createdAt: '', updatedAt: '', usedCount: 0, perCustomerLimit: null, usageLimit: null },
      [{ type: kind, priceSoles: sample, quantity: 1 }]
    );
    return result.ok
      ? `Con una compra de S/ ${sample} en ${COUPON_ITEM_KIND_LABELS[kind].toLowerCase()}, el cliente ahorra S/ ${result.discountSoles.toFixed(2)}.`
      : `Con una compra de S/ ${sample}: ${result.reason}`;
  }, [editing]);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return <div className="bg-white p-8 rounded-2xl border border-gray-200 text-sm text-gray-500">Cargando cupones…</div>;
  }

  if (phase === 'not_configured') {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-amber-200 space-y-3 max-w-2xl">
        <h2 className="font-headline font-bold text-base text-[#212955] flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-600">lock</span> Falta configurar la clave de administración
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Los cupones se guardan y validan en el servidor, por eso este panel necesita una clave que solo exista allí. Agrega
          esta línea al archivo <code className="bg-gray-100 px-1.5 py-0.5 rounded">.env</code> del servidor y reinícialo:
        </p>
        <pre className="bg-gray-900 text-emerald-300 text-xs p-3 rounded-xl overflow-x-auto">ADMIN_PASSWORD="una-clave-larga-y-privada"</pre>
        <p className="text-xs text-gray-500">Mínimo 10 caracteres. No la compartas ni la subas a GitHub.</p>
        <button type="button" onClick={() => void load()} className="bg-[#212955] text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer">
          Reintentar
        </button>
      </div>
    );
  }

  if (phase === 'login') {
    return (
      <form onSubmit={handleLogin} className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 space-y-4 max-w-md">
        <div>
          <h2 className="font-headline font-bold text-base text-[#212955] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F07F00]">key</span> Acceso a Cupones
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Ingresa la clave de administración del servidor. Es distinta del PIN de este panel.
          </p>
        </div>
        <div>
          <label htmlFor="coupon-admin-password" className={labelCls}>Clave de administración</label>
          <input
            id="coupon-admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            required
          />
        </div>
        {loginError && <p role="alert" className="text-xs text-red-600 font-medium">{loginError}</p>}
        <button
          type="submit"
          disabled={loggingIn}
          className="bg-[#F07F00] hover:bg-[#d97300] disabled:opacity-60 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
        >
          {loggingIn ? 'Verificando…' : 'Ingresar'}
        </button>
      </form>
    );
  }

  if (phase === 'error') {
    return (
      <div className="bg-white p-6 rounded-2xl border border-red-200 space-y-3 max-w-xl">
        <p className="text-sm text-red-700">{errorMsg}</p>
        <button type="button" onClick={() => void load()} className="bg-[#212955] text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer">
          Reintentar
        </button>
      </div>
    );
  }

  const draft = editing?.draft;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#9D9D9C]/30 shadow-xs">
        <div>
          <h2 className="font-headline font-bold text-base text-[#212955]">Cupones de Descuento &amp; Campañas</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Crea códigos, define su vigencia y límites de uso. El servidor valida cada cupón al comprar.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={handleLogout} className="text-xs font-bold text-gray-600 hover:text-[#212955] px-3 py-2 rounded-xl hover:bg-gray-100 cursor-pointer">
            Cerrar sesión de cupones
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="bg-[#F07F00] hover:bg-[#d97300] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Nuevo cupón</span>
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Activos', value: countBy('active'), tone: 'text-emerald-700' },
          { label: 'Programados', value: countBy('scheduled'), tone: 'text-blue-700' },
          { label: 'Vencidos / agotados', value: countBy('expired') + countBy('exhausted'), tone: 'text-amber-700' },
          { label: 'Canjes totales', value: totalRedeemed, tone: 'text-[#212955]' },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-2xl border border-gray-200">
            <div className={`text-2xl font-extrabold ${s.tone}`}>{s.value}</div>
            <div className="text-[11px] font-semibold text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código, nombre o campaña"
          aria-label="Buscar cupones"
          className={`${inputCls} md:flex-1`}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} aria-label="Filtrar por estado" className={`${inputCls} md:w-48`}>
          <option value="all">Todos los estados</option>
          {(Object.keys(COUPON_STATUS_LABELS) as CouponStatus[]).map((s) => (
            <option key={s} value={s}>{COUPON_STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select value={campaignFilter} onChange={(e) => setCampaignFilter(e.target.value)} aria-label="Filtrar por campaña" className={`${inputCls} md:w-56`}>
          <option value="all">Todas las campañas</option>
          {campaigns.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-dashed border-gray-300 text-center text-sm text-gray-500">
          {coupons.length === 0 ? 'Aún no hay cupones. Crea el primero con “Nuevo cupón”.' : 'Ningún cupón coincide con los filtros.'}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[860px]">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Descuento</th>
                <th className="px-4 py-3">Vigencia (hora de Lima)</th>
                <th className="px-4 py-3">Usos</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(({ coupon: c, status }) => (
                <tr key={c.id} className={status === 'paused' || status === 'expired' ? 'bg-gray-50/60' : ''}>
                  <td className="px-4 py-3 align-top">
                    <button type="button" onClick={() => void copyCode(c.code)} title="Copiar código" className="font-mono font-extrabold text-[#212955] hover:text-[#F07F00] cursor-pointer">
                      {c.code}
                    </button>
                    <div className="text-xs text-gray-600">{c.name}</div>
                    {c.campaign && <div className="text-[11px] text-[#F07F00] font-semibold">{c.campaign}</div>}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-bold text-[#212955]">{describeCouponBenefit(c)}</div>
                    <div className="text-[11px] text-gray-500">
                      {c.appliesTo.map((k) => COUPON_ITEM_KIND_LABELS[k]).join(', ')}
                      {c.minPurchaseSoles !== null && ` · mín. S/ ${c.minPurchaseSoles}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-gray-600">
                    <div>Desde: {fmtDate(c.startsAt)}</div>
                    <div>Hasta: {c.expiresAt ? fmtDate(c.expiresAt) : 'Sin vencimiento'}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-semibold text-[#212955]">
                      {c.usedCount}{c.usageLimit !== null ? ` / ${c.usageLimit}` : ''}
                    </div>
                    {c.usageLimit !== null && (
                      <div className="mt-1 h-1.5 w-24 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#F07F00]" style={{ width: `${Math.min(100, (c.usedCount / c.usageLimit) * 100)}%` }} />
                      </div>
                    )}
                    {c.perCustomerLimit !== null && <div className="text-[11px] text-gray-500 mt-1">Máx. {c.perCustomerLimit} por cliente</div>}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLES[status]}`}>
                      {COUPON_STATUS_LABELS[status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => void handleToggle(c)} className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer">
                        {c.active ? 'Pausar' : 'Activar'}
                      </button>
                      {[
                        { icon: 'edit', label: 'Editar', onClick: () => openEdit(c) },
                        { icon: 'content_copy', label: 'Duplicar', onClick: () => openDuplicate(c) },
                        { icon: 'receipt_long', label: 'Ver canjes', onClick: () => void openRedemptions(c) },
                        { icon: 'delete', label: 'Eliminar', onClick: () => setToDelete(c) },
                      ].map((a) => (
                        <button
                          key={a.icon}
                          type="button"
                          onClick={a.onClick}
                          title={a.label}
                          aria-label={`${a.label} ${c.code}`}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#212955] text-gray-600 hover:text-white cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">{a.icon}</span>
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[11px] text-gray-500">
        Estado calculado al {now.toLocaleString('es-PE', { timeZone: 'America/Lima' })}. Los usos se cuentan cuando el cliente confirma su pedido.
      </p>

      {/* Formulario crear / editar */}
      {editing && draft && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-start sm:items-center justify-center p-3 overflow-y-auto" role="dialog" aria-modal="true" aria-label={editing.id ? 'Editar cupón' : 'Nuevo cupón'}>
          <form onSubmit={handleSave} className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4 flex flex-col max-h-[95vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-headline font-bold text-base text-[#212955]">{editing.id ? 'Editar cupón' : 'Nuevo cupón'}</h3>
              <button type="button" onClick={() => !saving && setEditing(null)} aria-label="Cerrar" className="text-gray-500 hover:text-[#212955] cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cp-code" className={labelCls}>Código *</label>
                  <div className="flex gap-2">
                    <input id="cp-code" value={draft.code} onChange={(e) => setDraft({ code: e.target.value.toUpperCase() })} maxLength={24} className={`${inputCls} font-mono uppercase`} />
                    <button type="button" onClick={() => setDraft({ code: generateCode() })} className="px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#212955] cursor-pointer whitespace-nowrap">
                      Generar
                    </button>
                  </div>
                  <FieldError msg={fieldErrors.code} />
                  <p className="text-[11px] text-gray-500 mt-1">Letras, números y guion. El cliente lo escribe en el carrito.</p>
                </div>
                <div>
                  <label htmlFor="cp-name" className={labelCls}>Nombre interno *</label>
                  <input id="cp-name" value={draft.name} onChange={(e) => setDraft({ name: e.target.value })} maxLength={80} placeholder="Ej. Cyber Wow – frenos" className={inputCls} />
                  <FieldError msg={fieldErrors.name} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cp-campaign" className={labelCls}>Campaña</label>
                  <input id="cp-campaign" list="cp-campaigns" value={draft.campaign} onChange={(e) => setDraft({ campaign: e.target.value })} maxLength={80} placeholder="Ej. Cyber Wow Octubre" className={inputCls} />
                  <datalist id="cp-campaigns">{campaigns.map((c) => <option key={c} value={c} />)}</datalist>
                </div>
                <div>
                  <label htmlFor="cp-desc" className={labelCls}>Descripción</label>
                  <input id="cp-desc" value={draft.description} onChange={(e) => setDraft({ description: e.target.value })} maxLength={240} placeholder="Nota interna (opcional)" className={inputCls} />
                </div>
              </div>

              <fieldset className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <legend className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2">Descuento</legend>
                <div>
                  <label htmlFor="cp-type" className={labelCls}>Tipo</label>
                  <select id="cp-type" value={draft.type} onChange={(e) => setDraft({ type: e.target.value as Draft['type'] })} className={inputCls}>
                    <option value="percent">Porcentaje (%)</option>
                    <option value="fixed">Monto fijo (S/)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="cp-value" className={labelCls}>{draft.type === 'percent' ? 'Porcentaje *' : 'Monto en soles *'}</label>
                  <input id="cp-value" type="number" min="0" step="0.01" inputMode="decimal" value={draft.value} onChange={(e) => setDraft({ value: e.target.value })} className={inputCls} />
                  <FieldError msg={fieldErrors.value} />
                </div>
                {draft.type === 'percent' && (
                  <div>
                    <label htmlFor="cp-max" className={labelCls}>Tope de descuento (S/)</label>
                    <input id="cp-max" type="number" min="0" step="0.01" inputMode="decimal" value={draft.maxDiscountSoles} onChange={(e) => setDraft({ maxDiscountSoles: e.target.value })} placeholder="Sin tope" className={inputCls} />
                    <FieldError msg={fieldErrors.maxDiscountSoles} />
                  </div>
                )}
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2">Vigencia (hora de Lima)</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cp-start" className={labelCls}>Inicia</label>
                    <input id="cp-start" type="datetime-local" value={draft.startsLocal} onChange={(e) => setDraft({ startsLocal: e.target.value })} className={inputCls} />
                    <FieldError msg={fieldErrors.startsAt} />
                    <p className="text-[11px] text-gray-500 mt-1">Vacío = disponible desde ya.</p>
                  </div>
                  <div>
                    <label htmlFor="cp-end" className={labelCls}>Vence</label>
                    <input id="cp-end" type="datetime-local" value={draft.expiresLocal} onChange={(e) => setDraft({ expiresLocal: e.target.value })} className={inputCls} />
                    <FieldError msg={fieldErrors.expiresAt} />
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {[
                        { label: '+7 días', v: limaEndOfDay(7) },
                        { label: '+30 días', v: limaEndOfDay(30) },
                        { label: 'Fin de mes', v: limaEndOfDay('month') },
                        { label: 'Sin vencimiento', v: '' },
                      ].map((p) => (
                        <button key={p.label} type="button" onClick={() => setDraft({ expiresLocal: p.v })} className="text-[11px] font-bold px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer">
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </fieldset>

              <fieldset className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <legend className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2">Condiciones y límites</legend>
                <div>
                  <label htmlFor="cp-min" className={labelCls}>Compra mínima (S/)</label>
                  <input id="cp-min" type="number" min="0" step="0.01" inputMode="decimal" value={draft.minPurchaseSoles} onChange={(e) => setDraft({ minPurchaseSoles: e.target.value })} placeholder="Sin mínimo" className={inputCls} />
                  <FieldError msg={fieldErrors.minPurchaseSoles} />
                </div>
                <div>
                  <label htmlFor="cp-usage" className={labelCls}>Usos totales</label>
                  <input id="cp-usage" type="number" min="1" step="1" inputMode="numeric" value={draft.usageLimit} onChange={(e) => setDraft({ usageLimit: e.target.value })} placeholder="Ilimitado" className={inputCls} />
                  <FieldError msg={fieldErrors.usageLimit} />
                </div>
                <div>
                  <label htmlFor="cp-percust" className={labelCls}>Usos por cliente</label>
                  <input id="cp-percust" type="number" min="1" step="1" inputMode="numeric" value={draft.perCustomerLimit} onChange={(e) => setDraft({ perCustomerLimit: e.target.value })} placeholder="Ilimitado" className={inputCls} />
                  <FieldError msg={fieldErrors.perCustomerLimit} />
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2">Aplica a *</legend>
                <div className="flex flex-wrap gap-2">
                  {COUPON_ITEM_KINDS.map((k) => {
                    const checked = draft.appliesTo.includes(k);
                    return (
                      <label key={k} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${checked ? 'bg-[#212955] text-white border-[#212955]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setDraft({ appliesTo: checked ? draft.appliesTo.filter((x) => x !== k) : [...draft.appliesTo, k] })}
                          className="accent-[#F07F00]"
                        />
                        {COUPON_ITEM_KIND_LABELS[k]}
                      </label>
                    );
                  })}
                </div>
                <FieldError msg={fieldErrors.appliesTo} />
              </fieldset>

              <label className="flex items-center gap-2 text-sm font-semibold text-[#212955] cursor-pointer">
                <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ active: e.target.checked })} className="accent-[#F07F00] w-4 h-4" />
                Cupón activo (desmárcalo para dejarlo pausado)
              </label>

              {preview && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl p-3">{preview}</div>}
              {formError && <p role="alert" className="text-xs text-red-600 font-semibold">{formError}</p>}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button type="button" disabled={saving} onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#F07F00] hover:bg-[#d97300] disabled:opacity-60 cursor-pointer">
                {saving ? 'Guardando…' : editing.id ? 'Guardar cambios' : 'Crear cupón'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmar eliminación */}
      {toDelete && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-3" role="alertdialog" aria-modal="true" aria-label="Eliminar cupón">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-headline font-bold text-base text-[#212955]">¿Eliminar el cupón {toDelete.code}?</h3>
            <p className="text-sm text-gray-600">
              Dejará de funcionar de inmediato.{' '}
              {toDelete.usedCount > 0 && `Ya se usó ${toDelete.usedCount} ${toDelete.usedCount === 1 ? 'vez' : 'veces'}; el historial de canjes se conserva. `}
              Si solo quieres detenerlo temporalmente, usa “Pausar”.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setToDelete(null)} className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer">Cancelar</button>
              <button type="button" onClick={() => void handleDelete()} className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 cursor-pointer">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Historial de canjes */}
      {redemptionsOf && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-3" role="dialog" aria-modal="true" aria-label="Canjes del cupón">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-headline font-bold text-base text-[#212955]">Canjes de {redemptionsOf.coupon.code}</h3>
              <button type="button" onClick={() => setRedemptionsOf(null)} aria-label="Cerrar" className="text-gray-500 hover:text-[#212955] cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {redemptionsOf.rows === null ? (
                <p className="text-sm text-gray-500">Cargando…</p>
              ) : redemptionsOf.rows.length === 0 ? (
                <p className="text-sm text-gray-500">Este cupón todavía no se ha usado.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="text-[11px] uppercase tracking-wider text-gray-500">
                    <tr><th className="py-2">Fecha</th><th className="py-2">Pedido</th><th className="py-2">Cliente</th><th className="py-2 text-right">Descuento</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {redemptionsOf.rows.map((r, i) => (
                      <tr key={`${r.at}-${i}`}>
                        <td className="py-2 text-xs">{fmtDate(r.at)}</td>
                        <td className="py-2 font-mono text-xs">{r.orderRef || '—'}</td>
                        <td className="py-2 text-xs">{r.customerKey ?? '—'}</td>
                        <td className="py-2 text-right font-semibold">S/ {r.discountSoles.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
  msg ? <p role="alert" className="text-[11px] text-red-600 font-medium mt-1">{msg}</p> : null;
