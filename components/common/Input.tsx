
import React from 'react';

// Base props common to both input and textarea
interface BaseInputProps {
  label?: string;
  id?: string; // id is important for label htmlFor
  error?: string;
  containerClassName?: string;
  icon?: React.ReactNode;
  labelClassName?: string; // New prop
}

// Props specific to HTMLInputElement, excluding 'type' to avoid conflict later
type HtmlInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'>;

// Props specific to HTMLTextAreaElement
type HtmlTextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>;

// Combined InputProps using a discriminated union based on 'type'
interface StandardInputProps extends BaseInputProps, HtmlInputProps {
  type?: Exclude<React.HTMLInputTypeAttribute, 'textarea'>; // All input types except textarea
  className?: string;
}

interface TextareaInputProps extends BaseInputProps, HtmlTextareaProps {
  type: 'textarea';
  rows?: number; // rows is specific to textarea
  className?: string;
}

export type InputProps = StandardInputProps | TextareaInputProps;


const Input: React.FC<InputProps> = ({ 
    label, 
    id, 
    error, 
    containerClassName = '', 
    className = '', 
    icon, 
    labelClassName = '', // Default for new prop
    type, 
    ...props 
}) => {
  const baseInputClasses = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
  const errorInputClasses = "border-red-500 text-red-600 focus:ring-red-500 focus:border-red-500";
  
  // Use `id` prop if provided, otherwise fallback to `name` attribute from props for label's htmlFor
  const inputId = id || (props as any).name; 

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && !(type === 'textarea') && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {icon}
            </div>
        )}
        {type === 'textarea' ? (
          <textarea
            id={inputId}
            className={`${baseInputClasses} ${error ? errorInputClasses : ''} ${className}`}
            {...(props as HtmlTextareaProps)} 
            rows={(props as TextareaInputProps).rows}
          />
        ) : (
          <input
            id={inputId}
            type={type || 'text'} 
            className={`${baseInputClasses} ${error ? errorInputClasses : ''} ${icon && !(type === 'textarea') ? 'pl-10' : ''} ${className}`}
            {...(props as HtmlInputProps)}
          />
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Input;