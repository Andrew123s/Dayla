import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';

const colors = {
  primary: '#3a5a40',
  sage: '#588157',
  bg: '#f5f5f4',
  text: '#44403c',
  muted: '#a8a29e',
  white: '#ffffff',
  error: '#b91c1c',
};

type RegisterScreenProps = {
  navigation: { navigate: (name: 'Login') => void };
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<'name' | 'email' | 'password' | null>(
    null
  );

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.inner}>
        <Text style={styles.logo}>🌿 Dayla</Text>
        <Text style={styles.subtitle}>Create your account</Text>

        <TextInput
          style={[
            styles.input,
            focused === 'name' && styles.inputFocused,
          ]}
          placeholder="Name"
          placeholderTextColor={colors.muted}
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
          onFocus={() => setFocused('name')}
          onBlur={() => setFocused(null)}
          editable={!loading}
        />

        <TextInput
          style={[
            styles.input,
            focused === 'email' && styles.inputFocused,
          ]}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
          editable={!loading}
        />

        <TextInput
          style={[
            styles.input,
            focused === 'password' && styles.inputFocused,
          ]}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onFocus={() => setFocused('password')}
          onBlur={() => setFocused(null)}
          editable={!loading}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkWrap}
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
        >
          <Text style={styles.linkMuted}>Already have an account? </Text>
          <Text style={styles.link}>Log In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e7e5e4',
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 14,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
  linkWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  linkMuted: {
    color: colors.muted,
    fontSize: 15,
  },
  link: {
    color: colors.sage,
    fontSize: 15,
    fontWeight: '600',
  },
});
