export interface SaleRecord {
  id: string;
  invoiceNumber: string; // ej: F001-0004821 o B001-0012940
  docType: 'Factura Electrónica' | 'Boleta de Venta' | 'Nota de Crédito';
  issueDate: string; // YYYY-MM-DD
  customerName: string;
  customerDocType: 'RUC' | 'DNI' | 'CE';
  customerDocNumber: string;
  saleCategory: 'Vehículos 0km' | 'Vehículos Seminuevos' | 'Repuestos y Accesorios' | 'Servicios Taller' | 'Seguros & Garantías';
  itemDescription: string;
  currency: 'PEN' | 'USD';
  exchangeRate: number;
  subtotal: number;
  taxIgv: number;
  totalAmount: number;
  paymentMethod: 'Transferencia BCP' | 'Tarjeta de Crédito / Débito' | 'Financiamiento Santander' | 'Efectivo en Caja' | 'PagoEfectivo';
  branch: 'Sede Cajamarca Central' | 'Sede Vía Evitamiento Sur' | 'Sede Jaén' | 'Sede Trujillo';
  salesAdvisor: string;
  sunatStatus: 'Aceptado SUNAT' | 'En Proceso' | 'Anulado';
}

export interface WorkshopOrderRecord {
  id: string;
  orderNumber: string; // ej: OT-2025-0842
  entryDate: string;
  deliveryDate: string;
  vehiclePlate: string;
  vehicleModel: string;
  clientName: string;
  clientDoc: string;
  serviceType: string;
  laborCostSoles: number;
  partsCostSoles: number;
  subtotalSoles: number;
  igvSoles: number;
  totalSoles: number;
  technician: string;
  branch: 'Sede Cajamarca Central' | 'Sede Vía Evitamiento Sur' | 'Sede Jaén' | 'Sede Trujillo';
  status: 'Completada y Facturada' | 'En Proceso en Taller' | 'Esperando Repuesto';
}

export interface QuotationLeadRecord {
  id: string;
  quoteNumber: string; // ej: COT-NC-9821
  quoteDate: string;
  clientName: string;
  documentNumber: string;
  phone: string;
  email: string;
  interestType: 'Vehículo Nuevo' | 'Vehículo Seminuevo' | 'Repuestos OEM' | 'Mantenimiento Preventivo' | 'Plan Retoma';
  itemQuoted: string;
  quotedPriceSoles: number;
  quotedPriceUsd: number;
  initialPaymentProjectedUsd?: number;
  salesAdvisor: string;
  branch: 'Sede Cajamarca Central' | 'Sede Vía Evitamiento Sur' | 'Sede Jaén' | 'Sede Trujillo';
  status: 'Venta Cerrada' | 'Seguimiento Activo' | 'Test Drive Realizado' | 'En Evaluación Crediticia' | 'Descartado';
}

