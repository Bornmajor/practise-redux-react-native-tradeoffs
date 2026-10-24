import { Pressable, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import type {Task} from '../types/task'

interface TaskCardProps  {
task: Task,
onPress: (id:number) => void
}


const TaskCard = ({task,onPress}:TaskCardProps) => {
return <Pressable style={styles.card} 
onPress={() => onPress(task.id)}>
    <Text>{task.title}</Text>
    <Text>{task.priority}</Text>

    </Pressable>
}

export default TaskCard;

const styles = StyleSheet.create({
    card:{
    backgroundColor: '#D2D2D2',
    borderRadius: 12,
     elevation:4
    }
})