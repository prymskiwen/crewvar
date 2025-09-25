import { Routes, Route } from "react-router-dom";
import { AuthRoutes } from "../features/auth";
import { Onboarding, Home, ExploreShips, MyProfile, Favorites, Privacy, Moderation, PortConnections, ShipAssignment } from "../features/misc";
import { ChatPage } from "../features/chat/routes/ChatPage";
import { TermsOfService } from "../features/misc/routes/TermsOfService";
import { PrivacyPolicy } from "../features/misc/routes/PrivacyPolicy";
import { EmailVerificationPage } from "../features/auth/routes/EmailVerificationPage";
import { VerificationPendingPage } from "../features/auth/routes/VerificationPendingPage";
import Dashboard from "../features/misc/routes/DashboardNew";
import { WhosInPortPage } from "../features/port/routes/WhosInPortPage";
import { TodayOnBoardPage } from "../features/crew/routes/TodayOnBoardPage";
import { CrewMemberProfile } from "../features/crew/routes/CrewMemberProfile";
import { PendingRequestsPage } from "../features/connections/routes/PendingRequestsPage";
import { MyConnectionsPage } from "../features/connections/routes/MyConnectionsPage";
import NotificationSettings from "../features/notifications/pages/NotificationSettings";
import { AllNotificationsPage } from "../features/notifications/pages/AllNotificationsPage";
import { CalendarPage } from "../features/calendar/pages/CalendarPage";
import { AdminDashboard } from "../pages/AdminDashboard";
import { AdminUserDetail } from "../pages/AdminUserDetail";
import SupportPage from "../pages/SupportPage";
import ContactPage from "../pages/ContactPage";
import FAQPage from "../pages/FAQPage";
import AdminSupportPage from "../pages/AdminSupportPage";

export const AppRoutes = () => {
    return (
        <Routes>
            <Route index element={<Home />} />
            <Route path="auth/login" element={<AuthRoutes />} />
            <Route path="auth/signup" element={<AuthRoutes />} />
            <Route path="auth/verify-email" element={<EmailVerificationPage />} />
            <Route path="auth/verification-pending" element={<VerificationPendingPage />} />
            <Route path="explore-ships" element={<ExploreShips />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ship-location" element={<PortConnections />} />
            <Route path="discover" element={<TodayOnBoardPage />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="all-notifications" element={<AllNotificationsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="profile/:userId" element={<CrewMemberProfile />} />
            <Route path="crew/:userId" element={<CrewMemberProfile />} />
            <Route path="my-profile" element={<MyProfile />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="chat/:userId" element={<ChatPage />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="moderation" element={<Moderation />} />
            <Route path="port-connections" element={<PortConnections />} />
            <Route path="ship-assignment" element={<ShipAssignment />} />
            <Route path="whos-in-port" element={<WhosInPortPage />} />
            <Route path="today-onboard" element={<TodayOnBoardPage />} />
            <Route path="connections/pending" element={<PendingRequestsPage />} />
            <Route path="connections/list" element={<MyConnectionsPage />} />
            <Route path="notifications/settings" element={<NotificationSettings />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/users/:userId" element={<AdminUserDetail />} />
            <Route path="admin/support" element={<AdminSupportPage />} />
        </Routes>
    );
};
