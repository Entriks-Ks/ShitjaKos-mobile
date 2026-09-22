import { useState } from 'react';
import {
  Pressable,
  type StyleProp,
  type TextInputProps,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native';
import { SymbolView } from 'expo-symbols';

import { authStyles as styles } from '@/constants/authStyles';

export function PasswordField({
  value,
  onChangeText,
  placeholder = 'Password',
  autoComplete,
  textContentType,
  editable = true,
  onSubmitEditing,
  style,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  editable?: boolean;
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  style?: StyleProp<ViewStyle>;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.passwordWrap, style]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={autoComplete}
        placeholder={placeholder}
        placeholderTextColor="#9aa19a"
        secureTextEntry={!visible}
        textContentType={textContentType}
        style={styles.passwordInput}
        editable={editable}
        onSubmitEditing={onSubmitEditing}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        hitSlop={8}
        onPress={() => setVisible((current) => !current)}
        style={styles.eyeButton}>
        <SymbolView
          name={
            visible
              ? { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }
              : { ios: 'eye', android: 'visibility', web: 'visibility' }
          }
          size={20}
          tintColor="#737e73"
          fallback={
            <Text style={styles.eyeFallback}>{visible ? 'Hide' : 'Show'}</Text>
          }
        />
      </Pressable>
    </View>
  );
}
