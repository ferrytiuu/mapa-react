import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Alert, Button, Dimensions, StyleSheet, Text, View} from "react-native";
import MapView, {Marker} from "react-native-maps";
import * as Location from 'expo-location';

/**
 * Modificacions al component principal d'entrada de React
 * per incloure encaminaments, però no components
 * @version 1.0 28.03.2020
 * @author sergi.grau@fje.edu
 */
var {height} = Dimensions.get('window');
var box_count = 2;
var box1_height = height * 10 / 100;
var box2_height = height - box1_height;

const styles = StyleSheet.create({
    title: {
        textAlign: 'center',
        marginVertical: 8,
    },
    fixToText: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    separator: {
        marginVertical: 8,
        borderBottomColor: '#737373',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    mapStyle: {
        width: Dimensions.get('screen').width,
        height: box2_height
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        paddingTop: 30,
    },
    box: {},
    box1: {
        height: box1_height,
        backgroundColor: '#2196F3'
    },
    box2: {
        height: box2_height,
        backgroundColor: '#8BC34A'
    },
    box3: {
        backgroundColor: '#e3aa1a'
    }
});

function HomeScreen({navigation}) {
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

function Mapa() {

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        (async () => {
            let {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, []);

    let text = 'Waiting..';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
        console.log(text);
    }

    function exemple() {
        return "hola pdero";

    }

    return (
        <View style={styles.container}>
            <View style={[styles.box, styles.box1]}>
                <Button title="Press me" onPress={() => Alert.alert(exemple())}/>
            </View>
            <View style={[styles.box, styles.box2]}>
                <MapView style={styles.mapStyle}
                         showsMyLocationButton={true}
                         showsUserLocation={true}>

                </MapView></View>
        </View>

    )
        ;
}


const Stack = createStackNavigator();

function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Inicio">
                <Stack.Screen name="Inicio" component={HomeScreen}/>
                <Stack.Screen name="Mapa" component={Mapa}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;
