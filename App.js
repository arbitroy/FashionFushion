import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { enableFreeze } from 'react-native-screens';
import { NativeBaseProvider, Box } from "native-base";
export default function App() {
  enableFreeze(true);
  return (
    <NativeBaseProvider>

    <SafeAreaView style={styles.container}>
      <AppNavigator/>

      <StatusBar style="auto" />
      
    </SafeAreaView>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
