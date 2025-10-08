import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiMail, HiClock, HiCheckCircle } from 'react-icons/hi';
import { createSupportTicket } from '../../firebase/support';
import { useAuth } from '../../context/AuthContextFirebase';
import Footer from '../../layout/Footer';
import logo from '../../assets/images/Home/logo.png';

const SupportPage = () => {
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ticketSubmitted, setTicketSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        description: ''
    });


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!currentUser || !userProfile) {
                toast.error('Please log in to submit a support ticket');
                return;
            }

            console.log('🚀 Creating support ticket:', formData);
            
                const ticketId = await createSupportTicket({
                    userId: currentUser.uid,
                    userName: userProfile.displayName || 'Unknown User',
                    userEmail: userProfile.email || currentUser.email || 'unknown@example.com',
                    subject: formData.subject,
                    description: formData.description,
                    category: 'general',
                    priority: 'medium'
                });

            console.log('✅ Support ticket created with ID:', ticketId);
            setTicketSubmitted(true);
            toast.success('Support ticket submitted successfully! We\'ll get back to you soon.');

        } catch (error: any) {
            console.error('❌ Failed to submit support ticket:', error);
            toast.error(error.message || 'Failed to submit support ticket. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (ticketSubmitted) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <HiCheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">Ticket Submitted Successfully!</h1>
                            <p className="text-gray-600 mb-6">
                                Your support ticket has been submitted and our team will get back to you within 24 hours.
                            </p>
                            <div className="space-y-4">
                                <button
                                    onClick={() => setTicketSubmitted(false)}
                                    className="w-full bg-[#069B93] text-white px-6 py-3 rounded-lg hover:bg-[#058a7a] transition-colors"
                                >
                                    Submit Another Ticket
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
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
                        <Link to="/dashboard" className="hover:opacity-90 transition-opacity">
                            <img
                                src={logo}
                                alt="Crewvar Logo"
                                className="h-6 sm:h-8 w-auto"
                            />
                        </Link>
                        <h1 className="text-lg sm:text-xl font-bold">Support Center</h1>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-teal-700 rounded-lg transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
                {/* Desktop Header */}
                <div className="hidden sm:block text-center mb-6">
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Need help? Submit a support ticket and our team will assist you promptly.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {/* Contact Information */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Contact Information</h2>
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <HiMail className="w-5 h-5 text-[#069B93]" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900">Email Support</p>
                                            <p className="text-sm text-gray-600 break-all">support@crewvar.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <HiClock className="w-5 h-5 text-[#069B93]" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900">Response Time</p>
                                            <p className="text-sm text-gray-600">Within 24 hours</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Help</h3>
                                <div className="space-y-2 sm:space-y-3">
                                    <button
                                        onClick={() => navigate('/faq')}
                                        className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <p className="font-medium text-gray-900 text-sm sm:text-base">Frequently Asked Questions</p>
                                        <p className="text-xs sm:text-sm text-gray-600">Find answers to common questions</p>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Support Ticket Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Submit Support Ticket</h2>

                                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#069B93] focus:border-transparent text-sm sm:text-base"
                                            placeholder="Brief description of your issue"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            required
                                            rows={4}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#069B93] focus:border-transparent text-sm sm:text-base resize-none"
                                            placeholder="Please provide detailed information about your issue..."
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 space-y-3 sm:space-y-0">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/dashboard')}
                                            className="w-full sm:w-auto px-6 py-2 sm:py-3 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SupportPage;
