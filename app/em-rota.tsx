import { 
  Text, View, YStack, H2, Button, H3 
} from 'tamagui';
import { useRouter } from 'expo-router';
import { RefreshControl } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import * as Animatable from 'react-native-animatable';
import AnimatedCard from '../components/AnimatedCard';
import SkeletonCard from '../components/SkeletonCard';

// Componente de cada cartão de entrega
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
      <View flex={1} bg="$background" pt="$4">
        <Animatable.View animation="fadeIn" duration={400}>
          <H2 textAlign="center" mt="$3" mb="$4" color="$blue10">🚚 Em Rota</H2>
        </Animatable.View>
        <YStack>
          {[...Array(3)].map((_, index) => (
            <SkeletonCard key={index} index={index} />
          ))}
        </YStack>
      </View>
    );
  }

  if (error) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" bg="$background" p="$4">
        <Animatable.View animation="shake" duration={500}>
          <Text color="red" textAlign="center" fontSize={16}>{error}</Text>
        </Animatable.View>
      </View>
    );
  }

  return (
    <>
      <Animatable.View animation="slideInDown" duration={600}>
        <View bg="$blue2" py="$3" borderBottomWidth={2} borderBottomColor="$blue6">
          <H2 textAlign="center" color="$blue11">🚚 Em Rota</H2>
          {entregas.length > 0 && (
            <Text textAlign="center" fontSize="$5" color="$blue10" mt="$1">
              {entregas.length} {entregas.length === 1 ? 'entrega' : 'entregas'} pendente{entregas.length === 1 ? '' : 's'}
            </Text>
          )}
          <View px="$4" mt="$3">
            <Button 
              size="$3" 
              backgroundColor="$red9"
              pressStyle={{ backgroundColor: '$red10', scale: 0.98 }}
              onPress={finishEntregas}
              borderRadius="$8"
            >
              <Button.Text fontWeight={600}>❌ Sair do modo em rotas</Button.Text>
            </Button>
          </View>
        </View>
      </Animatable.View>

      <View flex={1} bg="$background">
        {entregas.length > 0 ? (
          <FlashList
            data={entregas}
            estimatedItemSize={100}
            renderItem={({ item, index }) => (
              <AnimatedCard
                key={item.id}
                id={item.id}
                cliente={item.nome_cliente}
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
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
          >
            <Text fontSize={60} mb="$4">✅</Text>
            <H3 textAlign="center" color="$gray10" mb="$2">
              Todas as entregas foram finalizadas!
            </H3>
            <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
              <Button 
                size="$5" 
                backgroundColor="$green9"
                pressStyle={{ backgroundColor: '$green10', scale: 0.98 }}
                onPress={finishEntregas}
                mt="$4"
                borderRadius="$10"
              >
                <Button.Text fontWeight={700}>🏠 Voltar ao início</Button.Text>
              </Button>
            </Animatable.View>
          </Animatable.View>
        )}
      </View>
    </>
  );
}
