import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    View,
    Text,
    TextInput,
    Image,
    Alert,
} from 'react-native';
import { Avatar, Button, HStack, Divider, Heading, VStack } from "native-base";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { FIREBASE_STORAGE } from '../../services/FirebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import {launchImageLibrary} from 'react-native-image-picker';
import { auth } from '../../services/FirebaseConfig';
const UserProfile = ({ navigation }) => {
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [userDetails, setUserDetails] = useState({
        name: '',
        email: '',
        address: '',
        phoneNumber: '',
        token:'',
    });
    const handleUploadPicture = async (imageUri) => {
        const storage = ref(FIREBASE_STORAGE, 'profilePictures/' + userDetails.token);

        try {
          // Convert image to bytes
          const response = await fetch(imageUri);
          const blob = await response.blob();
      
          // Upload bytes to Firebase Storage
          await uploadBytes(storage, blob);
      
          // Get the download URL of the uploaded image
          const downloadURL = await getDownloadURL(storage);
      
          // Update user profile in Firestore with the new profile picture URL
          const userDocRef = doc(FIREBASE_DB, 'users', token);
          await updateDoc(userDocRef, { profilePicture: downloadURL });
      
          // Update the profilePictureUrl state
          setProfilePictureUrl(downloadURL);
      
        } catch (error) {
          console.error('Error uploading profile picture:', error.message);
        }
    };
    useEffect(() => {
        // Retrieve user details from AsyncStorage or authentication state
        // Update the userDetails state with the retrieved data
        const retrieveUserDetails = async () => {
            try {
                const name = await AsyncStorage.getItem('userName');
                const email = await AsyncStorage.getItem('userEmail');
                const address = await AsyncStorage.getItem('userAddress');
                const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
                const token = await AsyncStorage.getItem('userToken');
                setUserDetails({
                    name: name || '',
                    email: email || '',
                    address: address || '',
                    phoneNumber: phoneNumber || '',
                    token: token ||  '',
                });
            } catch (error) {
                console.error('Error retrieving user details:', error.message);
            }
        };

        retrieveUserDetails();
    }, []);

    const handleEditProfile = async () => {
        try {
            const options = {
                mediaType: 'photo', // or 'video' if you want to allow videos
                includeBase64: false,
                quality: 1,
            };

            const result = await launchImageLibrary(options);

            if (!result.didCancel) {
                await handleUploadPicture(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error selecting profile picture:', error.message);
        }
    };

    return (
        <SafeAreaView >
            <ScrollView>
                <View style={styles.profileContainer}>
                    <VStack alignItems={"center"} mr={10}>
                        {/* Profile Picture */}
                        <Avatar bg="green.500" source={{ uri: profilePictureUrl || "default_profile_picture_url" }} size={"2xl"}>
                            {userDetails.name.charAt(0)}
                        </Avatar>

                        <Button onPress={handleEditProfile} size="lg" style={styles.editButton}>
                            <HStack>
                                <MaterialCommunityIcons
                                    name="pencil-outline"
                                    size={20}
                                    color="black"
                                />
                                <Text style={styles.editButtonText}>Edit profile picture</Text>
                            </HStack>

                        </Button>
                    </VStack>

                    {/* User Details */}
                    <VStack space={2} width={"280"}>
                        <Heading alignItems={"start"} flexDirection="row" size="md" >Name</Heading>
                        <Divider _light={{
                            bg: "muted.300"
                        }} _dark={{
                            bg: "muted.50"
                        }} />
                        <Text style={styles.userName}>{userDetails.name}</Text>
                        <Heading alignItems={"start"} flexDirection="row" size="md">Email</Heading>
                        <Divider _light={{
                            bg: "muted.300"
                        }} _dark={{
                            bg: "muted.50"
                        }} />
                        <Text style={styles.userInfo}>{userDetails.email}</Text>
                        <Heading alignItems={"start"} flexDirection="row" size="md">Address</Heading>
                        <Divider _light={{
                            bg: "muted.300"
                        }} _dark={{
                            bg: "muted.50"
                        }} />
                        <Text style={styles.userInfo}>{userDetails.address}</Text>
                        <Heading alignItems={"start"} flexDirection="row" size="md">Phone Number</Heading>
                        <Divider _light={{
                            bg: "muted.300"
                        }} _dark={{
                            bg: "muted.50"
                        }} />
                        <Text style={styles.userInfo}>{userDetails.phoneNumber}</Text>
                    </VStack>

                </View>


            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    profileContainer: {
        alignItems: 'start',
        marginTop: 20,
        marginLeft: 45
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10,
    },
    detailsContainer: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 16,
        marginBottom: 5,
        marginLeft: 15
    },
    userInfo: {
        fontSize: 16,
        marginBottom: 5,
        marginLeft: 15
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#e7e7e7',
        paddingVertical: 10,
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 8,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
});

export default UserProfile;

