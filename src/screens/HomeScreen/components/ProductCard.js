import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProductCard = ({ item, onPress }) => {
    
    return (
        <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', marginTop: 20, width: 144, marginRight: 18 }}>
            <View>
                {/* Product thumbnail */}
                <Image
                    style={{ width: 144, height: 155, resizeMode: 'cover', borderRadius: 12 }}
                    source={{ uri: (item.thumbnail ?? item.image?.uri) || 'https://www.holidify.com/images/cmsuploads/compressed/Bangalore_citycover_20190613234056.jpg' }}
                />
                {/* Product title */}
                <Text numberOfLines={1} ellipsizeMode="tail" style={{ fontSize: 15, marginTop: 6 }}>{item.title || item.name}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                    {/* Price */}
                    <Text style={{ fontWeight: '700' }}>$ {item.price}</Text>
                    {/* Ratings */}
                    <View style={{ flexDirection: 'row' }}>
                        <MaterialCommunityIcons name="star" size={18} color="#FFBE5B" />
                        <Text style={{ fontWeight: '700' }}>{item.rating || ''}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};
export default ProductCard;
