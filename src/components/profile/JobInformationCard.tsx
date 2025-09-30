import { Button } from '../ui';
import { ProfileEdit } from '../users/ProfileEdit';

interface JobInformationCardProps {
    profile: any;
    setProfile: React.Dispatch<React.SetStateAction<any>>;
    isEditing: boolean;
    setIsEditing: (editing: boolean) => void;
    departments: Array<{ id: string; name: string }>;
    allRoles: Array<{ id: string; name: string; departmentId: string }>;
    getDepartmentName: (departmentId: string) => string;
    getRoleName: (roleId: string) => string;
    handleProfileEditSave: (data: any) => Promise<void>;
}

export const JobInformationCard = ({
    profile,
    setProfile,
    isEditing,
    setIsEditing,
    departments,
    allRoles,
    getDepartmentName,
    getRoleName,
    handleProfileEditSave
}: JobInformationCardProps) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                    <svg className="w-6 h-6 text-[#069B93]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Personal Information</span>
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
                <ProfileEdit
                    user={profile}
                    initialData={{
                        displayName: profile.displayName,
                        departmentId: profile.departmentId || '',
                        roleId: profile.roleId || '',
                        phoneNumber: '',
                        bio: ''
                    }}
                    departments={departments}
                    roles={allRoles}
                    onSave={handleProfileEditSave}
                    onCancel={() => setIsEditing(false)}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-[#069B93]/10 to-[#00A59E]/10 rounded-xl p-4 border border-[#069B93]/20">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm3-1a1 1 0 011-1h2a1 1 0 011 1v1H9V5z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Department</h3>
                            </div>
                        </div>
                        <p className="text-gray-700 font-medium">
                            {profile.departmentId ? getDepartmentName(profile.departmentId) : 'Select Department'}
                        </p>
                    </div>
                    <div className="bg-gradient-to-r from-[#069B93]/10 to-[#00A59E]/10 rounded-xl p-4 border border-[#069B93]/20">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-[#069B93] rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800">Position</h3>
                            </div>
                        </div>
                        <p className="text-gray-700 font-medium">
                            {profile.roleId ? getRoleName(profile.roleId) : 'Select Role'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
