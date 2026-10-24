import { useCallback, useEffect, useState } from 'react';
import tasksData from '../data/tasks.json';
import type {Task} from './types/task'
import { ActivityIndicator, FlatList, type ListRenderItem, Pressable, StyleSheet, Text, View } from 'react-native';
import TaskCard from './components/task-card';
import PriorityPills, { type PriorityFilter } from './components/priority-pills';


//state for ui
type UiState = { status : 'loading'} 
| {status : 'error' , message: string} 
| {status: 'success' ,tasks: Task[]}



// Fake API: waits 1s, fails 20% of the time
function fetchTasks(): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.2) reject(new Error('Could not load tasks'));
      else resolve(tasksData as Task[]);
    }, 1000);
  });
}


const renderItem: ListRenderItem<Task> = ({item}) => (
    <TaskCard 
    task={item}
    onPress={(id:number) => console.log(`Task pressed with ID: ${id}`)
    }
    />
  )

const TasksScreen = () => {

const [state,setState] = useState<UiState>({
  status: 'loading'
});

const [filter, setFilter] = useState<PriorityFilter>('all');



const getTasks = useCallback(async() => {
  try{
  // setState({
  //   status:'loading'
  // });

  const tasksData = await fetchTasks();

  setState({
    status: 'success', tasks: tasksData
  });

  }catch(e){
    setState({
      status: 'error', message:  e instanceof Error ? e.message : 'Something went wrong',
    })
  }
},[])

useEffect(() => {
void getTasks();

//Any function or variable from the component scope that is used inside useEffect must be included in the dependency array.
},[getTasks]);

switch (state.status){
  case 'loading' :
    return (<View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.muted}>Loading tasks…</Text>
        </View>
        )
  case 'error':
    return (
        <View style={styles.center}>
          <Text style={styles.error}>{state.message}</Text>
          <Pressable style={styles.button} onPress={getTasks}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      )
  case 'success': {
    const visibleTasks =  filter === 'all' 
  ? state.tasks :
  state.tasks.filter((task) => task.priority === filter);
 return (
  <View style={{flex:1, padding:10}}>
     <PriorityPills
       selected={filter}
       onSelect={(value) => {
         setFilter(value);
         console.log(`Priority pill pressed: ${value}`);
       }}
     />

     <FlatList 
   data={visibleTasks}
   keyExtractor={(item) => item.id.toString()}
   ListEmptyComponent={
        <Text style={styles.muted}>No tasks yet</Text>
  }
  renderItem={renderItem}
  ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
   /> 
  </View>
)
  }
  
   

 

}



}

export default TasksScreen;

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  muted: { color: '#888' },
   error: { color: '#d33', fontSize: 16 },
  button: { backgroundColor: '#3c87f7', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
   buttonText: { color: '#fff', fontWeight: '600' },
});