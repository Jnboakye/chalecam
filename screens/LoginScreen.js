import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.error);
    }
  };

  const handleGoogleSignIn = () => {
    signInWithGoogle();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center p-5">
        <Text className="text-4xl font-bold text-primary text-center mb-2">Chalecam</Text>
        <Text className="text-lg text-gray-600 text-center mb-10">Event Photo Sharing</Text>

        <View className="w-full">
          <TextInput
            className="bg-gray-100 rounded-lg p-4 mb-4 text-base border border-gray-200"
            style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0' }}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            className="bg-gray-100 rounded-lg p-4 mb-4 text-base border border-gray-200"
            style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0' }}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            className="bg-primary rounded-lg p-4 items-center mb-3"
            style={{ backgroundColor: '#6200EA', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 12 }}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold" style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-lg p-4 items-center mb-3 border border-primary"
            style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#6200EA' }}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Text className="text-primary text-base font-semibold" style={{ color: '#6200EA', fontSize: 16, fontWeight: '600' }}>Sign in with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            className="mt-5 items-center"
          >
            <Text className="text-gray-600 text-sm">
              Don't have an account? <Text className="text-primary font-semibold">Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

