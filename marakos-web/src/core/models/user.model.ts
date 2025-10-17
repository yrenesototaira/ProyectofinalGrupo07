export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Cliente' | 'Administrador';
  bankName?: string;
  accountNumber?: string;
  cci?: string;
}