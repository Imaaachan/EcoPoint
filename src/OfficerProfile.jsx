import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLeaf, FaThLarge, FaClipboardList, FaPlusCircle, FaSignOutAlt, FaSave, FaCamera, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './OfficerDashboard.css'; // Sidebar style
import './OfficerProfile.css';   // New Profile style
import logo from './Image/logoecopoint.png';
import bgImage from './Image/slideges2.png'; // Ganti dengan background yang kamu mau

const OfficerProfile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    
    const [isEditing, setIsEditing] = useState(false);

    // 1. Ambil User Awal
    const [localUser, setLocalUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : {};
    });

    // 2. Form Data
    const [formData, setFormData] = useState({
        nama: '',
        username: '',
        noTelepon: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // --- EFFECT: FETCH DATA DARI SERVER ---
    useEffect(() => {
        const fetchUserData = async () => {
            // Gunakan pk_id atau id (tergantung apa yang disimpan saat login)
            const userId = localUser.pk_id || localUser.id; 

            if(!userId) return;

            try {
                // Kita pakai endpoint dashboard karena Petugas juga User
                const response = await fetch(`http://localhost:9090/api/dashboard/profile/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    
                    setLocalUser(data);
                    
                    setFormData({
                        nama: data.nama || '',
                        username: data.username || '',
                        noTelepon: data.noTelepon || '',
                        email: data.email || '',
                        password: '',
                        confirmPassword: ''
                    });

                    if (data.fotoProfil) {
                        setPreviewImage(`http://localhost:9090/api/dashboard/uploads/${data.fotoProfil}`);
                    }

                    // Update LocalStorage agar sinkron
                    localStorage.setItem('user', JSON.stringify(data));
                }
            } catch (error) {
                console.error("Gagal load profil:", error);
            }
        };

        fetchUserData();
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

    // --- HANDLER FOTO & FORM ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleRemovePhoto = () => {
        setPreviewImage(null);
        setSelectedFile(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset Form
        setFormData({
            nama: localUser.nama || '',
            username: localUser.username || '',
            noTelepon: localUser.noTelepon || '',
            email: localUser.email || '',
            password: '',
            confirmPassword: ''
        });
        // Reset Foto
        if (localUser.fotoProfil) {
            setPreviewImage(`http://localhost:9090/api/dashboard/uploads/${localUser.fotoProfil}`);
        } else {
            setPreviewImage(null);
        }
    };

    const handleSave = async () => {
        if(formData.password && formData.password !== formData.confirmPassword) {
            Swal.fire('Error', 'Password baru tidak cocok!', 'error');
            return;
        }

        const dataToSend = new FormData();
        dataToSend.append('nama', formData.nama);
        dataToSend.append('username', formData.username);
        dataToSend.append('noTelepon', formData.noTelepon);
        if (formData.password) dataToSend.append('password', formData.password);
        if (selectedFile) dataToSend.append('file', selectedFile);

        const userId = localUser.pk_id || localUser.id; 

        try {
            // Gunakan endpoint yang sama dengan Admin (User Update Generic)
            const response = await fetch(`http://localhost:9090/api/dashboard/profile-update/${userId}`, {
                method: 'PUT',
                body: dataToSend,
            });

            if (response.ok) {
                Swal.fire('Success', 'Profile updated successfully!', 'success');
                const dataTerbaru = await response.json();

                setLocalUser(dataTerbaru);
                localStorage.setItem('user', JSON.stringify(dataTerbaru));
                
                if(dataTerbaru.fotoProfil) {
                    setPreviewImage(`http://localhost:9090/api/dashboard/uploads/${dataTerbaru.fotoProfil}`);
                }

                setIsEditing(false);
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            } else {
                const errMsg = await response.text();
                Swal.fire('Error', 'Gagal update: ' + errMsg, 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Server connection error', 'error');
        }
    };

    return (
        <div className="op-container" style={{
            backgroundImage: `url(${bgImage})`, // Background Image
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        }}>
            {/* SIDEBAR (Warna Hijau Khas Petugas) */}
            <aside className="od-sidebar">
                <div className="od-logo">
                    <img src={logo} alt="EcoPoint Logo" />
                    <h2>EcoPoint</h2>
                </div>
                <ul className="od-menu">
                    <li onClick={() => navigate('/officer-dashboard')}><FaThLarge /> Dashboard</li>
                    <li onClick={() => navigate('/check-queue')}><FaClipboardList /> Check Queue</li>
                    <li onClick={() => navigate('/officer-deposit')}><FaPlusCircle /> Manual Deposit</li>
                    <li className="od-logout" onClick={handleLogout}><FaSignOutAlt /> Logout</li>
                </ul>
            </aside>

            {/* MAIN CONTENT */}
            <main className="op-main">
                
                <div className="op-header-wrapper">
                     <h2 className="op-header-title">My <span style={{color:'#a5d6a7'}}>Profile</span></h2>
                </div>

                <div className="op-content-grid">
                    
                    {/* KARTU KIRI (FOTO) */}
                    <div className="op-card-profile">
                        <div className="op-avatar-circle" style={{position:'relative'}}>
                            {previewImage ? (
                                <img src={previewImage} alt="Profile" className="op-avatar-img" />
                            ) : (
                                <span>{localUser.nama ? localUser.nama.substring(0,2).toUpperCase() : 'OF'}</span>
                            )}

                            {isEditing && (
                                <>
                                    <div className="op-icon-badge edit" onClick={() => fileInputRef.current.click()}>
                                        <FaCamera size={14}/>
                                    </div>
                                    {previewImage && (
                                        <div className="op-icon-badge delete" onClick={handleRemovePhoto}>
                                            <FaTrash size={12}/>
                                        </div>
                                    )}
                                </>
                            )}
                            <input type="file" ref={fileInputRef} style={{display:'none'}} accept="image/*" onChange={handleFileChange}/>
                        </div>

                        <h3 className="op-name">{localUser.nama}</h3>
                        <p className="op-role">Field Officer</p>
                        
                        <div className={`op-status ${isEditing ? 'editing' : ''}`}>
                            {isEditing ? '● Editing Mode' : '● Active Status'}
                        </div>
                    </div>

                    {/* KARTU KANAN (FORM) */}
                    <div className="op-card-form">
                        <div className="op-form-header">
                            <h4>Personal Information</h4>
                            {!isEditing && <span className="op-view-label">View Only</span>}
                        </div>

                        <div className="op-form-row">
                            <div className="op-input-group">
                                <label>Full Name</label>
                                <input className="op-input" 
                                    value={formData.nama} 
                                    onChange={(e)=>setFormData({...formData, nama:e.target.value})}
                                    readOnly={!isEditing}
                                />
                            </div>
                            <div className="op-input-group">
                                <label>Username</label>
                                <input className="op-input" 
                                    value={formData.username} 
                                    onChange={(e)=>setFormData({...formData, username:e.target.value})}
                                    readOnly={!isEditing}
                                />
                            </div>
                        </div>

                        <div className="op-form-row">
                            <div className="op-input-group">
                                <label>Email Address</label>
                                <input className="op-input" type="email"
                                    value={formData.email} 
                                    onChange={(e)=>setFormData({...formData, email:e.target.value})}
                                    readOnly={!isEditing}
                                />
                            </div>
                            <div className="op-input-group">
                                <label>Phone Number</label>
                                <input className="op-input" 
                                    value={formData.noTelepon} 
                                    onChange={(e)=>setFormData({...formData, noTelepon:e.target.value})}
                                    readOnly={!isEditing}
                                />
                            </div>
                        </div>

                        <h4 style={{marginTop:'30px', marginBottom:'15px', color:'#333'}}>Account Security</h4>
                        
                        <div className="op-form-row">
                            <div className="op-input-group">
                                <label>New Password</label>
                                <input className="op-input" type="password"
                                    placeholder={isEditing ? "Leave blank to keep current" : "Locked"}
                                    value={formData.password}
                                    onChange={(e)=>setFormData({...formData, password:e.target.value})}
                                    readOnly={!isEditing}
                                />
                            </div>
                            <div className="op-input-group">
                                <label>Confirm Password</label>
                                <input className="op-input" type="password"
                                    placeholder={isEditing ? "Repeat new password" : "Locked"}
                                    value={formData.confirmPassword}
                                    onChange={(e)=>setFormData({...formData, confirmPassword:e.target.value})}
                                    readOnly={!isEditing}
                                />
                            </div>
                        </div>

                        <div className="op-actions">
                            {!isEditing ? (
                                <button className="op-btn-edit" onClick={()=>setIsEditing(true)}>
                                    <FaEdit style={{marginRight:'8px'}}/> Edit Profile
                                </button>
                            ) : (
                                <div style={{display:'flex', gap:'15px'}}>
                                    <button className="op-btn-cancel" onClick={handleCancel}>
                                        <FaTimes style={{marginRight:'8px'}}/> Cancel
                                    </button>
                                    <button className="op-btn-save" onClick={handleSave}>
                                        <FaSave style={{marginRight:'8px'}}/> Save Changes
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default OfficerProfile;