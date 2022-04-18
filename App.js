import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {
    StatusBar,
    SafeAreaView,
    Alert,
    Button,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    View,
    Pressable,
    Modal,
    TouchableOpacity,
    Image
} from "react-native";
import * as FileSystem from 'expo-file-system';
import {useNavigation} from '@react-navigation/native';
import {Camera} from 'expo-camera';
import MapView, {Marker} from "react-native-maps";
import * as Location from 'expo-location';
import * as SQLite from "expo-sqlite";
import async from "async";

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
        height: Dimensions.get('screen').height - 200,
    },
    container: {
        justifyContent: 'center',
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
        marginTop: 30,
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
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    buttonOpen: {
        backgroundColor: '#F194FF',
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    item: {
        padding: 10,
        fontSize: 18,
        height: 44,
    },
    camera: {
        flex: 1,
    },
    logo: {
        width: 66,
        height: 58,
    }, containerFlat: {
        flex: 1,
        marginTop: StatusBar.currentHeight || 0,
    },
    itemFlat: {
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    titleFlat: {
        fontSize: 32,
    },
});
const db = SQLite.openDatabase("db7.db");

function HomeScreen({navigation}) {
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>Pantalla Home</Text>
            <Button
                title="Anar a Mapes"
                onPress={() => navigation.navigate('Mapa')}
            />
            <Button
                title="Listar Markers"
                onPress={() => navigation.navigate('ListarMarkers')}
            />
        </View>
    );
}

function Camara({route}) {
    const {itemId} = route.params;
    let camera;
    const [hasPermission, setHasPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);

    const [foto, setfoto] = useState({});

    useEffect(() => {
        (async () => {
            const {status} = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);


    async function ferFoto() {
        try {
            const data = await camera.takePictureAsync();
            setfoto(data.uri);
            // this.props.updateImage(data.uri);
            console.log('Path to image: ' + JSON.stringify(data));

            // 1. Check if "photos" directory exists, if not, create it
            const USER_PHOTO_DIR = FileSystem.documentDirectory + 'photos';
            const folderInfo = await FileSystem.getInfoAsync(USER_PHOTO_DIR);
            if (!folderInfo.exists) {
                await FileSystem.makeDirectoryAsync(USER_PHOTO_DIR);
            }

            // 2. Rename the image and define its new uri
            const imageName = `${Date.now()}.jpg`;
            const NEW_PHOTO_URI = `${USER_PHOTO_DIR}/${imageName}`;

            // 3. Copy image to new location
            await FileSystem.copyAsync({
                from: data.uri,
                to: NEW_PHOTO_URI
            })
                .then(() => {
                    console.log(`File ${data.uri} was saved as ${NEW_PHOTO_URI}`);
                    console.log("ItemID: " + itemId);
                    db.transaction(
                        tx => {
                            tx.executeSql("update markers set imatge = ? where id = ?;", [NEW_PHOTO_URI, itemId], (_, {rows}) => {
                                console.log("Salida" + JSON.stringify(rows));
                            }, (t, error) => {
                                console.log("Error quert 1 " + error);
                            });
                        }
                    );
                    db.transaction(
                        tx => {
                            tx.executeSql("select * from markers where id = ?", [itemId], (_, {rows}) => {
                                console.log("Salida" + JSON.stringify(rows));
                            }, (t, error) => {
                                console.log(error);
                            })
                        }
                    );

                })
                .catch(error => {
                    console.error(error)
                })


        } catch (err) {
            console.log('err: ', err);
        }

    }

    if (hasPermission === null) {
        return <View/>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }
    return (
        <View style={styles.container}>
            <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={ferFoto}>
                <Text style={styles.textStyle}>Fer foto</Text>
            </Pressable>
            <Camera style={styles.camera} type={type} ref={(r) => {
                camera = r
            }}>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            setType(
                                type === Camera.Constants.Type.back
                                    ? Camera.Constants.Type.front
                                    : Camera.Constants.Type.back
                            );
                        }}>
                        <Text style={styles.text}> Flip </Text>
                    </TouchableOpacity>
                </View>
            </Camera>
        </View>
    );

}

function ListarMarkers() {
    const navigation = useNavigation();
    const [items, setItems] = useState([]);
    const [item, setItem] = useState({});

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                `select * from markers;`,
                [],
                (_, {rows: {_array}}) => setItems(_array)
            );
        });
    }, []);

    const Item = ({title}) => (
        <View style={styles.itemFlat}>
            <Text style={styles.titleFlat}>{title}</Text>
        </View>
    );

    const renderItem = ({item}) => <Item title={item.titleFlat}/>;
    const getItem = (item) => {
        //Function for click on an item
        alert('Id : ' + item.id + ' Value : ' + item.Descripcion);
    };
    const [modalVisible, setModalVisible] = useState(false);

    console.log(item['imatge']);

    return (
        <SafeAreaView style={styles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    setModalVisible(!modalVisible);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>{item['Title']}</Text>
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}>
                            <Text style={styles.textStyle}>Hide Modal</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                        >
                            <Text style={styles.textStyle}>Pantalla Home</Text>
                        </Pressable>
                        <Image
                            style={styles.logo}
                            source={{
                                uri: item['imatge'],
                            }}
                        ></Image>r

                    </View>
                </View>
            </Modal>
            <FlatList keyExtractor={(item) => item.id.toString()} data={items}
                      renderItem={({item}) => (<Text style={styles.todo} onPress={function () {
                          setModalVisible(true);
                          setItem(item);
                      }}>{item.Title}</Text>)}/>
        </SafeAreaView>
    );
}

