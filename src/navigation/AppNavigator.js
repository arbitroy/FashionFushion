import React from 'react'
import AuthScreen from '../screens/AuthScreen/AuthScreen';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DiscoverScreen from '../screens/DiscoverScreen/DiscoverScreen';
import ChatScreen from '../screens/ChatScreen/ChatScreen';
import UserProfile from '../screens/UserProfile/UserProfile';
import Shop from '../screens/Shop/Shop';
import ProductDetails from '../screens/ProductDetails/ProductDetails';



const AppNavigator = () => {

    const Stack = createStackNavigator();

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name='AuthScreen' component={AuthScreen} />
                <Stack.Screen name='HomeScreen' component={HomeScreen} />
                <Stack.Screen
                    name='ProductDetails'
                    component={ProductDetails}
                    initialParams={{ productId: null }} // Set an initial value if needed
                />
                <Stack.Screen name='DiscoverScreen' component={DiscoverScreen} />
                <Stack.Screen name='ChatScreen' component={ChatScreen} />
                <Stack.Screen name='UserProfile' component={UserProfile} />
                <Stack.Screen name='Shop' component={Shop} />

            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default AppNavigator