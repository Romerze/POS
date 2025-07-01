import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ChartPieIcon, CurrencyDollarIcon, ShoppingBagIcon, UsersIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button'; // Added import

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white shadow-lg rounded-xl p-6 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);


const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();

  // Placeholder data - in a real app, this would come from an API
  const stats = [
    { title: "Ventas Hoy", value: "S/ 1,250.00", icon: <CurrencyDollarIcon className="h-8 w-8 text-white" />, color: "bg-green-500" },
    { title: "Nuevos Clientes", value: "12", icon: <UsersIcon className="h-8 w-8 text-white" />, color: "bg-blue-500" },
    { title: "Productos en Stock Bajo", value: "5", icon: <ShoppingBagIcon className="h-8 w-8 text-white" />, color: "bg-yellow-500" },
    { title: "Transacciones Pendientes", value: "3", icon: <ChartPieIcon className="h-8 w-8 text-white" />, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold">¡Bienvenido, {currentUser?.fullName}!</h1>
        <p className="mt-1 text-primary-light">Aquí tienes un resumen de la actividad de tu negocio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Ventas Recientes (Placeholder)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Venta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">SALE-00{i + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Cliente {i + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">S/ {(Math.random() * 200 + 50).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Pagada</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Actividad Rápida (Placeholder)</h2>
          <div className="space-y-3">
            <Button className="w-full" variant="outline">Nueva Venta</Button>
            <Button className="w-full" variant="outline">Registrar Producto</Button>
            <Button className="w-full" variant="outline">Ver Reportes</Button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;