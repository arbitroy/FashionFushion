import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HStack } from '@gluestack-ui/themed-native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDoc, arrayUnion, collection, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc, } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import 'react-native-get-random-values';
import { FIREBASE_DB } from '../../services/FirebaseConfig';

const ChatScreen = ({ route, navigation }) => {
  const { product } = route.params || { product: null };
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [shopName, setShopName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [userIdParticipant, setUserID] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [recipientId, setRecepientId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isConversationLoaded, setIsConversationLoaded] = useState(false);


  function getTime(date) {
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userIdFromStorage = await AsyncStorage.getItem('userID');
        setCurrentUserId(userIdFromStorage);
      } catch (error) {
        console.error('Error fetching current user ID:', error);
      }
    };
    fetchCurrentUser();
  }, []);
  useEffect(() => {

    const fetchConversation = async () => {
      try {
        let conversationId;
        if (route.params.conversationId) {
          conversationId = route.params.conversationId;
        } else if (currentConversationId) {
          conversationId = currentConversationId;
        } else if (product) {
          let t = getTime(new Date());
          const userId = product.userId;
          fetchShopName(userId);
          setUserID(userId);
          setMessages([
            {
              id: nanoid(),
              recipient: userId,
              sender: currentUserId,
              message: `Product Details:\nName: ${product.name}\nDescription: ${product.description}\nPrice: $${product.price}`,
              time: t,
            },
          ]);
        }

        if (conversationId) {
          setCurrentConversationId(conversationId);
          const conversationDocRef = doc(FIREBASE_DB, 'conversations', conversationId);

          let tempMessages = [];

          const unsubscribe = onSnapshot(conversationDocRef, async (snapshot) => {
            if (snapshot.exists()) {
              const conversationData = snapshot.data();
              const loadedMessages = conversationData.messages || [];

              tempMessages = loadedMessages;

              if (!isConversationLoaded) {
                setIsConversationLoaded(true);
              }

              const userIdFromStorage = await AsyncStorage.getItem('userID');
              const userIdObject = conversationData.participants.find(participant => participant.id !== userIdFromStorage);
              const userId = userIdObject ? userIdObject.id : null;
              fetchShopName(userId);
              setUserID(userId);
            } else {
              console.error('Conversation document not found');
              tempMessages = [];
            }

            setMessages(tempMessages);
          });

          return () => {
            unsubscribe();
          };
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    };
    fetchConversation();
  }, [route.params.conversationId, currentConversationId, product, currentUserId]);


  // Function to fetch shop name from Firestore
  const fetchShopName = async (userId) => {
    try {
      const userDocRef = doc(FIREBASE_DB, 'users', userId);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        const shopName = userData.shop || userData.name;
        const rName = userData.name;
        const profile = userData.profilePicture
        setProfilePicture(profile);
        setShopName(shopName);
        setRecepientId(rName);

      } else {
        console.error('User document not found');
      }
    } catch (error) {
      console.error('Error fetching shop name:', error);
    }
  };




  const sendMessageToFirebase = async () => {
    if (inputMessage === '') {
      return setInputMessage('');
    }

    try {
      const sender = await AsyncStorage.getItem('userID');

      if (!sender) {
        console.error('User ID not found in AsyncStorage');
        return;
      }

      const conversationId = currentConversationId;
      const messageData = {
        id: nanoid(),
        sender,
        recipient: userIdParticipant,
        message: inputMessage,
        time: new Date(), // Set the time to the current date when sending a new message
      };


      setIsSending(true);


      if (conversationId != null) {
        setInputMessage('');
        const conversationDocRef = doc(FIREBASE_DB, 'conversations', conversationId);
        await updateDoc(conversationDocRef, {
          messages: arrayUnion(messageData),
        })

        setIsSending(false);
        setInputMessage('');
      } else {
        const senderName = await AsyncStorage.getItem('userName');
        const recipientName = recipientId;
        const newMessageRef = await addDoc(collection(FIREBASE_DB, 'messages'), { ...messageData, productId: product.productId })
        const newConversationData = {
          product: { productId: product.productId, productName: product.name },
          participants: [
            { id: sender, name: senderName },
            { id: product.userId, name: recipientName },
          ],
          createdAt: serverTimestamp(),
          shop: shopName,
          avatar: profilePicture,
          messages: [...messages, messageData],
        };
        const newConversationRef = collection(FIREBASE_DB, 'conversations');
        const newConversationDocRef = doc(newConversationRef, newMessageRef.id);
        setCurrentConversationId(newConversationDocRef.id);
        await setDoc(newConversationDocRef, newConversationData)
        setIsSending(false);
        setInputMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSending(false); // Make sure to set isSending to false in case of an error
    }
  };




  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        {/* Custom Appbar */}
        <View style={styles.appbar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.appbarTitle}>{shopName}</Text>
          <TouchableOpacity onPress={() => console.log('Options Pressed')}>
            <MaterialCommunityIcons name="dots-vertical" size={24} style={styles.icon} />
          </TouchableOpacity>
        </View>

        {/* Chat Messages */}
        {messages && <FlatList
          style={{ backgroundColor: '#f2f2ff' }}
          data={messages}
          keyExtractor={item => item?.id}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
          renderItem={({ item }) => (
            <TouchableWithoutFeedback>
              <View style={{ marginTop: 6 }}>
                <View
                  style={{
                    maxWidth: Dimensions.get('screen').width * 0.8,
                    backgroundColor: item.sender === currentUserId ? '#3a6ee8' : '#dfe4ea',
                    alignSelf: item.sender === currentUserId ? 'flex-end' : 'flex-start',
                    marginHorizontal: 10,
                    padding: 10,
                    borderRadius: 8,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: item.sender === currentUserId ? '#fff' : '#000',
                      fontSize: 16,
                    }}
                  >
                    {item.message}
                  </Text>
                  <Text
                    style={{
                      color: item.sender === currentUserId ? '#dfe4ea' : '#333',
                      fontSize: 14,
                      alignSelf: 'flex-end',
                    }}
                  >
                    {item.time && typeof item.time.toDate === 'function'
                      ? item.time.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : item.time instanceof Date
                        ? item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : ''}
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}
        />}
        {/* Message Input */}
        <View style={{ paddingVertical: 10 }}>
          <View style={styles.messageInputView}>
            <TextInput
              defaultValue={inputMessage}
              style={styles.messageInput}
              placeholder='Message'
              onChangeText={(text) => setInputMessage(text)}

            />
            <TouchableOpacity
              style={styles.messageSendView}
              onPress={sendMessageToFirebase}
              disabled={isSending}
            >
              <HStack space={3}>
                <MaterialCommunityIcons name="ruler" size={18} />
                <MaterialCommunityIcons name="send" size={18} onPress={sendMessageToFirebase} />
              </HStack>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2ff',
  },
  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#272838',
    paddingHorizontal: 10,
    height: 50,
  },
  appbarTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  icon: {
    color: '#fff',
  },
  messageInputView: {
    display: 'flex',
    flexDirection: 'row',
    marginHorizontal: 14,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  messageInput: {
    height: 40,
    flex: 1,
    paddingHorizontal: 10,
  },
  messageSendView: {
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
});

export default ChatScreen;
