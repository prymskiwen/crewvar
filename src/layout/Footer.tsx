import { Link, useNavigate } from 'react-router-dom';
import { HiMail, HiShieldCheck } from 'react-icons/hi';
import logo from '../assets/images/Home/logo.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const navigate = useNavigate();

    const handleSupportClick = () => {
        navigate('/support');
    };

    return (
        <footer className="bg-gradient-to-br from-[#069B93] to-[#058a7a] text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                {/* Top Section - Brand & Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center space-x-3 mb-4">
                            <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
                                <img
                                    src={logo}
                                    alt="Crewvar Logo"
                                    className="h-8 sm:h-10 w-auto brightness-0 invert"
                                    style={{ filter: 'brightness(0) invert(1)' }}
                                />
                            </Link>
                        </div>
                        <p className="text-white/90 text-sm leading-relaxed mb-4 max-w-sm">
                            Connect with fellow crew members, discover new friends, and stay updated on events happening on your ship and in port.
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-white/80">
                            <HiShieldCheck className="w-4 h-4" />
                            <span>Secure & Trusted Platform</span>
                        </div>
                    </div>

                    {/* Support Column */}
                    <div>
                        <h4 className="text-base font-semibold mb-4 text-white">Support</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    to="/support"
                                    className="text-white/80 hover:text-white transition-colors text-sm flex items-center"
                                >
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={handleSupportClick}
                                    className="text-white/80 hover:text-white transition-colors text-sm flex items-center"
                                >
                                    Contact Us
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={handleSupportClick}
                                    className="text-white/80 hover:text-white transition-colors text-sm flex items-center"
                                >
                                    <HiMail className="w-4 h-4 mr-2" />
                                    support@crewvar.com
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Legal & Social Column */}
                    <div>
                        <h4 className="text-base font-semibold mb-4 text-white">Legal & Social</h4>
                        <ul className="space-y-3 mb-4">
                            <li>
                                <Link
                                    to="/privacy-policy"
                                    className="text-white/80 hover:text-white transition-colors text-sm"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terms-of-service"
                                    className="text-white/80 hover:text-white transition-colors text-sm"
                                >
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/faq"
                                    className="text-white/80 hover:text-white transition-colors text-sm"
                                >
                                    FAQ
                                </Link>
                            </li>
                        </ul>

                        {/* Social Media */}
                        <div className="flex space-x-3">
                            <a
                                href={import.meta.env.VITE_INSTAGRAM_URL || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors group"
                                aria-label="Follow us on Instagram"
                            >
                                <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.928-.175-1.297-.49-.368-.315-.49-.753-.49-1.243s.122-.928.49-1.243c.369-.315.807-.49 1.297-.49s.928.175 1.297.49c.368.315.49.753.49 1.243s-.122.928-.49 1.243c-.369.315-.807.49-1.297.49z" />
                                    <path d="M12.017 5.396c-3.63 0-6.591 2.961-6.591 6.591s2.961 6.591 6.591 6.591 6.591-2.961 6.591-6.591-2.961-6.591-6.591-6.591zm0 10.988c-2.426 0-4.397-1.971-4.397-4.397s1.971-4.397 4.397-4.397 4.397 1.971 4.397 4.397-1.971 4.397-4.397 4.397z" />
                                </svg>
                            </a>
                            <a
                                href={import.meta.env.VITE_FACEBOOK_URL || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors group"
                                aria-label="Follow us on Facebook"
                            >
                                <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a
                                href={import.meta.env.VITE_TIKTOK_URL || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors group"
                                aria-label="Follow us on TikTok"
                            >
                                <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                </svg>
                            </a>
                        </div>
                        <p className="text-white/70 text-xs mt-2">Follow us @crewvarapp</p>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-white/20 pt-6">
                    <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
                        <div className="text-center lg:text-left">
                            <p className="text-white/80 text-sm">
                                © {currentYear} Crewvar. All rights reserved.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center lg:justify-end gap-4 text-sm">
                            <Link
                                to="/privacy-policy"
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                Privacy
                            </Link>
                            <Link
                                to="/terms-of-service"
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                Terms
                            </Link>
                            <Link
                                to="/support"
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                Support
                            </Link>
                            <button
                                onClick={handleSupportClick}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                Contact
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

