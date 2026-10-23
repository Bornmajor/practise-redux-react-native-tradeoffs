import { View } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { ApiError } from '../state/subscriptions.api';
import { getErrorMessage, retryableCodes } from '../ui/subscription-error-messages';

type Props = {
  error: ApiError;
  onRetry?: () => void;
};

// Full-screen error: a clear message, plus "Try again" only when retrying can help
export function ErrorState({ error, onRetry }: Props) {
  const canRetry = onRetry && retryableCodes.includes(error.code);

  return (
    <View className="flex-1 items-center justify-center gap-4 p-6">
      <Text className="text-center text-base text-foreground">{getErrorMessage(error)}</Text>
      {canRetry && (
        <Button variant="outline" onPress={onRetry}>
          <ButtonText>Try again</ButtonText>
        </Button>
      )}
    </View>
  );
}
