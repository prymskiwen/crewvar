import { IShip, IDepartment, ISubcategory, IRole } from "../types/onboarding";

// Sample Ships Data
export const sampleShips: IShip[] = [
    { id: "1", name: "Royal Caribbean Symphony of the Seas", port: "Miami", isActive: true },
    { id: "2", name: "Carnival Mardi Gras", port: "Port Canaveral", isActive: true },
    { id: "3", name: "Norwegian Encore", port: "Seattle", isActive: true },
    { id: "4", name: "Disney Wish", port: "Port Canaveral", isActive: true },
    { id: "5", name: "Celebrity Edge", port: "Fort Lauderdale", isActive: true },
    { id: "6", name: "Princess Discovery Princess", port: "Los Angeles", isActive: true },
    { id: "7", name: "Holland America Koningsdam", port: "San Diego", isActive: true },
    { id: "8", name: "MSC Seashore", port: "Miami", isActive: true },
];

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
        ]
    },
    {
        id: "2",
        name: "Entertainment",
        subcategories: [
            { id: "5", name: "Production Shows", departmentId: "2" },
            { id: "6", name: "Live Music", departmentId: "2" },
            { id: "7", name: "Activities", departmentId: "2" },
            { id: "8", name: "Sports & Recreation", departmentId: "2" },
        ]
    },
    {
        id: "3",
        name: "Guest Services",
        subcategories: [
            { id: "9", name: "Front Desk", departmentId: "3" },
            { id: "10", name: "Concierge", departmentId: "3" },
            { id: "11", name: "Housekeeping", departmentId: "3" },
            { id: "12", name: "Spa & Wellness", departmentId: "3" },
        ]
    },
    {
        id: "4",
        name: "Marine Operations",
        subcategories: [
            { id: "13", name: "Navigation", departmentId: "4" },
            { id: "14", name: "Engineering", departmentId: "4" },
            { id: "15", name: "Deck Operations", departmentId: "4" },
            { id: "16", name: "Safety & Security", departmentId: "4" },
        ]
    },
    {
        id: "5",
        name: "Retail & Services",
        subcategories: [
            { id: "17", name: "Shops", departmentId: "5" },
            { id: "18", name: "Photography", departmentId: "5" },
            { id: "19", name: "Art Gallery", departmentId: "5" },
            { id: "20", name: "Casino", departmentId: "5" },
        ]
    },
    {
        id: "6",
        name: "Youth Programs",
        subcategories: [
            { id: "21", name: "Kids Club", departmentId: "6" },
            { id: "22", name: "Teen Programs", departmentId: "6" },
            { id: "23", name: "Family Activities", departmentId: "6" },
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
    { id: "12", name: "Dancer", subcategoryId: "5" },
    { id: "13", name: "Singer", subcategoryId: "5" },
    { id: "14", name: "Show Director", subcategoryId: "5" },
    { id: "15", name: "Stage Manager", subcategoryId: "5" },
    
    // Entertainment - Live Music
    { id: "16", name: "Musician", subcategoryId: "6" },
    { id: "17", name: "DJ", subcategoryId: "6" },
    { id: "18", name: "Music Director", subcategoryId: "6" },
    
    // Entertainment - Activities
    { id: "19", name: "Activity Host", subcategoryId: "7" },
    { id: "20", name: "Cruise Director", subcategoryId: "7" },
    { id: "21", name: "Social Host", subcategoryId: "7" },
    
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
