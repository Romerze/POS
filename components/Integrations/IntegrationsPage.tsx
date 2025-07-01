import React from 'react';
import { ShareIcon, CogIcon } from '@heroicons/react/24/outline'; // Using CogIcon as a general settings/config icon

const IntegrationsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] bg-white shadow-lg rounded-xl p-8">
        <ShareIcon className="h-24 w-24 text-primary opacity-50 mb-6" />
        <h1 className="text-3xl font-bold text-neutral-dark mb-4">Módulo de Integraciones Externas</h1>
        <p className="text-gray-600 text-center max-w-md mb-2">
          Este módulo está planificado para futuras versiones.
        </p>
        <p className="text-gray-500 text-center text-sm max-w-lg">
          Aquí podrás configurar y gestionar conexiones con servicios de terceros, como:
        </p>
        <ul className="list-disc list-inside text-gray-500 text-sm mt-3 text-left max-w-sm">
            <li>Entidades tributarias (SUNAT, AFIP, DIAN, etc.) para facturación electrónica.</li>
            <li>Pasarelas de pago online.</li>
            <li>Sistemas contables externos (SAP, QuickBooks, etc.).</li>
            <li>Servicios de envío o logística.</li>
        </ul>
        <div className="mt-8 p-6 border border-dashed border-gray-300 rounded-md text-sm text-gray-400">
            <CogIcon className="h-8 w-8 text-gray-400 mx-auto mb-2"/>
            Actualmente, no hay integraciones activas o configurables.
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;