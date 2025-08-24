import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import WelcomeDeveloper from "./pages/WelcomeDeveloper";
import WelcomeCompany from "./pages/WelcomeCompany";
import DeveloperProfile from "./pages/DeveloperProfile";
import CompanyProfile from "./pages/CompanyProfile";
import Developers from "./pages/Developers";
import DeveloperDetail from "./pages/DeveloperDetail";
import ConfirmRegistration from "./pages/ConfirmRegistration";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/confirm" element={<ConfirmRegistration />} />
            <Route path="/confirm-registration" element={<ConfirmRegistration />} />
            <Route path="/auth/confirm" element={<ConfirmRegistration />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route 
              path="/welcome/developer" 
              element={
                <ProtectedRoute requireRole="developer">
                  <WelcomeDeveloper />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/welcome/company" 
              element={
                <ProtectedRoute requireRole="company">
                  <WelcomeCompany />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/developer" 
              element={
                <ProtectedRoute requireRole="developer">
                  <DeveloperProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/company" 
              element={
                <ProtectedRoute requireRole="company">
                  <CompanyProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/developers" 
              element={
                <ProtectedRoute requireRole="company">
                  <Developers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/developers/:id" 
              element={
                <ProtectedRoute requireRole="company">
                  <DeveloperDetail />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
