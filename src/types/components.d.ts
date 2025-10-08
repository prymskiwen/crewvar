/**
 * Component-specific type definitions
 */

// Admin Components
export type AdminTabType = 'overview' | 'users' | 'reports' | 'data-management' | 'support' | 'settings';

export interface AdminAppBarProps {
    currentUser: any;
    onLogout: () => void;
    activeTab: AdminTabType;
    onTabChange: (tab: AdminTabType) => void;
}

export interface UsersTabProps {
    users: any[];
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onBanUser: (userId: string, reason: string) => Promise<void>;
    onUnbanUser: (userId: string) => Promise<void>;
    currentPage: number;
    totalUsers: number;
    usersPerPage: number;
    onPageChange: (page: number) => void;
    usersLoading: boolean;
}

export interface OverviewTabProps {
    stats: any;
    supportStats: any;
    supportStatsLoading: boolean;
}

// Modal Components
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface AddDepartmentModalProps extends ModalProps { }
export interface DeleteDepartmentModalProps extends ModalProps { }
export interface AddCruiseLineModalProps extends ModalProps { }
export interface DeleteCruiseLineModalProps extends ModalProps { }
export interface AddShipModalProps extends ModalProps { }
export interface DeleteShipModalProps extends ModalProps { }
export interface AddRoleModalProps extends ModalProps { }
export interface DeleteRoleModalProps extends ModalProps { }
export interface BulkMessagingModalProps extends ModalProps { }

