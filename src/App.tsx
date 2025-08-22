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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
