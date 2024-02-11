import React, { useState } from 'react';
import { Dimensions, StatusBar, Animated, Pressable } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { FontAwesome } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import {
  Box,
  Center,
  Heading,
  VStack,
  FormControl,
  Input,
  Button,
  useColorModeValue,
  Link,
  Alert,
  HStack,
  Text,
  ScrollView,
  Icon,
  Spinner,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIREBASE_DB, FIREBASE_STORAGE } from '../../services/FirebaseConfig';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '440968322493-v8lpp8bvr92poet54p304pdcuacv2qdc.apps.googleusercontent.com',
});

const storeUserDetailsInAsyncStorage = async (userCredential, userDoc, newEmail, newAddress, newPhone) => {
  await AsyncStorage.multiSet([
    ['userID', userCredential.user.uid],
    ['userName', userDoc?.data()?.name || ''],  // Use optional chaining here
    ['userEmail', newEmail || userCredential.user.email],
    ['userAddress', newAddress || userDoc?.data()?.address || ''],  // Use optional chaining here
    ['userPhoneNumber', newPhone || userDoc?.data()?.phone || ''],  // Use optional chaining here
    ['userProfilePicture', userDoc?.data()?.profilePicture || ''],  // Use optional chaining here
  ]);
};

const SignUp = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const auth = FIREBASE_AUTH;

  const handleSignUp = async () => {
    const { password, confirmPassword, ...restFormData } = formData;

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, password);

      await setDoc(doc(FIREBASE_DB, 'users', userCredential.user.uid), restFormData);

      await storeUserDetailsInAsyncStorage(userCredential, {}, formData.email, formData.address, formData.phone);

      setShowAlert(true);
      setTimeout(() => {
        navigation.navigate('HomeScreen');
        setShowAlert(false);
      }, 500);
      setErrorMessage('');
      setFormData({
        name: '',
        email: '',
        address: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error signing up:', error.message);
      setErrorMessage(error.message);
    }
  };

  return (
    <Center w="100%">
      <Box safeArea p="2" w="90%" maxW="290" py="8">
        <ScrollView showsVerticalScrollIndicator={false}>
          <Heading size="lg" color="coolGray.800" _dark={{ color: 'warmGray.50' }} fontWeight="semibold">
            Welcome
          </Heading>
          <Heading mt="1" color="coolGray.600" _dark={{ color: 'warmGray.200' }} fontWeight="medium" size="xs">
            Sign up to continue!!!
          </Heading>
          {showAlert && (
            <Alert mt="14" w="100%" variant="outline" colorScheme="success" status="success">
              <VStack space={2} flexShrink={1} w="100%">
                <HStack flexShrink={1} space={2} alignItems="center" justifyContent="space-between">
                  <HStack space={2} flexShrink={1} alignItems="center">
                    <Alert.Icon />
                    <Text>Successfully Joined</Text>
                  </HStack>
                </HStack>
              </VStack>
            </Alert>
          )}
          <VStack space={3} mt="5">
            {Object.entries(formData).map(([key, value]) => (
              <FormControl key={key}>
                <FormControl.Label>{key.charAt(0).toUpperCase() + key.slice(1)}</FormControl.Label>
                <Input value={value} onChangeText={(text) => setFormData({ ...formData, [key]: text })} />
              </FormControl>
            ))}
            {errorMessage ? <Text color="red.500">{errorMessage}</Text> : null}
            <Button mt="2" colorScheme="lightBlue" onPress={handleSignUp}>
              Sign up
            </Button>
          </VStack>
        </ScrollView>
      </Box>
    </Center>
  );
};

const initialLayout = {
  width: Dimensions.get('window').width,
};

const renderScene = ({ route, navigation }) => {
  switch (route.key) {
    case 'first':
      return <SignIn navigation={navigation} />;
    case 'second':
      return <SignUp navigation={navigation} />;
    default:
      return null;
  }
};

