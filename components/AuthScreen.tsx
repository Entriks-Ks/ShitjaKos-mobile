import { type ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { authStyles as styles } from '@/constants/authStyles';

const hero = require('../assets/images/auth-hero.jpg');

export function AuthScreen({
  title,
  subtitle,
  children,
  embedded = false,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  embedded?: boolean;
}) {
  const { width } = useWindowDimensions();
  const wide = width >= 860 && !embedded;

  return (
    <SafeAreaView style={[styles.safe, embedded && styles.safeEmbedded]} edges={embedded ? ['top'] : undefined}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.frame, wide && styles.frameWide, embedded && styles.frameEmbedded]}>
          <View style={[styles.split, wide && styles.splitWide, styles.splitFill]}>
            <View
              style={[
                styles.photoWrap,
                wide && styles.photoWrapWide,
                embedded && styles.photoWrapEmbedded,
              ]}>
              <Image
                source={hero}
                accessibilityLabel="Open box of clothing, bags, and accessories"
                resizeMode="cover"
                style={styles.photo}
              />
            </View>
            <View style={[styles.panel, wide && styles.panelWide]}>
              <View style={styles.body}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
                {children}
                <View style={styles.secure}>
                  <SymbolView
                    name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
                    size={12}
                    tintColor="#9aa19a"
                  />
                  <Text style={styles.secureText}>This connection is secure.</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
