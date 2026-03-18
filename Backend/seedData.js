const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const ParkingArea = require('./models/ParkingArea');
const ParkingSlot = require('./models/ParkingSlot');
const Booking = require('./models/Booking');

dotenv.config();

// Attempt to use Google DNS to resolve Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const cities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 
  'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
  'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara'
];

const locations = [
  'Railway Station', 'Airport', 'City Center Mall', 'IT Park', 
  'Connaught Place', 'MG Road', 'Cyber City', 'Hitech City',
  'Marine Drive', 'Juhu Beach', 'Salt Lake Sector V', 'Anna Salai',
  'Brigade Road', 'Commercial Street', 'Gachibowli', 'Kukatpally',
  'Sector 18', 'Chandni Chowk', 'Bandra Kurla Complex', 'Navi Mumbai',
  'Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City',
  'Ameerpet', 'Banjara Hills', 'Jubilee Hills', 'HITEC City',
  'T. Nagar', 'Adyar', 'Velachery', 'Nungambakkam',
  'Park Street', 'New Town', 'Rajarhat', 'Esplanade',
  'Camp', 'Koregaon Park', 'Hinjewadi', 'Viman Nagar',
  'C.G. Road', 'Ashram Road', 'Satellite', 'Prahlad Nagar'
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data (but keep users/admin as requested in previous sessions)
    // Actually, the user asked to add 70 locations, implying a fresh set might be better or additive.
    // Given the "sample" context, let's clear existing areas/slots to avoid duplicates.
    await ParkingSlot.deleteMany({});
    await ParkingArea.deleteMany({});
    await Booking.deleteMany({}); // Optional: clear bookings if they refer to deleted slots
    console.log('Cleared existing parking data...');

    const areaPromises = [];
    const citiesWithLocations = [];

    // Generate ~75 combinations to ensure we hit at least 70
    for (let i = 0; i < 75; i++) {
        const city = cities[Math.floor(Math.random() * cities.length)];
        const locName = locations[Math.floor(Math.random() * locations.length)];
        const name = `${city} ${locName} Parking`;
        const location = `${locName}, ${city}`;
        
        const totalSlots = Math.floor(Math.random() * (30 - 10 + 1)) + 10; // 10 to 30 slots
        const pricePerHour = Math.floor(Math.random() * (150 - 40 + 1)) + 40; // ₹40 to ₹150

        areaPromises.push(new ParkingArea({
            name,
            location,
            totalSlots,
            pricePerHour,
            description: `Premium parking facility in the heart of ${city}. Secure, monitored, and open 24/7.`
        }).save());
    }

    const savedAreas = await Promise.all(areaPromises);
    console.log(`Saved ${savedAreas.length} Parking Areas.`);

    const slotPromises = [];
    for (const area of savedAreas) {
        for (let j = 1; j <= area.totalSlots; j++) {
            slotPromises.push(new ParkingSlot({
                parkingArea: area._id,
                slotNumber: j,
                status: 'available'
            }).save());
        }
    }

    await Promise.all(slotPromises);
    console.log(`Saved slots for all areas.`);

    console.log('Successfully seeded 70+ locations with random slots!');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
