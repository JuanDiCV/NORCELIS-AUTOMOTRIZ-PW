import React, { useState } from 'react';
import {
  OFFICIAL_BANK_ACCOUNTS_SOLES,
  OFFICIAL_BANK_ACCOUNTS_DOLARES,
  OFFICIAL_DETRACTIONS_ACCOUNT,
  OFFICIAL_TERMS_AND_CONDITIONS,
} from '../../data/bankAccountsData';

interface BankAccountsListProps {
  onCopySuccess?: (msg: string) => void;
  compact?: boolean;
}

export const BankAccountsList: React.FC<BankAccountsListProps> = ({ onCopySuccess, compact = false }) => {
  const [activeTab, setActiveTab] = useState<'soles' | 'dolares' | 'detracciones'>('soles');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    if (onCopySuccess) {
      onCopySuccess(`${label} copiado al portapapeles: ${text}`);
    }
  };

  return (
    <div className={`w-full max-w-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs ${compact ? 'p-3 space-y-3' : 'p-4 sm:p-5 space-y-4'}`}>
      {/* Header */}
      <div className="flex flex-col gap-2.5 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#212955] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-sm text-[#F07F00]">account_balance</span>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-headline font-bold text-xs text-[#212955] leading-tight truncate">
              Cuentas Bancarias Oficiales
            </h4>
            <span className="text-[10px] text-gray-500 block truncate">
              NOR CELIS AUTOMOTRIZ S.A.C. • RUC 20608754129
            </span>
          </div>
        </div>

        {/* Currency Tabs - Responsive grid that never overflows */}
        <div className="grid grid-cols-3 bg-gray-100 p-1 rounded-xl text-center text-[11px] font-semibold gap-1 w-full">
          <button
            type="button"
            onClick={() => setActiveTab('soles')}
            className={`py-1.5 px-1 rounded-lg transition-all cursor-pointer truncate ${
              activeTab === 'soles'
                ? 'bg-white text-[#212955] shadow-xs font-bold'
                : 'text-gray-500 hover:text-[#212955]'
            }`}
          >
            Soles (PEN)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dolares')}
            className={`py-1.5 px-1 rounded-lg transition-all cursor-pointer truncate ${
              activeTab === 'dolares'
                ? 'bg-white text-[#212955] shadow-xs font-bold'
                : 'text-gray-500 hover:text-[#212955]'
            }`}
          >
            Dólares (USD)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('detracciones')}
            className={`py-1.5 px-1 rounded-lg transition-all cursor-pointer truncate ${
              activeTab === 'detracciones'
                ? 'bg-white text-[#212955] shadow-xs font-bold'
                : 'text-gray-500 hover:text-[#212955]'
            }`}
          >
            Detracciones
          </button>
        </div>
      </div>

      {/* Tab: Cuentas en Soles */}
      {activeTab === 'soles' && (
        <div className="space-y-2.5 animate-in fade-in duration-150 w-full max-w-full">
          {OFFICIAL_BANK_ACCOUNTS_SOLES.map((account, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#212955]/30 transition-all space-y-2 w-full max-w-full overflow-hidden"
            >
              {/* Bank header chip */}
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-xs text-[#212955] truncate">{account.bankName}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100/70 text-blue-800 shrink-0">
                  Soles PEN
                </span>
              </div>

              {/* Number and CCI Rows with integrated inline copy buttons */}
              <div className="space-y-1.5 text-xs">
                {/* Account Number */}
                <div className="bg-white rounded-lg border border-gray-200/90 p-2 flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] text-gray-500 uppercase font-semibold block tracking-wider">
                      N° Cuenta:
                    </span>
                    <span className="font-mono font-bold text-[#212955] text-xs select-all break-all block leading-tight">
                      {account.accountNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(account.accountNumber, `N° Cuenta ${account.bankName}`, `cta-${index}`)}
                    className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      copiedKey === `cta-${index}`
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    title="Copiar N° de Cuenta"
                  >
                    <span className="material-symbols-outlined text-xs">
                      {copiedKey === `cta-${index}` ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedKey === `cta-${index}` ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                {/* CCI */}
                <div className="bg-white rounded-lg border border-gray-200/90 p-2 flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] text-gray-500 uppercase font-semibold block tracking-wider">
                      CCI Interbancario:
                    </span>
                    <span className="font-mono text-gray-700 text-[11px] select-all break-all block leading-tight">
                      {account.cci}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(account.cci, `CCI ${account.bankName}`, `cci-${index}`)}
                    className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      copiedKey === `cci-${index}`
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#212955] hover:bg-[#181e40] text-white'
                    }`}
                    title="Copiar CCI Interbancario"
                  >
                    <span className="material-symbols-outlined text-xs text-[#F07F00]">
                      {copiedKey === `cci-${index}` ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedKey === `cci-${index}` ? '¡Copiado!' : 'Copiar CCI'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Cuentas en Dólares */}
      {activeTab === 'dolares' && (
        <div className="space-y-2.5 animate-in fade-in duration-150 w-full max-w-full">
          {OFFICIAL_BANK_ACCOUNTS_DOLARES.map((account, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#212955]/30 transition-all space-y-2 w-full max-w-full overflow-hidden"
            >
              {/* Bank header chip */}
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-xs text-[#212955] truncate">{account.bankName}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-800 shrink-0">
                  Dólares USD
                </span>
              </div>

              {/* Number and CCI Rows */}
              <div className="space-y-1.5 text-xs">
                {/* Account Number */}
                <div className="bg-white rounded-lg border border-gray-200/90 p-2 flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] text-gray-500 uppercase font-semibold block tracking-wider">
                      N° Cuenta USD:
                    </span>
                    <span className="font-mono font-bold text-[#212955] text-xs select-all break-all block leading-tight">
                      {account.accountNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(account.accountNumber, `N° Cuenta USD ${account.bankName}`, `cta-usd-${index}`)}
                    className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      copiedKey === `cta-usd-${index}`
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    title="Copiar N° de Cuenta USD"
                  >
                    <span className="material-symbols-outlined text-xs">
                      {copiedKey === `cta-usd-${index}` ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedKey === `cta-usd-${index}` ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                {/* CCI */}
                <div className="bg-white rounded-lg border border-gray-200/90 p-2 flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] text-gray-500 uppercase font-semibold block tracking-wider">
                      CCI USD Interbancario:
                    </span>
                    <span className="font-mono text-gray-700 text-[11px] select-all break-all block leading-tight">
                      {account.cci}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(account.cci, `CCI USD ${account.bankName}`, `cci-usd-${index}`)}
                    className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      copiedKey === `cci-usd-${index}`
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#212955] hover:bg-[#181e40] text-white'
                    }`}
                    title="Copiar CCI Interbancario USD"
                  >
                    <span className="material-symbols-outlined text-xs text-[#F07F00]">
                      {copiedKey === `cci-usd-${index}` ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedKey === `cci-usd-${index}` ? '¡Copiado!' : 'Copiar CCI'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Detracciones Banco de la Nación */}
      {activeTab === 'detracciones' && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2.5 animate-in fade-in duration-150 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-amber-700 shrink-0">account_balance</span>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-amber-900 uppercase block tracking-wider truncate">
                {OFFICIAL_DETRACTIONS_ACCOUNT.accountType}
              </span>
              <h5 className="font-headline font-bold text-xs text-[#212955] truncate">
                {OFFICIAL_DETRACTIONS_ACCOUNT.bankName}
              </h5>
            </div>
          </div>

          <p className="text-[11px] text-amber-900 leading-snug">
            {OFFICIAL_DETRACTIONS_ACCOUNT.description}
          </p>

          <div className="bg-white rounded-lg border border-amber-300 p-2 flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <span className="text-[9px] text-gray-500 uppercase font-semibold block tracking-wider">
                N° Cta. Detracciones SPOT:
              </span>
              <span className="font-mono font-black text-xs text-[#212955] select-all break-all block leading-tight">
                {OFFICIAL_DETRACTIONS_ACCOUNT.accountNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(OFFICIAL_DETRACTIONS_ACCOUNT.accountNumber, 'Cuenta Detracciones BN', 'detraccion-bn')}
              className={`shrink-0 px-2.5 py-1.5 text-[10px] font-bold rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                copiedKey === 'detraccion-bn'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#212955] hover:bg-[#181e40] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-xs text-[#F07F00]">
                {copiedKey === 'detraccion-bn' ? 'check' : 'content_copy'}
              </span>
              <span>{copiedKey === 'detraccion-bn' ? '¡Copiado!' : 'Copiar Cta.'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Official terms & instructions */}
      {!compact && (
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-2 w-full max-w-full overflow-hidden">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#212955] block">
            A Tomar en Cuenta:
          </span>
          <ul className="space-y-1 text-[11px] text-gray-600 list-disc list-inside">
            {OFFICIAL_TERMS_AND_CONDITIONS.map((term, i) => (
              <li key={i}>{term}</li>
            ))}
          </ul>
          <div className="pt-2 border-t border-gray-200 text-[11px] text-gray-500">
            <span>Envía tu constancia a nuestro WhatsApp oficial: <strong>+51 987 654 321</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
