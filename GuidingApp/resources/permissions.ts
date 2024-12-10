import { PermissionsAndroid, Platform, Permission } from 'react-native';

const requestPermissions = async () => {
  try {
    // Define los permisos básicos
    const permissions: Permission[] = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ];

    // Verificar si BLUETOOTH_ADMIN está disponible
    if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN) {
      permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN);
    }

    console.log("1")

    // Agregar permisos adicionales para Android 12 (API 31) o superior
    if (Platform.OS === 'android' && Platform.Version >= 31) {
      console.log("2")
      permissions.push(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );
    }

    console.log("3")
    console.log(permissions)
    // Solicitar permisos
    const granted = await PermissionsAndroid.requestMultiple(permissions);

     // Filtrar permisos denegados
    const deniedPermissions = Object.entries(granted)
      .filter(([permission, status]) => status !== PermissionsAndroid.RESULTS.GRANTED)
      .map(([permission]) => permission);

    if (deniedPermissions.length === 0) {
      console.log('Todos los permisos necesarios fueron otorgados');
    } else {
      console.log('Los siguientes permisos fueron denegados:', deniedPermissions);
    }
  } catch (error) {
    console.warn('Error al solicitar permisos:', error);
  }

  return true;
};

export default requestPermissions;