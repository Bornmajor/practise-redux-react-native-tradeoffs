// Building blocks from React Native: a pressable area, styles, text and a container
import { Pressable, StyleSheet, Text, View } from 'react-native';
// The Todo type from step 1, so the props are typed
import type { Todo } from '../types';

// The props this component expects from its parent
interface TodoItemProps {
  todo: Todo;                         // the todo to show
  onToggle: (id: string) => void;     // called when the row is tapped
  onDelete: (id: string) => void;     // called when "Delete" is tapped
}

// A presentational component: it only displays props and reports taps, no Redux inside
const TodoItem = ({ todo, onToggle, onDelete }: TodoItemProps) => {
  // True when this todo is completed; used for styling below
  const isCompleted = todo.status === 'completed';

  // Return the row's UI
  return (
    // The whole row; flex row puts checkbox, title and delete button side by side
    <View style={styles.row}>
      {/* Tapping the checkbox + title toggles the status */}
      <Pressable style={styles.main} onPress={() => onToggle(todo.id)}>
        {/* The checkbox: filled when completed, empty when pending */}
        <View style={[styles.checkbox, isCompleted && styles.checkboxDone]}>
          {/* Show a tick only when completed */}
          {isCompleted && <Text style={styles.tick}>✓</Text>}
        </View>
        {/* The title; struck through and faded when completed */}
        <Text style={[styles.title, isCompleted && styles.titleDone]}>{todo.title}</Text>
      </Pressable>

      {/* Separate button to delete this todo */}
      <Pressable onPress={() => onDelete(todo.id)} hitSlop={8}>
        {/* The delete label */}
        <Text style={styles.delete}>Delete</Text>
      </Pressable>
    </View>
  );
};

// Export so the screen can use it
export default TodoItem;

// Styles for the row
const styles = StyleSheet.create({
  // Row container: horizontal layout, padding and a light card background
  row: {
    flexDirection: 'row',          // children side by side
    alignItems: 'center',          // vertically centered
    padding: 14,                   // space inside the row
    borderRadius: 10,              // rounded corners
    backgroundColor: '#f2f2f2',    // light grey card
  },
  // The tappable area: checkbox + title, takes all space except the delete button
  main: {
    flex: 1,                       // grow to fill available width
    flexDirection: 'row',          // checkbox then title
    alignItems: 'center',          // vertically centered
    gap: 12,                       // space between checkbox and title
  },
  // Empty checkbox
  checkbox: {
    width: 24,                     // square size
    height: 24,
    borderRadius: 6,               // slightly rounded
    borderWidth: 2,                // outline
    borderColor: '#3c87f7',        // blue outline
    alignItems: 'center',          // center the tick horizontally
    justifyContent: 'center',      // center the tick vertically
  },
  // Checkbox when completed: filled blue
  checkboxDone: {
    backgroundColor: '#3c87f7',
  },
  // The ✓ inside the checkbox
  tick: {
    color: '#fff',                 // white tick on blue
    fontWeight: '700',
  },
  // Title text
  title: {
    flex: 1,                       // take remaining space, wrap long text
    fontSize: 16,
  },
  // Title when completed
  titleDone: {
    textDecorationLine: 'line-through', // strike through
    color: '#888',                       // faded grey
  },
  // Delete label
  delete: {
    color: '#d33',                 // red
    fontWeight: '600',
    marginLeft: 12,                // space from the title
  },
});