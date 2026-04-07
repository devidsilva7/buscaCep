import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ActivityIndicator, Keyboard, Alert, SafeAreaView, ScrollView, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {

  const [logado, setLogado] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isCadastro, setIsCadastro] = useState(false);

  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [endereco, setEndereco] = useState(null);

  useEffect(() => {
    async function checkLogin() {
      const user = await AsyncStorage.getItem('@user');
      if (user) setLogado(true);
    }
    checkLogin();
  }, []);

  useEffect(() => {
    async function carregarDados() {
      const CEPsalvo = await AsyncStorage.getItem('@ultimo_cep');
      if (CEPsalvo) setCep(CEPsalvo);
    }
    carregarDados();
  }, []);

  async function handleAuth() {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha tudo');
      return;
    }

    if (isCadastro) {
      await AsyncStorage.setItem('@user', JSON.stringify({ email, senha }));
      Alert.alert('Sucesso', 'Conta criada!');
      setIsCadastro(false);
    } else {
      const user = await AsyncStorage.getItem('@user');
      const parsed = JSON.parse(user);

      if (parsed?.email === email && parsed?.senha === senha) {
        setLogado(true);
      } else {
        Alert.alert('Erro', 'Dados inválidos');
      }
    }
  }

  async function buscarCep() {
    if (cep.length !== 8) {
      Alert.alert('Erro', 'O CEP deve conter exatamente 8 números.');
      return;
    }

    setLoading(true);
    setEndereco(null);
    Keyboard.dismiss();

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        Alert.alert('Não encontrado', 'Este CEP não existe na base de dados.');
      } else {
        setEndereco(data);
        await AsyncStorage.setItem('@ultimo_cep', cep);
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  }

  function limpar() {
    setCep('');
    setEndereco(null);
  }

  // tela de login
  if (!logado) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.loginScroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.loginContainer}>

            <Image
              source={require('./assets/logo2.png')}
              style={{
                width: 220,
                height: 220,
                marginBottom: 36,
                borderRadius: 20,
                alignSelf: 'center'
              }}
            />

            <Text style={styles.loginLabel}>Email</Text>
            <TextInput
              placeholder="seu@email.com"
              style={styles.loginInput}
              value={email}
              onChangeText={setEmail}
              placeholderTextColor="#7AB9C3"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.loginLabel}>Senha</Text>
            <TextInput
              placeholder="••••••••"
              secureTextEntry
              style={styles.loginInput}
              value={senha}
              onChangeText={setSenha}
              placeholderTextColor="#7AB9C3"
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleAuth}>
              <Text style={styles.loginButtonText}>
                {isCadastro ? 'Cadastrar' : 'Entrar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsCadastro(!isCadastro)}>
              <Text style={styles.loginToggleText}>
                {isCadastro ? 'Já tem conta? Entrar' : 'Criar conta'}
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── TELA PRINCIPAL ────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>CepFlow</Text>
          <Text style={styles.subtitle}>Sua busca de endereço rápida</Text>
        </View>

        {/* CARD DE BUSCA */}
        <View style={styles.searchCard}>

          <Text style={styles.searchLabel}>Digite o CEP</Text>

          <TextInput
            style={styles.input}
            placeholder="00000-000"
            placeholderTextColor="#7AB9C3"
            value={cep}
            onChangeText={(t) => setCep(t.replace(/\D/g, ''))}
            keyboardType="numeric"
            maxLength={8}
          />

          <TouchableOpacity style={styles.button} onPress={buscarCep} activeOpacity={0.8}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Consultar endereço</Text>
            }
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={limpar}>
              <Text style={styles.btnLimparText}>Limpar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={async () => {
              await AsyncStorage.removeItem('@user');
              setLogado(false);
            }}>
              <Text style={styles.btnSairText}>Sair</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* RESULTADO */}
        {endereco && !loading && (
          <View style={styles.resultCard}>

            <Text style={styles.resultTitle}>Endereço encontrado</Text>

            <View style={styles.row}>
              <Text style={styles.label}>LOGRADOURO</Text>
              <Text style={styles.info}>{endereco.logradouro || 'Geral/Não informado'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>BAIRRO</Text>
              <Text style={styles.info}>{endereco.bairro || 'Não informado'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.rowInline}>
              <View style={styles.rowInlineItem}>
                <Text style={styles.label}>CIDADE</Text>
                <Text style={styles.info}>{endereco.localidade}</Text>
              </View>
              <View style={styles.rowInlineSeparator} />
              <View style={styles.rowInlineItem}>
                <Text style={styles.label}>ESTADO</Text>
                <Text style={styles.info}>{endereco.uf}</Text>
              </View>
            </View>

          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },

  // ── LOGIN ──────────────────────────────────────
  loginScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loginContainer: {
    width: '100%',
    paddingHorizontal: 32,
    justifyContent: 'center',
  },

  loginLabel: {
    fontSize: 15,
    fontWeight: '300',
    color: '#37474F',
    marginBottom: 6,
    marginLeft: 4,
  },

  loginInput: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    fontSize: 15,
    fontWeight: '300',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#37474F',
    marginBottom: 22,
  },

  loginButton: {
    width: '100%',
    backgroundColor: '#37474F',
    paddingVertical: 16,
    borderRadius: 60,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
    shadowColor: '#2258cd',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },

  loginButtonText: {
    color: '#fff',
    fontWeight: '300',
    fontSize: 15,
    letterSpacing: 0.5,
  },

  loginToggleText: {
    color: '#37474F',
    fontSize: 14,
    fontWeight: '300',
    textAlign: 'left',
    marginTop: 4,
  },

  // ── APP PRINCIPAL ──────────────────────────────
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  header: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },

  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#37474F',
    textAlign: 'center',
    letterSpacing: -1,
  },

  subtitle: {
    fontSize: 15,
    fontWeight: '300',
    color: '#7AB9C3',
    textAlign: 'center',
    marginTop: 6,
  },

  searchCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 4,
    shadowColor: '#37474F',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    marginBottom: 24,
  },

  searchLabel: {
    fontSize: 13,
    fontWeight: '300',
    color: '#37474F',
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.3,
  },

  input: {
    width: '100%',
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    fontSize: 28,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    textAlign: 'center',
    color: '#37474F',
    marginBottom: 16,
    letterSpacing: 4,
  },

  button: {
    width: '100%',
    backgroundColor: '#37474F',
    paddingVertical: 16,
    borderRadius: 60,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#37474F',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '300',
    fontSize: 15,
    letterSpacing: 0.5,
  },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 4,
  },

  btnLimparText: {
    color: '#7AB9C3',
    fontSize: 13,
    fontWeight: '300',
    textDecorationLine: 'underline',
  },

  btnSairText: {
    color: '#006064',
    fontSize: 13,
    fontWeight: '300',
    textDecorationLine: 'underline',
  },

  resultCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 4,
    shadowColor: '#37474F',
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },

  resultTitle: {
    fontSize: 13,
    fontWeight: '300',
    color: '#7AB9C3',
    letterSpacing: 0.5,
    marginBottom: 20,
  },

  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
  },

  row: {
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#7AB9C3',
  },

  rowInline: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  rowInlineItem: {
    flex: 1,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#7AB9C3',
  },

  rowInlineSeparator: {
    width: 16,
  },

  label: {
    fontSize: 11,
    color: '#7AB9C3',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },

  info: {
    fontSize: 17,
    fontWeight: '400',
    color: '#37474F',
  },
});