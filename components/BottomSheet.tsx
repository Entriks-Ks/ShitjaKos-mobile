import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Animated, Modal, PanResponder, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function BottomSheet({ visible, ...props }: BottomSheetProps) {
  return visible ? <SheetSurface {...props} /> : null;
}

function SheetSurface({ onClose, children }: Omit<BottomSheetProps, 'visible'>) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(height)).current;
  const sheetHeight = useRef(height);
  const closing = useRef(false);
  const closeCallback = useRef(onClose);
  closeCallback.current = onClose;

  useEffect(() => () => translateY.stopAnimation(), [translateY]);

  const { close, responder } = useMemo(() => {
    const settle = () => Animated.spring(translateY, {
      toValue: 0,
      damping: 24,
      stiffness: 260,
      mass: 1,
      useNativeDriver: true,
    }).start();
    const close = () => {
      if (closing.current) return;
      closing.current = true;
      Animated.timing(translateY, {
        toValue: height,
        duration: 200,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) closeCallback.current();
      });
    };
    const responder = PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        !closing.current && Math.abs(dy) > 4 && Math.abs(dy) > Math.abs(dx),
      onPanResponderGrant: () => translateY.stopAnimation(),
      onPanResponderMove: (_, { dy }) => translateY.setValue(Math.max(0, dy)),
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > Math.min(120, sheetHeight.current * 0.25) || (dy > 12 && vy > 0.7)) close();
        else settle();
      },
      onPanResponderTerminate: settle,
    });
    return { close, responder };
  }, [height, translateY]);

  return (
    <Modal
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={close}
      onShow={() => Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start()}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityRole="button" accessibilityLabel="Close sheet" />
        <Animated.View
          accessibilityViewIsModal
          onAccessibilityEscape={close}
          onLayout={(event) => { sheetHeight.current = event.nativeEvent.layout.height; }}
          style={[styles.sheet, {
            maxHeight: Math.min(height * 0.8, height - insets.top - 12),
            paddingBottom: Math.max(insets.bottom, 16),
            transform: [{ translateY }],
          }]}>
          <View {...responder.panHandlers}>
            <Pressable
              style={styles.handleArea}
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel="Close sheet"
              accessibilityHint="Drag down or double tap to close">
              <View style={styles.handle} />
            </Pressable>
          </View>
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(23, 40, 32, 0.18)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  handleArea: { height: 44, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#b9c1bb' },
  content: { flexShrink: 1 },
});
