import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaThLarge, FaClipboardList, FaPlusCircle, FaSignOutAlt, FaCheck, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './OfficerDashboard.css'; // Kita butuh CSS Sidebar dari sini
import './CheckQueue.css';       // CSS Khusus halaman ini
import logo from './Image/logoecopoint.png';

const CheckQueue = () => {
    const navigate = useNavigate();
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 1. USER STATE & FOTO ---
    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem('user')) || { nama: 'Officer', role: 'officer' };
    });

    const photoUrl = user.fotoProfil 
      ? `https://untemptable-untediously-carole.ngrok-free.dev/api/dashboard/uploads/${user.fotoProfil}` 
      : null;

    // FETCH DATA ANTRIAN
    const fetchQueue = async () => {
        try {
            const res = await fetch('https://untemptable-untediously-carole.ngrok-free.dev/api/officers/pending-queue');
            if (res.ok) {
                const data = await res.json();
                setQueue(data);
            }
        } catch (error) {
            console.error("Error fetching queue:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if(storedUser) setUser(storedUser);
        fetchQueue();
    }, []);
    
    const handleVerify = (id, action) => {
        const actionText = action === 'ACCEPTED' ? 'Approve' : 'Reject';
        const actionColor = action === 'ACCEPTED' ? '#4CAF50' : '#d33';

        Swal.fire({
            title: `${actionText} Transaction?`,
            text: action === 'ACCEPTED' ? "Points will be added to user." : "This transaction will be discarded.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: actionColor,
            confirmButtonText: `Yes, ${actionText} it!`
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`https://untemptable-untediously-carole.ngrok-free.dev/api/officers/verify/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            action: action,
                            officerUsername: user.username 
                        })
                    });

                    if (res.ok) {
                        Swal.fire('Done!', `Transaction has been ${actionText.toLowerCase()}d.`, 'success');
                        fetchQueue(); 
                    } else {
                        Swal.fire('Error', 'Failed to process transaction', 'error');
                    }
                } catch (err) {
                    Swal.fire('Error', 'Server connection error', 'error');
                }
            }
        });
    };

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
        <div className="cq-container">
            {/* SIDEBAR (Class dari OfficerDashboard.css) */}
            <aside className="od-sidebar">
                <div className="od-logo">
                    <img src={logo} alt="EcoPoint Logo" />
                    <h2>EcoPoint</h2>
                </div>
                <ul className="od-menu">
                    <li onClick={() => navigate('/officer-dashboard')}><FaThLarge /> Dashboard</li>
                    <li className="active"><FaClipboardList /> Check Queue</li>
                    <li onClick={() => navigate('/officer-deposit')}><FaPlusCircle /> Manual Deposit</li>
                    <li className="od-logout" onClick={handleLogout}><FaSignOutAlt /> Logout</li>
                </ul>
            </aside>

            {/* MAIN CONTENT */}
            <main className="cq-main">
                {/* HEADER (Sama Persis dengan Dashboard) */}
                <header className="ofd-header">
                    <div className="od-welcome">
                        <h3>Verification <span className="highlight-name">Queue</span></h3>
                        <p style={{margin:0, fontSize:'13px', color:'#888'}}>Check thoroughly before processing.</p>
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
                        {/* FOTO PROFIL */}
                        <div className="avatar-circle" style={{overflow:'hidden', background: photoUrl ? 'transparent' : '#1B5E20'}}>
                            {photoUrl ? (
                                <img src={photoUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="profile"/>
                            ) : (
                                user.nama.charAt(0).toUpperCase()
                            )}
                        </div>
                    </div>
                </header>

                <div className="cq-table-wrapper">
                    {loading ? (
                        <div className="cq-empty">Loading data...</div>
                    ) : queue.length === 0 ? (
                        <div className="cq-empty">
                            <FaClipboardList size={40} style={{marginBottom:'10px', opacity:0.3}}/>
                            <p>No pending transactions found.</p>
                        </div>
                    ) : (
                        <table className="cq-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Citizen Name</th>
                                    <th>Waste Type</th>
                                    <th>Weight (Kg)</th>
                                    <th>Est. Points</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {queue.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td><strong>{item.wargaName}</strong></td>
                                        <td><span className="badge-type">{item.type}</span></td>
                                        <td className="badge-weight">{item.weight} kg</td>
                                        <td style={{color:'#FF9800', fontWeight:'bold'}}>+{item.points} pts</td>
                                        <td style={{fontSize:'13px', color:'#777'}}>
                                            {new Date(item.date).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className="cq-action-buttons">
                                                <button 
                                                    className="btn-action btn-approve"
                                                    onClick={() => handleVerify(item.id, 'ACCEPTED')}
                                                    title="Approve"
                                                >
                                                    <FaCheck /> Accept
                                                </button>
                                                
                                                <button 
                                                    className="btn-action btn-reject"
                                                    onClick={() => handleVerify(item.id, 'REJECTED')}
                                                    title="Reject"
                                                >
                                                    <FaTimes /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CheckQueue;