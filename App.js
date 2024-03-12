import { NativeBaseProvider } from "@gluestack-ui/themed-native-base";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { enableFreeze } from 'react-native-screens';
import AppNavigator from './src/navigation/AppNavigator';
export default function App() {
  enableFreeze(true);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NativeBaseProvider>

        <SafeAreaView style={styles.container}>
          <AppNavigator />

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
