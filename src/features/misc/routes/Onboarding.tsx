import OnboardingForm from "../../../components/OnboardingForm";

export const Onboarding = () => {
    return (
        <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                        <div className="text-center mb-8">
                            <img 
                                src="/src/assets/images/logo.png" 
                                alt="Crewvar Logo" 
                                className="h-16 w-auto mx-auto mb-4"
                            />
                        </div>
                        
                        <OnboardingForm />
                    </div>
                </div>
            </div>
        </div>
    );
};
