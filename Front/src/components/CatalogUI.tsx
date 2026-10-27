import { Link } from 'expo-router';
import { Brand } from './Brand';
import type { PropsWithChildren } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import type { TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const colors = { green: '#244D3D', ink: '#253C2E', muted: '#677363', line: '#DCE3D5', paper: '#FAF9F6' };

export function CatalogLayout({ children }: PropsWithChildren) {
  const wide = useWindowDimensions().width >= 800;
  return <SafeAreaView style={ui.safe}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.scroll}>
        <View style={[ui.container, wide && { paddingHorizontal: 40 }]}>
          <View style={ui.header}>
            <Link dismissTo href="/meus-cadastros" asChild><Pressable accessibilityRole="link" accessibilityLabel="SEMEARAS — Meus cadastros"><Brand /></Pressable></Link>
            <View style={ui.nav}><Link dismissTo href="/meus-cadastros" style={ui.navLink}>Meus cadastros</Link><Link href="/conta" style={ui.navLink}>Minha conta</Link></View>
          </View>
          {children}
          <Text style={ui.footer}>SEMEARAS · Animais, genética e conexões</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

export function Button({ title, onPress, busy = false, disabled = false, secondary = false, danger = false }: {
  title: string; onPress: () => void; busy?: boolean; disabled?: boolean; secondary?: boolean; danger?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || busy, busy }} disabled={disabled || busy}
    onPress={onPress} style={({ pressed }) => [ui.button, secondary && ui.secondary, danger && ui.danger, (disabled || busy || pressed) && { opacity: 0.65 }]}>
    {busy && <ActivityIndicator color={secondary ? colors.green : '#FFF'} />}
    <Text style={[ui.buttonText, secondary && { color: colors.green }, danger && { color: '#9E3528' }]}>{title}</Text>
  </Pressable>;
}

export function Field({ label, error, hint, ...props }: TextInputProps & { label: string; error?: string; hint?: string }) {
  return <View style={ui.field}>
    <Text style={ui.label}>{label}</Text>
    <TextInput {...props} accessibilityLabel={label} accessibilityHint={error || hint} placeholderTextColor="#92998B"
      style={[ui.input, props.multiline && { minHeight: 120, textAlignVertical: 'top' }, !!error && { borderColor: '#B34737' }]} />
    {error ? <Text style={ui.error}>{error}</Text> : hint ? <Text style={ui.hint}>{hint}</Text> : null}
  </View>;
}

export function Choices<T extends string>({ label, value, options, onChange, disabled }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void; disabled?: boolean;
}) {
  return <View style={ui.field}><Text style={ui.label}>{label}</Text><View style={ui.choices}>
    {options.map(option => <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label}
      accessibilityState={{ checked: value === option.value, disabled }} disabled={disabled}
      onPress={() => onChange(option.value)} style={[ui.chip, value === option.value && ui.chipActive]}>
      <Text style={[ui.chipText, value === option.value && ui.chipTextActive]}>{option.label}</Text>
    </Pressable>)}
  </View></View>;
}

export const ui = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper }, scroll: { flexGrow: 1, alignItems: 'center' }, container: { width: '100%', maxWidth: 1200, paddingHorizontal: 22, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, paddingVertical: 28, borderBottomWidth: 1, borderColor: colors.line, marginBottom: 36 },
  brand: { color: colors.green, fontSize: 22, fontWeight: '700', letterSpacing: 3 }, nav: { flexDirection: 'row', flexWrap: 'wrap', gap: 22 }, navLink: { fontSize: 13, color: colors.green, paddingVertical: 10 },
  eyebrow: { fontSize: 10, letterSpacing: 2, color: '#6A825C', fontWeight: '700', marginBottom: 12 }, title: { fontSize: 32, color: colors.green, fontWeight: '600', letterSpacing: -0.7 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 23, marginTop: 10 },
  card: { backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 24 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'center' },
  button: { backgroundColor: colors.green, borderRadius: 8, minHeight: 46, paddingHorizontal: 20, paddingVertical: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
  buttonText: { color: '#FFF', fontWeight: '600', fontSize: 13 }, secondary: { backgroundColor: '#F4F6EF', borderWidth: 1, borderColor: colors.line }, danger: { backgroundColor: '#FBEEE9', borderWidth: 1, borderColor: '#ECC9BE' },
  field: { gap: 8 }, label: { color: colors.ink, fontSize: 13, fontWeight: '600' }, input: { minHeight: 50, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D6DECF', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 14, color: colors.ink, fontSize: 14 },
  error: { color: '#A23727', fontSize: 13, lineHeight: 21 }, hint: { color: colors.muted, fontSize: 11, lineHeight: 18 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { minHeight: 42, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: '#FFF' },
  chipActive: { backgroundColor: colors.green, borderColor: colors.green }, chipText: { color: colors.muted, fontSize: 13 }, chipTextActive: { color: '#FFF', fontWeight: '600' },
  footer: { marginTop: 44, color: '#838D7A', fontSize: 11, textAlign: 'center' },
});
