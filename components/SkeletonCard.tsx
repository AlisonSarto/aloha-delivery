import React, { useEffect } from 'react';
import * as Animatable from 'react-native-animatable';
import { Card, XStack, YStack } from 'tamagui';
import { LinearGradient } from 'tamagui/linear-gradient';

const SkeletonCard: React.FC<{ index: number }> = ({ index }) => {
  return (
    <Animatable.View
      animation="fadeIn"
      duration={400}
      delay={index * 80}
      useNativeDriver
    >
      <Card
        size="$4"
        bordered
        m="$3"
        my="$2"
        backgroundColor="$background"
        borderRadius="$6"
      >
        <Card.Header>
          <XStack alignItems="center" space="$3">
            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              duration={1500}
              useNativeDriver
            >
              <YStack
                backgroundColor="$gray4"
                borderRadius="$10"
                width={50}
                height={50}
              />
            </Animatable.View>
            
            <YStack flex={1} space="$2">
              <Animatable.View
                animation="pulse"
                iterationCount="infinite"
                duration={1500}
                delay={100}
                useNativeDriver
              >
                <YStack
                  backgroundColor="$gray4"
                  borderRadius="$3"
                  height={20}
                  width="70%"
                />
              </Animatable.View>
              
              <Animatable.View
                animation="pulse"
                iterationCount="infinite"
                duration={1500}
                delay={200}
                useNativeDriver
              >
                <YStack
                  backgroundColor="$gray3"
                  borderRadius="$3"
                  height={16}
                  width="50%"
                />
              </Animatable.View>
            </YStack>

            <Animatable.View
              animation="pulse"
              iterationCount="infinite"
              duration={1500}
              delay={150}
              useNativeDriver
            >
              <YStack
                backgroundColor="$gray4"
                borderRadius="$10"
                width={40}
                height={40}
              />
            </Animatable.View>
          </XStack>
        </Card.Header>
      </Card>
    </Animatable.View>
  );
};

export default SkeletonCard;
