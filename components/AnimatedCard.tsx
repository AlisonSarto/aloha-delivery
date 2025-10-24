import React, { useRef } from 'react';
import * as Animatable from 'react-native-animatable';
import { Card, XStack, Paragraph, YStack } from 'tamagui';
import { CircleUser, ChevronRight } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';

interface AnimatedCardProps {
  id: number;
  cliente: string;
  codigo?: string;
  dataEntrega?: string;
  onPress: () => void;
  index: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  cliente, 
  codigo, 
  dataEntrega, 
  onPress, 
  index 
}) => {
  const cardRef = useRef<any>(null);

  const handlePress = () => {
    console.log('Card pressionado!');
    if (cardRef.current?.pulse) {
      cardRef.current.pulse(400);
    }
    // Chama o onPress imediatamente
    if (onPress) {
      onPress();
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Animatable.View
        animation="fadeInUp"
        duration={600}
        delay={index * 100}
        useNativeDriver
      >
        <Animatable.View ref={cardRef} useNativeDriver>
          <Card
            size="$4"
            bordered
            m="$3"
            my="$2"
            backgroundColor="$background"
            borderRadius="$6"
            elevate
            shadowColor="$shadowColor"
            shadowOpacity={0.1}
            shadowRadius={10}
            animation="quick"
            hoverStyle={{
              scale: 1.02,
              borderColor: '$blue8',
            }}
          >
            <Card.Header>
              <XStack alignItems="center" space="$3">
                <YStack
                  backgroundColor="$blue2"
                  borderRadius="$10"
                  padding="$2.5"
                  animation="quick"
                  hoverStyle={{
                    backgroundColor: '$blue3',
                  }}
                >
                  <CircleUser size={28} color="$blue10" />
                </YStack>
                
                <YStack flex={1}>
                  <Paragraph 
                    size="$6" 
                    fontWeight="700" 
                    color="$color"
                    numberOfLines={1}
                  >
                    {cliente}
                  </Paragraph>
                  
                  {codigo && (
                    <XStack space="$2" mt="$1.5">
                      <Paragraph size="$3" color="$gray10" fontWeight="600">
                        Nº {codigo}
                      </Paragraph>
                      {dataEntrega && (
                        <>
                          <Paragraph size="$3" color="$gray8">•</Paragraph>
                          <Paragraph size="$3" color="$gray10">
                            {dataEntrega}
                          </Paragraph>
                        </>
                      )}
                    </XStack>
                  )}
                </YStack>

                <YStack
                  backgroundColor="$blue2"
                  borderRadius="$10"
                  padding="$2"
                  animation="quick"
                >
                  <ChevronRight size={24} color="$blue10" />
                </YStack>
              </XStack>
            </Card.Header>
          </Card>
        </Animatable.View>
      </Animatable.View>
    </Pressable>
  );
};

export default AnimatedCard;
