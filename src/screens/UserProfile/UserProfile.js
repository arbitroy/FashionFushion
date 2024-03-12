import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Button, Divider, HStack, Heading, Pressable, Spinner, Text, VStack } from "@gluestack-ui/themed-native-base";
import AsyncStorage from '@react-native-async-storage/async-storage';
import storage from '@react-native-firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { FIREBASE_DB } from '../../services/FirebaseConfig';

const UserProfile = ({ navigation }) => {
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [userDetails, setUserDetails] = useState({
        name: '',
        email: '',
        address: '',
        phoneNumber: '',
        Id: '',
    });
    const [uploading, setUploading] = useState(false);
    const handleUploadPicture = async (imagePath) => {
        const storageRef = storage().ref(`profilePictures/${userDetails.Id}`);

        try {
            setUploading(true);
            // Upload compressed image to Firebase Storage
            const task = storageRef.putFile(imagePath);
            task.on(
                'state_changed',
                (snapshot) => {
                    // Handle upload progress (if needed)
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                },
                (error) => {
                    // Handle errors during upload
                    console.error('Error uploading profile picture:', error.message);
                    setUploading(false);
                },
                async () => {
                    // Upload completed successfully, get download URL
                    try {
                        const downloadURL = await storageRef.getDownloadURL();
                        // Update user profile in Firestore with the new profile picture URL
                        const userDocRef = doc(FIREBASE_DB, 'users', userDetails.Id);
                        await updateDoc(userDocRef, { profilePicture: downloadURL });
                        // Update the profilePictureUrl state
                        setProfilePictureUrl(downloadURL);
                        await AsyncStorage.setItem('userProfilePicture', downloadURL || '');
                    } catch (downloadError) {
                        console.error('Error getting download URL:', downloadError.message);
                        setUploading(false);
                    } finally {
                        setUploading(false);
                    }
                }
            );
        } catch (uploadError) {
            console.error('Error uploading profile picture:', uploadError.message);
            setUploading(false);
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
                const Id = await AsyncStorage.getItem('userID');
                setUserDetails({
                    name: name || '',
                    email: email || '',
                    address: address || '',
                    phoneNumber: phoneNumber || '',
                    Id: Id || '',
                });
                setProfilePictureUrl(await AsyncStorage.getItem('userProfilePicture'));
            } catch (error) {
                console.error('Error retrieving user details:', error.message);
            }
        };

        retrieveUserDetails();
    }, []);

    const handleEditProfile = async () => {
        try {
            const options = {
                mediaType: 'photo',
                includeBase64: false,
                quality: 0.8, // Adjust the quality as needed (0 to 1)
            };
            const result = await launchImageLibrary(options);
            if (!result.didCancel) {
                // Compress the image before uploading
                const compressedImageUri = result.assets[0].uri; // You can use this uri for uploading
                await handleUploadPicture(compressedImageUri);
            }
        } catch (error) {
            console.error('Error selecting or compressing the profile picture:', error.message);
        }
    };

    return (
        <SafeAreaView >
            <ScrollView>
                <VStack alignItems={"center"} m="6">
                    {/* Profile Picture */}
                    <Avatar bg="green.500" source={{ uri: profilePictureUrl || "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" }} size={"2xl"}>
                        {userDetails.name.charAt(0)}

                    </Avatar>
                    {uploading && <Spinner color="cyan.500" />}
                    <Button onPress={handleEditProfile} size="lg" style={styles.editButton}>
                        <HStack>
                            <MaterialCommunityIcons
                                name="pencil-outline"
                                size={20}
                                color="lightblue"
                            />
                            <Text style={styles.editButtonText}>Edit profile picture</Text>
                        </HStack>
                    </Button>
                </VStack>
                <Pressable ml={1} mb={3} rounded="8" overflow="hidden" borderWidth="1" borderColor="coolGray.300" maxW="96" shadow="3" bg="coolGray.100" p="4">
                    <Text fontSize="2xl">My Details</Text>
                    <View style={styles.profileContainer}>

                        {/* User Details */}
                        <VStack space={2} width={"280"}>
                            <Heading flexDirection="row" size="xs" >Name</Heading>
                            <Divider _light={{
                                bg: "muted.300"
                            }} _dark={{
                                bg: "muted.50"
                            }} />
                            <Text style={styles.userName}>{userDetails.name}</Text>
                            <Heading flexDirection="row" size="xs">Email</Heading>
                            <Divider _light={{
                                bg: "muted.300"
                            }} _dark={{
                                bg: "muted.50"
                            }} />
                            <Text style={styles.userInfo}>{userDetails.email}</Text>
                            <Heading flexDirection="row" size="xs">Address</Heading>
                            <Divider _light={{
                                bg: "muted.300"
                            }} _dark={{
                                bg: "muted.50"
                            }} />
                            <Text style={styles.userInfo}>{userDetails.address}</Text>
                            <Heading flexDirection="row" size="xs">Phone Number</Heading>
                            <Divider _light={{
                                bg: "muted.300"
                            }} _dark={{
                                bg: "muted.50"
                            }} />
                            <Text style={styles.userInfo}>{userDetails.phoneNumber}</Text>
                        </VStack>

                    </View>
                </Pressable>

                <Pressable onPress={() => navigation.navigate('Shop')} rounded="8" overflow="hidden" borderWidth="1" borderColor="coolGray.300" maxW="96" shadow="3" bg="coolGray.100" p="5" ml={1} mb={3}>
                    <Text fontSize="xl"><MaterialCommunityIcons
                        name="store"
                        size={25}
                        color="lightblue"
                    /> My Shop</Text>
                </Pressable>
                {/* <Pressable  onPress={() => navigation.navigate('ChatScreen')} rounded="8" overflow="hidden" borderWidth="1" borderColor="coolGray.300" maxW="96" shadow="3" bg="coolGray.100" p="5"ml={1} mb={3}>
                    <Text fontSize="xl"><MaterialCommunityIcons
                                name="shopping"
                                size={25}
                                color="lightblue"
                            /> My Orders</Text>
                    </Pressable> */}
                <Pressable onPress={() => navigation.navigate('Inbox')} rounded="8" overflow="hidden" borderWidth="1" borderColor="coolGray.300" maxW="96" shadow="3" bg="coolGray.100" p="5" ml={1} mb={3}>
                    <Text fontSize="xl"><MaterialCommunityIcons
                        name="chat"
                        size={25}
                        color="lightblue"
                    /> Messages</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('HomeScreen')} rounded="8" overflow="hidden" borderWidth="1" borderColor="coolGray.300" maxW="96" shadow="3" bg="coolGray.100" p="5" ml={1} mb={3}>
                    <Text fontSize="xl"><MaterialCommunityIcons
                        name="home"
                        size={25}
                        color="lightblue"
                    /> Home</Text>
                </Pressable>
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

