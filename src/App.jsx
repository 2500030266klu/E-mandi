import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import MSPRates from './pages/MSPRates';
import FarmerLogin from './pages/FarmerLogin';
import FarmerRegister from './pages/FarmerRegister';
import FarmerDashboard from './pages/FarmerDashboard';
import TraderLogin from './pages/TraderLogin';
import TraderRegister from './pages/TraderRegister';
import TraderDashboard from './pages/TraderDashboard';
import AdminLogin from './pages/AdminLogin';
import DistrictAdminDashboard from './pages/DistrictAdminDashboard';
import AuctionAdminDashboard from './pages/AuctionAdminDashboard';
import AdminRegister from './pages/AdminRegister';
import ManagementLogin from './pages/ManagementLogin';
import ManagementRegister from './pages/ManagementRegister';
import CentralManagementDashboard from './pages/CentralManagementDashboard';
import StateManagementDashboard from './pages/StateManagementDashboard';
import Help from './pages/Help';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { SystemProvider } from './context/SystemContext';

const ContainerLayout = () => (
  <div className="container mx-auto px-4 py-8 max-w-6xl w-full">
    <Outlet />
  </div>
);

function App() {
  return (
    <SettingsProvider>
      <SystemProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen flex flex-col w-full">
              <Header />
              <main className="flex-grow flex flex-col w-full">
                <Routes>
                  {/* Full-width Home Page */}
                  <Route path="/" element={<Home />} />
                  
                  {/* Contained Pages */}
                  <Route element={<ContainerLayout />}>
                    <Route path="/msp-rates" element={<MSPRates />} />
                    <Route path="/help" element={<Help />} />
                    
                    <Route path="/farmer/login" element={<FarmerLogin />} />
                    <Route path="/farmer/register" element={<FarmerRegister />} />
                    <Route path="/farmer/dashboard" element={<ProtectedRoute><FarmerDashboard /></ProtectedRoute>} />

                    <Route path="/trader/login" element={<TraderLogin />} />
                    <Route path="/trader/register" element={<TraderRegister />} />
                    <Route path="/trader/dashboard" element={<ProtectedRoute><TraderDashboard /></ProtectedRoute>} />
                    
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/register" element={<AdminRegister />} />
                    <Route path="/admin/district-dashboard" element={<ProtectedRoute><DistrictAdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/auction-dashboard" element={<ProtectedRoute><AuctionAdminDashboard /></ProtectedRoute>} />
                    
                    <Route path="/management/login" element={<ManagementLogin />} />
                    <Route path="/management/register" element={<ManagementRegister />} />
                    <Route path="/management/central-dashboard" element={<ProtectedRoute><CentralManagementDashboard /></ProtectedRoute>} />
                    <Route path="/management/state-dashboard" element={<ProtectedRoute><StateManagementDashboard /></ProtectedRoute>} />
                  </Route>
                </Routes>
              </main>
            </div>
          </Router>
        </AuthProvider>
      </SystemProvider>
    </SettingsProvider>
  );
}

export default App;
