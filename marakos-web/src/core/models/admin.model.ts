export interface UserType {
  id: number;
  name: string;
  description: string;
}

export interface Role {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface CreateUserRequest {
  userTypeId: number;
  email: string;
  // password es opcional - se asigna "user123" por defecto en el backend
  password?: string;
  firstName: string;
  lastName: string;
  phone: string;
  
  // Campos específicos para Cliente
  photo?: string;
  birthDate?: string; // formato YYYY-MM-DD
  documentId?: string;
  refundAccount?: string;
  
  // Campos específicos para Empleado
  roleId?: number;
  workShift?: number;
  hireDate?: string; // formato YYYY-MM-DD
  employmentStatus?: string;
}

export interface CreateUserResponse {
  message: string;
  userId: number;
}

export interface UserListResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  userType: string;
  createdAt: string;
  active: boolean;
}

export interface UserDetailResponse {
  id: number;
  email: string;
  userTypeId: number;
  userTypeName: string;
  firstName: string;
  lastName: string;
  phone?: string;
  active: boolean;
  
  // Campos específicos para Cliente
  photo?: string;
  birthDate?: string; // formato YYYY-MM-DD
  documentId?: string;
  refundAccount?: string;
  
  // Campos específicos para Empleado
  roleId?: number;
  roleName?: string;
  workShift?: number;
  hireDate?: string; // formato YYYY-MM-DD
  employmentStatus?: string;
}

export interface PagedUserResponse {
  users: UserListResponse[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}