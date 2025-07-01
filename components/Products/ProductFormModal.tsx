import React, { useState, useEffect } from 'react';
import { Product, ProductFormData } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: ProductFormData) => void;
  editingProduct: Product | null;
  isLoading?: boolean;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSubmit, editingProduct, isLoading }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    description: '',
    category: '',
    unit: 'unidad',
    purchasePrice: 0,
    salePrice: 0,
    stock: 0,
    minStock: 0,
    imageUrl: '',
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({ ...editingProduct });
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        sku: `SKU${Date.now().toString().slice(-6)}`, // Auto-generate SKU example
        description: '',
        category: '',
        unit: 'unidad',
        purchasePrice: 0,
        salePrice: 0,
        stock: 0,
        minStock: 5, // Default minStock
        imageUrl: '',
      });
    }
  }, [editingProduct, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number = value;
    if (type === 'number') {
      processedValue = parseFloat(value) || 0;
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("El archivo de imagen es demasiado grande. El límite es 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || formData.salePrice <= 0) {
        alert("Por favor complete los campos obligatorios: Nombre, SKU y Precio de Venta (mayor a 0).");
        return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-start pt-10">
      <div className="relative bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto my-8">
        <h2 className="text-2xl font-semibold mb-6 text-neutral-dark">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="name" label="Nombre del Producto" value={formData.name} onChange={handleChange} required />
            <Input name="sku" label="SKU (Código de Barras)" value={formData.sku} onChange={handleChange} required />
          </div>
          
          <Input name="description" label="Descripción" type="textarea" value={formData.description || ''} onChange={handleChange} className="h-24"/>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="category" label="Categoría" value={formData.category || ''} onChange={handleChange} />
             <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida</label>
                <select 
                    id="unit" 
                    name="unit" 
                    value={formData.unit} 
                    onChange={handleChange} 
                    required 
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                    <option value="unidad">Unidad</option>
                    <option value="kg">Kilogramo (kg)</option>
                    <option value="g">Gramo (g)</option>
                    <option value="litro">Litro (L)</option>
                    <option value="ml">Mililitro (ml)</option>
                    <option value="caja">Caja</option>
                    <option value="paquete">Paquete</option>
                    <option value="docena">Docena</option>
                    <option value="servicio">Servicio</option>
                </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Input name="purchasePrice" label="Precio Compra" type="number" step="0.01" value={formData.purchasePrice.toString()} onChange={handleChange} />
            <Input name="salePrice" label="Precio Venta" type="number" step="0.01" value={formData.salePrice.toString()} onChange={handleChange} required />
            <Input name="stock" label="Stock Actual" type="number" step="1" value={formData.stock.toString()} onChange={handleChange} />
            <Input name="minStock" label="Stock Mínimo" type="number" step="1" value={(formData.minStock || 0).toString()} onChange={handleChange} />
          </div>
          
          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen del Producto (Opcional)
            </label>
            <div className="mt-2 flex items-center space-x-4">
              <div className="shrink-0">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Vista previa" className="h-20 w-20 object-cover rounded-md border"/>
                ) : (
                  <div className="h-20 w-20 bg-gray-100 rounded-md border flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                  <input
                    id="imageUpload"
                    name="imageUpload"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                  <label htmlFor="imageUpload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    {formData.imageUrl ? 'Cambiar Imagen' : 'Subir Archivo'}
                  </label>
                  {formData.imageUrl && (
                      <Button variant="ghost" size="sm" onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))} className="ml-3 text-red-600 hover:text-red-700">
                          Quitar
                      </Button>
                  )}
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP hasta 2MB.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading}>
              {isLoading ? (editingProduct ? 'Guardando...' : 'Creando...') : (editingProduct ? 'Guardar Cambios' : 'Crear Producto')}
            </Button>
          </div>
        </form>
         <style>{`.custom-scrollbar::-webkit-scrollbar { width: 8px; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #06b6d4; border-radius: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background-color: #f1f1f1; }`}</style>
      </div>
    </div>
  );
};

export default ProductFormModal;
