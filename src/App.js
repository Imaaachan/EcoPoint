import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Login from './Login';
import Register from './Register';
import FAQ from './FAQ';
import HomePage from './HomePage';
import Profile from './Profile'; 
import DepositTrash from './DepositTrash';
import GiftCatalogue from './GiftCatalogue';
import RedeemMoney from './RedeemMoney';
import RedeemVoucher from './RedeemVoucher';
import TransactionHistory from './TransactionHistory';
import RoleSelection from './RoleSelection';
import AdminLogin from './LoginAdmin';
import AdminDashboard from './AdminDashboard';
import ManageOfficers from './ManageOfficers'; 
import ManageWaste from './ManageWaste';
import ManageRewards from './ManageRewards';
import AdminProfile from './AdminProfile';
import OfficerDashboard from './OfficerDashboard';
import OfficerLogin from './OfficerLogin';
import CheckQueue from './CheckQueue';
import OfficerDeposit from './OfficerDeposit';
import OfficerProfile from './OfficerProfile';

function App() {
  return (
    <Router basename="/EcoPoint">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/home" element={<HomePage />} />
        
        <Route path="/profile" element={<Profile />} />
        <Route path="/deposit" element={<DepositTrash />} />

        <Route path="/gift" element={<GiftCatalogue />} />
        <Route path="/redeem-money" element={<RedeemMoney />} />
        <Route path="/redeem-voucher" element={<RedeemVoucher />} />

        <Route path="/history" element={<TransactionHistory />} />

        <Route path="/role-selection" element={<RoleSelection />} />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/manage-officers" element={<ManageOfficers />} />
        <Route path="/manage-waste" element={<ManageWaste />} />
        <Route path="/manage-rewards" element={<ManageRewards />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/officer-dashboard" element={<OfficerDashboard />} />
        <Route path="/officer-login" element={<OfficerLogin />} />
        <Route path="/check-queue" element={<CheckQueue />} />
        <Route path="/officer-deposit" element={<OfficerDeposit />} />
        <Route path="/officer-profile" element={<OfficerProfile />} />
      </Routes>
    </Router>
  );
}

export default App;