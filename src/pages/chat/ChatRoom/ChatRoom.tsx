import React, { useState, useEffect, useRef, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContextFirebase";
import {
  sendMessage,
  getMessages,
  markMessagesAsRead,
  getChatRooms,
  getRoles,
  isUserInChatPage,
} from "../../../firebase/firestore";
import { EmojiPicker } from "../../../components/ui/EmojiPicker";
import { ReportUserModal } from "./ReportUserModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatTimeAgo, getRoleName } from "../../../utils/data";
import { defaultAvatar } from "../../../utils/images";
import { DashboardLayout } from "../../../layout/DashboardLayout";
import { LoadingPage } from "../../../components/ui";
import { useRealtimeFeatures } from "../../../hooks/useRealtimeFeatures";

export const ChatRoom = memo(() => {
  const { roomId } = useParams<{ roomId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Real-time features
  const {
    isTyping,
    handleStartTyping,
    handleStopTyping,
    sendNotification,
    getTypingText,
  } = useRealtimeFeatures(roomId);

  // Fetch chat room data to get opponent's information
  const { data: chatRooms = [], isLoading: isLoadingRooms } = useQuery({
    queryKey: ["chatRooms", currentUser?.uid],
    queryFn: () => getChatRooms(currentUser?.uid || ""),
    enabled: !!currentUser?.uid,
  });

  const chatRoom = chatRooms.find((room) => room.id === roomId);

  // Fetch ships, departments, and roles for name resolution
  // const { data: allShips = [] } = useQuery({
  //     queryKey: ['ships'],
  //     queryFn: getShips
  // });

  // const { data: allDepartments = [] } = useQuery({
  //     queryKey: ['departments'],
  //     queryFn: getDepartments
  // });

  const { data: allRoles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

  // Check if user is near bottom of messages
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
  };

  // Handle scroll events
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const nearBottom = isNearBottom();
    setShouldAutoScroll(nearBottom);
  };

  // Fetch messages using React Query - using roomId directly
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: () => getMessages(roomId!),
    enabled: !!roomId,
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
  });

  // Mark messages as read when component mounts or room changes
  useEffect(() => {
    if (roomId && currentUser) {
      console.log(
        "🔍 ChatRoom: Marking messages as read for room:",
        roomId,
        "user:",
        currentUser.uid
      );
      markMessagesAsRead(roomId, currentUser.uid).then((hasUpdates) => {
        console.log("🔍 ChatRoom: markMessagesAsRead result:", hasUpdates);
        // Only invalidate the unread message count query if messages were actually marked as read
        if (hasUpdates) {
          queryClient.invalidateQueries({
            queryKey: ["unreadMessageCount", currentUser.uid],
          });
          console.log("🔍 ChatRoom: Invalidated unread message count query");
        }
      });
    }
    // Reset auto-scroll state when room changes
    setShouldAutoScroll(true);
    setLastMessageCount(0);
    setLastMessageId(null);
  }, [roomId, currentUser, queryClient]);

  // Auto-scroll to bottom only when new messages arrive (not on initial load or refetch)
  useEffect(() => {
    if (messages.length === 0) {
      setLastMessageCount(0);
      setLastMessageId(null);
      return;
    }

    const currentMessageCount = messages.length;
    const currentLastMessageId = messages[messages.length - 1]?.id;

    // Only auto-scroll if:
    // 1. User is near bottom
    // 2. Message count increased (new message added)
    // 3. OR last message ID changed (new message added)
    const hasNewMessage =
      currentMessageCount > lastMessageCount ||
      (currentLastMessageId && currentLastMessageId !== lastMessageId);

    if (hasNewMessage && shouldAutoScroll) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }

    // Update tracking variables
    setLastMessageCount(currentMessageCount);
    setLastMessageId(currentLastMessageId);
  }, [messages, shouldAutoScroll, lastMessageCount, lastMessageId]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ message }: { message: string }) =>
      sendMessage(roomId!, currentUser!.uid, message),
    onSuccess: async () => {
      setMessageInput("");
      // Force auto-scroll when user sends a message
      setShouldAutoScroll(true);
      // Reset tracking to ensure auto-scroll triggers
      setLastMessageCount(0);
      setLastMessageId(null);

      // Send live notification to other user only if they're not currently in the room
      if (chatRoom?.otherUserId) {
        try {
          // Check if the other user is currently on any chat page
          const isOtherUserInChatPage = await isUserInChatPage(
            chatRoom.otherUserId
          );

          if (!isOtherUserInChatPage) {
            // Only send notification if the other user is not currently on any chat page
            await sendNotification(
              chatRoom.otherUserId,
              "message",
              "New Message",
              `You have a new message from ${
                currentUser?.displayName || "Unknown User"
              }`,
              roomId
            );
          }
        } catch (error) {
          console.error("Error sending live notification:", error);
        }
      }

      // Invalidate messages query to refetch
      queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
      // Invalidate chat rooms query to update last message
      queryClient.invalidateQueries({
        queryKey: ["chatRooms", currentUser?.uid],
      });
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    },
  });

  // Show loading while fetching chat rooms or messages
  if (isLoadingRooms || messagesLoading) {
    return (
      <DashboardLayout>
        <LoadingPage message="Loading chat room..." backgroundColor="#f9fafb" />
      </DashboardLayout>
    );
  }

  // Show error if chat room not found
  if (!chatRoom) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-120px)] -m-3 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Chat Room Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The chat room you're looking for doesn't exist.
            </p>
            <button
              onClick={() => navigate("/chat")}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Back to Chat
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Handle sending messages
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !messageInput.trim() ||
      !currentUser ||
      !roomId ||
      sendMessageMutation.isLoading
    )
      return;

    const messageContent = messageInput.trim();

    // Stop typing indicator
    if (isTyping) {
      handleStopTyping();
    }

    sendMessageMutation.mutate({ message: messageContent });
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    // Start typing if user starts typing
    if (e.target.value.length > 0 && !isTyping) {
      handleStartTyping();
    }

    // Stop typing if input is empty
    if (e.target.value.length === 0 && isTyping) {
      handleStopTyping();
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] -m-3">
        <div className="flex flex-col h-full bg-white overflow-hidden rounded-lg shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gray-50 min-w-0">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <button
                onClick={() => navigate("/chat")}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors lg:hidden flex-shrink-0"
                title="Back to messages"
              >
                <svg
                  className="w-5 h-5"
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
              <img
                src={chatRoom.otherUserProfile?.profilePhoto || defaultAvatar}
                alt={chatRoom.otherUserProfile?.displayName || "User"}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                  {chatRoom.otherUserProfile?.displayName || "Unknown User"}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-500">
                  {chatRoom.otherUserProfile?.roleId && (
                    <span className="truncate">
                      {getRoleName(chatRoom.otherUserProfile.roleId, allRoles)}
                    </span>
                  )}
                  {/* Online status indicator */}
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        chatRoom.otherUserProfile.isOnline
                          ? "bg-green-500"
                          : "bg-red-400"
                      }`}
                    ></div>
                    <span className="text-xs">
                      {chatRoom.otherUserProfile.isOnline
                        ? "Online"
                        : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowReportModal(true)}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                title="Report User"
              >
                <svg
                  className="w-5 h-5"
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
              </button>
              <button
                onClick={() => navigate("/chat")}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-w-0 min-h-0"
          >
            {messagesLoading ? (
              <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <div className="text-gray-500">Loading messages...</div>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="text-center">
                  <div className="text-gray-500">
                    No messages yet. Start the conversation!
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === currentUser?.uid
                      ? "justify-end"
                      : "justify-start"
                  } min-w-0`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg break-words ${
                      message.senderId === currentUser?.uid
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="text-sm break-words chat-message">
                      {message.message}
                    </p>
                    <div
                      className={`flex items-center justify-between mt-1 ${
                        message.senderId === currentUser?.uid
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      <p className="text-xs">
                        {formatTimeAgo(message.createdAt)}
                      </p>
                      {/* Read receipt for sent messages */}
                      {message.senderId === currentUser?.uid && (
                        <div className="flex items-center ml-2">
                          {message.isRead ? (
                            <div className="flex items-center">
                              <svg
                                className="w-3 h-3 text-blue-200"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <svg
                                className="w-3 h-3 text-blue-200 -ml-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <svg
                                className="w-3 h-3 text-blue-200"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Typing Indicator */}
          {getTypingText() && (
            <div className="px-3 sm:px-4 py-2 bg-gray-50 border-t">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{getTypingText()}</span>
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="border-t p-3 sm:p-4 min-w-0 flex-shrink-0 bg-white">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center space-x-2 min-w-0"
            >
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>

              <input
                type="text"
                value={messageInput}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                disabled={sendMessageMutation.isLoading}
              />

              <button
                type="submit"
                disabled={!messageInput.trim() || sendMessageMutation.isLoading}
                className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base flex-shrink-0"
              >
                {sendMessageMutation.isLoading ? "Sending..." : "Send"}
              </button>
            </form>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-16 left-2 sm:left-4 right-2 sm:right-4 max-w-sm">
                <EmojiPicker
                  onEmojiSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </div>

          {/* Report Modal */}
          {showReportModal && (
            <ReportUserModal
              isOpen={showReportModal}
              reportedUserId={chatRoom.otherUserId}
              reportedUserName={
                chatRoom.otherUserProfile?.displayName || "Unknown User"
              }
              onClose={() => setShowReportModal(false)}
              onReport={(data) => {
                console.log("Report submitted:", data);
                setShowReportModal(false);
              }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
});

ChatRoom.displayName = "ChatRoom";
