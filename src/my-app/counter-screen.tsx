import { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

const CounterScreen = () =>{

    const [count,setCount] = useState(0);

    const increment = () => {
        if(count < 30) setCount(count + 1);
    }

    const decrement = () => {
        if(count < 1) return;
      
        setCount(count - 1);

    }


    return (
        <View style={styles.container}>
          <Text style={{
            fontSize:40
          }}>{count}
          </Text>

          <View style={styles.buttonsContainer}>

             <Button 
             title="Decrement"
             onPress={decrement}
             />

             <Button 
             title="Increment"
             onPress={increment}
             />
            
          </View>
        </View>
    )
}

export default CounterScreen;


const styles = StyleSheet.create({
    container:{
        flex:1,
      justifyContent:'center',
      alignItems:'center',
      gap:40,
    },
    buttonsContainer:{
       flexDirection: 'row',
        gap:30,
    }
})