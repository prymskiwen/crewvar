import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContextFirebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiEye, HiReply, HiCheckCircle, HiXCircle, HiClock, HiSearch } from 'react-icons/hi';
import { SupportTicket } from '../../types';
import { SupportDropdown } from '../../components/support';
import logo from '../../assets/images/Home/logo.png';

// Placeholder functions - to be implemented with Firebase
const getAdminSupportTickets = async (): Promise<SupportTicket[]> => {
    // TODO: Implement with Firebase Firestore
    return [];
};

const updateTicketStatus = async (ticketId: string, status: string): Promise<void> => {
    // TODO: Implement with Firebase Firestore
    console.log('Update ticket status:', ticketId, status);
};

const addTicketResponse = async (ticketId: string, message: string): Promise<void> => {
    // TODO: Implement with Firebase Firestore
    console.log('Add ticket response:', ticketId, message);
};


const AdminSupportPage = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Current user context
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [adminResponse, setAdminResponse] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    // Dropdown options
    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'open', label: 'Open' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'closed', label: 'Closed' }
    ];

    const priorityOptions = [
        { value: 'all', label: 'All Priorities' },
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
    ];

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {

                const ticketsResponse = await getAdminSupportTickets();

                // Admin support tickets loaded
                setTickets(ticketsResponse || []);
            } catch (error: any) {
                console.error('❌ Failed to load support tickets:', error);
                console.error('Error details:', error.response?.data);
                toast.error('Failed to load support tickets: ' + (error.response?.data?.error || error.message));
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [statusFilter, priorityFilter, searchTerm]);

    // Remove client-side filtering since we're doing it server-side
    const filteredTickets = tickets;

    const handleViewTicket = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setAdminResponse(ticket.admin_response || '');
        setIsModalOpen(true);
    };

    const handleUpdateStatus = async (ticketId: string, status: string) => {
        try {
            await updateTicketStatus(ticketId, status);

            setTickets(prev => prev.map(ticket =>
                ticket.id === ticketId
                    ? { ...ticket, status: status as any, updated_at: new Date().toISOString() }
                    : ticket
            ));

            toast.success(`Ticket ${status.replace('_', ' ')} successfully`);
        } catch (error: any) {
            console.error('Failed to update ticket status:', error);
            toast.error(error.response?.data?.error || 'Failed to update ticket status');
        }
    };

    const handleSubmitResponse = async () => {
        if (!selectedTicket || !adminResponse.trim()) return;

        setIsSubmitting(true);
        try {
            const result = await addTicketResponse(selectedTicket.id, adminResponse);
            console.log('Response submitted successfully:', result);

            setTickets(prev => prev.map(ticket =>
                ticket.id === selectedTicket.id
                    ? {
                        ...ticket,
                        admin_response: adminResponse,
                        admin_id: currentUser?.uid,
                        status: 'in_progress',
                        updated_at: new Date().toISOString()
                    }
                    : ticket
            ));

            toast.success('Response sent successfully');
            setIsModalOpen(false);
            setAdminResponse('');
        } catch (error: any) {
            console.error('Failed to send response:', error);
            console.error('Error details:', error.response?.data);
            toast.error(error.response?.data?.error || 'Failed to send response');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-red-100 text-red-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'high': return 'text-orange-600';
            case 'urgent': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#069B93] mx-auto mb-4"></div>
                    <p className="text-[#069B93] font-medium">Loading support tickets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
            {/* Mobile Header */}
            <div className="bg-teal-600 text-white p-3 sm:p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <img
                            src={logo}
                            alt="Crewvar Logo"
                            className="h-6 sm:h-8 w-auto"
                        />
                        <h1 className="text-lg sm:text-xl font-bold">Support Management</h1>
                    </div>
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-2 hover:bg-teal-700 rounded-lg transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
                {/* Desktop Header */}
                <div className="hidden sm:block mb-6 lg:mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img
                                src={logo}
                                alt="Crewvar Logo"
                                className="h-10 w-auto"
                            />
                            <h1 className="text-3xl font-bold text-[#069B93]">Support Management</h1>
                        </div>
                        <button
                            onClick={() => navigate('/admin')}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Back to Admin
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div className="relative sm:col-span-2 lg:col-span-1">
                            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#069B93] focus:border-transparent text-sm sm:text-base"
                            />
                        </div>
                        <SupportDropdown
                            label="Status"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={statusOptions}
                            placeholder="All Statuses"
                        />
                        <SupportDropdown
                            label="Priority"
                            value={priorityFilter}
                            onChange={setPriorityFilter}
                            options={priorityOptions}
                            placeholder="All Priorities"
                        />
                    </div>
                </div>

                {/* Tickets List */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                            Support Tickets ({filteredTickets.length})
                        </h2>
                    </div>

                    {filteredTickets.length === 0 ? (
                        <div className="p-6 sm:p-8 text-center">
                            <p className="text-sm sm:text-base text-gray-600">No tickets found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredTickets.map((ticket) => (
                                <div key={ticket.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                                    {ticket.subject}
                                                </h3>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                                        {ticket.status.replace('_', ' ')}
                                                    </span>
                                                    <span className={`text-xs sm:text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                                                        {ticket.priority}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600">
                                                <span>From: {ticket.user_name}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="break-all">{ticket.user_email}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span>{formatDate(ticket.created_at)}</span>
                                                {ticket.admin_response && (
                                                    <>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span className="text-green-600 font-medium">✓ Responded</span>
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-gray-600 mt-2 line-clamp-2 text-sm">
                                                {ticket.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-1 sm:space-x-2 sm:ml-4">
                                            <button
                                                onClick={() => handleViewTicket(ticket)}
                                                className="p-1.5 sm:p-2 text-gray-600 hover:text-[#069B93] transition-colors"
                                                title="View Details"
                                            >
                                                <HiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                            {ticket.status === 'open' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
                                                    className="p-1.5 sm:p-2 text-yellow-600 hover:text-yellow-700 transition-colors"
                                                    title="Mark as In Progress"
                                                >
                                                    <HiClock className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                            )}
                                            {ticket.status === 'in_progress' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(ticket.id, 'resolved')}
                                                    className="p-1.5 sm:p-2 text-green-600 hover:text-green-700 transition-colors"
                                                    title="Mark as Resolved"
                                                >
                                                    <HiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ticket Details Modal */}
                {isModalOpen && selectedTicket && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                                        {selectedTicket.subject}
                                    </h3>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <HiXCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                                        <p className="text-sm sm:text-base text-gray-900 break-all">{selectedTicket.user_name} ({selectedTicket.user_email})</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <p className="text-sm sm:text-base text-gray-900 capitalize">{selectedTicket.category}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                        <p className={`text-sm sm:text-base font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                                            {selectedTicket.priority}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                                            {selectedTicket.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                        <p className="text-sm sm:text-base text-gray-900 whitespace-pre-wrap">{selectedTicket.description}</p>
                                    </div>
                                </div>

                                {selectedTicket.admin_response && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Previous Admin Response</label>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                                            <p className="text-sm sm:text-base text-gray-900 whitespace-pre-wrap">{selectedTicket.admin_response}</p>
                                            {selectedTicket.admin_name && (
                                                <p className="text-xs text-gray-500 mt-2">By: {selectedTicket.admin_name}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {selectedTicket.admin_response ? 'Update Admin Response' : 'Admin Response'}
                                    </label>
                                    <textarea
                                        value={adminResponse}
                                        onChange={(e) => setAdminResponse(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#069B93] focus:border-transparent text-sm sm:text-base resize-none"
                                        placeholder={selectedTicket.admin_response ? "Update your response to the user..." : "Enter your response to the user..."}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitResponse}
                                        disabled={isSubmitting || !adminResponse.trim()}
                                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <HiReply className="w-4 h-4" />
                                                <span>Send Response</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSupportPage;
