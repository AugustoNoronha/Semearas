import { Link, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View, useWindowDimensions } from 'react-native';
import { Button, CatalogLayout, Choices, Field, colors, ui } from './CatalogUI';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/api';
import { CatalogItem, Category, GeneticType, Sex, brazilStates, geneticLabels, sexLabels } from '../services/catalog';

type Values = {
  category: Category; name: string; species: string; breed: string; registryNumber: string;
  city: string; state: string; description: string; sex: Sex; birthDate: string;
  geneticType: GeneticType; sourceAnimal: string; quantity: string;
};
const empty: Values = { category: 'ANIMAL', name: '', species: '', breed: '', registryNumber: '', city: '', state: '', description: '', sex: 'UNKNOWN', birthDate: '', geneticType: 'SEMEN', sourceAnimal: '', quantity: '1' };

function toIsoDate(value: string) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null;
  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  if (year < 1900 || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  if (date > new Date()) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function ItemForm({ id }: { id?: string }) {
  const { request } = useAuth();
  const router = useRouter();
  const wide = useWindowDimensions().width >= 800;
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [loaded, setLoaded] = useState(!id);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    request<CatalogItem>(`/api/items/${encodeURIComponent(id)}`).then(item => {
      if (!active) return;
      setValues({ category: item.category, name: item.name, species: item.species, breed: item.breed || '', registryNumber: item.registryNumber || '', city: item.city || '', state: item.state || '', description: item.description || '', sex: item.sex || 'UNKNOWN', birthDate: item.birthDate ? item.birthDate.split('-').reverse().join('/') : '', geneticType: item.geneticType || 'SEMEN', sourceAnimal: item.sourceAnimal || '', quantity: String(item.quantity || 1) });
      setLoaded(true);
    }).catch(e => { if (active) setError(e instanceof Error ? e.message : 'Não foi possível carregar.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, request, attempt]);

  function change<K extends keyof Values>(key: K, value: Values[K]) {
    setValues(current => ({ ...current, [key]: value }));
    setErrors(current => ({ ...current, [key]: undefined }));
    setError(null);
  }

  async function save() {
    if (submitting.current) return;
    const next: Partial<Record<keyof Values, string>> = {};
    if (values.name.trim().length < 2) next.name = 'Informe pelo menos 2 caracteres.';
    if (values.species.trim().length < 2) next.species = 'Informe a espécie.';
    if (values.state && !brazilStates.includes(values.state)) next.state = 'Informe uma UF válida.';
    const birth = values.birthDate ? toIsoDate(values.birthDate) : null;
    if (values.category === 'ANIMAL' && values.birthDate && !birth) next.birthDate = 'Use uma data válida, até hoje, no formato DD/MM/AAAA.';
    if (values.category === 'GENETIC_MATERIAL' && (!/^\d+$/.test(values.quantity) || Number(values.quantity) < 1 || Number(values.quantity) > 1000000)) next.quantity = 'Informe um número inteiro de 1 a 1.000.000.';
    setErrors(next); setError(null);
    if (Object.keys(next).length) { setError('Confira os campos destacados antes de salvar.'); return; }
    const optional = (value: string) => value.trim() || null;
    const body = { category: values.category, name: values.name.trim(), species: values.species.trim(), breed: optional(values.breed), registryNumber: optional(values.registryNumber), city: optional(values.city), state: optional(values.state), description: optional(values.description),
      ...(values.category === 'ANIMAL' ? { sex: values.sex, birthDate: birth } : { geneticType: values.geneticType, sourceAnimal: optional(values.sourceAnimal), quantity: Number(values.quantity) }) };
    submitting.current = true; setBusy(true);
    try {
      await request<CatalogItem>(id ? `/api/items/${encodeURIComponent(id)}` : '/api/items', { method: id ? 'PUT' : 'POST', body });
      router.dismissTo('/meus-cadastros');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.');
      if (e instanceof ApiError && e.fields) {
        const fields: Partial<Record<keyof Values, string>> = {};
        for (const key of Object.keys(empty) as (keyof Values)[]) if (e.fields[key]) fields[key] = e.fields[key];
        setErrors(fields);
      }
    } finally { submitting.current = false; setBusy(false); }
  }

  const column = { flexBasis: wide ? '46%' as const : '100%' as const, flexGrow: 1 };
  return <CatalogLayout>
    <Head><title>{id ? 'Editar cadastro' : 'Novo cadastro'} | SEMEARAS</title></Head>
    <Link dismissTo href="/meus-cadastros" style={{ color: colors.green, marginBottom: 22, paddingVertical: 8 }}>← Voltar aos meus cadastros</Link>
    <Text style={ui.eyebrow}>{id ? 'CUIDE DO SEU ACERVO' : 'UM NOVO COMEÇO'}</Text>
    <Text accessibilityRole="header" style={ui.title}>{id ? 'Editar cadastro' : 'Novo cadastro'}</Text>
    <Text style={[ui.subtitle, { marginBottom: 28 }]}>Registre as informações do seu animal ou material genético. Os campos com * são obrigatórios.</Text>
    {loading ? <ActivityIndicator accessibilityLabel="Carregando cadastro" color={colors.green} /> : !loaded ? <View style={[ui.card, { gap: 20 }]}><Text accessibilityRole="alert" style={ui.error}>{error}</Text><Button title="Tentar novamente" onPress={() => { setLoading(true); setError(null); setAttempt(attempt + 1); }} /></View> : <View style={[ui.card, { gap: 26, maxWidth: 960 }]}>
      <Choices label="O que você deseja cadastrar? *" value={values.category} disabled={busy} options={[{ value: 'ANIMAL', label: 'Animal' }, { value: 'GENETIC_MATERIAL', label: 'Material genético' }]} onChange={value => { change('category', value); setErrors({}); }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 22 }}>
        <View style={column}><Field label="Nome / identificação *" placeholder={values.category === 'ANIMAL' ? 'Ex.: Estrela do Campo' : 'Ex.: Sêmen de Campeão do Vale'} value={values.name} onChangeText={v => change('name', v)} maxLength={150} error={errors.name} editable={!busy} /></View>
        <View style={column}><Field label="Espécie *" placeholder="Ex.: Equino, bovino, ovino..." value={values.species} onChangeText={v => change('species', v)} maxLength={80} error={errors.species} editable={!busy} /></View>
        <View style={column}><Field label="Raça (opcional)" placeholder="Ex.: Mangalarga Marchador" value={values.breed} onChangeText={v => change('breed', v)} maxLength={100} error={errors.breed} editable={!busy} /></View>
        <View style={column}><Field label="Número de registro (opcional)" placeholder="Registro na associação, se houver" value={values.registryNumber} onChangeText={v => change('registryNumber', v)} maxLength={100} error={errors.registryNumber} editable={!busy} /></View>
      </View>
      <View style={{ height: 1, backgroundColor: colors.line }} />
      {values.category === 'ANIMAL' ? <>
        <Choices label="Sexo *" value={values.sex} disabled={busy} options={(Object.entries(sexLabels) as [Sex, string][]).map(([value, label]) => ({ value, label }))} onChange={v => change('sex', v)} />
        <Field label="Data de nascimento (opcional)" placeholder="DD/MM/AAAA" keyboardType="number-pad" value={values.birthDate} onChangeText={v => change('birthDate', v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3'))} maxLength={10} error={errors.birthDate} editable={!busy} />
      </> : <>
        <Choices label="Tipo de material *" value={values.geneticType} disabled={busy} options={(Object.entries(geneticLabels) as [GeneticType, string][]).map(([value, label]) => ({ value, label }))} onChange={v => change('geneticType', v)} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 22 }}>
          <View style={column}><Field label="Animal de origem / doadora (opcional)" placeholder="Nome do animal de origem" value={values.sourceAnimal} onChangeText={v => change('sourceAnimal', v)} maxLength={150} error={errors.sourceAnimal} editable={!busy} /></View>
          <View style={column}><Field label="Quantidade *" hint="Número de doses, embriões ou unidades cadastradas." keyboardType="number-pad" value={values.quantity} onChangeText={v => change('quantity', v)} maxLength={7} error={errors.quantity} editable={!busy} /></View>
        </View>
      </>}
      <View style={{ height: 1, backgroundColor: colors.line }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 22 }}>
        <View style={column}><Field label="Cidade (opcional)" placeholder="Onde está localizado?" value={values.city} onChangeText={v => change('city', v)} maxLength={100} error={errors.city} editable={!busy} /></View>
        <View style={column}><Field label="UF (opcional)" placeholder="Ex.: MG" autoCapitalize="characters" value={values.state} onChangeText={v => change('state', v.toUpperCase())} maxLength={2} error={errors.state} editable={!busy} /></View>
      </View>
      <Field label="Descrição (opcional)" placeholder="Conte um pouco mais: características, origem e observações importantes." value={values.description} onChangeText={v => change('description', v)} maxLength={3000} multiline error={errors.description} editable={!busy} hint={`${values.description.length}/3000 caracteres`} />
      {error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={ui.error}>{error}</Text>}
      <View style={ui.row}><Button title={busy ? 'Salvando...' : id ? 'Salvar alterações' : 'Salvar cadastro'} busy={busy} onPress={() => { void save(); }} /><Button title="Cancelar" secondary disabled={busy} onPress={() => router.dismissTo('/meus-cadastros')} /></View>
    </View>}
  </CatalogLayout>;
}
