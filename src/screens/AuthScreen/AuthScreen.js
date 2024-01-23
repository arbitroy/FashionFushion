import React, { useState } from 'react';
import { Dimensions, StatusBar, Animated, Pressable } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { FontAwesome } from '@expo/vector-icons';
import * as WebBrowser from "expo-web-browser"
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
  Icon,
  ScrollView
} from 'native-base';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../services/FirebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { FIREBASE_STORAGE } from '../../services/FirebaseConfig';

GoogleSignin.configure({
  webClientId: '440968322493-v8lpp8bvr92poet54p304pdcuacv2qdc.apps.googleusercontent.com',
});
const SignUp = ({ navigation }) => {
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const auth = FIREBASE_AUTH;

  const handleSignUp = async () => {
    if (newPassword !== confirmPassword) {

      setErrorMessage('Passwords do not match');

      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newEmail,
        newPassword
      );
      // Store user details in Firestore
      await setDoc(doc(FIREBASE_DB, 'users', userCredential.user.uid), {
        email: newEmail, name: newName,
        email: newEmail,
        address: newAddress,
        phone: newPhone,

        // Add other user details as needed
      });

      await AsyncStorage.setItem('userToken', userCredential.user.uid);
      await AsyncStorage.setItem('userName', newName);
      await AsyncStorage.setItem('userEmail', newEmail);
      await AsyncStorage.setItem('userAddress', newAddress);
      await AsyncStorage.setItem('userPhoneNumber', newPhone);
      // Successfully signed up
      console.log('User signed up:', userCredential.user);
      setShowAlert(true);
      setTimeout(() => {
        // Navigate to the home screen or any other screen
        navigation.navigate('HomeScreen');
        setShowAlert(false);
      }, 500);
      setErrorMessage('');
      setNewAddress('');
      setNewPhone('');
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      // Handle sign-up errors
      console.error('Error signing up:', error.message);
      setErrorMessage(error.message);
    }
  };
  return (
    <Center w="100%">
      <Box safeArea p="2" w="90%" maxW="290" py="8">

        <ScrollView showsVerticalScrollIndicator={false}>
          <Heading
            size="lg"
            color="coolGray.800"
            _dark={{ color: 'warmGray.50' }}
            fontWeight="semibold"
          >
            Welcome
          </Heading>
          <Heading
            mt="1"
            color="coolGray.600"
            _dark={{ color: 'warmGray.200' }}
            fontWeight="medium"
            size="xs"
          >
            Sign up to continue!!!
          </Heading>
          {showAlert && (
            <Alert
              mt="14"
              w="100%"
              variant="outline"
              colorScheme="success"
              status="success"
            >
              <VStack space={2} flexShrink={1} w="100%">
                <HStack
                  flexShrink={1}
                  space={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <HStack space={2} flexShrink={1} alignItems="center">
                    <Alert.Icon />
                    <Text>Successfully Joined</Text>
                  </HStack>
                </HStack>
              </VStack>
            </Alert>
          )}
          <VStack space={3} mt="5">
            <FormControl>
              <FormControl.Label>Name</FormControl.Label>
              <Input value={newName} onChangeText={(text) => setNewName(text)} />
            </FormControl>
            <FormControl>
              <FormControl.Label>Email</FormControl.Label>
              <Input value={newEmail} onChangeText={(text) => setNewEmail(text)} />
            </FormControl>

            <FormControl>
              <FormControl.Label>Address</FormControl.Label>
              <Input value={newAddress} onChangeText={(text) => setNewAddress(text)} />
            </FormControl>
            <FormControl>
              <FormControl.Label>Phone No.</FormControl.Label>
              <Input placeholder="+2540000000" value={newPhone} onChangeText={(text) => setNewPhone(text)} />
            </FormControl>
            <FormControl>
              <FormControl.Label>Password</FormControl.Label>
              <Input
                type="password"
                value={newPassword}
                onChangeText={(text) => setNewPassword(text)}
              />
            </FormControl>
            {errorMessage ? <Text color="red.500">{errorMessage}</Text> : null}
            <FormControl>
              <FormControl.Label>Confirm Password</FormControl.Label>
              <Input
                type="password"
                value={confirmPassword}
                onChangeText={(text) => setConfirmPassword(text)}
              />
            </FormControl>
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const auth = FIREBASE_AUTH;


  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userDoc = await getDoc(doc(FIREBASE_DB, 'users', userCredential.user.uid));
      const userName = userDoc.data().name;

      // Save user token and name in AsyncStorage
      await AsyncStorage.setItem('userID', userCredential.user.uid);
      await AsyncStorage.setItem('userName', userName);
      await AsyncStorage.setItem('userEmail', email);
      await AsyncStorage.setItem('userAddress', userDoc.data().address || '');
      await AsyncStorage.setItem('userPhoneNumber', userDoc.data().phone || '');
      await AsyncStorage.setItem('userProfilePicture', userDoc.data().profilePicture || '');
      setShowAlert(true);
      // Delay navigation by 3 seconds (or any duration you prefer)
      setTimeout(() => {
        // Navigate to the home screen or any other screen
        navigation.navigate('HomeScreen');
        setShowAlert(false);
      },100);
      setErrorMessage('');
      setEmail('');
      setPassword('');
    } catch (error) {
      // Handle sign-in errors
      console.error('Error signing in:', error.message);
      // Display an error message to the user, for example using an alert or a toast notification
      setErrorMessage(error.message);
      setPassword('');
    }
  };
  return (
    <Center w="100%">

      <Box safeArea p="2" w="90%" maxW="290" py="8">
        <Heading
          size="lg"
          color="coolGray.800"
          _dark={{ color: 'warmGray.50' }}
          fontWeight="semibold"
        >
          Welcome
        </Heading>
        <Heading
          mt="1"
          color="coolGray.600"
          _dark={{ color: 'warmGray.200' }}
          fontWeight="medium"
          size="xs"
        >
          Log in to find that tailor that suit your needs : )
        </Heading>
        {showAlert && (
          <Alert
            mt="14"
            w="100%"
            variant="outline"
            colorScheme="success"
            status="success"
          >
            <VStack space={2} flexShrink={1} w="100%">
              <HStack
                flexShrink={1}
                space={2}
                alignItems="center"
                justifyContent="space-between"
              >
                <HStack space={2} flexShrink={1} alignItems="center">
                  <Alert.Icon />
                  <Text>Successfully logged in</Text>
                </HStack>
              </HStack>
            </VStack>
          </Alert>
        )}
        <VStack space={3} mt="5">
          <FormControl>
            <FormControl.Label>Email</FormControl.Label>
            <Input value={email} onChangeText={(text) => setEmail(text)} />
          </FormControl>
          <FormControl>
            <FormControl.Label>Password</FormControl.Label>
            {errorMessage ? <Text color="red.500">{errorMessage}</Text> : null}
            <Input
              type="password"
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
          </FormControl>

          <Button mt="2" colorScheme="lightBlue" onPress={handleSignIn}>
            Sign in
          </Button>

          <HStack space={3} justifyContent="center">
            <Link
              mt="1/6"
              m="auto"
              onPress={() => navigation.navigate('HomeScreen')}
            >
              Sign in as guest
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
          <Heading
            style={{ fontSize: 25, fontWeight: '800', color: '#327ba8' }}
          >
            Fushion.
          </Heading>
        </Heading>
        <Box flexDirection="row">
          {props.navigationState.routes.map((route, i) => {
            const opacity = props.position.interpolate({
              inputRange,
              outputRange: inputRange.map((inputIndex) =>
                inputIndex === i ? 1 : 0.5
              ),
            });
            const color =
              index === i
                ? useColorModeValue('#000', '#e5e5e5')
                : useColorModeValue('#1f2937', '#a1a1aa');
            const borderColor =
              index === i
                ? 'cyan.500'
                : useColorModeValue('coolGray.200', 'gray.400');
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
