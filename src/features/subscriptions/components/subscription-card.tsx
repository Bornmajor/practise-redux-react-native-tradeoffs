import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import type { Subscription } from '../domain/subscription';
import { formatDate, formatPrice } from '../utils/format';

type Props = {
  subscription: Subscription;
  onPress: (id: string) => void;
};

// One row: name + category on the left, price + next payment on the right
export function SubscriptionCard({ subscription, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(subscription.id)}
      className="flex-row items-center justify-between rounded-lg border border-border bg-card p-4 active:opacity-70"
    >
      <View className="flex-1 gap-1">
        <Text className="text-base font-semibold text-foreground">{subscription.name}</Text>
        <Text className="text-sm text-muted-foreground">{subscription.category}</Text>
      </View>
      <View className="items-end gap-1">
        <Text className="text-base font-semibold text-foreground">
          {formatPrice(subscription.price)} / {subscription.billingCycle}
        </Text>
        <Text className="text-sm text-muted-foreground">
          Next: {formatDate(subscription.nextPaymentDate)}
        </Text>
      </View>
    </Pressable>
  );
}
