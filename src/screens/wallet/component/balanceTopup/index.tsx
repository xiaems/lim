import { View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Images from '@utils/images';
import styles from './styles';
import { useValues } from '../../../../../App'
import { useAppNavigation } from '@src/utils/navigation';
import { useSelector } from 'react-redux';
import { appColors, appFonts, fontSizes, windowHeight, windowWidth } from '@src/themes';
import { WalletEye } from '@src/assets/icons/walletEye';
import { DollarCoin, Gift, PlusAmount, TopUp } from '@src/utils/icons';
import { WalletEyeClose } from '@src/assets/icons/walletEyeClose';

interface BalanceTopupProps {
    balance: number | any;
}

export function BalanceTopup({ balance }: BalanceTopupProps) {
    const { navigate } = useAppNavigation();
    const { viewRTLStyle } = useValues()
    const { translateData } = useSelector((state: any) => state.setting);
    const { zoneValue } = useSelector((state: any) => state.zone);
    const [isVisible, setIsVisible] = useState(true);

    const rawAmount = `${zoneValue.currency_symbol}${((zoneValue?.exchange_rate ?? 0) * (balance ?? 0)).toFixed(2)}`;
    const maskedAmount = `${zoneValue.currency_symbol}**** **`;


    const gotoTopUp = () => {
        navigate('TopUpWallet')
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <View style={styles.mainBalance}>
            <Image source={Images.cardBackground} style={styles.walletImage} />
            <View style={[styles.subBalance]}>
                <View style={{ marginHorizontal: windowWidth(18) }}>
                    <View style={styles.balanceView}>
                        <Text style={styles.balanceTitle}>Available Balance</Text>
                    </View>
                    <View style={{ borderBottomWidth: 1, borderStyle: 'dashed', width: '100%', borderColor: '#81BFAF' }} />
                    <View
                        style={{
                            flexDirection: 'row',
                            marginVertical: windowHeight(15),
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            style={[
                                styles.totalBalance,
                                {
                                    fontVariant: ['tabular-nums'], 
                                    minWidth: 100,                 
                                    textAlign: 'center',
                                },
                            ]}
                        >
                            {isVisible ? rawAmount : maskedAmount}
                        </Text>

                        <TouchableOpacity
                            onPress={() => setIsVisible(prev => !prev)}
                            style={{
                                marginHorizontal: windowWidth(10),
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: windowHeight(21),
                            }}
                        >
                            {isVisible ? <WalletEye /> : <WalletEyeClose />}
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity activeOpacity={0.9} onPress={gotoTopUp} style={{ backgroundColor: appColors.whiteColor, height: windowHeight(28), width: '47.5%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: windowHeight(5) }}>
                            <TopUp />
                            <Text style={{ color: appColors.primary, marginHorizontal: windowWidth(8), fontFamily: appFonts.medium }}>Top Up</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={{
                                backgroundColor: appColors.whiteColor,
                                height: windowHeight(28),
                                width: '47.5%',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: windowHeight(5),
                                position: 'relative', // ensure relative container
                            }}
                        >
                            {/* Absolute image */}
                            <Image
                                source={Images.soon} // replace with your image
                                style={{
                                    position: 'absolute',
                                    top: windowHeight(-3),
                                    right: windowWidth(-4),
                                    width: windowHeight(30),
                                    height: windowHeight(32),
                                    resizeMode: 'contain',
                                }}
                            />

                            <Gift />
                            <Text
                                style={{
                                    color: appColors.primary,
                                    marginHorizontal: windowWidth(8),
                                    fontFamily: appFonts.medium,
                                }}
                            >
                                Gift Card
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </View>
            <Text style={{ color: '#B7C7C4', fontFamily: appFonts.regular, fontSize: fontSizes.FONT19, textAlign: 'center', marginTop: windowHeight(6.5) }}>Balance as of {formattedDate} </Text>
        </View>
    )
}