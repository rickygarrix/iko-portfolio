// components/map/MapComponent.tsx
import { GoogleMap, Marker } from "@react-google-maps/api";
import type { Store } from "@/types/store";

type Props = {
  isLoaded: boolean;
  mapCenter: { lat: number; lng: number };
  mapRef: React.MutableRefObject<google.maps.Map | null>;
  stores: Store[];
  activeStoreId: string | null;
  userLocation: { lat: number; lng: number } | null;
  onClickMarker: (store: Store, index: number) => void;
};

export default function MapComponent({
  isLoaded,
  mapCenter,
  mapRef,
  stores,
  activeStoreId,
  userLocation,
  onClickMarker,
}: Props) {
  if (!isLoaded) return null;

  return (
    <GoogleMap
      mapContainerStyle={{
        width: "100vw",
        height: "calc(100vh - 48px)",
      }}
      center={mapCenter}
      zoom={13}
      options={{ gestureHandling: "greedy", zoomControl: false }}
      onLoad={(map) => {
        mapRef.current = map;
      }}
    >
      {stores.map((store, i) => (
        <Marker
          key={store.id}
          position={{ lat: store.latitude!, lng: store.longitude! }}
          icon={{
            url: activeStoreId === store.id ? "/map/selectpin.svg" : "/map/pin.svg",
            scaledSize: new google.maps.Size(
              activeStoreId === store.id ? 40 : 52,
              activeStoreId === store.id ? 40 : 52
            ),
            anchor: new google.maps.Point(
              activeStoreId === store.id ? 20 : 26,
              activeStoreId === store.id ? 40 : 52
            ),
            labelOrigin: new google.maps.Point(
              activeStoreId === store.id ? 20 : 26,
              activeStoreId === store.id ? 50 : 64
            ),
          }}
          label={{
            text: store.name,
            color: "#000",
            fontSize: "12px",
            fontWeight: "bold",
          }}
          onClick={() => onClickMarker(store, i)}
        />
      ))}

      {userLocation && (
        <Marker
          position={userLocation}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#fff",
          }}
        />
      )}
    </GoogleMap>
  );
}