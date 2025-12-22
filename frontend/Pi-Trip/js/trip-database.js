// Comprehensive Trip Database - 6 Popular Indian Road Trips
// Data sourced from tourism websites and travel guides

const tripDatabase = {
    'Delhi to Manali': {
        title: 'Delhi to Manali - Himalayan Road Trip',
        route: 'Delhi → Chandigarh → Kullu → Manali',
        distance: '540 km',
        duration: '5 Days / 4 Nights',
        category: 'Mountain',
        difficulty: 'Moderate',
        bestTime: 'March to June, September to November',
        budget: '₹25,000 - ₹35,000',
        heroImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1600&q=80',
        description: 'Experience the thrill of driving through the majestic Himalayas from Delhi to Manali. This scenic route takes you through lush valleys, pine forests, and snow-capped peaks. Stop at Chandigarh for its modern architecture, explore Kullu Valley, and finally reach the paradise of Manali.',
        highlights: [
            { icon: 'mountain', title: 'Rohtang Pass', desc: 'Snow-covered mountain pass at 13,050 ft' },
            { icon: 'tree', title: 'Solang Valley', desc: 'Adventure sports and stunning landscapes' },
            { icon: 'home', title: 'Hadimba Temple', desc: 'Ancient wooden temple in cedar forest' },
            { icon: 'activity', title: 'River Rafting', desc: 'Thrilling rapids in Beas River' },
            { icon: 'droplet', title: 'Jogini Falls', desc: 'Beautiful waterfall trek' },
            { icon: 'sun', title: 'Old Manali', desc: 'Hippie culture and cafes' }
        ],
        itinerary: [
            { day: 1, title: 'Delhi to Chandigarh', desc: 'Drive to Chandigarh (250 km). Visit Rock Garden, Sukhna Lake. Overnight stay.' },
            { day: 2, title: 'Chandigarh to Manali', desc: 'Scenic drive through hills (290 km). Check into hotel. Evening at Mall Road.' },
            { day: 3, title: 'Manali Sightseeing', desc: 'Visit Hadimba Temple, Vashisht Hot Springs, Old Manali. Adventure activities in Solang.' },
            { day: 4, title: 'Rohtang Pass Excursion', desc: 'Full day trip to Rohtang Pass (subject to permit). Snow activities and photography.' },
            { day: 5, title: 'Return to Delhi', desc: 'Start early morning. Lunch break in Chandigarh. Reach Delhi by evening.' }
        ],
        packing: [
            'Warm clothes & jackets',
            'Comfortable trekking shoes',
            'Sunglasses & sunscreen',
            'Camera with extra batteries',
            'First aid kit',
            'Valid ID & permits',
            'Cash (ATMs limited in hills)',
            'Medicines for altitude',
            'Power bank',
            'Reusable water bottle'
        ],
        amenities: [
            { icon: 'coffee', name: 'Restaurants & Dhabas' },
            { icon: 'zap', name: 'Fuel Stations' },
            { icon: 'home', name: 'Hotels & Resorts' },
            { icon: 'droplet', name: 'Clean Restrooms' },
            { icon: 'heart', name: 'Medical Facilities' },
            { icon: 'activity', name: 'Vehicle Service' }
        ],
        travelTips: [
            { type: 'safety', title: 'Drive Carefully', desc: 'Mountain roads can be narrow and winding. Drive slowly and use horn on blind turns.' },
            { type: 'health', title: 'Altitude Sickness', desc: 'Stay hydrated, avoid alcohol for first 24 hours. Carry Diamox if sensitive to altitude.' },
            { type: 'permits', title: 'Rohtang Pass Permit', desc: 'Online permit required (₹500). Book 2-3 days in advance at admis.hp.nic.in' },
            { type: 'weather', title: 'Check Weather', desc: 'Roads may close due to snow. Check weather and road conditions before departure.' },
            { type: 'fuel', title: 'Fuel Up', desc: 'Limited fuel stations in hills. Fill tank in Manali and carry extra fuel if going to Rohtang.' },
            { type: 'emergency', title: 'Emergency Numbers', desc: 'Police: 100, Ambulance: 108, Tourist Helpline: 177' }
        ],
        localInsights: [
            { icon: 'coffee', title: 'Best Dhabas', desc: 'Try Punjabi dhabas near Mandi for authentic food. Haveli Restaurant in Manali is famous.' },
            { icon: 'home', title: 'Stay Options', desc: 'Old Manali has budget hotels and hostels. Mall Road area for luxury resorts.' },
            { icon: 'star', title: 'Must-Try Food', desc: 'Siddu, Babru, Tudkiya Bhath (local Himachali dishes). Also try Tibetan momos.' },
            { icon: 'map', title: 'Hidden Gems', desc: 'Visit Naggar Castle, Jana Waterfall, and Hampta Pass for fewer crowds.' },
            { icon: 'sun', title: 'Best Photo Spots', desc: 'Atal Tunnel, Gulaba, Kothi Village, and Solang Valley during golden hour.' },
            { icon: 'zap', title: 'Network Coverage', desc: 'Airtel and BSNL work best. Jio has limited coverage. Get BSNL SIM in emergency.' }
        ]
    },
    
    'Mumbai to Goa': {
        title: 'Mumbai to Goa - Coastal Paradise',
        route: 'Mumbai → Pune → Kolhapur → Goa',
        distance: '480 km',
        duration: '4 Days / 3 Nights',
        category: 'Beach',
        difficulty: 'Easy',
        bestTime: 'October to March',
        budget: '₹20,000 - ₹30,000',
        heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1600&q=80',
        description: 'Cruise along the stunning Konkan coastline from Mumbai to Goa. Experience beautiful beaches, Portuguese heritage, vibrant nightlife, and delicious seafood. This route offers scenic coastal views, lush greenery, and endless opportunities for relaxation and adventure.',
        highlights: [
            { icon: 'sun', title: 'Pristine Beaches', desc: '40+ beautiful beaches to explore' },
            { icon: 'tree', title: 'Dudhsagar Falls', desc: 'Majestic waterfall in the jungle' },
            { icon: 'home', title: 'Portuguese Churches', desc: 'UNESCO World Heritage Sites' },
            { icon: 'coffee', title: 'Goan Cuisine', desc: 'Seafood and traditional flavors' },
            { icon: 'music', title: 'Beach Shacks', desc: 'Live music and nightlife' },
            { icon: 'star', title: 'Water Sports', desc: 'Parasailing, jet skiing, diving' }
        ],
        itinerary: [
            { day: 1, title: 'Mumbai to Pune', desc: 'Drive to Pune (150 km). Visit Shaniwar Wada. Continue to Kolhapur. Overnight stay.' },
            { day: 2, title: 'Kolhapur to Goa', desc: 'Drive through scenic Konkan route (230 km). Check into beach resort. Evening at Calangute Beach.' },
            { day: 3, title: 'North Goa Exploration', desc: 'Visit Fort Aguada, Baga Beach, Anjuna Flea Market. Water sports. Beach hopping. Nightlife.' },
            { day: 4, title: 'South Goa & Return', desc: 'Morning at Palolem Beach. Visit Basilica of Bom Jesus. Start return journey to Mumbai.' }
        ],
        packing: [
            'Light cotton clothes',
            'Swimwear & beach towel',
            'Sunscreen & sunglasses',
            'Flip flops & comfortable shoes',
            'Camera & waterproof case',
            'Party outfits',
            'Mosquito repellent',
            'Waterproof bag',
            'Cash for beach shacks',
            'Valid ID proof'
        ],
        amenities: [
            { icon: 'coffee', name: 'Beach Shacks & Restaurants' },
            { icon: 'zap', name: 'Fuel Stations' },
            { icon: 'home', name: 'Beach Resorts' },
            { icon: 'activity', name: 'Water Sports' },
            { icon: 'heart', name: 'Medical Centers' },
            { icon: 'map-pin', name: 'Parking Facilities' }
        ],
        travelTips: [
            { type: 'safety', title: 'Monsoon Driving', desc: 'Avoid June-September. Roads get slippery. Drive slow on ghats.' },
            { type: 'fuel', title: 'Fuel Stops', desc: 'Refuel at Pune or Kolhapur. Limited pumps on coastal route.' },
            { type: 'permits', title: 'No Permits', desc: 'No special permits needed. Just valid DL and vehicle papers.' },
            { type: 'weather', title: 'Best Season', desc: 'October-March is ideal. Pleasant weather, calm seas, perfect beaches.' },
            { type: 'health', title: 'Beach Safety', desc: 'Swim only at designated areas. Follow lifeguard instructions.' },
            { type: 'emergency', title: 'Helpline', desc: 'Goa Tourism: 0832-2438001, Tourist Police: 0832-2421200' }
        ],
        localInsights: [
            { icon: 'coffee', title: 'Food Spots', desc: 'Try fish curry rice at Souza Lobo, Baga. Vinayak for authentic Goan breakfast.' },
            { icon: 'home', title: 'Where to Stay', desc: 'North Goa for nightlife, South Goa for quiet beaches. Book early in Dec-Jan.' },
            { icon: 'star', title: 'Must-Try', desc: 'Bebinca (dessert), Pork Vindaloo, Fish Recheado, Feni (local spirit).' },
            { icon: 'map', title: 'Hidden Beaches', desc: 'Butterfly Beach, Cola Beach, Kakolem Beach - avoid crowds here.' },
            { icon: 'sun', title: 'Sunset Views', desc: 'Fort Aguada, Chapora Fort, and Vagator Beach for stunning sunsets.' },
            { icon: 'zap', title: 'Rent Two-Wheelers', desc: 'Rent scooter (₹300-500/day) to explore. Carry helmet and license.' }
        ]
    },
    
    'Bangalore to Ooty': {
        title: 'Bangalore to Ooty - Queen of Hills',
        route: 'Bangalore → Mysore → Ooty',
        distance: '280 km',
        duration: '3 Days / 2 Nights',
        category: 'Hill Station',
        difficulty: 'Easy',
        bestTime: 'October to June',
        budget: '₹15,000 - ₹22,000',
        heroImage: 'https://images.unsplash.com/photo-1598524506504-1e04dfb6bce1?w=1600&q=80',
        description: 'Journey through the Nilgiri Hills to Ooty, the Queen of Hill Stations. Experience tea gardens, colonial charm, scenic railways, and pleasant weather. This route offers winding roads, misty mountains, and the charm of South Indian hill station culture.',
        highlights: [
            { icon: 'tree', title: 'Tea Gardens', desc: 'Sprawling tea plantations and factories' },
            { icon: 'mountain', title: 'Doddabetta Peak', desc: 'Highest point in Nilgiris at 8,650 ft' },
            { icon: 'activity', title: 'Toy Train', desc: 'UNESCO Heritage Mountain Railway' },
            { icon: 'droplet', title: 'Ooty Lake', desc: 'Boating and scenic walking trails' },
            { icon: 'tree', title: 'Botanical Gardens', desc: '55-acre terraced gardens' },
            { icon: 'sun', title: 'Pykara Falls', desc: 'Picturesque waterfall and lake' }
        ],
        itinerary: [
            { day: 1, title: 'Bangalore to Mysore', desc: 'Drive to Mysore (150 km). Visit Mysore Palace, Chamundi Hills. Overnight stay.' },
            { day: 2, title: 'Mysore to Ooty', desc: 'Scenic drive through ghats (130 km). Visit tea factory. Evening at Ooty Lake.' },
            { day: 3, title: 'Ooty Sightseeing & Return', desc: 'Toy Train ride, Botanical Gardens, Doddabetta Peak. Return to Bangalore.' }
        ],
        packing: [
            'Light woolens',
            'Comfortable walking shoes',
            'Camera & binoculars',
            'Sunscreen & cap',
            'Raincoat (if monsoon)',
            'Snacks for journey',
            'Water bottle',
            'Cash for local markets',
            'Motion sickness tablets',
            'Valid ID proof'
        ],
        amenities: [
            { icon: 'coffee', name: 'Tea Shops & Restaurants' },
            { icon: 'zap', name: 'Fuel Stations' },
            { icon: 'home', name: 'Hill Resorts & Hotels' },
            { icon: 'activity', name: 'Tourist Services' },
            { icon: 'heart', name: 'Medical Facilities' },
            { icon: 'map-pin', name: 'Viewpoints & Parking' }
        ],
        travelTips: [
            { type: 'safety', title: 'Ghat Driving', desc: '36 hairpin bends. Drive in low gear. Use horn on turns. Avoid night driving.' },
            { type: 'weather', title: 'Pack Layers', desc: 'Temperature drops in evening. Carry light woolens even in summer.' },
            { type: 'permits', title: 'No Special Permits', desc: 'Just valid DL needed. Entry fee at Bandipur forest (₹300).' },
            { type: 'health', title: 'Motion Sickness', desc: 'Winding roads can cause nausea. Take breaks. Carry medicines.' },
            { type: 'fuel', title: 'Fill Up Early', desc: 'Last good pump before ghats at Gundlupet. Fill full tank.' },
            { type: 'emergency', title: 'Emergency Numbers', desc: 'Police: 100, Ambulance: 108, Forest Dept: 0423-2443977' }
        ],
        localInsights: [
            { icon: 'coffee', title: 'Tea Tasting', desc: 'Visit tea factories for free tasting. Buy fresh tea at wholesale prices.' },
            { icon: 'home', title: 'Stay Options', desc: 'Charing Cross area for budget hotels. Fernhill for luxury resorts.' },
            { icon: 'star', title: 'Local Food', desc: 'Try homemade chocolates, varkey (biscuit), and fresh strawberries.' },
            { icon: 'map', title: 'Less Crowded', desc: 'Skip Botanical Garden on weekends. Visit Emerald Lake, Avalanche instead.' },
            { icon: 'sun', title: 'Best Views', desc: 'Doddabetta Peak early morning for sunrise. Less fog before 9 AM.' },
            { icon: 'zap', title: 'Toy Train Tickets', desc: 'Book Nilgiri Mountain Railway 2-3 days advance. Limited seats.' }
        ]
    },
    
    'Jaipur to Udaipur': {
        title: 'Jaipur to Udaipur - Royal Rajasthan',
        route: 'Jaipur → Ajmer → Pushkar → Udaipur',
        distance: '395 km',
        duration: '4 Days / 3 Nights',
        category: 'Heritage',
        difficulty: 'Easy',
        bestTime: 'October to March',
        budget: '₹22,000 - ₹32,000',
        heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1600&q=80',
        description: 'Journey through the royal land of Rajasthan from the Pink City to the City of Lakes. Explore magnificent palaces, stunning forts, sacred Pushkar, and romantic Udaipur. Experience Rajput culture, colorful markets, and serene boat rides on Lake Pichola.',
        highlights: [
            { icon: 'home', title: 'City Palace', desc: 'Royal palace complex on Lake Pichola' },
            { icon: 'star', title: 'Lake Pichola', desc: 'Iconic lake with boat rides' },
            { icon: 'home', title: 'Amber Fort', desc: 'Magnificent hilltop fort in Jaipur' },
            { icon: 'sun', title: 'Pushkar Lake', desc: 'Sacred lake and temples' },
            { icon: 'camera', title: 'Hawa Mahal', desc: 'Iconic palace of winds' },
            { icon: 'star', title: 'Jagdish Temple', desc: 'Ancient Hindu temple' }
        ],
        itinerary: [
            { day: 1, title: 'Jaipur Sightseeing', desc: 'Visit Amber Fort, Hawa Mahal, City Palace, Jantar Mantar. Evening at local bazaar.' },
            { day: 2, title: 'Jaipur to Pushkar', desc: 'Drive to Pushkar (145 km). Visit Pushkar Lake, Brahma Temple. Camel safari. Overnight.' },
            { day: 3, title: 'Pushkar to Udaipur', desc: 'Drive to Udaipur (250 km). Check in. Evening boat ride on Lake Pichola.' },
            { day: 4, title: 'Udaipur Exploration', desc: 'City Palace, Jagdish Temple, Saheliyon ki Bari. Shopping. Return journey or extend stay.' }
        ],
        packing: [
            'Cotton clothes & light jacket',
            'Comfortable footwear',
            'Sunglasses & sunscreen',
            'Camera with memory cards',
            'Traditional outfit (optional)',
            'Cash for shopping',
            'Water bottle',
            'Hat or cap',
            'Power bank',
            'Valid ID proof'
        ],
        amenities: [
            { icon: 'coffee', name: 'Rajasthani Restaurants' },
            { icon: 'zap', name: 'Fuel Stations' },
            { icon: 'home', name: 'Heritage Hotels' },
            { icon: 'activity', name: 'Tourist Services' },
            { icon: 'heart', name: 'Medical Facilities' },
            { icon: 'map-pin', name: 'Palace Parking' }
        ],
        travelTips: [
            { type: 'safety', title: 'Highway Drive', desc: 'Good NH-48. Watch for speed cameras. Safe for solo travelers.' },
            { type: 'weather', title: 'Summer Heat', desc: 'Avoid May-June (45°C+). October-March is best. Carry water always.' },
            { type: 'permits', title: 'Entry Tickets', desc: 'City Palace combo ticket (₹1000) covers major sites. Book online.' },
            { type: 'health', title: 'Stay Hydrated', desc: 'Drink bottled water. Avoid street food initially. Heat can be intense.' },
            { type: 'fuel', title: 'Fuel Available', desc: 'Multiple pumps on route. No issue. Fill in cities for best prices.' },
            { type: 'emergency', title: 'Tourist Help', desc: 'Rajasthan Tourism: 1800-180-6666, Tourist Police: 100' }
        ],
        localInsights: [
            { icon: 'coffee', title: 'Must-Eat', desc: 'Dal Baati Churma, Laal Maas, Gatte ki Sabzi. Try Natraj or Handi for authentic food.' },
            { icon: 'home', title: 'Heritage Stays', desc: 'Stay in converted havelis near Pichola. Book Taj Lake Palace for luxury.' },
            { icon: 'star', title: 'Shopping', desc: 'Miniature paintings, Rajasthani jewelry, mojari shoes. Bargain at Hathi Pol Bazaar.' },
            { icon: 'map', title: 'Skip Crowds', desc: 'Visit Saheliyon ki Bari early morning. Monsoon Palace sunset less crowded.' },
            { icon: 'sun', title: 'Best Photos', desc: 'Lake Pichola boat ride during sunset. Rooftop cafes for City Palace views.' },
            { icon: 'zap', title: 'Local Transport', desc: 'Auto-rickshaws common. Fix fare before boarding. Ola/Uber available.' }
        ]
    },
    
    'Chennai to Pondicherry': {
        title: 'Chennai to Pondicherry - French Connection',
        route: 'Chennai → Mahabalipuram → Pondicherry',
        distance: '150 km',
        duration: '2 Days / 1 Night',
        category: 'Coastal',
        difficulty: 'Easy',
        bestTime: 'November to February',
        budget: '₹10,000 - ₹15,000',
        heroImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1600&q=80',
        description: 'A short coastal drive from Chennai to the charming French colony of Pondicherry. Experience French architecture, serene beaches, Auroville ashram, and delicious fusion cuisine. Perfect weekend getaway with colonial heritage and spiritual vibes.',
        highlights: [
            { icon: 'home', title: 'French Quarter', desc: 'Colonial buildings and cafes' },
            { icon: 'sun', title: 'Auroville', desc: 'Experimental township and Matrimandir' },
            { icon: 'star', title: 'Promenade Beach', desc: 'Rocky beach with lighthouse' },
            { icon: 'home', title: 'Shore Temple', desc: 'UNESCO World Heritage Site' },
            { icon: 'coffee', title: 'French Cafes', desc: 'Bakeries and bistros' },
            { icon: 'activity', title: 'Scuba Diving', desc: 'Underwater adventure' }
        ],
        itinerary: [
            { day: 1, title: 'Chennai to Pondicherry', desc: 'Stop at Mahabalipuram. Visit Shore Temple, Five Rathas. Reach Pondy. Evening at White Town.' },
            { day: 2, title: 'Pondicherry Exploration', desc: 'Visit Auroville, Paradise Beach, Sri Aurobindo Ashram. French Quarter walk. Return to Chennai.' }
        ],
        packing: [
            'Light summer clothes',
            'Beachwear',
            'Sunscreen & sunglasses',
            'Camera',
            'Comfortable sandals',
            'Cash for cafes',
            'Water bottle',
            'Hat',
            'Book for beach reading',
            'Valid ID proof'
        ],
        amenities: [
            { icon: 'coffee', name: 'French Cafes & Bakeries' },
            { icon: 'zap', name: 'Fuel Stations' },
            { icon: 'home', name: 'Boutique Hotels' },
            { icon: 'activity', name: 'Water Sports' },
            { icon: 'heart', name: 'Medical Centers' },
            { icon: 'map-pin', name: 'Beach Parking' }
        ],
        travelTips: [
            { type: 'safety', title: 'ECR Road', desc: 'East Coast Road is scenic but watch for speed breakers. Drive daytime.' },
            { type: 'weather', title: 'Hot & Humid', desc: 'Carry sunscreen, hat. October-February best. Avoid May-June heat.' },
            { type: 'permits', title: 'No Permits', desc: 'No special permits. Auroville entry free but Matrimandir needs advance booking.' },
            { type: 'health', title: 'Beach Safety', desc: 'Swim at designated beaches only. Strong currents. Follow lifeguard advice.' },
            { type: 'fuel', title: 'Easy Fuel', desc: 'Pumps every 20-30 km on ECR. No shortage. Premium fuel available.' },
            { type: 'emergency', title: 'Helpline', desc: 'Tourist Police: 0413-2336489, Ambulance: 108, Hospital: JIPMER' }
        ],
        localInsights: [
            { icon: 'coffee', title: 'Cafe Culture', desc: 'Baker Street, Cafe des Arts for French food. La Pasta for Italian. Book ahead on weekends.' },
            { icon: 'home', title: 'Where to Stay', desc: 'White Town for colonial charm. Auroville for quiet. Beach resorts on ECR.' },
            { icon: 'star', title: 'Must-Try Food', desc: 'French pastries, wood-fired pizza, seafood. Try local fish curry too.' },
            { icon: 'map', title: 'Less Known', desc: 'Paradise Beach (boat access), Arikamedu ruins, Karaikal beach - fewer tourists.' },
            { icon: 'sun', title: 'Best Spots', desc: 'Promenade Beach for sunrise. Rock Beach evening. Serenity Beach for sunset.' },
            { icon: 'zap', title: 'Rent Bikes', desc: 'Scooter rentals (₹300-500). Best way to explore. Carry license copy.' }
        ]
    },
    
    'Delhi to Agra': {
        title: 'Delhi to Agra - Taj Mahal Express',
        route: 'Delhi → Yamuna Expressway → Agra',
        distance: '230 km',
        duration: '1 Day / Same Day Return',
        category: 'Heritage',
        difficulty: 'Easy',
        bestTime: 'October to March',
        budget: '₹5,000 - ₹8,000',
        heroImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600&q=80',
        description: 'Quick day trip to witness the iconic Taj Mahal, one of the Seven Wonders of the World. Fast drive on Yamuna Expressway, visit magnificent Mughal monuments, and return same day. Perfect for first-time visitors to India.',
        highlights: [
            { icon: 'star', title: 'Taj Mahal', desc: 'UNESCO World Heritage Wonder' },
            { icon: 'home', title: 'Agra Fort', desc: 'Massive red sandstone fort' },
            { icon: 'sun', title: 'Mehtab Bagh', desc: 'Sunset view of Taj Mahal' },
            { icon: 'home', title: 'Fatehpur Sikri', desc: 'Ancient Mughal capital' },
            { icon: 'coffee', title: 'Mughlai Cuisine', desc: 'Authentic Mughal food' },
            { icon: 'map-pin', title: 'Marble Shopping', desc: 'Inlay work handicrafts' }
        ],
        itinerary: [
            { day: 1, title: 'Delhi to Agra Same Day', desc: 'Early morning start (6 AM). Reach Agra by 9 AM. Taj Mahal visit (sunrise). Agra Fort. Lunch. Optional: Fatehpur Sikri. Return to Delhi by evening.' }
        ],
        packing: [
            'Comfortable clothes',
            'Walking shoes',
            'Sunscreen & hat',
            'Camera (no tripods allowed)',
            'Water bottle',
            'Snacks',
            'Cash for entry tickets',
            'Power bank',
            'Valid photo ID (mandatory)',
            'Hand sanitizer'
        ],
        amenities: [
            { icon: 'coffee', name: 'Restaurants & Food Courts' },
            { icon: 'zap', name: 'Fuel Stations on Expressway' },
            { icon: 'home', name: 'Hotels (if overnight)' },
            { icon: 'activity', name: 'Tour Guides' },
            { icon: 'heart', name: 'Medical Facilities' },
            { icon: 'map-pin', name: 'Shopping Markets' }
        ],
        travelTips: [
            { type: 'safety', title: 'Early Start', desc: 'Leave Delhi by 6 AM to avoid traffic. Yamuna Expressway is safe and fast.' },
            { type: 'weather', title: 'Taj Timings', desc: 'Closed on Fridays. Go early (sunrise) to avoid crowds and heat.' },
            { type: 'permits', title: 'Entry Tickets', desc: 'Taj: ₹1050 (Indians ₹50). Book online to skip queues. Carry ID.' },
            { type: 'health', title: 'Walking', desc: 'Lots of walking at Taj and Fort. Wear comfortable shoes. Stay hydrated.' },
            { type: 'fuel', title: 'Expressway Fuel', desc: 'Multiple pumps on Yamuna Expressway. Fuel slightly costlier than cities.' },
            { type: 'emergency', title: 'Tourist Info', desc: 'UP Tourism: 0562-2226378, Tourist Police: 1800-180-5131' }
        ],
        localInsights: [
            { icon: 'coffee', title: 'Where to Eat', desc: 'Pinch of Spice for Mughlai. Shankara Vegis for pure veg. Skip hotels near Taj (overpriced).' },
            { icon: 'home', title: 'Day Trip vs Stay', desc: 'Same-day is doable. Stay if visiting Fatehpur Sikri too. Hotels near Taj expensive.' },
            { icon: 'star', title: 'Local Specialties', desc: 'Petha (sweet), Dalmoth (snack), Agra ka Samosa. Buy from Panchi or Panchhi Petha.' },
            { icon: 'map', title: 'Beyond Taj', desc: 'Agra Fort (must-see), Mehtab Bagh (Taj sunset view), Itmad-ud-Daulah (Baby Taj).' },
            { icon: 'sun', title: 'Photography', desc: 'Sunrise at Taj (golden light). Tripods not allowed. Selfie sticks banned.' },
            { icon: 'zap', title: 'Avoid Touts', desc: 'Many fake guides near Taj. Hire official guide (₹1500) or use audio guide.' }
        ]
    }
};

// Export for use in trip-details.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = tripDatabase;
}
