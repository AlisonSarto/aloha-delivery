import { 
  Text, View, ScrollView, Card, YStack, H3, Paragraph, XStack, Button, Separator, 
  H2
} from 'tamagui';
import { ChevronRight, CircleUser } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import { Linking } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

// Componente de cada cartão de entrega
const CardEntrega = ({ id, cliente }: { id: number, cliente: string }) => {
  const router = useRouter();

  return (
    <Card size="$4" bordered m="$3" my="$2" flex={1} pressStyle={{ scale: 0.95 }} onPress={() => router.push(`/entrega/${id}`)}>
      <Card.Header>
        <XStack>
          <CircleUser size={28} marginEnd="$2" />
          <Paragraph size="$5" fontWeight="bold" flex={1}>{cliente}</Paragraph>
          <ChevronRight />
        </XStack>
      </Card.Header>
    </Card>
  );
};

const finishEntregas = async () => {
  var modo = await AsyncStorage.getItem('modo') ?? '1'

  if (modo == '2') {
    await AsyncStorage.setItem('entregas', '[]');
    await AsyncStorage.setItem('modo', '1');
    router.push('/(tabs)');
    console.log('Entregas finalizadas');
  }
}

export default function Entregas() {
  const [entregas, setEntregas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const token = Constants.expoConfig?.extra?.TOKEN_GSC ?? null;
  const secret = Constants.expoConfig?.extra?.SECRET_GSC ?? null;

  const fetchEntregas = async () => {
    setLoading(true);
    setRefreshing(true);
    setError('');

    if (!token || !secret) {
      setError('Token ou secret não configurados.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const response = await fetch('https://api.beteltecnologia.com/vendas', {
        headers: { 'access-token': token, 'secret-access-token': secret },
      });

      const { data } = await response.json();
      const storedIds = await AsyncStorage.getItem('entregas');
      const storedIdsArray = storedIds ? JSON.parse(storedIds) : [];

      const entregasFiltradas = data.filter((entrega: any) => storedIdsArray.includes(entrega.id));

      setEntregas(entregasFiltradas);
      
    } catch (error) {
      setError('Erro ao buscar entregas. Verifique sua conexão.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEntregas();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await fetchEntregas();
      };
  
      fetchData();
    }, [])
  );

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" bg="$background">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" bg="$background">
        <Text color="red">{error}</Text>
        <Button onPress={fetchEntregas}>Tentar Novamente</Button>
      </View>
    );
  }

  return (
    <>
      <H3 textAlign="center" mt="$3" mb="$2">Em rota</H3>
      <ScrollView flex={1} bg="$background" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchEntregas} />}>
        <YStack flex={1}>
          {entregas.length > 0 ? (
            entregas.map((entrega) => (
              <CardEntrega key={entrega.id} id={entrega.id} cliente={entrega.nome_cliente} />
            ))
          ) : (
            <View flex={1} justifyContent="center" alignItems="center">
              <H3 textAlign="center">Nenhuma entrega encontrada</H3>
            </View>
          )}
        </YStack>
      </ScrollView>
    </>
  );
}
