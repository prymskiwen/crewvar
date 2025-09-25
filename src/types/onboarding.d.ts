// Crewvar Onboarding Types
export interface ICruiseLine {
    id: string;
    name: string;
    ships: IShip[];
}

export interface IShip {
    id: string;
    name: string;
    cruiseLineId: string;
    port?: string;
    isActive: boolean;
}

export interface IDepartment {
    id: string;
    name: string;
    subcategories: ISubcategory[];
}

export interface ISubcategory {
    id: string;
    name: string;
    departmentId: string;
}

export interface IRole {
    id: string;
    name: string;
    department_id?: string;
}

export interface IContractCalendar {
    shipId: string;
    startDate: string;
    endDate: string;
}

export interface ISuggestedProfile {
    id: string;
    displayName: string;
    avatar?: string;
    role: string;
    shipName: string;
    department: string;
}

export interface IOnboardingData {
    displayName: string;
    profilePhoto: File | string;
    departmentId: string;
    roleId: string;
    currentShipId: string;
    contractCalendar?: IContractCalendar[];
}
