/**
 * Crew-related type definitions
 */

export interface ICrewMember {
    id: string;
    displayName: string;
    roleName: string;
    departmentName: string;
    shipName: string;
    cruiseLineName: string;
    profilePhoto?: string;
    email?: string;
    phone?: string;
    location?: string;
    status?: 'onboard' | 'ashore' | 'on_leave';
    joinDate?: Date | string;
    lastActive?: Date | string;
}

export interface ICrewRole {
    id: string;
    name: string;
    department: string;
    description?: string;
    requirements?: string[];
    responsibilities?: string[];
}

export interface ICrewDepartment {
    id: string;
    name: string;
    description?: string;
    headOfDepartment?: string;
    memberCount?: number;
}

export interface ICrewShip {
    id: string;
    name: string;
    cruiseLine: string;
    capacity: number;
    currentPort?: string;
    nextPort?: string;
    departureDate?: Date | string;
    arrivalDate?: Date | string;
}

export interface ICrewCruiseLine {
    id: string;
    name: string;
    description?: string;
    website?: string;
    logo?: string;
    fleetSize?: number;
}

export interface ICrewAssignment {
    id: string;
    crewMemberId: string;
    shipId: string;
    roleId: string;
    startDate: Date | string;
    endDate?: Date | string;
    status: 'active' | 'completed' | 'cancelled';
    notes?: string;
}

export interface ICrewSchedule {
    id: string;
    crewMemberId: string;
    date: Date | string;
    shift: 'morning' | 'afternoon' | 'evening' | 'night';
    duties: string[];
    location: string;
    supervisor?: string;
}

export interface ICrewPerformance {
    id: string;
    crewMemberId: string;
    period: string;
    rating: number;
    feedback: string;
    goals: string[];
    achievements: string[];
    areasForImprovement: string[];
    supervisor: string;
    date: Date | string;
}

export interface ICrewTraining {
    id: string;
    crewMemberId: string;
    trainingType: string;
    title: string;
    description: string;
    duration: number; // in hours
    completed: boolean;
    completionDate?: Date | string;
    certificate?: string;
    instructor?: string;
}

export interface ICrewEmergency {
    id: string;
    crewMemberId: string;
    type: 'medical' | 'safety' | 'security' | 'other';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    reportedBy: string;
    reportedAt: Date | string;
    resolvedAt?: Date | string;
    resolution?: string;
}

export interface ICrewDocument {
    id: string;
    crewMemberId: string;
    type: 'passport' | 'visa' | 'certificate' | 'license' | 'medical' | 'other';
    name: string;
    number?: string;
    issueDate?: Date | string;
    expiryDate?: Date | string;
    issuingAuthority?: string;
    fileUrl?: string;
    isVerified: boolean;
}

export interface ICrewContact {
    id: string;
    crewMemberId: string;
    type: 'emergency' | 'family' | 'friend' | 'colleague';
    name: string;
    relationship: string;
    phone?: string;
    email?: string;
    address?: string;
    isPrimary: boolean;
}

export interface ICrewLeave {
    id: string;
    crewMemberId: string;
    type: 'vacation' | 'sick' | 'personal' | 'emergency' | 'other';
    startDate: Date | string;
    endDate: Date | string;
    days: number;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    reason: string;
    approvedBy?: string;
    approvedAt?: Date | string;
    notes?: string;
}

export interface ICrewPort {
    id: string;
    name: string;
    country: string;
    city: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    facilities?: string[];
    services?: string[];
    timezone?: string;
}

export interface ICrewVoyage {
    id: string;
    shipId: string;
    name: string;
    description?: string;
    startDate: Date | string;
    endDate: Date | string;
    route: ICrewPort[];
    status: 'planned' | 'active' | 'completed' | 'cancelled';
    passengerCount?: number;
    crewCount?: number;
}

// Crew Management Interfaces
export interface ICrewManager {
    id: string;
    name: string;
    department: string;
    level: 'supervisor' | 'manager' | 'director';
    permissions: string[];
    crewMembers: string[];
}

export interface ICrewReport {
    id: string;
    type: 'performance' | 'attendance' | 'incident' | 'training' | 'other';
    title: string;
    description: string;
    crewMemberId: string;
    reportedBy: string;
    reportedAt: Date | string;
    status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: Date | string;
    comments?: string;
}

export interface ICrewAnalytics {
    totalCrew: number;
    activeCrew: number;
    onLeave: number;
    newHires: number;
    departures: number;
    averageTenure: number;
    departmentBreakdown: Record<string, number>;
    roleBreakdown: Record<string, number>;
    performanceMetrics: {
        averageRating: number;
        trainingCompletion: number;
        incidentRate: number;
    };
}
