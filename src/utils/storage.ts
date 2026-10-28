import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, Field } from '../types';

const FIELDS_KEY = '@fields_data';
const BOOKINGS_KEY = '@bookings_data';

const initialFields: Field[] = [
  { id: 'f1', name: 'Sân A1', type: '5 người', pricePerHour: 200000, status: 'Hoạt động' },
  { id: 'f2', name: 'Sân A2', type: '5 người', pricePerHour: 200000, status: 'Hoạt động' },
  { id: 'f3', name: 'Sân B1', type: '7 người', pricePerHour: 350000, status: 'Hoạt động' },
  { id: 'f4', name: 'Sân B2', type: '7 người', pricePerHour: 350000, status: 'Bảo trì' },
];

const initialBookings: Booking[] = [
  { id: 'b1', fieldId: 'f1', customerName: 'Nguyễn Văn A', phone: '0912345678', date: '28/10/2026', startHour: 17, hours: 2 },
  { id: 'b2', fieldId: 'f2', customerName: 'Trần Văn B', phone: '0987654321', date: '28/10/2026', startHour: 19, hours: 1 },
  { id: 'b3', fieldId: 'f3', customerName: 'Lê Văn C', phone: '0901234567', date: '29/10/2026', startHour: 18, hours: 2 },
];

export const initData = async () => {
  const fData = await AsyncStorage.getItem(FIELDS_KEY);
  if (!fData) await AsyncStorage.setItem(FIELDS_KEY, JSON.stringify(initialFields));
  
  const bData = await AsyncStorage.getItem(BOOKINGS_KEY);
  if (!bData) await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(initialBookings));
};

export const getFields = async (): Promise<Field[]> => {
  const data = await AsyncStorage.getItem(FIELDS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveFields = async (fields: Field[]) => {
  await AsyncStorage.setItem(FIELDS_KEY, JSON.stringify(fields));
};

export const getBookings = async (): Promise<Booking[]> => {
  const data = await AsyncStorage.getItem(BOOKINGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveBookings = async (bookings: Booking[]) => {
  await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
};