import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContextFirebase";
import { toast } from "react-toastify";
// import { FcGoogle } from "react-icons/fc"; // Unused - Google auth hidden

const LoginForm = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await signIn(email, password);

            console.log('Login successful!');
            toast.success('Login successful!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
            // Navigate to dashboard, OnboardingGuard will redirect to onboarding if needed
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Login error:', error);

            // Handle different types of errors with user-friendly messages
            let userFriendlyMessage = 'Login failed. Please try again.';

            if (error.response?.status === 401) {
                userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
            } else if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
                // Handle email verification required
                userFriendlyMessage = 'Please verify your email address before logging in.';
                toast.error(userFriendlyMessage, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                // Redirect to verification pending page
                navigate('/auth/verification-pending', {
                    state: { email: email }
                });
                return;
            } else if (error.response?.status === 404) {
                userFriendlyMessage = 'Account not found. Please check your email address or create a new account.';
            } else if (error.response?.status === 429) {
                userFriendlyMessage = 'Too many login attempts. Please wait a moment and try again.';
            } else if (error.response?.status >= 500) {
                userFriendlyMessage = 'Server error. Please try again later.';
            } else if (error.message?.includes('Network Error') || error.code === 'NETWORK_ERROR') {
                userFriendlyMessage = 'Connection error. Please check your internet connection and try again.';
            } else if (error.response?.data?.error) {
                // Use backend error message if it's user-friendly
                const backendError = error.response.data.error.toLowerCase();
                if (backendError.includes('invalid') || backendError.includes('incorrect')) {
                    userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
                } else if (backendError.includes('not found') || backendError.includes('does not exist')) {
                    userFriendlyMessage = 'Account not found. Please check your email address or create a new account.';
                } else {
                    userFriendlyMessage = error.response.data.error;
                }
            }

            toast.error(userFriendlyMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Google login handler - commented out since Google auth is hidden
    // const handleGoogleLogin = async () => {
    //     try {
    //         setIsLoading(true);
    //         const { signInWithGoogle } = await import('../../firebase/auth');
    //         await signInWithGoogle();
    //         toast.success('🎉 Google login successful!', {
    //             position: "top-right",
    //             autoClose: 3000,
    //             hideProgressBar: false,
    //             closeOnClick: true,
    //             pauseOnHover: false,
    //             draggable: false,
    //         });
    //         // Navigate to dashboard, OnboardingGuard will redirect to onboarding if needed
    //         navigate('/dashboard');
    //     } catch (error: any) {
    //         console.error('Google login error:', error);
    //         toast.error('Google login failed. Please try again.', {
    //             position: "top-right",
    //             autoClose: 5000,
    //             hideProgressBar: false,
    //             closeOnClick: true,
    //             pauseOnHover: false,
    //             draggable: false,
    //         });
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };


    return (
        <div className="w-full max-w-md mx-auto">
            <form onSubmit={handleLogin} className="space-y-4">

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Email Address"
                        className="w-full px-4 py-3 rounded-lg bg-gray-200 border focus:border-primary focus:bg-white focus:outline-none"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Password"
                        className="w-full px-4 py-3 rounded-lg bg-gray-200 border focus:border-primary focus:bg-white focus:outline-none"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full font-semibold text-sm bg-dark text-white transition hover:bg-opacity-90 rounded-xl py-3 px-4 disabled:opacity-50"
                >
                    {isLoading ? "Signing In..." : "Sign In"}
                </button>
            </form>

            {/* Google Authentication Button - Hidden */}
            {/* <hr className="my-6 border-gray-300 w-full" />
            <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="flex w-full items-center justify-center font-semibold text-sm bg-gray-100 text-dark transition-colors hover:bg-gray-200 rounded-xl py-3 px-4 mb-4 disabled:opacity-50"
            >
                <FcGoogle className="mr-2 w-6 h-6" />
                Sign in with Google
            </button> */}

            <div className="mt-6 text-center">
                <p className="text-sm">
                    Need an account?{" "}
                    <Link
                        className="font-semibold text-primary transition-colors hover:text-dark"
                        to="/auth/signup"
                    >
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;