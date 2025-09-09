interface ICrewMember {
    id: string;
    name: string;
    role: string;
    department: string;
    avatar: string;
    shipName: string;
    port: string;
}

const CrewMemberPreview = (props: ICrewMember) => {
    const handleRequestConnection = () => {
        console.log(`Requesting connection with ${props.name}`);
        // In a real app, this would send a connection request
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="mb-3">
                    <img
                        src={props.avatar}
                        alt={props.name}
                        className="w-16 h-16 rounded-full object-cover mx-auto"
                    />
                </div>
                
                {/* Name and Role */}
                <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate w-full">
                    {props.name}
                </h3>
                <p className="text-xs text-gray-600 mb-2 truncate w-full">
                    {props.role}
                </p>
                <p className="text-xs text-gray-500 mb-2 truncate w-full">
                    {props.department}
                </p>
                
                {/* Ship and Port Info */}
                <div className="mb-3 text-xs text-gray-500">
                    <p className="truncate w-full" title={props.shipName}>
                        {props.shipName}
                    </p>
                    <p className="truncate w-full" title={props.port}>
                        {props.port}
                    </p>
                </div>
                
                {/* Request to Connect Button */}
                <button
                    onClick={handleRequestConnection}
                    className="w-full px-3 py-2 text-xs font-medium text-white bg-[#069B93] hover:bg-[#058a7a] rounded-lg transition-colors"
                >
                    Request to Connect
                </button>
            </div>
        </div>
    );
};

export default CrewMemberPreview;
