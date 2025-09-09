import { IShip, IDepartment, IRole, ICruiseLine } from "../types/onboarding";

// Sample Cruise Lines Data
export const sampleCruiseLines: ICruiseLine[] = [
    {
        id: "1",
        name: "Royal Caribbean International",
        ships: [
            { id: "1", name: "Symphony of the Seas", cruiseLineId: "1", port: "Miami", isActive: true },
            { id: "2", name: "Harmony of the Seas", cruiseLineId: "1", port: "Port Canaveral", isActive: true },
            { id: "3", name: "Oasis of the Seas", cruiseLineId: "1", port: "Port Canaveral", isActive: true },
            { id: "4", name: "Allure of the Seas", cruiseLineId: "1", port: "Fort Lauderdale", isActive: true },
            { id: "5", name: "Independence of the Seas", cruiseLineId: "1", port: "Fort Lauderdale", isActive: true },
            { id: "6", name: "Freedom of the Seas", cruiseLineId: "1", port: "Port Canaveral", isActive: true },
        ]
    },
    {
        id: "2",
        name: "Carnival Cruise Line",
        ships: [
            { id: "7", name: "Mardi Gras", cruiseLineId: "2", port: "Port Canaveral", isActive: true },
            { id: "8", name: "Carnival Vista", cruiseLineId: "2", port: "Galveston", isActive: true },
            { id: "9", name: "Carnival Horizon", cruiseLineId: "2", port: "Miami", isActive: true },
            { id: "10", name: "Carnival Panorama", cruiseLineId: "2", port: "Long Beach", isActive: true },
            { id: "11", name: "Carnival Magic", cruiseLineId: "2", port: "Port Canaveral", isActive: true },
        ]
    },
    {
        id: "3",
        name: "Norwegian Cruise Line",
        ships: [
            { id: "12", name: "Norwegian Encore", cruiseLineId: "3", port: "Seattle", isActive: true },
            { id: "13", name: "Norwegian Bliss", cruiseLineId: "3", port: "Seattle", isActive: true },
            { id: "14", name: "Norwegian Joy", cruiseLineId: "3", port: "Los Angeles", isActive: true },
            { id: "15", name: "Norwegian Breakaway", cruiseLineId: "3", port: "New York", isActive: true },
            { id: "16", name: "Norwegian Getaway", cruiseLineId: "3", port: "Miami", isActive: true },
        ]
    },
    {
        id: "4",
        name: "Princess Cruises",
        ships: [
            { id: "17", name: "Discovery Princess", cruiseLineId: "4", port: "Los Angeles", isActive: true },
            { id: "18", name: "Enchanted Princess", cruiseLineId: "4", port: "Fort Lauderdale", isActive: true },
            { id: "19", name: "Sky Princess", cruiseLineId: "4", port: "Fort Lauderdale", isActive: true },
            { id: "20", name: "Regal Princess", cruiseLineId: "4", port: "Fort Lauderdale", isActive: true },
        ]
    },
    {
        id: "5",
        name: "Disney Cruise Line",
        ships: [
            { id: "21", name: "Disney Wish", cruiseLineId: "5", port: "Port Canaveral", isActive: true },
            { id: "22", name: "Disney Fantasy", cruiseLineId: "5", port: "Port Canaveral", isActive: true },
            { id: "23", name: "Disney Dream", cruiseLineId: "5", port: "Port Canaveral", isActive: true },
            { id: "24", name: "Disney Magic", cruiseLineId: "5", port: "Miami", isActive: true },
        ]
    },
    {
        id: "6",
        name: "Celebrity Cruises",
        ships: [
            { id: "25", name: "Celebrity Edge", cruiseLineId: "6", port: "Fort Lauderdale", isActive: true },
            { id: "26", name: "Celebrity Apex", cruiseLineId: "6", port: "Fort Lauderdale", isActive: true },
            { id: "27", name: "Celebrity Beyond", cruiseLineId: "6", port: "Fort Lauderdale", isActive: true },
            { id: "28", name: "Celebrity Reflection", cruiseLineId: "6", port: "Fort Lauderdale", isActive: true },
        ]
    },
    {
        id: "7",
        name: "Holland America Line",
        ships: [
            { id: "29", name: "Koningsdam", cruiseLineId: "7", port: "San Diego", isActive: true },
            { id: "30", name: "Nieuw Statendam", cruiseLineId: "7", port: "Fort Lauderdale", isActive: true },
            { id: "31", name: "Eurodam", cruiseLineId: "7", port: "Seattle", isActive: true },
        ]
    },
    {
        id: "8",
        name: "MSC Cruises",
        ships: [
            { id: "32", name: "MSC Seashore", cruiseLineId: "8", port: "Miami", isActive: true },
            { id: "33", name: "MSC Seascape", cruiseLineId: "8", port: "Miami", isActive: true },
            { id: "34", name: "MSC Meraviglia", cruiseLineId: "8", port: "New York", isActive: true },
        ]
    }
];

