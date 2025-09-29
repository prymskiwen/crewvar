import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiSearch, HiX, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContextFirebase';
import { getChatRooms } from '../../firebase/firestore';
import { ChatWindow } from '../../components/chat';
import { LoadingPage } from '../../components/ui';
import { IChatRoom } from '../../types/chat.d';
import logo from '../../assets/images/Home/logo.png';

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { currentUser } = useAuth();
  const [chatRooms, setChatRooms] = useState<IChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<IChatRoom | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedShip, setSelectedShip] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'unread'>('recent');

  // Fetch chat rooms
  useEffect(() => {
    const fetchChatRooms = async () => {
      if (currentUser) {
        try {
          const rooms = await getChatRooms(currentUser.uid);
          setChatRooms(rooms);
        } catch (error) {
          console.error('Error fetching chat rooms:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchChatRooms();
  }, [currentUser]);

  // Handle specific user ID from URL
  useEffect(() => {
    if (userId && chatRooms.length > 0) {
      const room = chatRooms.find(room => room.other_user_id === userId);
      if (room) {
        setSelectedRoom(room);
      }
    } else if (!userId) {
      setSelectedRoom(null);
    }
  }, [userId, chatRooms]);

  // Get unique values for filters
  const uniqueShips = useMemo(() => {
    const ships = [...new Set(chatRooms.map(room => room.ship_name))].filter(Boolean);
    return ships.sort();
  }, [chatRooms]);

  const uniqueDepartments = useMemo(() => {
    const departments = [...new Set(chatRooms.map(room => room.department_name))].filter(Boolean);
    return departments.sort();
  }, [chatRooms]);

  const uniqueRoles = useMemo(() => {
    const roles = [...new Set(chatRooms.map(room => room.role_name))].filter(Boolean);
    return roles.sort();
  }, [chatRooms]);

  // Filter and search logic
  const filteredRooms = useMemo(() => {
    let filtered = chatRooms;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(room =>
        room.other_user_name.toLowerCase().includes(query) ||
        room.ship_name.toLowerCase().includes(query) ||
        room.department_name.toLowerCase().includes(query) ||
        room.role_name.toLowerCase().includes(query) ||
        (room.last_message_content && room.last_message_content.toLowerCase().includes(query))
      );
    }

    // Filter by ship
    if (selectedShip) {
      filtered = filtered.filter(room => room.ship_name === selectedShip);
    }

    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter(room => room.department_name === selectedDepartment);
    }

    // Filter by role
    if (selectedRole) {
      filtered = filtered.filter(room => room.role_name === selectedRole);
    }

    // Sort
    switch (sortBy) {
      case 'name':
        filtered = [...filtered].sort((a, b) => a.other_user_name.localeCompare(b.other_user_name));
        break;
      case 'unread':
        filtered = [...filtered].sort((a, b) => (b.unread_count ?? 0) - (a.unread_count ?? 0));
        break;
      case 'recent':
      default:
        filtered = [...filtered].sort((a, b) => {
          const timeA = new Date(a.last_message_time || a.created_at || 0).getTime();
          const timeB = new Date(b.last_message_time || b.created_at || 0).getTime();
          return timeB - timeA;
        });
        break;
    }

    return filtered;
  }, [chatRooms, searchQuery, selectedShip, selectedDepartment, selectedRole, sortBy]);

  const handleRoomSelect = (room: IChatRoom) => {
    setSelectedRoom(room);
  };

  const handleBackToList = () => {
    setSelectedRoom(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedShip('');
    setSelectedDepartment('');
    setSelectedRole('');
    setSortBy('recent');
  };

  const hasActiveFilters = searchQuery || selectedShip || selectedDepartment || selectedRole || sortBy !== 'recent';

  // Helper function to format time
  const formatTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return messageTime.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <LoadingPage message="Loading chat rooms..." backgroundColor="#f9fafb" />
    );
  }

  if (selectedRoom) {
    return (
      <ChatWindow
        key={selectedRoom.room_id}
        chatRoom={selectedRoom}
        onClose={handleBackToList}
      />
    );
  }

  return (
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-4 sm:p-6">
              {/* Search Bar */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search conversations, names, ships, departments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              {/* Filter Toggle */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
                >
                  <span>Filters</span>
                  {showFilters ? <HiChevronUp className="h-4 w-4" /> : <HiChevronDown className="h-4 w-4" />}
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <HiX className="h-4 w-4" />
                    <span>Clear filters</span>
                  </button>
                )}
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Ship Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ship</label>
                      <select
                        value={selectedShip}
                        onChange={(e) => setSelectedShip(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      >
                        <option value="">All Ships</option>
                        {uniqueShips.map(ship => (
                          <option key={ship} value={ship}>{ship}</option>
                        ))}
                      </select>
                    </div>

                    {/* Department Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      >
                        <option value="">All Departments</option>
                        {uniqueDepartments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    {/* Role Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      >
                        <option value="">All Roles</option>
                        {uniqueRoles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'unread')}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      >
                        <option value="recent">Most Recent</option>
                        <option value="name">Name (A-Z)</option>
                        <option value="unread">Unread First</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {filteredRooms.length === chatRooms.length
                ? `${chatRooms.length} conversation${chatRooms.length !== 1 ? 's' : ''}`
                : `${filteredRooms.length} of ${chatRooms.length} conversation${chatRooms.length !== 1 ? 's' : ''}`
              }
              {hasActiveFilters && ' (filtered)'}
            </p>
          </div>

          {/* Chat Rooms List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6">
              {filteredRooms.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {hasActiveFilters ? 'No conversations match your filters' : 'No conversations yet'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {hasActiveFilters
                      ? 'Try adjusting your search or filters'
                      : 'Connect with crew members to start chatting'
                    }
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.room_id}
                      onClick={() => handleRoomSelect(room)}
                      className={`flex items-center p-3 sm:p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${(room.unread_count ?? 0) > 0 ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                        }`}
                    >
                      {/* Avatar with unread badge */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={room.other_user_avatar || '/default-avatar.webp'}
                          alt={room.other_user_name}
                          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
                        />
                        {/* Unread count badge */}
                        {(room.unread_count ?? 0) > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center shadow-lg border-2 border-white">
                            {(room.unread_count ?? 0) > 99 ? '99+' : (room.unread_count ?? 0)}
                          </div>
                        )}
                      </div>
                      <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-sm sm:text-base font-medium text-gray-900 truncate ${(room.unread_count ?? 0) > 0 ? 'font-bold' : ''
                            }`}>
                            {room.other_user_name}
                          </h3>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <span className="text-xs text-gray-500">
                              {room.last_message_time ?
                                formatTime(room.last_message_time || '') :
                                formatTime(room.created_at || '')
                              }
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-sm text-gray-600 truncate ${(room.unread_count ?? 0) > 0 ? 'font-semibold' : ''
                            }`}>
                            {room.last_message_content || 'No messages yet'}
                          </p>
                          <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500 flex-shrink-0 ml-2">
                            {room.ship_name && <span className="hidden sm:inline">{room.ship_name}</span>}
                            {room.ship_name && room.department_name && <span className="hidden sm:inline">•</span>}
                            {room.department_name && <span className="truncate">{room.department_name}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
