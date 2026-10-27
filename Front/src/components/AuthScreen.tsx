import { Link } from 'expo-router';
import { Brand, LivestockMark } from './Brand';
import Head from 'expo-router/head';
import { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import type { TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthErrors, AuthValues, formatCpf, validateAuth } from '../utils/validation';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';

const green = '#244D3D';
type InputRef = React.ComponentRef<typeof TextInput>;
type FieldProps = TextInputProps & { label: string; error?: string; hint?: string; password?: boolean; inputRef?: React.RefObject<InputRef | null> };

function Field({ label, error, hint, password, inputRef, ...props }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return <View style={s.field}>
    <Text style={s.label}>{label}</Text>
    <View style={[s.inputBox, focused && s.inputFocused, !!error && s.inputError]}>
      <TextInput {...props} ref={inputRef} accessibilityLabel={label} accessibilityHint={error || hint}
        placeholderTextColor="#92968E" secureTextEntry={password && !visible} autoCorrect={false}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={s.input} />
      {password && <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
        onPress={() => setVisible(!visible)} style={s.showPassword}><Text style={s.showText}>{visible ? 'Ocultar' : 'Mostrar'}</Text></Pressable>}
    </View>
    {error ? <Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text> : hint ? <Text style={s.hint}>{hint}</Text> : null}
  </View>;
}

export function AuthScreen({ mode }: { mode: 'login' | 'register' }) {
  const register = mode === 'register';
  const desktop = useWindowDimensions().width >= 900;
  const [values, setValues] = useState<AuthValues>({ name: '', email: '', cpf: '', password: '' });
  const [errors, setErrors] = useState<AuthErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const { authenticate, message } = useAuth();
  const nameRef = useRef<InputRef>(null), emailRef = useRef<InputRef>(null), cpfRef = useRef<InputRef>(null), passwordRef = useRef<InputRef>(null);

  function change(key: keyof AuthValues, value: string) {
    const next = { ...values, [key]: key === 'cpf' ? formatCpf(value) : value };
    setValues(next); setRequestError(null);
    if (submitted) setErrors(validateAuth(next, register));
  }
  async function submit() {
    if (submitting.current) return;
    const next = validateAuth(values, register);
    setErrors(next); setSubmitted(true); setRequestError(null);
    const first = (['name', 'email', 'cpf', 'password'] as const).find(key => next[key]);
    if (first) { ({ name: nameRef, email: emailRef, cpf: cpfRef, password: passwordRef })[first].current?.focus(); return; }
    submitting.current = true; setBusy(true);
    try { await authenticate(values, register); }
    catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.');
      if (error instanceof ApiError && error.fields) {
        const nextErrors: AuthErrors = {};
        for (const key of ['name', 'email', 'cpf', 'password'] as const) {
          if (error.fields[key]) nextErrors[key] = error.fields[key];
        }
        setErrors(nextErrors);
      }
    } finally { submitting.current = false; setBusy(false); }
  }

  return <SafeAreaView style={s.safe}>
    <Head><title>{register ? 'Criar conta' : 'Entrar'} | SEMEARAS</title></Head>
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.scroll}>
        <View style={[s.shell, desktop && s.shellDesktop]}>
          <View style={[s.story, desktop ? s.storyDesktop : s.storyMobile]}>
            <Brand light />
            {desktop && <>
              <View style={s.storyCopy}>
                <Text style={s.eyebrow}>EQUINOS · BOVINOS · GENÉTICA</Text>
                <Text style={s.storyTitle}>Seu plantel.{'\n'}Sua história.{'\n'}Novas possibilidades.</Text>
                <Text style={s.storyDescription}>Animais, genética e pessoas{'\n'}conectados pela mesma paixão.</Text>
              </View>
              <View style={s.emblem} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                <LivestockMark size={250} light seal />
              </View>
              <Text style={s.storyFooter}>TRADIÇÃO NO CAMPO. CONEXÕES PARA O FUTURO.</Text>
            </>}
          </View>
          <View style={[s.formPanel, desktop && s.formPanelDesktop]}>
            <View style={s.form}>
              <View style={s.tabs}>
                <Link href="/" replace asChild><Pressable accessibilityRole="link" accessibilityState={{ selected: !register }} style={StyleSheet.flatten([s.tab, !register && s.tabActive])}><Text style={[s.tabText, !register && s.tabTextActive]}>Entrar</Text></Pressable></Link>
                <Link href="/cadastro" replace asChild><Pressable accessibilityRole="link" accessibilityState={{ selected: register }} style={StyleSheet.flatten([s.tab, register && s.tabActive])}><Text style={[s.tabText, register && s.tabTextActive]}>Criar conta</Text></Pressable></Link>
              </View>
              <Text style={s.formEyebrow}>{register ? 'VAMOS COMEÇAR' : 'BOM TER VOCÊ AQUI'}</Text>
              <Text accessibilityRole="header" style={s.title}>{register ? 'Seu próximo capítulo.' : 'Bem-vindo de volta.'}</Text>
              <Text style={s.subtitle}>{register ? 'Crie sua conta e faça parte do SEMEARAS.' : 'Entre na sua conta para continuar sua jornada.'}</Text>
              <View style={s.fields}>
                {register && <Field label="Nome" testID="name" inputRef={nameRef} editable={!busy} placeholder="Como você se chama?" value={values.name} onChangeText={v => change('name', v)} error={errors.name} autoComplete="name" autoCapitalize="words" returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()} />}
                <Field label="E-mail" testID="email" inputRef={emailRef} editable={!busy} placeholder="seuemail@exemplo.com" value={values.email} onChangeText={v => change('email', v)} error={errors.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" returnKeyType="next" onSubmitEditing={() => (register ? cpfRef : passwordRef).current?.focus()} />
                {register && <Field label="CPF" testID="cpf" inputRef={cpfRef} editable={!busy} placeholder="000.000.000-00" value={values.cpf} onChangeText={v => change('cpf', v)} error={errors.cpf} maxLength={14} keyboardType="number-pad" autoComplete="off" returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()} />}
                <Field label="Senha" testID="password" inputRef={passwordRef} editable={!busy} password placeholder={register ? 'Crie uma senha segura' : 'Digite sua senha'} value={values.password} onChangeText={v => change('password', v)} error={errors.password} hint={register ? 'Use pelo menos 8 caracteres.' : undefined} autoCapitalize="none" autoComplete={register ? 'new-password' : 'current-password'} returnKeyType="done" onSubmitEditing={submit} />
              </View>
              {(requestError || message) && <View style={s.notice} accessibilityLiveRegion="polite" accessibilityRole="alert">
                <Text style={requestError ? s.error : s.noticeText}>{requestError || message}</Text>
              </View>}
              <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy, busy }} disabled={busy} onPress={() => { void submit(); }} style={({ pressed }) => [s.submit, pressed && s.submitPressed, busy && { opacity: 0.65 }]}><Text style={s.submitText}>{busy ? 'Aguarde...' : register ? 'Criar minha conta' : 'Entrar na minha conta'}</Text>{busy ? <ActivityIndicator color="#FFF" /> : <Text style={s.arrow}>→</Text>}</Pressable>
              <View style={s.switchRow}><Text style={s.switchText}>{register ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}</Text><Link href={register ? '/' : '/cadastro'} replace style={s.switchLink}>{register ? 'Entrar' : 'Cadastre-se'}</Link></View>
              <View style={s.formFooter}><View style={s.footerLine} /><Text style={s.footerText}>SEMEARAS · Animais, genética e conexões</Text><View style={s.footerLine} /></View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  flex: { flex: 1 }, safe: { flex: 1, backgroundColor: '#FAF9F6' }, scroll: { flexGrow: 1 }, shell: { flex: 1 }, shellDesktop: { flexDirection: 'row', minHeight: 780 },
  story: { backgroundColor: green }, storyDesktop: { width: '44%', paddingHorizontal: 48, paddingTop: 42, paddingBottom: 30, overflow: 'hidden', minHeight: 780 }, storyMobile: { paddingHorizontal: 24, paddingVertical: 24 },
  storyCopy: { marginTop: 83, zIndex: 1 }, eyebrow: { color: '#C7D6AC', letterSpacing: 1.5, fontSize: 10, fontWeight: '600' },
  storyTitle: { fontSize: 42, lineHeight: 52, fontWeight: '400', letterSpacing: -1.5, color: '#FCF9EE', marginTop: 23, fontFamily: Platform.OS === 'ios' ? 'Georgia' : Platform.OS === 'web' ? 'Georgia, serif' : 'serif' }, storyDescription: { color: '#CFDCD0', lineHeight: 25, fontSize: 15, marginTop: 22 },
  emblem: { height: 260, marginTop: 20, alignItems: 'center', justifyContent: 'center' },
  storyFooter: { marginTop: 18, color: '#D3C3A0', fontSize: 9, letterSpacing: 1.5, textAlign: 'center' },
  formPanel: { flex: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 28, justifyContent: 'center', alignItems: 'center' }, formPanelDesktop: { paddingHorizontal: 48, paddingVertical: 44 }, form: { width: '100%', maxWidth: 420 }, tabs: { flexDirection: 'row', backgroundColor: '#EDEFE8', borderRadius: 10, padding: 4, marginBottom: 37 }, tab: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 7 }, tabActive: { backgroundColor: '#FFFFFF', boxShadow: '0 1px 4px #213C2110' }, tabText: { color: '#6D7469', fontSize: 14, fontWeight: '500' }, tabTextActive: { color: green, fontWeight: '700' },
  formEyebrow: { fontSize: 10, letterSpacing: 2, fontWeight: '700', color: '#6A825C', marginBottom: 11 }, title: { fontSize: 30, lineHeight: 38, letterSpacing: -0.9, color: '#203E30', fontWeight: '600' }, subtitle: { color: '#71786D', fontSize: 14, lineHeight: 22, marginTop: 9 }, fields: { gap: 19, marginTop: 30 }, field: { gap: 7 }, label: { fontSize: 13, fontWeight: '600', color: '#343F32' },
  inputBox: { minHeight: 51, borderWidth: 1, borderColor: '#DADFD4', borderRadius: 8, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center' }, inputFocused: { borderColor: '#557B47', boxShadow: '0 0 0 3px #557B4718' }, inputError: { borderColor: '#B44736' }, input: { flex: 1, minWidth: 0, paddingHorizontal: 14, paddingVertical: 15, fontSize: 14, color: '#263C2C', outlineWidth: 0 }, showPassword: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 12 }, showText: { fontSize: 11, color: green, fontWeight: '600' }, hint: { fontSize: 11, color: '#777E71' }, error: { color: '#A23728', fontSize: 12, lineHeight: 18 },
  submit: { backgroundColor: green, minHeight: 52, borderRadius: 8, marginTop: 26, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, submitPressed: { backgroundColor: '#17382B' }, submitText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 }, arrow: { color: '#D8E4BC', fontSize: 22 }, switchRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 23 }, switchText: { fontSize: 13, color: '#71786D' }, switchLink: { fontSize: 13, color: green, fontWeight: '700', paddingVertical: 10 }, formFooter: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 30 }, footerLine: { flex: 1, height: 1, backgroundColor: '#E1E4DA' }, footerText: { fontSize: 10, color: '#858C7E' },
  notice: { backgroundColor: '#EDF1E5', borderWidth: 1, borderColor: '#D4DEC5', padding: 14, borderRadius: 8, marginTop: 20, gap: 5 }, noticeTitle: { color: green, fontSize: 13, fontWeight: '700' }, noticeText: { color: '#53624C', fontSize: 12, lineHeight: 18 },
});
