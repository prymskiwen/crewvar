/**
 * Centralized type definitions for the CrewVar application
 */

// Re-export types with explicit naming to avoid conflicts
export type { IUser, UserProfile } from './user.d';
export type { IChatRoom, IChatMessage } from './chat.d';
export type { IReport } from './moderation.d';
export type {
    IConnectionRequest,
    IConnection,
    IUserProfile as IConnectionUserProfile,
    IConnectionContext
} from './connections.d';
export type { INotification as INotificationType, NotificationSettings } from './notifications.d';
export type {
    IAdminStats,
    IUser as IAdminUser,
    IReport as IAdminReport,
    ISupportTicket
} from './admin.d';

// Crew types
export type {
    ICrewMember,
    ICrewRole,
    ICrewDepartment,
    ICrewShip,
    ICrewCruiseLine,
    ICrewAssignment,
    ICrewSchedule,
    ICrewPerformance,
    ICrewTraining,
    ICrewEmergency,
    ICrewDocument,
    ICrewContact,
    ICrewLeave,
    ICrewPort,
    ICrewVoyage,
    ICrewManager,
    ICrewReport,
    ICrewAnalytics
} from './crew.d';

// Component types
export type {
    AdminTabType,
    AdminAppBarProps,
    UsersTabProps,
    OverviewTabProps,
    ModalProps,
    AddDepartmentModalProps,
    DeleteDepartmentModalProps,
    AddCruiseLineModalProps,
    DeleteCruiseLineModalProps,
    AddShipModalProps,
    DeleteShipModalProps,
    AddRoleModalProps,
    DeleteRoleModalProps,
    BulkMessagingModalProps,
    ConnectionButtonProps,
    ConnectionPendingCardProps,
    ConnectionRequestModalProps,
    MyConnectionsProps,
    PendingRequestsProps,
    WhosInPortProps,
    UserFormProps,
    ProfileProps,
    ReportUserModalProps,
    ChatWindowProps,
    ChatListProps,
    FormFieldProps,
    SearchBoxProps,
    SortSelectBoxProps,
    CategorySelectBoxProps,
    ProductQuantitySelectBoxProps,
    NotificationBellProps,
    NotificationDropdownProps,
    ProfileEditProps,
    ProfilePhotoUploadProps,
    AdditionalPhotoUploadProps,
    DashboardSidebarProps,
    CalendarViewProps,
    ShipSelectionProps,
    AssignmentFormProps,
    PortConnectionFormProps,
    PortConnectionsDashboardProps,
    QuickCheckInProps,
    PrivacySettingsProps,
    SocialMediaLinksProps,
    SocialMediaDisplayProps,
    LoadingSpinnerProps,
    ErrorBoundaryProps,
    ScrollToTopProps,
    StorageWarningProps,
    SuccessNotificationProps,
    BanNotificationProps,
    AdminGuardProps,
    BanGuardProps,
    OnboardingGuardProps,
    OnboardingFormProps,
    OnboardingProgressProps,
    FavoriteButtonProps,
    // Removed unused component types
    PopupProps,
    PreviewImageProps,
    SpinnerProps,
    FormProps,
    CategoryBoxProps,
    ShowcaseProps,
    SupportTicket,
    SupportTicketResponse,
    SupportTicketFilters,
    SupportTicketFormData,
    SupportTicketModalProps,
    SupportResponseModalProps,
    AdminSupportPageProps,
    ContactPageProps,
    FAQPageProps,
    SupportPageProps,
    AdminUserDetailProps
} from './components.d';

// Common utility types
export interface BaseEntity {
    id: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

// API Response wrapper
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Loading states
export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

// Form validation
export interface FormErrors {
    [key: string]: string | undefined;
}

// Navigation
export interface NavigationItem {
    label: string;
    path: string;
    icon?: React.ComponentType;
    badge?: number;
    children?: NavigationItem[];
}

// Theme
export interface Theme {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
}
