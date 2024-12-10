import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet, ListRenderItem } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";
import base64 from 'react-native-base64';
import requestPermissions from "@/resources/permissions";

const bleManager = new BleManager();

const TARGET_SERVICE_UUID = "0000fe9a-0000-1000-8000-00805f9b34fb";

interface ScannedDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  serviceData: string | null;
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
        // Avoid duplicates using device ID
        setDevices((prevDevices) => {
          console.log(scannedDevice.serviceData)
          const deviceExists = prevDevices.some(
            (device) => device.id === scannedDevice.id
          );
          if (!deviceExists) {
            return [
              ...prevDevices,
              {
                id: scannedDevice.id,
                name: scannedDevice.name,
                rssi: scannedDevice.rssi,
                serviceData: decodedData,
              },
            ];
          }
          return prevDevices;
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
      <Text style={styles.deviceText}>Datos de Servicio: {item.serviceData}</Text>
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
});