import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const TermsPoliciesView: React.FC = () => {
  const { setCurrentView, termsActiveTab, setTermsActiveTab } = useApp();
  const activeTab = termsActiveTab || 'terms';
  const setActiveTab = setTermsActiveTab;

  return (
    <div className="max-w-5xl mx-auto px-gutter py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#212955] to-[#181f42] text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/15">
            <span className="material-symbols-outlined text-sm text-[#F07F00]">gavel</span>
            <span>Marco Legal, Garantías y Privacidad</span>
          </div>
          <h1 className="font-headline font-black text-2xl sm:text-4xl text-white">
            Términos, Políticas de Privacidad &amp; Garantías OEM
          </h1>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
            Conoce los términos de contratación, políticas de tratamiento de datos personales bajo la <strong>Ley N° 29733</strong> de Perú y las condiciones de garantía oficial respaldadas por <strong>Nor Celis Automotriz S.A.C.</strong> (RUC: 20541982311).
          </p>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-none gap-2 bg-white p-2 rounded-2xl shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('terms')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'terms'
              ? 'bg-[#212955] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#212955] hover:bg-gray-100'
          }`}
        >
          <span className="material-symbols-outlined text-base">description</span>
          <span>Términos y Condiciones</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'privacy'
              ? 'bg-[#212955] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#212955] hover:bg-gray-100'
          }`}
        >
          <span className="material-symbols-outlined text-base">security</span>
          <span>Políticas de Privacidad (Ley 29733)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('warranty')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'warranty'
              ? 'bg-[#212955] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#212955] hover:bg-gray-100'
          }`}
        >
          <span className="material-symbols-outlined text-base">verified</span>
          <span>Garantías OEM y Devoluciones</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shipping')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'shipping'
              ? 'bg-[#212955] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#212955] hover:bg-gray-100'
          }`}
        >
          <span className="material-symbols-outlined text-base">local_shipping</span>
          <span>Envíos Nacionales Shalom</span>
        </button>
      </div>

      {/* Content Blocks */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-200 text-gray-700 leading-relaxed space-y-6">
        {/* TAB 1: TÉRMINOS Y CONDICIONES */}
        {activeTab === 'terms' && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9D9D9C] block">
                Última actualización: Septiembre 2026
              </span>
              <h2 className="font-headline font-bold text-2xl text-[#212955] mt-1">
                Términos y Condiciones de Uso y Contratación
              </h2>
            </div>

            <section className="space-y-3">
              <h3 className="font-headline font-bold text-base text-[#212955]">
                1. Información General del Proveedor
              </h3>
              <p className="text-xs sm:text-sm">
                El presente sitio web es propiedad y operado por <strong>NOR CELIS AUTOMOTRIZ S.A.C.</strong>, identificado con <strong>RUC N° 20541982311</strong>, con domicilio legal y sede central en <strong>Av. Vía de Evitamiento Sur N° 6003, distrito y provincia de Cajamarca, departamento de Cajamarca, Perú</strong>.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-headline font-bold text-base text-[#212955]">
                2. Precios, Moneda y Comprobantes Electrónicos
              </h3>
              <p className="text-xs sm:text-sm">
                Todos los precios de repuestos, accesorios, servicios de taller y vehículos publicados en nuestra plataforma están expresados en <strong>Nuevos Soles (S/)</strong> e incluyen el <strong>Impuesto General a las Ventas (IGV 18%)</strong> de conformidad con la normativa de la SUNAT. Por cada transacción se emitirá la Boleta de Venta o Factura Electrónica según la elección del cliente.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-headline font-bold text-base text-[#212955]">
                3. Reserva y Compra de Vehículos
              </h3>
              <p className="text-xs sm:text-sm">
                La separación en línea de cualquier vehículo (nuevo 0 km o seminuevo certificado) se efectúa mediante una reserva referencial que congela el stock por un periodo de <strong>7 días calendario</strong>. Durante este periodo, un asesor comercial formaliza la transferencia notarial, cronograma bancario o cancelación del saldo restante.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-headline font-bold text-base text-[#212955]">
                4. Disponibilidad y Catálogo de Autopartes
              </h3>
              <p className="text-xs sm:text-sm">
                Las autopartes y accesorios OEM cuentan con verificación de calce garantizado mediante validación de VIN / número de chasis en nuestra herramienta <em>Mi Garaje Virtual</em>. En el caso improbable de indisponibilidad por quiebre de inventario, se reembolsará el 100% del importe dentro de las 24 horas hábiles.
              </p>
            </section>
          </div>
        )}

        {/* TAB 2: POLÍTICAS DE PRIVACIDAD */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9D9D9C] block">
                Cumplimiento Ley N° 29733 - Perú
              </span>
              <h2 className="font-headline font-bold text-2xl text-[#212955] mt-1">
                Política de Protección y Privacidad de Datos Personales
              </h2>
            </div>

            <section className="space-y-3">
              <h3 className="font-headline font-bold text-base text-[#212955]">
                1. Marco Legal y Compromiso de Privacidad
              </h3>
              <p className="text-xs sm:text-sm">
                En cumplimiento de la <strong>Ley N° 29733 (Ley de Protección de Datos Personales)</strong> y su Reglamento aprobado mediante Decreto Supremo N° 003-2013-JUS, <strong>NOR CELIS AUTOMOTRIZ S.A.C.</strong> garantiza el tratamiento confidencial, seguro y lícito de toda la información suministrada por nuestros usuarios y clientes.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-headline font-bold text-base text-[#212955]">
                2. Finalidad del Tratamiento de Datos
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>Gestión de compras en línea y emisión de facturación electrónica ante SUNAT.</li>
                <li>Despacho y coordinación logística de envíos con empresas autorizadas (Shalom Express / Olva Courier).</li>
                <li>Agendamiento de turnos técnicos en nuestro taller automotriz y emisión de certificados de servicio.</li>
                <li>Envío de alertas de mantenimiento y notificaciones de precio expresamente consentidas por el usuario.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="font-headline font-bold text-base text-[#212955]">
                3. Ejercicio de Derechos ARCO
              </h3>
              <p className="text-xs sm:text-sm">
                El titular de los datos personales puede ejercer en cualquier momento sus derechos de <strong>Acceso, Rectificación, Cancelación y Oposición (ARCO)</strong> enviando una solicitud formal a <strong>privacidad@norcelis.pe</strong> o de manera presencial en nuestra sede central de Av. Vía de Evitamiento Sur 6003, Cajamarca.
              </p>
            </section>
          </div>
        )}

        {/* TAB 3: GARANTÍAS Y DEVOLUCIONES */}
        {activeTab === 'warranty' && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9D9D9C] block">
                Cobertura Oficial Nor Celis
              </span>
              <h2 className="font-headline font-bold text-2xl text-[#212955] mt-1">
                Políticas de Garantía OEM y Devoluciones
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-2">
                <span className="material-symbols-outlined text-2xl text-[#212955]">directions_car</span>
                <h4 className="font-bold text-xs uppercase text-[#212955]">Vehículos Nuevos (0 km)</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Hasta <strong>5 años o 150,000 km</strong> de garantía oficial de fábrica respaldada por la marca y asistida en nuestra red.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
                <span className="material-symbols-outlined text-2xl text-emerald-700">verified</span>
                <h4 className="font-bold text-xs uppercase text-emerald-900">Seminuevos Certificados</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong>1 año de garantía mecánica</strong> en motor y caja tras superar la rigurosa inspección de 150 puntos.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-2">
                <span className="material-symbols-outlined text-2xl text-[#F07F00]">build</span>
                <h4 className="font-bold text-xs uppercase text-[#F07F00]">Autopartes &amp; Accesorios</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong>12 a 24 meses de garantía</strong> directa por defecto de fabricación en marcas oficiales (Brembo, Bosch, KYB, KEKO).
                </p>
              </div>
            </div>

            <section className="space-y-3">
              <h3 className="font-headline font-bold text-base text-[#212955]">
                Condiciones para Cambios y Devoluciones
              </h3>
              <p className="text-xs sm:text-sm">
                Para solicitar el cambio o devolución de una autoparte adquirida en línea, el cliente dispone de <strong>7 días calendario</strong> contados a partir de la recepción del producto. La pieza debe encontrarse en su empaque original sellado, sin signos de instalación ni marcas de herramientas mecánicas, acompañada del comprobante de pago electrónico.
              </p>
            </section>
          </div>
        )}

        {/* TAB 4: ENVÍOS NACIONALES */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9D9D9C] block">
                Logística &amp; Cobertura Perú
              </span>
              <h2 className="font-headline font-bold text-2xl text-[#212955] mt-1">
                Políticas de Envíos Nacionales y Retiro en Sede
              </h2>
            </div>

            <section className="space-y-3">
              <h3 className="font-headline font-bold text-base text-[#212955]">
                1. Alianza Logística con Shalom Express y Olva Courier
              </h3>
              <p className="text-xs sm:text-sm">
                Los despachos fuera de Cajamarca se gestionan a través de la red oficial de <strong>Shalom Empresarial</strong> y <strong>Olva Courier</strong>, garantizando número de guía rastreable desde el momento de entrega en agencia hasta el destino final.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-headline font-bold text-base text-[#212955]">
                2. Tiempos Promedio de Entrega
              </h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li><strong>Cajamarca Ciudad &amp; Alrededores:</strong> Mismo día o 24 horas hábiles.</li>
                <li><strong>Costa Norte (Trujillo, Chiclayo, Piura):</strong> 24 a 48 horas hábiles.</li>
                <li><strong>Lima Metropolitana y Callao:</strong> 24 a 48 horas hábiles.</li>
                <li><strong>Sierra Central y Sur (Arequipa, Cusco, Huancayo):</strong> 48 a 72 horas hábiles.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="font-headline font-bold text-base text-[#212955]">
                3. Retiro Presencial Gratuito
              </h3>
              <p className="text-xs sm:text-sm">
                Los clientes pueden seleccionar la opción de <strong>Retiro en Concesionario</strong> sin costo de flete, recogiendo sus autopartes en nuestro mostrador de repuestos de Av. Vía de Evitamiento Sur 6003, con opción de instalación inmediata en nuestro taller certificado.
              </p>
            </section>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentView('order-tracking')}
                className="bg-[#212955] hover:bg-[#191f42] text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-base text-[#F07F00]">local_shipping</span>
                <span>Ir al Rastreador de Envíos en Tiempo Real</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Legal Disclaimers */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#212955]">verified_user</span>
          <span>Transacciones respaldadas bajo el Código de Protección y Defensa del Consumidor (Ley N° 29571).</span>
        </div>
        <button
          type="button"
          onClick={() => setCurrentView('claims')}
          className="text-[#F07F00] font-bold hover:underline shrink-0 cursor-pointer"
        >
          Acceder al Libro de Reclamaciones →
        </button>
      </div>
    </div>
  );
};
