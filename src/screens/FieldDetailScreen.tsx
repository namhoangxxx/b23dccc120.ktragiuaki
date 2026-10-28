import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BookingModal } from '../components/BookingModal';
import { COLORS, SHADOWS } from '../constants/theme';
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

  React.useEffect(() => {
    loadDetail();
  }, []);

  const handleAddBooking = async (newBooking: Booking) => {
    const updated = [...allBookings, newBooking];
    await saveBookings(updated);
    setModalVisible(false);
    loadDetail();
    Alert.alert('Đặt sân thành công', `Đã ghi nhận lượt đặt cho khách ${newBooking.customerName}`);
  };

  const handleCancelBooking = (bookingId: string, customerName: string) => {
    Alert.alert(
      'Xác nhận hủy đặt sân',
      `Bạn có chắc muốn hủy lượt đặt của khách ${customerName}?`,
      [
        { text: 'Bỏ qua', style: 'cancel' },
        {
          text: 'Hủy đặt',
          style: 'destructive',
          onPress: async () => {
            const updated = allBookings.filter((b) => b.id !== bookingId);
            await saveBookings(updated);
            loadDetail();
          },
        },
      ]
    );
  };

  if (!field) return null;

  const isMaintenance = field.status === 'Bảo trì';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content"/>

      {/* Hero Card thông tin sân bóng */}
      <View style={styles.fieldInfoCard}>
        <View style={styles.infoHeader}>
          <View>
            <Text style={styles.title}>{field.name}</Text>
            <Text style={styles.subTitle}>Sân bóng đá {field.type}</Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: isMaintenance ? COLORS.maintenanceBg : COLORS.activeBg },
            ]}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: isMaintenance ? COLORS.maintenance : COLORS.active },
              ]}
            />
            <Text
              style={[
                styles.badgeText,
                { color: isMaintenance ? COLORS.maintenance : COLORS.active },
              ]}
            >
              {field.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Giá thuê sân:</Text>
          <Text style={styles.priceHighlight}>
            {field.pricePerHour.toLocaleString('vi-VN')} <Text style={styles.unitText}>đ/giờ</Text>
          </Text>
        </View>

        {/* Nút đặt sân */}
        <TouchableOpacity
          style={[styles.bookingBtn, isMaintenance && styles.disabledBtn]}
          disabled={isMaintenance}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.bookingBtnText}>
            {isMaintenance ? '⚠️ Sân đang bảo trì - Không thể đặt' : '⚡ Đặt sân ngay'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách lượt đặt */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lịch đã đặt ({bookings.length})</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <View>
                <Text style={styles.customerName}>👤 {item.customerName}</Text>
                <Text style={styles.phoneText}>📞 {item.phone}</Text>
              </View>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancelBooking(item.id, item.customerName)}
              >
                <Text style={styles.cancelBtnText}>Hủy đặt</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bookingTimeBox}>
              <Text style={styles.bookingTimeText}>
                📅 Ngày: <Text style={styles.boldText}>{item.date}</Text>
              </Text>
              <Text style={styles.bookingTimeText}>
                ⏰ Khung giờ: <Text style={styles.boldText}>{item.startHour}h00 - {item.startHour + item.hours}h00 ({item.hours} tiếng)</Text>
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Chưa có lượt đặt sân nào cho sân này.</Text>
          </View>
        }
      />

      {/* Modal đặt sân */}
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
  fieldInfoCard: {
    backgroundColor: COLORS.cardBg,
    padding: 18,
    margin: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  infoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.textPrimary },
  subTitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary },
  priceHighlight: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  unitText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: 'normal' },
  bookingBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  disabledBtn: { backgroundColor: COLORS.disabled, elevation: 0 },
  bookingBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  sectionHeader: { paddingHorizontal: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  listPadding: { paddingHorizontal: 16, paddingBottom: 20 },
  bookingCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  customerName: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary },
  phoneText: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  cancelBtn: { backgroundColor: COLORS.errorBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  cancelBtnText: { color: COLORS.error, fontSize: 12, fontWeight: 'bold' },
  bookingTimeBox: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8 },
  bookingTimeText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 2 },
  boldText: { color: COLORS.textPrimary, fontWeight: '600' },
  emptyBox: { alignItems: 'center', marginTop: 30 },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
});