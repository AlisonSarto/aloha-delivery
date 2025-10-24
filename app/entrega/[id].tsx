import { Button, ScrollView, Text, View, XStack, YStack, Separator, Card, H2 } from 'tamagui';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import { MapPin, Package, Calendar, User } from '@tamagui/lucide-icons';

export default function EntregaPage() {
  const id = useLocalSearchParams().id;
  const [data, setData] = useState(null);
  const [endereco, setEndereco] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [entregaSalva, setEntregaSalva] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [emRota, setEmRota] = useState(false);

  useEffect(() => {
    verificarEntregaSalva();
    fetchData();
  }, []);

  const verificarEntregaSalva = async () => {
    try {
      const entregasSalvas = await AsyncStorage.getItem('entregas');
      const entregas = entregasSalvas ? JSON.parse(entregasSalvas) : [];
      setEntregaSalva(entregas.includes(id));
    } catch (error) {
      console.error('Erro ao verificar entrega:', error);
    }
  };

  const fetchData = async () => {
    try {
      const token = Constants.expoConfig?.extra?.TOKEN_GSC ?? null;
      const secret = Constants.expoConfig?.extra?.SECRET_GSC ?? null;

      if (!token || !secret) throw new Error('Token ou secret não configurados');

      const vendaResponse = await fetch(`https://api.beteltecnologia.com/vendas/${id}`, {
        method: 'GET',
        headers: { 'access-token': token, 'secret-access-token': secret },
      });
      const vendaData = await vendaResponse.json();

      const situacao = vendaData.data.situacao_id;

      if (situacao == 4737015) { // Em rota
        setEmRota(true);
      }else {
        setEmRota(false);
      }

      const cliente_id = vendaData.data.cliente_id;

      const clienteResponse = await fetch(`https://api.beteltecnologia.com/clientes/${cliente_id}`, {
        method: 'GET',
        headers: { 'access-token': token, 'secret-access-token': secret },
      });
      const clienteData = await clienteResponse.json();

      const enderecoObj = clienteData.data.enderecos[0].endereco;
      const enderecoInvalido = !enderecoObj.logradouro || !enderecoObj.numero || !enderecoObj.bairro || !enderecoObj.nome_cidade || !enderecoObj.estado || !enderecoObj.cep;
      var enderecoFormatado = enderecoInvalido ? '' : `${enderecoObj.logradouro}, ${enderecoObj.numero} - ${enderecoObj.bairro}, ${enderecoObj.nome_cidade} - ${enderecoObj.estado}, ${enderecoObj.cep}`;

      setData(vendaData.data);
      setLoading(false);
      setEndereco(enderecoFormatado);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const toggleEntrega = async () => {
    setLoadingBtn(true);

    if (emRota == false) {
      try {
        const entregasSalvas = await AsyncStorage.getItem('entregas');
        let entregas = entregasSalvas ? JSON.parse(entregasSalvas) : [];

        if (entregaSalva) {
          entregas = entregas.filter(entregaId => entregaId !== id);
          setEntregaSalva(false);
        } else {
          entregas.push(id);
          setEntregaSalva(true);
        }

        await AsyncStorage.setItem('entregas', JSON.stringify(entregas));
      } catch (error) {
        console.error('Erro ao alternar entrega:', error);
      }

    } else {
      try {
        const token = Constants.expoConfig?.extra?.TOKEN_GSC ?? null;
        const secret = Constants.expoConfig?.extra?.SECRET_GSC ?? null;
    
        try {
          const response = await fetch(`https://api.beteltecnologia.com/vendas/${id}`, {
            headers: { 'access-token': token, 'secret-access-token': secret },
          });
          const { data: vendaData } = await response.json();
          
          if (!vendaData) return;

          var data = {
            'tipo': 'produto',
            'codigo': vendaData.codigo,
            'cliente_id': vendaData.cliente_id,
            'situacao_id': 3395254, // Concluido
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

          let entregasJson = await AsyncStorage.getItem('entregas');
          let entregas = entregasJson ? JSON.parse(entregasJson) : [];
          entregas = entregas.filter(entregaId => entregaId !== id);
          await AsyncStorage.setItem('entregas', JSON.stringify(entregas));

          if (entregas.length == 0) {
            await AsyncStorage.setItem('modo', '1');
            router.push('/(tabs)');
          }else {
            router.push('/em-rota');
          }

        } catch (error) {
          console.error('Erro ao buscar dados:', error);
        }
    
      } catch (error) {
        console.error('Erro ao iniciar rotas:', error);
      }
    }

    setLoadingBtn(false);
  };

  return (
    <>
      <ScrollView bg="$background">
        <View flex={1} m="$5">
          {loading ? (
            <Animatable.View animation="pulse" iterationCount="infinite" duration={1500}>
              <Card bordered p="$5" backgroundColor="$background">
                <YStack space="$4">
                  <View backgroundColor="$gray4" height={30} borderRadius="$3" />
                  <View backgroundColor="$gray3" height={20} borderRadius="$3" width="60%" />
                  <View backgroundColor="$gray3" height={20} borderRadius="$3" width="80%" />
                </YStack>
              </Card>
            </Animatable.View>
          ) : (
            <Entrega pedido={data} endereco={endereco} />
          )}
        </View>
      </ScrollView>

      <Animatable.View animation="slideInUp" duration={600} delay={200}>
        <Button
          animation="bouncy"
          borderWidth={0}
          mx="$4"
          mb="$3"
          size="$6"
          backgroundColor={emRota ? "$blue9" : entregaSalva ? "$red9" : "$green9"}
          pressStyle={{ 
            backgroundColor: emRota ? "$blue10" : entregaSalva ? "$red10" : "$green10",
            scale: 0.98 
          }}
          hoverStyle={{
            backgroundColor: emRota ? "$blue8" : entregaSalva ? "$red8" : "$green8"
          }}
          onPress={toggleEntrega}
          disabled={loadingBtn}
          borderRadius="$10"
          elevate
          shadowOpacity={0.3}
          shadowRadius={10}
        >
          {loadingBtn ? (
            <Animatable.View animation="rotate" iterationCount="infinite" duration={1000}>
              <Text color="white">⏳</Text>
            </Animatable.View>
          ) : (
            <Button.Text fontSize="$7" fontWeight={700}>
              {emRota ? '✅ Finalizar entrega' : entregaSalva ? '❌ Remover entrega' : '➕ Adicionar entrega'}
            </Button.Text>
          )}
        </Button>
      </Animatable.View>
    </>
  );
}

const Entrega = ({ pedido, endereco }) => {
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const pacotes = pedido.produtos.map(pacote => {
    const produto = pacote.produto;
    return {
      nome: produto.nome_produto.replace('ALOHA GELO ', '').replace(' 28 un', ''),
      quantidade: produto.quantidade.replace('.00', ''),
    };
  });

  const qtd_total = pacotes.reduce((acc, pacote) => acc + parseInt(pacote.quantidade), 0);

  return (
    <Animatable.View animation="fadeIn" duration={600}>
      <YStack space="$5">
        {/* Cabeçalho com número do pedido */}
        <Animatable.View animation="bounceIn" duration={800} delay={100}>
          <Card 
            bordered 
            backgroundColor="$blue2" 
            borderColor="$blue6"
            p="$4"
            borderRadius="$6"
            elevate
          >
            <Text fontWeight={700} fontSize="$9" textAlign="center" color="$blue11">
              Pedido Nº {pedido.codigo}
            </Text>
          </Card>
        </Animatable.View>

        {/* Card de Informações do Cliente */}
        <Animatable.View animation="fadeInRight" duration={600} delay={200}>
          <Card bordered p="$4" backgroundColor="$background" borderRadius="$6" elevate>
            <YStack space="$3">
              <XStack alignItems="center" space="$2">
                <YStack backgroundColor="$green2" p="$2" borderRadius="$10">
                  <User size={24} color="$green10" />
                </YStack>
                <YStack flex={1}>
                  <Text fontSize="$5" fontWeight={600} color="$gray11">Cliente</Text>
                  <Text fontSize="$6" fontWeight={700}>{pedido.nome_cliente}</Text>
                </YStack>
              </XStack>
              
              <Separator />
              
              <XStack alignItems="center" space="$2">
                <YStack backgroundColor="$orange2" p="$2" borderRadius="$10">
                  <Calendar size={24} color="$orange10" />
                </YStack>
                <YStack flex={1}>
                  <Text fontSize="$5" fontWeight={600} color="$gray11">Data de Entrega</Text>
                  <Text fontSize="$6" fontWeight={700}>
                    {pedido.prazo_entrega ? formatDate(pedido.prazo_entrega) : 'Sem data'}
                  </Text>
                </YStack>
              </XStack>
            </YStack>
          </Card>
        </Animatable.View>

        {/* Card de Pacotes */}
        <Animatable.View animation="fadeInRight" duration={600} delay={300}>
          <Card bordered p="$4" backgroundColor="$background" borderRadius="$6" elevate>
            <YStack space="$3">
              <XStack alignItems="center" space="$2" mb="$2">
                <YStack backgroundColor="$purple2" p="$2" borderRadius="$10">
                  <Package size={24} color="$purple10" />
                </YStack>
                <Text fontSize="$8" fontWeight={700}>Pacotes</Text>
              </XStack>
              
              <YStack backgroundColor="$gray2" p="$3" borderRadius="$4">
                <XStack justifyContent="space-between" mb="$2">
                  <Text fontSize="$6" fontWeight={700} color="$gray11">Sabor</Text>
                  <Text fontSize="$6" fontWeight={700} color="$gray11">Qtd</Text>
                </XStack>
                
                {pacotes.map((pacote, index) => (
                  <Animatable.View 
                    key={index} 
                    animation="fadeIn" 
                    duration={400} 
                    delay={400 + index * 100}
                  >
                    <YStack>
                      <XStack justifyContent="space-between" py="$2">
                        <Text fontSize="$5" flex={1}>🧊 GELO DE {pacote.nome}</Text>
                        <Text fontSize="$6" fontWeight={600} color="$blue10">
                          {pacote.quantidade}x
                        </Text>
                      </XStack>
                      {index < pacotes.length - 1 && <Separator />}
                    </YStack>
                  </Animatable.View>
                ))}
                
                <Separator my="$3" borderColor="$gray8" />
                
                <XStack justifyContent="space-between">
                  <Text fontSize="$7" fontWeight={700}>Total:</Text>
                  <Text fontSize="$7" fontWeight={700} color="$blue10">
                    {qtd_total} pacotes
                  </Text>
                </XStack>
              </YStack>
            </YStack>
          </Card>
        </Animatable.View>

        {/* Card de Endereço */}
        <Animatable.View animation="fadeInRight" duration={600} delay={400}>
          <Card bordered p="$4" backgroundColor="$background" borderRadius="$6" elevate>
            <YStack space="$3">
              <XStack alignItems="center" space="$2">
                <YStack backgroundColor="$red2" p="$2" borderRadius="$10">
                  <MapPin size={24} color="$red10" />
                </YStack>
                <Text fontSize="$8" fontWeight={700}>Endereço</Text>
              </XStack>
              
              <YStack backgroundColor="$gray2" p="$3" borderRadius="$4">
                <Text fontSize="$5" lineHeight="$6">
                  {endereco || 'Endereço não disponível'}
                </Text>
              </YStack>
            </YStack>
          </Card>
        </Animatable.View>
      </YStack>
    </Animatable.View>
  );
};
