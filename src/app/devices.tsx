import React, { useEffect } from 'react'
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { useWearableSession } from '@/hooks/useWearableSession'
import { useWearableStore } from '@/stores/wearable-store'

export default function DevicesScreen() {
  const { scan, connect, disconnect } = useWearableSession()
  const availableDevices = useWearableStore((state) => state.availableDevices)
  const connectedDevice = useWearableStore((state) => state.connectedDevice)
  const connectionStatus = useWearableStore((state) => state.connectionStatus)
  const lastSessionDraft = useWearableStore((state) => state.lastSessionDraft)

  useEffect(() => {
    scan().catch(() => undefined)
  }, [scan])

  const handleConnect = async (deviceId: string) => {
    try {
      await connect(deviceId)
    } catch (error) {
      Alert.alert('No se pudo conectar', getErrorMessage(error))
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
    } catch (error) {
      Alert.alert('No se pudo desconectar', getErrorMessage(error))
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dispositivos wearable</Text>
        <Text>Fase 1: pulsometro BLE + GPS del telefono.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estado</Text>
          <Text>Conexion: {connectionStatus}</Text>
          <Text>Dispositivo activo: {connectedDevice?.device_name ?? 'Ninguno'}</Text>
          {connectedDevice ? (
            <Button title="Desconectar" onPress={handleDisconnect} />
          ) : (
            <Button title="Buscar dispositivos" onPress={() => void scan()} />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Disponibles</Text>
          {connectionStatus === 'scanning' ? (
            <ActivityIndicator />
          ) : (
            <FlatList
              data={availableDevices}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={<Text>No se detectaron dispositivos.</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.row} onPress={() => void handleConnect(item.id)}>
                  <View>
                    <Text style={styles.rowTitle}>{item.device_name}</Text>
                    <Text>{item.manufacturer} {item.model}</Text>
                  </View>
                  <Text>{connectedDevice?.id === item.id ? 'Conectado' : 'Conectar'}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {lastSessionDraft && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ultima sesion wearable</Text>
            <Text>Proveedor: {lastSessionDraft.provider}</Text>
            <Text>Duracion: {lastSessionDraft.duration_s ?? 0}s</Text>
            <Text>Distancia: {lastSessionDraft.distance_km ?? 0} km</Text>
            <Text>Promedio FC: {lastSessionDraft.avg_heart_rate ?? 0} bpm</Text>
            <Text>Max FC: {lastSessionDraft.max_heart_rate ?? 0} bpm</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Error desconocido'
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, gap: 16 },
  title: { fontSize: 28, fontWeight: '700' },
  card: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowTitle: { fontWeight: '600' },
})
