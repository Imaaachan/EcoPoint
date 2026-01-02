import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaThLarge, FaClipboardList, FaPlusCircle, 
    FaSignOutAlt, FaClock, FaCheckCircle, FaWeightHanging 
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import './OfficerDashboard.css';
import logo from './Image/logoecopoint.png'; 

const OfficerDashboard = () => {
    const navigate = useNavigate();
    
    // --- 1. STATE USER & FOTO (Sama kayak Admin) ---
    // Gunakan State agar bisa refresh jika ada perubahan
    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem('user')) || { nama: 'Officer', role: 'officer' };
    });

    // Buat URL Foto dari Backend
    const photoUrl = user.fotoProfil 
      ? `https://untemptable-untediously-carole.ngrok-free.dev/api/dashboard/uploads/${user.fotoProfil}` 
      : null;

    // State untuk Statistik
    const [stats, setStats] = useState({
        pending: 0,
        verified: 0,
        totalWeight: 0
    });

    useEffect(() => {
        // Refresh data user dari storage saat load
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if(storedUser) setUser(storedUser);

        // Fetch Stats
        fetch('https://untemptable-untediously-carole.ngrok-free.dev/api/officers/dashboard-stats')
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Gagal ambil data");
            })
            .then(data => {
                setStats({
                    pending: data.pending || 0,
                    verified: data.verified || 0,
                    totalWeight: data.totalWeight || 0
                });
            })
            .catch(err => console.log("Belum ada data stats:", err));
    }, []);

    const handleLogout = () => {
          Swal.fire({
              title: 'Logout?',
              text: "End your shift?",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#d33',
              cancelButtonColor: '#3085d6',
              confirmButtonText: 'Yes, Logout'
          }).then((result) => {
             if (result.isConfirmed) {
                localStorage.removeItem('user'); 
                navigate('/');
                }
          });
    };

    return (
        <div className="od-container">
            {/* SIDEBAR */}
            <aside className="od-sidebar">
                <div className="od-logo">
                    <img src={logo} alt="EcoPoint Logo" />
                    <h2>EcoPoint</h2>
                </div>
                
                <ul className="od-menu">
                    <li className="active"><FaThLarge /> Dashboard</li>
                    <li onClick={() => navigate('/check-queue')}><FaClipboardList /> Check Queue</li>
                    <li onClick={() => navigate('/officer-deposit')}><FaPlusCircle /> Manual Deposit</li>
                    
                    <li className="od-logout" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </li>
                </ul>
            </aside>

            {/* MAIN CONTENT */}
            <main className="od-main">
                {/* HEADER */}
                <header className="ofd-header">
                    <div className="od-welcome">
                        <h3>Hello, Officer <span className="highlight-name">{user.nama}</span> 👋</h3>
                        <p style={{margin:0, fontSize:'13px', color:'#888'}}>Have a productive day!</p>
                    </div>
                    
                    <div 
                        className="od-profile-pill" 
                        onClick={() => navigate('/officer-profile')}
                        title="View Profile"
                    >
                        <div style={{textAlign:'right', marginRight:'10px'}}>
                            <div style={{fontSize:'14px', fontWeight:'bold'}}>{user.nama}</div>
                            <div style={{fontSize:'11px', color:'#666'}}>Field Officer</div>
                        </div>
                        
                        {/* LOGIKA FOTO PROFIL */}
                        <div className="avatar-circle" style={{overflow:'hidden', background: photoUrl ? 'transparent' : '#1B5E20'}}>
                            {photoUrl ? (
                                <img src={photoUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="profile"/>
                            ) : (
                                user.nama.charAt(0).toUpperCase()
                            )}
                        </div>
                    </div>
                </header>

                {/* STATS CARDS */}
                <div className="od-stats-grid">
                    {/* Card 1: Pending */}
                    <div className="od-card card-pending">
                        <h4>Pending Tasks</h4>
                        <h2>{stats.pending}</h2>
                        <FaClock className="card-icon" color="#FF9800"/>
                    </div>

                    {/* Card 2: Verified */}
                    <div className="od-card card-verified">
                        <h4>Total Verified</h4>
                        <h2>{stats.verified}</h2>
                        <FaCheckCircle className="card-icon" color="#4CAF50"/>
                    </div>

                    {/* Card 3: Weight */}
                    <div className="od-card card-weight">
                        <h4>Total Weight (Kg)</h4>
                        <h2>{stats.totalWeight}</h2>
                        <FaWeightHanging className="card-icon" color="#2196F3"/>
                    </div>
                </div>

                {/* ANNOUNCEMENT */}
                <div className="od-announcement">
                    <h4>📢 Officer Announcement</h4>
                    <p style={{color:'#555', fontSize:'14px', lineHeight:'1.6'}}>
                        <strong>Reminder:</strong> Please verify the trash type carefully. Organic waste must not contain plastic bags.
                        <br />
                        Keep up the good work and stay safe!
                    </p>
                </div>
            </main>
        </div>
    );
};

export default OfficerDashboard;