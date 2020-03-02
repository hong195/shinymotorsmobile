import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Dimensions
} from 'react-native'

import Ico from '../components/Ico';
import GLOBALS from "../constants/globals";
import EStyleSheet from "react-native-extended-stylesheet";
import _ from 'lodash';
import AsyncStorage from "@react-native-community/async-storage";
import Translation from '../helpers/Translation';

const entireScreenWidth = Dimensions.get('window').width;
EStyleSheet.build({$rem: entireScreenWidth / 380});

let _this;
let checked = {};

export default class AddACarDefaultChoose extends React.Component {
    constructor(props) {
        super(props);

        _this = this;

        _this.state = {
            title: 'Choose',
            checkedParams: {},
            filterType: '',
            filterData: {},
            oldChecked: '',
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
                    <Text style={styles.center}><Translation str='choose'/> {navigation.state.params.title}</Text>
                </View>
            ),
            headerLeft: (
                <View>
                    <TouchableOpacity
                        activeOpacity={0.8} style={styles.svgStyle} onPress={() => {
                        _this.props.navigation.goBack();
                    }}>
                        <Ico icoName='arrow-left1' icoColor={GLOBALS.COLOR.gray88} icoSize={16}/>
                    </TouchableOpacity>
                </View>
            ),
            headerRight: (<View style={styles.invisibleBlock}></View>)
        }
    };

    _updateFilterParams = (make, models) => {
        let newModels = (Object.keys(make).length > 0) ? [] : models;
        _.map(make, function (val, index) {
            _.forEach(models, function (value, key) {
                if (value.parent == index) {
                    newModels.push(value);
                }
            })
        });

        _this.setState({
            filterData: newModels
        })
    }


    async componentWillMount() {
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

        if (_this.props.navigation.state.params.filterType == 'serie' && typeof(_this.props.navigation.state.params.checkedParams.stm_f_s_make) != 'undefined' || typeof(_this.props.navigation.state.params.checkedParams.stm_s_s_make) != 'undefined') {

            if(typeof(_this.props.navigation.state.params.checkedParams.stm_s_s_make) != 'undefined') {
                _this._updateFilterParams(_this.props.navigation.state.params.checkedParams.stm_s_s_make, _this.props.navigation.state.params.filterData)
            } else {
                _this._updateFilterParams(_this.props.navigation.state.params.checkedParams.stm_f_s_make, _this.props.navigation.state.params.filterData)
            }

            _this.setState({
                filterType: _this.props.navigation.state.params.filterType,
                btnText: _this.props.navigation.state.params.title,
            });
        } else {
            _this.setState({
                checkedParams: _this.props.navigation.state.params.checkedParams,
                filterType: _this.props.navigation.state.params.filterType,
                filterData: _this.props.navigation.state.params.filterData,
                btnText: _this.props.navigation.state.params.title,
            });
        }
    }

    componentDidMount() {
        checked = {};
    }


    render() {
        return (
            <View style={styles.container}>
                <FlatList
                    style={styles.flatStyle}
                    data={_this.state.filterData}
                    extraData={this.state}
                    renderItem={({item}) =>
                        <TouchableOpacity
                            activeOpacity={0.8} style={styles.gridItem} onPress={() => {
                            if (!checked.hasOwnProperty(_this.state.filterType)) {
                                checked[_this.state.filterType] = {};
                                checked[_this.state.filterType][item.slug] = item.label;
                            } else {
                                if (!checked[_this.state.filterType].hasOwnProperty(item.slug)) {
                                    delete checked[_this.state.filterType][_this.state.oldChecked];
                                    checked[_this.state.filterType][item.slug] = item.label;
                                } else {
                                    delete checked[_this.state.filterType][item.slug];
                                    _this.setState({
                                        oldChecked: ''
                                    })
                                }
                            }

                            if (_this.state.oldChecked != item.slug) {
                                _this.setState({
                                    oldChecked: item.slug
                                })
                            }

                            if (checked.hasOwnProperty(_this.state.filterType)) _this.props.navigation.state.params._setCheckedFilterParams(_this.state.filterType, checked[_this.state.filterType]);
                            _this.props.navigation.goBack();
                        }}>
                            {
                                (item.slug != _this.state.oldChecked) ?
                                    <View style={styles.listItem}>
                                        <Text style={[styles.title, {color: _this.state.secondColor}]}>{item.label}</Text>
                                        <Text style={styles.uncheck}></Text>
                                    </View>
                                    :
                                    <View style={[styles.listItemBorder, {borderColor: _this.state.mainColor}]}>
                                        <Text style={[styles.title, {color: _this.state.secondColor}]}>{item.label}</Text>
                                        <View class={[styles.checkWrap, {borderColor: _this.state.mainColor}]}>
                                            <Ico icoName='check-circle' icoSize={22} icoColor={_this.state.mainColor}/>
                                        </View>
                                    </View>
                            }
                        </TouchableOpacity>
                    }
                    keyExtractor={({item}, index) => index.toString()}
                />
            </View>
        )
    }
}

const styles = EStyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    appMainTitle: {
        flex: 1,
        justifyContent: 'center'
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

    invisibleBlock: {
        width: '30rem'
    },

    center: {
        textAlign: 'center'
    },

    flatStyle: {
        flex: 1,
        width: '100%',
        height: '100%',
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },

    listItem: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 'auto',
        height: '45rem',
        borderWidth: '2rem',
        borderColor: GLOBALS.COLOR.bg,
        borderRadius: '10rem',
        marginTop: '20rem',
        paddingLeft: '15rem',
        paddingRight: '15rem'
    },

    listItemBorder: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 'auto',
        height: '45rem',
        borderWidth: '2rem',
        borderRadius: '10rem',
        marginTop: '20rem',
        paddingLeft: '15rem',
        paddingRight: '15rem'
    },

    title: {
        width: '90%',
        fontSize: '15rem',
        fontWeight: '500',
    },

    count: {
        width: '10%',
        color: GLOBALS.COLOR.grayAC,
        fontSize: '14rem',
        textAlign: 'center'
    },

    uncheck: {
        width: '22rem',
        height: '22rem',
        backgroundColor: GLOBALS.COLOR.bg,
        borderRadius: '12rem',
        overflow: 'hidden'
    },

    checkWrap: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        borderRadius: '20rem',
        borderWidth: '2rem',
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