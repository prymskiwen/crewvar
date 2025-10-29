import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
// import { FcGoogle } from "react-icons/fc"; // Unused - Google auth hidden
import { useAuth } from "../../context/AuthContextFirebase";
import { Spinner } from "../Elements/Spinner";
import { useState } from "react";
import { toast } from "react-toastify";

const registerValidationSchema = yup.object({
    email: yup.string().email("Please enter a valid email address").required("Email is required"),
    password: yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters")
        .matches(/^\S*$/, "Password cannot contain spaces"),
    password2: yup.string()
        .oneOf([yup.ref("password")], "Passwords do not match")
        .required("Password confirmation is required")
});
type SignupForm = yup.InferType<typeof registerValidationSchema>;


const SignupForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
        resolver: yupResolver<SignupForm>(registerValidationSchema),
    });
    const { signUp } = useAuth();

    const handleRegister = async (data: SignupForm) => {
        console.log('Form submitted with data:', data);
        try {
            setIsLoading(true);
            const displayName = data.email.split('@')[0]; // Use email prefix as display name

            console.log('Sending registration request:', { email: data.email, displayName });
            await signUp(data.email.trim(), data.password, displayName);
            console.log('Registration successful');
            toast.success('🎉 Registration successful! Please check your email for verification link.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
            });
            console.log('Navigating to verification pending page...');
            navigate("/auth/verification-pending", {
                state: { email: data.email }
            });
        } catch (error: any) {
            console.error('Registration error:', error);

            let userFriendlyMessage = 'Registration failed. Please try again.';

            if (error.code === 'auth/email-already-in-use') {
                userFriendlyMessage = 'An account with this email already exists. Please use a different email or try logging in.';
            } else if (error.code === 'auth/weak-password') {
                userFriendlyMessage = 'Password is too weak. Please choose a stronger password.';
            } else if (error.code === 'auth/invalid-email') {
                userFriendlyMessage = 'Invalid email address. Please check your email and try again.';
            } else if (error.message) {
                userFriendlyMessage = error.message;
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
        <>
            <form
                className="w-full relative"
                onSubmit={handleSubmit(handleRegister)}
            >
                {isLoading && <Spinner />}
                <div className="flex flex-col mb-3">
                    <label htmlFor="email" className="text-secondary">
                        Email Address
                    </label>
                    <input
                        {...register("email")}
                        type="email"
                        id="email"
                        placeholder="Enter Email Address"
                        className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-1 border focus:border-primary focus:bg-white focus:outline-none"
                    />
                    {
                        <p className="text-red-500 font-semibold mt-1">
                            {errors.email?.message}
                        </p>
                    }
                </div>
                <div className="flex flex-col w-full mb-3">
                    <label htmlFor="password" className="text-secondary">
                        Password
                    </label>
                    <input
                        {...register("password")}
                        type="password"
                        id="password"
                        placeholder="Enter Password"
                        className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-1 border focus:border-primary focus:bg-white focus:outline-none"
                    />
                    {
                        <p className="text-red-500 font-semibold mt-1">
                            {errors.password?.message}
                        </p>
                    }
                </div>
                <div className="flex flex-col w-full mb-3">
                    <label htmlFor="password2" className="text-secondary">
                        Confirm Password
                    </label>
                    <input
                        {...register("password2")}
                        type="password"
                        id="password2"
                        placeholder="Confirm Password"
                        className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-1 border focus:border-primary focus:bg-white focus:outline-none"
                    />
                    {
                        <p className="text-red-500 font-semibold mt-1">
                            {errors.password2?.message}
                        </p>
                    }
                </div>
                <button
                    type="submit"
                    className="w-full font-semibold text-sm bg-dark text-white transition hover:bg-opacity-90 rounded-xl py-3 px-4"
                    onClick={() => console.log('Signup button clicked')}
                >
                    Sign up
                </button>
            </form>
            {/* Google Authentication Button - Hidden */}
            {/* <hr className="my-6 border-gray-300 w-full" />
            <button
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center font-semibold text-sm bg-gray-100 text-dark transition-colors hover:bg-gray-200 rounded-xl py-3 px-4 mb-4"
            >
                <FcGoogle className="mr-2 w-6 h-6" />
                Sign in with Google
            </button> */}
            <p className="text-sm">
                Already have an account?{" "}
                <Link
                    className="font-semibold text-primary transition-colors hover:text-dark"
                    to="/auth/login"
                >
                    Sign in
                </Link>
            </p>
        </>
    );
};

export default SignupForm;