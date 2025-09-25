import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/images/Home/logo.png";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="px-2 xs:px-6 py-5 justify-between rounded-xl items-center relative z-30">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="font-bold">
                    <Link to="/">
                        <img src={logo} alt="Crewvar Logo" className="h-[30px] sm:h-[40px] md:h-[50px] lg:h-[60px] w-auto" />
                    </Link>
                </div>

                {/* Desktop Menu - Sign In/Sign Up buttons */}
                <div className="hidden lg:flex items-center space-x-4">
                    <Link 
                        to="/auth/login" 
                        className="font-semibold text-sm text-[#069B93] hover:text-[#058A7A] transition-colors px-4 py-2"
                    >
                        Sign In
                    </Link>
                    <Link 
                        to="/auth/signup" 
                        className="font-semibold text-sm bg-[#069B93] hover:bg-[#058A7A] transition-colors rounded-lg py-2 px-4 text-white"
                    >
                        Sign Up
                    </Link>
                </div>

                {/* Mobile Hamburger Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Toggle mobile menu"
                >
                    <svg 
                        className="w-6 h-6" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        style={{ color: '#FF8C00' }} // Orange color
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                        />
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
                    <div className="px-4 py-4 space-y-3">
                        <Link 
                            to="/auth/login" 
                            className="block font-semibold text-sm text-[#069B93] hover:text-[#058A7A] transition-colors py-2 px-4 rounded-lg hover:bg-gray-50"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Sign In
                        </Link>
                        <Link 
                            to="/auth/signup" 
                            className="block font-semibold text-sm bg-[#069B93] hover:bg-[#058A7A] transition-colors rounded-lg py-2 px-4 text-white text-center"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;