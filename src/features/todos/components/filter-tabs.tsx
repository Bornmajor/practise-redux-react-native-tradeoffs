// React Native building blocks
import { Pressable, StyleSheet, Text, View } from 'react-native';
// The filter type, so props and tab values are typed
import type { TodoFilter } from '../types';

// The tabs to show, in order; value is what gets dispatched, label is what the user sees
const TABS: { value: TodoFilter; label: string }[] = [
  { value: 'all', label: 'All' },               // every todo
  { value: 'pending', label: 'Pending' },       // only pending
  { value: 'completed', label: 'Completed' },   // only completed
];

// The props this component expects
interface FilterTabsProps {
  selected: TodoFilter;                      // which tab is active
  onChange: (filter: TodoFilter) => void;    // called when a tab is tapped
}

// Presentational component: shows tabs and reports taps; knows nothing about Redux
const FilterTabs = ({ selected, onChange }: FilterTabsProps) => {
  // Return the row of tabs
  return (
    // Grey "track" holding the three tabs
    <View style={styles.container}>
      {/* Draw one tab per entry in TABS */}
      {TABS.map((tab) => {
        // True if this tab is the selected one
        const isActive = tab.value === selected;
        // Return this tab's UI
        return (
          // Each tab is tappable; key helps React track list items
          <Pressable
            key={tab.value}
            style={[styles.tab, isActive && styles.tabActive]}  // white background when active
            onPress={() => onChange(tab.value)}                  // report which tab was tapped
          >
            {/* Tab label; bold and dark when active */}
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

// Export so the screen can use it
export default FilterTabs;

// Styles for the tabs
const styles = StyleSheet.create({
  // The grey track behind the tabs
  container: {
    flexDirection: 'row',       // tabs side by side
    backgroundColor: '#ececec', // light grey
    borderRadius: 10,           // rounded track
    padding: 4,                 // gap between track edge and tabs
  },
  // One tab
  tab: {
    flex: 1,                    // all tabs share the width equally
    height: 34,                 // fixed height so all tabs match
    borderRadius: 8,            // rounded tab
    alignItems: 'center',       // center label horizontally
    justifyContent: 'center',   // center label vertically
  },
  // Selected tab: white "pill" on the grey track
  tabActive: {
    backgroundColor: '#fff',
  },
  // Tab label
  label: {
    fontSize: 14,
    color: '#666',              // grey when not selected
    fontWeight: '500',
  },
  // Selected tab label
  labelActive: {
    color: '#111',              // dark when selected
    fontWeight: '700',
  },
});
