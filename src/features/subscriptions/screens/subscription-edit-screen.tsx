import { useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Button, ButtonText } from '@/components/ui/button';
import { ErrorState } from '../components/error-state';
import { SubscriptionForm } from '../components/subscription-form';
import type { SubscriptionInput } from '../domain/subscription';
import {
  useDeleteSubscriptionMutation,
  useGetSubscriptionQuery,
  useUpdateSubscriptionMutation,
  type ApiError,
} from '../state/subscriptions.api';
import { getErrorMessage } from '../ui/subscription-error-messages';
import { toDateInput } from '../utils/format';

export function SubscriptionEditScreen() {
  // The [id] part of the URL
  const { id } = useLocalSearchParams<{ id: string }>();

  // Set when deleting starts, so this screen stops fetching an item that's about to be gone
  const [isDeleting, setIsDeleting] = useState(false);
  const { data, isLoading, error, refetch } = useGetSubscriptionQuery(id, { skip: isDeleting });

  const [updateSubscription, { isLoading: isSaving }] = useUpdateSubscriptionMutation();
  const [deleteSubscription] = useDeleteSubscriptionMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSave = async (input: SubscriptionInput) => {
    setSubmitError(null);
    try {
      await updateSubscription({ id, changes: input }).unwrap();
      router.back();
    } catch (e) {
      setSubmitError(getErrorMessage(e as ApiError));
    }
  };

  const confirmDelete = () => {
    Alert.alert('Delete subscription?', `"${data?.name}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await deleteSubscription(id).unwrap();
            router.back();
          } catch (e) {
            setIsDeleting(false);
            Alert.alert('Could not delete', getErrorMessage(e as ApiError));
          }
        },
      },
    ]);
  };

  if (isLoading || isDeleting) return <ActivityIndicator className="mt-10" />;
  if (error || !data) {
    return <ErrorState error={(error as ApiError) ?? { code: 'UNKNOWN' }} onRetry={refetch} />;
  }

  return (
    <View className="flex-1 bg-background">
      {/* "Delete" button in this screen's header */}
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button size="sm" variant="ghost" onPress={confirmDelete}>
              <ButtonText className="text-destructive">Delete</ButtonText>
            </Button>
          ),
        }}
      />
      <SubscriptionForm
        initialValues={{
          name: data.name,
          price: data.price,
          billingCycle: data.billingCycle,
          nextPaymentDate: toDateInput(data.nextPaymentDate),
          category: data.category,
        }}
        submitLabel="Save"
        isSubmitting={isSaving}
        submitError={submitError}
        onSubmit={handleSave}
      />
    </View>
  );
}
