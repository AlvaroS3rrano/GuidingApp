import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{headerTitle: "Show Beacons"}}/>
      <Stack.Screen name="showMap" options={{headerTitle: "Map"}}/>
    </Stack>
  );
}
