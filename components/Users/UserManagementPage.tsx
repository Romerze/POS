
import React, { useState, useEffect } from 'react';
import { User, UserRole, SelectOption, Permission } from '../../types'; // Added Permission
import { fetchUsers, updateUser, addUser, deleteUser } from '../../services/apiService'; 
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import Input from '../common/Input';
import { PlusCircleIcon, UsersIcon, PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { USER_ROLES_OPTIONS } from '../../constants';
import { useAuth } from '../../hooks/useAuth'; // Added useAuth

// Define UserForm component outside UserManagementPage
interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: User | Omit<User, 'id' | 'lastLogin' | 'loginIp' | 'failedAttempts' | 'permissions'>) => void;
  editingUser: User | null;
  isLoading?: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSubmit, editingUser, isLoading }) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setFormData({ ...editingUser, password: '' }); // Clear password for edit form
    } else {
      setFormData({ role: UserRole.CASHIER, status: 'active' }); // Defaults for new user
    }
  }, [editingUser, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || (!editingUser && !formData.password) || !formData.fullName || !formData.role) {
        alert("Por favor complete todos los campos requeridos: Usuario, Contraseña (para nuevo), Nombre Completo y Rol.");
        return;
    }
    // Permissions will be set by the backend/mockApiService based on role
    const { permissions, ...dataToSubmit } = formData;
    onSubmit(dataToSubmit as User | Omit<User, 'id' | 'lastLogin' | 'loginIp' | 'failedAttempts' | 'permissions'>);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-6">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="fullName" label="Nombre Completo" value={formData.fullName || ''} onChange={handleChange} required />
          <Input name="username" label="Nombre de Usuario" value={formData.username || ''} onChange={handleChange} required disabled={!!editingUser} />
          <div className="relative">
            <Input name="password" label={editingUser ? "Nueva Contraseña (opcional)" : "Contraseña"} type={showPassword ? "text" : "password"} value={formData.password || ''} onChange={handleChange} required={!editingUser} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-500">
                {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
            </button>
          </div>
          <Input name="email" label="Correo Electrónico" type="email" value={formData.email || ''} onChange={handleChange} />
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select id="role" name="role" value={formData.role || ''} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
              {USER_ROLES_OPTIONS.map((opt: SelectOption<UserRole>) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
           <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select id="status" name="status" value={formData.status || 'active'} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="blocked">Bloqueado</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>{editingUser ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};


const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { hasPermission } = useAuth(); // Get hasPermission

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los usuarios.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = () => {
    if (!hasPermission(Permission.CREATE_USER)) {
        alert("No tiene permisos para crear usuarios.");
        return;
    }
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
     if (!hasPermission(Permission.EDIT_USER)) {
        alert("No tiene permisos para editar usuarios.");
        return;
    }
    setEditingUser(user);
    setIsModalOpen(true);
  };
  
  const handleDeleteUser = async (userToDelete: User) => {
    if (!hasPermission(Permission.DELETE_USER)) {
        alert("No tiene permisos para eliminar usuarios.");
        return;
    }
    if (window.confirm(`¿Está seguro de que desea eliminar al usuario "${userToDelete.username}"? Esta acción no se puede deshacer.`)) {
      setActionLoading(true);
      setError(null);
      try {
        await deleteUser(userToDelete.id);
        alert(`Usuario "${userToDelete.username}" eliminado con éxito.`);
        await loadUsers(); // Refresh the list
      } catch (apiError: any) {
        setError(apiError.message || 'Error al eliminar usuario.');
        alert(`Error al eliminar usuario: ${apiError.message}`);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleFormSubmit = async (userData: User | Omit<User, 'id' | 'lastLogin' | 'loginIp' | 'failedAttempts'| 'permissions'>) => {
    setActionLoading(true);
    setError(null);
    try {
        if ('id' in userData && userData.id) { // Editing existing user
             if (!hasPermission(Permission.EDIT_USER)) throw new Error("No tiene permisos para editar usuarios.");
            await updateUser(userData as Omit<User, 'permissions'>); // userData here will not have 'permissions' field
            alert("Usuario actualizado con éxito.");
        } else { // Adding new user
             if (!hasPermission(Permission.CREATE_USER)) throw new Error("No tiene permisos para crear usuarios.");
            await addUser(userData as Omit<User, 'id' | 'lastLogin' | 'loginIp' | 'failedAttempts' | 'permissions'>);
            alert("Usuario creado con éxito.");
        }
        setIsModalOpen(false);
        await loadUsers(); // Refresh the list
    } catch (apiError: any) {
        setError(apiError.message || 'Error al guardar usuario.');
        alert(`Error al guardar usuario: ${apiError.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error && users.length === 0) {
    return <div className="text-center text-red-500 p-4 bg-red-50 rounded shadow">{error}</div>;
  }
  
  const canCreateUser = hasPermission(Permission.CREATE_USER);
  const canEditUser = hasPermission(Permission.EDIT_USER);
  const canDeleteUser = hasPermission(Permission.DELETE_USER);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-neutral-dark flex items-center">
            <UsersIcon className="h-8 w-8 mr-3 text-primary"/>
            Gestión de Usuarios
        </h1>
        {canCreateUser && (
            <Button onClick={handleAddUser} leftIcon={<PlusCircleIcon className="h-5 w-5"/>} disabled={actionLoading}>
            Nuevo Usuario
            </Button>
        )}
      </div>
      
      {error && <p className="mb-4 text-center text-red-500 p-3 bg-red-100 rounded-md shadow-sm">{error}</p>}

      {users.length === 0 && !loading ? (
        <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow">
          <UsersIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl">No hay usuarios registrados.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Último Login</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                     <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">{USER_ROLES_OPTIONS.find(r => r.value === user.role)?.label || user.role}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{user.email || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 
                      user.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' ? 'Activo' : user.status === 'inactive' ? 'Inactivo' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                    {canEditUser && (
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} className="text-primary hover:text-primary-dark p-1" title="Editar Usuario" disabled={actionLoading}>
                            <PencilIcon className="h-4 w-4"/>
                        </Button>
                    )}
                    {canDeleteUser && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user)} className="text-red-600 hover:text-red-800 p-1 ml-1" title="Eliminar Usuario" disabled={actionLoading}>
                            <TrashIcon className="h-4 w-4"/>
                        </Button>
                    )}
                    {(!canEditUser && !canDeleteUser) && <span className="text-xs text-gray-400">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(canCreateUser || canEditUser) && isModalOpen && (
          <UserFormModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSubmit={handleFormSubmit} 
            editingUser={editingUser}
            isLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default UserManagementPage;