export const INITIAL_SALES_RECORDS: SaleRecord[] = [
  {
    id: 'sale-001',
    invoiceNumber: 'F001-0004821',
    docType: 'Factura Electrónica',
    issueDate: '2026-09-24',
    customerName: 'MINERA YANACOCHA S.R.L.',
    customerDocType: 'RUC',
    customerDocNumber: '20131498112',
    saleCategory: 'Vehículos 0km',
    itemDescription: 'Toyota Hilux 4x4 D/C SRV 2.8 Turbo Diésel 2025 (Chasis MR0BA3CD201984210)',
    currency: 'USD',
    exchangeRate: 3.78,
    subtotal: 39822.03,
    taxIgv: 7167.97,
    totalAmount: 46990.00,
    paymentMethod: 'Transferencia BCP',
    branch: 'Sede Cajamarca Central',
    salesAdvisor: 'Carlos Mendoza',
    sunatStatus: 'Aceptado SUNAT',
  },
  {
    id: 'sale-002',
    invoiceNumber: 'B001-0012940',
    docType: 'Boleta de Venta',
    issueDate: '2026-09-24',
    customerName: 'Manuel Alejandro Terrones Silva',
    customerDocType: 'DNI',
    customerDocNumber: '42891024',
    saleCategory: 'Repuestos y Accesorios',
    itemDescription: 'Kit Discos de Freno Ventilados Brembo + Pastillas Cerámicas Delanteras (SKU: NC-BRM-84920)',
    currency: 'PEN',
    exchangeRate: 3.78,
    subtotal: 661.02,
    taxIgv: 118.98,
    totalAmount: 780.00,
    paymentMethod: 'Tarjeta de Crédito / Débito',
    branch: 'Sede Cajamarca Central',
    salesAdvisor: 'Área Repuestos Nor Celis',
    sunatStatus: 'Aceptado SUNAT',
  },
  {
    id: 'sale-003',
    invoiceNumber: 'F001-0004822',
    docType: 'Factura Electrónica',
    issueDate: '2026-09-23',
    customerName: 'CONSORCIO VIAL NORTE SAC',
    customerDocType: 'RUC',
    customerDocNumber: '20601948219',
    saleCategory: 'Vehículos 0km',
    itemDescription: 'Mitsubishi L200 4x4 GLS High Power 2025 Automática',
    currency: 'USD',
    exchangeRate: 3.78,
    subtotal: 36432.20,
    taxIgv: 6557.80,
    totalAmount: 42990.00,
    paymentMethod: 'Financiamiento Santander',
    branch: 'Sede Vía Evitamiento Sur',
    salesAdvisor: 'Rodrigo Celis',
    sunatStatus: 'Aceptado SUNAT',
  },
  {
    id: 'sale-004',
    invoiceNumber: 'B001-0012941',
    docType: 'Boleta de Venta',
    issueDate: '2026-09-22',
    customerName: 'María Elena Salazar Cerna',
    customerDocType: 'DNI',
    customerDocNumber: '09841255',
    saleCategory: 'Servicios Taller',
    itemDescription: 'Mantenimiento Preventivo 10,000 KM + Alineamiento y Balanceo Computarizado 3D',
    currency: 'PEN',
    exchangeRate: 3.78,
    subtotal: 440.68,
    taxIgv: 79.32,
    totalAmount: 520.00,
    paymentMethod: 'Tarjeta de Crédito / Débito',
    branch: 'Sede Cajamarca Central',
    salesAdvisor: 'Taller Nor Celis',
    sunatStatus: 'Aceptado SUNAT',
  },
  {
    id: 'sale-005',
    invoiceNumber: 'F001-0004823',
    docType: 'Factura Electrónica',
    issueDate: '2026-09-20',
    customerName: 'AGROINDUSTRIAS CAJAMARCA S.A.',
    customerDocType: 'RUC',
    customerDocNumber: '20451829104',
    saleCategory: 'Repuestos y Accesorios',
    itemDescription: 'Lote x4 Baterías AGM Bosch S5 70Ah + Amortiguadores Deportivos Nor Celis Pro',
    currency: 'PEN',
    exchangeRate: 3.78,
    subtotal: 3559.32,
    taxIgv: 640.68,
    totalAmount: 4200.00,
    paymentMethod: 'Transferencia BCP',
    branch: 'Sede Jaén',
    salesAdvisor: 'Ventas Corporativas',
    sunatStatus: 'Aceptado SUNAT',
  },
  {
    id: 'sale-006',
    invoiceNumber: 'B001-0012942',
    docType: 'Boleta de Venta',
    issueDate: '2026-09-18',
    customerName: 'Jorge Luis Becerra Vigo',
    customerDocType: 'DNI',
    customerDocNumber: '41920481',
    saleCategory: 'Vehículos Seminuevos',
    itemDescription: 'Toyota RAV4 2.5L Hybrid Limited AWD 2023 Seminuevo Certificado (Placa ABC-123)',
    currency: 'USD',
    exchangeRate: 3.78,
    subtotal: 27533.90,
    taxIgv: 4956.10,
    totalAmount: 32490.00,
    paymentMethod: 'Financiamiento Santander',
    branch: 'Sede Cajamarca Central',
    salesAdvisor: 'Carlos Mendoza',
    sunatStatus: 'Aceptado SUNAT',
  },
  {
    id: 'sale-007',
    invoiceNumber: 'F001-0004824',
    docType: 'Factura Electrónica',
    issueDate: '2026-09-15',
    customerName: 'TRANSPORTES & LOGÍSTICA DEL NORTE EIRL',
    customerDocType: 'RUC',
    customerDocNumber: '20559182301',
    saleCategory: 'Servicios Taller',
    itemDescription: 'Reparación de Sistema de Inyección Common Rail + Escaneo Computarizado OBD-II',
    currency: 'PEN',
    exchangeRate: 3.78,
    subtotal: 1567.80,
    taxIgv: 282.20,
    totalAmount: 1850.00,
    paymentMethod: 'Transferencia BCP',
    branch: 'Sede Trujillo',
    salesAdvisor: 'Taller Nor Celis',
    sunatStatus: 'Aceptado SUNAT',
  },
  {
    id: 'sale-008',
    invoiceNumber: 'B001-0012943',
    docType: 'Boleta de Venta',
    issueDate: '2026-09-12',
    customerName: 'Fernando Castillo Paredes',
    customerDocType: 'DNI',
    customerDocNumber: '70891244',
    saleCategory: 'Repuestos y Accesorios',
    itemDescription: 'Laminado de Seguridad Antiasalto 12 micras + Tratamiento Cerámico 9H',
    currency: 'PEN',
    exchangeRate: 3.78,
    subtotal: 754.24,
    taxIgv: 135.76,
    totalAmount: 890.00,
    paymentMethod: 'Tarjeta de Crédito / Débito',
    branch: 'Sede Cajamarca Central',
    salesAdvisor: 'Área Repuestos Nor Celis',
    sunatStatus: 'Aceptado SUNAT',
  },
  {
    id: 'sale-009',
    invoiceNumber: 'F001-0004825',
    docType: 'Factura Electrónica',
    issueDate: '2026-09-08',
    customerName: 'SERVICIOS GEOLÓGICOS DEL PERÚ S.A.C.',
    customerDocType: 'RUC',
    customerDocNumber: '20491820491',
    saleCategory: 'Vehículos 0km',
    itemDescription: 'Ford Ranger 4x4 Bi-Turbo XLT 2025 Automática 10 Vel.',
    currency: 'USD',
    exchangeRate: 3.78,
    subtotal: 38974.58,
    taxIgv: 7015.42,
    totalAmount: 45990.00,
    paymentMethod: 'Transferencia BCP',
    branch: 'Sede Cajamarca Central',
    salesAdvisor: 'Rodrigo Celis',
    sunatStatus: 'Aceptado SUNAT',
  },
  {
    id: 'sale-010',
    invoiceNumber: 'B001-0012944',
    docType: 'Boleta de Venta',
    issueDate: '2026-09-02',
    customerName: 'Patricia Villanueva Rojas',
    customerDocType: 'DNI',
    customerDocNumber: '44819022',
    saleCategory: 'Vehículos 0km',
    itemDescription: 'Suzuki Grand Vitara Hybrid 1.5L Boosterjet 2025 GLX AllGrip',
    currency: 'USD',
    exchangeRate: 3.78,
    subtotal: 21601.69,
    taxIgv: 3888.31,
    totalAmount: 25490.00,
    paymentMethod: 'Financiamiento Santander',
    branch: 'Sede Vía Evitamiento Sur',
    salesAdvisor: 'Carlos Mendoza',
    sunatStatus: 'Aceptado SUNAT',
  },
];

