import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContextFirebase';
import { getChatRooms, createOrGetChatRoom, getShips, getDepartments, getRoles } from '../../firebase/firestore';
import { LoadingPage } from '../../components/ui';
import { DashboardLayout } from '../../layout/DashboardLayout';
import { ChatRoomsSearchFilter } from './ChatRoomsSearchFilter';
import { ChatRoomsSummary } from './ChatRoomsSummary';
import { ChatRoomsList } from './ChatRoomsList';
import { getShipName, getDepartmentName, getRoleName } from '../../utils/data';
import logo from '../../assets/images/Home/logo.png';

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedShip, setSelectedShip] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'unread'>('recent');

  // Fetch chat rooms using React Query
  const { data: chatRooms = [], isLoading } = useQuery({
    queryKey: ['chatRooms', currentUser?.uid],
    queryFn: () => getChatRooms(currentUser!.uid),
    enabled: !!currentUser?.uid
  });

  // Fetch all ships, departments, and roles for filter options
  const { data: allShips = [] } = useQuery({
    queryKey: ['ships'],
    queryFn: getShips
  });

  const { data: allDepartments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments
  });

  const { data: allRoles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles
  });

  // Handle specific user ID from URL
  useEffect(() => {
    if (userId && currentUser) {
      // First, try to find existing room
      const existingRoom = chatRooms.find(room => room.otherUserId === userId);
      if (existingRoom) {
        navigate(`/chat/room/${existingRoom.id}`);
        return;
      }

      // If no existing room and we have chat rooms loaded, create a new one
      if (chatRooms.length >= 0) {
        setIsCreatingRoom(true);
        createOrGetChatRoom(currentUser.uid, userId).then(async (roomId) => {
          console.log('Created chat room with ID:', roomId);
          // Navigate to the new room
          navigate(`/chat/room/${roomId}`);
          setIsCreatingRoom(false);
          // Invalidate and refetch chat rooms to get the new room
          await queryClient.invalidateQueries({ queryKey: ['chatRooms', currentUser.uid] });
        }).catch(error => {
          console.error('Error creating chat room:', error);
          setIsCreatingRoom(false);
        });
      }
    }
  }, [userId, chatRooms, currentUser, queryClient, navigate]);

  // Get all available options for filters from database
  const uniqueShips = useMemo(() => {
    return allShips.map(ship => ship.name || ship.id).sort();
  }, [allShips]);

  const uniqueDepartments = useMemo(() => {
    return allDepartments.map(dept => dept.name || dept.id).sort();
  }, [allDepartments]);

  const uniqueRoles = useMemo(() => {
    return allRoles.map(role => role.name || role.id).sort();
  }, [allRoles]);


  // Filter and search logic
  const filteredRooms = useMemo(() => {
    let filtered = chatRooms;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(room =>
        room.otherUserProfile?.displayName?.toLowerCase().includes(query) ||
        room.otherUserProfile?.currentShipId?.toLowerCase().includes(query) ||
        room.otherUserProfile?.departmentId?.toLowerCase().includes(query) ||
        room.otherUserProfile?.roleId?.toLowerCase().includes(query) ||
        (room.lastMessage && room.lastMessage.toLowerCase().includes(query))
      );
    }

    // Filter by ship
    if (selectedShip) {
      filtered = filtered.filter(room => {
        const userShipId = room.otherUserProfile?.currentShipId;
        const shipName = getShipName(userShipId, allShips);
        return shipName === selectedShip || userShipId === selectedShip;
      });
    }

    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter(room => {
        const userDeptId = room.otherUserProfile?.departmentId;
        const departmentName = getDepartmentName(userDeptId, allDepartments);
        return departmentName === selectedDepartment || userDeptId === selectedDepartment;
      });
    }

    // Filter by role
    if (selectedRole) {
      filtered = filtered.filter(room => {
        const userRoleId = room.otherUserProfile?.roleId;
        const roleName = getRoleName(userRoleId, allRoles);
        return roleName === selectedRole || userRoleId === selectedRole;
      });
    }

    // Sort
    switch (sortBy) {
      case 'name':
        filtered = [...filtered].sort((a, b) =>
          (a.otherUserProfile?.displayName || '').localeCompare(b.otherUserProfile?.displayName || '')
        );
        break;
      case 'unread':
        filtered = [...filtered].sort((a, b) => (b.unreadCount ?? 0) - (a.unreadCount ?? 0));
        break;
      case 'recent':
      default:
        filtered = [...filtered].sort((a, b) => {
          const timeA = new Date(a.lastMessageAt || a.createdAt || 0).getTime();
          const timeB = new Date(b.lastMessageAt || b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        break;
    }

    return filtered;
  }, [chatRooms, searchQuery, selectedShip, selectedDepartment, selectedRole, sortBy]);

  const handleRoomSelect = (room: any) => {
    navigate(`/chat/room/${room.id}`);
  };


  const clearFilters = () => {
    setSearchQuery('');
    setSelectedShip('');
    setSelectedDepartment('');
    setSelectedRole('');
    setSortBy('recent');
  };

  const hasActiveFilters = Boolean(searchQuery || selectedShip || selectedDepartment || selectedRole || sortBy !== 'recent');


  if (isLoading || isCreatingRoom) {
    return (
      <LoadingPage message={isCreatingRoom ? "Creating chat room..." : "Loading chat rooms..."} backgroundColor="#f9fafb" />
    );
  }


  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Mobile Header - Matching Other Pages Style */}
        <div className="bg-teal-600 text-white p-3 sm:p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="p-2 hover:bg-teal-700 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-bold">Messages</h1>
                <p className="text-xs text-teal-100">Chat with your connected crew members</p>
              </div>
            </div>
            <Link to="/dashboard" className="flex items-center hover:bg-teal-700 rounded-lg px-2 sm:px-3 py-2 transition-colors">
              <img
                src={logo}
                alt="Crewvar Logo"
                className="h-5 sm:h-6 w-auto brightness-0 invert"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

            {/* Search and Filter Bar */}
            <ChatRoomsSearchFilter
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              selectedShip={selectedShip}
              setSelectedShip={setSelectedShip}
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              sortBy={sortBy}
              setSortBy={setSortBy}
              uniqueShips={uniqueShips}
              uniqueDepartments={uniqueDepartments}
              uniqueRoles={uniqueRoles}
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
            />

            {/* Results Summary */}
            <ChatRoomsSummary
              totalRooms={filteredRooms.length}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Chat Rooms List */}
            <ChatRoomsList
              chatRooms={filteredRooms}
              onSelectRoom={handleRoomSelect}
              allShips={allShips}
              allDepartments={allDepartments}
              allRoles={allRoles}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
