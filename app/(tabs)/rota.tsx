import { 
  Text, View, YStack, H3, Button 
} from 'tamagui';
import { useRouter } from 'expo-router';
import { Linking, RefreshControl } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import * as Animatable from 'react-native-animatable';
import AnimatedCard from '../../components/AnimatedCard';
import SkeletonCard from '../../components/SkeletonCard';

// Função utilitária para verificar se uma data é igual à de hoje
const isSameDay = (dateString: string) => {
  const today = new Date();
  const [year, month, day] = dateString.split('-');
  const deliveryDate = new Date(Number(year), Number(month) - 1, Number(day));
  return today.toDateString() === deliveryDate.toDateString();
};

// Função para iniciar as rotas no Google Maps
const iniciarRotas = async () => {
  try {
    const token = Constants.expoConfig?.extra?.TOKEN_GSC ?? null;
    const secret = Constants.expoConfig?.extra?.SECRET_GSC ?? null;

    const storedIds = await AsyncStorage.getItem('entregas');
    const storedIdsArray = storedIds ? JSON.parse(storedIds) : [];

    let rota = ['R. Canadense, 414 - Vila Flora, Guarulhos - SP'];

    const promises = storedIdsArray.map(async (id: number) => {
      try {
        const response = await fetch(`https://api.beteltecnologia.com/vendas/${id}`, {
          headers: { 'access-token': token, 'secret-access-token': secret },
        });
        const { data: vendaData } = await response.json();
        
        if (!vendaData) return;

        const clienteResponse = await fetch(`https://api.beteltecnologia.com/clientes/${vendaData.cliente_id}`, {
          headers: { 'access-token': token, 'secret-access-token': secret },
        });
        const { data: clienteData } = await clienteResponse.json();

        const endereco = clienteData?.enderecos?.[0]?.endereco;
        if (endereco?.logradouro && endereco?.numero && endereco?.bairro && endereco?.nome_cidade && endereco?.estado && endereco?.cep) {
          const enderecoFormatado = `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}, ${endereco.nome_cidade} - ${endereco.estado}, ${endereco.cep}`;
          rota.push(enderecoFormatado);
        }

        var data = {
          'tipo': 'produto',
          'codigo': vendaData.codigo,
          'cliente_id': vendaData.cliente_id,
          'situacao_id': 4737015, // Em rota
          'data': vendaData.data,
          'condicao_pagamento': vendaData.condicao_pagamento,
          'valor_frete': vendaData.valor_frete,
          'valor_total': vendaData.valor_total,
          "pagamentos": vendaData.pagamentos,
          'produtos': vendaData.produtos,
        }

        const atualizacaoEntrega = await fetch(`https://api.beteltecnologia.com/vendas/${id}`, {
          method: 'PUT',
          headers: { 'access-token': token, 'secret-access-token': secret },
          body: JSON.stringify(data),
        });
        const atualizacaoResponse = await atualizacaoEntrega.json();

        await AsyncStorage.setItem('modo', '2');

      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    });

    await Promise.all(promises);
    Linking.openURL(`https://www.google.com/maps/dir/${rota.join('/')}`).catch(console.error);
    router.push('/em-rota');

  } catch (error) {
    console.error('Erro ao iniciar rotas:', error);
  }
};

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
        <YStack>
          {[...Array(4)].map((_, index) => (
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
      {entregas.length > 0 && (
        <Animatable.View animation="bounceIn" duration={800} delay={300}>
          <Button 
            animation="bouncy" 
            mx="$4" 
            mb="$3" 
            size="$6" 
            backgroundColor="$blue9" 
            pressStyle={{ 
              backgroundColor: '$blue10',
              scale: 0.98 
            }}
            hoverStyle={{
              backgroundColor: '$blue8'
            }}
            onPress={iniciarRotas}
            borderRadius="$10"
            elevate
            shadowColor="$blue9"
            shadowOpacity={0.3}
            shadowRadius={10}
          >
            <Button.Text fontSize="$7" fontWeight={700}>
              🚀 Iniciar rotas
            </Button.Text>
          </Button>
        </Animatable.View>
      )}
    </>
  );
}
