import { useState } from "react";
import { View,StyleSheet, Text } from "react-native";
import InputText from "./input-text";

const FormScreen = () => {

    const [username,setUsername] = useState('osborn');

    return (
       <View style={styles.container}>
         <InputText 
         value={username}
         setValue={setUsername}
         />
         <Text>{username}</Text>
       </View>
    );


}

export default FormScreen;

const styles = StyleSheet.create({
   container:{
    padding: 10,
   }
})