import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle, AutoPart } from '../../types';
import {
  INITIAL_SALES_RECORDS,
  INITIAL_WORKSHOP_ORDERS,
  INITIAL_QUOTATIONS_LEADS,
  SaleRecord,
  WorkshopOrderRecord,
  QuotationLeadRecord,
} from '../../data/accountingMockData';
import {
  generateVehiclesCsv,
  generateAutoPartsCsv,
  generateSalesCsv,
  generateWorkshopOrdersCsv,
  generateQuotationsCsv,
  generateConsolidatedAccountingSummaryCsv,
  downloadCsvFile,
  CsvExportOptions,
} from '../../utils/csvExportService';

type ExportModule = 'sales' | 'vehicles' | 'parts' | 'workshop' | 'quotations' | 'consolidated';

export const AccountingExportCenter: React.FC = () => {
  const { vehicles, autoParts, showToast } = useApp();

  // Local state for sales, workshop and quotations (persisted in localStorage for dynamic admin management)
  const [salesRecords] = useState<SaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem('norcelis_sales_records');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_SALES_RECORDS;
  });

  const [workshopOrders] = useState<WorkshopOrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem('norcelis_workshop_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_WORKSHOP_ORDERS;
  });

  const [quotationsLeads] = useState<QuotationLeadRecord[]>(() => {
    try {
      const saved = localStorage.getItem('norcelis_quotations_leads');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_QUOTATIONS_LEADS;
  });

  // Filter State
  const [selectedModule, setSelectedModule] = useState<ExportModule>('sales');
  const [selectedBranch, setSelectedBranch] = useState<string>('todas');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [dateRangePreset, setDateRangePreset] = useState<'all' | 'today' | '7days' | '30days' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [delimiter, setDelimiter] = useState<',' | ';'>(',');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Calculate quick date filters
  const computedDateRange = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (dateRangePreset === 'today') {
      return { start: todayStr, end: todayStr };
    } else if (dateRangePreset === '7days') {
      const past = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start: past.toISOString().slice(0, 10), end: todayStr };
    } else if (dateRangePreset === '30days') {
      const past = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start: past.toISOString().slice(0, 10), end: todayStr };
    } else if (dateRangePreset === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: startOfMonth.toISOString().slice(0, 10), end: todayStr };
    } else if (dateRangePreset === 'custom') {
      return { start: startDate, end: endDate };
    }
    return { start: undefined, end: undefined };
  }, [dateRangePreset, startDate, endDate]);

  // Executive KPI summary metrics
  const kpis = useMemo(() => {
    const totalVehiclesValUsd = vehicles.reduce((sum, v) => sum + (v.priceUsd || 0), 0);
    const totalVehiclesValPen = totalVehiclesValUsd * 3.78;

    const totalPartsValPen = autoParts.reduce((sum, p) => {
      const match = (p.stockText || '').match(/\((\d+)\s*unidad/i);
      const qty = match ? parseInt(match[1]) : (p.stockText?.toLowerCase().includes('agotad') ? 0 : 8);
      return sum + (p.priceSoles * qty);
    }, 0);

    const totalSalesPen = salesRecords.reduce((sum, s) => {
      return sum + (s.currency === 'USD' ? s.totalAmount * s.exchangeRate : s.totalAmount);
    }, 0);

    const totalIgvPen = salesRecords.reduce((sum, s) => {
      return sum + (s.currency === 'USD' ? s.taxIgv * s.exchangeRate : s.taxIgv);
    }, 0);

    const totalWorkshopPen = workshopOrders.reduce((sum, o) => sum + o.totalSoles, 0);

    return {
      totalVehiclesValUsd,
      totalVehiclesValPen,
      totalPartsValPen,
      totalSalesPen,
      totalIgvPen,
      totalWorkshopPen,
      salesCount: salesRecords.length,
      vehiclesCount: vehicles.length,
      partsCount: autoParts.length,
      ordersCount: workshopOrders.length,
      quotationsCount: quotationsLeads.length,
    };
  }, [vehicles, autoParts, salesRecords, workshopOrders, quotationsLeads]);

  // Export Trigger Handler
  const handleExport = (module: ExportModule) => {
    const options: CsvExportOptions = {
      delimiter,
      includeBOM: true,
      branchFilter: selectedBranch,
      categoryFilter: selectedCategory,
      startDate: computedDateRange.start,
      endDate: computedDateRange.end,
    };

    let result: { csvString: string; rowCount: number; filename: string };

    switch (module) {
      case 'vehicles':
        result = generateVehiclesCsv(vehicles, options);
        break;
      case 'parts':
        result = generateAutoPartsCsv(autoParts, options);
        break;
      case 'sales':
        result = generateSalesCsv(salesRecords, options);
        break;
      case 'workshop':
        result = generateWorkshopOrdersCsv(workshopOrders, options);
        break;
      case 'quotations':
        result = generateQuotationsCsv(quotationsLeads, options);
        break;
      case 'consolidated':
        result = generateConsolidatedAccountingSummaryCsv(vehicles, autoParts, salesRecords, workshopOrders, options);
        break;
    }

    downloadCsvFile(result.csvString, result.filename);
    showToast(`Archivo CSV exportado exitosamente (${result.rowCount} registros exportados)`);
  };

  // Export ALL files in a batch
  const handleExportAllBatch = () => {
    const options: CsvExportOptions = { delimiter, includeBOM: true };
    const vResult = generateVehiclesCsv(vehicles, options);
    const pResult = generateAutoPartsCsv(autoParts, options);
    const sResult = generateSalesCsv(salesRecords, options);
    const wResult = generateWorkshopOrdersCsv(workshopOrders, options);
    const qResult = generateQuotationsCsv(quotationsLeads, options);
    const cResult = generateConsolidatedAccountingSummaryCsv(vehicles, autoParts, salesRecords, workshopOrders, options);

    downloadCsvFile(cResult.csvString, cResult.filename);
    setTimeout(() => downloadCsvFile(sResult.csvString, sResult.filename), 200);
    setTimeout(() => downloadCsvFile(vResult.csvString, vResult.filename), 400);
    setTimeout(() => downloadCsvFile(pResult.csvString, pResult.filename), 600);
    setTimeout(() => downloadCsvFile(wResult.csvString, wResult.filename), 800);
    setTimeout(() => downloadCsvFile(qResult.csvString, qResult.filename), 1000);

    showToast('Iniciando descarga de 6 reportes CSV para contabilidad externa...');
  };

  // Filtered preview data
  const previewData = useMemo(() => {
    const q = searchTerm.toLowerCase();

    if (selectedModule === 'sales') {
      return salesRecords.filter((s) => {
        const matchesSearch = !q || s.invoiceNumber.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q) || s.customerDocNumber.includes(q);
        const matchesBranch = selectedBranch === 'todas' || s.branch === selectedBranch;
        const matchesCategory = selectedCategory === 'todas' || s.saleCategory === selectedCategory;
        const matchesDate = (!computedDateRange.start || s.issueDate >= computedDateRange.start) && (!computedDateRange.end || s.issueDate <= computedDateRange.end);
        return matchesSearch && matchesBranch && matchesCategory && matchesDate;
      });
    } else if (selectedModule === 'vehicles') {
      return vehicles.filter((v) => {
        const matchesSearch = !q || v.name.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q);
        const matchesBranch = selectedBranch === 'todas' || (v.availability || '').toLowerCase().includes(selectedBranch.toLowerCase());
        const matchesCategory = selectedCategory === 'todas' || v.condition === selectedCategory;
        return matchesSearch && matchesBranch && matchesCategory;
      });
    } else if (selectedModule === 'parts') {
      return autoParts.filter((p) => {
        const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
        const matchesCategory = selectedCategory === 'todas' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });
    } else if (selectedModule === 'workshop') {
      return workshopOrders.filter((o) => {
        const matchesSearch = !q || o.orderNumber.toLowerCase().includes(q) || o.vehiclePlate.toLowerCase().includes(q) || o.clientName.toLowerCase().includes(q);
        const matchesBranch = selectedBranch === 'todas' || o.branch === selectedBranch;
        const matchesDate = (!computedDateRange.start || o.entryDate >= computedDateRange.start) && (!computedDateRange.end || o.entryDate <= computedDateRange.end);
        return matchesSearch && matchesBranch && matchesDate;
      });
    } else if (selectedModule === 'quotations') {
      return quotationsLeads.filter((cl) => {
        const matchesSearch = !q || cl.quoteNumber.toLowerCase().includes(q) || cl.clientName.toLowerCase().includes(q) || cl.itemQuoted.toLowerCase().includes(q);
        const matchesBranch = selectedBranch === 'todas' || cl.branch === selectedBranch;
        const matchesDate = (!computedDateRange.start || cl.quoteDate >= computedDateRange.start) && (!computedDateRange.end || cl.quoteDate <= computedDateRange.end);
        return matchesSearch && matchesBranch && matchesDate;
      });
    }
    return [];
  }, [selectedModule, salesRecords, vehicles, autoParts, workshopOrders, quotationsLeads, searchTerm, selectedBranch, selectedCategory, computedDateRange]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header & Executive Download Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#9D9D9C]/30 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#F07F00] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
              Módulo Contable &amp; ERP
            </span>
            <span className="text-[11px] font-bold text-[#212955] flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-emerald-600">verified</span>
              Compatibilidad UTF-8 Excel &amp; SUNAT
            </span>
          </div>
          <h2 className="font-headline font-bold text-base sm:text-lg text-[#212955] mt-1">
            Centro de Exportaciones Contables &amp; Reportes CSV
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Genera y descarga en formato CSV estructurado los listados de inventario de vehículos, stock de autopartes, registro de ventas, órdenes de taller y cotizaciones para auditoría contable.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleExport('consolidated')}
            className="min-h-[44px] px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#212955] rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs border border-gray-200"
            title="Descargar Resumen Ejecutivo de Cierre de Mes"
          >
            <span className="material-symbols-outlined text-base text-[#F07F00]">summarize</span>
            <span>Balance Ejecutivo CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportAllBatch}
            className="min-h-[44px] px-5 py-2.5 bg-[#212955] hover:bg-[#181e40] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
            title="Descarga todos los 6 libros contables e inventarios en un solo clic"
          >
            <span className="material-symbols-outlined text-base text-[#F07F00]">cloud_download</span>
            <span>Descargar Paquete Completo (6 CSVs)</span>
          </button>
        </div>
      </div>

      {/* Financial & Inventory KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Valor Inventario Autos */}
        <div className="bg-white p-4 rounded-2xl border border-[#9D9D9C]/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Valorización Autos 0km / Seminuevos
            </span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-[#212955]">
              <span className="material-symbols-outlined text-base">directions_car</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="font-headline font-black text-xl text-[#212955]">
              ${kpis.totalVehiclesValUsd.toLocaleString()} USD
            </div>
            <span className="text-[11px] text-gray-500 font-semibold">
              ≈ S/ {kpis.totalVehiclesValPen.toLocaleString()} PEN ({kpis.vehiclesCount} unidades)
            </span>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
            <span className="text-emerald-700 font-bold">Activo Corriente</span>
            <button
              type="button"
              onClick={() => handleExport('vehicles')}
              className="text-[#F07F00] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>CSV</span>
              <span className="material-symbols-outlined text-xs">download</span>
            </button>
          </div>
        </div>

        {/* KPI 2: Valor Stock Repuestos */}
        <div className="bg-white p-4 rounded-2xl border border-[#9D9D9C]/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Stock de Autopartes Almacén
            </span>
            <span className="p-1.5 rounded-lg bg-orange-50 text-[#F07F00]">
              <span className="material-symbols-outlined text-base">settings_suggest</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="font-headline font-black text-xl text-[#F07F00]">
              S/ {kpis.totalPartsValPen.toLocaleString()} PEN
            </div>
            <span className="text-[11px] text-gray-500 font-semibold">
              {kpis.partsCount} repuestos ({Math.round(kpis.totalPartsValPen / 3.78).toLocaleString()} USD)
            </span>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
            <span className="text-emerald-700 font-bold">Valorizado al costo</span>
            <button
              type="button"
              onClick={() => handleExport('parts')}
              className="text-[#F07F00] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>CSV</span>
              <span className="material-symbols-outlined text-xs">download</span>
            </button>
          </div>
        </div>

        {/* KPI 3: Ventas Facturadas */}
        <div className="bg-white p-4 rounded-2xl border border-[#9D9D9C]/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Facturación &amp; Ventas Registradas
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <span className="material-symbols-outlined text-base">receipt_long</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="font-headline font-black text-xl text-emerald-700">
              S/ {kpis.totalSalesPen.toLocaleString()} PEN
            </div>
            <span className="text-[11px] text-gray-500 font-semibold">
              {kpis.salesCount} comprobantes (Facturas y Boletas)
            </span>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
            <span className="text-gray-500">SUNAT Electrónico</span>
            <button
              type="button"
              onClick={() => handleExport('sales')}
              className="text-[#F07F00] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>CSV</span>
              <span className="material-symbols-outlined text-xs">download</span>
            </button>
          </div>
        </div>

        {/* KPI 4: Débito Fiscal IGV 18% */}
        <div className="bg-white p-4 rounded-2xl border border-[#9D9D9C]/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              IGV Fiscal 18% Recaudado
            </span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <span className="material-symbols-outlined text-base">account_balance</span>
            </span>
          </div>
          <div className="mt-2">
            <div className="font-headline font-black text-xl text-purple-700">
              S/ {kpis.totalIgvPen.toLocaleString()} PEN
            </div>
            <span className="text-[11px] text-gray-500 font-semibold">
              Liquidación mensual tributaria
            </span>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
            <span className="text-purple-700 font-bold">Impuesto a la Renta</span>
            <button
              type="button"
              onClick={() => handleExport('consolidated')}
              className="text-[#F07F00] font-bold hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>Reporte</span>
              <span className="material-symbols-outlined text-xs">download</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick 1-Click Export Cards Grid */}
      <div className="bg-white p-5 rounded-2xl border border-[#9D9D9C]/30 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-sm sm:text-base text-[#212955] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F07F00]">download_for_offline</span>
            <span>Descargas Rápidas por Módulo Contable (1 Clic)</span>
          </h3>
          <span className="text-xs text-gray-400 font-medium">Formato .CSV optimizado con UTF-8 BOM</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Ventas & Facturas */}
          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 hover:border-[#212955] transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#212955] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-emerald-600">receipt_long</span>
                  Registro de Ventas &amp; Facturación
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  {kpis.salesCount} docs
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                Facturas F001, Boletas B001, RUCs, IGV 18%, método de pago y asesores de venta.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleExport('sales')}
              className="w-full min-h-[36px] bg-white hover:bg-[#212955] text-[#212955] hover:text-white border border-gray-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-sm text-[#F07F00]">download</span>
              <span>Exportar Ventas a CSV</span>
            </button>
          </div>

          {/* Card 2: Inventario Vehículos */}
          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 hover:border-[#212955] transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#212955] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-blue-600">directions_car</span>
                  Inventario de Vehículos (0km y Seminuevos)
                </span>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {kpis.vehiclesCount} autos
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                Precios USD/PEN, costos estimados, márgenes brutos, disponibilidad y sedes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleExport('vehicles')}
              className="w-full min-h-[36px] bg-white hover:bg-[#212955] text-[#212955] hover:text-white border border-gray-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-sm text-[#F07F00]">download</span>
              <span>Exportar Inventario Autos CSV</span>
            </button>
          </div>

          {/* Card 3: Autopartes & Repuestos */}
          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 hover:border-[#212955] transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#212955] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-orange-600">settings_suggest</span>
                  Stock &amp; Catálogo de Autopartes
                </span>
                <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                  {kpis.partsCount} repuestos
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                SKUs internos, códigos OEM originales, valor total de inventario y stock físico.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleExport('parts')}
              className="w-full min-h-[36px] bg-white hover:bg-[#212955] text-[#212955] hover:text-white border border-gray-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-sm text-[#F07F00]">download</span>
              <span>Exportar Stock Repuestos CSV</span>
            </button>
          </div>

          {/* Card 4: Taller y Órdenes de Servicio */}
          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 hover:border-[#212955] transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#212955] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-cyan-600">build</span>
                  Órdenes de Trabajo &amp; Taller
                </span>
                <span className="text-[10px] font-bold bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded">
                  {kpis.ordersCount} OTs
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                Mano de obra, repuestos facturados en taller, placas de vehículos y técnicos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleExport('workshop')}
              className="w-full min-h-[36px] bg-white hover:bg-[#212955] text-[#212955] hover:text-white border border-gray-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-sm text-[#F07F00]">download</span>
              <span>Exportar Órdenes Taller CSV</span>
            </button>
          </div>

          {/* Card 5: Cotizaciones & Pipeline */}
          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 hover:border-[#212955] transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#212955] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-indigo-600">request_quote</span>
                  Cotizaciones &amp; Pipeline Comercial
                </span>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                  {kpis.quotationsCount} cotizaciones
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                Prospección de clientes, modelos cotizados, simulación de crédito y estado.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleExport('quotations')}
              className="w-full min-h-[36px] bg-white hover:bg-[#212955] text-[#212955] hover:text-white border border-gray-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-sm text-[#F07F00]">download</span>
              <span>Exportar Cotizaciones CSV</span>
            </button>
          </div>

          {/* Card 6: Balance Ejecutivo */}
          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 hover:border-[#212955] transition-all flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#212955] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-purple-600">account_balance_wallet</span>
                  Balance Contable Consolidado
                </span>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                  Informe General
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-snug">
                Resumen de inventario, ventas, recaudación de IGV y liquidación por sedes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleExport('consolidated')}
              className="w-full min-h-[36px] bg-white hover:bg-[#212955] text-[#212955] hover:text-white border border-gray-300 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-sm text-[#F07F00]">download</span>
              <span>Exportar Balance Consolidado</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Custom Filter & Live Preview Table */}
      <div className="bg-white p-5 rounded-2xl border border-[#9D9D9C]/30 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-headline font-bold text-base text-[#212955] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#F07F00]">tune</span>
              <span>Generador de Reportes Personalizados &amp; Previsualización en Vivo</span>
            </h3>
            <p className="text-xs text-gray-500">
              Aplica filtros por sede, fechas y categorías antes de generar el archivo CSV contable.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExport(selectedModule)}
              className="min-h-[42px] px-5 py-2 bg-[#F07F00] hover:bg-[#d97300] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Descargar CSV Seleccionado</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Module Selector */}
          <div>
            <label className="block text-[11px] font-bold text-[#212955] uppercase mb-1">
              Libro / Módulo Contable
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value as ExportModule)}
              className="w-full bg-gray-50 border border-[#9D9D9C]/30 rounded-xl px-3 py-2 text-xs text-[#212955] focus:outline-none min-h-[40px] cursor-pointer"
            >
              <option value="sales">Registro de Ventas &amp; Facturación</option>
              <option value="vehicles">Inventario de Vehículos (0km / Usados)</option>
              <option value="parts">Stock &amp; Catálogo de Autopartes</option>
              <option value="workshop">Órdenes de Trabajo de Taller</option>
              <option value="quotations">Cotizaciones &amp; Leads Comerciales</option>
            </select>
          </div>

          {/* Sede / Branch Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#212955] uppercase mb-1">
              Sede de Operación
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-gray-50 border border-[#9D9D9C]/30 rounded-xl px-3 py-2 text-xs text-[#212955] focus:outline-none min-h-[40px] cursor-pointer"
            >
              <option value="todas">Todas las Sedes (Consolidado)</option>
              <option value="Sede Cajamarca Central">Sede Cajamarca Central</option>
              <option value="Sede Vía Evitamiento Sur">Sede Vía Evitamiento Sur</option>
              <option value="Sede Jaén">Sede Jaén</option>
              <option value="Sede Trujillo">Sede Trujillo</option>
            </select>
          </div>

          {/* Date Range Preset */}
          <div>
            <label className="block text-[11px] font-bold text-[#212955] uppercase mb-1">
              Rango de Fechas
            </label>
            <select
              value={dateRangePreset}
              onChange={(e) => setDateRangePreset(e.target.value as any)}
              className="w-full bg-gray-50 border border-[#9D9D9C]/30 rounded-xl px-3 py-2 text-xs text-[#212955] focus:outline-none min-h-[40px] cursor-pointer"
            >
              <option value="all">Todo el Historial</option>
              <option value="today">Solo Hoy</option>
              <option value="7days">Últimos 7 Días</option>
              <option value="30days">Últimos 30 Días</option>
              <option value="month">Mes Actual (Septiembre)</option>
              <option value="custom">Rango Personalizado...</option>
            </select>
          </div>

          {/* Delimiter / Format */}
          <div>
            <label className="block text-[11px] font-bold text-[#212955] uppercase mb-1">
              Separador de Columnas
            </label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value as any)}
              className="w-full bg-gray-50 border border-[#9D9D9C]/30 rounded-xl px-3 py-2 text-xs text-[#212955] focus:outline-none min-h-[40px] cursor-pointer"
            >
              <option value=",">Coma ( , ) - Estándar Excel</option>
              <option value=";">Punto y Coma ( ; ) - Regional ES</option>
            </select>
          </div>

          {/* Quick Search */}
          <div>
            <label className="block text-[11px] font-bold text-[#212955] uppercase mb-1">
              Filtro Rápido de Búsqueda
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar en vista previa..."
                className="w-full bg-gray-50 border border-[#9D9D9C]/30 rounded-xl pl-8 pr-3 py-2 text-xs text-[#212955] focus:outline-none min-h-[40px]"
              />
            </div>
          </div>
        </div>

        {/* Custom date range inputs if selected */}
        {dateRangePreset === 'custom' && (
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-[#212955] mb-1">
                Fecha Desde (YYYY-MM-DD):
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-[#212955]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#212955] mb-1">
                Fecha Hasta (YYYY-MM-DD):
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-[#212955]"
              />
            </div>
          </div>
        )}

        {/* Live Preview Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-semibold">
              Previsualización de Datos ({previewData.length} registros que se incluirán en el archivo CSV):
            </span>
            <span className="text-[11px] text-gray-400">
              Codificación: UTF-8 con BOM (Compatible con Microsoft Excel, PowerBI y ERPs)
            </span>
          </div>

          <div className="border border-[#9D9D9C]/30 rounded-xl overflow-x-auto max-h-[380px] scrollbar-thin">
            <table className="w-full text-left text-xs text-[#212955]">
              {/* Table Header based on module */}
              <thead className="sticky top-0 bg-gray-100 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-600 font-bold">
                {selectedModule === 'sales' && (
                  <tr>
                    <th className="px-3 py-2.5">Comprobante</th>
                    <th className="px-3 py-2.5">Fecha</th>
                    <th className="px-3 py-2.5">Cliente / RUC</th>
                    <th className="px-3 py-2.5">Categoría</th>
                    <th className="px-3 py-2.5">Subtotal</th>
                    <th className="px-3 py-2.5">IGV (18%)</th>
                    <th className="px-3 py-2.5">Total</th>
                    <th className="px-3 py-2.5">Método Pago</th>
                    <th className="px-3 py-2.5">Sede</th>
                  </tr>
                )}
                {selectedModule === 'vehicles' && (
                  <tr>
                    <th className="px-3 py-2.5">Vehículo / Versión</th>
                    <th className="px-3 py-2.5">Marca</th>
                    <th className="px-3 py-2.5">Año</th>
                    <th className="px-3 py-2.5">Condición</th>
                    <th className="px-3 py-2.5">Precio USD</th>
                    <th className="px-3 py-2.5">Precio Soles</th>
                    <th className="px-3 py-2.5">Disponibilidad</th>
                  </tr>
                )}
                {selectedModule === 'parts' && (
                  <tr>
                    <th className="px-3 py-2.5">SKU / OEM</th>
                    <th className="px-3 py-2.5">Descripción Repuesto</th>
                    <th className="px-3 py-2.5">Marca</th>
                    <th className="px-3 py-2.5">Categoría</th>
                    <th className="px-3 py-2.5">Precio S/</th>
                    <th className="px-3 py-2.5">Stock</th>
                    <th className="px-3 py-2.5">Compatibilidad</th>
                  </tr>
                )}
                {selectedModule === 'workshop' && (
                  <tr>
                    <th className="px-3 py-2.5">Nro OT</th>
                    <th className="px-3 py-2.5">Fecha Ingreso</th>
                    <th className="px-3 py-2.5">Placa</th>
                    <th className="px-3 py-2.5">Cliente</th>
                    <th className="px-3 py-2.5">Servicio</th>
                    <th className="px-3 py-2.5">Mano Obra</th>
                    <th className="px-3 py-2.5">Repuestos</th>
                    <th className="px-3 py-2.5">Total S/</th>
                    <th className="px-3 py-2.5">Técnico</th>
                  </tr>
                )}
                {selectedModule === 'quotations' && (
                  <tr>
                    <th className="px-3 py-2.5">Nro Cotización</th>
                    <th className="px-3 py-2.5">Fecha</th>
                    <th className="px-3 py-2.5">Cliente</th>
                    <th className="px-3 py-2.5">Teléfono</th>
                    <th className="px-3 py-2.5">Producto / Auto</th>
                    <th className="px-3 py-2.5">Monto Cotizado</th>
                    <th className="px-3 py-2.5">Asesor</th>
                    <th className="px-3 py-2.5">Estado</th>
                  </tr>
                )}
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100 bg-white">
                {selectedModule === 'sales' &&
                  (previewData as SaleRecord[]).map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono font-bold text-[#212955]">{s.invoiceNumber}</td>
                      <td className="px-3 py-2">{s.issueDate}</td>
                      <td className="px-3 py-2">
                        <div className="font-semibold">{s.customerName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {s.customerDocType}: {s.customerDocNumber}
                        </div>
                      </td>
                      <td className="px-3 py-2">{s.saleCategory}</td>
                      <td className="px-3 py-2 font-mono">
                        {s.currency === 'USD' ? `$${s.subtotal.toFixed(2)}` : `S/ ${s.subtotal.toFixed(2)}`}
                      </td>
                      <td className="px-3 py-2 font-mono text-purple-700">
                        {s.currency === 'USD' ? `$${s.taxIgv.toFixed(2)}` : `S/ ${s.taxIgv.toFixed(2)}`}
                      </td>
                      <td className="px-3 py-2 font-mono font-bold text-[#F07F00]">
                        {s.currency === 'USD' ? `$${s.totalAmount.toLocaleString()} USD` : `S/ ${s.totalAmount.toLocaleString()} PEN`}
                      </td>
                      <td className="px-3 py-2 text-[11px]">{s.paymentMethod}</td>
                      <td className="px-3 py-2 text-[11px] text-gray-500">{s.branch}</td>
                    </tr>
                  ))}

                {selectedModule === 'vehicles' &&
                  (previewData as Vehicle[]).map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-semibold text-[#212955]">{v.name}</td>
                      <td className="px-3 py-2 font-bold">{v.brand}</td>
                      <td className="px-3 py-2">{v.year}</td>
                      <td className="px-3 py-2 capitalize">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.condition === 'nuevo' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                          {v.condition}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono font-bold">${v.priceUsd?.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono text-gray-600">S/ {v.priceSoles?.toLocaleString()}</td>
                      <td className="px-3 py-2 text-[11px] text-emerald-700 font-medium">{v.availability}</td>
                    </tr>
                  ))}

                {selectedModule === 'parts' &&
                  (previewData as AutoPart[]).map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono font-bold text-[#212955]">
                        <div>{p.sku}</div>
                        {p.oemCode && <div className="text-[10px] text-gray-400">OEM: {p.oemCode}</div>}
                      </td>
                      <td className="px-3 py-2 font-semibold text-[#212955]">{p.name}</td>
                      <td className="px-3 py-2">{p.brand}</td>
                      <td className="px-3 py-2 capitalize">{p.category}</td>
                      <td className="px-3 py-2 font-mono font-bold text-[#F07F00]">S/ {p.priceSoles.toLocaleString()}</td>
                      <td className="px-3 py-2 text-[11px] text-emerald-700 font-semibold">{p.stockText}</td>
                      <td className="px-3 py-2 text-[11px] text-gray-500 max-w-[150px] truncate">{p.compatibleVehicle}</td>
                    </tr>
                  ))}

                {selectedModule === 'workshop' &&
                  (previewData as WorkshopOrderRecord[]).map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono font-bold text-[#212955]">{o.orderNumber}</td>
                      <td className="px-3 py-2">{o.entryDate}</td>
                      <td className="px-3 py-2 font-mono font-black bg-gray-100 px-1 rounded">{o.vehiclePlate}</td>
                      <td className="px-3 py-2 font-medium">{o.clientName}</td>
                      <td className="px-3 py-2 text-[11px] max-w-[180px] truncate">{o.serviceType}</td>
                      <td className="px-3 py-2 font-mono">S/ {o.laborCostSoles.toFixed(2)}</td>
                      <td className="px-3 py-2 font-mono">S/ {o.partsCostSoles.toFixed(2)}</td>
                      <td className="px-3 py-2 font-mono font-bold text-cyan-800">S/ {o.totalSoles.toFixed(2)}</td>
                      <td className="px-3 py-2 text-[11px] text-gray-500">{o.technician}</td>
                    </tr>
                  ))}

                {selectedModule === 'quotations' &&
                  (previewData as QuotationLeadRecord[]).map((q) => (
                    <tr key={q.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono font-bold text-[#212955]">{q.quoteNumber}</td>
                      <td className="px-3 py-2">{q.quoteDate}</td>
                      <td className="px-3 py-2 font-medium">{q.clientName}</td>
                      <td className="px-3 py-2 font-mono text-[11px]">{q.phone}</td>
                      <td className="px-3 py-2 text-[11px] max-w-[200px] truncate">{q.itemQuoted}</td>
                      <td className="px-3 py-2 font-mono font-bold text-indigo-700">
                        ${q.quotedPriceUsd.toLocaleString()} USD (S/ {q.quotedPriceSoles.toLocaleString()})
                      </td>
                      <td className="px-3 py-2 text-[11px]">{q.salesAdvisor}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-800">
                          {q.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
