import React from 'react';
import {View,Text} from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import BottomNavigation, {IconTab} from 'react-native-material-bottom-navigation';
import GLOBALS from "../constants/globals";
import PropTypes from 'prop-types';
import CustomIcon from "../config/CustomIcons.js";
import { createAppContainer, createStackNavigator } from 'react-navigation';
import {EventRegister} from "react-native-event-listeners";


import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import IonicIcon from "react-native-vector-icons/Ionicons";

let _this;

export default class AppBottomNavigation extends React.Component {

    static propTypes = {
        activeTab: PropTypes.string.isRequired
    }

    constructor(props) {
        super(props);

        _this = this;
        const {activeTab} = this.props;

        this.state = {
            userLocal: '',
            appType: 'dealership',
            active: (activeTab != '') ? activeTab : 'home3',
            mainColor: '',
            secondColor: ''
        }
    }

    tabsClassified = [
        {
            key: 'home',
            // icon: 'lnr-home', //ios
            icon: 'home', //android
            label: '',
            barColor: '#ffffff',
            pressColor: 'rgba(0, 0, 0, 0.1)'
        },
        {
            key: 'add_car',
            icon: 'lnr-plus-circle', // for ios
            // icon: 'pound-symbol-variant', //for android
            label: '',
            barColor: '#ffffff',
            pressColor: 'rgba(0, 0, 0, 0.1)'
        },
        {
            key: 'filter',
            icon: 'search1',
            label: '',
            barColor: '#ffffff',
            pressColor: 'rgba(0, 0, 0, 0.1)'
        },{
            key: 'profile',
            icon: 'user',
            label: '',
            barColor: '#ffffff',
            pressColor: 'rgba(0, 0, 0, 0.1)'
        }
    ];

    tabsDealer = [
        {
            key: 'home',
            icon: 'home3',
            label: '',
            barColor: '#ffffff',
            pressColor: 'rgba(0, 0, 0, 0.1)'
        },
        {
            key: 'filter',
            icon: 'lnr-magnifier',
            label: '',
            barColor: '#ffffff',
            pressColor: 'rgba(0, 0, 0, 0.1)'
        }
    ];

    renderIcon = icon => ({isActive}) => {
        // 
        if (icon == "lnr-plus-circle"){
            return(
                <FontAwesome5Icon name="pound-sign" size={25} color={_this.state.active == icon ? _this.state.secondColor : GLOBALS.COLOR.gray88} />        
            )
        }
        else if (icon =="home"){
            return <IonicIcon name="ios-home" size={27} color={_this.state.active == icon ? _this.state.secondColor : GLOBALS.COLOR.gray88} />        
            // <FontAwesome5Icon name="home" size={25} color={_this.state.active == icon ? _this.state.secondColor : GLOBALS.COLOR.gray88} />        
        }
        else{
            return <CustomIcon name={icon} size={25} color={_this.state.active == icon ? _this.state.secondColor : GLOBALS.COLOR.gray88} />
        }
    }

    renderTab = ({tab, isActive}) => (
        <IconTab
            isActive={isActive}
            key={tab.key}
            renderIcon={_this.renderIcon(tab.icon)}
            iconAnimation={progress => ({
                transform: [
                    {
                        scale: progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1]
                        })
                    }
                ],
                opacity: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                })
            })}
        />
    )

    async componentWillMount() {
        try {
            let user = await AsyncStorage.getItem('userData');
            user = JSON.parse(user);

            let apptype = await AsyncStorage.getItem('app_type');

            let sc = await AsyncStorage.getItem('secondary_color');

            _this.setState({
                secondColor: sc
            })

            if(user != null && user.hasOwnProperty('token')) {
                _this.setState({
                    userLocal: user
                })
            }

            _this.setState({
                appType: apptype
            })
        } catch (e) {
            console.log("error from AsyncStorage Navigation: ", e);
        }
    }

    componentDidMount() {}

    componentDidUpdate() {}

    tabPress = async (tabId) => {
        const ico = {'home': 'home3', 'add_car': 'lnr-plus-circle', 'filter': 'lnr-magnifier', 'profile': 'lnr-user'};

        switch(tabId) {
            case 'home':
                _this.props.navigation.navigate('Home');
                break;
            case 'add_car':
                if(_this.state.userLocal == '') {
                    _this.props.navigation.navigate('Login', {title: 'Login'});
                } else {
                    _this.props.navigation.replace('AddACarStepOne', {editMode: false, resetAll: true});
                }
                break;
            case 'filter':
                _this.props.navigation.navigate('Filter');
                break;
            case 'profile':
                if(_this.state.userLocal == '') {
                    _this.props.navigation.navigate('Login', {title: 'Login'});
                } else {
                    _this.props.navigation.navigate('Profile');
                }
                break;
        }
    }

    render() {
        return (
            <View>
                <BottomNavigation
                    onTabPress={newTab => _this.tabPress(newTab.key)}
                    renderTab={_this.renderTab}
                    tabs={_this.state.appType == 'dealership' ? _this.tabsDealer : _this.tabsClassified }
                />
            </View>
        )
    }
}