function SignIn({ navigation }) {
  WebBrowser.maybeCompleteAuthSession();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [show, setShow] = useState(false);

  const auth = FIREBASE_AUTH;

  const handleSignIn = async () => {
    setLoading(true); 
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);

      const userDoc = await getDoc(doc(FIREBASE_DB, 'users', userCredential.user.uid));

      await storeUserDetailsInAsyncStorage(userCredential, userDoc, formData.email, formData.address, formData.phone);

      setShowAlert(true);
      setTimeout(() => {
        navigation.navigate('HomeScreen');
        setShowAlert(false);
      }, 100);
      setErrorMessage('');
      setFormData({ email: '', password: '' });
    } catch (error) {
      console.error('Error signing in:', error.message);
      setErrorMessage(error.message);
    }
    setLoading(false);
  };

  return (
    <Center w="100%">
      <Box safeArea p="2" w="90%" maxW="290" py="8">
        <Heading size="lg" color="coolGray.800" _dark={{ color: 'warmGray.50' }} fontWeight="semibold">
          Welcome
        </Heading>
        <Heading mt="1" color="coolGray.600" _dark={{ color: 'warmGray.200' }} fontWeight="medium" size="xs">
          Log in to find that tailor that suits your needs :)
        </Heading>
        {showAlert && (
          <Alert mt="14" w="100%" variant="outline" colorScheme="success" status="success">
            <VStack space={2} flexShrink={1} w="100%">
              <HStack flexShrink={1} space={2} alignItems="center" justifyContent="space-between">
                <HStack space={2} flexShrink={1} alignItems="center">
                  <Alert.Icon />
                  <Text>Successfully logged in</Text>
                </HStack>
              </HStack>
            </VStack>
          </Alert>
        )}
        <VStack space={3} mt="5">
          {Object.entries(formData).map(([key, value]) => (
            <FormControl key={key}>
              <FormControl.Label>{key.charAt(0).toUpperCase() + key.slice(1)}</FormControl.Label>
              
              <Input
                value={value}
                onChangeText={(text) => setFormData({ ...formData, [key]: text })}
                secureTextEntry={key === 'password'}
              />
            </FormControl>
          ))}
          {loading && <Spinner color="cyan.500" />}
          <Button mt="2" colorScheme="lightBlue" onPress={handleSignIn}>
            Sign in
          </Button>
          <HStack space={3} justifyContent="center">
            <Link mt="1/6" m="auto" onPress={() => navigation.navigate('HomeScreen')}>
              Sign in as a guest
            </Link>
          </HStack>
        </VStack>
      </Box>
    </Center>
  );
}

const AuthScreen = React.memo(({ navigation }) => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'Login' },
    { key: 'second', title: 'Sign Up' },
  ]);

  const renderTabBar = (props) => {
    const inputRange = props.navigationState.routes.map((x, i) => i);
    return (
      <Box>
        <Heading style={{ flexDirection: 'row', paddingLeft: 10 }}>
          <Heading style={{ fontSize: 25, fontWeight: '800' }}>Fashion</Heading>
          <Heading style={{ fontSize: 25, fontWeight: '800', color: '#327ba8' }}>Fusion.</Heading>
        </Heading>
        <Box flexDirection="row">
          {props.navigationState.routes.map((route, i) => {
            const opacity = props.position.interpolate({
              inputRange,
              outputRange: inputRange.map((inputIndex) => (inputIndex === i ? 1 : 0.5)),
            });
            const color = index === i ? useColorModeValue('#000', '#e5e5e5') : useColorModeValue('#1f2937', '#a1a1aa');
            const borderColor = index === i ? 'cyan.500' : useColorModeValue('coolGray.200', 'gray.400');
            return (
              <Box
                key={route.key}
                borderBottomWidth="3"
                borderColor={borderColor}
                flex={1}
                alignItems="center"
                p="3"
                cursor="pointer"
              >
                <Pressable onPress={() => setIndex(i)}>
                  <Animated.Text style={{ color }}>{route.title}</Animated.Text>
                </Pressable>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={(props) => renderScene({ ...props, navigation })}
      renderTabBar={renderTabBar}
      onIndexChange={setIndex}
      initialLayout={initialLayout}
      style={{ marginTop: StatusBar.currentHeight }}
    />
  );
});

export default AuthScreen;
