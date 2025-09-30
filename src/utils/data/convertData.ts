export const convertData = (data: string) => {
    return new Date(data).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
};

export const formatTimeAgo = (timestamp: any) => {
    let date: Date;

    // Handle Firebase Firestore timestamp objects
    if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
    } else if (timestamp && typeof timestamp === 'string') {
        date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else {
        return 'Unknown';
    }

    // Check if the date is valid
    if (isNaN(date.getTime())) {
        return 'Unknown';
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

export const formatTimeDisplay = (timestamp: any) => {
    let date: Date;

    // Handle Firebase Firestore timestamp objects
    if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
    } else if (timestamp && typeof timestamp === 'string') {
        date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else {
        return 'Unknown';
    }

    // Check if the date is valid
    if (isNaN(date.getTime())) {
        return 'Unknown';
    }

    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString();
    }
};

// Global helper functions for getting names from IDs
export const getShipName = (shipId: string, ships: any[] = []) => {
    if (!shipId) return 'Unknown Ship';
    if (!ships || ships.length === 0) return shipId; // Return ID if data not loaded
    const ship = ships.find(s => s.id === shipId);
    return ship ? ship.name : shipId;
};

export const getDepartmentName = (departmentId: string, departments: any[] = []) => {
    if (!departmentId) return 'Unknown Department';
    if (!departments || departments.length === 0) return departmentId; // Return ID if data not loaded
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : departmentId;
};

export const getRoleName = (roleId: string, roles: any[] = []) => {
    if (!roleId) return 'Unknown Role';
    if (!roles || roles.length === 0) return roleId; // Return ID if data not loaded
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
};

export const getCruiseLineName = (cruiseLineId: string, cruiseLines: any[] = []) => {
    if (!cruiseLineId) return 'Unknown Cruise Line';
    if (!cruiseLines || cruiseLines.length === 0) return cruiseLineId; // Return ID if data not loaded
    const cruiseLine = cruiseLines.find(cl => cl.id === cruiseLineId);
    return cruiseLine ? cruiseLine.name : cruiseLineId;
};