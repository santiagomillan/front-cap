import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateTransaction from "./pages/CreateTransaction";
import TransactionList from "./pages/TransactionList";
import TransactionDetail from "./pages/TransactionDetail";
import PendingApprovals from "./pages/PendingApprovals";
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
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Protected Routes - Both Roles */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionList />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/transactions/:id"
              element={
                <ProtectedRoute>
                  <TransactionDetail />
                </ProtectedRoute>
              }
            />
            
            {/* Operator Only Routes */}
            <Route
              path="/transactions/create"
              element={
                <ProtectedRoute allowedRoles={['OPERATOR']}>
                  <CreateTransaction />
                </ProtectedRoute>
              }
            />
            
            {/* Approver Only Routes */}
            <Route
              path="/approvals"
              element={
                <ProtectedRoute allowedRoles={['APPROVER']}>
                  <PendingApprovals />
                </ProtectedRoute>
              }
            />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