// Flattened ships array for backward compatibility
export const sampleShips: IShip[] = sampleCruiseLines.flatMap(cruiseLine => cruiseLine.ships);

// Sample Departments Data
export const sampleDepartments: IDepartment[] = [
    {
        id: "1",
        name: "Food & Beverage",
        subcategories: [
            { id: "1", name: "Restaurant Service", departmentId: "1" },
            { id: "2", name: "Bar Service", departmentId: "1" },
            { id: "3", name: "Culinary", departmentId: "1" },
            { id: "4", name: "Room Service", departmentId: "1" },
            { id: "5", name: "Catering", departmentId: "1" },
            { id: "6", name: "Specialty Dining", departmentId: "1" },
            { id: "7", name: "Buffet Service", departmentId: "1" },
            { id: "8", name: "Wine Service", departmentId: "1" },
        ]
    },
    {
        id: "2",
        name: "Entertainment",
        subcategories: [
            { id: "9", name: "Production Shows", departmentId: "2" },
            { id: "10", name: "Live Music", departmentId: "2" },
            { id: "11", name: "Activities", departmentId: "2" },
            { id: "12", name: "Sports & Recreation", departmentId: "2" },
        ]
    },
    {
        id: "3",
        name: "Guest Services",
        subcategories: [
            { id: "13", name: "Front Desk", departmentId: "3" },
            { id: "14", name: "Concierge", departmentId: "3" },
            { id: "15", name: "Housekeeping", departmentId: "3" },
            { id: "16", name: "Spa & Wellness", departmentId: "3" },
        ]
    },
    {
        id: "4",
        name: "Marine Operations",
        subcategories: [
            { id: "17", name: "Navigation", departmentId: "4" },
            { id: "18", name: "Engineering", departmentId: "4" },
            { id: "19", name: "Deck Operations", departmentId: "4" },
            { id: "20", name: "Safety & Security", departmentId: "4" },
        ]
    },
    {
        id: "5",
        name: "Retail & Services",
        subcategories: [
            { id: "21", name: "Shops", departmentId: "5" },
            { id: "22", name: "Photography", departmentId: "5" },
            { id: "23", name: "Art Gallery", departmentId: "5" },
            { id: "24", name: "Casino", departmentId: "5" },
        ]
    },
    {
        id: "6",
        name: "Youth Programs",
        subcategories: [
            { id: "25", name: "Kids Club", departmentId: "6" },
            { id: "26", name: "Teen Programs", departmentId: "6" },
            { id: "27", name: "Family Activities", departmentId: "6" },
        ]
    },
];

