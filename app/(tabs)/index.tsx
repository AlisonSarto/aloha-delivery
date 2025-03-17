import { Text, View, ScrollView, Card, YStack, H3, Paragraph, XStack, Button, Separator } from 'tamagui';
import { ChevronRight, CircleUser } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

// Função para formatar as datas
const formatDate = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

const isSameDay = (dateString) => {
  const today = new Date();
  const [year, month, day] = dateString.split('-');
  const deliveryDate = new Date(year, month - 1, day);
  return today.toDateString() >= deliveryDate.toDateString();
};

const CardEntrega = ({ id, cliente, codigo, dataEntrega }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/entrega/${id}`);
  };

  return (
    <Card
      size="$4"
      bordered
      m="$3"
      my="$2"
      flex={1}
      pressStyle={{ scale: 0.95 }}
      onPress={handlePress}
    >
      <Card.Header>
        <XStack>
          <CircleUser size={28} marginEnd="$2" />
          <Paragraph size="$5" fontWeight="bold" flex={1}>
            {cliente}
          </Paragraph>
          <ChevronRight />
        </XStack>

        <Separator my={15} />

        <XStack>
          <Paragraph size="$4" flex={1}>
            Nº Pedido: {codigo}
          </Paragraph>
          <Paragraph size="$4">
            Entrega: {dataEntrega ? formatDate(dataEntrega) : 'Sem data'}
          </Paragraph>
        </XStack>
      </Card.Header>
    </Card>
  );
};

const verifMode = async () => {
  var mode = await AsyncStorage.getItem('modo') ?? '1';
  if (mode === '2') {
    router.push('/em-rota');
  }
}

export default function Entregas() {

  verifMode();

  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const token = Constants.expoConfig?.extra?.TOKEN_GSC ?? null;
  const secret = Constants.expoConfig?.extra?.SECRET_GSC ?? null;

  useFocusEffect(
    useCallback(() => {
      fetchEntregas(); // Função que busca as entregas novamente
    }, [])
  );
  

  // Função para buscar entregas
  const fetchEntregas = useCallback(async () => {
    if (!token || !secret) {
      setError('Token ou secret não configurados');
      setLoading(false);
      return;
    }

    setRefreshing(true); // Mostra a animação de carregamento
    setError('');

    try {
      const url = new URL('https://api.beteltecnologia.com/vendas');
      url.searchParams.append('situacao_id[]', '4629853'); // Preparando envio

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'access-token': token,
          'secret-access-token': secret,
        },
      });

      const result = await response.json();

      // let filteredEntregas = result.data.filter(entrega => isSameDay(entrega.prazo_entrega));
      let filteredEntregas = result.data;

      // Filtra entregas que já estão armazenadas
      const storedIds = await AsyncStorage.getItem('entregas');
      const storedIdsArray = storedIds ? JSON.parse(storedIds) : [];

      filteredEntregas = filteredEntregas.filter(entrega => !storedIdsArray.includes(entrega.id));

      setEntregas(filteredEntregas);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, secret]);

  useEffect(() => {
    fetchEntregas();
  }, [fetchEntregas]);

  // Exibe carregamento inicial
  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" bg="$background">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Exibe erro caso haja algum problema
  if (error) {
    return (
      <View flex={1} bg="$background" justifyContent="center" alignItems="center">
        <Text style={{ textAlign: 'center', color: 'red' }}>{error}</Text>
        <Button onPress={fetchEntregas}>Tentar Novamente</Button>
      </View>
    );
  }

  return (
    <ScrollView
      flex={1}
      bg="$background"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchEntregas} />}
    >
      <YStack flex={1}>
        {entregas.length > 0 ? (
          entregas.map((entrega: any) => (
            <CardEntrega
              key={entrega.id}
              id={entrega.id}
              cliente={entrega.nome_cliente}
              codigo={entrega.codigo}
              dataEntrega={entrega.prazo_entrega}
            />
          ))
        ) : (
          <View flex={1} justifyContent="center" alignItems="center">
            <H3 textAlign="center">Nenhuma entrega encontrada</H3>
          </View>
        )}
      </YStack>
    </ScrollView>
  );
}
