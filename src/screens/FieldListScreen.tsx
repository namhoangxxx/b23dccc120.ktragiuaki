import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
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
import { COLORS, SHADOWS } from '../constants/theme';
import { Booking, Field, RootStackParamList } from '../types';
import { getBookings, getFields, initData, saveFields } from '../utils/storage';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FieldList'>;

export const FieldListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [fields, setFields] = useState<Field[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const loadData = async () => {
    await initData();
    setFields(await getFields());
    setBookings(await getBookings());
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const activeCount = fields.filter((f) => f.status === 'Hoạt động').length;
  const maintenanceCount = fields.length - activeCount;

  const handleDelete = (field: Field) => {
    // Kiểm tra không cho xoá sân đang có lượt đặt
    if (bookings.some((b) => b.fieldId === field.id)) {
      Alert.alert('Không thể xoá', 'Sân này đang có lượt đặt, không được phép xoá!');
      return;
    }

    // Xác nhận trước khi xoá
    Alert.alert('Xác nhận xoá', `Bạn có chắc chắn muốn xoá ${field.name}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: async () => {
          const updated = fields.filter((f) => f.id !== field.id);
          setFields(updated);
          await saveFields(updated);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content"/>
      
      {/* Bảng thống kê số sân */}
      <View style={styles.dashboardContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tổng số sân</Text>
          <Text style={styles.statValue}>{fields.length}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.activeBg }]}>
          <Text style={[styles.statLabel, { color: COLORS.active }]}>Đang hoạt động</Text>
          <Text style={[styles.statValue, { color: COLORS.active }]}>{activeCount}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: COLORS.maintenanceBg }]}>
          <Text style={[styles.statLabel, { color: COLORS.maintenance }]}>Bảo trì</Text>
          <Text style={[styles.statValue, { color: COLORS.maintenance }]}>{maintenanceCount}</Text>
        </View>
      </View>

      {/* Tiêu đề & Nút thêm sân */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Danh sách sân ({activeCount}/{fields.length} hoạt động)
        </Text>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('FieldForm', {})}
        >
          <Text style={styles.addBtnText}>+ Thêm sân</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách FlatList */}
      <FlatList
        data={fields}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isOperating = item.status === 'Hoạt động';
          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('FieldDetail', { fieldId: item.id })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.titleGroup}>
                  <Text style={styles.fieldName}>{item.name}</Text>
                  <Text style={styles.typeTag}>Sân {item.type}</Text>
                </View>
                {/* Nhãn màu hiển thị trạng thái */}
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: isOperating ? COLORS.activeBg : COLORS.maintenanceBg },
                  ]}
                >
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: isOperating ? COLORS.active : COLORS.maintenance },
                    ]}
                  />
                  <Text
                    style={[
                      styles.badgeText,
                      { color: isOperating ? COLORS.active : COLORS.maintenance },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Giá thuê:</Text>
                <Text style={styles.priceValue}>
                  {item.pricePerHour.toLocaleString('vi-VN')}{' '}
                  <Text style={styles.unitText}>đ/giờ</Text>
                </Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => navigation.navigate('FieldForm', { field: item })}
                >
                  <Text style={styles.editBtnText}>Chỉnh sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.deleteBtnText}>Xoá sân</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Chưa có dữ liệu sân bóng.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  dashboardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statCard: {
    flex: 0.31,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    ...SHADOWS.small,
  },
  addBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 13 },
  listContent: { padding: 16 },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleGroup: { flex: 1 },
  fieldName: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 2 },
  typeTag: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 10,
  },
  priceLabel: { fontSize: 13, color: COLORS.textSecondary },
  priceValue: { fontSize: 17, fontWeight: 'bold', color: COLORS.primary },
  unitText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: 'normal' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  editBtn: { backgroundColor: '#F1F5F9' },
  editBtnText: { color: COLORS.textPrimary, fontWeight: '600', fontSize: 12 },
  deleteBtn: { backgroundColor: COLORS.errorBg },
  deleteBtnText: { color: COLORS.error, fontWeight: '600', fontSize: 12 },
  emptyBox: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15 },
});