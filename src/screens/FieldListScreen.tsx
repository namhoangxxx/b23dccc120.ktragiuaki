import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
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
  
  // State phục vụ Tìm kiếm & Lọc nâng cao
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'Tất cả' | '5 người' | '7 người' | 'Hoạt động'>('Tất cả');

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

  // Logic lọc dữ liệu thông minh
  const filteredFields = useMemo(() => {
    return fields.filter((field) => {
      const matchesSearch = field.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;

      if (selectedFilter === '5 người') return field.type === '5 người';
      if (selectedFilter === '7 người') return field.type === '7 người';
      if (selectedFilter === 'Hoạt động') return field.status === 'Hoạt động';
      return true;
    });
  }, [fields, searchQuery, selectedFilter]);

  const handleDelete = (field: Field) => {
    if (bookings.some((b) => b.fieldId === field.id)) {
      Alert.alert('Không thể xoá', 'Sân này đang có lượt đặt, không được phép xoá!');
      return;
    }

    Alert.alert('Xác nhận xoá', `Bạn có chắc chắn muốn xoá ${field.name}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xoá sân',
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
      <StatusBar barStyle="dark-content" />
      
      {/* 1. Dashboard Thống kê tổng quan */}
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

      {/* 2. Thanh Tìm kiếm & Lọc nhanh */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm kiếm sân bóng theo tên..."
          placeholderTextColor={COLORS.disabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        {/* Chips Lọc dữ liệu */}
        <View style={styles.filterContainer}>
          {(['Tất cả', '5 người', '7 người', 'Hoạt động'] as const).map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Tiêu đề danh sách & Nút thêm sân */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Danh sách cụm sân ({filteredFields.length})
        </Text>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('FieldForm', {})}
        >
          <Text style={styles.addBtnText}>+ Thêm sân mới</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Danh sách FlatList Cards */}
      <FlatList
        data={filteredFields}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isOperating = item.status === 'Hoạt động';
          const fieldBookingsCount = bookings.filter((b) => b.fieldId === item.id).length;

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('FieldDetail', { fieldId: item.id })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.titleGroup}>
                  <Text style={styles.fieldName}>{item.name}</Text>
                  <Text style={styles.typeTag}>Sân loại {item.type} • {fieldBookingsCount} lượt đặt</Text>
                </View>
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
                <Text style={styles.priceLabel}>Giá thuê sân:</Text>
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
                  <Text style={styles.editBtnText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.deleteBtnText}>Xoá</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.detailBtn]}
                  onPress={() => navigation.navigate('FieldDetail', { fieldId: item.id })}
                >
                  <Text style={styles.detailBtnText}>Chi tiết & Đặt sân →</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Không tìm thấy sân bóng phù hợp.</Text>
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
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    ...SHADOWS.small,
  },
  addBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 12 },
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
    marginBottom: 10,
  },
  titleGroup: { flex: 1 },
  fieldName: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 2 },
  typeTag: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
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
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 6 },
  editBtn: { backgroundColor: '#F1F5F9' },
  editBtnText: { color: COLORS.textPrimary, fontWeight: '600', fontSize: 12 },
  deleteBtn: { backgroundColor: COLORS.errorBg },
  deleteBtnText: { color: COLORS.error, fontWeight: '600', fontSize: 12 },
  detailBtn: { backgroundColor: COLORS.primaryLight },
  detailBtnText: { color: COLORS.primaryDark, fontWeight: 'bold', fontSize: 12 },
  emptyBox: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
});