export const INITIAL_WORKSHOP_ORDERS: WorkshopOrderRecord[] = [
  {
    id: 'ot-001',
    orderNumber: 'OT-2026-0842',
    entryDate: '2026-09-24',
    deliveryDate: '2026-09-25',
    vehiclePlate: 'HLX-789',
    vehicleModel: 'Toyota Hilux Revo 2.8 4x4',
    clientName: 'Consorcio Vial Norte SAC',
    clientDoc: '20601948219',
    serviceType: 'Mantenimiento Preventivo 30,000 KM + Cambio Filtros OEM',
    laborCostSoles: 320,
    partsCostSoles: 580,
    subtotalSoles: 762.71,
    igvSoles: 137.29,
    totalSoles: 900,
    technician: 'Ing. Marco Alvites (Jefe Taller)',
    branch: 'Sede Cajamarca Central',
    status: 'Completada y Facturada',
  },
  {
    id: 'ot-002',
    orderNumber: 'OT-2026-0843',
    entryDate: '2026-09-24',
    deliveryDate: '2026-09-26',
    vehiclePlate: 'ABC-123',
    vehicleModel: 'Toyota RAV4 Hybrid 2025',
    clientName: 'Manuel Terrones',
    clientDoc: '42891024',
    serviceType: 'Instalación de Discos Brembo + Pastillas Cerámicas',
    laborCostSoles: 180,
    partsCostSoles: 780,
    subtotalSoles: 813.56,
    igvSoles: 146.44,
    totalSoles: 960,
    technician: 'Téc. Walter Huamán',
    branch: 'Sede Cajamarca Central',
    status: 'Completada y Facturada',
  },
  {
    id: 'ot-003',
    orderNumber: 'OT-2026-0844',
    entryDate: '2026-09-25',
    deliveryDate: '2026-09-26',
    vehiclePlate: 'NFR-442',
    vehicleModel: 'Nissan Frontier Pro-4X 2024',
    clientName: 'Minera Yanacocha SRL',
    clientDoc: '20131498112',
    serviceType: 'Diagnóstico Electrónico de Inyección + Limpieza de Inyectores',
    laborCostSoles: 450,
    partsCostSoles: 240,
    subtotalSoles: 584.75,
    igvSoles: 105.25,
    totalSoles: 690,
    technician: 'Ing. Marco Alvites',
    branch: 'Sede Vía Evitamiento Sur',
    status: 'En Proceso en Taller',
  },
  {
    id: 'ot-004',
    orderNumber: 'OT-2026-0845',
    entryDate: '2026-09-23',
    deliveryDate: '2026-09-24',
    vehiclePlate: 'HYU-551',
    vehicleModel: 'Hyundai Tucson Limited 2024',
    clientName: 'Patricia Villanueva',
    clientDoc: '44819022',
    serviceType: 'Tratamiento Cerámico 9H + Polarizado Antiasalto 12 micras',
    laborCostSoles: 420,
    partsCostSoles: 470,
    subtotalSoles: 754.24,
    igvSoles: 135.76,
    totalSoles: 890,
    technician: 'Téc. Cristian Celis',
    branch: 'Sede Cajamarca Central',
    status: 'Completada y Facturada',
  },
];

