import { Button, ScrollView, Text, View, XStack, YStack, Separator } from 'tamagui';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      <ScrollView>
        <View flex={1} m="$5">
          {loading ? <ActivityIndicator size="large" color="#0000ff" /> : <Entrega pedido={data} endereco={endereco} />}
        </View>
      </ScrollView>

      <Button
        animation="bouncy"
        borderWidth={0}
        borderColor="blue"
        mx="$4"
        mb="$3"
        size="$6"
        backgroundColor={emRota ? "$blue8" : entregaSalva ? "$red8" : "$green8"}
        pressStyle={{ backgroundColor: emRota ? "$blue9" : entregaSalva ? "$red9" : "$green9" }}
        onPress={toggleEntrega}
        disabled={loadingBtn}
      >
        {loadingBtn ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Button.Text fontSize="$7" fontWeight={700}>
            {emRota ? 'Finalizar entrega' : entregaSalva ? 'Remover entrega' : 'Adicionar entrega'}
          </Button.Text>
        )}
      </Button>
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
    <>
      <Text fontWeight={700} fontSize="$9" textAlign="center">Nº {pedido.codigo}</Text>
      <View my="$4" />
      <XStack>
        <Text fontSize="$7" fontWeight={700}>Cliente:</Text>
        <Text fontSize="$7" marginStart="$2">{pedido.nome_cliente}</Text>
      </XStack>
      <View my='$1' />
      <XStack>
        <Text fontSize="$7" fontWeight={700}>Data de entrega:</Text>
        <Text fontSize="$7" marginStart="$2">{pedido.prazo_entrega ? formatDate(pedido.prazo_entrega) : 'Sem data'}</Text>
      </XStack>

      <View my="$3" />
      <Text fontSize={30} fontWeight={700}>Pacotes</Text>
      <YStack my="$4">
        <XStack justifyContent="space-between">
          <Text fontSize="$7" fontWeight={700}>Sabor</Text>
          <Text fontSize="$7" fontWeight={700}>Quantidade</Text>
        </XStack>
        <Separator my="$2" />
        {pacotes.map((pacote, index) => (
          <React.Fragment key={index}>
            <XStack justifyContent="space-between">
              <Text fontSize="$6">GELO DE {pacote.nome}</Text>
              <Text fontSize="$7">{pacote.quantidade}</Text>
            </XStack>
            <Separator my="$2" key={`separator-${index}`} />
          </React.Fragment>
        ))}
        <XStack justifyContent="space-between">
          <Text fontSize="$6" fontWeight={700}>Total:</Text>
          <Text fontSize="$7" fontWeight={700}>{qtd_total}</Text>
        </XStack>
        <Separator my="$2" />
      </YStack>

      <View my="$1" />
      <Text fontSize={30} fontWeight={700}>Endereço</Text>
      <View my="$3" />
      <Text fontSize="$6">{endereco}</Text>
    </>
  );
};
