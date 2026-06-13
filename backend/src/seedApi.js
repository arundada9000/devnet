const zones = [
  { name: 'Lumbini Provincial Hospital', type: 'hospital', coordinates: [83.468, 27.700], address: 'Hospital Line, Butwal', phone: '071-540300' },
  { name: 'Area Police Office Butwal', type: 'police', coordinates: [83.450, 27.710], address: 'Rajmarg Chauraha, Butwal', phone: '100' },
  { name: 'Lumbini Engineering College Shelter', type: 'shelter', coordinates: [83.475, 27.680], address: 'Bhalwari, Rupandehi', phone: '071-561030' },
  { name: 'Butwal Fire Brigade', type: 'fire_station', coordinates: [83.462, 27.705], address: 'Amarpath, Butwal', phone: '101' },
  { name: 'Devinagar Relief Distribution Center', type: 'distribution', coordinates: [83.480, 27.690], address: 'Devinagar, Butwal-11', phone: '9800000000' }
];

async function seed() {
  for (const zone of zones) {
    try {
      const res = await fetch('http://localhost:3000/api/safe-zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zone)
      });
      const data = await res.json();
      console.log(`Seeded: ${data.name}`);
    } catch (e) {
      console.error(e);
    }
  }
}

seed();
