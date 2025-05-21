import React from 'react';
import { View, StyleSheet } from 'react-native';
import AddressInput from '../AddressInput';
import CustomBtn from '../customBtn';

interface ChooseDestinationProps {
  isSearchVisible: boolean;
  destination: { latitude: number; longitude: number } | null;
  onPress: (destination: { latitude: number; longitude: number } | null) => void;
}

const ChooseDestination: React.FC<ChooseDestinationProps> = ({
  isSearchVisible,
  destination,
  onPress,
}) => {
  // When a destination coordinate is chosen
  const handleSelect = (coords: { latitude: number; longitude: number }) => {
    onPress(coords);
    console.log("Destination selected:", coords);
  };

  // Cancel the current destination
  const handleCancel = () => {
    onPress(null);
    console.log("Destination cancelled");
  };

  return (
    <View style={styles.container}>
      {/* Show input only if search is visible and no destination selected */}
      {isSearchVisible && !destination && (
        <View style={styles.searchContainer}>
          <AddressInput
            placeholderText="Search destination..."
            fetchAddress={handleSelect}
          />
        </View>
      )}

      {/* Show Cancel button when a destination exists */}
      {destination && (
        <View style={styles.cancelButtonContainer}>
          <CustomBtn
            onPress={handleCancel}
            btnText="Cancel"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { flex: 1 },
  cancelButtonContainer: { padding: 16 },
});

export default ChooseDestination;
