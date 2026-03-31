import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ActivityIndicator, Keyboard, Alert, SafeAreaView, ScrollView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [endereco, setEndereco] = useState(null);

  // Carregar último CEP ao abrir o app
  useEffect(() => {
    async function carregarDados() {
      const CEPsalvo = await AsyncStorage.getItem('@ultimo_cep');
      if (CEPsalvo) setCep(CEPsalvo);
    }
    carregarDados();
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.header}>
          <Text style={styles.title}>📍 CepFlow</Text>
          <Text style={styles.subtitle}>Sua busca de endereço rápida</Text>
        </View>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="00000000"
            placeholderTextColor="#94a3b8"
            value={cep}
            onChangeText={(t) => setCep(t.replace(/\D/g, ''))}
            keyboardType="numeric"
            maxLength={8}
          />
          
          <TouchableOpacity style={styles.button} onPress={buscarCep} activeOpacity={0.8}>
            <Text style={styles.buttonText}>CONSULTAR AGORA</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnLimpar} onPress={limpar}>
            <Text style={styles.btnLimparText}>Limpar busca</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingArea}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Buscando informações...</Text>
          </View>
        )}

        {endereco && !loading && (
          <View style={styles.resultCard}>
            <View style={styles.row}>
              <Text style={styles.label}>LOGRADOURO</Text>
              <Text style={styles.info}>{endereco.logradouro || 'Geral/Não informado'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>BAIRRO</Text>
              <Text style={styles.info}>{endereco.bairro || 'Não informado'}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>CIDADE</Text>
              <Text style={styles.info}>{endereco.localidade}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>ESTADO (UF)</Text>
              <Text style={styles.info}>{endereco.uf}</Text>
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
    backgroundColor: '#f8fafc' 
  },
  scrollContainer: { 
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 30
  },
  header: {
    alignItems: 'center',
    marginBottom: 30
  },
  title: { 
    fontSize: 36, 
    fontWeight: '900', 
    color: '#2563eb',
    letterSpacing: -1
  },
  subtitle: { 
    fontSize: 16, 
    color: '#64748b',
    fontWeight: '500'
  },
  inputArea: { 
    width: '100%', 
    maxWidth: 400,
    gap: 12 
  },
  input: {
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 18, 
    fontSize: 24,
    fontWeight: 'bold',
    borderWidth: 2, 
    borderColor: '#e2e8f0', 
    textAlign: 'center', 
    color: '#1e293b',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  button: { 
    backgroundColor: '#2563eb', 
    padding: 20, 
    borderRadius: 18, 
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowRadius: 12
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16,
    letterSpacing: 1
  },
  btnLimpar: { 
    alignItems: 'center', 
    marginTop: 5 
  },
  btnLimparText: { 
    color: '#94a3b8', 
    fontSize: 14,
    textDecorationLine: 'underline' 
  },
  loadingArea: { 
    marginTop: 40, 
    alignItems: 'center' 
  },
  loadingText: {
    marginTop: 10,
    color: '#2563eb',
    fontWeight: '500'
  },
  resultCard: {
    marginTop: 40, 
    width: '100%', 
    maxWidth: 400,
    backgroundColor: '#fff', 
    borderRadius: 24,
    padding: 25, 
    elevation: 10, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  row: { 
    marginBottom: 18, 
    borderLeftWidth: 3, 
    borderLeftColor: '#2563eb', 
    paddingLeft: 12 
  },
  label: { 
    fontSize: 11, 
    color: '#94a3b8', 
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2
  },
  info: { 
    fontSize: 18, 
    color: '#1e293b', 
    fontWeight: '600' 
  }
});