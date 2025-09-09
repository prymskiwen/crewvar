import { useOnboardingGuard } from "../context/OnboardingGuardContext";
import { Link } from "react-router-dom";

export const OnboardingProgress = () => {
    const { 
        onboardingStatus, 
        isOnboardingComplete, 
        missingRequirements,
        requirements 
    } = useOnboardingGuard();

    if (!onboardingStatus || isOnboardingComplete) {
        return null;
    }

    const progressPercentage = onboardingStatus.onboardingProgress;

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-[#069B93]">Complete Your Profile</h2>
                    <p className="text-sm text-gray-600">
                        {missingRequirements.length} requirement{missingRequirements.length !== 1 ? 's' : ''} remaining
                    </p>
                </div>
                <Link
                    to="/onboarding"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#069B93] hover:bg-[#058a7a] rounded-lg transition-colors"
                >
                    Complete Setup
                </Link>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Profile Progress</span>
                    <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className="bg-[#069B93] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Requirements List */}
            <div className="space-y-2">
                {requirements.map((requirement) => (
                    <div key={requirement.id} className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            requirement.isCompleted 
                                ? 'bg-green-500' 
                                : 'bg-gray-200'
                        }`}>
                            {requirement.isCompleted && (
                                <span className="text-white text-xs">✓</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${
                                requirement.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                            }`}>
                                {requirement.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {requirement.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Missing Requirements Alert */}
            {missingRequirements.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <span className="text-yellow-600">⚠</span>
                        <p className="text-sm text-yellow-800">
                            Complete your profile to access ship rosters and connect with other crew members.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
