import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image, Dimensions
} from 'react-native';

import Ico from '../components/Ico';
import GLOBALS from "../constants/globals";
import EStyleSheet from "react-native-extended-stylesheet";
import AsyncStorage from "@react-native-community/async-storage";
import Translation from '../helpers/Translation';

const entireScreenWidth = Dimensions.get('window').width;
EStyleSheet.build({$rem: entireScreenWidth / 380});

let _this;

let checked = {};

export default class FilterMakeChoose extends React.Component {
    constructor(props) {
        super(props);
        _this = this;

        _this.state = {
            makes: {},
            update: false,
            mainColor: '',
            secondColor: ''
        }
    }

    static navigationOptions = ({navigation, navigationOptions}) => {
        return {
            headerStyle: {
                height: 50,
                borderBottomWidth: 0,
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.3,
                shadowRadius: 2,
                elevation: 5,
            },
            headerTitle: (
                <View style={styles.appMainTitle}>
                    <Text style={styles.center}><Translation str='choose_make'/></Text>
                </View>
            ),
            headerLeft: (
                <View>
                    <TouchableOpacity
                        activeOpacity={0.8} style={styles.svgStyle} onPress={() => {
                        navigation.goBack()
                    }}>
                        <Ico icoName='arrow-left1' icoColor={GLOBALS.COLOR.gray88} icoSize={16}/>
                    </TouchableOpacity>
                </View>
            ),
            headerRight: (<View style={styles.invisibleBlock}></View>)
        }
    };

    async componentWillMount () {
        try {
            let mc = await AsyncStorage.getItem('main_color');
            let sc = await AsyncStorage.getItem('secondary_color');

            _this.setState({
                mainColor: mc,
                secondColor: sc
            })
        } catch (e) {
            console.log("error from AsyncStorage Colors: ", e);
        }
        
        _this.setState({
            makes: _this.props.navigation.state.params.makesData
        })
    }

    render() {
        return(
            <View style={styles.container}>
                <FlatList
                    style={styles.flatStyle}
                    data={_this.state.makes}
                    extraData={this.state}
                    renderItem={({item}) =>
                        <TouchableOpacity
                            activeOpacity={0.8} style={(!checked.hasOwnProperty(item.slug)) ? styles.gridItem : [styles.gridBorderItem, {borderColor: _this.state.mainColor}]} onPress={() => {

                            _this.setState({
                                update: true
                            })

                            if(!checked.hasOwnProperty(item.slug)) {
                                checked[item.slug] = item.label;
                            } else {
                                delete checked[item.slug];
                            }
                        }}>
                            <View>
                                <Image style={styles.similarImg} source={{uri: item.logo}}/>
                                <Text style={styles.title}>{item.label}</Text>
                            </View>
                        </TouchableOpacity>
                    }
                    keyExtractor={({item}, index) => index.toString()}
                    numColumns={3}
                />
                <View style={styles.btnWrap}>
                    <TouchableOpacity
                        activeOpacity={0.8} style={[styles.searchButton, {backgroundColor: _this.state.secondColor}]} onPress={() => {
                        _this.props.navigation.goBack();
                        _this.props.navigation.state.params._setCheckedFilterParams('make', checked);
                    }}>
                        <Ico icoName='magnifier' icoSize={16} icoColor={GLOBALS.COLOR.white}/>
                        <Text style={styles.btnText}><Translation str='choose_model'/></Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = EStyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    content: {
        position: 'absolute',
        top: 50,
        left: 50
    },

    center: {
        textAlign: 'center'
    },

    svgStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '34rem',
        height: '34rem',
        borderColor: GLOBALS.COLOR.gray88,
        borderRadius: 34,
        borderWidth: 1,
        marginLeft: '10rem',
        marginRight: '10rem'
    },

    appMainTitle: {
        flex: 1,
        justifyContent: 'center'
    },

    invisibleBlock: {
        width: '30rem'
    },

    flatStyle: {
        flex: 1,
        width: '100%',
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },

    gridItem: {
        width: '30%',
        padding: '5rem',
        borderColor: GLOBALS.COLOR.white,
        borderRadius: 7,
        borderWidth: 2,
        margin: '6rem'
    },

    gridBorderItem: {
        width: '30%',
        padding: '5rem',
        borderRadius: 7,
        borderWidth: 2,
        margin: '6rem'
    },

    similarImg: {
        height: '60rem',
        resizeMode: 'contain',
        margin: '7rem'
    },

    title: {
        fontSize: '13rem',
        color: GLOBALS.COLOR.gray88,
        textAlign: 'center'
    },

    btnWrap: {
        paddingTop: '5rem',
        paddingBottom: '10rem',
        paddingLeft: '20rem',
        paddingRight: '20rem',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 1,
    },

    searchButton: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingTop: '15rem',
        paddingBottom: '15rem',
        borderRadius: '10rem'
    },

    btnText: {
        fontSize: '15rem',
        color: GLOBALS.COLOR.white,
        fontWeight: '500',
        marginLeft: '10rem'
    },
});