import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider.js";
import { Button } from "@/components/ui/button.js";
import { Dashboard } from "@/components/dashboard/dashboard.js";
import { ProfilePage } from "@/components/profile/profile.js";
import { ThemeToggle } from "@/components/ui/theme-toggle.js";
import { LoginPage } from "@/components/auth/login.js";
import { RegisterPage } from "@/components/auth/register.js";
import { AuthProvider, RequireAuth, useAuth } from "./context/auth-context.js";

function HomePage() {
  const { user, signOut } = useAuth();
  
  return (
    <div className="flex min-h-svh flex-col items-center justify-center space-y-8">
      <h1 className="text-4xl font-bold">Welcome to Shop2Give</h1>
      <p className="text-xl text-muted-foreground">A platform that integrates campaign donations with product purchases.</p>
      
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
        {user ? (
          <>
            <Button variant="outline" asChild>
              <Link to="/profile">View Profile</Link>
            </Button>
            <Button variant="secondary" onClick={() => signOut()}>
              Sign Out
            </Button>
          </>
        ) : (
          <Button variant="outline" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        )}
      </div>
      
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="shop2give-theme">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/profile" 
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              } 
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App