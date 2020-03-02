import React from 'react';
import {
    ScrollView,
    RefreshControl,
    Dimensions,
    ActivityIndicator,
    Text,
    View,
    TouchableOpacity,
    Image,
    Linking,
    Modal,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import Translation from '../helpers/Translation';
import Carousel from 'react-native-snap-carousel';
import Lightbox from 'react-native-lightbox';
import EStyleSheet from 'react-native-extended-stylesheet';
import {actionWithFavorite, getListing} from "../helpers/MotorsRestApi"
import GLOBALS from '../constants/globals';
import Toast, {DURATION} from 'react-native-easy-toast'
import ImageViewer from 'react-native-image-zoom-viewer';

const entireScreenWidth = Dimensions.get('window').width;
EStyleSheet.build({$rem: entireScreenWidth / 380});
import Ico from '../components/Ico';
import ExpanableList from 'react-native-expandable-section-flatlist';
import MapView from 'react-native-maps';
import {Marker, MarkerAnimated, AnimatedRegion} from 'react-native-maps';
import Communications from 'react-native-communications';
import AdvertisingComponent from '../components/AdvertisingComponent';

import _ from 'lodash';

let vm;
let latLng = {
    latitude: 0,
    longitude: 0
};

let _this;

const {width: viewportWidth, height: viewportHeight} = Dimensions.get('window');

let iconsName = {0: 'chevron-down', 1: 'chevron-down', 2: 'chevron-down', 3: 'chevron-down'};

export default class Details extends React.Component {

    constructor(props) {
        super(props);

        _this = this;

        this.state = {
            isLoading: true,
            refreshing: false,
            dataListing: {},
            listingId: '',
            hp: false,
            userId: 0,
            userToken: 0,
            inFavorites: false,
            mainColor: '',
            secondColor: '',
            currentSlide: 1,
            iconsName: {0: 'chevron-down', 1: 'chevron-down', 2: 'chevron-down', 3: 'chevron-down'},
            isOpen: false,
            adPosition: 'bottom',
            isShowZoomCarImg : false,
            nCurImgIndex : 0,

        };

        vm = this;
        this._renderCarouselItem = this._renderCarouselItem.bind(this);
        this._onPressImage = this._onPressImage.bind(this);
        this._onClickImg = this._onClickImg.bind(this);
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
                    <Text style={styles.center}>{navigation.state.params.subtitle}</Text>
                    <Text style={styles.center}>{navigation.state.params.title}</Text>
                </View>
            ),
            headerLeft: (<View>
                <TouchableOpacity
                    activeOpacity={0.8} style={styles.svgStyle} onPress={() => {
                    navigation.goBack()
                }}>
                    <Ico icoName='arrow-left1' icoColor={GLOBALS.COLOR.gray88} icoSize={16}/>
                </TouchableOpacity>
            </View>),
            headerRight: (
                navigation.state.params.hasOwnProperty('userId') && navigation.state.params.userId != 0 && navigation.state.params.userId != 'undefined'
                    ?
                    <View style={styles.svgStyle}>
                        <TouchableOpacity
                            activeOpacity={0.8} onPress={() => {
                            vm._addToFavorites();
                        }}>
                            <Ico icoName='heart'
                                 icoColor={navigation.state.params.inFavorites ? GLOBALS.COLOR.red : GLOBALS.COLOR.gray88}
                                 icoSize={14}/>
                        </TouchableOpacity>
                    </View>
                    :
                    <View style={styles.invisibleBlock}></View>
            ),
        }
    };

    async componentWillMount() {
        let userId, userToken;

        try {
            let mc = await AsyncStorage.getItem('main_color');
            let sc = await AsyncStorage.getItem('secondary_color');
            let settings = await AsyncStorage.getItem('ads_settings');
            let adsSettings = JSON.parse(settings);

            _this.setState({
                mainColor: mc,
                secondColor: sc,
                adPosition: (_.get(adsSettings, 'banner_position') != null) ? _.get(adsSettings, 'banner_position') : 'bottom'
            })

            let user = await AsyncStorage.getItem('userData');
            user = JSON.parse(user);
            userId = user.ID;
            userToken = user.token;
        } catch (e) {
            userId = 0;
            userToken = 0;
            console.log("error from AsyncStorage Details: ", e);
        }

        this.setState({
            userId: userId,
            userToken: userToken,
            listingId: this.props.navigation.state.params.listingId
        });

        let queryArgs = 'id=' + this.props.navigation.state.params.listingId;

        if (userId != 0) {
            queryArgs = queryArgs + '&user_id=' + userId;
        }

        getListing(queryArgs).then((responceJSON) => {

            this.changeTitle(responceJSON.title, responceJSON.subTitle, responceJSON.inFavorites);

            latLng = {
                latitude: Number(responceJSON.car_lat),
                longitude: Number(responceJSON.car_lng)
            }

            this.setState({
                isLoading: false,
                dataListing: responceJSON,
                refreshing: false,
                inFavorites: responceJSON.inFavorites
            }, function () {

            })
        })
    }

    componentDidMount() {
    }

    componentWillUpdate() {
    }

    componentDidUpdate() {
    }

    componentWillUnmount() {
    }

    changeTitle = (titleTxt, subtitleTxt, inFav) => {
        const {setParams} = this.props.navigation;

        setParams({
            subtitle: subtitleTxt,
            title: titleTxt,
            userId: vm.state.userId,
            inFavorites: inFav
        });
    };

    _updateFavoriteIco = (inFav) => {
        const {setParams} = this.props.navigation;

        setParams({
            userId: vm.state.userId,
            inFavorites: inFav
        });
    };

    _updateViewWithNewId = (newId) => {
        this.setState({
            refreshing: true
        });

        let queryArgs = 'id=' + newId;

        if (vm.state.userId != 0) {
            queryArgs = queryArgs + '&user_id=' + vm.state.userId;
        }

        getListing(queryArgs).then((responceJSON) => {

            this.changeTitle(responceJSON.title, responceJSON.subTitle, responceJSON.inFavorites);

            latLng = {
                latitude: Number(responceJSON.car_lat),
                longitude: Number(responceJSON.car_lng)
            }

            this.setState({
                isLoading: false,
                dataListing: responceJSON,
                refreshing: false,
            }, function () {

            })
        })
    };

    _addToFavorites = () => {
        const formData = new FormData();

        formData.append('userId', vm.state.userId);
        formData.append('userToken', vm.state.userToken);
        formData.append('carId', vm.state.listingId);

        let action = (vm.state.inFavorites) ? 'remove' : 'add';

        formData.append('action', action);

        actionWithFavorite(formData).then((responceJSON) => {

            vm._showToast(responceJSON.message);
            vm._updateFavoriteIco((vm.state.inFavorites) ? false : true);
            vm.setState({
                inFavorites: (vm.state.inFavorites) ? false : true
            });
        })
            .catch(err => {
                vm._showToast(err);
            });

    }

    _onRefresh = () => {
        this.setState({refreshing: true});

        let queryArgs = 'id=' + vm.state.listingId;

        if (vm.state.userId != 0) {
            queryArgs = queryArgs + '&user_id=' + vm.state.userId;
        }

        getListing(queryArgs).then((responceJSON) => {

            this.changeTitle(responceJSON.title, responceJSON.subTitle, responceJSON.inFavorites);

            latLng = {
                latitude: Number(responceJSON.car_lat),
                longitude: Number(responceJSON.car_lng)
            }

            this.setState({
                isLoading: false,
                dataListing: responceJSON,
                refreshing: false,
            }, function () {

            })
        })
    };

    _renderRow = (rowItem, rowId, sectionId) => (
        rowItem.content
    );

    _renderSection = (section, sectionId) => {
        return section;
    };

    _renderCarouselItem({item, index}) {
        let _this = this;
        return (
            <TouchableOpacity 
                style={styles.slide}   
                onPress={() => {
                    this._onPressImage(index);
                }}
            >
                <Image style={styles.img} source={{uri: item.url}}/>
            </TouchableOpacity>
        );
    }



    _onPressImage(index){
        this.setState({nCurImgIndex : index});
        this.setState({isShowZoomCarImg : true});
    }

    _onClickImg(){
        this.setState({isShowZoomCarImg : false})
    }
    

    _showToast = (text, color) => {
        vm.refs['toast'].show(text, 3000);
    }

    _headerPress = (section, sectionId) => {
        if (sectionId) {
            iconsName[section] = 'lnr-chevron-up'
        } else {
            iconsName[section] = 'lnr-chevron-down'
        }
    }


    render() {
        if (this.state.isLoading) {
            return (
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                        />
                    }
                >
                    <View style={{flex: 1, alignItems: 'center', paddingTop: 100}}><ActivityIndicator/></View>
                </ScrollView>
            )
        }

        let listing = this.state.dataListing;
        let user = (listing.hasOwnProperty('author')) ? listing.author : {};


        console.log("user info");
        console.log(user);
        console.log("user info---");

        const renderCarousel = (currentItem = this.state.currentSlide) => (
            <View style={styles.lightbox}>
                <Carousel
                    ref={(c) => {
                        this._carousel = c;
                    }}
                    data={listing.gallery}
                    renderItem={this._renderCarouselItem}
                    sliderWidth={viewportWidth}
                    itemWidth={viewportWidth}
                    onSnapToItem={(index) => this.setState({currentSlide: index + 1})}
                    slideStyle={{width: viewportWidth, padding: 0, marginTop: 50, height: 255}}
                    firstItem={currentItem - 1}
                />
            </View>
        )
        const activeProps = {
            resizeMode: 'contain',
            flex: 1,
            width: null
        };
        console.log(this.state.dataListing);

        const MockData = [
            {
                header: <View style={[styles.expandTitleWrap, {borderTopColor: _this.state.mainColor}]}><Text
                    style={styles.expandTitle}><Translation str='features'/></Text>
                    <View style={styles.chevronWrap}>
                        <Ico icoName={iconsName[0]} icoSize={14} icoColor='#232628'/>
                    </View>

                </View>,
                member: [
                    {
                        content: <View style={styles.featureWrap}>
                            {
                                _.map(listing.features, function (feature, index) {
                                    return (
                                        <View key={index} style={styles.featureItem}>
                                            <Ico icoName='check-circle' icoSize={16} icoColor={_this.state.mainColor}/>
                                            <Text style={{marginLeft: 5}}>{feature}</Text>
                                        </View>
                                    )
                                })
                            }
                        </View>
                    }
                ]
            },
            {
                header: <Text style={styles.hide}></Text>,
                member: [
                    {
                        content: <View style={styles.authorWrap}>
                            <View style={styles.authorInfoWrap}>
                                <TouchableOpacity
                                    activeOpacity={0.8} onPress={() => {
                                    this.props.navigation.navigate('DealerProfile', {userId: user.user_id});
                                }}>
                                    <View style={styles.authorNameWrap}>
                                        {
                                            (user.dealer_image.length > 0)
                                                ?
                                                <View>
                                                    <Image style={styles.authorAvatar}
                                                           source={(user.dealer_image != '') ? {uri: user.dealer_image} : require('../assets/img/avatarplchldr.png')}/>
                                                </View>
                                                :
                                                <View></View>
                                        }
                                        <View>
                                            <Text style={styles.authorName}>{user.name + ' ' + user.last_name}</Text>
                                            <Text style={styles.authorLabel}>{user.user_role.toUpperCase()}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View
                                    style={{flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center'}}>
                                    <Text style={styles.authorLabel}><Translation str='added'/></Text>
                                    <Text style={styles.authorDate}>{user.reg_date}</Text>
                                </View>
                            </View>
                            <View style={styles.btnsWrap}>
                                <TouchableOpacity activeOpacity={0.8} style={styles.callBtnWrap} onPress={() => {
                                    Linking.openURL('tel:' + user.phone);
                                }}>
                                    <View style={[styles.callBtn, {backgroundColor: _this.state.secondColor}]}>
                                        <Ico icoName='phone-handset' icoSize={18} icoColor={GLOBALS.COLOR.white}/>
                                        <Text style={styles.phoneText}>{user.phone}</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.8} style={styles.messBtnWrap} onPress={() => {
                                    Communications.text(user.phone);
                                }}>
                                    <View style={styles.messBtn}>
                                        <Ico icoName='bubble-dots' icoSize={18} icoColor={GLOBALS.COLOR.grayBlue}/>
                                        <Text style={styles.messText}><Translation str='send_message'/></Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                ]
            },
            {
                header: <View style={[styles.expandTitleWrap, {borderTopColor: _this.state.mainColor}]}>
                    <Text style={styles.expandTitle}><Translation str='dealer_comments'/></Text>
                    <View style={styles.chevronWrap}>
                        <Ico icoName={iconsName[2]} icoSize={14} icoColor='#232628'/>
                    </View>
                </View>,
                member: [
                    {
                        content: <Text
                            style={styles.expandContent}>{(user.stm_seller_notes != '') ? user.stm_seller_notes : 'No comments'}</Text>
                    }
                ]
            },
            {
                header: <View style={[styles.expandMapTitleWrap, {borderTopColor: _this.state.mainColor}]}>
                    <View style={styles.expandMapHeaderWrap}>
                        <Ico icoName='pin_2' icoSize={24} icoColor={_this.state.mainColor}/>
                        <View style={styles.mapInfoWrap}>
                            <Text style={styles.expandSubTitle}><Translation str='location'/></Text>
                            <Text style={styles.expandMapTitle}>{user.location}</Text>
                        </View>
                    </View>
                    <View style={styles.chevronWrap}>
                        <Ico icoName={iconsName[3]} icoSize={14} icoColor='#232628'/>
                    </View>
                </View>,
                member: [
                    {
                        content: <View style={{width: '100%', height: 200}}>
                            <MapView
                                style={{width: '100%', height: 200, flex: 1}}
                                initialRegion={{
                                    // latitude: Number(listing.car_lat),
                                    // longitude: Number(listing.car_lng),
                                    // latitudeDelta: 2,
                                    // longitudeDelta: 2,
                                    latitude: 37.78825,
                                    longitude: -122.4324,
                                    latitudeDelta: 0.0922,
                                    longitudeDelta: 0.0421,
                                }}
                                // camera={{center: latLng, heading: 1, pitch: 1, zoom: 17, altitude: 80}}
                            >
                                <Marker
                                    coordinate={latLng}
                                    title={listing.car_location}
                                >
                                    <Image style={{width: 48, height: 59, resizeMode: 'cover'}}
                                           source={require('../assets/img/pin.png')}/>
                                </Marker>
                            </MapView>
                        </View>
                    }
                ]
            },
        ];

        return (
            <View style={{flex: 1}}>
                {
                    _this.state.adPosition == 'top' ? <AdvertisingComponent/> : <View></View>
                }

                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                        />
                    }
                    ref='_scrollView'
                >
                    <View style={styles.container}>
                        <View style={styles.sliderWrap}>
                            {
                                listing.gallery.length > 1 ?
                                    <Lightbox activeProps={activeProps} renderContent={renderCarousel}>
                                        <Carousel
                                            ref={(c) => {
                                                this._carousel = c;
                                            }}
                                            data={listing.gallery}
                                            renderItem={this._renderCarouselItem}
                                            sliderWidth={viewportWidth}
                                            itemWidth={viewportWidth}
                                            onSnapToItem={(index) => this.setState({currentSlide: index + 1})}
                                            slideStyle={{width: viewportWidth, padding: 0, margin: 0, height: 255}}
                                            firstItem={this.state.currentSlide - 1}
                                        />
                                    </Lightbox>
                                    :
                                    <Image style={styles.img} source={{uri: listing.imgUrl}}/>
                            }
                            <View style={[styles.priceWrap, {backgroundColor: _this.state.mainColor}]}><Text
                                style={styles.price}>{listing.price}</Text></View>
                            <View style={styles.imsCountWrap}>
                                <View style={styles.overlayDark}></View>
                                <View style={styles.counter}>
                                    <Text style={styles.number}>{_this.state.currentSlide}</Text>
                                    <Text style={styles.divider}>/</Text>
                                    <Text style={styles.numberMed}>{listing.gallery.length}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.gridView}>
                            {
                                _.map(listing.info, function (infoObj, index) {
                                    return (
                                        <View key={index} style={[styles.infoWrap, index > 2 ? styles.borderTop : '']}>
                                            <View style={styles.icoStyle}>
                                                <Ico icoColor={_this.state.mainColor} icoSize={22}
                                                     icoName={infoObj.info_3}/>
                                            </View>
                                            <View>
                                                <Text style={styles.infoDataTopWrap}
                                                      numberOfLines={1}>{infoObj.info_1}</Text>
                                                <Text style={styles.infoDataBottomWrap}
                                                      numberOfLines={1} ellipsizeMode='tail'>{infoObj.info_2}</Text>
                                            </View>
                                        </View>
                                    )
                                })
                            }
                        </View>

                        <View>
                            <ExpanableList
                                dataSource={MockData}
                                headerKey="header"
                                memberKey="member"
                                renderRow={this._renderRow}
                                renderSectionHeaderX={this._renderSection}
                                openOptions={[0, 1]}
                                headerOnPress={this._headerPress}
                            />
                        </View>
                        <View style={styles.similarWrap}>
                            <Text style={styles.similarMainTitle}><Translation str='recomended'/></Text>
                            <ScrollView horizontal={true}>
                                {
                                    _.map(listing.similar, function (data) {
                                        return (
                                            <TouchableOpacity
                                                activeOpacity={0.8} key={data.ID} onPress={() => {
                                                vm._updateViewWithNewId(data.ID);
                                                _this.refs._scrollView.scrollTo({x: 0, y: 0, animated: true});
                                            }}>
                                                <View style={styles.similarItemWrap}>
                                                    <View style={styles.similarImgWrap}>
                                                        <Image style={styles.similarImg} source={{uri: data.img}}/>
                                                        <View
                                                            style={[styles.similarPriceWrap, {backgroundColor: _this.state.mainColor}]}>
                                                            <Text style={styles.similarPrice}>{data.price}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={styles.similarTitleWrap}>
                                                        <Text style={styles.similarTitle}
                                                              numberOfLines={2}>{data.title}</Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })
                                }
                            </ScrollView>
                        </View>
                    </View>
                    <Toast ref="toast" positionValue={180}/>

                               <Modal 
                        visible={this.state.isShowZoomCarImg} 
                        transparent={false}
                        animationType="slide"
                        onRequestClose={() => {
                            this.setState({isShowZoomCarImg: false});
                            }}
                    >
                        <ImageViewer
                            imageUrls={listing.gallery}
                            index={this.state.nCurImgIndex}
                            onClick={()=>this._onClickImg()}
                        />
                    </Modal>
                </ScrollView>
                {
                    _this.state.adPosition == 'bottom' ? <AdvertisingComponent/> : <View></View>
                }
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

    appMainTitle: {
        flex: 1,
        justifyContent: 'center'
    },

    invisibleBlock: {
        width: '30rem'
    },

    center: {
        textAlign: 'center'
    },

    img: {
        width: '100%',
        height: '225rem',
        resizeMode: 'cover',
        flex: 1,
        margin: 0,
        padding: 0
    },

    priceWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 0,
        left: '20rem',
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 12,
        paddingRight: 12
    },

    price: {
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18rem',
        fontWeight: '600',
        color: GLOBALS.COLOR.white
    },

    gridView: {
        width: '100%',
        height: 'auto',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingLeft: '20rem',
        paddingRight: '20rem',
        paddingTop: '15rem',
        paddingBottom: '11rem'
    },

    slide: {
        width: '100%',
        height: '255rem',
        flex: 1,
        margin: 0,
        padding: 0
    },

    sliderWrap: {
        position: 'relative'
    },

    flatStyle: {
        flex: 1,
        padding: '20rem'
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

    infoWrap: {
        width: '33%',
        height: 'auto',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingLeft: '5rem',
        paddingRight: '5rem',
        paddingTop: '10rem',
        paddingBottom: '10rem',
        overflow: 'hidden'
    },

    borderTop: {
        borderTopWidth: 0.5,
        borderStyle: 'solid',
        borderTopColor: GLOBALS.COLOR.gray88,
    },

    icoStyle: {
        width: '24rem',
        marginRight: '5rem'
    },

    infoDataTopWrap: {
        fontSize: '10rem',
        color: GLOBALS.COLOR.gray88
    },

    infoDataBottomWrap: {
        width: '90rem',
        fontSize: '15rem',
        color: GLOBALS.COLOR.title,
        fontWeight: '500',
        overflow: 'hidden'
    },

    featureWrap: {
        flex: 1,
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingLeft: '20rem',
        paddingRight: '20rem',
        paddingTop: '10rem',
        paddingBottom: '10rem',
    },

    featureItem: {
        width: '50%',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        paddingTop: '3rem',
        paddingBottom: '3rem',
        marginBottom: '6rem'
    },

    expandTitleWrap: {
        flex: 1,
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: '20rem',
        paddingRight: '20rem',
        paddingTop: '20rem',
        paddingBottom: '20rem',
        borderBottomWidth: 0.5,
        borderStyle: 'solid',
        borderBottomColor: GLOBALS.COLOR.gray88,
        borderTopWidth: 1,
    },

    expandMapTitleWrap: {
        flex: 1,
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: '20rem',
        paddingRight: '20rem',
        paddingTop: '13rem',
        paddingBottom: '13rem',
        borderBottomWidth: 0.5,
        borderStyle: 'solid',
        borderBottomColor: GLOBALS.COLOR.gray88,
        borderTopWidth: 1,
    },

    expandMapHeaderWrap: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    expandSubTitle: {
        fontSize: '10rem',
        color: GLOBALS.COLOR.gray88
    },

    expandTitle: {
        fontSize: '14rem',
        fontWeight: '700',
        color: GLOBALS.COLOR.title
    },

    expandContent: {
        paddingLeft: '20rem',
        paddingRight: '20rem',
        paddingTop: '10rem',
        paddingBottom: '10rem',
        fontSize: '15rem',
        lineHeight: '25rem'
    },

    mapInfoWrap: {
        marginLeft: 10
    },

    expandMapTitle: {
        fontSize: '15rem',
        color: GLOBALS.COLOR.title,
        fontWeight: '500'
    },

    authorWrap: {
        backgroundColor: '#edf1f3',
        padding: '20rem',
    },

    authorAvatar: {
        width: '45rem',
        height: '45rem',
        borderRadius: '25rem',
        marginRight: 10
    },

    authorName: {
        fontSize: '14rem',
        color: GLOBALS.COLOR.title,
        marginBottom: '5rem'
    },

    authorNameWrap: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },

    authorDate: {
        fontSize: '12rem',
        color: GLOBALS.COLOR.title,
        marginTop: '5rem'
    },
    authorLabel: {
        fontSize: '9rem',
        color: GLOBALS.COLOR.gray88
    },

    authorInfoWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    btnsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginTop: '20rem'
    },

    hide: {
        height: 0
    },

    callBtnWrap: {
        width: '47%',
    },

    callBtn: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        height: '55rem',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 1,
    },

    messBtnWrap: {
        width: '47%'
    },

    messBtn: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        height: '55rem',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: GLOBALS.COLOR.white,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 1,
    },

    phoneText: {
        fontSize: '13rem',
        color: GLOBALS.COLOR.white,
        marginLeft: 5
    },

    messText: {
        fontSize: '13rem',
        color: GLOBALS.COLOR.grayBlue,
        marginLeft: 5
    },

    similarWrap: {
        paddingTop: '20rem',
        paddingBottom: '20rem',
        paddingLeft: '10rem',
        backgroundColor: GLOBALS.COLOR.title
    },

    similarMainTitle: {
        marginTop: '10rem',
        marginBottom: '30rem',
        marginLeft: '10rem',
        marginRight: '20rem',
        color: GLOBALS.COLOR.white,
        fontSize: '14rem',
        fontWeight: '600'
    },

    similarItemWrap: {
        width: '150rem',
        marginLeft: '10rem',
        marginRight: '10rem',
    },

    similarImgWrap: {
        position: 'relative'
    },

    similarImg: {
        height: '100rem',
    },

    similarPriceWrap: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    similarPrice: {
        fontSize: '14rem',
        color: GLOBALS.COLOR.white,
        fontWeight: '700'
    },

    similarTitleWrap: {
        flex: 1,
        backgroundColor: GLOBALS.COLOR.dark,
        padding: '12rem'
    },

    similarTitle: {
        fontSize: '12rem',
        fontWeight: '500',
        color: GLOBALS.COLOR.white
    },

    imsCountWrap: {
        position: 'absolute',
        bottom: '7rem',
        right: '8rem',
        paddingTop: '5rem',
        paddingBottom: '6rem',
        paddingLeft: '8rem',
        paddingRight: '8rem',
        width: '44rem',
        borderRadius: '3rem',
        overflow: 'hidden'
    },

    overlayDark: {
        flex: 1,
        backgroundColor: '#000',
        opacity: 0.6,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },

    counter: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    number: {
        color: GLOBALS.COLOR.white,
        fontWeight: '500',
        fontSize: '14rem'
    },

    numberMed: {
        color: GLOBALS.COLOR.white,
        fontWeight: '400',
        fontSize: '14rem'
    },

    divider: {
        color: "#bbb",
        fontWeight: '500',
        fontSize: '16rem'
    },

    chevronWrap: {
        paddingTop: '7rem',
        paddingLeft: '6rem',
        paddingRight: '6rem',
        paddingBottom: '5rem',
        borderRadius: '25rem',
        backgroundColor: GLOBALS.COLOR.bg
    },

    lightbox: {
        justifyContent: 'center',
        alignItems: 'center',
    }
});
