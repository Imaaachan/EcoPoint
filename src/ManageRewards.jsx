import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUserTie, FaRecycle, FaGift, FaSignOutAlt, FaBell, FaTicketAlt, FaMoneyBillWave, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './AdminLayout.css';
import './ManageRewards.css';
import logo from './Image/logoecopoint.png'; 

const ManageRewards = () => {
    const navigate = useNavigate();

    // --- PERBAIKAN 1: USER STATE & FOTO ---
    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem('user')) || { nama: 'Super Admin', role: 'admin' };
    });

    // URL Foto Profil
    const photoUrl = user.fotoProfil 
        ? `http://localhost:9090/api/dashboard/uploads/${user.fotoProfil}` 
        : null;

    const [vouchers, setVouchers] = useState([]);
    const [cashList, setCashList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', points: '', type: 'VOUCHER', code: '', description: '' });

    const fetchData = () => {
        fetch('http://localhost:9090/api/rewards')
            .then(res => res.json())
            .then(data => {
                setVouchers(data.filter(i => i.type === 'VOUCHER'));
                setCashList(data.filter(i => i.type === 'CASH'));
            })
            .catch(console.error);
    };

    useEffect(() => { 
        // Refresh User Data
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) setUser(storedUser);

        fetchData(); 
    }, []);

    const handleSave = () => {
      const payload = {
         ...formData,
         points: parseInt(formData.points) || 0 
      };

      const url = formData.id ? `http://localhost:9090/api/rewards/${formData.id}` : 'http://localhost:9090/api/rewards';
      const method = formData.id ? 'PUT' : 'POST';

      fetch(url, {
         method: method,
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload)
      }).then(res => {
         if (res.ok) {
               fetchData();
               setShowModal(false);
               Swal.fire('Success', 'Reward saved to database!', 'success');
         } else {
               Swal.fire('Error', 'Server rejected the data. Check backend logs.', 'error');
         }
      }).catch(err => {
         console.error("Fetch error:", err);
         Swal.fire('Error', 'Connection failed', 'error');
      });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This reward will be permanently deleted!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`http://localhost:9090/api/rewards/${id}`, { method: 'DELETE' })
                    .then(res => {
                        if (res.ok) {
                            Swal.fire('Deleted!', 'Reward has been deleted.', 'success');
                            fetchData();
                        }
                    })
                    .catch(err => Swal.fire('Error', 'Failed to delete data', 'error'));
            }
        });
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Logout?',
            text: "Are you sure you want to logout?",
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
        <div className="mr-container">
            <aside className="sidebar">
                <div className="sidebar-logo"><span>
                    <img src={logo} alt="EcoPoint" />
                    </span><h2>EcoPoint</h2></div>
                <ul className="sidebar-menu">
                    <li onClick={() => navigate('/admin-dashboard')}><FaHome className="icon" /> Dashboard</li>
                    <li onClick={() => navigate('/manage-officers')}><FaUserTie className="icon" /> Officers</li>
                    <li onClick={() => navigate('/manage-waste')}><FaRecycle className="icon" /> Waste Data</li>
                    <li className="active"><FaGift className="icon" /> Rewards</li>
                    <li className="menu-logout" onClick={handleLogout}><FaSignOutAlt className="icon" /> Logout</li>
                </ul>
            </aside>

            <main className="mr-content">
                
                {/* --- PERBAIKAN 2: HEADER DENGAN AVATAR BARU --- */}
                <header className="admin-header">
                  <div className="header-left"><h1>Manage <span className="highlight-name">Rewards</span></h1></div>
                  <div className="header-right">
                     <div className="profile-info" onClick={() => navigate('/admin-profile')}>
                        <div className="text-info">
                            <span className="name">{user.nama}</span>
                            <span className="role">{user.role}</span> 
                        </div>
                        {/* Logika Avatar Baru */}
                        <div className="avatar" style={{overflow:'hidden', background: photoUrl ? 'transparent' : '#333', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            {photoUrl ? (
                                <img src={photoUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="adm"/> 
                            ) : (
                                <span style={{color:'white', fontSize:'18px'}}>
                                    {user.nama ? user.nama.charAt(0).toUpperCase() : 'A'}
                                </span>
                            )}
                        </div>
                     </div>
                  </div>
                </header>

                <p style={{color: '#888', fontSize: '14px'}}>Configure exchange rates for Vouchers and Cash withdrawal options.</p>

                <div className="mr-grid">
                    {/* VOUCHER CONFIG */}
                    <div className="mr-card voucher">
                        <div className="mr-card-header">
                            <h3><FaTicketAlt color="#FFC107"/> Voucher Config</h3>
                            <button className="btn-small-add" onClick={() => { setFormData({type:'VOUCHER', name:'', points:'', code:''}); setShowModal(true); }}>+ Add New Type</button>
                        </div>
                        {vouchers.map(v => (
                            <div className="mr-item" key={v.id}>
                                <div className="mr-item-info">
                                    <h4>{v.name}</h4>
                                    <span className="mr-item-sub">Prefix Code: <span className="mr-code-badge">{v.code}</span></span>
                                </div>
                                <div style={{display:'flex', alignItems:'center', gap: '10px'}}>
                                    <span className="mr-points-badge">{v.points.toLocaleString()} Pts</span>
                                    <span className="btn-edit-reward" onClick={() => { setFormData(v); setShowModal(true); }}>Edit</span>
                                    <FaTrash className="btn-delete-icon" onClick={() => handleDelete(v.id)} style={{color: '#ff4d4d', cursor: 'pointer'}} title="Delete" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CASH CONFIG */}
                    <div className="mr-card cash">
                        <div className="mr-card-header">
                            <h3><FaMoneyBillWave color="#4CAF50"/> Cash Config</h3>
                            <button className="btn-small-add" onClick={() => { setFormData({type:'CASH', name:'', points:'', description:''}); setShowModal(true); }}>+ Add Denomination</button>
                        </div>
                        {cashList.map(c => (
                            <div className="mr-item" key={c.id}>
                                <div className="mr-item-info">
                                    <h4>{c.name}</h4>
                                    <span className="mr-item-sub">{c.description || 'Bank Transfer / E-Wallet'}</span>
                                </div>
                                <div style={{display:'flex', alignItems:'center', gap: '10px'}}>
                                    <span className="mr-points-badge">{c.points.toLocaleString()} Pts</span>
                                    <span className="btn-edit-reward" onClick={() => { setFormData(c); setShowModal(true); }}>Edit</span>
                                    <FaTrash className="btn-delete-icon" onClick={() => handleDelete(c.id)} style={{color: '#ff4d4d', cursor: 'pointer'}} title="Delete" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* MODAL ADD/EDIT */}
            {showModal && (
                <div className="mr-modal-overlay">
                    <div className="mr-modal-box">
                        <div className="mo-modal-header">
                            <h3>{formData.id ? 'Edit Reward' : 'Add Reward'}</h3>
                            <FaTimes onClick={() => setShowModal(false)} style={{cursor:'pointer'}}/>
                        </div>
                        <div className="mo-input-group">
                            <label>Reward Name</label>
                            <input className="mo-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Electricity Token 20k"/>
                        </div>
                        <div className="mo-input-group">
                            <label>Points Required</label>
                            <input className="mo-input" type="number" value={formData.points} onChange={e => setFormData({...formData, points: e.target.value})} placeholder="e.g. 20000"/>
                        </div>
                        {formData.type === 'VOUCHER' ? (
                            <div className="mo-input-group">
                                <label>Prefix Code</label>
                                <input className="mo-input" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="e.g. PLN-20"/>
                            </div>
                        ) : (
                            <div className="mo-input-group">
                                <label>Description</label>
                                <input className="mo-input" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g. Bank Transfer"/>
                            </div>
                        )}
                        <div className="mo-modal-footer">
                            <button className="btn-grey" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-save-changes" onClick={handleSave}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRewards;