
import { SelectOption, UserRole, PaymentMethod } from './types';

export const APP_NAME = "Sistema de Punto de Venta";
export const APP_VERSION = "0.1.0";

export const USER_ROLES_OPTIONS: SelectOption<UserRole>[] = [
  { value: UserRole.ADMIN, label: "Administrador" },
  { value: UserRole.CASHIER, label: "Cajero" },
  { value: UserRole.SUPERVISOR, label: "Supervisor" },
];

export const PAYMENT_METHOD_OPTIONS: SelectOption<PaymentMethod>[] = [
  { value: PaymentMethod.CASH, label: "Efectivo" },
  { value: PaymentMethod.CARD, label: "Tarjeta de Crédito/Débito" },
  { value: PaymentMethod.YAPE, label: "Yape / Plin" },
  { value: PaymentMethod.TRANSFER, label: "Transferencia Bancaria" },
  { value: PaymentMethod.OTHER, label: "Otro" },
];

export const DEFAULT_CURRENCY_SYMBOL = "S/";
export const TAX_RATE = 0.18; // Example IGV Peru
