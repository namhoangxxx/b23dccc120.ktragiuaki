import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { Booking, Field } from '../types';

interface Props {
  visible: boolean;
  field: Field;
  existingBookings: Booking[];
  onClose: () => void;
  onSubmit: (booking: Booking) => void;
}

export const BookingModal: React.FC<Props> = ({
  visible,
  field,
  existingBookings,
  onClose,
  onSubmit,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [startHour, setStartHour] = useState('17');
  const [hours, setHours] = useState('1');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    let errs: { [key: string]: string } = {};

    if (!customerName.trim()) errs.customerName = 'Vui lòng nhập tên khách hàng';
    if (!/^0\d{9}$/.test(phone.trim())) errs.phone = 'SĐT phải gồm 10 chữ số và bắt đầu bằng 0';
    if (!/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/.test(date.trim())) {
      errs.date = 'Định dạng ngày chưa đúng (dd/mm/yyyy)';
    }

    const start = parseInt(startHour, 10);
    if (isNaN(start) || start < 6 || start > 22) errs.startHour = 'Giờ bắt đầu từ 6h đến 22h';

    const h = parseInt(hours, 10);
    if (isNaN(h) || h < 1 || h > 3) {
      errs.hours = 'Số giờ thuê từ 1 đến 3 tiếng';
    } else if (start + h > 23) {
      errs.hours = 'Giờ kết thúc không được vượt quá 23h';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBooking = () => {
    if (!validate()) return;

    const start = parseInt(startHour, 10);
    const h = parseInt(hours, 10);

    const isConflict = existingBookings.some((b) => {
      if (b.fieldId !== field.id || b.date !== date.trim()) return false;
      return Math.max(start, b.startHour) < Math.min(start + h, b.startHour + b.hours);
    });

    if (isConflict) {
      Alert.alert('Lịch bị trùng', 'Sân đã có người đặt trong khung giờ này. Vui lòng chọn khung giờ khác!');
      return;
    }

    onSubmit({
      id: Date.now().toString(),
      fieldId: field.id,
      customerName: customerName.trim(),
      phone: phone.trim(),
      date: date.trim(),
      startHour: start,
      hours: h,
    });

    setCustomerName('');
    setPhone('');
    setDate('');
    setStartHour('17');
    setHours('1');
    setErrors({});
  };

  const numHours = parseInt(hours, 10) || 0;
  const totalPrice = field.pricePerHour * (numHours >= 1 && numHours <= 3 ? numHours : 0);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Tạo Lượt Đặt Sân</Text>
            <Text style={styles.subTitle}>{field.name} ({field.type})</Text>

            <Text style={styles.label}>Tên khách hàng (*)</Text>
            <TextInput
              style={[styles.input, errors.customerName ? styles.inputError : null]}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Nguyễn Văn A"
              placeholderTextColor={COLORS.disabled}
            />
            {errors.customerName && <Text style={styles.errorText}>{errors.customerName}</Text>}

            <Text style={styles.label}>Số điện thoại (*)</Text>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : null]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="0912345678"
              placeholderTextColor={COLORS.disabled}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

            <Text style={styles.label}>Ngày đặt (dd/mm/yyyy) (*)</Text>
            <TextInput
              style={[styles.input, errors.date ? styles.inputError : null]}
              value={date}
              onChangeText={setDate}
              placeholder="28/10/2026"
              placeholderTextColor={COLORS.disabled}
            />
            {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}

            <View style={styles.rowInputs}>
              <View style={styles.flexInput}>
                <Text style={styles.label}>Giờ bắt đầu (6-22h)</Text>
                <TextInput
                  style={[styles.input, errors.startHour ? styles.inputError : null]}
                  value={startHour}
                  onChangeText={setStartHour}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.flexInput}>
                <Text style={styles.label}>Số giờ thuê (1-3h)</Text>
                <TextInput
                  style={[styles.input, errors.hours ? styles.inputError : null]}
                  value={hours}
                  onChangeText={setHours}
                  keyboardType="numeric"
                />
              </View>
            </View>
            {errors.startHour && <Text style={styles.errorText}>{errors.startHour}</Text>}
            {errors.hours && <Text style={styles.errorText}>{errors.hours}</Text>}

            {/* Total Price Card */}
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Thành tiền tạm tính:</Text>
              <Text style={styles.priceValue}>{totalPrice.toLocaleString('vi-VN')} đ</Text>
            </View>

            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onClose}>
                <Text style={styles.btnCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSubmit]} onPress={handleBooking}>
                <Text style={styles.btnSubmitText}>Xác nhận đặt sân</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
    ...SHADOWS.medium,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center' },
  subTitle: { fontSize: 14, color: COLORS.primary, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginTop: 10, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: '#F8FAFC',
  },
  inputError: { borderColor: COLORS.error, backgroundColor: COLORS.errorBg },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: 2 },
  rowInputs: { flexDirection: 'row', gap: 10 },
  flexInput: { flex: 1 },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    padding: 14,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 10,
  },
  priceLabel: { fontSize: 14, fontWeight: '600', color: COLORS.primaryDark },
  priceValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primaryDark },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnCancel: { backgroundColor: '#F1F5F9' },
  btnCancelText: { color: COLORS.textSecondary, fontWeight: 'bold' },
  btnSubmit: { backgroundColor: COLORS.primary, ...SHADOWS.small },
  btnSubmitText: { color: COLORS.white, fontWeight: 'bold' },
});