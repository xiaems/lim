import { View } from 'react-native';
import React from 'react';
import { external } from '../../../styles/externalStyle';
import { HeaderComponent } from './headerContainer/index';
import { ProfileContainer } from './profileContainer';
import styles from './styles';

export function HeaderContainer() {
  return (
    <View style={[styles.container, external.mh_20]}>
      <HeaderComponent />
      <ProfileContainer />
    </View>
  );
};

