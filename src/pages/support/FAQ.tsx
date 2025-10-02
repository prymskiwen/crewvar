import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiChevronDown, HiChevronUp, HiSearch } from 'react-icons/hi';
import { SupportDropdown } from '../../components/support';
import logo from '../../assets/images/Home/logo.png';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

const FAQ = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const faqData: FAQItem[] = [
        {
            id: '1',
            question: 'How do I create an account?',
            answer: 'To create an account, click the "Sign Up" button on the homepage and fill in your email address, password, and basic information. You\'ll receive a verification email to activate your account.',
            category: 'account'
        },
        {
            id: '2',
            question: 'How do I update my profile information?',
            answer: 'Go to your profile page by clicking on your profile picture in the top right corner, then select "My Profile". From there, you can edit your display name, bio, contact information, and social media links.',
            category: 'account'
        },
        {
            id: '3',
            question: 'How do I upload a profile photo?',
            answer: 'On your profile page, click on the profile photo area and select "Change Photo". Choose an image from your device and it will be uploaded automatically. Supported formats include JPG, PNG, and WebP.',
            category: 'account'
        },
        {
            id: '4',
            question: 'How do I find crew members on my ship?',
            answer: 'Use the "Today On Board" page to see all crew members currently on your ship. You can also use the "Who\'s in Port" feature to find crew members from other ships when you\'re in port.',
            category: 'crew'
        },
        {
            id: '5',
            question: 'How do I connect with other crew members?',
            answer: 'Click on any crew member\'s profile to view their details, then use the "Connect" button to send a connection request. They\'ll receive a notification and can accept or decline your request.',
            category: 'crew'
        },
        {
            id: '6',
            question: 'What is port linking?',
            answer: 'Port linking allows you to connect with crew members from other ships when you\'re both in the same port. This helps you meet new people and expand your network while at sea.',
            category: 'crew'
        },
        {
            id: '7',
            question: 'How do I report inappropriate content?',
            answer: 'If you see inappropriate content or behavior, click the "Report" button on the post or user profile. Our moderation team will review the report and take appropriate action.',
            category: 'safety'
        },
        {
            id: '8',
            question: 'How do I block a user?',
            answer: 'Go to the user\'s profile and click the "Block" button. Blocked users won\'t be able to see your profile or send you messages.',
            category: 'safety'
        },
        {
            id: '9',
            question: 'How do I change my password?',
            answer: 'Go to your profile settings and select "Change Password". Enter your current password and your new password twice to confirm the change.',
            category: 'account'
        },
        {
            id: '10',
            question: 'How do I delete my account?',
            answer: 'To delete your account, go to your profile settings and select "Delete Account". This action is permanent and cannot be undone. All your data will be removed from our servers.',
            category: 'account'
        },
        {
            id: '11',
            question: 'Is my personal information secure?',
            answer: 'Yes, we take your privacy seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent.',
            category: 'privacy'
        },
        {
            id: '12',
            question: 'How do I contact support?',
            answer: 'You can contact our support team by submitting a support ticket through the "Support" page, or email us directly at support@crewvar.com. We typically respond within 24 hours.',
            category: 'support'
        }
    ];

    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'account', label: 'Account' },
        { value: 'crew', label: 'Crew & Connections' },
        { value: 'safety', label: 'Safety & Privacy' },
        { value: 'support', label: 'Support' }
    ];

    const filteredFAQs = faqData.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleItem = (id: string) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(id)) {
            newOpenItems.delete(id);
        } else {
            newOpenItems.add(id);
        }
        setOpenItems(newOpenItems);
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
                        <h1 className="text-lg sm:text-xl font-bold">Help Center</h1>
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
                        Find answers to frequently asked questions about using Crewvar.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Search and Filter */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <div className="flex-1 relative">
                                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                <input
                                    type="text"
                                    placeholder="Search FAQs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#069B93] focus:border-transparent text-sm sm:text-base"
                                />
                            </div>
                            <SupportDropdown
                                label="Category"
                                value={selectedCategory}
                                onChange={setSelectedCategory}
                                options={categories}
                                placeholder="All Categories"
                            />
                        </div>
                    </div>

                    {/* FAQ Items */}
                    <div className="space-y-3 sm:space-y-4">
                        {filteredFAQs.length === 0 ? (
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-center">
                                <p className="text-sm sm:text-base text-gray-600">No FAQs found matching your search criteria.</p>
                            </div>
                        ) : (
                            filteredFAQs.map((faq) => (
                                <div key={faq.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                                    <button
                                        onClick={() => toggleItem(faq.id)}
                                        className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                    >
                                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-2 sm:pr-4 leading-tight">
                                            {faq.question}
                                        </h3>
                                        {openItems.has(faq.id) ? (
                                            <HiChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                                        ) : (
                                            <HiChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                                        )}
                                    </button>
                                    {openItems.has(faq.id) && (
                                        <div className="px-4 sm:px-6 pb-3 sm:pb-4">
                                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Contact Support */}
                    <div className="mt-6 sm:mt-8 bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-center">
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Still Need Help?</h2>
                        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                            Can't find what you're looking for? Our support team is here to help.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                            <a
                                href="mailto:support@crewvar.com"
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors text-sm sm:text-base"
                            >
                                Email Support
                            </a>
                            <button
                                onClick={() => navigate('/support')}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
                            >
                                Submit Support Ticket
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
