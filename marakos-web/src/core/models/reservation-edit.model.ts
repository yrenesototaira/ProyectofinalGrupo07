export interface ReservationProduct {
  id: number;
  productId: number;
  quantity: number;
  subtotal: number;
  observation: string | null;
}

export interface ReservationTable {
  id: number;
  tableId: number;
}

export interface ReservationEvent {
  id: number;
  serviceId: number;
  quantity: number;
  subtotal: number;
  observation: string | null;
}

export interface ReservationPayment {
  id: number;
  paymentDate: string;
  paymentMethod: string;
  amount: number;
  status: string;
  externalTransactionId: string | null;
  createdBy: number;
}

export interface ReservationEdit {
  id: number;
  code: string;
  customerId: number;
  reservationDate: string;
  reservationTime: string;
  peopleCount: number;
  status: string;
  paymentMethod: string;
  reservationType: string;
  eventTypeId: number | null;
  eventShift: string | null;
  tableDistributionType: number | null;
  tableClothColor: number | null;
  holderDocument: string | null;
  holderPhone: string | null;
  holderName: string | null;
  holderEmail: string | null;
  observation: string | null;
  employeeId: number | null;
  cancellationDate: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string | null;
  active: boolean;
  products: ReservationProduct[];
  tables: ReservationTable[];
  events: ReservationEvent[];
  payments: ReservationPayment[];
}
