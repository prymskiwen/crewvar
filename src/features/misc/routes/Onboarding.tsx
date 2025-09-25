import OnboardingForm from "../../../components/OnboardingForm";
import logo from "../../../assets/images/Home/logo.png";

export const Onboarding = () => {
    return (
        <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
            <div className="min-h-screen flex items-center justify-center py-4 sm:py-12 px-2 sm:px-4 lg:px-8">
                <div className="max-w-4xl w-full">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 lg:p-12">
                        <div className="text-center mb-6 sm:mb-8">
                            <img 
                                src={logo} 
                                alt="Crewvar Logo" 
                                className="h-12 sm:h-16 w-auto mx-auto mb-3 sm:mb-4"
                            />
                        </div>
                        
                        <OnboardingForm />
                    </div>
                </div>
            </div>
        </div>
    );
};
