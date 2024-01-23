import React, { useState, useEffect } from 'react';
import { ScrollView, Text, StyleSheet, Modal as RNModal, View, TextInput, TouchableOpacity } from 'react-native';
import { Badge, Box, HStack, Image, VStack, IconButton, Heading, Button as NButton, AspectRatio, Stack, Alert } from 'native-base';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { launchImageLibrary } from 'react-native-image-picker';
import { doc, getDoc, updateDoc,collection,addDoc,getDocs,query,where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_DB } from '../../services/FirebaseConfig';


const Shop = ({ navigation }) => {
  const [isTailor, setIsTailor] = useState(false);
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] = useState(false);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [isProductEditModalVisible, setIsProductEditModalVisible] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    image: null,
  });
  const [tailorDetails, setTailorDetails] = useState({
    shop: '',
    description: '',
    workEmail: '',
    workPhone: '',
    specialties: [],
    products: [],
  });
  const [editingProductIndex, setEditingProductIndex] = useState(null);

  useEffect(() => {
    const fetchTailorDetails = async () => {
      try {
        const userId = await AsyncStorage.getItem('userID');
        if (userId) {
          const userDocRef = doc(FIREBASE_DB, 'users', userId);
          const userDoc = await getDoc(userDocRef);
  
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === 'tailor') {
              setIsTailor(true);
              setTailorDetails({
                shop: userData.shop || '',
                description: userData.description || '',
                workEmail: userData.workEmail || '',
                workPhone: userData.workPhone || '',
                specialties: userData.specialties || [],
                products: userData.products || [],
              });
  
              // Fetch products from the "products" collection
              const productsCollection = collection(FIREBASE_DB, 'products');
              const productsSnapshot = await getDocs(query(productsCollection, where('userId', '==', userId)));
              const productsData = productsSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  
              setTailorDetails((prevDetails) => ({
                ...prevDetails,
                products: productsData,
              }));
            } else {
              // Show alert if the user is not a tailor
              Alert.alert('Not a Tailor', 'You are not set as a tailor. Set up your shop to proceed.');
            }
          }
        }
      } catch (error) {
        console.error('Error fetching tailor details:', error.message);
      }
    };
  
    fetchTailorDetails();
  }, []);

  const pickImage = async () => {
    try {
      const options = {
        mediaType: 'photo',
        includeBase64: false,
        quality: 0.8,
      };

      const result = await launchImageLibrary(options);

      if (!result.didCancel) {
        setNewProduct((prevProduct) => ({
          ...prevProduct,
          image: { uri: result.assets[0].uri },
        }));
      }
    } catch (error) {
      console.error('Error selecting or compressing the image:', error.message);
    }
  };


  const handleEditDetails = async () => {
    try {
      const userId = await AsyncStorage.getItem('userID');
      const userDocRef = doc(FIREBASE_DB, 'users', userId);

      await updateDoc(userDocRef, {
        shop: tailorDetails.shop,
        description: tailorDetails.description,
        specialties: tailorDetails.specialties,
        workEmail: tailorDetails.workEmail,
        workPhone: tailorDetails.workPhone,
        role: 'tailor',
      });

      setIsDescriptionModalVisible(false);
    } catch (error) {
      console.error('Error updating tailor details:', error.message);
    }
  };

  const handleAddProduct = async () => {
    try {
      const userId = await AsyncStorage.getItem('userID');
      const productsCollection = collection(FIREBASE_DB, 'products');
  
      const uniqueIdentifier = `${newProduct.name}_${Date.now()}`;
  
      let productData = {
        userId: userId,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        image: null, // Set the default value to null
      };
  
      if (newProduct.image) {
        const storage = getStorage();
        const storageRef = ref(storage, `product_images/${uniqueIdentifier}`);
        const response = await fetch(newProduct.image.uri);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
  
        const downloadURL = await getDownloadURL(storageRef);
  
        productData.image = { uri: downloadURL, name: uniqueIdentifier };
        setNewProduct((prevProduct) => ({
          ...prevProduct,
          image: { uri: downloadURL, name: uniqueIdentifier },
        }));
      }
  
      // Add a new product to the 'products' collection
      const productRef = await addDoc(productsCollection, productData);
  
      // Update tailor's products array
      await updateDoc(doc(FIREBASE_DB, 'users', userId), {
        products: [...tailorDetails.products, productRef.id],
      });
  
      // Refresh tailor details
      await fetchTailorDetails();
  
      setIsProductModalVisible(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        image: null,
        userId: '',
      });
    } catch (error) {
      console.error('Error adding product:', error.message);
    }
  };

  const handleEditProduct = (index) => {
    setEditingProductIndex(index);
    const productToEdit = tailorDetails.products[index];

    setNewProduct({
      name: productToEdit.name,
      description: productToEdit.description,
      price: productToEdit.price,
      image: productToEdit.image || null,
    });

    setIsProductEditModalVisible(true);
  };

  const handleUpdateProduct = async () => {
    try {
      const userId = await AsyncStorage.getItem('userID');
      const productsCollection = collection(FIREBASE_DB, 'products');
  
      // Assuming 'products' is an array property in your tailor details
      const updatedProducts = [...tailorDetails.products];
      // Update the product at the specified index
      updatedProducts[editingProductIndex] = newProduct;
  
      // Create a unique identifier for the image
      const uniqueIdentifier = `${newProduct.name}_${Date.now()}`;
  
      // Check if the image property exists in newProduct
      if (newProduct.image) {
        const storage = getStorage();
        const storageRef = ref(storage, `product_images/${uniqueIdentifier}`);
        const response = await fetch(newProduct.image.uri);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
  
        // Get the download URL of the uploaded image
        const downloadURL = await getDownloadURL(storageRef);
  
        // Update the newProduct state with the download URL and unique identifier
        setNewProduct((prevProduct) => ({
          ...prevProduct,
          image: { uri: downloadURL, name: uniqueIdentifier },
        }));
      }
  
      // Update the product document
      await updateDoc(doc(productsCollection, tailorDetails.products[editingProductIndex].id), {
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
        image: newProduct.image ? { uri: newProduct.image.uri, name: uniqueIdentifier } : null,
        userId: userId, // Update userId in the product data
      });
  
      // Reset the editingProductIndex
      setEditingProductIndex(null);
  
      setIsProductEditModalVisible(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        image: null,
        userId : ''
      });
    } catch (error) {
      console.error('Error updating product details:', error.message);
    }
  };
  
  
  const fetchTailorDetails = async () => {
    try {
      const userId = await AsyncStorage.getItem('userID');
      if (userId) {
        const userDocRef = doc(FIREBASE_DB, 'users', userId);
        const userDoc = await getDoc(userDocRef);
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === 'tailor') {
            setIsTailor(true);
            const newTailorDetails = {
              shop: userData.shop || '',
              description: userData.description || '',
              workEmail: userData.workEmail || '',
              workPhone: userData.workPhone || '',
              specialties: userData.specialties || [],
              products: [],
            };
  
            // Fetch and set products based on product IDs stored in the user's document
            const productsSnapshot = await getDocs(collection(FIREBASE_DB, 'products'));
            const userProducts = userData.products || [];
  
            const userProductsData = userProducts.map((productId) => {
              const productData = productsSnapshot.docs.find((doc) => doc.id === productId)?.data();
              return productData ? { ...productData, id: productId } : null;
            });
  
            newTailorDetails.products = [...tailorDetails.products, ...userProductsData.filter(Boolean)];
  
            setTailorDetails(newTailorDetails);
          } else {
            Alert.alert('Not a Tailor', 'You are not set as a tailor. Set up your shop to proceed.');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching tailor details:', error.message);
    }
  };


  return (
    <ScrollView style={styles.container}>
      <HStack my={3} space={4} justifyContent="space-between">
        <Heading>{isTailor ? tailorDetails.shop : 'My Shop'}</Heading>
        <Heading size="lg"></Heading>
        <TouchableOpacity>
          <MaterialCommunityIcons
            name="account-circle-outline"
            onPress={() => navigation.navigate('UserProfile')}
            style={styles.iconButton}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </HStack>

      <HStack space={30}>
        <Heading size="md" my={2}>
          Description
        </Heading>
        <MaterialCommunityIcons
          name="pencil-outline"
          size={25}
          color="black"
          onPress={() => setIsDescriptionModalVisible(true)}
        />
      </HStack>
      <Text style={styles.bioText}>
        {isTailor ? tailorDetails.description : 'Welcome to our shop! We provide high-quality products to meet your needs. Explore our specialties and discover our featured products.'}
      </Text>
      <HStack space={10}>
        <MaterialCommunityIcons
          name="phone"
          size={25}
          color="black"
          onPress={() => setIsProductModalVisible(true)}
        />
        <Text style={styles.bioText}>
          {isTailor ? tailorDetails.workPhone : '+2540000000'}
        </Text>
      </HStack>
      <HStack space={10}>
        <MaterialCommunityIcons
          name="email"
          size={25}
          color="black"
          onPress={() => setIsDescriptionModalVisible(true)}
        />
        <Text style={styles.bioText}>
          {isTailor ? tailorDetails.workEmail : 'work@email.com'}
        </Text>
      </HStack>

      <HStack space={2} mt={4}>
        {isTailor
          ? tailorDetails.specialties.map((specialty, index) => (
            <Badge key={index} colorScheme="info" borderRadius={8}>
              {specialty}
            </Badge>
          ))
          : null}
      </HStack>

      <VStack space={2} mt={4}>
        <HStack space={4} justifyContent="space-between">
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={25}
            color="black"
            onPress={() => setIsProductModalVisible(true)}
          />
        </HStack>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tailorDetails.products.map((product, index) => (
            <Box key={index} alignItems="center" maxWidth={240} rounded="lg" overflow="hidden" borderColor="coolGray.200" borderWidth={1} _dark={{ borderColor: "coolGray.600", backgroundColor: "gray.700" }} _web={{ shadow: 2, borderWidth: 0 }} _light={{ backgroundColor: "gray.50" }} marginX={2}>
              <Box>
                <AspectRatio w="100%" ratio={16 / 9}>
                  <Image source={product.image ? { uri: product.image.uri } : { uri: "https://www.holidify.com/images/cmsuploads/compressed/Bangalore_citycover_20190613234056.jpg" }} alt="image" resizeMode="contain"/>
                </AspectRatio>

              </Box>
              <Stack p={4} space={3}>
                <Stack space={2}>
                  <Heading size="md" ml={-1}>
                    {product.name}
                  </Heading>
                  <Text fontSize="xs" fontWeight="500" ml={-0.5} mt={-1}>
                    Price: {product.price}
                  </Text>
                </Stack>
                <Text fontWeight="400">
                  {product.description}
                </Text>
                <NButton alignItems="center" onPress={() => handleEditProduct(index)}>
                  <HStack alignItems="center" space={4} >
                    <MaterialCommunityIcons
                      name="pencil"
                      size={25}
                      color="black"
                      onPress={() => setIsProductModalVisible(true)}
                    />
                    <Text color="coolGray.600" _dark={{ color: "warmGray.200" }} fontWeight="400">
                      Edit details
                    </Text>
                  </HStack>
                </NButton>
              </Stack>
            </Box>
          ))}
          {isDescriptionModalVisible && (
            <RNModal
              animationType="slide"
              transparent={true}
              visible={isDescriptionModalVisible}
              onRequestClose={() => setIsDescriptionModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Heading>Shop Details</Heading>

                  {/* Shop Description Input */}
                  <Text style={styles.modalText}>Shop Name</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter shop name"
                    value={tailorDetails.shop}
                    onChangeText={(text) => setTailorDetails({ ...tailorDetails, shop: text })}
                  />
                  <Text style={styles.modalText}>Shop description</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter shop description"
                    value={tailorDetails.description}
                    onChangeText={(text) => setTailorDetails({ ...tailorDetails, description: text })}
                  />

                  <Text style={styles.modalText}>Shop Email</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter shop Email"
                    value={tailorDetails.workEmail}
                    onChangeText={(text) => setTailorDetails({ ...tailorDetails, workEmail: text })}
                  />
                  <Text style={styles.modalText}>Shop Phone</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter shop phone"
                    value={tailorDetails.workPhone}
                    onChangeText={(text) => setTailorDetails({ ...tailorDetails, workPhone: text })}
                  />
                  {/* Tailor Specialties Input */}
                  <Text style={styles.modalText}>Specialties</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter tailor specialties (comma-separated)"
                    value={tailorDetails.specialties.join(',')}
                    onChangeText={(text) => setTailorDetails({ ...tailorDetails, specialties: text.split(',') })}
                  />

                  {/* Save and Cancel Buttons */}
                  <View style={styles.modalButtons}>
                    <NButton size="md" variant="subtle" onPress={handleEditDetails}  >
                      SAVE
                    </NButton>
                    <NButton size="md" variant="subtle" colorScheme="secondary" onPress={() => setIsDescriptionModalVisible(false)}>
                      CANCEL
                    </NButton>
                  </View>
                </View>
              </View>
            </RNModal>
          )}

          {/* Modal for adding product */}
          {isProductModalVisible && (
            <RNModal
              animationType="slide"
              transparent={true}
              visible={isProductModalVisible}
              onRequestClose={() => setIsProductModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Heading>Add Product</Heading>

                  <Text style={styles.modalText}>Product Name</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter product name"
                    value={newProduct.name}
                    onChangeText={(text) => setNewProduct((prevProduct) => ({ ...prevProduct, name: text }))}
                  />

                  <Text style={styles.modalText}>Product Description</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter product description"
                    value={newProduct.description}
                    onChangeText={(text) => setNewProduct((prevProduct) => ({ ...prevProduct, description: text }))}
                  />

                  <Text style={styles.modalText}>Product Price</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter product price"
                    value={newProduct.price.toString()}
                    onChangeText={(text) => setNewProduct((prevProduct) => ({ ...prevProduct, price: parseFloat(text) || 0 }))}
                    keyboardType="numeric"
                  />

                  <Text style={styles.modalText}>Product Image</Text>
                  {newProduct.image && (
                    <Image
                      source={{ uri: newProduct.image.uri }}
                      alt="image"
                      style={{ width: 200, height: 120, marginBottom: 10 }}
                      resizeMode="contain"  // Add this line to set resizeMode to 'contain'
                    />
                  )}

                  <NButton alignItems="center" onPress={pickImage}>
                    <HStack alignItems="center" space={4}>
                      <MaterialCommunityIcons name="image" size={25} color="black" />
                      <Text color="coolGray.600" _dark={{ color: "warmGray.200" }} fontWeight="400">
                        Add Image
                      </Text>
                    </HStack>
                  </NButton>
                  <View style={styles.modalButtons}>
                    <NButton size="md" variant="subtle" onPress={handleAddProduct} marginX={3}>
                      ADD PRODUCT
                    </NButton>
                    <NButton size="md" variant="subtle" colorScheme="secondary" onPress={() => setIsProductModalVisible(false)} marginX={3}>
                      CANCEL
                    </NButton>
                  </View>
                </View>
              </View>
            </RNModal>
          )}


        </ScrollView>
      </VStack>
      {isProductEditModalVisible && (
        <RNModal
          animationType="slide"
          transparent={true}
          visible={isProductEditModalVisible}
          onRequestClose={() => setIsProductEditModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Heading>Edit Product Details</Heading>

              <Text style={styles.modalText}>Product Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter product name"
                value={newProduct.name}
                onChangeText={(text) => setNewProduct((prevProduct) => ({ ...prevProduct, name: text }))}
              />

              <Text style={styles.modalText}>Product Description</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter product description"
                value={newProduct.description}
                onChangeText={(text) => setNewProduct((prevProduct) => ({ ...prevProduct, description: text }))}
              />

              <Text style={styles.modalText}>Product Price</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter product price"
                value={newProduct.price.toString()}
                onChangeText={(text) => setNewProduct((prevProduct) => ({ ...prevProduct, price: parseFloat(text) || 0 }))}
                keyboardType="numeric"
              />

              <Text style={styles.modalText}>Product Image</Text>
              {newProduct.image && (
                <Image
                  source={{ uri: newProduct.image.uri }}
                  alt="image"
                  style={{ width: 200, height: 120, marginBottom: 10 }}
                  resizeMode="contain"  // Add this line to set resizeMode to 'contain'
                />
              )}
              <NButton alignItems="center" onPress={pickImage}>
                <HStack alignItems="center" space={4}>
                  <MaterialCommunityIcons name="image" size={25} color="black" />
                  <Text color="coolGray.600" _dark={{ color: "warmGray.200" }} fontWeight="400">
                    Add Image
                  </Text>
                </HStack>
              </NButton>
              <View style={styles.modalButtons}>
                <NButton size="md" variant="subtle" onPress={handleUpdateProduct} marginX={3}>
                  UPDATE PRODUCT
                </NButton>
                <NButton size="md" variant="subtle" colorScheme="secondary" onPress={() => setIsProductEditModalVisible(false)} marginX={3}>
                  CANCEL
                </NButton>
              </View>
            </View>
          </View>
        </RNModal>
      )}
      <Box mt={4} mb={8}>
        <IconButton
          icon={<MaterialCommunityIcons name="briefcase-outline" size={32} color="black" />}
          onPress={() => {
            setIsProductModalVisible(true);
          }}
        />
      </Box>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  bioText: {
    fontSize: 16,
    marginBottom: 16,
  },
  modalText: {
    marginVertical: 5,
    color: 'turquoise',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  iconButton: {},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default Shop;
