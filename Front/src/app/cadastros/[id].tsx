import { useLocalSearchParams } from 'expo-router';
import { ItemForm } from '../../components/ItemForm';
export default function EditItem() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ItemForm key={id} id={id} />;
}
