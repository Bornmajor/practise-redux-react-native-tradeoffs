import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { Priority } from '../types/task';

export type PriorityFilter = 'all' | Priority;

const PILLS: { value: PriorityFilter; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: '#3c87f7' },
  { value: 'high', label: 'High', color: '#f44336' },
  { value: 'medium', label: 'Medium', color: '#ff9800' },
  { value: 'low', label: 'Low', color: '#4caf50' },
];

interface PriorityPillsProps {
  selected: PriorityFilter;
  onSelect: (value: PriorityFilter) => void;
}

const PriorityPills = ({ selected, onSelect }: PriorityPillsProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}>
      {PILLS.map((pill) => {
        const isActive = pill.value === selected;
        return (
          <Pressable
            key={pill.value}
            onPress={() => onSelect(pill.value)}
            style={({ pressed }) => [
              styles.pill,
              { borderColor: pill.color },
              isActive && { backgroundColor: pill.color },
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.label, { color: isActive ? '#fff' : pill.color }]}>
              {pill.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

export default PriorityPills;

const styles = StyleSheet.create({
  scroll: {
    // Don't let the ScrollView grow to fill the screen's height
    flexGrow: 0,
  },
  row: {
    // Keep pills at their own height instead of stretching to the row's height
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  pill: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 17,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
    // Android adds extra top padding to text, which pushes it off-center
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.7,
  },
});
