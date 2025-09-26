import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";

interface FeedbackFormData {
    type: 'ship' | 'position' | 'department' | 'other';
    name: string;
    cruiseLine?: string;
    description: string;
    email: string;
}

interface MissingShipFeedbackProps {
    isOpen: boolean;
    onClose: () => void;
}

const feedbackValidationSchema = yup.object({
    type: yup.string().required("Please select what's missing"),
    name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
    cruiseLine: yup.string().optional(),
    description: yup.string().required("Description is required").min(10, "Please provide more details"),
    email: yup.string().email("Please enter a valid email").required("Email is required")
}) as yup.ObjectSchema<FeedbackFormData>;

export const MissingShipFeedback = ({ isOpen, onClose }: MissingShipFeedbackProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<FeedbackFormData>({
        resolver: yupResolver(feedbackValidationSchema),
        defaultValues: {
            type: 'ship',
            name: '',
            cruiseLine: '',
            description: '',
            email: ''
        }
    });

    const watchedType = watch("type");

    const onSubmit = async (data: FeedbackFormData) => {
        setIsSubmitting(true);

        try {
            console.log('📧 Submitting feedback:', data);

            // TODO: Implement Firebase feedback submission
            const response = { success: true };

            if (response.success) {
                toast.success('Feedback submitted successfully! We\'ll review it and add the missing information.');
                setIsSubmitted(true);

                // Reset form after 2 seconds
                setTimeout(() => {
                    setIsSubmitted(false);
                    reset();
                    onClose();
                }, 2000);
            } else {
                throw new Error('Failed to submit feedback');
            }

        } catch (error: any) {
            console.error('❌ Failed to submit feedback:', error);

            if (error.response?.data?.error) {
                toast.error(`Failed to submit feedback: ${error.response.data.error}`);
            } else if (error.message) {
                toast.error(`Failed to submit feedback: ${error.message}`);
            } else {
                toast.error('Failed to submit feedback. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            reset();
            setIsSubmitted(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-[#069B93]">Missing Something?</h2>
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
                        >
                            ×
                        </button>
                    </div>

                    {isSubmitted ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-green-600 text-2xl">✓</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank You!</h3>
                            <p className="text-gray-600">
                                Your feedback has been submitted. We'll review it and add the missing information to our database.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* What's Missing */}
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                    What's missing?
                                </label>
                                <select
                                    {...register("type")}
                                    id="type"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                >
                                    <option value="ship">Ship</option>
                                    <option value="position">Position</option>
                                    <option value="department">Department</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.type && (
                                    <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                                )}
                            </div>

                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    {watchedType === 'ship' ? 'Ship Name' :
                                        watchedType === 'position' ? 'Position Name' :
                                            watchedType === 'department' ? 'Department Name' : 'Name'}
                                </label>
                                <input
                                    {...register("name")}
                                    type="text"
                                    id="name"
                                    placeholder={watchedType === 'ship' ? 'e.g., Harmony of the Seas' :
                                        watchedType === 'position' ? 'e.g., Assistant Cruise Director' :
                                            watchedType === 'department' ? 'e.g., Medical Services' : 'Name'}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            {/* Cruise Line (only for ships) */}
                            {watchedType === 'ship' && (
                                <div>
                                    <label htmlFor="cruiseLine" className="block text-sm font-medium text-gray-700 mb-2">
                                        Cruise Line
                                    </label>
                                    <input
                                        {...register("cruiseLine")}
                                        type="text"
                                        id="cruiseLine"
                                        placeholder="e.g., Royal Caribbean, Carnival, Norwegian"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                    />
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Details
                                </label>
                                <textarea
                                    {...register("description")}
                                    id="description"
                                    rows={3}
                                    placeholder="Please provide any additional information that would help us add this to our database..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none resize-none"
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Email
                                </label>
                                <input
                                    {...register("email")}
                                    type="email"
                                    id="email"
                                    placeholder="your.email@example.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs">ℹ</span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-blue-900">Help Us Improve</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Your suggestions help us keep our database up-to-date. We'll review your feedback and add missing ships, positions, or departments.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 text-white bg-[#069B93] hover:bg-[#058a7a] rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
