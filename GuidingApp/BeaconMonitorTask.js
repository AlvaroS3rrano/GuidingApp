const region = {
  identifier: 'AllBeacons', // Identificador único para la región
  uuid: null, // Al establecer uuid como null, se detectarán todos los beacons
};
  
async function startBeaconMonitoring(){
  console.log("hola1")
  if (Platform.OS === 'ios') {
    Beacons.startUpdatingLocation();
  }

  // add codes to handle events returned by the monitoring beacons
  // ... e.g.
  if (Platform.OS === 'android') {
    Beacons.BeaconsEventEmitter.removeAllListeners();
  }

  if (Platform.OS === 'android') {
    console.log("hola2")
    // Escuchar el evento de conexión del servicio de beacons
    Beacons.BeaconsEventEmitter.addListener('beaconServiceConnected', async () => {
      try {
        await Beacons.startMonitoringForRegion(region);
        console.log(`Monitoreo de beacons en la región ${region.identifier} iniciado correctamente`);
      } catch (error) {
        console.error(`Error al iniciar el monitoreo de la región ${region.identifier}:`, error);
      }
    });
  } 

  if (Platform.OS === 'ios') {
    try {
      await Beacons.startMonitoringForRegion(region);
      console.log(`Monitoreo de beacons en la región ${region.identifier} iniciado correctamente`);
    } catch (error) {
      console.error(`Error al iniciar el monitoreo de la región ${region.identifier}:`, error);
    }
  }

  this.regionDidEnterEvent = Beacons.BeaconsEventEmitter.addListener(
    'regionDidEnter',
    (data) => {
      // good place for background tasks
      console.log('region did enter');
      // do something
    },
  );
  
  this.regionDidExitEvent = Beacons.BeaconsEventEmitter.addListener(
    'regionDidExit',
    (data) => {
      // good place for background tasks
      console.log('region did exit');
      // do something
    },
  );
};

export default startBeaconMonitoring;