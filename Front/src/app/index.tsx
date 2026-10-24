import { AuthScreen } from '../components/AuthScreen';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
export default function Login() {
  const { session } = useAuth();
  return session ? <Redirect href="/meus-cadastros" /> : <AuthScreen mode="login" />;
}
