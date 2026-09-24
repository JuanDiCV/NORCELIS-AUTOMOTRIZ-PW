import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ClaimsBookView: React.FC = () => {
  const { setCurrentView, showToast } = useApp();

  const [claimType, setClaimType] = useState<'Reclamo' | 'Queja'>('Reclamo');
  const [goodType, setGoodType] = useState<'Producto' | 'Servicio'>('Servicio');

  // Form Fields
  const [consumerName, setConsumerName] = useState('');
  const [docType, setDocType] = useState('DNI');
  const [docNumber, setDocNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [department, setDepartment] = useState('Cajamarca');
  const [claimedAmount, setClaimedAmount] = useState('');
  const [goodDescription, setGoodDescription] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [claimDetail, setClaimDetail] = useState('');
  const [concreteRequest, setConcreteRequest] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Submitted Sheet Modal
  const [registeredSheet, setRegisteredSheet] = useState<{
    code: string;
    date: string;
    consumerName: string;
    docNumber: string;
    type: string;
    detail: string;
    request: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      showToast('Debes aceptar la declaración de veracidad de datos conforme a ley');
      return;
    }

    const prefix = claimType === 'Reclamo' ? 'NOR-REC' : 'NOR-QUE';
    const code = `${prefix}-2025-${Math.floor(10000 + Math.random() * 90000)}`;

    const sheet = {
      code,
      date: new Date().toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      consumerName,
      docNumber,
      type: claimType,
      detail: claimDetail,
      request: concreteRequest,
    };

    setRegisteredSheet(sheet);
    showToast(`Libro de Reclamaciones: Registro N° ${code} emitido con éxito`);
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen py-8 px-gutter">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-outline">
          <button onClick={() => setCurrentView('home')} className="hover:text-primary transition-colors">
            Inicio
          </button>
          <span>/</span>
          <span className="text-on-surface font-semibold">Libro de Reclamaciones Virtual</span>
        </nav>

        {/* Legal Header Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-surface-container shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-container pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/15 text-secondary text-xs font-bold border border-secondary-container/30">
                <span className="material-symbols-outlined text-sm">gavel</span>
                Conforme a la Ley N° 29571 &amp; INDECOPI (Perú)
              </div>
              <h1 className="text-2xl font-headline font-extrabold text-primary">
                Libro de Reclamaciones Virtual
              </h1>
            </div>
            <div className="text-left sm:text-right text-xs text-outline font-mono space-y-0.5">
              <div>Razón Social: <strong className="text-on-surface">NOR CELIS AUTOMOTRIZ S.A.C.</strong></div>
              <div>RUC: <strong className="text-primary font-bold">20541982311</strong></div>
              <div>Dirección: AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-surface-container-low p-4 rounded-2xl border border-surface-container">
            <div className="space-y-1">
              <strong className="text-primary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-secondary">help</span>
                ¿Qué es un Reclamo?
              </strong>
              <p className="text-outline text-[11px]">
                Disconformidad relacionada directamente a los productos adquiridos o servicios prestados en concesionario o taller.
              </p>
            </div>
            <div className="space-y-1">
              <strong className="text-primary font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-secondary">info</span>
                ¿Qué es una Queja?
              </strong>
              <p className="text-outline text-[11px]">
                Malestar o descontento respecto a la atención al público brindada, sin estar ligada directamente a la idoneidad del bien contratado.
              </p>
            </div>
          </div>
        </div>

        {/* Registered Sheet Confirmation Modal */}
        {registeredSheet && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-surface-container space-y-6 text-center animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">task_alt</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-headline font-extrabold text-primary">
                  Constancia de Hoja de Reclamación Emitida
                </h3>
                <p className="text-xs text-outline">
                  Conforme a la normativa del INDECOPI, se ha generado el registro oficial y se ha enviado una copia íntegra a tu correo electrónico.
                </p>
              </div>

              <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container text-left space-y-2.5 text-xs">
                <div className="flex justify-between items-center border-b border-surface-container pb-2">
                  <span className="text-outline">Número Correlativo Oficial:</span>
                  <span className="font-mono font-bold text-sm text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {registeredSheet.code}
                  </span>
                </div>
                <div className="flex justify-between text-outline">
                  <span>Fecha &amp; Hora de Registro:</span>
                  <span className="font-medium text-on-surface">{registeredSheet.date}</span>
                </div>
                <div className="flex justify-between text-outline">
                  <span>Consumidor:</span>
                  <span className="font-bold text-on-surface">{registeredSheet.consumerName} ({registeredSheet.docNumber})</span>
                </div>
                <div className="flex justify-between text-outline">
                  <span>Tipo de Afectación:</span>
                  <span className="font-bold text-secondary uppercase">{registeredSheet.type}</span>
                </div>
                <div className="pt-2 border-t border-surface-container">
                  <span className="text-outline text-[11px] block">Plazo Legal de Respuesta:</span>
                  <span className="font-bold text-primary">
                    Máximo 15 días hábiles a través de tu correo {email || 'registrado'}.
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 bg-surface-container-low hover:bg-surface-container text-primary font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-surface-container"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  Imprimir Copia en Papel
                </button>
                <button
                  onClick={() => {
                    setRegisteredSheet(null);
                    setCurrentView('home');
                  }}
                  className="flex-1 bg-primary hover:bg-primary-container text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors"
                >
                  Entendido y Volver al Inicio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Claim Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-10 border border-surface-container shadow-xs space-y-8">
          {/* SECTION 1: Consumer Identification */}
          <div className="space-y-4">
            <h2 className="text-sm font-headline font-bold text-primary uppercase tracking-wider flex items-center gap-2 border-b border-surface-container pb-2">
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] flex items-center justify-center font-bold">1</span>
              Identificación del Consumidor Reclamante
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-on-surface mb-1">Nombres y Apellidos Completos *</label>
                <input
                  type="text"
                  required
                  value={consumerName}
                  onChange={(e) => setConsumerName(e.target.value)}
                  placeholder="Como figura en tu documento de identidad"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Tipo de Documento</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="DNI">DNI (Documento Nacional de Identidad)</option>
                  <option value="Carné de Extranjería">Carné de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="RUC">RUC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Número de Documento *</label>
                <input
                  type="text"
                  required
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="Número de documento"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-mono font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Teléfono Móvil (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="987 654 321"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Para envío de la constancia oficial"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-on-surface mb-1">Domicilio Actual *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Av. / Calle, N°, Dpto, Urbanización y Distrito"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Departamento</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="Cajamarca">Cajamarca</option>
                  <option value="Lima">Lima</option>
                  <option value="La Libertad">La Libertad</option>
                  <option value="Lambayeque">Lambayeque</option>
                  <option value="Piura">Piura</option>
                  <option value="Otro">Otro Departamento</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Goods Identification */}
          <div className="space-y-4">
            <h2 className="text-sm font-headline font-bold text-primary uppercase tracking-wider flex items-center gap-2 border-b border-surface-container pb-2">
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] flex items-center justify-center font-bold">2</span>
              Identificación del Bien Contratado
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Tipo de Bien</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Producto', 'Servicio'] as const).map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => setGoodType(g)}
                      className={`py-2 text-xs rounded-xl font-bold border transition-colors ${
                        goodType === g
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface-container-low text-outline border-surface-container'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Monto Reclamado (S/)</label>
                <input
                  type="number"
                  value={claimedAmount}
                  onChange={(e) => setClaimedAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">N° de Boleta, Factura u Orden</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Ej: B001-002849 o Placa ABC-123"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-mono font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-on-surface mb-1">Descripción del Bien o Servicio Contratado *</label>
                <input
                  type="text"
                  required
                  value={goodDescription}
                  onChange={(e) => setGoodDescription(e.target.value)}
                  placeholder="Ej: Mantenimiento de 20,000 km para Toyota RAV4 / Compra de pastillas Brembo"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Claim / Complaint Details */}
          <div className="space-y-4">
            <h2 className="text-sm font-headline font-bold text-primary uppercase tracking-wider flex items-center gap-2 border-b border-surface-container pb-2">
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] flex items-center justify-center font-bold">3</span>
              Detalle de la Reclamación y Pedido Concreto
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">Modalidad de Reclamación</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setClaimType('Reclamo')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      claimType === 'Reclamo'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-surface-container hover:border-outline'
                    }`}
                  >
                    <div className="font-bold text-xs text-primary mb-0.5">RECLAMO</div>
                    <p className="text-[11px] text-outline">
                      Disconformidad relacionada al producto entregado o al servicio automotriz brindado.
                    </p>
                  </div>

                  <div
                    onClick={() => setClaimType('Queja')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      claimType === 'Queja'
                        ? 'border-secondary bg-secondary/5 ring-1 ring-secondary'
                        : 'border-surface-container hover:border-outline'
                    }`}
                  >
                    <div className="font-bold text-xs text-secondary mb-0.5">QUEJA</div>
                    <p className="text-[11px] text-outline">
                      Malestar en el trato recibido o inconformidad con la atención personal del personal.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Detalle Pormenorizado de los Hechos *
                </label>
                <textarea
                  required
                  rows={4}
                  value={claimDetail}
                  onChange={(e) => setClaimDetail(e.target.value)}
                  placeholder="Describe de manera clara y cronológica lo sucedido, incluyendo fechas, nombres de asesores y sede donde ocurrió el suceso..."
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Pedido Concreto del Consumidor *
                </label>
                <textarea
                  required
                  rows={2}
                  value={concreteRequest}
                  onChange={(e) => setConcreteRequest(e.target.value)}
                  placeholder="Indica la solución concreta que esperas recibir por parte de Nor Celis Automotriz (ej: reingreso a taller sin costo, cambio de repuesto, nota de crédito, etc.)..."
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Legal Declarations & Terms */}
          <div className="border-t border-surface-container pt-6 space-y-4">
            <div className="flex items-start gap-3 bg-surface-container-low p-4 rounded-2xl border border-surface-container">
              <input
                type="checkbox"
                id="terms"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-5 h-5 text-primary accent-primary rounded cursor-pointer mt-0.5"
              />
              <label htmlFor="terms" className="text-xs text-outline cursor-pointer leading-relaxed">
                <strong className="text-on-surface block font-bold">Declaración Jurada de Veracidad de la Información</strong>
                Declaro bajo juramento que los datos consignados en la presente hoja de reclamación son fidedignos y autorizo la notificación de la respuesta oficial a través del correo electrónico consignado, conforme al D.S. N° 011-2011-PCM.
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-[11px] text-outline font-mono">
                Plazo máximo legal de respuesta: 15 días hábiles improrrogables.
              </span>

              <button
                type="submit"
                className="w-full sm:w-auto bg-primary hover:bg-primary-container text-white font-bold py-3.5 px-8 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                Enviar Reclamación &amp; Generar Constancia
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
