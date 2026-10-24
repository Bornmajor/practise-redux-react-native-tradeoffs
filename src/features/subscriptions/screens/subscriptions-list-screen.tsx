import { ActivityIndicator, FlatList, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ErrorState } from '../components/error-state';
import { SubscriptionCard } from '../components/subscription-card';
import { useGetSubscriptionsQuery, type ApiError } from '../state/subscriptions.api';

export function SubscriptionsListScreen() {
  const { data, isLoading, isFetching, error, refetch } = useGetSubscriptionsQuery();

  return (
    <View className="flex-1 bg-background">
      {/* Header buttons: "Lab" (long-list practice) on the left, "Add" on the right */}
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Button size="sm" variant="ghost" onPress={() => router.push('/list-lab')}>
              <ButtonText>Lab</ButtonText>
            </Button>
          ),
          headerRight: () => (
            <Button size="sm" variant="ghost" onPress={() => router.push('/subscriptions/new')}>
              <ButtonText>Add</ButtonText>
            </Button>
          ),
        }}
      />

      {isLoading ? (
        // First load only: no data yet
        <ActivityIndicator className="mt-10" />
      ) : error && !data ? (
        // Failed and nothing cached to show
        <ErrorState error={error as ApiError} onRetry={refetch} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 p-4"
          renderItem={({ item }) => (
            <SubscriptionCard
              subscription={item}
              onPress={(id) => router.push(`/subscriptions/${id}`)}
            />
          )}
          // Pull down to refresh; spinner only for refetches, not the first load
          refreshing={isFetching && !isLoading}
          onRefresh={refetch}
          ListEmptyComponent={
            <View className="items-center gap-2 p-10">
              <Text className="text-base text-foreground">No subscriptions yet.</Text>
              <Text className="text-sm text-muted-foreground">Tap Add to create your first one.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
