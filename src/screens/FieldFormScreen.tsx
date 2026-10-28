import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import { Field, RootStackParamList } from '../types';
import { getFields, saveFields } from '../utils/storage';

type FormRouteProp = RouteProp<RootStackParamList, 'FieldForm'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FieldForm'>;

export const FieldFormScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<FormRouteProp>();
  const editingField = route.params?.field;

  const [name, setName] = useState(editingField ? editingField.name : '');
  const [type, setType] = useState<'5 người' | '7 người'>(
    editingField ? editingField.type : '5 người'
  );
  const [pricePerHour, setPricePerHour] = useState(
    editingField ? editingField.pricePerHour.toString() : ''
  );
  const [status, setStatus] = useState<'Hoạt động' | 'Bảo trì'>(
    editingField ? editingField.status : 'Hoạt động'
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSave = async () => {
    let errs: { [key: string]: string } = {};

    if (!name.trim()) errs.name = 'Vui lòng nhập tên sân';
    const price = Number(pricePerHour);
    if (!pricePerHour || isNaN(price) || price <= 0) {
      errs.pricePerHour = 'Giá thuê phải là số lớn hơn 0';
    }

    const fields = await getFields();
    if (
      fields.some(
        (f) => f.name.toLowerCase() === name.trim().toLowerCase() && f.id !== editingField?.id
      )
    ) {
      errs.name = 'Tên sân đã tồn tại trong hệ thống';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (editingField) {
      const updated = fields.map((f) =>
        f.id === editingField.id
          ? { ...f, name: name.trim(), type, pricePerHour: price, status }
          : f
      );
      await saveFields(updated);
    } else {
      const newField: Field = {
        id: Date.now().toString(),
        name: name.trim(),
        type,
        pricePerHour: price,
        status,
      };
      await saveFields([...fields, newField]);
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.formTitle}>
            {editingField ? 'Chỉnh Sửa Sân Bóng' : 'Thêm Sân Bóng Mới'}
          </Text>

          <Text style={styles.label}>Tên sân (*)</Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            value={name}
            onChangeText={setName}
            placeholder="Ví dụ: Sân A1"
            placeholderTextColor={COLORS.disabled}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <Text style={styles.label}>Loại sân</Text>
          <View style={styles.toggleRow}>
            {(['5 người', '7 người'] as const).map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.toggleBtn, type === item && styles.toggleBtnActive]}
                onPress={() => setType(item)}
              >
                <Text
                  style={[styles.toggleBtnText, type === item && styles.toggleBtnTextActive]}
                >
                  Sân {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Giá thuê mỗi giờ (VNĐ) (*)</Text>
          <TextInput
            style={[styles.input, errors.pricePerHour ? styles.inputError : null]}
            value={pricePerHour}
            onChangeText={setPricePerHour}
            keyboardType="numeric"
            placeholder="300000"
            placeholderTextColor={COLORS.disabled}
          />
          {errors.pricePerHour && <Text style={styles.errorText}>{errors.pricePerHour}</Text>}

          <Text style={styles.label}>Trạng thái hoạt động</Text>
          <View style={styles.toggleRow}>
            {(['Hoạt động', 'Bảo trì'] as const).map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.toggleBtn,
                  status === item &&
                    (item === 'Hoạt động' ? styles.statusActive : styles.statusMaintenance),
                ]}
                onPress={() => setStatus(item)}
              >
                <Text
                  style={[styles.toggleBtnText, status === item && styles.toggleBtnTextActive]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
            <Text style={styles.submitBtnText}>Lưu sân bóng</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20 },
  formTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputError: { borderColor: COLORS.error, backgroundColor: COLORS.errorBg },
  errorText: { color: COLORS.error, fontSize: 12, marginTop: 4 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  toggleBtn: {
    flex: 0.48,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
  },
  toggleBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusActive: { backgroundColor: COLORS.active, borderColor: COLORS.active },
  statusMaintenance: { backgroundColor: COLORS.maintenance, borderColor: COLORS.maintenance },
  toggleBtnText: { color: COLORS.textPrimary, fontWeight: '600', fontSize: 14 },
  toggleBtnTextActive: { color: COLORS.white },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    ...SHADOWS.small,
  },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});