function Mapa() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                `select * from markers;`,
                [],
                (_, {rows: {_array}}) => setItems(_array)
            );
        });
    }, []);

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


    console.log('Inicial');
    /*
    db.transaction(
        tx => {
            tx.executeSql("select * from markers", [], (_, {rows}) => {
                let resuttado = rows['_array'];
                console.log(resuttado);
                setCount(resuttado);
                console.log("Salida" + JSON.stringify(rows));
            }, (t, error) => {
                console.log(error);
            })
        }
    );*/
    /*
        function actualizarPunto(e){
            db.transaction(
                tx => {
                    tx.executeSql("UPDATE table\n" +
                        "SET latitude = ?,\n"+
                        "SET Longitude = ?,\n"+
                        "WHERE\n" +
                        "    search_condition ", [], (_, {rows}) => {
                        let resuttado = rows['_array'];
                        console.log(resuttado);
                        setCount(resuttado);
                        console.log("Salida" + JSON.stringify(rows));
                    }, (t, error) => {
                        console.log(error);
                    })
                }
            );*/


    console.log('Haz esto');
    console.log("Pd4ro");
    return (
        <View style={styles.container}>
            <MapView style={styles.mapStyle}
                     showsMyLocationButton={true}
                     showsUserLocation={true}>
                {items.map(dealer => (
                    <MapView.Marker
                        key={dealer["id"]}
                        coordinate={{
                            latitude: dealer["latitude"],
                            longitude: dealer["Longitude"],
                        }}
                        draggable
                        title={dealer["Title"]}
                        description={dealer["Descripcion"]}
                    />
                ))}
                {items.map((dealer,index,elarray) => (
                    <MapView.Polyline
                        key={dealer["id"]+40}
                        coordinates={[
                            { latitude: dealer["latitude"], longitude:dealer["Longitude"] },
                            { latitude: index+1 < elarray.length ? elarray[index]["latitude"] : elarray[index-1]["latitude"]   , longitude:index+1 < elarray.length ? elarray[index]["Longitude"] : elarray[index-1]["Longitude"] },

                        ]}
                        strokeColor="#000" // fallback for when strokeColors is not supported by the map-provider
                        strokeColors={[
                            '#7F0000',
                            '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
                            '#B24112',
                            '#E5845C',
                            '#238C23',
                            '#7F0000'
                        ]}
                        strokeWidth={6}
                    />
                ))}
            </MapView>
        </View>

    )
        ;


}


const Stack = createStackNavigator();

