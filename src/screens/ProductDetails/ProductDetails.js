import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView,TouchableOpacity } from 'react-native';

const ProductDetails = ({ route,navigation }) => {
    const { product } = route.params || { product: null };
  

  if (!product) {
    // Handle the case where the product is not available
    return (
      <View>
        <Text>No product details available.</Text>
      </View>
    );
  }

  const handleOrderNow = () => {
    // Navigate to the ChatScreen and pass the product details as params
    navigation.navigate('ChatScreen', { product });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image.uri }} style={styles.productImage} />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productDescription}>{product.description}</Text>
        <Text style={styles.productPrice}>$ {product.price}</Text>
        <TouchableOpacity style={styles.orderNowButton} onPress={handleOrderNow}>
          <Text style={styles.orderNowButtonText}>Order Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    height: 300,
  },
  productImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#327ba8',
    marginBottom: 20,
  },
  orderNowButton: {
    backgroundColor: '#327ba8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  orderNowButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ProductDetails;