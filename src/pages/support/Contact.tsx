import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiMail, HiClock, HiChat } from 'react-icons/hi';
import logo from '../../assets/images/Home/logo.png';

const ContactPage = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Simulate API call - replace with actual API
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Contact form submitted:', formData);
            toast.success('Message sent successfully! We\'ll get back to you soon.');

            // Reset form
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });

        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

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
                        <h1 className="text-lg sm:text-xl font-bold">Contact Us</h1>
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
                        Have questions or feedback? We'd love to hear from you. Get in touch with our team.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        {/* Contact Information */}
                        <div className="space-y-4 sm:space-y-6">
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Get in Touch</h2>

                                <div className="space-y-4 sm:space-y-6">
                                    <div className="flex items-start space-x-3 sm:space-x-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#069B93]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <HiMail className="w-5 h-5 sm:w-6 sm:h-6 text-[#069B93]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Email Support</h3>
                                            <p className="text-sm sm:text-base text-gray-600 mb-1 sm:mb-2">For general inquiries and support</p>
                                            <a
                                                href="mailto:support@crewvar.com"
                                                className="text-sm sm:text-base text-[#069B93] hover:text-[#058a7a] transition-colors break-all"
                                            >
                                                support@crewvar.com
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3 sm:space-x-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#069B93]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <HiChat className="w-5 h-5 sm:w-6 sm:h-6 text-[#069B93]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Live Chat</h3>
                                            <p className="text-sm sm:text-base text-gray-600 mb-1 sm:mb-2">Available for immediate assistance</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3 sm:space-x-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#069B93]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <HiClock className="w-5 h-5 sm:w-6 sm:h-6 text-[#069B93]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Response Time</h3>
                                            <p className="text-sm sm:text-base text-gray-600 mb-1 sm:mb-2">We typically respond within</p>
                                            <p className="text-xs sm:text-sm text-gray-500">24 hours for email inquiries</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Why Contact Us?</h3>
                                <ul className="space-y-2 sm:space-y-3">
                                    <li className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-[#069B93] rounded-full flex-shrink-0"></div>
                                        <span className="text-sm sm:text-base text-gray-600">Technical support and troubleshooting</span>
                                    </li>
                                    <li className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-[#069B93] rounded-full flex-shrink-0"></div>
                                        <span className="text-sm sm:text-base text-gray-600">Account and billing questions</span>
                                    </li>
                                    <li className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-[#069B93] rounded-full flex-shrink-0"></div>
                                        <span className="text-sm sm:text-base text-gray-600">Feature requests and feedback</span>
                                    </li>
                                    <li className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-[#069B93] rounded-full flex-shrink-0"></div>
                                        <span className="text-sm sm:text-base text-gray-600">Partnership and business inquiries</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Send us a Message</h2>

                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#069B93] focus:border-transparent text-sm sm:text-base"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#069B93] focus:border-transparent text-sm sm:text-base"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                </div>

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
                                        placeholder="What's this about?"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        required
                                        rows={4}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#069B93] focus:border-transparent text-sm sm:text-base resize-none"
                                        placeholder="Tell us more about your inquiry..."
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
                                        {isSubmitting ? 'Sending...' : 'Send Message'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
