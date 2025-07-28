import { FlatList, Image, Text, TouchableOpacity, View, Vibration } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { styles } from "./styles";
import { TitleRenderItem } from "./titleRenderItem/index";
import { appColors, windowHeight } from "@src/themes";
import { BackArrow, History, Search } from "@src/utils/icons";
import { useValues } from "@App";
import { useAppNavigation } from "@src/utils/navigation";
import Images from "@src/utils/images";
import { useSelector } from "react-redux";
import { getValue } from "@src/utils/localstorage";
import { useIsFocused } from "@react-navigation/native";
import { notificationHelper } from "@src/commonComponent";

export function TopCategory({ categoryData }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const { bgFullStyle, isDark, viewRTLStyle, textRTLStyle } = useValues()
  const { navigate } = useAppNavigation();
  const isScrollable = categoryData?.length > 4;
  const { translateData } = useSelector((state) => state.setting);
  const [recentDatas, setRecentDatas] = useState<string[]>([]);
  const flatListRef = useRef(null);
  const [showBackButton, setShowBackButton] = useState(true);
  const isFocused = useIsFocused();
  const { walletTypedata } = useSelector((state: any) => state.wallet);

  useEffect(() => {
    if (categoryData?.length > 0) {
      setSelectedSubcategory(categoryData[0]);
    }
  }, [categoryData]);

  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        const stored = await getValue("locations");
        let parsedLocations = [];
        if (stored) {
          parsedLocations = JSON.parse(stored);
          if (!Array.isArray(parsedLocations)) {
            parsedLocations = [parsedLocations];
          }
        }
        setRecentDatas(parsedLocations);
      } catch (error) {
        console.error("Error parsing recent locations:", error);
        setRecentDatas([]); // fallback
      }
    };
    if (isFocused) {
      fetchRecentData();  // only run when screen is focused
    }
  }, [isFocused]);

  const handlePress = () => {
    if (walletTypedata?.balance < 0) {
      notificationHelper("", "wallet balance low", 'error')
    } else {
      const item = selectedSubcategory;
      if (!item) return;
      if (item?.slug === 'intercity' || item?.slug === 'ride' || item?.slug === 'ride-freight' || item?.slug === 'intercity-freight' || item?.slug === 'intercity-parcel' || item?.slug === 'ride-parcel' || item?.slug === 'schedule-freight' || item?.slug === 'schedule-parcel') {
        navigate('Ride', {
          service_ID: item?.service_id,
          service_name: item?.service_type,
          service_category_ID: item?.id,
          service_category_slug: item?.slug,
        });
      } else if (item?.slug === 'package') {
        navigate('RentalLocation', {
          service_ID: item?.service_id,
          service_name: item?.service_type,
          service_category_ID: item?.id,
          service_category_slug: item?.slug,
        });
      } else if (item?.slug === 'schedule') {
        navigate('Ride', {
          service_ID: item?.service_id,
          service_name: item?.service_type,
          service_category_ID: item?.id,
          service_category_slug: item?.slug,
        });
      } else if (item?.slug === 'rental') {
        navigate('RentalBooking', {
          service_ID: item?.service_id,
          service_name: item?.service_type,
          service_category_ID: item?.id,
          service_category_slug: item?.slug,
        });
      }
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const isAtEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - 10;
    setShowBackButton(!isAtEnd);
  };


  const gotoBook = (item) => {
    if (walletTypedata?.balance < 0) {
      notificationHelper("", "wallet balance low", 'error')
    } else {

      navigate("BookRide", {
        destination: item?.destinationFullAddress?.shortAddress,
        stops: item?.stops,
        pickupLocation: item?.pickupLocation,
        service_ID: item?.service_ID,
        zoneValue: item?.zoneValue,
        scheduleDate: item?.scheduleDate,
        service_category_ID: item?.service_category_ID,
        service_name: item?.service_name,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <View style={styles.mainLine} />
        {showBackButton && categoryData.length > 4 && (

          <TouchableOpacity style={[{ backgroundColor: appColors.whiteColor }, styles.backBtnStyle]}
            activeOpacity={0.9}
            onPress={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
          >
            < BackArrow colors={isDark ? appColors.whiteColor : appColors.blackColor} />
          </TouchableOpacity>
        )}

        <FlatList
          ref={flatListRef}
          data={categoryData}
          renderItem={({ item, index }) => (
            <TitleRenderItem
              item={item}
              index={index}
              selectedIndex={selectedIndex}
              onPress={() => {
                setSelectedIndex(index);
                setSelectedSubcategory(item);
                Vibration.vibrate(42);
              }}
              isScrollable={isScrollable}
              totalItems={categoryData.length}
            />
          )}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.name.toString()}
          onScroll={handleScroll}
        />
      </View>
      {categoryData?.length > 0 && (
        <>
          {selectedSubcategory?.slug != 'rental' && selectedSubcategory?.slug != 'package' && (
            <TouchableOpacity onPress={handlePress} activeOpacity={0.7}
              style={[styles.packageMainView, {
                backgroundColor: bgFullStyle,
                borderColor: isDark ? appColors.darkBorder : appColors.border,
              }]}
            >
              <View
                style={[styles.searchView, {
                  backgroundColor: isDark ? appColors.darkPrimary : appColors.lightGray,
                  flexDirection: viewRTLStyle,
                }]}
              >
                <Search />
                <Text
                  style={[styles.whereNext, {

                    color: isDark ? appColors.whiteColor : appColors.primaryText
                  }]}
                >
                  {translateData.whereNext}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          <FlatList
            data={recentDatas && recentDatas?.slice(0, 2)}
            keyExtractor={(item, index) => index?.toString()}
            renderItem={({ item, index }) => (
              <>
                {selectedSubcategory?.slug != 'rental' && selectedSubcategory?.slug != 'package' && (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.centerLocation,
                        { flexDirection: viewRTLStyle },
                        index === 0 && { marginTop: windowHeight(12) },
                      ]}
                      onPress={() => gotoBook(item)}
                    >
                      <View style={{ backgroundColor: appColors.lightGray, padding: windowHeight(8), borderRadius: windowHeight(20) }}>
                        <History />
                      </View>
                      <View>
                        <Text
                          style={[
                            styles.adajanText,
                            { color: isDark ? appColors.whiteColor : appColors.primaryText }
                          ]}
                        >
                          {item?.destinationFullAddress?.shortAddress}
                        </Text>
                        <Text
                          style={[
                            styles.titleTextDetail,
                            {
                              textAlign: textRTLStyle,

                            },

                          ]}
                        >
                          {item?.destinationFullAddress?.detailAddress}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <View
                      style={[
                        styles.locationLine,
                        { borderColor: isDark ? appColors.darkBorder : appColors.border }
                      ]}
                    />
                  </>
                )}
              </>
            )}
          />
          {selectedSubcategory?.slug === 'rental' && (

            <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
              <Image source={Images.rentalBanner} style={styles.rentalImage} />
            </TouchableOpacity>
          )}
          {selectedSubcategory?.slug === 'package' && (
            <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
              <Image source={Images.packagebanner} style={styles.rentalImage} />
            </TouchableOpacity>
          )}
        </>
      )
      }
    </View >
  );
}