// Sample Roles Data
export const sampleRoles: IRole[] = [
    // Food & Beverage - Restaurant Service
    { id: "1", name: "Waiter/Waitress", subcategoryId: "1" },
    { id: "2", name: "Head Waiter", subcategoryId: "1" },
    { id: "3", name: "Restaurant Manager", subcategoryId: "1" },
    { id: "4", name: "Maitre D'", subcategoryId: "1" },
    
    // Food & Beverage - Bar Service
    { id: "5", name: "Bartender", subcategoryId: "2" },
    { id: "6", name: "Bar Manager", subcategoryId: "2" },
    { id: "7", name: "Sommelier", subcategoryId: "2" },
    
    // Food & Beverage - Culinary
    { id: "8", name: "Chef de Cuisine", subcategoryId: "3" },
    { id: "9", name: "Sous Chef", subcategoryId: "3" },
    { id: "10", name: "Line Cook", subcategoryId: "3" },
    { id: "11", name: "Pastry Chef", subcategoryId: "3" },
    
    // Entertainment - Production Shows
    { id: "12", name: "Dancer", subcategoryId: "9" },
    { id: "13", name: "Singer", subcategoryId: "9" },
    { id: "14", name: "Show Director", subcategoryId: "9" },
    { id: "15", name: "Stage Manager", subcategoryId: "9" },
    
    // Entertainment - Live Music
    { id: "16", name: "Musician", subcategoryId: "10" },
    { id: "17", name: "DJ", subcategoryId: "10" },
    { id: "18", name: "Music Director", subcategoryId: "10" },
    
    // Entertainment - Activities
    { id: "19", name: "Activity Host", subcategoryId: "11" },
    { id: "20", name: "Cruise Director", subcategoryId: "11" },
    { id: "21", name: "Social Host", subcategoryId: "11" },
    
    // Guest Services - Front Desk
    { id: "22", name: "Guest Services Agent", subcategoryId: "9" },
    { id: "23", name: "Guest Services Manager", subcategoryId: "9" },
    { id: "24", name: "Purser", subcategoryId: "9" },
    
    // Guest Services - Housekeeping
    { id: "25", name: "Stateroom Attendant", subcategoryId: "11" },
    { id: "26", name: "Housekeeping Supervisor", subcategoryId: "11" },
    { id: "27", name: "Housekeeping Manager", subcategoryId: "11" },
    
    // Marine Operations - Navigation
    { id: "28", name: "Captain", subcategoryId: "13" },
    { id: "29", name: "Chief Officer", subcategoryId: "13" },
    { id: "30", name: "Navigation Officer", subcategoryId: "13" },
    
    // Marine Operations - Engineering
    { id: "31", name: "Chief Engineer", subcategoryId: "14" },
    { id: "32", name: "Engineer", subcategoryId: "14" },
    { id: "33", name: "Electrician", subcategoryId: "14" },
    
    // Marine Operations - Deck Operations
    { id: "34", name: "Bosun", subcategoryId: "15" },
    { id: "35", name: "Able Seaman", subcategoryId: "15" },
    { id: "36", name: "Deck Hand", subcategoryId: "15" },
    
    // Marine Operations - Safety & Security
    { id: "37", name: "Security Officer", subcategoryId: "16" },
    { id: "38", name: "Safety Officer", subcategoryId: "16" },
    { id: "39", name: "Fire Safety Officer", subcategoryId: "16" },
    
    // Retail & Services - Shops
    { id: "40", name: "Sales Associate", subcategoryId: "17" },
    { id: "41", name: "Shop Manager", subcategoryId: "17" },
    { id: "42", name: "Jewelry Specialist", subcategoryId: "17" },
    
    // Retail & Services - Photography
    { id: "43", name: "Photographer", subcategoryId: "18" },
    { id: "44", name: "Photo Manager", subcategoryId: "18" },
    
    // Youth Programs
    { id: "45", name: "Youth Counselor", subcategoryId: "21" },
    { id: "46", name: "Youth Director", subcategoryId: "21" },
    { id: "47", name: "Teen Counselor", subcategoryId: "22" },
];
