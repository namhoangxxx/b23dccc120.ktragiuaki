import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BookingModal } from '../components/BookingModal';
import { COLORS } from '../constants/theme';
import { Booking, Field, RootStackParamList } from '../types';
import { getBookings, getFields, saveBookings } from '../utils/storage';

type DetailRouteProp = RouteProp<RootStackParamList, 'FieldDetail'>;

export const FieldDetailScreen = () => {
  const route = useRoute<DetailRouteProp>();
  const { fieldId } = route.params;

  const [field, setField] = useState<Field | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const loadDetail = async () => {
    const fList = await getFields();
    const bList = await getBookings();
    const current = fList.find((f) => f.id === fieldId);
    if (current) setField(current);

    setAllBookings(bList);
    setBookings(bList.filter((b) => b.fieldId === fieldId));
  };

  React.useEffect(() => { loadDetail(); }, []);

  const handleAddBooking = async (newBooking: Booking) => {
    const updated = [...allBookings, newBooking];
    await saveBookings(updated);
    setModalVisible(false);
    loadDetail();
    Alert.alert('Thành công', 'Đặt sân thành công!');
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert('Xác nhận hủy', 'Bạn có chắc chắn muốn hủy lượt đặt này?', [
      { text: 'Bỏ qua', style: 'cancel' },
      {
        text: 'Đồng ý hủy',
        style: 'destructive',
        onPress: async () => {
          const updated = allBookings.filter((b) => b.id !== bookingId);
          await saveBookings(updated);
          loadDetail();
        },
      },
    ]);
  };

  if (!field) return null;
  const isMaintenance = field.status === 'Bảo trì';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.fieldInfoCard}>
        <Text style={styles.title}>{field.name}</Text>
        <Text style={styles.infoText}>Loại: {field.type}</Text>
        <Text style={styles.infoText}>Giá: {field.pricePerHour.toLocaleString('vi-VN')} đ/giờ</Text>
        <Text style={styles.infoText}>
          Trạng thái: <Text style={{ color: isMaintenance ? COLORS.maintenance : COLORS.active }}>{field.status}</Text>
        </Text>

        <TouchableOpacity
          style={[styles.bookingBtn, isMaintenance && styles.disabledBtn]}
          disabled={isMaintenance}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.bookingBtnText}>{isMaintenance ? 'Sân đang bảo trì' : '+ Đặt sân ngay'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Danh sách lượt đặt sân</Text>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <View style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <Text style={styles.customerName}>{item.customerName}</Text>
              <Text style={styles.phoneText}>{item.phone}</Text>
            </View>
            <Text style={styles.bookingDetail}>Ngày đặt: {item.date}</Text>
            <Text style={styles.bookingDetail}>Khung giờ: {item.startHour}h00 - {item.startHour + item.hours}h00 ({item.hours} tiếng)</Text>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancelBooking(item.id)}>
              <Text style={styles.cancelBtnText}>Hủy lượt đặt</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <BookingModal
        visible={modalVisible}
        field={field}
        existingBookings={allBookings}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddBooking}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  fieldInfoCard: { backgroundColor: COLORS.cardBg, padding: 16, margin: 16, borderRadius: 12, elevation: 3 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 },
  infoText: { fontSize: 15, color: COLORS.textPrimary, marginBottom: 4 },
  bookingBtn: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  disabledBtn: { backgroundColor: COLORS.disabled },
  bookingBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginLeft: 16, marginBottom: 8 },
  bookingCard: { backgroundColor: COLORS.cardBg, borderRadius: 8, padding: 14, marginBottom: 10, elevation: 2 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  customerName: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  phoneText: { fontSize: 14, color: COLORS.textSecondary },
  bookingDetail: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 2 },
  cancelBtn: { alignSelf: 'flex-end', marginTop: 8 },
  cancelBtnText: { color: COLORS.error, fontWeight: '600', fontSize: 13 },
});