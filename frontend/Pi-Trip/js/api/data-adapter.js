/**
 * Data Adapter for Government Tourism APIs
 * Transforms various API formats into consistent app data structure
 */

class TourismDataAdapter {
    
    /**
     * Transform data.gov.in response
     */
    transformDataGovIn(apiResponse) {
        if (!apiResponse || !apiResponse.records) return null;
        
        const records = apiResponse.records;
        
        return {
            description: records[0]?.description || '',
            images: this.extractImages(records),
            highlights: this.extractHighlights(records),
            attractions: records.map(r => ({
                name: r.attraction_name,
                description: r.attraction_description,
                category: r.category
            })),
            bestTime: records[0]?.best_time_to_visit || '',
            state: records[0]?.state || '',
            district: records[0]?.district || ''
        };
    }

    /**
     * Transform Incredible India API response
     */
    transformIncredibleIndia(apiResponse) {
        if (!apiResponse || !apiResponse.destination) return null;
        
        const dest = apiResponse.destination;
        
        return {
            description: dest.overview || dest.description || '',
            images: dest.media?.images?.map(img => ({
                url: img.url,
                caption: img.caption,
                credit: 'Ministry of Tourism'
            })) || [],
            highlights: dest.highlights?.map(h => ({
                icon: this.categoryToIcon(h.category),
                title: h.title,
                description: h.description
            })) || [],
            attractions: dest.places_to_visit || [],
            bestTime: dest.when_to_visit || '',
            activities: dest.things_to_do || []
        };
    }

    /**
     * Transform State Tourism API response
     */
    transformStateTourism(apiResponse) {
        if (!apiResponse) return null;
        
        return {
            description: apiResponse.description || '',
            images: apiResponse.gallery || [],
            highlights: apiResponse.key_features || [],
            attractions: apiResponse.tourist_spots || [],
            localInfo: {
                cuisine: apiResponse.local_cuisine || [],
                festivals: apiResponse.festivals || [],
                shopping: apiResponse.shopping || []
            }
        };
    }

    /**
     * Transform ASI Monument data
     */
    transformASIData(apiResponse) {
        if (!apiResponse || !apiResponse.monuments) return null;
        
        return apiResponse.monuments.map(monument => ({
            name: monument.monument_name,
            type: monument.monument_type,
            period: monument.historical_period,
            significance: monument.significance,
            location: monument.location,
            protected: true,
            unescoSite: monument.unesco_site || false
        }));
    }

    /**
     * Extract images from various formats
     */
    extractImages(records) {
        const images = [];
        
        records.forEach(record => {
            // Check multiple possible image field names
            const imageFields = ['image_url', 'photo', 'picture', 'thumbnail', 'media'];
            
            imageFields.forEach(field => {
                if (record[field]) {
                    images.push({
                        url: record[field],
                        alt: record.name || record.title || '',
                        source: 'government'
                    });
                }
            });
        });
        
        return images;
    }

    /**
     * Extract highlights from records
     */
    extractHighlights(records) {
        const highlights = [];
        
        records.forEach(record => {
            if (record.highlights) {
                // If highlights is an array
                if (Array.isArray(record.highlights)) {
                    record.highlights.forEach(h => {
                        highlights.push({
                            icon: this.categoryToIcon(h.category || 'general'),
                            title: h.title || h.name,
                            description: h.description || ''
                        });
                    });
                }
                // If highlights is a string
                else if (typeof record.highlights === 'string') {
                    highlights.push({
                        icon: 'star',
                        title: record.name,
                        description: record.highlights
                    });
                }
            }
        });
        
        return highlights;
    }

    /**
     * Map category to icon name
     */
    categoryToIcon(category) {
        const iconMap = {
            'adventure': 'activity',
            'nature': 'tree',
            'heritage': 'home',
            'spiritual': 'sun',
            'beach': 'droplet',
            'mountain': 'mountain',
            'culture': 'star',
            'food': 'coffee',
            'shopping': 'map-pin',
            'nightlife': 'music',
            'wildlife': 'tree',
            'photography': 'camera',
            'trekking': 'activity',
            'watersports': 'droplet',
            'general': 'map'
        };
        
        return iconMap[category?.toLowerCase()] || 'star';
    }

