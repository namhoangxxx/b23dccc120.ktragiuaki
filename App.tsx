import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { COLORS } from './src/constants/theme';
import { FieldDetailScreen } from './src/screens/FieldDetailScreen';
import { FieldFormScreen } from './src/screens/FieldFormScreen';
import { FieldListScreen } from './src/screens/FieldListScreen';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="FieldList"
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="FieldList" component={FieldListScreen} options={{ title: 'Quản Lý Sân Bóng Mini' }} />
        <Stack.Screen name="FieldForm" component={FieldFormScreen} options={({ route }) => ({ title: route.params?.field ? 'Sửa Sân Bóng' : 'Thêm Sân Bóng Mới' })} />
        <Stack.Screen name="FieldDetail" component={FieldDetailScreen} options={{ title: 'Chi Tiết & Đặt Sân' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}