import { ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { useGetSubscriptionsQuery, type ApiError } from '../state/subscriptions.api';
import { getErrorMessage } from '../ui/subscription-error-messages';

// TEMPORARY: proves the whole chain works on a device (container → repository → Axios → API → RTK Query).
// Replaced by real screens in phase 4.
export function SubscriptionsCheckScreen() {
  const { data, isLoading, isFetching, error, refetch } = useGetSubscriptionsQuery();

  if (isLoading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  if (error) {
    const apiError = error as ApiError;
    return (
      <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
        <Text className="text-destructive font-bold">Error: {apiError.code}</Text>
        <Text className="text-foreground">{getErrorMessage(apiError)}</Text>
        <Pressable onPress={refetch}>
          <Text className="text-primary">Try again</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 8 }}>
      <Text className="text-foreground text-lg font-bold">
        {data?.length ?? 0} subscriptions {isFetching ? '(refreshing…)' : ''}
      </Text>
      {data?.map((s) => (
        <Text key={s.id} className="text-foreground">
          {s.name}: {s.price} / {s.billingCycle}
        </Text>
      ))}
      <Pressable onPress={refetch}>
        <Text className="text-primary">Refetch</Text>
      </Pressable>
    </ScrollView>
  );
}
