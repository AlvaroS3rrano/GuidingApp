// MapDataLogger.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MapService } from "@/app/services/mapService";

export default function MapDataLogger() {
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await MapService.getAllMapData();
        console.log("MapData received:", data);
      } catch (error) {
        console.error("Error fetching MapData:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Revisa la consola para ver la información recibida.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
