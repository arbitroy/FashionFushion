import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, FlatList, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import CarouselComponent from './components/CarouselComponent';
import products from '../../data/products';
import ProductCard from './components/ProductCard';
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '../../services/FirebaseConfig';
const HomeScreen = ({ navigation }) => {
  const [fetchedProducts, setFetchedProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(FIREBASE_DB, 'products');
        const querySnapshot = await getDocs(productsCollection);

        const productsData = [];

        querySnapshot.forEach((productDoc) => {
          productsData.push({ productId: productDoc.id, ...productDoc.data() });
        });

        setFetchedProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error.message);
      }
    };

    (async () => {
      await fetchProducts();
    })();
  }, []);
  return (
    <ScrollView style={styles.container}>

      {/* Header Section */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15 }}>
        {/* Replace this with your app logo */}
        <View style={{ flexDirection: 'row', }}><Text style={{ fontSize: 20, fontWeight: '800' }}>Fashion</Text><Text style={{ fontSize: 20, fontWeight: '800', color: '#327ba8' }}>Fushion.</Text></View>

        <View style={{ flexDirection: 'row' }}>
          {/* Account Button */}
          <TouchableOpacity><MaterialCommunityIcons name="account-circle-outline" onPress={() => navigation.navigate('UserProfile')} style={styles.iconButton} size={24} color="black" /></TouchableOpacity>
          {/* Chat Button */}
          {/* <TouchableOpacity><MaterialCommunityIcons name="chat" onPress={() => navigation.navigate('ChatScreen')} style={styles.iconButton} size={24} color="black" /></TouchableOpacity> */}
          {/* Favorites Button */}
          {/* <TouchableOpacity><MaterialCommunityIcons name="cards-heart-outline" style={styles.iconButton} size={24} color="black" /></TouchableOpacity> */}
          {/* Cart Button */}
          {/* <TouchableOpacity><MaterialCommunityIcons name="cart-outline" style={styles.iconButton} size={24} color="black" /></TouchableOpacity> */}
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.SearchBar}>
        <TextInput placeholder='Search for a product..' style={{ flex: 1 }} />
        <TouchableOpacity style={{ flex: 0 }} onPress={() => navigation.navigate('DiscoverScreen')}><Feather name="search" size={24} color="grey" /></TouchableOpacity>
      </View>

      {/* Banners Carousel */}
      <CarouselComponent />

      {/* Best Sellers Section */}
      <View style={styles.bestSellersContainer}>
        <Text style={styles.h2}>Best Sellers</Text>
        <FlatList
          data={fetchedProducts}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              onPress={() => {
                // Handle press action, for example, navigate to product details
                navigation.navigate('ProductDetails', { product: item});
              }}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.productContainer}>
          {fetchedProducts.map((product, index) => (
            <View key={product.id} style={(index + 1) % 2 === 0 ? styles.productRow : null}>
              <ProductCard
                item={product}
                onPress={() => {
                  // Handle press action, for example, navigate to product details
                  navigation.navigate('ProductDetails', { product: product});
                }}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 15,
  },
  iconButton: {
    marginStart: 8,
  },
  SearchBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e7e7e7',
    marginTop: 15,
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 7,
    marginHorizontal: 15,
    marginBottom: 15,
  },
  bestSellersContainer: {
    flexDirection: 'column',
    marginTop: 50,
    padding: 15,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
  },
  TextInputContainer: {
    flexDirection: 'row',
    borderColor: '#c7c7c7',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 25,
    alignItems: 'center',
    padding: 5,
  },

  TextInputText: {
    marginLeft: 25,
    width: '100%',
    verticalAlign: 'middle',
  },

  TextInputIcon: {
    flex: 0,
    color: '#c7c7c7',
  },

  TextButton: {
    alignSelf: 'center',
    color: '#808080',
    textDecorationLine: 'underline',
  },
  thumbnail: {
    width: 144,
    height: 155,
    resizeMode: 'cover',
    borderRadius: 12,
  },
  productContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginLeft: 15
  },
  productRow: {
    width: '48%', // Adjust the width as needed, you may want to leave some space for margins
  },
});

export default HomeScreen