// Connection Components
export interface ConnectionButtonProps {
    userId: string;
    userName: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export interface ConnectionPendingCardProps {
    request: any;
    onAccept: (requestId: string) => void;
    onReject: (requestId: string) => void;
    onViewProfile: (userId: string) => void;
}

export interface ConnectionRequestModalProps extends ModalProps {
    userId: string;
    userName: string;
}

export interface MyConnectionsProps {
    connections: any[];
    onRemoveConnection: (connectionId: string) => void;
    onViewProfile: (userId: string) => void;
}

export interface PendingRequestsProps {
    requests: any[];
    onAccept: (requestId: string) => void;
    onReject: (requestId: string) => void;
    onViewProfile: (userId: string) => void;
}

// Port Components
export interface WhosInPortProps {
    className?: string;
}

// User Components
export interface UserFormProps {
    user?: any;
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export interface ProfileProps {
    user: any;
    onEdit: () => void;
    onConnect: (userId: string) => void;
}

// Report Components
export interface ReportUserModalProps extends ModalProps {
    reportedUserId: string;
    reportedUserName: string;
    onReport: (data: any) => void;
}

// Chat Components
export interface ChatWindowProps {
    chatRoom: {
        room_id: string;
        other_user_id: string;
        other_user_name: string;
        other_user_avatar: string;
        ship_name: string;
        department_name: string;
        unread_count?: number;
    };
    onClose: () => void;
}

export interface ChatListProps {
    chatRooms: any[];
    onSelectChat: (chatRoom: any) => void;
    onClose: () => void;
}

// Form Components
export interface FormFieldProps {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    value?: any;
    onChange?: (value: any) => void;
}

export interface SearchBoxProps {
    placeholder?: string;
    onSearch: (query: string) => void;
    className?: string;
}

export interface SortSelectBoxProps {
    options: Array<{ value: string; label: string }>;
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export interface CategorySelectBoxProps {
    categories: Array<{ id: string; name: string }>;
    selectedCategory?: string;
    onCategoryChange: (categoryId: string) => void;
    className?: string;
}

export interface ProductQuantitySelectBoxProps {
    maxQuantity: number;
    quantity: number;
    onQuantityChange: (quantity: number) => void;
    className?: string;
}

// Notification Components
export interface NotificationBellProps {
    notifications: any[];
    onMarkAsRead: (notificationId: string) => void;
    onViewAll: () => void;
}

export interface NotificationDropdownProps {
    notifications: any[];
    onMarkAsRead: (notificationId: string) => void;
    onViewAll: () => void;
    onClose: () => void;
}

// Profile Components
export interface ProfileEditProps {
    user: any;
    onSave: (data: any) => void;
    onCancel: () => void;
    isLoading?: boolean;
    initialData?: any;
    departments?: any[];
    roles?: any[];
    className?: string;
}

export interface ProfilePhotoUploadProps {
    currentPhoto?: string;
    onPhotoChange: (photo: string) => void;
    onRemove: () => void;
    isLoading?: boolean;
}

export interface AdditionalPhotoUploadProps {
    photos: string[];
    onPhotosChange: (photos: string[]) => void;
    maxPhotos?: number;
    isLoading?: boolean;
}

// Dashboard Components
export interface DashboardSidebarProps {
    activeItem?: string;
    onItemClick: (item: string) => void;
    onLogout: () => void;
}

export interface CalendarViewProps {
    events: any[];
    onEventClick: (event: any) => void;
    onDateChange: (date: Date) => void;
}

// Ship Components
export interface ShipSelectionProps {
    ships: any[];
    selectedShip?: string;
    onShipSelect: (shipId: string) => void;
    onClose: () => void;
}

export interface AssignmentFormProps {
    assignments: any[];
    onAssignmentChange: (assignments: any[]) => void;
    onSave: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

// Port Connection Components
export interface PortConnectionFormProps {
    onSave: (data: any) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export interface PortConnectionsDashboardProps {
    connections: any[];
    onAddConnection: () => void;
    onEditConnection: (connectionId: string) => void;
    onDeleteConnection: (connectionId: string) => void;
}

// Quick Check-in Components
export interface QuickCheckInProps {
    onCheckIn: (data: any) => void;
    isLoading?: boolean;
}

// Privacy Components
export interface PrivacySettingsProps {
    settings: any;
    onSettingsChange: (settings: any) => void;
    onSave: () => void;
    isLoading?: boolean;
}

// Social Media Components
export interface SocialMediaLinksProps {
    links: any;
    onLinksChange: (links: any) => void;
    onSave: () => void;
    isLoading?: boolean;
}

export interface SocialMediaDisplayProps {
    links: any;
    className?: string;
}

// Utility Components
export interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error }>;
}

export interface ScrollToTopProps {
    children: React.ReactNode;
}

export interface StorageWarningProps {
    onDismiss: () => void;
}

export interface SuccessNotificationProps {
    message: string;
    onClose: () => void;
}

export interface BanNotificationProps {
    reason: string;
    onDismiss: () => void;
}

// Guard Components
export interface AdminGuardProps {
    children: React.ReactNode;
}

export interface BanGuardProps {
    children: React.ReactNode;
}

export interface OnboardingGuardProps {
    children: React.ReactNode;
}

// Onboarding Components
export interface OnboardingFormProps {
    onComplete: (data: any) => void;
    isLoading?: boolean;
}

export interface OnboardingProgressProps {
    currentStep: number;
    totalSteps: number;
    onStepClick: (step: number) => void;
}

// Favorites Components
export interface FavoriteButtonProps {
    isFavorite: boolean;
    onToggle: () => void;
    isLoading?: boolean;
    className?: string;
}

// Crew Components
// Removed unused crew component types

// Removed unused chat component types

// Elements Components
export interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export interface PreviewImageProps {
    src: string;
    alt: string;
    className?: string;
    onError?: () => void;
}

export interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

// Form Components
export interface FormProps {
    onSubmit: (data: any) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    children: React.ReactNode;
}

// Category Components
export interface CategoryBoxProps {
    category: any;
    onSelect: (categoryId: string) => void;
    isSelected?: boolean;
    className?: string;
}

// Showcase Components
export interface ShowcaseProps {
    items: any[];
    onItemClick: (item: any) => void;
    title?: string;
    className?: string;
}

// Support Components
export interface SupportTicket {
    id: string;
    title: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    userId: string;
    userName: string;
    user_name: string;
    userEmail: string;
    user_email: string;
    createdAt: string;
    created_at: string;
    updatedAt: string;
    admin_response?: string;
    admin_name?: string;
    tickets?: SupportTicket[];
    responses: Array<{
        id: string;
        message: string;
        isAdmin: boolean;
        createdAt: string;
        admin_name?: string;
    }>;
}

export interface SupportTicketResponse {
    id: string;
    message: string;
    isAdmin: boolean;
    createdAt: string;
    admin_name?: string;
}

export interface SupportTicketFilters {
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
}

export interface SupportTicketFormData {
    title: string;
    subject: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface SupportTicketModalProps extends ModalProps {
    ticket?: SupportTicket;
    onSave: (data: SupportTicketFormData) => void;
    onClose: () => void;
    isLoading?: boolean;
}

export interface SupportResponseModalProps extends ModalProps {
    ticket: SupportTicket;
    onSendResponse: (message: string) => void;
    onClose: () => void;
    isLoading?: boolean;
}

// Page Components
export interface AdminSupportPageProps {
    // Add any specific props for AdminSupportPage if needed
}

export interface ContactPageProps {
    // Add any specific props for ContactPage if needed
}

export interface FAQPageProps {
    // Add any specific props for FAQPage if needed
}

export interface SupportPageProps {
    // Add any specific props for SupportPage if needed
}

export interface AdminUserDetailProps {
    userId: string;
    // Add any other props for AdminUserDetail
}
