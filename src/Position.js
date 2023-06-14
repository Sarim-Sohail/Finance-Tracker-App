import { ActivityIndicator, StyleSheet, View, SafeAreaView } from "react-native";
import { useEffect, useState } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import themeConfig from "../themeConfig";


const Position = () => {
  const [initialRegion, setInitialRegion]= useState();
  const [pin, setpin] = useState();

  useEffect(() => {

    const mapsPermissionFunction = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      setInitialRegion({
        latitude: location?.coords?.latitude,
        longitude: location?.coords?.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.009,
      });
      setpin({
        latitude: location?.coords?.latitude,
        longitude: location?.coords?.longitude,
      });
    };
    mapsPermissionFunction();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {initialRegion ?
        (
          <MapView
            showsMyLocationButton={true}
            showsUserLocation={true}
            zoomControlEnabled={true}
            provider={PROVIDER_GOOGLE}
            initialRegion={initialRegion}
            style={styles.map}
          >
            <Marker
              coordinate={pin}
              title={"Your current Location"}
              description={"You are here"}
            />
          </MapView>
        ) :
        (
          <View style={styles.loadingContainer}>
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="large" color={themeConfig.primary} />
        </View>
      </View>
        )
      }
    </SafeAreaView>
  );
};

export default Position;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIndicator: {
    flex: 1,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    color: themeConfig.primary,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: themeConfig.white,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});