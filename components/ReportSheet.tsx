import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>Raporto problemin</Text>
          {reasons.map((reason) => (
            <Pressable key={reason} style={styles.row} onPress={() => onSubmit(reason)}>
              <Text style={styles.reason}>{reason}</Text>
            </Pressable>
          ))}
          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Anulo</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(23, 40, 32, 0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
    paddingBottom: 28,
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
