import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { SubscriptionForm } from '../components/subscription-form';
import type { SubscriptionInput } from '../domain/subscription';
import { useCreateSubscriptionMutation, type ApiError } from '../state/subscriptions.api';
import { getErrorMessage } from '../ui/subscription-error-messages';

export function SubscriptionCreateScreen() {
  const [createSubscription, { isLoading }] = useCreateSubscriptionMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (input: SubscriptionInput) => {
    setSubmitError(null);
    try {
      // unwrap(): returns the result on success, THROWS the ApiError on failure
      await createSubscription(input).unwrap();
      router.back(); // the list refetches by itself (the LIST tag was invalidated)
    } catch (error) {
      setSubmitError(getErrorMessage(error as ApiError));
    }
  };

  return (
    <View className="flex-1 bg-background">
      <SubscriptionForm
        submitLabel="Create"
        isSubmitting={isLoading}
        submitError={submitError}
        onSubmit={handleSubmit}
      />
    </View>
  );
}
