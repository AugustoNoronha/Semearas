import { useRouter, useFocusEffect } from 'expo-router';
import Head from 'expo-router/head';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Button, CatalogLayout, Choices, Field, colors, ui } from '../components/CatalogUI';
import { useAuth } from '../context/AuthContext';
import { CatalogItem, Category, ItemPage, categoryLabels, geneticLabels, sexLabels } from '../services/catalog';

export default function MyItems() {
  const { request } = useAuth();
  const router = useRouter();
  const wide = useWindowDimensions().width >= 800;
  const [data, setData] = useState<ItemPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | ''>('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [removing, setRemoving] = useState<CatalogItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const sequence = useRef(0);

  const load = useCallback(async () => {
    const run = ++sequence.current;
    setLoading(true); setError(null);
    try {
      const result = await request<ItemPage>(`/api/items?page=${page}&size=20&q=${encodeURIComponent(query)}${category ? `&category=${category}` : ''}`);
      if (sequence.current === run) setData(result);
    } catch (e) { if (sequence.current === run) { setData(null); setError(e instanceof Error ? e.message : 'Não foi possível carregar.'); } }
    finally { if (sequence.current === run) setLoading(false); }
  }, [request, page, query, category]);
  useFocusEffect(useCallback(() => { void load(); return () => { sequence.current++; }; }, [load]));

  async function remove() {
    if (!removing || deleting) return;
    setDeleting(true); setDeleteError(null);
    try {
      await request(`/api/items/${removing.id}`, { method: 'DELETE' });
      setRemoving(null);
      if (page > 0 && data?.content.length === 1) setPage(page - 1);
      else await load();
    } catch (e) { setDeleteError(e instanceof Error ? e.message : 'Não foi possível excluir.'); }
    finally { setDeleting(false); }
  }

  return <CatalogLayout>
    <Head><title>Meus cadastros | SEMEARAS</title></Head>
    <View style={[ui.row, { justifyContent: 'space-between', marginBottom: 30 }]}>
      <View style={{ flex: 1, minWidth: 230 }}><Text style={ui.eyebrow}>SEU ACERVO</Text><Text accessibilityRole="header" style={ui.title}>Meus cadastros</Text><Text style={ui.subtitle}>Seus animais e materiais genéticos, organizados em um só lugar.</Text></View>
      <Button title="+ Novo cadastro" onPress={() => router.push('/cadastros/novo')} />
    </View>
    <View style={[ui.card, { gap: 20, marginBottom: 24 }]}>
      <Choices label="Categoria" value={category} options={[{ value: '', label: 'Todos' }, { value: 'ANIMAL', label: 'Animais' }, { value: 'GENETIC_MATERIAL', label: 'Material genético' }]}
        onChange={value => { setCategory(value); setPage(0); }} />
      <View style={[ui.row, { alignItems: 'flex-end' }]}><View style={{ flex: 1, minWidth: 200 }}><Field label="Buscar nos meus cadastros" placeholder="Nome, espécie ou raça" maxLength={100} value={search} onChangeText={setSearch} returnKeyType="search" onSubmitEditing={() => { setQuery(search.trim()); setPage(0); }} /></View><Button title="Buscar" secondary onPress={() => { setQuery(search.trim()); setPage(0); }} /></View>
    </View>
    {loading ? <ActivityIndicator color={colors.green} accessibilityLabel="Carregando cadastros" style={{ padding: 40 }} /> : error ? <View style={[ui.card, { gap: 18 }]}><Text accessibilityRole="alert" style={ui.error}>{error}</Text><Button title="Tentar novamente" onPress={() => { void load(); }} /></View> : data && <>
      <Text style={s.count}>{data.totalElements} {data.totalElements === 1 ? 'cadastro encontrado' : 'cadastros encontrados'} · Visíveis apenas para você</Text>
      {data.content.length === 0 ? <View style={[ui.card, s.empty]}><Text style={s.emptySymbol}>✦</Text><Text style={s.itemName}>{query || category ? 'Nenhum resultado por aqui.' : 'Seu acervo começa aqui.'}</Text><Text style={[ui.subtitle, { textAlign: 'center' }]}>{query || category ? 'Experimente outra busca ou categoria.' : 'Cadastre seu primeiro animal ou material genético.'}</Text><Button title="Cadastrar agora" onPress={() => router.push('/cadastros/novo')} /></View> : <View style={s.grid}>
        {data.content.map(item => <View key={item.id} style={[ui.card, { width: wide ? '48%' : '100%', gap: 12 }]}>
          <Text style={s.badge}>{categoryLabels[item.category].toUpperCase()}</Text>
          <Text style={s.itemName}>{item.name}</Text>
          <Text style={s.meta}>{[item.species, item.breed].filter(Boolean).join(' · ')}</Text>
          <Text style={s.meta}>{item.category === 'ANIMAL' ? (item.sex ? sexLabels[item.sex] : 'Não informado') : `${geneticLabels[item.geneticType!]} · Quantidade: ${item.quantity}`}</Text>
          {(item.city || item.state) && <Text style={s.meta}>{[item.city, item.state].filter(Boolean).join(' / ')}</Text>}
          {item.registryNumber && <Text style={s.meta}>Registro: {item.registryNumber}</Text>}
          {item.description && <Text numberOfLines={2} style={s.description}>{item.description}</Text>}
          <View style={[ui.row, { marginTop: 8 }]}><Button title="Ver e editar" secondary onPress={() => router.push(`/cadastros/${item.id}`)} /><Button title="Excluir" danger onPress={() => { setRemoving(item); setDeleteError(null); }} /></View>
        </View>)}
      </View>}
      {data.totalElements > 20 && <View style={[ui.row, { justifyContent: 'center', marginTop: 28 }]}><Button title="Anterior" secondary disabled={page === 0} onPress={() => setPage(page - 1)} /><Text style={s.meta}>Página {page + 1} de {Math.ceil(data.totalElements / 20)}</Text><Button title="Próxima" secondary disabled={(page + 1) * 20 >= data.totalElements} onPress={() => setPage(page + 1)} /></View>}
    </>}
    <Modal visible={!!removing} transparent animationType="fade" onRequestClose={() => { if (!deleting) setRemoving(null); }}>
      <View style={s.overlay}><View style={[ui.card, { width: '100%', maxWidth: 440, gap: 20 }]}>
        <Text accessibilityRole="header" style={s.itemName}>Excluir cadastro?</Text><Text style={ui.subtitle}>“{removing?.name}” será removido da sua lista.</Text>
        {deleteError && <Text accessibilityRole="alert" style={ui.error}>{deleteError}</Text>}
        <View style={ui.row}><Button title="Cancelar" secondary disabled={deleting} onPress={() => setRemoving(null)} /><Button title={deleting ? 'Excluindo...' : 'Confirmar exclusão'} danger busy={deleting} onPress={() => { void remove(); }} /></View>
      </View></View>
    </Modal>
  </CatalogLayout>;
}

const s = StyleSheet.create({
  count: { fontSize: 12, color: colors.muted, marginBottom: 18 }, grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 20 },
  empty: { alignItems: 'center', paddingVertical: 46, gap: 18 }, emptySymbol: { color: '#8EA27C', fontSize: 40 },
  badge: { color: '#62804F', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }, itemName: { fontSize: 22, fontWeight: '600', color: colors.green },
  meta: { color: colors.muted, fontSize: 13, lineHeight: 20 }, description: { color: colors.ink, fontSize: 13, lineHeight: 22 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#102D20AA' },
});
