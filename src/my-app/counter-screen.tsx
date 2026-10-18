import { useState } from "react";
import {  StyleSheet, Text, View } from "react-native";
import {Button, ButtonText} from '@/components/ui/button'
import MyBottomSheetNumber from "./my-bottom-sheet";

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
        <View style={styles.container} className="bg-secondary">
          <Text style={{
            fontSize:40
          }} className="text-foreground">{count}
          </Text>

          <View style={styles.buttonsContainer}>

           
             <Button onPress={decrement}>
                <ButtonText>Decrement</ButtonText>
             </Button>

              <Button onPress={increment}>
                 <ButtonText>Increment</ButtonText>
             </Button>
            
          </View>
          <MyBottomSheetNumber myNumber="5" />
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