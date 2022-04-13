import React from 'react';
import { StyleSheet, Button, Text, View } from 'react-native';


const estils = StyleSheet.create({
    contenidor: {
        flex: 1,
        backgroundColor: '#0f0'
    }
});

export class Home extends React.Component {


    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Pantalla Home</Text>
                <Button
                    title="Anar a Mapes"
                    onPress={() => this.props.navigation.navigate('Mapa')}
                />
            </View>
        );

    }
}