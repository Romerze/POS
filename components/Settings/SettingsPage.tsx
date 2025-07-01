
import React, { useState, useEffect, useCallback } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { BuildingStorefrontIcon, Cog8ToothIcon, CurrencyDollarIcon, PrinterIcon, SparklesIcon, ListBulletIcon, PlusCircleIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { AppSettings, DocumentSerieSetting, DocumentType, Permission } from '../../types';
import { fetchAppSettings, updateAppSettings } from '../../services/apiService';
import Spinner from '../common/Spinner';
import { useAuth } from '../../hooks/useAuth';

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon, children }) => (
  <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
    <div className="flex items-center space-x-3 mb-4 border-b pb-3">
      {icon}
      <h2 className="text-xl font-semibold text-neutral-dark">{title}</h2>
    </div>
    {children}
  </div>
);

const DocumentTypeLabels: Record<DocumentType, string> = {
    factura: "Factura Electrónica",
    boleta: "Boleta de Venta Electrónica",
    nota_credito: "Nota de Crédito",
    nota_debito: "Nota de Débito",
    ticket_venta: "Ticket de Venta",
    guia_remision: "Guía de Remisión"
};


const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State for Document Series Modal
  const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
  const [editingSerie, setEditingSerie] = useState<DocumentSerieSetting | null>(null);
  const [currentSerieData, setCurrentSerieData] = useState<Partial<DocumentSerieSetting>>({
    documentType: 'ticket_venta',
    serie: '',
    currentNumber: 1,
    isActive: true,
  });

  const { hasPermission } = useAuth();
  const canManageSettings = hasPermission(Permission.MANAGE_SETTINGS);


  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedSettings = await fetchAppSettings();
      setSettings(fetchedSettings);
      if (!fetchedSettings.documentSeries) {
        setSettings(prev => prev ? ({...prev, documentSeries: []}) : null);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar la configuración.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!settings) return;
    const { name, value, type } = e.target;
    let processedValue: string | number = value;
    if (type === 'number') {
      processedValue = parseFloat(value) || 0;
    }
    setSettings(prev => prev ? ({ ...prev, [name]: processedValue }) : null);
    setSuccessMessage(null); 
  };
  
  const handleSerieChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean = value;
    if (type === 'number') processedValue = parseInt(value, 10) || 1;
    if (name === 'isActive') processedValue = (e.target as HTMLSelectElement).value === 'true';

    setCurrentSerieData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleOpenSerieModal = (serie: DocumentSerieSetting | null = null) => {
    if (!canManageSettings) {
        alert("No tiene permisos para gestionar series de documentos.");
        return;
    }
    if (serie) {
        setEditingSerie(serie);
        setCurrentSerieData({...serie});
    } else {
        setEditingSerie(null);
        setCurrentSerieData({ documentType: 'ticket_venta', serie: '', currentNumber: 1, isActive: true });
    }
    setIsSeriesModalOpen(true);
  };
  
  const handleSerieSubmit = () => {
    if (!canManageSettings) return;
    if (!currentSerieData.serie || !currentSerieData.documentType) {
        alert("El tipo de documento y la serie son obligatorios.");
        return;
    }
    if (currentSerieData.currentNumber === undefined || currentSerieData.currentNumber < 1) {
        alert("El correlativo actual debe ser 1 o mayor.");
        return;
    }

    setSettings(prevSettings => {
        if (!prevSettings) return null;
        let updatedSeries = [...(prevSettings.documentSeries || [])];
        if (editingSerie) { // Editing existing
            updatedSeries = updatedSeries.map(s => s.id === editingSerie.id ? { ...editingSerie, ...currentSerieData } as DocumentSerieSetting : s);
        } else { // Adding new
            const newSerieToAdd: DocumentSerieSetting = {
                id: `serie_${Date.now()}`, // Simple unique ID
                documentType: currentSerieData.documentType!,
                serie: currentSerieData.serie!.toUpperCase(),
                currentNumber: currentSerieData.currentNumber!,
                isActive: currentSerieData.isActive !== undefined ? currentSerieData.isActive : true,
            };
            updatedSeries.push(newSerieToAdd);
        }
        return { ...prevSettings, documentSeries: updatedSeries };
    });
    setIsSeriesModalOpen(false);
    setSuccessMessage(null); // Clear overall success message if any
  };
  
  const handleDeleteSerie = (serieId: string) => {
    if (!canManageSettings) {
        alert("No tiene permisos para eliminar series de documentos.");
        return;
    }
    if (window.confirm("¿Está seguro de eliminar esta serie de documento?")) {
        setSettings(prevSettings => {
            if (!prevSettings || !prevSettings.documentSeries) return prevSettings;
            const updatedSeries = prevSettings.documentSeries.filter(s => s.id !== serieId);
            return { ...prevSettings, documentSeries: updatedSeries };
        });
        setSuccessMessage(null);
    }
  };


  const handleSaveChanges = async () => {
    if (!settings || !canManageSettings) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await updateAppSettings(settings);
      setSuccessMessage("Configuración guardada con éxito.");
    } catch (err: any) {
      setError(err.message || "Error al guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error && !settings) {
    return <div className="text-center text-red-500 p-4 bg-red-50 rounded-md shadow">{error}</div>;
  }
  
  if (!settings) {
     return <div className="text-center text-gray-500 p-4">No se pudo cargar la configuración.</div>;
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-dark">Configuración General</h1>
        <p className="text-gray-600 mt-1">Personaliza los parámetros globales de tu sistema POS.</p>
      </div>

      {error && <p className="mb-4 text-red-500 p-3 bg-red-100 rounded text-center">{error}</p>}
      {successMessage && <p className="mb-4 text-green-600 p-3 bg-green-100 rounded text-center">{successMessage}</p>}


      <SettingsSection title="Información del Negocio" icon={<BuildingStorefrontIcon className="h-7 w-7 text-primary" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            name="businessName"
            label="Nombre del Negocio" 
            value={settings.businessName} 
            onChange={handleChange} 
            disabled={!canManageSettings}
          />
          <Input 
            name="logoUrl"
            label="URL del Logo" 
            value={settings.logoUrl || ''} 
            onChange={handleChange} 
            placeholder="https://ejemplo.com/logo.png"
            disabled={!canManageSettings}
          />
          {settings.logoUrl && <img src={settings.logoUrl} alt="Logo del negocio" className="mt-2 h-16 object-contain border rounded-md p-2"/>}
        </div>
      </SettingsSection>

      <SettingsSection title="Parámetros Financieros" icon={<CurrencyDollarIcon className="h-7 w-7 text-primary" />}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
                name="currencySymbol"
                label="Símbolo de Moneda" 
                value={settings.currencySymbol} 
                onChange={handleChange}
                placeholder="Ej: $, €, S/"
                disabled={!canManageSettings}
            />
            <Input 
                name="taxRatePercentage"
                label="Tasa de Impuesto Predeterminada (%)" 
                type="number"
                value={settings.taxRatePercentage.toString()} 
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                disabled={!canManageSettings}
            />
        </div>
      </SettingsSection>
      
      <SettingsSection title="Impresión y Comprobantes" icon={<PrinterIcon className="h-7 w-7 text-primary" />}>
        <Input 
            name="ticketHeaderText"
            label="Texto de Cabecera del Ticket" 
            placeholder="Ej: Gracias por su compra" 
            value={settings.ticketHeaderText || ''}
            onChange={handleChange}
            disabled={!canManageSettings}
        />
        <Input 
            name="ticketFooterText"
            label="Texto de Pie de Ticket" 
            placeholder="Ej: Visítenos pronto" 
            value={settings.ticketFooterText || ''}
            onChange={handleChange}
            containerClassName="mb-6"
            disabled={!canManageSettings}
        />
        
        <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center mb-3">
                 <h3 className="text-md font-semibold text-gray-700">Series y Numeraciones de Comprobantes</h3>
                 {canManageSettings && (
                    <Button onClick={() => handleOpenSerieModal()} variant="outline" size="sm" leftIcon={<PlusCircleIcon className="h-4 w-4"/>}>
                        Añadir Serie
                    </Button>
                 )}
            </div>
            {(settings.documentSeries && settings.documentSeries.length > 0) ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-500">Tipo Doc.</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-500">Serie</th>
                                <th className="px-3 py-2 text-right font-medium text-gray-500">Correlativo Actual</th>
                                <th className="px-3 py-2 text-center font-medium text-gray-500">Estado</th>
                                {canManageSettings && <th className="px-3 py-2 text-center font-medium text-gray-500">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {settings.documentSeries.map(serie => (
                                <tr key={serie.id}>
                                    <td className="px-3 py-2 whitespace-nowrap">{DocumentTypeLabels[serie.documentType] || serie.documentType}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">{serie.serie}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-right">{serie.currentNumber}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-center">
                                        <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${serie.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {serie.isActive ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    {canManageSettings && (
                                        <td className="px-3 py-2 whitespace-nowrap text-center">
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenSerieModal(serie)} className="p-1 text-primary hover:text-primary-dark" title="Editar Serie">
                                                <PencilSquareIcon className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSerie(serie.id)} className="p-1 text-red-500 hover:text-red-700 ml-1" title="Eliminar Serie">
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 text-center py-3">No hay series de documentos configuradas.</p>
            )}
        </div>
      </SettingsSection>
      
      <SettingsSection title="Personalización de Interfaz" icon={<SparklesIcon className="h-7 w-7 text-primary" />}>
        <p className="text-gray-500 text-sm mb-4">Ajusta la apariencia del sistema.</p>
        <label className="block text-sm font-medium text-gray-700 mb-1">Color Principal (Esquema - Visualización)</label>
        <div className="flex space-x-2">
            <button className="h-8 w-8 rounded-full bg-cyan-500 ring-2 ring-offset-2 ring-cyan-500 focus:outline-none" title="Cyan (Actual)" disabled={!canManageSettings}></button>
            <button className="h-8 w-8 rounded-full bg-blue-500 hover:ring-2 hover:ring-offset-2 hover:ring-blue-500 focus:outline-none" title="Azul (Ejemplo)" disabled={!canManageSettings}></button>
            <button className="h-8 w-8 rounded-full bg-indigo-500 hover:ring-2 hover:ring-offset-2 hover:ring-indigo-500 focus:outline-none" title="Indigo (Ejemplo)" disabled={!canManageSettings}></button>
        </div>
         <p className="text-xs text-gray-400 mt-2">La selección de tema no está implementada funcionalmente.</p>
      </SettingsSection>

       <SettingsSection title="Integraciones Externas" icon={<Cog8ToothIcon className="h-7 w-7 text-primary" />}>
        <p className="text-gray-500 text-sm mb-4">
          Conecta con servicios externos (SUNAT, pasarelas de pago, etc.). Estas configuraciones son generalmente más complejas.
        </p>
        <div className="border border-dashed border-gray-300 rounded-md p-6 text-center text-gray-400">
            (Espacio para configuraciones de API Keys, credenciales, etc. - Funcionalidad no implementada)
        </div>
      </SettingsSection>

      {canManageSettings && (
        <div className="mt-10 flex justify-end">
            <Button onClick={handleSaveChanges} size="lg" isLoading={saving} disabled={saving || loading}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
        </div>
      )}

      {/* Document Serie Modal */}
      {isSeriesModalOpen && canManageSettings && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
            <div className="relative bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 className="text-lg font-semibold mb-4">{editingSerie ? 'Editar Serie de Documento' : 'Nueva Serie de Documento'}</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleSerieSubmit(); }} className="space-y-4">
                    <div>
                        <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                        <select id="documentType" name="documentType" value={currentSerieData.documentType} onChange={handleSerieChange} required className="form-select">
                            {(Object.keys(DocumentTypeLabels) as DocumentType[]).map(typeKey => (
                                <option key={typeKey} value={typeKey}>{DocumentTypeLabels[typeKey]}</option>
                            ))}
                        </select>
                    </div>
                    <Input name="serie" label="Serie (Ej: F001, B001)" value={currentSerieData.serie || ''} onChange={handleSerieChange} required/>
                    <Input name="currentNumber" label="Correlativo Actual (Siguiente Nro)" type="number" min="1" value={(currentSerieData.currentNumber || 1).toString()} onChange={handleSerieChange} required/>
                     <div>
                        <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select id="isActive" name="isActive" value={String(currentSerieData.isActive)} onChange={handleSerieChange} className="form-select">
                            <option value="true">Activa</option>
                            <option value="false">Inactiva</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-3">
                        <Button type="button" variant="ghost" onClick={() => setIsSeriesModalOpen(false)}>Cancelar</Button>
                        <Button type="submit">{editingSerie ? 'Guardar Cambios' : 'Añadir Serie'}</Button>
                    </div>
                </form>
                 <style>{`.form-select { display: block; width: 100%; padding: 0.5rem 0.75rem; font-size: 0.875rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; }`}</style>
            </div>
        </div>
      )}

    </div>
  );
};

export default SettingsPage;
