import { FlatList, View } from 'react-native';
import React from 'react';
import { external } from '../../../../styles/externalStyle';
import { CategoryItem } from './categoryItem/index';
import { useDispatch, useSelector } from 'react-redux';
import { useAppNavigation } from '@src/utils/navigation';
import { homeScreenData } from '@src/api/store/actions';

export function CategoryDetail() {
  const { navigate } = useAppNavigation();
  const { serviceData } = useSelector((state: any) => state.service);
  const dispatch = useDispatch();
  const additionalItem = {
    id: '10',
    slug: 'more_services',
    name: 'More Services Cooming Soon',
    service_image_url: 'https://res.cloudinary.com/dwsbvqylx/image/upload/v1748931493/Mask_group_bxh2hr.png'
    // add any other required props for `CategoryItem`
  };

  const combinedData = [...(serviceData?.data || []), additionalItem];

  const renderItem = ({ item }: { item: any }) => {
    const service = item.slug;
    const handlePress = () => {
      if (item.slug === 'ambulance') {
        navigate('AmbulanceSearch');
        dispatch(homeScreenData({ service }))
      } else if (item.slug === 'cab' || item.slug === 'parcel' || item.slug === 'freight') {
        dispatch(homeScreenData({ service }))
        navigate('HomeService', { itemName: item.name, serviceValue: item });
      } else if (item.slug === 'car_pooling') {
        navigate('CarpoolingHome', { itemName: item.name, serviceValue: item });
      }
    };
    return <CategoryItem item={item} onPress={handlePress} />;
  };

  return (
    <View style={[external.as_center]}>
      <FlatList
        data={combinedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || item.someUniqueField}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 10 }}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
    </View>
  );
};
