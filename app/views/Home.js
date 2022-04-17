import React from 'react';
import {StyleSheet, Button, Text, View} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

const estils = StyleSheet.create({
    contenidor: {
        flex: 1,
        backgroundColor: '#0f0'
    }
});

function HomeScreen222({ navigation } ) {
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>Pantalla Home</Text>
            <Button
                title="Anar a Mapes"
                onPress={() => navigation.navigate('Mapa')}
            />
        </View>
    );
}
