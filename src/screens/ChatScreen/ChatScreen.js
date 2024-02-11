import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, FlatList, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FIREBASE_DB } from '../../services/FirebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, collection, addDoc, serverTimestamp, onSnapshot,setDoc,query, where, orderBy } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatScreen = ({ route, navigation }) => {
  const { product } = route.params || { product: null };
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [shopName, setShopName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [userIdParticipant, setUserID] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [recipientId, setRecepientId] = useState('');
  const [isSending,setIsSending] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isConversationLoaded, setIsConversationLoaded] = useState(false);


  function getTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
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
        if (route.params && route.params.conversationId) {
          const conversationId = route.params.conversationId;
          setCurrentConversationId(conversationId);
          const conversationDocRef = doc(FIREBASE_DB, 'conversations', conversationId);
  
          const unsubscribe = onSnapshot(conversationDocRef, async (snapshot) => {
            if (snapshot.exists()) {
              const conversationData = snapshot.data();
              const loadedMessages = conversationData.messages || [];
              console.log(loadedMessages)
              if (isConversationLoaded) {
                setMessages(loadedMessages);
              } else {
                // If it's a new conversation, set isConversationLoaded to true
                setIsConversationLoaded(true);
                // Always update the state for the first time
                setMessages(loadedMessages);
              }
          
              const userIdFromStorage = await AsyncStorage.getItem('userID');
              const userIdObject = conversationData.participants.find(participant => participant.id !== userIdFromStorage);
              const userId = userIdObject ? userIdObject.id : null;
              fetchShopName(userId);
              setUserID(userId);
            } else {
              console.error('Conversation document not found');
              // Handle the case when the conversation document doesn't exist
              setMessages([]); // Set messages to an empty array or handle it according to your use case
            }
          });
  
          // Clean up the listener when the component is unmounted
          return () => {
            isMounted = false; // Update the variable when unmounting
            unsubscribe();
          };
        } else if (product) {
          let t = getTime(new Date());
          setMessages([
            {
              sender: 'Seller',
              message: `Product Details:\nName: ${product.name}\nDescription: ${product.description}\nPrice: $${product.price}`,
              time: t,
            },
          ]);
  
          const userId = product.userId;
          fetchShopName(userId);
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    };
  
    fetchConversation();
    return () => {
      isMounted = false; // Update the variable when unmounting
    };
  }, [route.params?.conversationId, product, currentUserId]);

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
        sender,
        recipient: userIdParticipant,
        message: inputMessage,
        time: getTime(new Date()),
      };
  
      setIsSending(true);
  
      if (conversationId) {
        setInputMessage('');
        const conversationDocRef = doc(FIREBASE_DB, 'conversations', conversationId);
        await updateDoc(conversationDocRef, {
          messages: arrayUnion(messageData),
        });
      } else {
        const senderName = await AsyncStorage.getItem('userName');
        const recipientName = recipientId;
  
        const newMessageRef = await addDoc(collection(FIREBASE_DB, 'messages'), { ...messageData, productId: product.productId });
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
        await setDoc(newConversationDocRef, newConversationData);
  
        setCurrentConversationId(newConversationDocRef.id);
      }
  
      // Update the local state with the new message
      setMessages((prevMessages) => [...prevMessages, messageData]);
      setIsSending(false);
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };


  function sendMessage() {
    sendMessageToFirebase();
  }

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
        <FlatList
          style={{ backgroundColor: '#f2f2ff' }}
          data={messages}
          inverted={false}
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
                    {item.time}
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}
        />
        {/* Message Input */}
        <View style={{ paddingVertical: 10 }}>
          <View style={styles.messageInputView}>
            <TextInput
              defaultValue={inputMessage}
              style={styles.messageInput}
              placeholder='Message'
              onChangeText={(text) => setInputMessage(text)}
              onSubmitEditing={() => {
                sendMessage();
              }}
            />
            <TouchableOpacity
              style={styles.messageSendView}
              onPress={() => {
                sendMessage();
              }}
              disabled={isSending}
            >
              <MaterialCommunityIcons name="send" size={18} />
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
