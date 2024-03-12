import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { Avatar, Box, Center, HStack, Heading, Icon, Pressable, Spacer, Text, VStack } from '@gluestack-ui/themed-native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { SwipeListView } from 'react-native-swipe-list-view';
import { FIREBASE_DB } from '../../services/FirebaseConfig';

const Inbox = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [isTailorUser, setIsTailor] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const userIdFromStorage = await AsyncStorage.getItem('userID');
        setCurrentUserId(userIdFromStorage);

        const conversationsCollection = collection(FIREBASE_DB, 'conversations');

        onSnapshot(conversationsCollection, (snapshot) => {
          const conversationsData = snapshot.docs.map((doc) => {
            const data = doc.data();

            const latestMessage = data.messages[data.messages.length - 1];
            const latestMessageTime = latestMessage ? latestMessage.time : '';
            if (data.participants.some(participant => participant.id === userIdFromStorage)) {
              const isTailorUser = data.participants[1].id === userIdFromStorage;
              setIsTailor(isTailorUser);

              return {
                conversationId: doc.id,
                shop: data.shop,
                recentText: latestMessage ? latestMessage.message : '',
                latestMessageTime: latestMessageTime,
                avatar: data.avatar,
                participants: data.participants,
                product: data.product,
              };
            }


            return null;
          });

          const filteredConversations = conversationsData.filter(Boolean);

          setConversations(filteredConversations);
        });
      } catch (error) {
        console.error('Error fetching conversations:', error.message);
      }
    };

    fetchConversations();
  }, []);

  const deleteRow = async (conversationId) => {
    try {
      const conversationDocRef = doc(FIREBASE_DB, 'conversations', conversationId);
      await deleteDoc(conversationDocRef);
      console.log(`Deleted conversation with ID: ${conversationId}`);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };


  const renderItem = ({ item, index }) => (
    <Box>
      <Pressable onPress={() => navigation.navigate('ChatScreen', { conversationId: item.conversationId })} _dark={{ bg: 'coolGray.800' }} _light={{ bg: 'white' }}>
        <Box pl="4" pr="5" py="2">
          <HStack alignItems="center" space={3}>
            <Avatar size="48px" source={{ uri: item.avatar || 'https://www.kare-design.com/wp-content/uploads/2015/08/2.jpg' }} />
            <VStack>
              <Text color="coolGray.800" _dark={{ color: 'warmGray.50' }} bold>
                {isTailorUser
                  ? `${item.participants[0].name} - Order: ${item.product.productName}`
                  : item.shop || 'Unknown Shop'}
              </Text>
              <Text color="coolGray.600" _dark={{ color: 'warmGray.200' }}>
                {item.recentText}
              </Text>
            </VStack>
            <Spacer />
            <Text fontSize="xs" color="coolGray.800" _dark={{ color: 'warmGray.50' }} alignSelf="flex-start">
              {item.latestMessageTime && item.latestMessageTime.toDate ? item.latestMessageTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>
          </HStack>
        </Box>
      </Pressable>
    </Box>
  );
  const renderHiddenItem = (data, rowMap) => (
    <HStack flex="1" pl="2">
      <Pressable w="70" ml="auto" cursor="pointer" bg="coolGray.200" justifyContent="center" onPress={() => closeRow(rowMap, data.item.key)} _pressed={{ opacity: 0.5 }}>
        <VStack alignItems="center" space={2}>
          <Icon as={<Entypo name="dots-three-horizontal" />} size="xs" color="coolGray.800" />
          <Text fontSize="xs" fontWeight="medium" color="coolGray.800">
            More
          </Text>
        </VStack>
      </Pressable>
      <Pressable w="70" cursor="pointer" bg="red.500" justifyContent="center" onPress={() => deleteRow(data.item.conversationId)} _pressed={{ opacity: 0.5 }}>
        <VStack alignItems="center" space={2}>
          <Icon as={<MaterialIcons name="delete" />} color="white" size="xs" />
          <Text color="white" fontSize="xs" fontWeight="medium">
            Delete
          </Text>
        </VStack>
      </Pressable>
    </HStack>
  );

  return (
    <Center flex={1}>
      <Box
        _dark={{
          bg: 'coolGray.800',
        }}
        _light={{
          bg: 'white',
        }}
        flex="1"
        safeAreaTop
        maxW="400px"
        w="100%"
      >
        <Heading p="4" pb="3" size="lg">
          Inbox
        </Heading>
        <SwipeListView
          data={conversations}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-130}
          previewRowKey={'0'}
          previewOpenValue={-40}
          previewOpenDelay={3000}

        />
      </Box>
    </Center>
  );
};

export default Inbox;