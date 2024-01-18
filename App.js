import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { enableFreeze } from 'react-native-screens';
import { NativeBaseProvider, Box } from "native-base";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
export default function App() {
  enableFreeze(true);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <NativeBaseProvider>

    <SafeAreaView style={styles.container}>
      <AppNavigator/>

      <StatusBar style="auto" />
      
    </SafeAreaView>
    </NativeBaseProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
