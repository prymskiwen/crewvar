import { Routes, Route } from "react-router-dom";
import { AuthRoutes } from "../features/auth";
import { CartRoutes } from "../features/cart";
import { ProductRoutes } from "../features/products";
import { ProtectedRoute } from "./ProtectedRoute";
import { Onboarding, Home, Dashboard, ExploreShips, UserProfile, MyProfile, Chat, Favorites, Privacy, Moderation, PortConnections } from "../features/misc";
import { CheckoutRoutes } from "../features/checkout";

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/">
                <Route index element={<Home />} />
                <Route path="auth/*" element={<AuthRoutes />} />
                <Route path="cart/*" element={<CartRoutes />} />
                <Route path="explore-ships" element={<ExploreShips />} />
                <Route path="products/*" element={<ProductRoutes />} />
                <Route path="onboarding" element={<Onboarding />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profile/:userId" element={<UserProfile />} />
                <Route path="my-profile" element={<MyProfile />} />
                <Route path="chat" element={<Chat />} />
                <Route path="chat/:userId" element={<Chat />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="moderation" element={<Moderation />} />
                <Route path="port-connections" element={<PortConnections />} />

            </Route>

            <Route element={<ProtectedRoute />}>
                <Route path="/checkout/*" element={<CheckoutRoutes />} />
            </Route>
        </Routes>
    );
};
