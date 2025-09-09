import { PortConnectionsDashboard } from "../../../components/PortConnectionsDashboard";
import Navbar from "../../../components/Elements/Navbar";

export const PortConnections = () => {
    return (
        <div className="container">
            <Navbar />
            <div className="min-h-screen" style={{ backgroundColor: '#B9F3DF' }}>
                <div className="py-8">
                    <div className="max-w-4xl mx-auto px-4">
                        <PortConnectionsDashboard />
                    </div>
                </div>
            </div>
        </div>
    );
};
