import { PermissionsAndroid, Platform, Permission } from 'react-native';

const requestPermissions = async () => {
  try {
    // Define the basic permissions
    const permissions: Permission[] = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ];

    // Check if BLUETOOTH_ADMIN is available
    if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN) {
      permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN);
    }

    // Add additional permissions for Android 12 (API 31) or above
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      permissions.push(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );
    }

    // Request permissions
    const granted = await PermissionsAndroid.requestMultiple(permissions);

    // Filter out denied permissions
    const deniedPermissions = Object.entries(granted)
      .filter(([permission, status]) => status !== PermissionsAndroid.RESULTS.GRANTED)
      .map(([permission]) => permission);

    if (deniedPermissions.length === 0) {
      console.log('All required permissions were granted');
    } else {
      console.log('The following permissions were denied:', deniedPermissions);
    }
  } catch (error) {
    console.warn('Error requesting permissions:', error);
  }

  return true;
};

export default requestPermissions;
