import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelection.css';

// Import Gambar Background & Logo
// Pastikan path logo sesuai dengan folder Anda
import logo from './Image/logoecopoint.png'; 
const bgImage = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2070&auto=format&fit=crop'; // Atau gunakan URL online jika file lokal belum ada


const RoleSelection = () => {
    const navigate = useNavigate();

    const handleSelectRole = (role) => {
        if (role === 'user') {
            navigate('/login'); 
        } else if (role === 'officer') {
            navigate('/officer-login');
        } else if (role === 'admin') {
            // UPDATE: Arahkan ke Login Admin
            navigate('/admin-login');
        }
    };

    return (
        <div className="role-container" style={{ backgroundImage: `url(${bgImage})` }}>
            
            {/* --- NAVBAR --- */}
            <div className="role-navbar">
                {/* Bagian Kiri: Logo + Teks (Bisa diklik untuk ke Home) */}
                <div className="role-logo-group" onClick={() => navigate('/')}>
                    <img src={logo} alt="EcoPoint Logo" className="role-logo-img" />
                    <h2 className="role-logo-text">EcoPoint</h2>
                </div>

                {/* Bagian Kanan: Tombol Back to Home */}
                <div className="nav-back" onClick={() => navigate('/')}>
                    Back to Home
                </div>
            </div>

            {/* --- KONTEN TENGAH --- */}
            <div className="role-content">
                <h1 className="role-title">Choose Your Role</h1>
                <p className="role-subtitle">Select how you want to contribute to EcoPoint</p>

                <div className="role-grid">
                    {/* CARD 1: USER */}
                    <div className="role-card" onClick={() => handleSelectRole('user')}>
                        <div className="role-icon">🌱</div>
                        <h3>User</h3>
                        <p>Join as a resident to deposit trash and earn points.</p>
                        <button className="btn-select">Join as User</button>
                    </div>

                    {/* CARD 2: OFFICER */}
                    <div className="role-card" onClick={() => handleSelectRole('officer')}>
                        <div className="role-icon">👔</div>
                        <h3>Officer</h3>
                        <p>Join as an officer to manage trash collection.</p>
                        <button className="btn-select">Join as Officer</button>
                    </div>

                    {/* CARD 3: ADMIN */}
                    <div className="role-card" onClick={() => handleSelectRole('admin')}>
                        <div className="role-icon">🛡️</div>
                        <h3>Admin</h3>
                        <p>Manage the entire EcoPoint ecosystem.</p>
                        <button className="btn-select">Join as Admin</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;