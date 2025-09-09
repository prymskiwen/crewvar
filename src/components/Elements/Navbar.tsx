import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/images/logo.png";
import { HiMenu, HiX } from "react-icons/hi";

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

    const { signOut, currentUser } = useAuth();
    const navigate = useNavigate();
    
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
                        <img src={logo} alt="Crewvar Logo" className="h-[30px] sm:h-[40px] md:h-[50px] lg:h-[60px] w-auto" />
                    </Link>
                </div>

                {/* Desktop Menu */}
                <div className="hidden lg:flex text-secondary text-lg items-auto">
                    {currentUser ? (
                        <>
                            <div className="flex items-center space-x-6 mr-6">
                                <Link
                                    to="/dashboard"
                                    className="text-sm font-medium text-[#069B93] hover:text-[#058a7a] transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/explore-ships"
                                    className="text-sm font-medium text-[#069B93] hover:text-[#058a7a] transition-colors"
                                >
                                    Discover Who's On Board!
                                </Link>
                                <Link
                                    to="/chat"
                                    className="text-sm font-medium text-[#069B93] hover:text-[#058a7a] transition-colors"
                                >
                                    Messages
                                </Link>
                                <Link
                                    to="/favorites"
                                    className="text-sm font-medium text-[#069B93] hover:text-[#058a7a] transition-colors"
                                >
                                    Favorites
                                </Link>
                                <Link
                                    to="/privacy"
                                    className="text-sm font-medium text-[#069B93] hover:text-[#058a7a] transition-colors"
                                >
                                    Privacy
                                </Link>
                                <Link
                                    to="/moderation"
                                    className="text-sm font-medium text-[#069B93] hover:text-[#058a7a] transition-colors"
                                >
                                    Moderation
                                </Link>
                            </div>
                            <div className="font-medium text-sm text-dark relative ml-5">
                                <button className="flex items-center space-x-2">
                                    <img
                                        src={currentUser?.photoURL || "/default-avatar.png"}
                                        alt="Profile"
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <span className="text-sm font-medium">{currentUser?.displayName}</span>
                                </button>
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
                                
                                {/* Mobile Navigation Links */}
                                <div className="space-y-1 mb-3">
                                    <Link
                                        to="/dashboard"
                                        className="block w-full px-3 py-2 text-sm font-medium text-[#069B93] hover:text-[#00A59E] hover:bg-white/50 rounded-lg transition-all duration-200"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/explore-ships"
                                        className="block w-full px-3 py-2 text-sm font-medium text-[#069B93] hover:text-[#00A59E] hover:bg-white/50 rounded-lg transition-all duration-200"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Discover Who's On Board!
                                    </Link>
                                    <Link
                                        to="/chat"
                                        className="block w-full px-3 py-2 text-sm font-medium text-[#069B93] hover:text-[#00A59E] hover:bg-white/50 rounded-lg transition-all duration-200"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Messages
                                    </Link>
                                    <Link
                                        to="/favorites"
                                        className="block w-full px-3 py-2 text-sm font-medium text-[#069B93] hover:text-[#00A59E] hover:bg-white/50 rounded-lg transition-all duration-200"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Favorites
                                    </Link>
                                    <Link
                                        to="/privacy"
                                        className="block w-full px-3 py-2 text-sm font-medium text-[#069B93] hover:text-[#00A59E] hover:bg-white/50 rounded-lg transition-all duration-200"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Privacy
                                    </Link>
                                    <Link
                                        to="/moderation"
                                        className="block w-full px-3 py-2 text-sm font-medium text-[#069B93] hover:text-[#00A59E] hover:bg-white/50 rounded-lg transition-all duration-200"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Moderation
                                    </Link>
                                    <Link
                                        to="/port-connections"
                                        className="block w-full px-3 py-2 text-sm font-medium text-[#069B93] hover:text-[#00A59E] hover:bg-white/50 rounded-lg transition-all duration-200"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Port Connections
                                    </Link>
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