import { Link } from 'react-router-dom';
import logo from '../../../assets/images/Home/logo.png';

export const FAQ = () => {
    const faqs = [
        {
            question: "What is Crewvar?",
            answer: "Crewvar is your digital crew bar. Just like the real crew bar on board, it's where you meet friends, share stories, and feel at home no matter where you are. It's a warm, friendly space online where crew and passengers can connect with the people they sail with."
        },
        {
            question: "Is my privacy protected?",
            answer: "Yes. Privacy is our top priority. Other users can only see your full profile or contact details if you approve their connection request. If you choose not to approve, the other person will never be notified."
        },
        {
            question: "Can people see my calendar?",
            answer: "No. Nobody can see your full calendar. Other users only see where you are today, never where you will be in the future."
        },
        {
            question: "What can others see about me?",
            answer: "By default, only your name, the ship you are on today, photo, and position. Your full profile and chat access open only when you accept a connection request."
        },
        {
            question: "Is Crewvar official?",
            answer: "No. Crewvar is completely independent and not affiliated with any cruise line or company. All information comes directly from users who choose to join."
        },
        {
            question: "How do I add my ship and dates?",
            answer: "When creating your profile, simply choose your cruise line, your ship, and the dates you'll be on board. It only takes a few seconds."
        },
        {
            question: "What if my ship or position isn't listed?",
            answer: "No worries. You'll find a link to let us know, and we'll update it as soon as possible."
        },
        {
            question: "Do I have to pay to use Crewvar?",
            answer: "No. Crewvar is free to use. In the future, there may be a very small subscription, just a few cents, to help cover running costs, developers, and staff. For now, enjoy everything at no cost."
        },
        {
            question: "Who can join Crewvar?",
            answer: "Both crew members and passengers. Crew can connect with other crew, and passengers can connect with both passengers and crew, but only if the connection is approved. Your privacy will always remain our priority."
        }
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Mobile Header - Matching Messages Page Style */}
            <div className="bg-teal-600 text-white p-3 sm:p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="p-2 hover:bg-teal-700 rounded-lg transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold">FAQ</h1>
                            <p className="text-xs text-teal-100">Frequently asked questions</p>
                        </div>
                    </div>
                    <Link to="/dashboard" className="flex items-center hover:bg-teal-700 rounded-lg px-2 sm:px-3 py-2 transition-colors">
                        <img 
                            src={logo} 
                            alt="Crewvar Logo" 
                            className="h-5 sm:h-6 w-auto brightness-0 invert"
                            style={{ filter: 'brightness(0) invert(1)' }}
                        />
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">

                {/* FAQ Content */}
                <div className="space-y-4 sm:space-y-6">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-4 sm:p-6 lg:p-8">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-start">
                                    <span className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-[#069B93] text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-3 mt-0.5">
                                        Q
                                    </span>
                                    <span className="text-sm sm:text-base">{faq.question}</span>
                                </h3>
                                <div className="ml-9 sm:ml-11">
                                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{faq.answer}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Section */}
                <div className="mt-8 sm:mt-12 bg-gradient-to-r from-[#069B93] to-[#058a7a] rounded-2xl p-4 sm:p-6 lg:p-8 text-white text-center">
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Still have questions?</h3>
                    <p className="text-base sm:text-lg mb-4 sm:mb-6 opacity-90">
                        We're here to help! Contact our support team for any additional questions.
                    </p>
                    <a 
                        href="mailto:support@crewvar.com"
                        className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-white text-[#069B93] rounded-xl hover:bg-gray-100 transition-colors font-semibold text-sm sm:text-base"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contact Support
                    </a>
                </div>
                </div>
            </div>
        </div>
    );
};
