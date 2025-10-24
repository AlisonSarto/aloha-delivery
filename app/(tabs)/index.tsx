import { Text, View, YStack, H3 } from 'tamagui';
import { router } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { RefreshControl } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import * as Animatable from 'react-native-animatable';
import AnimatedCard from '../../components/AnimatedCard';
import SkeletonCard from '../../components/SkeletonCard';

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
      <View flex={1} bg="$background" pt="$4">
        <YStack>
          {[...Array(5)].map((_, index) => (
            <SkeletonCard key={index} index={index} />
          ))}
        </YStack>
      </View>
    );
  }

  // Exibe erro caso haja algum problema
  if (error) {
    return (
      <View flex={1} bg="$background" justifyContent="center" alignItems="center" p="$4">
        <Animatable.View animation="shake" duration={500}>
          <Text style={{ textAlign: 'center', color: 'red', fontSize: 16 }}>{error}</Text>
        </Animatable.View>
      </View>
    );
  }

  return (
    <View flex={1} bg="$background">
      {entregas.length > 0 ? (
        <FlashList
          data={entregas}
          estimatedItemSize={100}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <AnimatedCard
              key={item.id}
              id={item.id}
              cliente={item.nome_cliente}
              codigo={item.codigo}
              dataEntrega={item.prazo_entrega ? formatDate(item.prazo_entrega) : undefined}
              onPress={() => router.push(`/entrega/${item.id}`)}
              index={index}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchEntregas} />
          }
        />
      ) : (
        <Animatable.View 
          animation="fadeIn" 
          duration={600}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <H3 textAlign="center" color="$gray10">Nenhuma entrega encontrada</H3>
        </Animatable.View>
      )}
    </View>
  );
}
