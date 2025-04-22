import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/AuthContext";
import { useEffect } from "react";

// Layouts
import AuthLayout from "./components/layouts/AuthLayout";
import AppLayout from "./components/layouts/AppLayout";

// Pages
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import ClientsPage from "./pages/clients";
import ProjectsPage from "./pages/projects";
import InspectionsPage from "./pages/inspections";
import CalendarPage from "./pages/calendar";
import ReportsPage from "./pages/reports";
import SettingsPage from "./pages/settings";
import ProfilePage from "./pages/profile";
import NewInspectionPage from "./pages/inspection/new";
import InspectionDetailPage from "./pages/inspection/[id]";
import NotFound from "./pages/not-found";

// PWA initialization
import { useSWUpdate } from "./pwa/useSWUpdate";
import { SWUpdateBanner } from "./pwa/SWUpdateBanner";

function Router() {
  const [location] = useLocation();
  
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login">
        <AuthLayout>
          <LoginPage />
        </AuthLayout>
      </Route>
      
      {/* Protected routes */}
      <Route path="/">
        <AppLayout>
          <DashboardPage />
        </AppLayout>
      </Route>
      
      <Route path="/clients">
        <AppLayout>
          <ClientsPage />
        </AppLayout>
      </Route>
      
      <Route path="/projects">
        <AppLayout>
          <ProjectsPage />
        </AppLayout>
      </Route>
      
      <Route path="/inspections">
        <AppLayout>
          <InspectionsPage />
        </AppLayout>
      </Route>
      
      <Route path="/calendar">
        <AppLayout>
          <CalendarPage />
        </AppLayout>
      </Route>
      
      <Route path="/reports">
        <AppLayout>
          <ReportsPage />
        </AppLayout>
      </Route>
      
      <Route path="/settings">
        <AppLayout>
          <SettingsPage />
        </AppLayout>
      </Route>
      
      <Route path="/profile">
        <AppLayout>
          <ProfilePage />
        </AppLayout>
      </Route>
      
      <Route path="/inspection/new">
        <AppLayout>
          <NewInspectionPage />
        </AppLayout>
      </Route>
      
      <Route path="/inspection/:id">
        {params => (
          <AppLayout>
            <InspectionDetailPage id={params.id} />
          </AppLayout>
        )}
      </Route>
      
      {/* Fallback 404 route */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  const updateAvailable = useSWUpdate();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
        {updateAvailable && (
          <SWUpdateBanner onReload={() => window.location.reload()} />
        )}
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