function App() {


    const db = SQLite.openDatabase("db7.db");


    db.transaction(tx => {
        tx.executeSql(
            "create table if not exists markers (id integer primary key not null, " +
            "Title text, " +
            "Descripcion text," +
            "latitude real," +
            "Longitude real," +
            "imatge text" +
            ");"
            , [], (_, {rows}) => {
                console.log("Salida" + JSON.stringify(rows));
            }, (t, error) => {
                console.log("Error tabla " + error);
            });
    });
    console.log('creada taula');
    let markets = [
        [1, "Valle de los Caídos", "Basílica coronada per una imponent creu i monument commemoratiu a les víctimes de la Guerra Civil Espanyola.", 40.64195589822379, -4.155351952229576],
        [2, "La Pedrera-Casa Milà", "Edifici modernista de Gaudí amb una façana inspirada en les pedreres, exposicions i concerts.", 41.395473027908075, 2.1618809404027193],
        [3, "La Sagrada Família", "Famosa església inacabada d'Antoni Gaudí, de la dècada del 1880, amb museu i vistes a la ciutat.", 41.40369425818602, 2.1743665269083627],
        [4, "Parc Güell", "Edificis, escales i escultures amb mosaics en un parc verd amb el museu de Gaudí i vistes panoràmiques.", 41.41438495980166, 2.1526904381285092],
        [5, "Casa Batlló", "Edifici dissenyat per Gaudí amb terrat, una façana fantàstica que simula les corbes d'un drac i un museu.", 41.39180595040718, 2.1649461459407413],
        [6, "Camp Nou", "Recinte esportiu del F.C. Barcelona amb partits regulars, visites guiades per l'estadi i un museu.", 41.38088792908358, 2.1228197980727304],
        [7, "Palau de la Música Catalana", "Sala de concerts modernista famosa per la seva elaborada façana i pel seu opulent auditori amb claraboia.", 41.38763152474144, 2.175312798072865],
        [8, "Gran Teatre del Liceu", "Teatre històric amb un opulent interior on es fan òperes, concerts i espectacles de dansa.", 41.380221030074516, 2.1732733404024116]];
    db.transaction(
        tx => {
            tx.executeSql("insert into markers (id,Title,Descripcion,latitude,Longitude) values (?,?,?,?,?)", markets[0], (_, {rows}) => {
                console.log("Salida" + JSON.stringify(rows));
            }, (t, error) => {
                console.log("Error quert 1 " + error);
            });
            tx.executeSql("insert into markers (id,Title,Descripcion,latitude,Longitude) values (?,?,?,?,?)", markets[1], (_, {rows}) => {
                console.log("Salida" + JSON.stringify(rows));
            }, (t, error) => {
                console.log("Error quert 2 " + error);
            });
            tx.executeSql("insert into markers (id,Title,Descripcion,latitude,Longitude) values (?,?,?,?,?)", markets[2], (_, {rows}) => {
                console.log("Salida" + JSON.stringify(rows));
            }, (t, error) => {
                console.log("Error quert 2 " + error);
            });
            tx.executeSql("insert into markers (id,Title,Descripcion,latitude,Longitude) values (?,?,?,?,?)", markets[3], (_, {rows}) => {
                console.log("Salida" + JSON.stringify(rows));
            }, (t, error) => {
                console.log("Error quert 2 " + error);
            });
            tx.executeSql("insert into markers (id,Title,Descripcion,latitude,Longitude) values (?,?,?,?,?)", markets[4], (_, {rows}) => {
                console.log("Salida" + JSON.stringify(rows));
            }, (t, error) => {
                console.log("Error quert 2 " + error);
            });
            tx.executeSql("insert into markers (id,Title,Descripcion,latitude,Longitude) values (?,?,?,?,?)", markets[5], (_, {rows}) => {
                console.log("Salida" + JSON.stringify(rows));
            }, (t, error) => {
                console.log("Error quert 2 " + error);
            });
            tx.executeSql("insert into markers (id,Title,Descripcion,latitude,Longitude) values (?,?,?,?,?)", markets[6], (_, {rows}) => {
                console.log("Salida" + JSON.stringify(rows));
            }, (t, error) => {
                console.log("Error quert 2 " + error);
            });
            tx.executeSql("insert into markers (id,Title,Descripcion,latitude,Longitude) values (?,?,?,?,?)", markets[7], (_, {rows}) => {
                console.log("Salida" + JSON.stringify(rows));
            }, (t, error) => {
                console.log("Error quert 2 " + error);
            });
        }
    );
    db.transaction(
        tx => {
            tx.executeSql("select * from markers", [], (_, {rows}) => {
                console.log("Salida" + JSON.stringify(rows));
            }, (t, error) => {
                console.log(error);
            })
        }
    );


    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Inicio">
                <Stack.Screen name="Inicio" component={HomeScreen}/>
                <Stack.Screen name="Mapa" component={Mapa}/>
                <Stack.Screen name="ListarMarkers" component={ListarMarkers}/>
                <Stack.Screen name="Camara" component={Camara}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;
