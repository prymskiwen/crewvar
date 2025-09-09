import { createContext, useContext, useState, ReactNode } from 'react';
import { IPortConnection, IPortConnectionContext } from '../types/port-connections';
import { samplePortConnections } from '../data/port-connections-data';

const PortConnectionContext = createContext<IPortConnectionContext | undefined>(undefined);

interface PortConnectionProviderProps {
    children: ReactNode;
}

export const PortConnectionProvider = ({ children }: PortConnectionProviderProps) => {
    const [portConnections, setPortConnections] = useState<IPortConnection[]>(samplePortConnections);

    const addPortConnection = async (connectionData: Omit<IPortConnection, 'id' | 'createdAt' | 'status'>): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newConnection: IPortConnection = {
                    ...connectionData,
                    id: `connection_${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    status: 'active'
                };
                
                setPortConnections(prev => [...prev, newConnection]);
                console.log('Port connection added:', newConnection);
                resolve();
            }, 500);
        });
    };

    const removePortConnection = async (connectionId: string): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                setPortConnections(prev => prev.filter(conn => conn.id !== connectionId));
                console.log('Port connection removed:', connectionId);
                resolve();
            }, 500);
        });
    };

    const getConnectionsForPort = (portName: string, date: string): IPortConnection[] => {
        return portConnections.filter(connection => 
            connection.portName === portName && 
            connection.date === date && 
            connection.status === 'active'
        );
    };

    const getConnectionsForShip = (shipId: string, date: string): IPortConnection[] => {
        return portConnections.filter(connection => 
            connection.shipId === shipId && 
            connection.date === date && 
            connection.status === 'active'
        );
    };

    const getCrewInSamePort = (portName: string, shipId: string, date: string): IPortConnection[] => {
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

    const isShipDockedInPort = (shipId: string, portName: string, date: string): boolean => {
        return portConnections.some(connection => 
            connection.shipId === shipId && 
            connection.portName === portName && 
            connection.date === date && 
            connection.status === 'active'
        );
    };

    const value: IPortConnectionContext = {
        portConnections,
        addPortConnection,
        removePortConnection,
        getConnectionsForPort,
        getConnectionsForShip,
        getCrewInSamePort,
        isShipDockedInPort
    };

    return (
        <PortConnectionContext.Provider value={value}>
            {children}
        </PortConnectionContext.Provider>
    );
};

export const usePortConnection = (): IPortConnectionContext => {
    const context = useContext(PortConnectionContext);
    if (context === undefined) {
        throw new Error('usePortConnection must be used within a PortConnectionProvider');
    }
    return context;
};
