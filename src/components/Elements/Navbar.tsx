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
                <div className="hidden lg:flex text-secondary text-lg items-center">
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
                                className="px-4 py-2 text-sm font-medium text-[#069B93] hover:text-primary transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/auth/signup"
                                className="px-4 py-2 text-sm font-medium text-[#069B93] hover:text-primary transition-colors"
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
                <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg mt-2 mx-2">
                    <div className="py-4">
                        {currentUser ? (
                            <div className="px-4 py-2">
                                <div className="text-sm text-dark mb-2">
                                    <div className="font-medium">{currentUser?.displayName}</div>
                                    <div className="text-gray-600">{currentUser?.email}</div>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left px-4 py-2 text-sm text-dark hover:bg-gray-100 rounded"
                                >
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <div className="px-4 space-y-2">
                                <Link
                                    to="/auth/login"
                                    className="block px-4 py-2 text-sm font-medium text-dark hover:bg-gray-100 rounded transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/auth/signup"
                                    className="block px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
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