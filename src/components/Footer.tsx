import { Link } from 'react-router-dom';
import { HiMail } from 'react-icons/hi';
import logo from '../assets/images/Home/logo.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#069B93] text-white">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4 lg:mb-6">
                    {/* Brand Information */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                            <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                                <img 
                                    src={logo} 
                                    alt="Crewvar Logo" 
                                    className="h-6 sm:h-8 w-auto brightness-0 invert"
                                    style={{ filter: 'brightness(0) invert(1)' }}
                                />
                            </Link>
                        </div>
                        <p className="text-white text-xs sm:text-sm mb-1 sm:mb-2">
                            Your home at sea. Connect with crew members and discover who's sailing with you today.
                        </p>
                        <p className="text-white text-xs">
                            © {currentYear} Crewvar. All rights reserved.
                        </p>
                    </div>

                    {/* Support and Contact */}
                    <div>
                        <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Support & Contact</h3>
                        <ul className="space-y-1 sm:space-y-2">
                            <li className="flex items-center space-x-2">
                                <HiMail className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                <Link 
                                    to="/support"
                                    className="text-white hover:text-[#B9F3DF] transition-colors text-xs sm:text-sm"
                                >
                                    support@crewvar.com
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/contact"
                                    className="text-white hover:text-[#B9F3DF] transition-colors text-xs sm:text-sm"
                                >
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/faq"
                                    className="text-white hover:text-[#B9F3DF] transition-colors text-xs sm:text-sm"
                                >
                                    Help Center
                                </Link>
                            </li>
                        </ul>
                        <div className="mt-2 p-2 bg-white/10 rounded-lg border border-white/20">
                            <p className="text-white text-xs">
                                <strong>Need Help?</strong> Submit a support ticket for quick assistance.
                            </p>
                        </div>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Legal</h3>
                        <ul className="space-y-1">
                            <li>
                                <Link 
                                    to="/privacy-policy" 
                                    className="text-white hover:text-[#B9F3DF] transition-colors text-xs sm:text-sm"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/terms-of-service" 
                                    className="text-white hover:text-[#B9F3DF] transition-colors text-xs sm:text-sm"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/faq" 
                                    className="text-white hover:text-[#B9F3DF] transition-colors text-xs sm:text-sm"
                                >
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                        <div className="mt-1 sm:mt-2 p-2 sm:p-3 bg-white/10 rounded-lg border border-white/20">
                            <p className="text-white text-xs leading-relaxed">
                                <strong className="text-white">Disclaimer:</strong> Crewvar is an independent platform and is not affiliated with any cruise line or operator.
                            </p>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Follow Us</h3>
                        <div className="flex space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                            <a 
                                href={import.meta.env.VITE_INSTAGRAM_URL || "#"} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors group"
                                aria-label="Follow us on Instagram"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.928-.175-1.297-.49-.368-.315-.49-.753-.49-1.243s.122-.928.49-1.243c.369-.315.807-.49 1.297-.49s.928.175 1.297.49c.368.315.49.753.49 1.243s-.122.928-.49 1.243c-.369.315-.807.49-1.297.49z"/>
                                    <path d="M12.017 5.396c-3.63 0-6.591 2.961-6.591 6.591s2.961 6.591 6.591 6.591 6.591-2.961 6.591-6.591-2.961-6.591-6.591-6.591zm0 10.988c-2.426 0-4.397-1.971-4.397-4.397s1.971-4.397 4.397-4.397 4.397 1.971 4.397 4.397-1.971 4.397-4.397 4.397z"/>
                                </svg>
                            </a>
                            <a 
                                href={import.meta.env.VITE_FACEBOOK_URL || "#"} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors group"
                                aria-label="Follow us on Facebook"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </a>
                            <a 
                                href={import.meta.env.VITE_TIKTOK_URL || "#"} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors group"
                                aria-label="Follow us on TikTok"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                </svg>
                            </a>
                        </div>
                        <p className="text-white text-xs sm:text-sm">
                            Follow us @crewvarapp
                        </p>
                    </div>
                </div>

                {/* Bottom Border */}
                <div className="border-t border-white/20 pt-2 sm:pt-3">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-1 sm:space-y-0">
                        <p className="text-white text-xs sm:text-sm text-center sm:text-left">
                            © {currentYear} Crewvar. All rights reserved.
                        </p>
                        <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm">
                            <Link 
                                to="/privacy-policy" 
                                className="text-white hover:text-[#B9F3DF] transition-colors"
                            >
                                Privacy
                            </Link>
                            <Link 
                                to="/terms-of-service" 
                                className="text-white hover:text-[#B9F3DF] transition-colors"
                            >
                                Terms
                            </Link>
                            <a 
                                href="mailto:support@crewvar.com"
                                className="text-white hover:text-[#B9F3DF] transition-colors"
                            >
                                Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

