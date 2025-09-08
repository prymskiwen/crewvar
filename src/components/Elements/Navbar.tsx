import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/images/logo.png";
import { HiMenu, HiX } from "react-icons/hi";

const Navbar = () => {
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

    const { signOut, currentUser } = useAuth();
    const navigate = useNavigate();
    const handleNavClick = () => {
        setDropdownOpen(prevState => !prevState);
    };

    const handleSignOut = () => {
        signOut();
        navigate("/auth/login");
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(prevState => !prevState);
    };

    return (
        <div className="px-2 xs:px-6 py-5 justify-between rounded-xl items-center relative z-30">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="font-bold">
                    <Link to="/">
                        <img src={logo} alt="ShipOhana Logo" className="h-[30px] sm:h-[40px] md:h-[50px] lg:h-[60px] w-auto" />
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className="hidden lg:flex text-secondary text-lg items-auto">
                    {currentUser ? (
                        <>
                            <div className="font-medium text-sm text-dark relative ml-5">
                                {dropdownOpen && (
                                    <div className="z-10 transform animate-dropdown origin-top-right absolute mb-10 mt-4 right-0 bg-white divide-y divide-gray-100 rounded-lg shadow w-44">
                                        {currentUser &&
                                        <div className="px-4 py-3 text-sm text-dark">
                                            <div>{currentUser?.displayName}</div>
                                            <div className="font-medium truncate">
                                                {currentUser?.email}
                                            </div>
                                        </div>
                                        }
                                        <div className="py-2">
                                            <button
                                                onClick={handleSignOut}
                                                className="px-4 py-2 text-left hover:bg-gray-100 w-full text-sm text-dark"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <Link
                                to="/auth/login"
                                className="px-4 py-2 text-sm font-medium text-[#00A59E] hover:text-primary transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/auth/signup"
                                className="px-4 py-2 text-sm font-medium text-[#00A59E] hover:text-primary transition-colors"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Hamburger Menu */}
                <div className="lg:hidden">
                    <button
                        onClick={toggleMobileMenu}
                        className="text-white hover:text-primary transition-colors"
                    >
                        {mobileMenuOpen ? <HiX className="w-6 h-6 sm:w-8 sm:h-8" /> : <HiMenu className="w-6 h-6 sm:w-8 sm:h-8" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="lg:hidden absolute top-full right-0 mt-2 w-48 bg-[#B9F3DF] border border-[#069B93]/20 rounded-xl shadow-xl z-50">
                    <div className="py-3">
                        {currentUser ? (
                            <div className="px-4 py-2">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-[#00A59E] to-[#069B93] rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white font-semibold text-xs">
                                            {currentUser?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-[#069B93] truncate">
                                            {currentUser?.displayName || 'User'}
                                        </div>
                                        <div className="text-xs text-gray-600 truncate">
                                            {currentUser?.email}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                >
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <div className="px-4 py-2 space-y-2">
                                <Link
                                    to="/auth/login"
                                    className="block w-full px-3 py-2.5 text-sm font-medium text-[#069B93] hover:text-[#00A59E] hover:bg-white/50 rounded-lg transition-all duration-200 text-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/auth/signup"
                                    className="block w-full px-3 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#00A59E] to-[#069B93] hover:from-[#00A59E]/90 hover:to-[#069B93]/90 rounded-lg transition-all duration-200 text-center shadow-lg"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;