import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { HStack, Heading, Spinner } from '@gluestack-ui/themed-native-base';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FIREBASE_DB } from '../../services/FirebaseConfig';
import CarouselComponent from './components/CarouselComponent';
import ProductCard from './components/ProductCard';

const HomeScreen = ({ navigation }) => {
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(FIREBASE_DB, "products"));
        const productsData = querySnapshot.docs.map((doc) => ({
          productId: doc.id,
          ...doc.data()
        }));

        setFetchedProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <HStack space={2} justifyContent="center">
          <Spinner accessibilityLabel="Loading posts" size="lg" />
          <Heading color="primary.500" fontSize="md" mt="2">
            Loading Posts
          </Heading>
        </HStack>
      </View>

    );
  }
  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Fashion</Text>
          <Text style={[styles.logoText, { color: '#327ba8' }]}>Fusion.</Text>
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
            <MaterialCommunityIcons name="account-circle-outline" style={styles.iconButton} size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.searchBarContainer}>
        <TextInput placeholder='Search for a product..' style={styles.searchInput} />
        <TouchableOpacity onPress={() => navigation.navigate('DiscoverScreen')}>
          <Feather name="search" size={24} color="grey" />
        </TouchableOpacity>
      </View>

      {/* Banners Carousel */}
      <CarouselComponent />

      {/* Best Sellers Section */}
      <View style={styles.bestSellersContainer}>
        <Text style={styles.h2}>Best Sellers</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {fetchedProducts.map((item, index) => (
            <ProductCard
              key={item.productId || index}  // Use productId if available, otherwise use index
              item={item}
              onPress={() => navigation.navigate('ProductDetails', { product: item })}
              style={(index + 1) % 2 === 0 ? styles.productRow : null}
            />
          ))}
        </ScrollView>
      </View>

      {/* All Products Section */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.productContainer}>
          {fetchedProducts.map((item, index) => (
            <ProductCard
              key={item.productId || index}  // Use productId if available, otherwise use index
              item={item}
              onPress={() => navigation.navigate('ProductDetails', { product: item })}
              style={(index + 1) % 2 === 0 ? styles.productRow : null}
            />
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  logoContainer: {
    flexDirection: 'row',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
  },
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginStart: 8,
  },
  searchBarContainer: {
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
  searchInput: {
    flex: 1,
  },
  bestSellersContainer: {
    marginTop: 50,
    padding: 15,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  productContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  productRow: {
    width: '48%', // Adjust the width as needed, you may want to leave some space for margins
    marginBottom: 15,
  },
});

export default HomeScreen;