export const INITIAL_QUOTATIONS_LEADS: QuotationLeadRecord[] = [
  {
    id: 'cot-001',
    quoteNumber: 'COT-NC-9821',
    quoteDate: '2026-09-25',
    clientName: 'Ing. Roberto Guevara Quiroz',
    documentNumber: '40981245',
    phone: '+51 976 543 210',
    email: 'rguevara@geosolutions.pe',
    interestType: 'Vehículo Nuevo',
    itemQuoted: 'Toyota Hilux 4x4 D/C SRV 2025 2.8 Turbo Diésel',
    quotedPriceSoles: 178560,
    quotedPriceUsd: 46990,
    initialPaymentProjectedUsd: 9400,
    salesAdvisor: 'Carlos Mendoza',
    branch: 'Sede Cajamarca Central',
    status: 'Test Drive Realizado',
  },
  {
    id: 'cot-002',
    quoteNumber: 'COT-NC-9822',
    quoteDate: '2026-09-24',
    clientName: 'Dra. Carmen Rosa Bazán',
    documentNumber: '09812455',
    phone: '+51 949 123 884',
    email: 'carmen.bazan@hospitalcaj.pe',
    interestType: 'Vehículo Nuevo',
    itemQuoted: 'Toyota RAV4 2.5L Hybrid Limited AWD 2025',
    quotedPriceSoles: 123460,
    quotedPriceUsd: 32490,
    initialPaymentProjectedUsd: 6500,
    salesAdvisor: 'Rodrigo Celis',
    branch: 'Sede Cajamarca Central',
    status: 'En Evaluación Crediticia',
  },
  {
    id: 'cot-003',
    quoteNumber: 'COT-NC-9823',
    quoteDate: '2026-09-23',
    clientName: 'Empresa Comunal de Transportes Porcón',
    documentNumber: '20491824901',
    phone: '+51 976 112 334',
    email: 'contacto@transporcon.com',
    interestType: 'Repuestos OEM',
    itemQuoted: 'Lote x12 Pastillas Brembo y Filtros Mann para Flota Hilux',
    quotedPriceSoles: 8450,
    quotedPriceUsd: 2235,
    salesAdvisor: 'Área Repuestos Nor Celis',
    branch: 'Sede Cajamarca Central',
    status: 'Seguimiento Activo',
  },
  {
    id: 'cot-004',
    quoteNumber: 'COT-NC-9824',
    quoteDate: '2026-09-21',
    clientName: 'Víctor Manuel Goicochea',
    documentNumber: '43901244',
    phone: '+51 984 551 290',
    email: 'vgoicochea@agroandino.com',
    interestType: 'Plan Retoma',
    itemQuoted: 'Tasación Toyota Fortuner 2019 a cuenta de Hilux 2025',
    quotedPriceSoles: 98000,
    quotedPriceUsd: 25800,
    salesAdvisor: 'Carlos Mendoza',
    branch: 'Sede Vía Evitamiento Sur',
    status: 'Venta Cerrada',
  },
];
