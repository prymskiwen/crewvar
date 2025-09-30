import { Button, Autocomplete } from '../ui';

interface AssignmentCardProps {
    profile: {
        currentShipId: string;
        currentCruiseLineId: string;
        displayName?: string;
        avatar?: string;
        departmentId?: string;
        roleId?: string;
    };
    setProfile: React.Dispatch<React.SetStateAction<any>>;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    cruiseLines: Array<{ id: string; name: string }>;
    allShips: Array<{ id: string; name: string; cruiseLineId: string }>;
    getCruiseLineFromShip: (shipId: string) => string;
    getShipName: (shipId: string) => string;
    updateUserProfileFunc: (data: any) => Promise<void>;
    shipsLoading: boolean;
    cruiseLinesLoading: boolean;
}

export const AssignmentCard = ({
    profile,
    setProfile,
    isEditing,
    setIsEditing,
    cruiseLines,
    allShips,
    getCruiseLineFromShip,
    getShipName,
    updateUserProfileFunc,
    shipsLoading,
    cruiseLinesLoading
}: AssignmentCardProps) => {

    const handleUpdate = async () => {
        try {
            const updateData = {
                displayName: profile.displayName || '',
                profilePhoto: profile.avatar || '',
                departmentId: profile.departmentId || '',
                roleId: profile.roleId || '',
                currentShipId: profile.currentShipId || ''
            };

            console.log('Updating assignment with data:', updateData);
            await updateUserProfileFunc(updateData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating assignment:', error);
            alert('Failed to update assignment. Please try again.');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                    <img src="/ship-icon.png" alt="Ship" className="w-6 h-6" />
                    <span>Current Assignment</span>
                </h2>
                <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    size="sm"
                >
                    {isEditing ? 'Cancel' : 'Edit'}
                </Button>
            </div>

            {isEditing ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cruise Line
                        </label>
                        <Autocomplete
                            value={profile.currentCruiseLineId}
                            onChange={(value) => setProfile((prev: any) => ({
                                ...prev,
                                currentCruiseLineId: value,
                                currentShipId: '' // Reset ship when cruise line changes
                            }))}
                            options={cruiseLines.map(line => ({ id: line.id, name: line.name }))}
                            placeholder="Choose a cruise line"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ship
                        </label>
                        <Autocomplete
                            value={profile.currentShipId}
                            onChange={(value) => setProfile((prev: any) => ({
                                ...prev,
                                currentShipId: value
                            }))}
                            options={allShips
                                .filter(ship => ship.cruiseLineId === profile.currentCruiseLineId)
                                .map(ship => ({ id: ship.id, name: ship.name }))}
                            placeholder="Choose a ship"
                            disabled={!profile.currentCruiseLineId}
                            className="w-full"
                        />
                    </div>
                    <div className="flex space-x-3 pt-4 border-t border-gray-200">
                        <Button
                            onClick={() => setIsEditing(false)}
                            variant="outline"
                            size="sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={!profile.currentShipId}
                            size="sm"
                        >
                            Update
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-[#069B93]/10 to-[#00A59E]/10 rounded-xl p-4 border border-[#069B93]/20">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Cruise Line</h3>
                            </div>
                        </div>
                        <p className="text-gray-700 font-medium">
                            {shipsLoading || cruiseLinesLoading ? (
                                <span className="text-[#069B93] animate-pulse">Loading...</span>
                            ) : profile.currentShipId ? getCruiseLineFromShip(profile.currentShipId) : 'Select Cruise Line'}
                        </p>
                    </div>
                    <div className="bg-gradient-to-r from-[#069B93]/10 to-[#00A59E]/10 rounded-xl p-4 border border-[#069B93]/20">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Ship</h3>
                            </div>
                        </div>
                        <p className="text-gray-700 font-medium">
                            {shipsLoading ? (
                                <span className="text-[#069B93] animate-pulse">Loading...</span>
                            ) : profile.currentShipId ? getShipName(profile.currentShipId) : 'Select Ship'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
