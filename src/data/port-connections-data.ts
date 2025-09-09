import { IPortConnection, IPort } from "../types/port-connections";
import { sampleCruiseLines } from "./onboarding-data";

// Sample Ports Data
export const samplePorts: IPort[] = [
    { id: "1", name: "Miami, FL", country: "USA" },
    { id: "2", name: "Fort Lauderdale, FL", country: "USA" },
    { id: "3", name: "Port Canaveral, FL", country: "USA" },
    { id: "4", name: "Tampa, FL", country: "USA" },
    { id: "5", name: "New York, NY", country: "USA" },
    { id: "6", name: "Los Angeles, CA", country: "USA" },
    { id: "7", name: "Seattle, WA", country: "USA" },
    { id: "8", name: "Cozumel, Mexico", country: "Mexico" },
    { id: "9", name: "Nassau, Bahamas", country: "Bahamas" },
    { id: "10", name: "St. Thomas, USVI", country: "US Virgin Islands" },
    { id: "11", name: "Barcelona, Spain", country: "Spain" },
    { id: "12", name: "Rome (Civitavecchia), Italy", country: "Italy" },
    { id: "13", name: "Southampton, UK", country: "United Kingdom" },
    { id: "14", name: "Singapore", country: "Singapore" },
    { id: "15", name: "Dubai, UAE", country: "United Arab Emirates" }
];

// Sample Port Connections Data
export const samplePortConnections: IPortConnection[] = [
    {
        id: "1",
        userId: "user1",
        userDisplayName: "John Smith",
        userRole: "Senior Waiter",
        shipId: "ship1",
        shipName: "Harmony of the Seas",
        portName: "Miami, FL",
        dockedWithShipId: "ship2",
        dockedWithShipName: "Symphony of the Seas",
        date: "2024-03-15",
        createdAt: "2024-03-15T08:00:00Z",
        status: "active"
    },
    {
        id: "2",
        userId: "user2",
        userDisplayName: "Sarah Johnson",
        userRole: "Chef de Cuisine",
        shipId: "ship1",
        shipName: "Harmony of the Seas",
        portName: "Miami, FL",
        dockedWithShipId: "ship2",
        dockedWithShipName: "Symphony of the Seas",
        date: "2024-03-15",
        createdAt: "2024-03-15T08:30:00Z",
        status: "active"
    },
    {
        id: "3",
        userId: "user3",
        userDisplayName: "Mike Chen",
        userRole: "Bartender",
        shipId: "ship2",
        shipName: "Symphony of the Seas",
        portName: "Miami, FL",
        dockedWithShipId: "ship1",
        dockedWithShipName: "Harmony of the Seas",
        date: "2024-03-15",
        createdAt: "2024-03-15T09:00:00Z",
        status: "active"
    },
    {
        id: "4",
        userId: "user4",
        userDisplayName: "Lisa Rodriguez",
        userRole: "Entertainment Host",
        shipId: "ship2",
        shipName: "Symphony of the Seas",
        portName: "Miami, FL",
        dockedWithShipId: "ship1",
        dockedWithShipName: "Harmony of the Seas",
        date: "2024-03-15",
        createdAt: "2024-03-15T09:15:00Z",
        status: "active"
    },
    {
        id: "5",
        userId: "user5",
        userDisplayName: "Emma Thompson",
        userRole: "Guest Services Agent",
        shipId: "ship3",
        shipName: "Carnival Vista",
        portName: "Fort Lauderdale, FL",
        dockedWithShipId: "ship4",
        dockedWithShipName: "Carnival Horizon",
        date: "2024-03-15",
        createdAt: "2024-03-15T10:00:00Z",
        status: "active"
    }
];

// Helper Functions
export const getConnectionsForPort = (portName: string, date: string): IPortConnection[] => {
    return samplePortConnections.filter(connection => 
        connection.portName === portName && 
        connection.date === date && 
        connection.status === 'active'
    );
};

export const getConnectionsForShip = (shipId: string, date: string): IPortConnection[] => {
    return samplePortConnections.filter(connection => 
        connection.shipId === shipId && 
        connection.date === date && 
        connection.status === 'active'
    );
};

export const getCrewInSamePort = (portName: string, shipId: string, date: string): IPortConnection[] => {
    const portConnections = getConnectionsForPort(portName, date);
    const shipConnections = getConnectionsForShip(shipId, date);
    
    // Find ships that are docked together
    const connectedShipIds = new Set<string>();
    shipConnections.forEach(connection => {
        connectedShipIds.add(connection.dockedWithShipId);
    });
    
    // Return crew from connected ships (excluding current ship)
    return portConnections.filter(connection => 
        connectedShipIds.has(connection.shipId) && 
        connection.shipId !== shipId
    );
};

export const isShipDockedInPort = (shipId: string, portName: string, date: string): boolean => {
    return samplePortConnections.some(connection => 
        connection.shipId === shipId && 
        connection.portName === portName && 
        connection.date === date && 
        connection.status === 'active'
    );
};

export const getAvailableShipsForPort = (portName: string, date: string) => {
    // Get all ships that could potentially be in this port
    const allShips = sampleCruiseLines.flatMap(cruiseLine => 
        cruiseLine.ships.map(ship => ({
            ...ship,
            cruiseLineName: cruiseLine.name
        }))
    );
    
    // Filter ships that are already marked as docked in this port
    const dockedShipIds = new Set(
        samplePortConnections
            .filter(conn => conn.portName === portName && conn.date === date)
            .map(conn => conn.shipId)
    );
    
    return allShips.filter(ship => !dockedShipIds.has(ship.id));
};

export const getConnectionDuration = (connection: IPortConnection): string => {
    const created = new Date(connection.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
        return "Just now";
    } else if (diffHours < 24) {
        return `${diffHours} hours ago`;
    } else {
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} days ago`;
    }
};
