import React from 'react';
import { HiSearch, HiX, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { Input, Button, Autocomplete, Select } from '../../components/ui';

interface ChatRoomsSearchFilterProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    showFilters: boolean;
    setShowFilters: (show: boolean) => void;
    selectedShip: string;
    setSelectedShip: (ship: string) => void;
    selectedDepartment: string;
    setSelectedDepartment: (department: string) => void;
    selectedRole: string;
    setSelectedRole: (role: string) => void;
    sortBy: 'recent' | 'name' | 'unread';
    setSortBy: (sort: 'recent' | 'name' | 'unread') => void;
    uniqueShips: string[];
    uniqueDepartments: string[];
    uniqueRoles: string[];
    hasActiveFilters: boolean;
    clearFilters: () => void;
}

export const ChatRoomsSearchFilter: React.FC<ChatRoomsSearchFilterProps> = ({
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    selectedShip,
    setSelectedShip,
    selectedDepartment,
    setSelectedDepartment,
    selectedRole,
    setSelectedRole,
    sortBy,
    setSortBy,
    uniqueShips,
    uniqueDepartments,
    uniqueRoles,
    hasActiveFilters,
    clearFilters
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-4 sm:p-6">
                {/* Search Bar */}
                <div className="mb-4">
                    <Input
                        type="text"
                        placeholder="Search conversations, names, ships, departments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftIcon={<HiSearch className="h-5 w-5 text-gray-400" />}
                        size="md"
                    />
                </div>

                {/* Filter Toggle */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center space-x-2 text-gray-700 hover:text-teal-600"
                    >
                        <span>Filters</span>
                        {showFilters ? <HiChevronUp className="h-4 w-4" /> : <HiChevronDown className="h-4 w-4" />}
                    </Button>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                        >
                            <HiX className="h-4 w-4" />
                            <span>Clear filters</span>
                        </Button>
                    )}
                </div>

                {/* Filter Options */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Ship Filter */}
                            <div>
                                <Autocomplete
                                    label="Ship"
                                    value={selectedShip}
                                    onChange={(value) => setSelectedShip(value)}
                                    options={[
                                        { id: '', name: 'All Ships' },
                                        ...uniqueShips.map(ship => ({ id: ship, name: ship }))
                                    ]}
                                    placeholder="Select ship..."
                                />
                            </div>

                            {/* Department Filter */}
                            <div>
                                <Autocomplete
                                    label="Department"
                                    value={selectedDepartment}
                                    onChange={(value) => setSelectedDepartment(value)}
                                    options={[
                                        { id: '', name: 'All Departments' },
                                        ...uniqueDepartments.map(dept => ({ id: dept, name: dept }))
                                    ]}
                                    placeholder="Select department..."
                                />
                            </div>

                            {/* Role Filter */}
                            <div>
                                <Autocomplete
                                    label="Role"
                                    value={selectedRole}
                                    onChange={(value) => setSelectedRole(value)}
                                    options={[
                                        { id: '', name: 'All Roles' },
                                        ...uniqueRoles.map(role => ({ id: role, name: role }))
                                    ]}
                                    placeholder="Select role..."
                                />
                            </div>

                            {/* Sort Filter */}
                            <div>
                                <Select
                                    label="Sort by"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'unread')}
                                    options={[
                                        { value: 'recent', label: 'Most Recent' },
                                        { value: 'name', label: 'Name (A-Z)' },
                                        { value: 'unread', label: 'Unread First' }
                                    ]}
                                    size="sm"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
