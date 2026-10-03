import React from 'react';
import { useApp } from '../context/AppContext';
import { SITE_CONFIG } from '../config/siteConfig';

type TabId = 'terms' | 'sales' | 'warranty' | 'shipping' | 'privacy' | 'cookies';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'terms', label: 'Términos y Condiciones', icon: 'description' },
  { id: 'sales', label: 'Políticas de Venta', icon: 'receipt_long' },
  { id: 'warranty', label: 'Garantías y Reclamos', icon: 'verified' },
  { id: 'shipping', label: 'Envíos y Entregas', icon: 'local_shipping' },
  { id: 'privacy', label: 'Privacidad (Ley 29733)', icon: 'security' },
  { id: 'cookies', label: 'Cookies', icon: 'cookie' },
];

const LAST_UPDATE = 'Octubre 2026';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-2.5">
    <h3 className="font-headline font-bold text-base text-[#212955]">{title}</h3>
    <div className="text-xs sm:text-sm space-y-2">{children}</div>
  </section>
);

const Bullets: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="list-disc pl-5 space-y-1.5">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

const TabHeader: React.FC<{ eyebrow: string; title: string }> = ({ eyebrow, title }) => (
  <div>
    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9D9D9C] block">{eyebrow}</span>
    <h2 className="font-headline font-bold text-2xl text-[#212955] mt-1">{title}</h2>
  </div>
);

