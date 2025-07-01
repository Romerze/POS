
import React, { useState, useEffect } from 'react';
import { DocumentChartBarIcon, PresentationChartLineIcon, TableCellsIcon, BanknotesIcon as HeroBanknotesIcon, ArrowTrendingUpIcon, WalletIcon } from '@heroicons/react/24/outline'; // Renamed to avoid conflict
import Button from '../common/Button';
import Input from '../common/Input';
import { Sale, Product, TopSellingProductReportItem, ProfitMarginsReport, CashRegisterSession } from '../../types'; 
import { fetchSalesByDateRange, fetchTopSellingProducts, fetchProfitMarginsReport, fetchCashRegisterSessionsReport } from '../../services/apiService'; 
import { DEFAULT_CURRENCY_SYMBOL } from '../../constants';
import Spinner from '../common/Spinner';

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  isSelected?: boolean;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, icon, onClick, isSelected }) => (
  <div 
    className={`bg-white shadow-lg rounded-xl p-6 hover:shadow-primary/30 transition-all duration-200 cursor-pointer ${isSelected ? 'ring-2 ring-primary shadow-primary/20' : 'hover:ring-1 hover:ring-primary/50'}`} 
    onClick={onClick}
  >
    <div className="flex items-center space-x-4 mb-3">
      <div className={`p-3 rounded-full ${isSelected ? 'bg-primary text-white' : 'bg-primary-light text-primary'}`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-neutral-dark">{title}</h3>
    </div>
    <p className="text-sm text-gray-600 mb-3 min-h-[3rem]">{description}</p>
    <Button variant={isSelected ? "primary" : "outline"} size="sm" className="w-full" tabIndex={-1}>
      {isSelected ? 'Viendo Reporte' : 'Generar Reporte'}
    </Button>
  </div>
);

type ReportType = 'salesByPeriod' | 'topSellingProducts' | 'profitMargins' | 'cashMovements' | null;

const ReportsPage: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [selectedReport, setSelectedReport] = useState<ReportType>(null);
  const [reportData, setReportData] = useState<Sale[] | TopSellingProductReportItem[] | ProfitMarginsReport[] | CashRegisterSession[]>([]);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string>(firstDayOfMonth);
  const [endDate, setEndDate] = useState<string>(today);


  const generateReport = async (type: ReportType | null = selectedReport) => { // Allow re-generating current report
    if (!type) {
      setReportData([]);
      setReportError(null);
      setSelectedReport(null);
      return;
    }
    
    setSelectedReport(type); // Ensure type is set if called directly
    setLoadingReport(true);
    setReportData([]);
    setReportError(null);

    try {
      if (!startDate || !endDate) {
          setReportError("Por favor, seleccione un rango de fechas válido.");
          setLoadingReport(false);
          return;
        }
      const sDate = new Date(startDate);
      const eDate = new Date(endDate);
      if (sDate > eDate) {
          setReportError("La fecha de inicio no puede ser posterior a la fecha de fin.");
          setLoadingReport(false);
          return;
      }


      if (type === 'salesByPeriod') {
        const sales = await fetchSalesByDateRange(startDate, endDate);
        setReportData(sales);
      } else if (type === 'topSellingProducts') {
        const topProducts = await fetchTopSellingProducts(startDate, endDate, 10);
        setReportData(topProducts);
      } else if (type === 'profitMargins') {
        const profitReport = await fetchProfitMarginsReport(startDate, endDate);
        setReportData([profitReport]); // Wrap in array to match other data types for simplicity
      } else if (type === 'cashMovements') {
        const cashSessions = await fetchCashRegisterSessionsReport(startDate, endDate);
        setReportData(cashSessions);
      } else {
         alert(`Generar reporte para "${type}" (aún no implementado con datos reales).`);
      }
    } catch (err: any) {
      setReportError(err.message || `Error al generar el reporte de ${type}.`);
    } finally {
      setLoadingReport(false);
    }
  };
  
  const reportConfig = [
    {
      type: 'salesByPeriod' as ReportType,
      title: "Ventas por Periodo",
      description: "Analiza las ventas totales por día, semana, mes o rango personalizado.",
      icon: <PresentationChartLineIcon className="h-8 w-8" />,
    },
    {
      type: 'topSellingProducts' as ReportType,
      title: "Productos Más Vendidos",
      description: "Identifica tus productos estrella y su rendimiento en ventas y valor.",
      icon: <ArrowTrendingUpIcon className="h-8 w-8" />,
    },
    {
      type: 'profitMargins' as ReportType,
      title: "Ganancias y Márgenes",
      description: "Calcula la rentabilidad general de las ventas en un periodo.",
      icon: <DocumentChartBarIcon className="h-8 w-8" />,
    },
     {
      type: 'cashMovements' as ReportType,
      title: "Movimientos de Caja",
      description: "Historial de aperturas, cierres y arqueos de caja en un periodo.",
      icon: <WalletIcon className="h-8 w-8" />, // Changed Icon
    },
  ];


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-dark">Reportes y Estadísticas</h1>
        <p className="text-gray-600 mt-1">Obtén información valiosa sobre el rendimiento de tu negocio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
        {reportConfig.map(report => (
          <ReportCard 
            key={report.type} 
            title={report.title} 
            description={report.description} 
            icon={report.icon}
            onClick={() => generateReport(report.type)} 
            isSelected={selectedReport === report.type}
          />
        ))}
      </div>
      
      {selectedReport && (
        <div className="mb-8 p-4 bg-white shadow rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Filtros para: {reportConfig.find(r => r.type === selectedReport)?.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <Input type="date" label="Fecha Inicio" value={startDate} onChange={e => setStartDate(e.target.value)} max={endDate}/>
                <Input type="date" label="Fecha Fin" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} max={today}/>
                <Button onClick={() => generateReport()} disabled={loadingReport || !startDate || !endDate} className="h-10">
                    {loadingReport ? 'Generando...' : 'Aplicar Filtros'}
                </Button>
            </div>
        </div>
      )}

      {/* Report Display Area */}
      {selectedReport && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Resultados del Reporte: {reportConfig.find(r => r.type === selectedReport)?.title}
            </h2>
            {loadingReport && <div className="flex justify-center p-10"><Spinner size="lg"/></div>}
            {reportError && <p className="text-red-500 bg-red-50 p-3 rounded">{reportError}</p>}
            
            {!loadingReport && !reportError && reportData.length === 0 && (
                <p className="text-gray-500">No hay datos para mostrar para los criterios seleccionados.</p>
            )}

            {!loadingReport && !reportError && reportData.length > 0 && selectedReport === 'salesByPeriod' && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Ticket/Factura</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Fecha</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 hidden md:table-cell">Cliente</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 hidden sm:table-cell">Cajero</th>
                                <th className="px-4 py-2 text-right font-medium text-gray-500">Total</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(reportData as Sale[]).map(sale => (
                                <tr key={sale.id}>
                                    <td className="px-4 py-2 whitespace-nowrap">{sale.ticketNumber || sale.invoiceNumber}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{new Date(sale.timestamp).toLocaleDateString()}</td>
                                    <td className="px-4 py-2 whitespace-nowrap hidden md:table-cell">{sale.customerName || 'N/A'}</td>
                                    <td className="px-4 py-2 whitespace-nowrap hidden sm:table-cell">{sale.cashierName || 'N/A'}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-right">{DEFAULT_CURRENCY_SYMBOL}{sale.grandTotal.toFixed(2)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            sale.status === 'pagada' ? 'bg-green-100 text-green-800' : 
                                            sale.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                            {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                         <tfoot>
                            <tr>
                                <td colSpan={4} className="px-4 py-2 text-right font-bold text-gray-700">Total Ventas del Periodo:</td>
                                <td className="px-4 py-2 text-right font-bold text-gray-700">
                                    {DEFAULT_CURRENCY_SYMBOL}{(reportData as Sale[]).reduce((sum, sale) => sum + sale.grandTotal, 0).toFixed(2)}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
            {!loadingReport && !reportError && reportData.length > 0 && selectedReport === 'topSellingProducts' && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium text-gray-500">Producto (SKU)</th>
                                <th className="px-4 py-2 text-right font-medium text-gray-500">Cant. Vendida</th>
                                <th className="px-4 py-2 text-right font-medium text-gray-500">Valor Total Vendido</th>
                                <th className="px-4 py-2 text-left font-medium text-gray-500 w-1/3">Popularidad (Visual)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(reportData as TopSellingProductReportItem[]).map((p, index) => {
                                const maxVal = (reportData as TopSellingProductReportItem[])[0]?.totalValueSold || 1; // Avoid division by zero
                                const barWidth = Math.max(5, (p.totalValueSold / maxVal) * 100);
                                return (
                                <tr key={p.productId}>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <div>{p.productName}</div>
                                        <div className="text-xs text-gray-400">SKU: {p.sku}</div>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-right">{p.totalQuantitySold}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-right">{DEFAULT_CURRENCY_SYMBOL}{p.totalValueSold.toFixed(2)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="w-full bg-gray-200 rounded h-4">
                                            <div style={{ width: `${barWidth}%`}} className="bg-primary h-4 rounded text-xs text-white text-right pr-1">
                                                {barWidth > 15 ? `${barWidth.toFixed(0)}%` : ''}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            )}
            {!loadingReport && !reportError && reportData.length > 0 && selectedReport === 'profitMargins' && (
                <div>
                    {(reportData as ProfitMarginsReport[]).map((profit, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
                            <div className="bg-blue-50 p-4 rounded-lg shadow">
                                <p className="text-sm text-blue-700">Ventas Analizadas</p>
                                <p className="text-2xl font-bold text-blue-800">{profit.numberOfSalesAnalyzed}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg shadow">
                                <p className="text-sm text-green-700">Ingresos Totales</p>
                                <p className="text-2xl font-bold text-green-800">{DEFAULT_CURRENCY_SYMBOL}{profit.totalRevenue.toFixed(2)}</p>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg shadow">
                                <p className="text-sm text-yellow-700">Costo de Bienes (COGS)</p>
                                <p className="text-2xl font-bold text-yellow-800">{DEFAULT_CURRENCY_SYMBOL}{profit.totalCOGS.toFixed(2)}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg shadow">
                                <p className="text-sm text-purple-700">Ganancia Bruta</p>
                                <p className="text-2xl font-bold text-purple-800">{DEFAULT_CURRENCY_SYMBOL}{profit.grossProfit.toFixed(2)}</p>
                            </div>
                            <div className="bg-pink-50 p-4 rounded-lg shadow md:col-span-2 lg:col-span-1">
                                <p className="text-sm text-pink-700">Margen de Ganancia</p>
                                <p className="text-2xl font-bold text-pink-800">{profit.profitMarginPercentage.toFixed(2)}%</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
             {!loadingReport && !reportError && reportData.length > 0 && selectedReport === 'cashMovements' && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-500">Apertura</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-500 hidden md:table-cell">Cierre</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-500">Usuario</th>
                                <th className="px-3 py-2 text-right font-medium text-gray-500">Inicial</th>
                                <th className="px-3 py-2 text-right font-medium text-gray-500 hidden sm:table-cell">Vtas. Efec.</th>
                                <th className="px-3 py-2 text-right font-medium text-gray-500 hidden lg:table-cell">Contado</th>
                                <th className="px-3 py-2 text-right font-medium text-gray-500">Diferencia</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-500">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(reportData as CashRegisterSession[]).map(session => (
                                <tr key={session.id}>
                                    <td className="px-3 py-2 whitespace-nowrap">{new Date(session.openingTime).toLocaleString()}</td>
                                    <td className="px-3 py-2 whitespace-nowrap hidden md:table-cell">{session.closingTime ? new Date(session.closingTime).toLocaleString() : 'N/A'}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{session.userName || session.userId}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-right">{DEFAULT_CURRENCY_SYMBOL}{session.initialCash.toFixed(2)}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-right hidden sm:table-cell">{DEFAULT_CURRENCY_SYMBOL}{(session.totalSalesCash || 0).toFixed(2)}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-right hidden lg:table-cell">{session.countedCash ? DEFAULT_CURRENCY_SYMBOL+session.countedCash.toFixed(2) : 'N/A'}</td>
                                    <td className={`px-3 py-2 whitespace-nowrap text-right font-semibold ${session.difference && session.difference < 0 ? 'text-red-600' : session.difference && session.difference > 0 ? 'text-green-600' : ''}`}>
                                        {session.difference ? DEFAULT_CURRENCY_SYMBOL+session.difference.toFixed(2) : 'N/A'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            session.status === 'abierta' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
      )}
       {!selectedReport && (
         <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Panel de Indicadores (Dashboard Resumido)</h2>
            <p className="text-gray-600">
                Seleccione un tipo de reporte para ver los datos. Esta sección podría mostrar gráficos y KPIs clave.
            </p>
            <div className="mt-4 p-8 border border-dashed border-gray-300 rounded-md text-center text-gray-400">
                (Espacio para Gráficos y KPIs Visuales - Seleccione un reporte para ver detalles)
            </div>
        </div>
       )}
    </div>
  );
};

export default ReportsPage;
