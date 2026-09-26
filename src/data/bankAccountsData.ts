export interface BankAccount {
  bankName: string;
  currency: 'PEN' | 'USD';
  currencyLabel: string;
  accountNumber: string;
  cci: string;
  logo: string; // Material symbol or brand identifier
  colorClass: string;
}

export interface BankDetractionAccount {
  bankName: string;
  accountNumber: string;
  accountType: string;
  description: string;
}

export const OFFICIAL_BANK_ACCOUNTS_SOLES: BankAccount[] = [
  {
    bankName: 'BCP (Banco de Crédito del Perú)',
    currency: 'PEN',
    currencyLabel: 'Cuenta Corriente - Soles',
    accountNumber: '245-9966172-0-49',
    cci: '002-245-00996617204992',
    logo: 'account_balance',
    colorClass: 'text-[#002A8F] bg-[#EBF1FF] border-[#002A8F]/20',
  },
  {
    bankName: 'BBVA Perú',
    currency: 'PEN',
    currencyLabel: 'Cuenta Corriente - Soles',
    accountNumber: '0011-0248-0100034831',
    cci: '011-248-000-100034831-26',
    logo: 'account_balance',
    colorClass: 'text-[#004481] bg-[#EAF2FB] border-[#004481]/20',
  },
  {
    bankName: 'Scotiabank Perú',
    currency: 'PEN',
    currencyLabel: 'Cuenta Corriente - Soles',
    accountNumber: '000-4949476',
    cci: '00963200000494947000',
    logo: 'account_balance',
    colorClass: 'text-[#EC111A] bg-[#FDECEC] border-[#EC111A]/20',
  },
];

export const OFFICIAL_BANK_ACCOUNTS_DOLARES: BankAccount[] = [
  {
    bankName: 'BCP (Banco de Crédito del Perú)',
    currency: 'USD',
    currencyLabel: 'Cuenta Corriente - Dólares',
    accountNumber: '245-9964344-1-94',
    cci: '002-245-00996434419494',
    logo: 'monetization_on',
    colorClass: 'text-[#002A8F] bg-[#EBF1FF] border-[#002A8F]/20',
  },
  {
    bankName: 'BBVA Perú',
    currency: 'USD',
    currencyLabel: 'Cuenta Corriente - Dólares',
    accountNumber: '0011-0248-0100034874',
    cci: '011-248-000100034874-26',
    logo: 'monetization_on',
    colorClass: 'text-[#004481] bg-[#EAF2FB] border-[#004481]/20',
  },
];

export const OFFICIAL_DETRACTIONS_ACCOUNT: BankDetractionAccount = {
  bankName: 'Banco de la Nación',
  accountNumber: '00-772-001053',
  accountType: 'Cuenta Corriente de Detracciones SUNAT',
  description: 'Para operaciones afectas al Sistema de Pago de Obligaciones Tributarias (SPOT)',
};

export const OFFICIAL_TERMS_AND_CONDITIONS = [
  'La presente cotización tiene validez por 7 días, los productos tienen un stock limitado.',
  'Los precios pueden variar según diagnóstico final del vehículo o disponibilidad de repuestos al momento de la confirmación del vehículo.',
  'Gracias por confiar en NORCELIS AUTOMOTRIZ especialistas en autopartes, accesorios y servicios automotrices.',
];

export const SHALOM_DESTINATIONS = [
  { id: 'cajamarca-local', label: 'Cajamarca Ciudad & Alrededores', cost: 0, estimatedTime: 'Mismo día / 24 horas', agencyOption: true },
  { id: 'provincias-norte', label: 'Provincias Norte (Trujillo, Chiclayo, Piura)', cost: 18, estimatedTime: '24 a 36 horas', agencyOption: true },
  { id: 'lima-metropolitana', label: 'Lima Metropolitana & Callao', cost: 22, estimatedTime: '24 a 48 horas', agencyOption: true },
  { id: 'jaen-amazonas', label: 'Jaén, Chachapoyas & Bagua', cost: 15, estimatedTime: '24 horas', agencyOption: true },
  { id: 'sierra-central-sur', label: 'Sierra Central & Sur (Arequipa, Cusco, Huancayo)', cost: 28, estimatedTime: '48 horas', agencyOption: true },
];
