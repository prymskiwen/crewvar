import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { createMissingReport } from '../../firebase/firestore';
import { Button, Input, FormGroup } from '../ui';

const validationSchema = yup.object({
    type: yup.string().required('Please select what is missing'),
    name: yup.string().required('Please provide the name'),
    description: yup.string().required('Please provide a description'),
});

interface MissingReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MissingReportModal: React.FC<MissingReportModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch
    } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            type: '',
            name: '',
            description: '',
        }
    });

    const watchedType = watch('type');

    const onSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            await createMissingReport({
                type: data.type,
                name: data.name,
                description: data.description,
            });
            
            toast.success('Report submitted successfully! We\'ll review it soon.');
            reset();
            onClose();
        } catch (error) {
            console.error('Error submitting report:', error);
            toast.error('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Report Missing Item
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <FormGroup
                            label="What's missing?"
                            required
                        >
                            <select
                                {...register('type')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none"
                            >
                                <option value="">Select what's missing</option>
                                <option value="ship">Ship</option>
                                <option value="role">Role</option>
                                <option value="department">Department</option>
                                <option value="cruise_line">Cruise Line</option>
                            </select>
                            {errors.type && (
                                <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                            )}
                        </FormGroup>

                        <FormGroup
                            label="Name"
                            required
                        >
                            <Input
                                {...register('name')}
                                placeholder={
                                    watchedType === 'ship' ? 'Ship name (e.g., "Harmony of the Seas")' :
                                    watchedType === 'role' ? 'Role name (e.g., "Entertainment Director")' :
                                    watchedType === 'department' ? 'Department name (e.g., "Guest Services")' :
                                    watchedType === 'cruise_line' ? 'Cruise line name (e.g., "Royal Caribbean")' :
                                    'Enter the name'
                                }
                                error={errors.name?.message}
                            />
                        </FormGroup>

                        <FormGroup
                            label="Description"
                            required
                        >
                            <textarea
                                {...register('description')}
                                rows={4}
                                placeholder="Please provide any additional details about this missing item..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#069B93] focus:ring-1 focus:ring-[#069B93] focus:outline-none resize-none"
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                            )}
                        </FormGroup>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                loading={isSubmitting}
                                disabled={isSubmitting}
                            >
                                Submit Report
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