    /**
     * Generate itinerary from destination data
     */
    generateItinerary(destinationData, days = 5) {
        const itinerary = [];
        const attractions = destinationData.attractions || [];
        const attractionsPerDay = Math.ceil(attractions.length / days);
        
        for (let day = 1; day <= days; day++) {
            const dayAttractions = attractions.slice(
                (day - 1) * attractionsPerDay,
                day * attractionsPerDay
            );
            
            itinerary.push({
                day: day,
                title: `Day ${day} - ${this.getDayTitle(day, dayAttractions)}`,
                description: this.getDayDescription(day, dayAttractions),
                attractions: dayAttractions
            });
        }
        
        return itinerary;
    }

    /**
     * Generate day title
     */
    getDayTitle(day, attractions) {
        if (day === 1) return 'Arrival & City Exploration';
        if (attractions.length > 0) return attractions[0].name || 'Sightseeing';
        return 'Exploration Day';
    }

    /**
     * Generate day description
     */
    getDayDescription(day, attractions) {
        if (attractions.length === 0) return 'Free day for leisure activities';
        
        const places = attractions.map(a => a.name).join(', ');
        return `Visit ${places}. Explore local culture and cuisine.`;
    }

    /**
     * Generate packing list based on destination
     */
    generatePackingList(destinationData) {
        const packingList = [
            'Valid ID proof',
            'Travel insurance documents',
            'First aid kit',
            'Phone charger & power bank',
            'Camera'
        ];
        
        // Add climate-specific items
        if (destinationData.bestTime?.includes('Winter') || 
            destinationData.name?.includes('Manali') ||
            destinationData.name?.includes('Shimla')) {
            packingList.push(
                'Warm clothes & jackets',
                'Thermal wear',
                'Gloves & woolen caps',
                'Medicines for altitude'
            );
        } else if (destinationData.name?.includes('Goa') ||
                   destinationData.name?.includes('Kerala')) {
            packingList.push(
                'Sunscreen & sunglasses',
                'Light cotton clothes',
                'Swimwear',
                'Beach accessories'
            );
        }
        
        // Add activity-specific items
        if (destinationData.activities?.includes('trekking') ||
            destinationData.activities?.includes('hiking')) {
            packingList.push('Trekking shoes', 'Backpack', 'Water bottle');
        }
        
        return packingList;
    }

    /**
     * Generate amenities list
     */
    generateAmenities(destinationData) {
        return [
            { icon: 'coffee', name: 'Restaurants & Cafes' },
            { icon: 'zap', name: 'Fuel Stations' },
            { icon: 'home', name: 'Hotels & Resorts' },
            { icon: 'droplet', name: 'Clean Restrooms' },
            { icon: 'heart', name: 'Medical Facilities' },
            { icon: 'activity', name: 'Tourist Information' }
        ];
    }

    /**
     * Merge multiple API responses
     */
    mergeResponses(...responses) {
        const merged = {
            description: '',
            images: [],
            highlights: [],
            attractions: [],
            activities: [],
            bestTime: '',
            packing: [],
            amenities: []
        };
        
        responses.forEach(response => {
            if (!response) return;
            
            // Prefer longer descriptions
            if (response.description && response.description.length > merged.description.length) {
                merged.description = response.description;
            }
            
            // Merge arrays, remove duplicates
            if (response.images) merged.images.push(...response.images);
            if (response.highlights) merged.highlights.push(...response.highlights);
            if (response.attractions) merged.attractions.push(...response.attractions);
            if (response.activities) merged.activities.push(...response.activities);
            
            // Use first available bestTime
            if (!merged.bestTime && response.bestTime) {
                merged.bestTime = response.bestTime;
            }
        });
        
        // Remove duplicate images
        merged.images = this.deduplicateImages(merged.images);
        
        return merged;
    }

    /**
     * Remove duplicate images
     */
    deduplicateImages(images) {
        const seen = new Set();
        return images.filter(img => {
            const key = img.url || img.src;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    /**
     * Validate and clean data
     */
    validateData(data) {
        // Ensure required fields exist
        if (!data.description) {
            data.description = 'Explore this beautiful destination in India.';
        }
        
        if (!data.images || data.images.length === 0) {
            data.images = [{
                url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&q=80&fm=jpg&crop=entropy&cs=tinysrgb',
                alt: 'India Tourism',
                source: 'unsplash'
            }];
        }
        
        if (!data.highlights || data.highlights.length === 0) {
            data.highlights = [
                { icon: 'star', title: 'Amazing Experience', description: 'Unforgettable journey' }
            ];
        }
        
        return data;
    }
}

// Export singleton
const dataAdapter = new TourismDataAdapter();
