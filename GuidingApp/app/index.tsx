import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet, ListRenderItem } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import base64 from 'react-native-base64';
import requestPermissions from "@/resources/permissions";
import { addRssiValueAndGetAverage, calculateDistance } from "@/resources/distance";
import { Link } from "expo-router";

const bleManager = new BleManager();

const TARGET_SERVICE_UUID = "0000fe9a-0000-1000-8000-00805f9b34fb";

interface ScannedDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  identifier: string | null;
  distance: number | null;
}

export default function BeaconScanner(): JSX.Element {
  const [devices, setDevices] = useState<ScannedDevice[]>([]);
  const [scanning, setScanning] = useState<boolean>(false);

  

  useEffect(() => {
    const checkPermissions = async () => {
      const permissionsGranted = await requestPermissions();
      if (!permissionsGranted){
        console.warn("No se otorgaron los permisos necesarios para Bluetooth.")
      }
    }

    checkPermissions();
    
    return () => {
      bleManager.destroy(); // Cleanup BLE manager on component unmount
    };
  }, []);

  // Start scanning for BLE devices
  const startScanning = () => {
    if (scanning) return;
    console.log("Escaneo iniciado.")
    setDevices([]); // Limpia la lista actual de dispositivos
    setScanning(true);

    bleManager.startDeviceScan([TARGET_SERVICE_UUID], null, (error, scannedDevice) => {
      if (error) {
        console.warn("Error during scan:", error);
        return;
      }

      if (scannedDevice) {
        let serviceData;
        if (scannedDevice.serviceData != null){
          serviceData = scannedDevice.serviceData[TARGET_SERVICE_UUID];
        }
        if (serviceData) {
          const decodedData = base64.decode(serviceData);
          const frameType = decodedData.charCodeAt(0);
          let identifier: string;
          if (frameType === 0x00) { // UID frame
            identifier = decodedData.slice(1, 17) // Bytes 2-11
              .split('')
              .map(char => ('0' + char.charCodeAt(0).toString(16)).slice(-2))
              .join('');
          }
        let distance:number;
        if (scannedDevice.rssi != null){
          distance = addRssiValueAndGetAverage(scannedDevice.id, scannedDevice.rssi);
        }
          
        // Avoid duplicates using device ID
        setDevices((prevDevices) => {
          // Buscar si el dispositivo ya existe en la lista
          const existingDeviceIndex = prevDevices.findIndex(
            (device) => device.id === scannedDevice.id
          );
        
          // Construir el nuevo dispositivo con los datos actuales
          const newDevice = {
            id: scannedDevice.id,
            name: scannedDevice.name,
            rssi: scannedDevice.rssi,
            identifier: identifier,
            distance: distance,
          };
        
          if (existingDeviceIndex === -1) {
            // Si el dispositivo no existe, agregarlo a la lista
            return [...prevDevices, newDevice];
          } else {
            // Si el dispositivo ya existe, verificar si alguno de sus atributos ha cambiado
            const existingDevice = prevDevices[existingDeviceIndex];
            const attributesChanged =
              existingDevice.name !== newDevice.name ||
              existingDevice.rssi !== newDevice.rssi ||
              existingDevice.identifier !== newDevice.identifier ||
              existingDevice.distance !== newDevice.distance;
        
            if (attributesChanged) {
              // Si algún atributo ha cambiado, actualizar el dispositivo en la lista
              const updatedDevices = [...prevDevices];
              updatedDevices[existingDeviceIndex] = newDevice;
              return updatedDevices;
            } else {
              // Si no hay cambios, retornar la lista original
              return prevDevices;
            }
          }
        });
        }
      }
    });
  };

  // Stop scanning for BLE devices
  const stopScanning = () => {
    if (!scanning) return;

    bleManager.stopDeviceScan();
    setScanning(false);
    console.log("Escaneo detenido.");
  };

  const renderDevice: ListRenderItem<ScannedDevice> = ({ item }) => (
    <View style={styles.deviceContainer}>
      <Text style={styles.deviceText}>
        Nombre: {item.name || "Dispositivo Desconocido"}
      </Text>
      <Text style={styles.deviceText}>ID: {item.id}</Text>
      <Text style={styles.deviceText}>RSSI: {item.rssi ?? "N/A"}</Text>
      <Text style={styles.deviceText}>Identifier: {item.identifier}</Text>
      <Text style={styles.deviceText}>Distance: {item.distance} </Text>

    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="Iniciar Escaneo" onPress={startScanning} disabled={scanning} />
      <Button title="Detener Escaneo" onPress={stopScanning} disabled={!scanning} />
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={renderDevice}
      />
      <Link href={"/showMap"} style={styles.button}>Map</Link>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  deviceContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#fff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  deviceText: {
    fontSize: 14,
    color: "#333",
  },
  button:{
    fontSize: 20,
    textAlign: "center",
    textDecorationLine: "underline",
    color: "black",
  },
});