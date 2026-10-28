export interface Field {
  id: string;
  name: string;
  type: '5 người' | '7 người';
  pricePerHour: number;
  status: 'Hoạt động' | 'Bảo trì';
}

export interface Booking {
  id: string;
  fieldId: string;
  customerName: string;
  phone: string;
  date: string;
  startHour: number;
  hours: number;
}

export type RootStackParamList = {
  FieldList: undefined;
  FieldForm: { field?: Field };
  FieldDetail: { fieldId: string };
};