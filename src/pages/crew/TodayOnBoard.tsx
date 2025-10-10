import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContextFirebase";
import logo from "../../assets/images/Home/logo.png";
import { getProfilePhotoUrl } from "../../utils/images";
import { DashboardLayout } from "../../layout/DashboardLayout";
import {
  getCrewMembers,
  sendConnectionRequest,
  getDepartments,
  getRolesByDepartment,
  getUserConnections,
  getPendingConnectionRequests,
  createOrGetChatRoom,
} from "../../firebase/firestore";

export const TodayOnBoardPage = () => {
  const { currentUser, userProfile } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const observerRef = useRef<HTMLDivElement>(null);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  // Fetch all roles for role name mapping
  const { data: allRoles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const allRolesData = [];
      for (const dept of departments) {
        try {
          const roles = await getRolesByDepartment(dept.id);
          allRolesData.push(...roles);
        } catch (error) {
          console.error(
            `Error fetching roles for department ${dept.id}:`,
            error
          );
        }
      }
      return allRolesData;
    },
    enabled: departments.length > 0,
  });

  // Fetch user's connections to check if already connected
  const { data: userConnections = [] } = useQuery({
    queryKey: ["userConnections", currentUser?.uid],
    queryFn: () => getUserConnections(currentUser!.uid),
    enabled: !!currentUser?.uid,
  });

  // Fetch pending connection requests
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ["pendingRequests", currentUser?.uid],
    queryFn: () => getPendingConnectionRequests(currentUser!.uid),
    enabled: !!currentUser?.uid,
  });

  // Helper functions to get names from IDs
  const getRoleName = (roleId: string) => {
    if (!roleId) return "Crew Member";
    const role = allRoles.find((r) => r.id === roleId);
    return role ? role.name : "Crew Member";
  };

  const getDepartmentName = (departmentId: string) => {
    if (!departmentId) return "No Department";
    const department = departments.find((d) => d.id === departmentId);
    return department ? department.name : departmentId;
  };

  const getShipName = (shipId: string) => {
    if (!shipId) return "No Ship";
    return userProfile?.currentShipId === shipId ? "Your Ship" : shipId;
  };

  // Check connection status for a member
  const getConnectionStatus = (memberId: string) => {
    // Check if already connected
    const isConnected = userConnections.some(
      (connection) =>
        connection.connectedUserId === memberId ||
        connection.userId === memberId
    );

    if (isConnected) {
      return "connected";
    }

    // Check if there's a pending request
    const hasPendingRequest = pendingRequests.some(
      (request) => request.receiverId === memberId
    );

    if (hasPendingRequest) {
      return "pending";
    }

    return "none";
  };

  // Fetch crew members from the same ship with infinite scroll
  const {
    data: crewData,
    isLoading: crewLoading,
    error: crewError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["crewMembersTodayOnBoard", userProfile?.currentShipId],
    queryFn: ({ pageParam = 0 }) =>
      getCrewMembers({
        shipId: userProfile?.currentShipId,
        currentUserId: currentUser?.uid,
        page: pageParam,
        limit: 20,
      }),
    enabled: !!userProfile?.currentShipId && !!currentUser?.uid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextPage : undefined,
  });

  // Flatten all crew data from all pages
  const allCrew = useMemo(() => {
    if (!crewData?.pages) return [];
    return crewData.pages.flatMap((page: any) => page.crew || []);
  }, [crewData]);

  // Filter crew members based on search query
  const filteredCrew = useMemo(() => {
    if (!allCrew) return [];

    return allCrew.filter((member: any) => {
      const matchesSearch =
        !searchQuery ||
        member.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getRoleName(member.roleId)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        getDepartmentName(member.departmentId)
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [allCrew, searchQuery, allRoles, departments]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Connection request mutation
  const sendConnectionRequestMutation = useMutation(
    async (params: {
      requesterId: string;
      receiverId: string;
      message?: string;
    }) => {
      return await sendConnectionRequest(
        params.requesterId,
        params.receiverId,
        params.message || ""
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
        queryClient.invalidateQueries({ queryKey: ["userConnections"] });
        queryClient.invalidateQueries({
          queryKey: ["receivedConnectionRequests"],
        });
      },
      onError: (error: any) => {
        console.error("Failed to send connection request:", error);
        toast.error(error.message || "Failed to send connection request");
      },
    }
  );

  // Chat room creation mutation
  const createChatRoomMutation = useMutation(
    async (params: { userId1: string; userId2: string }) => {
      return await createOrGetChatRoom(params.userId1, params.userId2);
    },
    {
      onSuccess: (chatRoom: any) => {
        navigate(`/chat/room/${chatRoom.id}`);
      },
      onError: (error: any) => {
        console.error("Failed to create chat room:", error);
        toast.error("Failed to start chat. Please try again.");
      },
    }
  );

  const handleConnect = async (memberId: string, _memberName: string) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [memberId]: true }));

            await sendConnectionRequestMutation.mutateAsync({
        requesterId: currentUser!.uid,
                receiverId: memberId,
        message:
          "Hi! I'd love to connect with you and be friends. Please accept my connection request! 😊",
            });

      toast.success("Connection request sent successfully!");
        } catch (error: any) {
      console.error("Error sending connection request:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to send connection request. Please try again."
      );
        } finally {
      setLoadingStates((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  const handleStartChat = async (memberId: string, _memberName: string) => {
    try {
      setLoadingStates((prev) => ({ ...prev, [memberId]: true }));
      await createChatRoomMutation.mutateAsync({
        userId1: currentUser!.uid,
        userId2: memberId,
      });
        } catch (error: any) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start chat. Please try again.");
        } finally {
      setLoadingStates((prev) => ({ ...prev, [memberId]: false }));
        }
    };

  const handleViewProfile = (memberId: string) => {
    navigate(`/crew/${memberId}`);
  };

    if (crewLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-teal-600">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-medium">Loading crew members...</span>
          </div>
        </div>
      </DashboardLayout>
    );
    }

    if (crewError) {
        return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
                            </svg>
                        </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Crew
            </h3>
            <p className="text-gray-600 mb-4">
              Unable to load crew members from your ship.
            </p>
                        <button
                            onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#069B93] text-white rounded-lg hover:bg-[#058a7a] transition-colors"
                        >
              Try Again
                        </button>
                    </div>
                </div>
      </DashboardLayout>
    );
  }

        return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
            <div className="bg-teal-600 text-white p-3 sm:p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                onClick={() => navigate(-1)}
                            className="p-2 hover:bg-teal-700 rounded-lg transition-colors"
                        >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                            </svg>
                        </button>
                        <div>
                <h1 className="text-base sm:text-lg font-bold">
                  Today on Board
                </h1>
                            <p className="text-xs text-teal-100">
                  Crew members on your ship
                            </p>
                        </div>
                    </div>
            <Link
              to="/dashboard"
              className="flex items-center hover:bg-teal-700 rounded-lg px-2 sm:px-3 py-2 transition-colors"
            >
                        <img
                            src={logo}
                            alt="Crewvar Logo"
                            className="h-5 sm:h-6 w-auto brightness-0 invert"
                style={{ filter: "brightness(0) invert(1)" }}
                        />
                    </Link>
                </div>
            </div>

        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Search Section */}
          <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold text-teal-600 mb-3">
              Search Crew Members
            </h2>

            <div className="space-y-3">
              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search by Name, Role, or Department
                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search crew members..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-teal-600">
                  Crew Members ({filteredCrew.length})
                </h2>
              </div>

              {filteredCrew.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                                            </svg>
                                </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchQuery ? "No Results Found" : "No Crew Members Found"}
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery
                      ? "Try adjusting your search terms."
                      : "No other crew members are currently on your ship."}
                  </p>
                            </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {filteredCrew.map((member: any) => (
                    <div
                      key={member.id}
                      className="bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        {/* Profile Photo */}
                        <div className="flex-shrink-0 relative">
                                                        <img
                                                            src={getProfilePhotoUrl(member.profilePhoto)}
                                                            alt={member.displayName}
                                                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                                                        />
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              member.isOnline ? "bg-green-500" : "bg-red-500"
                            }`}
                          ></div>
                                                    </div>

                        {/* Member Info */}
                                                    <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                                                            {member.displayName}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {getRoleName(member.roleId) || "Crew Member"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {getDepartmentName(member.departmentId)} •{" "}
                            {getShipName(member.currentShipId)}
                          </p>
                                                </div>

                                                {/* Action Buttons */}
                        <div className="flex space-x-2 sm:flex-shrink-0">
                          {(() => {
                            const status = getConnectionStatus(member.id);

                            if (status === "connected") {
                              return (
                                <div className="flex space-x-2">
                                                    <button
                                    onClick={() =>
                                      handleStartChat(
                                        member.id,
                                        member.displayName
                                      )
                                    }
                                                        disabled={loadingStates[member.id]}
                                    className="flex-1 sm:flex-none px-3 py-2 bg-blue-500 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                    {loadingStates[member.id]
                                      ? "Starting..."
                                      : "Start Chat"}
                                                    </button>
                                                    <button
                                    disabled
                                    className="flex-1 sm:flex-none px-3 py-2 bg-gray-400 text-white text-xs sm:text-sm font-medium rounded-lg cursor-not-allowed transition-colors"
                                  >
                                    Connected
                                                    </button>
                                </div>
                              );
                            } else if (status === "pending") {
                              return (
                                    <button
                                  disabled
                                  className="flex-1 sm:flex-none px-3 py-2 bg-yellow-500 text-white text-xs sm:text-sm font-medium rounded-lg cursor-not-allowed transition-colors"
                                    >
                                  Pending
                                    </button>
                              );
                            } else {
                              return (
                                <button
                                  onClick={() =>
                                    handleConnect(member.id, member.displayName)
                                  }
                                  disabled={loadingStates[member.id]}
                                  className="flex-1 sm:flex-none px-3 py-2 bg-[#069B93] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#058a7a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {loadingStates[member.id]
                                    ? "Connecting..."
                                    : "Quick Connect"}
                                </button>
                              );
                            }
                          })()}
                          <button
                            onClick={() => handleViewProfile(member.id)}
                            className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 text-gray-700 text-xs sm:text-sm rounded-lg hover:border-[#069B93] hover:text-[#069B93] hover:bg-[#069B93]/5 transition-colors font-medium"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Infinite scroll loading indicator */}
                  {isFetchingNextPage && (
                    <div className="flex justify-center py-4">
                      <div className="flex items-center space-x-2 text-teal-600">
                        <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium">
                          Loading more crew members...
                        </span>
                      </div>
                        </div>
                    )}

                  {/* Infinite scroll trigger */}
                  <div ref={observerRef} className="h-4"></div>
                </div>
              )}
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
    );
};
