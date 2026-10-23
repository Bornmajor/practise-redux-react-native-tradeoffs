import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { BILLING_CYCLES, type BillingCycle, type SubscriptionInput } from '../domain/subscription';

type Props = {
  initialValues?: SubscriptionInput; // edit: pre-filled; create: empty
  submitLabel: string; // "Create" or "Save"
  isSubmitting: boolean; // show a spinner and block double taps
  submitError?: string | null; // message from the server, shown under the form
  onSubmit: (input: SubscriptionInput) => void;
};

type Fields = {
  name: string;
  price: string;
  billingCycle: BillingCycle;
  nextPaymentDate: string;
  category: string;
};
type FieldErrors = Partial<Record<keyof Fields, string>>;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Checks the form; returns one message per invalid field (empty object = valid)
function validate(fields: Fields): FieldErrors {
  const errors: FieldErrors = {};
  const price = Number(fields.price.replace(',', '.'));

  if (!fields.name.trim()) errors.name = 'Name is required.';
  if (!Number.isFinite(price) || price < 0.01) errors.price = 'Price must be greater than zero.';
  if (
    !DATE_PATTERN.test(fields.nextPaymentDate) ||
    Number.isNaN(new Date(fields.nextPaymentDate).getTime())
  ) {
    errors.nextPaymentDate = 'Use the format YYYY-MM-DD.';
  }
  if (!fields.category.trim()) errors.category = 'Category is required.';
  return errors;
}

export function SubscriptionForm({
  initialValues,
  submitLabel,
  isSubmitting,
  submitError,
  onSubmit,
}: Props) {
  // Form fields are text while typing; converted to numbers only on submit
  const [fields, setFields] = useState<Fields>({
    name: initialValues?.name ?? '',
    price: initialValues ? String(initialValues.price) : '',
    billingCycle: initialValues?.billingCycle ?? 'monthly',
    nextPaymentDate: initialValues?.nextPaymentDate ?? '',
    category: initialValues?.category ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const setField = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined })); // clear that field's error while typing
  };

  const handleSubmit = () => {
    const found = validate(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) return; // stop: show field errors, don't call the API

    onSubmit({
      name: fields.name.trim(),
      price: Number(fields.price.replace(',', '.')),
      billingCycle: fields.billingCycle,
      nextPaymentDate: fields.nextPaymentDate,
      category: fields.category.trim(),
    });
  };

  const inputClass =
    'rounded-md border border-border bg-background px-3 py-2 text-base text-foreground';

  return (
    <ScrollView contentContainerClassName="gap-4 p-4" keyboardShouldPersistTaps="handled">
      <Field label="Name" error={errors.name}>
        <TextInput
          className={inputClass}
          value={fields.name}
          onChangeText={(v) => setField('name', v)}
          placeholder="Netflix"
        />
      </Field>

      <Field label="Price" error={errors.price}>
        <TextInput
          className={inputClass}
          value={fields.price}
          onChangeText={(v) => setField('price', v)}
          placeholder="15.49"
          keyboardType="decimal-pad"
        />
      </Field>

      <Field label="Billing cycle">
        <View className="flex-row flex-wrap gap-2">
          {BILLING_CYCLES.map((cycle) => {
            const selected = fields.billingCycle === cycle;
            return (
              <Pressable
                key={cycle}
                onPress={() => setField('billingCycle', cycle)}
                className={`rounded-full border px-4 py-2 ${selected ? 'border-primary bg-primary' : 'border-border'}`}
              >
                <Text className={selected ? 'text-primary-foreground' : 'text-foreground'}>
                  {cycle}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Field>

      <Field label="Next payment date" error={errors.nextPaymentDate}>
        <TextInput
          className={inputClass}
          value={fields.nextPaymentDate}
          onChangeText={(v) => setField('nextPaymentDate', v)}
          placeholder="2026-11-01"
          autoCapitalize="none"
        />
      </Field>

      <Field label="Category" error={errors.category}>
        <TextInput
          className={inputClass}
          value={fields.category}
          onChangeText={(v) => setField('category', v)}
          placeholder="entertainment"
          autoCapitalize="none"
        />
      </Field>

      {submitError && <Text className="text-destructive">{submitError}</Text>}

      <Button onPress={handleSubmit} isDisabled={isSubmitting}>
        {isSubmitting && <ButtonSpinner />}
        <ButtonText>{submitLabel}</ButtonText>
      </Button>
    </ScrollView>
  );
}

// Label + input + error message under it
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-foreground">{label}</Text>
      {children}
      {error && <Text className="text-sm text-destructive">{error}</Text>}
    </View>
  );
}
