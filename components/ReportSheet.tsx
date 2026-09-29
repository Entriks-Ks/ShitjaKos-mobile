import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { homeColors } from '@/constants/home';

const reasons = ['Çmim i rremë', 'Produkt i ndaluar', 'Mashtrim', 'Tjetër'];

export function ReportSheet({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.sheet}>
        <Text style={styles.title}>Raporto problemin</Text>
        {reasons.map((reason) => (
          <Pressable key={reason} style={styles.row} onPress={() => onSubmit(reason)}>
            <Text style={styles.reason}>{reason}</Text>
          </Pressable>
        ))}
        <Pressable style={styles.cancel} onPress={onClose}>
          <Text style={styles.cancelText}>Anulo</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: homeColors.ink,
    marginBottom: 8,
  },
  row: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f4ee',
  },
  reason: {
    fontSize: 15,
    color: homeColors.ink,
  },
  cancel: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    color: homeColors.muted,
    fontWeight: '700',
  },
});
