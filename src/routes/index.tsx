import { Routes, Route } from "react-router-dom";
import { AuthRoutes, EmailVerification, VerificationPending } from "../pages/auth";
import { Onboarding, Home, ExploreShips, MyProfile, Favorites, Privacy, Moderation, PortConnections, ShipAssignment, Chat, Dashboard, TermsOfService, PrivacyPolicy, Support, FAQ, AdminDashboard, AdminUserDetail } from "../pages";
import { ChatRoom } from "../pages/chat";
import { WhosInPort } from "../pages/port";
import { TodayOnBoard, CrewMemberProfile } from "../pages/crew";
import { PendingRequests, MyConnections } from "../pages/connections";
import { NotificationSettings, AllNotifications } from "../pages/notifications";
import { Calendar } from "../pages/calendar";

export const AppRoutes = () => {
    return (
        <Routes>
            <Route index element={<Home />} />
            <Route path="auth/login" element={<AuthRoutes />} />
            <Route path="auth/signup" element={<AuthRoutes />} />
            <Route path="auth/verify-email" element={<EmailVerification />} />
            <Route path="auth/verification-pending" element={<VerificationPending />} />
            <Route path="explore-ships" element={<ExploreShips />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ship-location" element={<PortConnections />} />
            <Route path="discover" element={<TodayOnBoard />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="all-notifications" element={<AllNotifications />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="profile/:userId" element={<CrewMemberProfile />} />
            <Route path="crew/:userId" element={<CrewMemberProfile />} />
            <Route path="my-profile" element={<MyProfile />} />
            <Route path="chat" element={<Chat />} />
            <Route path="chat/:userId" element={<Chat />} />
            <Route path="chat/room/:roomId" element={<ChatRoom />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="support" element={<Support />} />
            <Route path="moderation" element={<Moderation />} />
            <Route path="port-connections" element={<PortConnections />} />
            <Route path="ship-assignment" element={<ShipAssignment />} />
            <Route path="whos-in-port" element={<WhosInPort />} />
            <Route path="today-onboard" element={<TodayOnBoard />} />
            <Route path="connections/pending" element={<PendingRequests />} />
            <Route path="connections/list" element={<MyConnections />} />
            <Route path="notifications/settings" element={<NotificationSettings />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/users/:userId" element={<AdminUserDetail />} />
        </Routes>
    );
};