export const TermsPoliciesView: React.FC = () => {
  const { setCurrentView, termsActiveTab, setTermsActiveTab } = useApp();
  const activeTab = (termsActiveTab || 'terms') as TabId;
  const { company } = SITE_CONFIG;
  const email = company.supportEmail;

  const hqLine = `${company.headquarters.address}, distrito de ${company.headquarters.district}, provincia y departamento de ${company.headquarters.department}`;
  const branchLine = `${company.branch.address}, ${company.branch.district}, provincia y departamento de ${company.branch.department}`;

  const Identity = () => (
    <p>
      <strong>{company.legalName}</strong> (RUC N° <strong>{company.ruc}</strong>), que opera comercialmente bajo el
      nombre <strong>{company.tradeName}</strong>, con domicilio fiscal en {hqLine}, y sucursal de atención en{' '}
      {branchLine}. Contacto: celular/WhatsApp <strong>{company.primaryPhone}</strong> y correo{' '}
      <strong>{email}</strong>.
    </p>
  );

  const ConsumerRights = () => (
    <p className="text-[11px] sm:text-xs text-gray-500 border-l-2 border-[#F07F00] pl-3">
      Lo dispuesto en este documento no limita los derechos irrenunciables que la Ley N° 29571, Código de Protección y
      Defensa del Consumidor, reconoce a los consumidores.
    </p>
  );

  return (
    <div className="max-w-5xl mx-auto px-gutter py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#212955] to-[#181f42] text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/15">
            <span className="material-symbols-outlined text-sm text-[#F07F00]">gavel</span>
            <span>Información legal</span>
          </div>
          <h1 className="font-headline font-black text-2xl sm:text-4xl text-white">Términos, políticas y garantías</h1>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
            Documentos legales de <strong>{company.tradeName}</strong>, nombre comercial de{' '}
            <strong>{company.legalName}</strong> (RUC: {company.ruc}).
          </p>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div
        role="tablist"
        aria-label="Documentos legales"
        className="flex border-b border-gray-200 overflow-x-auto scrollbar-none gap-2 bg-white p-2 rounded-2xl shadow-xs"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setTermsActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#212955] text-white shadow-xs'
                : 'text-gray-600 hover:text-[#212955] hover:bg-gray-100'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-200 text-gray-700 leading-relaxed space-y-6">
        {/* TÉRMINOS Y CONDICIONES */}
        {activeTab === 'terms' && (
          <div className="space-y-6">
            <TabHeader eyebrow={`Última actualización: ${LAST_UPDATE}`} title="Términos y Condiciones de Uso y Contratación" />

            <Section title="1. Identificación del proveedor">
              <Identity />
              <p>Actividad principal inscrita en SUNAT: {company.mainActivity}.</p>
            </Section>

            <Section title="2. Aceptación y capacidad">
              <p>
                El acceso y uso de este sitio web, así como la realización de compras o solicitudes a través de él,
                implican la aceptación de estos Términos y Condiciones, de las Políticas Generales de Venta, de la
                Política de Privacidad y de la Política de Cookies. Para contratar debes ser mayor de 18 años y contar
                con capacidad legal.
              </p>
            </Section>

            <Section title="3. Precios, moneda y comprobantes de pago">
              <p>
                Los precios se expresan en Soles (S/) o Dólares (US$) e incluyen el Impuesto General a las Ventas (IGV),
                salvo que se indique lo contrario. Por cada operación se emite el comprobante de pago electrónico
                (boleta de venta o factura) conforme a la normativa de la SUNAT. Las condiciones de pago, bancarización
                y anticipos se detallan en las <em>Políticas de Venta</em>.
              </p>
            </Section>

            <Section title="4. Disponibilidad, información del catálogo y compatibilidad">
              <p>
                Las imágenes y descripciones son referenciales. El stock y los precios están sujetos a disponibilidad y
                pueden variar sin previo aviso. Las herramientas de compatibilidad del sitio (por ejemplo, Mi Garaje
                Virtual, búsqueda por placa o chasis) son una ayuda orientativa: la verificación final de que un
                repuesto o accesorio es compatible con el vehículo es responsabilidad del cliente, salvo asesoría
                técnica directa confirmada por escrito por {company.tradeName}.
              </p>
            </Section>

            <Section title="5. Vehículos, taller y otros servicios">
              <p>
                Las solicitudes de cotización, reservas o citas realizadas en línea son referenciales. Las condiciones
                finales (precio, plazo, alcance y forma de pago) se formalizan con un asesor y mediante cotización o
                comprobante emitido por {company.tradeName}.
              </p>
            </Section>

            <Section title="6. Medios de pago">
              <p>
                Aceptamos los medios de pago habilitados en el sitio (tarjetas a través de pasarela de pago,
                billeteras digitales y transferencias o depósitos bancarios). Los datos de tarjeta son procesados por
                la pasarela de pago y no son almacenados por {company.tradeName}. Antes de transferir, verifica que
                la cuenta corresponda a <strong>{company.legalName}</strong>, RUC {company.ruc}.
              </p>
            </Section>

            <Section title="7. Propiedad intelectual">
              <p>
                Los contenidos del sitio (marcas, logotipos, textos, imágenes y diseño) pertenecen a {company.legalName}{' '}
                o a sus respectivos titulares y no pueden reproducirse sin autorización. Las marcas de terceros se
                mencionan solo para identificar los productos comercializados.
              </p>
            </Section>

            <Section title="8. Limitación de responsabilidad y enlaces de terceros">
              <p>
                {company.tradeName} procura mantener la información actualizada y el sitio disponible, sin garantizar
                que esté libre de interrupciones o errores. El sitio puede contener enlaces o integraciones de terceros
                (pasarelas de pago, empresas de transporte, servicios de verificación) cuyas políticas son
                independientes.
              </p>
            </Section>

            <Section title="9. Libro de Reclamaciones">
              <p>
                Contamos con Libro de Reclamaciones virtual, de acuerdo con el Código de Protección y Defensa del
                Consumidor.{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('claims')}
                  className="text-[#F07F00] font-bold hover:underline cursor-pointer"
                >
                  Registrar un reclamo o queja
                </button>
                .
              </p>
            </Section>

            <Section title="10. Ley aplicable y modificaciones">
              <p>
                Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia podrá
                someterse a la autoridad competente en el Perú, sin perjuicio del derecho del consumidor de acudir a
                INDECOPI. {company.tradeName} puede actualizar este documento; la versión vigente es la publicada en
                esta página.
              </p>
            </Section>

            <ConsumerRights />
          </div>
        )}

        {/* POLÍTICAS GENERALES DE VENTA */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <TabHeader eyebrow={`Última actualización: ${LAST_UPDATE}`} title="Políticas Generales de Venta" />

            <Section title="1. Validez de cotizaciones y precios">
              <Bullets
                items={[
                  <><strong>Moneda e impuestos:</strong> los precios, expresados en Soles (S/) o Dólares (US$), incluyen IGV, salvo que se indique lo contrario.</>,
                  <><strong>Vigencia:</strong> las cotizaciones de repuestos y mano de obra tienen una validez de 24 horas hábiles, o la que se indique en la cotización.</>,
                  <><strong>Ajustes:</strong> los precios y el stock están sujetos a cambio sin previo aviso por variaciones del tipo de cambio o de la disponibilidad del fabricante.</>,
                ]}
              />
            </Section>

            <Section title="2. Condiciones de pago y bancarización">
              <Bullets
                items={[
                  <><strong>Bancarización (SUNAT):</strong> las compras o servicios por montos iguales o superiores a S/ 2,000.00, o US$ 500.00, deben cancelarse obligatoriamente mediante transferencia o depósito a nuestras cuentas bancarias.</>,
                  <><strong>Liquidación total:</strong> no se retira ningún vehículo del taller ni se despacha mercadería sin la cancelación del 100% del saldo total.</>,
                ]}
              />
            </Section>

            <Section title="3. Anticipos y adelantos de pago">
              <Bullets
                items={[
                  <><strong>Servicios de taller:</strong> requieren un adelanto del 50% al 70% para iniciar los trabajos. Los repuestos específicos para la reparación se abonan al 100% antes de su compra.</>,
                  <><strong>Autopartes e importaciones:</strong> los repuestos a pedido o por importación exigen un adelanto del 70% al 100%. Una vez tramitado el pedido, no aplican cancelaciones ni devoluciones.</>,
                ]}
              />
            </Section>

            <Section title="4. Entregas, despachos y custodia">
              <Bullets
                items={[
                  <><strong>Retiro de vehículos:</strong> el cliente cuenta con 24 a 48 horas hábiles, desde la finalización del trabajo, para retirar su vehículo. Superado ese plazo se aplica una tarifa diaria de cochera/custodia.</>,
                  <>
                    <strong>Delivery gratis en Cajamarca (zona urbana):</strong> aplica el envío sin costo a domicilio o agencia
                    dentro de la ciudad de Cajamarca únicamente para compras mayores o iguales a S/ 500.00. En compras
                    menores, el cliente puede recoger su pedido en tienda o taller, o solicitar delivery con costo adicional de flete.
                  </>,
                  <><strong>Provincias:</strong> nuestra responsabilidad culmina al entregar el paquete en la agencia elegida por el cliente. No asumimos costos ni responsabilidad por pérdidas, demoras o daños atribuibles al transporte.</>,
                  <><strong>Control de salida:</strong> contamos con un protocolo de registro fotográfico y en video del inventario, que acredita el estado de los productos antes de su salida del almacén.</>,
                ]}
              />
            </Section>

            <Section title="5. Garantía, reclamos y limitación de montaje">
              <p>
                Las condiciones de garantía y reclamos se detallan en la pestaña <em>Garantías y Reclamos</em>, que
                forma parte de estas Políticas Generales de Venta.
              </p>
            </Section>

            <Section title="6. Cancelaciones y penalidades">
              <Bullets
                items={[
                  <><strong>Autopartes de stock:</strong> las cancelaciones antes del despacho aplican una penalidad administrativa del 10% sobre el total de la compra.</>,
                  <><strong>Trabajos de taller:</strong> en caso de cancelación de un servicio iniciado, se cobra la mano de obra ejecutada y los insumos utilizados.</>,
                  <><strong>Reembolsos:</strong> las devoluciones aprobadas se tramitan mediante transferencia bancaria en un plazo de 5 a 10 días hábiles.</>,
                ]}
              />
            </Section>

            <Section title="7. Aceptación de términos">
              <p>
                La recepción del vehículo en taller, el abono de una cotización o el pago de un adelanto constituyen la
                aceptación expresa de estas políticas de venta y servicio.
              </p>
            </Section>

            <ConsumerRights />
          </div>
        )}

        {/* GARANTÍAS Y RECLAMOS */}
        {activeTab === 'warranty' && (
          <div className="space-y-6">
            <TabHeader eyebrow={`Última actualización: ${LAST_UPDATE}`} title="Garantía, Reclamos y Devoluciones" />

            <Section title="1. Plazo de reclamo">
              <p>
                Todo reclamo por servicios o repuestos debe presentarse dentro de los <strong>15 días calendario</strong>{' '}
                posteriores a la entrega. Puedes hacerlo en nuestra sucursal, por WhatsApp al {company.primaryPhone}, al
                correo {email} o a través del Libro de Reclamaciones virtual.
              </p>
            </Section>

            <Section title="2. Garantía de repuestos y accesorios">
              <p>
                Los repuestos cuentan con la garantía del fabricante o proveedor, cuya cobertura y duración se indican en
                la ficha de cada producto o en el comprobante de venta. La garantía cubre defectos de fábrica.
              </p>
            </Section>

            <Section title="3. Instalaciones en talleres externos">
              <p>
                Si el producto fue comprado en {company.tradeName} y la instalación se realizó en un taller externo, la
                garantía cubre únicamente los defectos de fábrica de la pieza. No asumimos costos de montaje,
                desmontaje, grúas ni mano de obra de terceros.
              </p>
            </Section>

            <Section title="4. Garantía de servicios de taller">
              <p>
                Cubre la mano de obra realizada. Se anula por intervención de terceros, negligencia, choque o
                manipulación inadecuada del vehículo o de la pieza.
              </p>
            </Section>

            <Section title="5. Verificación de compatibilidad">
              <p>
                La verificación de compatibilidad de cada pieza o accesorio con el vehículo es responsabilidad del
                cliente al momento de comprar, salvo asesoría técnica directa y confirmada por escrito por{' '}
                {company.tradeName}.
              </p>
            </Section>

            <Section title="6. Cancelaciones, devoluciones y reembolsos">
              <Bullets
                items={[
                  'Autopartes de stock: las cancelaciones antes del despacho aplican una penalidad administrativa del 10% sobre el total de la compra.',
                  'Repuestos a pedido o por importación: una vez tramitado el pedido, no aplican cancelaciones ni devoluciones.',
                  'Las devoluciones aprobadas se reembolsan por transferencia bancaria en un plazo de 5 a 10 días hábiles.',
                ]}
              />
            </Section>

            <Section title="7. Libro de Reclamaciones">
              <p>
                Si no estás conforme, puedes registrar tu reclamo o queja en nuestro{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('claims')}
                  className="text-[#F07F00] font-bold hover:underline cursor-pointer"
                >
                  Libro de Reclamaciones virtual
                </button>
                .
              </p>
            </Section>

            <ConsumerRights />
          </div>
        )}

        {/* ENVÍOS */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <TabHeader eyebrow={`Última actualización: ${LAST_UPDATE}`} title="Envíos, Entregas y Retiro en Sucursal" />

            <Section title="1. Envíos a nivel nacional">
              <p>
                Los despachos fuera de Cajamarca se realizan mediante empresas de transporte y agencias (como Shalom y
                Olva Courier). Te entregamos el número de guía para el seguimiento de tu pedido.
              </p>
            </Section>

            <Section title="2. Delivery en la ciudad de Cajamarca">
              <p>
                El envío a domicilio o agencia dentro de la zona urbana de Cajamarca es <strong>gratis para compras desde
                S/ 500.00</strong>. Para compras menores puedes recoger tu pedido en nuestra sucursal o solicitar delivery
                con costo adicional de flete.
              </p>
            </Section>

            <Section title="3. Provincias y responsabilidad de entrega">
              <p>
                Nuestra responsabilidad culmina al entregar el paquete en la agencia elegida por el cliente. No
                asumimos costos ni responsabilidad por pérdidas, demoras o daños atribuibles a la empresa de transporte.
                Antes de cada salida registramos fotográficamente y en video el estado de los productos.
              </p>
            </Section>

            <Section title="4. Tiempos de entrega referenciales">
              <Bullets
                items={[
                  <><strong>Cajamarca ciudad y alrededores:</strong> mismo día o 24 horas hábiles.</>,
                  <><strong>Costa Norte (Trujillo, Chiclayo, Piura):</strong> 24 a 48 horas hábiles.</>,
                  <><strong>Lima Metropolitana y Callao:</strong> 24 a 48 horas hábiles.</>,
                  <><strong>Sierra Central y Sur (Arequipa, Cusco, Huancayo):</strong> 48 a 72 horas hábiles.</>,
                ]}
              />
              <p className="text-gray-500">
                Los plazos son referenciales y pueden variar por la agencia de transporte, la disponibilidad del
                producto o causas de fuerza mayor.
              </p>
            </Section>

            <Section title="5. Retiro en sucursal">
              <p>
                Puedes retirar tu pedido en nuestra {company.branch.name}: {branchLine}. Presenta tu comprobante de pago
                y documento de identidad.
              </p>
            </Section>

            <Section title="6. Retiro de vehículos del taller">
              <p>
                Tienes de 24 a 48 horas hábiles desde la finalización del trabajo para retirar tu vehículo. Superado
                el plazo, se aplica una tarifa diaria de cochera/custodia.
              </p>
            </Section>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentView('order-tracking')}
                className="bg-[#212955] hover:bg-[#191f42] text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-base text-[#F07F00]">local_shipping</span>
                <span>Rastrear mi pedido</span>
              </button>
            </div>
          </div>
        )}

        {/* PRIVACIDAD */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <TabHeader
              eyebrow="Ley N° 29733 y Reglamento (D.S. N° 003-2013-JUS)"
              title="Política de Protección de Datos Personales"
            />

            <Section title="1. Titular del banco de datos">
              <Identity />
              <p>
                {company.legalName} es responsable del tratamiento de los datos personales que recopila a través de este
                sitio web y de sus canales de atención, conforme a la Ley N° 29733, Ley de Protección de Datos
                Personales, y su Reglamento.
              </p>
            </Section>

            <Section title="2. Datos que recopilamos">
              <Bullets
                items={[
                  'Identificación y contacto: nombres y apellidos, DNI o RUC, teléfono, correo electrónico y dirección de entrega.',
                  'Datos del vehículo que registras: placa, marca, modelo, año y número de chasis (VIN). Si verificas la placa, usamos únicamente los datos técnicos del vehículo; no solicitamos ni almacenamos datos del propietario registral.',
                  'Datos de compras, cotizaciones, citas de taller y reclamos.',
                  'Datos de navegación necesarios para el funcionamiento del sitio (ver Política de Cookies).',
                ]}
              />
            </Section>

            <Section title="3. Finalidades del tratamiento">
              <p>
                <strong>Necesarias para la relación comercial:</strong>
              </p>
              <Bullets
                items={[
                  'Gestionar tus compras, cotizaciones y pagos, y emitir comprobantes electrónicos.',
                  'Coordinar despachos y entregas con empresas de transporte.',
                  'Agendar y prestar servicios de taller, y atender garantías, reclamos y consultas.',
                  'Recomendar repuestos compatibles con el vehículo que registras.',
                  'Cumplir obligaciones legales, tributarias y contables.',
                ]}
              />
              <p>
                <strong>Adicionales (solo si lo autorizas):</strong> envío de promociones, alertas de precio y
                recordatorios de mantenimiento. Puedes retirar este consentimiento en cualquier momento.
              </p>
            </Section>

            <Section title="4. Destinatarios y encargados del tratamiento">
              <p>
                Para cumplir las finalidades anteriores podemos compartir los datos estrictamente necesarios con:
                empresas de transporte y courier, la pasarela de pagos, entidades bancarias, proveedores de servicios de
                verificación vehicular, proveedores de alojamiento y tecnología, asesores contables y legales, y
                autoridades cuando la ley lo exija. No vendemos tus datos personales.
              </p>
            </Section>

            <Section title="5. Plazo de conservación y seguridad">
              <p>
                Conservamos tus datos mientras mantengas una relación con nosotros y durante los plazos exigidos por la
                normativa tributaria, contable y de protección al consumidor. Aplicamos medidas técnicas y
                organizativas razonables para proteger la información contra pérdida, acceso o uso no autorizado.
              </p>
            </Section>

            <Section title="6. Ejercicio de derechos ARCO">
              <p>
                Puedes ejercer tus derechos de <strong>acceso, rectificación, cancelación y oposición</strong>, así como
                revocar tu consentimiento, enviando una solicitud con copia de tu documento de identidad a{' '}
                <strong>{email}</strong> o presentándola en nuestra {company.branch.name} ({company.branch.address},{' '}
                {company.branch.city}). Atenderemos tu solicitud dentro de los plazos previstos en el Reglamento de la
                Ley N° 29733.
              </p>
              <p>
                Si consideras que no se atendió debidamente tu solicitud, puedes acudir a la Autoridad Nacional de
                Protección de Datos Personales del Ministerio de Justicia y Derechos Humanos.
              </p>
            </Section>

            <Section title="7. Menores de edad">
              <p>
                Este sitio no está dirigido a menores de 18 años. No recopilamos intencionalmente sus datos sin el
                consentimiento de sus padres o tutores.
              </p>
            </Section>

            <Section title="8. Cambios en esta política">
              <p>
                Podemos actualizar esta política para reflejar cambios legales u operativos. Publicaremos la versión
                vigente en esta página (última actualización: {LAST_UPDATE}).
              </p>
            </Section>
          </div>
        )}

        {/* COOKIES */}
        {activeTab === 'cookies' && (
          <div className="space-y-6">
            <TabHeader eyebrow={`Última actualización: ${LAST_UPDATE}`} title="Política de Cookies y Almacenamiento Local" />

            <Section title="1. ¿Qué usamos?">
              <p>
                Este sitio utiliza cookies y almacenamiento local del navegador para recordar información necesaria
                para su funcionamiento.
              </p>
              <Bullets
                items={[
                  <><strong>Necesarias:</strong> sesión de usuario, carrito de compras, lista de deseos, Mi Garaje Virtual y preferencias de uso. Sin ellas el sitio no funciona correctamente.</>,
                  <><strong>De terceros:</strong> tipografías e íconos cargados desde servidores externos y la pasarela de pagos al momento de pagar, que pueden registrar datos técnicos como la dirección IP.</>,
                ]}
              />
            </Section>

            <Section title="2. Cookies de publicidad y analítica">
              <p>
                Actualmente no utilizamos cookies publicitarias. Si en el futuro incorporamos herramientas de analítica o
                marketing, te pediremos tu consentimiento y actualizaremos esta política.
              </p>
            </Section>

            <Section title="3. Cómo gestionarlas">
              <p>
                Puedes borrar o bloquear las cookies y el almacenamiento local desde la configuración de tu navegador.
                Si lo haces, algunas funciones (carrito, garaje, sesión) podrían dejar de funcionar. Para consultas
                escribe a <strong>{email}</strong>.
              </p>
            </Section>
          </div>
        )}
      </div>

      {/* Footer Legal Disclaimers */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#212955]">verified_user</span>
          <span>Transacciones respaldadas por el Código de Protección y Defensa del Consumidor (Ley N° 29571).</span>
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
