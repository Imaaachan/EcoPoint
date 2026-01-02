import React, { useState, useEffect, useRef } from 'react'; // Tambah useRef
import { useNavigate } from 'react-router-dom';
import { FaSave, FaLock, FaUserEdit, FaSignOutAlt, FaPen, FaTimes, FaHistory, FaHome, FaCamera } from 'react-icons/fa'; // Tambah FaCamera
import Swal from 'sweetalert2';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null); // Ref untuk input file

    // State Data User
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    const [user, setUser] = useState({ ...storedUser, poin: 0 });
    
    // State Mode Edit
    const [isEditing, setIsEditing] = useState(false);

    // State Form
    const [formData, setFormData] = useState({
        nama: '', username: '', email: '', noTelepon: ''
    });

    const [passData, setPassData] = useState({
        oldPassword: '', newPassword: '', confirmPassword: ''
    });

    // State Foto
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [history, setHistory] = useState([]);

    // Fetch Data
    useEffect(() => {
        if (user.id) {
            fetch(`https://untemptable-untediously-carole.ngrok-free.dev/api/users/${user.id}/stats`)
                .then(res => res.json())
                .then(data => setUser(prev => ({ ...prev, poin: data.poin })))
                .catch(console.error);

            fetch(`https://untemptable-untediously-carole.ngrok-free.dev/api/transaction/history/${user.id}`)
                .then(res => res.json())
                .then(data => setHistory(data.slice(0, 5))) 
                .catch(console.error);
                
            setFormData({
                nama: user.nama || '',
                username: user.username || '',
                email: user.email || '',
                noTelepon: user.noTelepon || ''
            });

            // Set Preview Foto jika ada di database
            if (user.fotoProfil) {
                setPreviewImage(`https://untemptable-untediously-carole.ngrok-free.dev/api/users/uploads/${user.fotoProfil}`);
            }
        }
    }, [user.id]);

    // Handlers Input Text
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handlePassChange = (e) => setPassData({ ...passData, [e.target.name]: e.target.value });

    // Handler Ganti Foto
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // SAVE PROFILE (Updated dengan FormData)
    const handleSaveProfile = async () => {
        try {
            const dataToSend = new FormData();
            dataToSend.append('nama', formData.nama);
            dataToSend.append('username', formData.username);
            dataToSend.append('email', formData.email);
            dataToSend.append('noTelepon', formData.noTelepon);
            
            if (selectedFile) {
                dataToSend.append('file', selectedFile);
            }

            const res = await fetch(`https://untemptable-untediously-carole.ngrok-free.dev/api/users/${user.id}/update`, {
                method: 'PUT',
                // JANGAN set Content-Type header manual saat pakai FormData!
                body: dataToSend
            });

            if (res.ok) {
                // Backend sekarang mengembalikan object user lengkap
                const updatedDataFromBackend = await res.json();
                
                // Gabungkan data backend dengan poin yg sudah ada di state
                const finalUser = { ...updatedDataFromBackend, poin: user.poin };

                localStorage.setItem('user', JSON.stringify(finalUser));
                setUser(finalUser);
                
                // Update preview dengan URL baru dari backend
                if (finalUser.fotoProfil) {
                    setPreviewImage(`https://untemptable-untediously-carole.ngrok-free.dev/api/users/uploads/${finalUser.fotoProfil}`);
                }

                setIsEditing(false);
                Swal.fire('Success', 'Profile updated!', 'success');
            } else {
                Swal.fire('Error', 'Failed to update', 'error');
            }
        } catch (err) { Swal.fire('Error', 'Connection error', 'error'); }
    };

    // ... (handleChangePassword, handleLogout, formatDate SAMA SEPERTI SEBELUMNYA) ...
    const handleChangePassword = async () => {
        if (!passData.oldPassword && !passData.newPassword) return; 
        if (passData.newPassword !== passData.confirmPassword) {
            Swal.fire('Error', 'New passwords do not match', 'error');
            return;
        }
        try {
            const res = await fetch(`https://untemptable-untediously-carole.ngrok-free.dev/api/users/${user.id}/change-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passData)
            });
            if (res.ok) {
                Swal.fire('Success', 'Password changed! Please login again.', 'success')
                    .then(() => { localStorage.removeItem('user'); navigate('/login'); });
            } else {
                const msg = await res.text();
                Swal.fire('Failed', msg, 'error');
            }
        } catch (err) { Swal.fire('Error', 'Connection error', 'error'); }
    };

    const handleLogout = () => {
        Swal.fire({
            title: 'Logout?', icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#d33', confirmButtonText: 'Yes'
        }).then((res) => {
            if (res.isConfirmed) {
                localStorage.removeItem('user');
                navigate('/login');
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="profile-container">
            <div className="profile-bg"></div>

            <div className="profile-scroll-wrapper">
                <div className="profile-content-centered">
                    
                    <div className="profile-header">
                        <h2>My Profile</h2>
                        <div className="header-actions">
                            <button className="btn-home-pill" onClick={() => navigate('/home')}>
                                <FaHome /> Home
                            </button>
                            <button className="btn-logout-pill" onClick={handleLogout}>
                                <FaSignOutAlt /> Logout
                            </button>
                        </div>
                    </div>

                    <div className="profile-grid">
                        
                        {/* LEFT: SUMMARY CARD */}
                        <div className="glass-card left-card">
                            <div className="avatar-section">
                                {/* AVATAR DENGAN LOGIKA PREVIEW & TOMBOL KAMERA */}
                                <div className="avatar-circle-large" style={{position:'relative', overflow:'visible'}}>
                                    {previewImage ? (
                                        <img src={previewImage} alt="Profile" className="avatar-img-preview" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%'}} />
                                    ) : (
                                        <span>{user.nama ? user.nama.charAt(0).toUpperCase() : 'U'}</span>
                                    )}

                                    {/* Tombol Kamera (Hanya muncul saat Edit) */}
                                    {isEditing && (
                                        <div className="camera-badge" onClick={() => fileInputRef.current.click()}>
                                            <FaCamera size={14}/>
                                        </div>
                                    )}
                                    <input type="file" ref={fileInputRef} style={{display:'none'}} accept="image/*" onChange={handleFileChange} />
                                </div>

                                <h3>{user.nama}</h3>
                                <span className="role-badge">Eco-Citizen</span>
                                <p className="join-date">Member since {formatDate(user.createdAt)}</p>
                            </div>

                            <div className="points-box">
                                <span className="pts-label">Eco Points</span>
                                <div className="pts-value">{user.poin.toLocaleString()}</div>
                            </div>
                        </div>

                        {/* RIGHT: FORM CARD (SAMA) */}
                        <div className="glass-card right-card">
                            <div className="card-header-row">
                                <h3><FaUserEdit style={{marginRight:'8px'}}/> Personal Information</h3>
                                {!isEditing && (
                                    <button className="btn-edit-toggle" onClick={() => setIsEditing(true)}>
                                        <FaPen size={12}/> Edit Details
                                    </button>
                                )}
                            </div>

                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Full Name</label>
                                    {isEditing ? (
                                        <input type="text" name="nama" className="glass-input" value={formData.nama} onChange={handleInputChange}/>
                                    ) : <div className="read-only-text">{user.nama}</div>}
                                </div>
                                <div className="input-group">
                                    <label>Username</label>
                                    {isEditing ? (
                                        <input type="text" name="username" className="glass-input" value={formData.username} onChange={handleInputChange}/>
                                    ) : <div className="read-only-text">{user.username}</div>}
                                </div>
                                <div className="input-group">
                                    <label>Email</label>
                                    {isEditing ? (
                                        <input type="email" name="email" className="glass-input" value={formData.email} onChange={handleInputChange}/>
                                    ) : <div className="read-only-text">{user.email}</div>}
                                </div>
                                <div className="input-group">
                                    <label>Phone</label>
                                    {isEditing ? (
                                        <input type="text" name="noTelepon" className="glass-input" value={formData.noTelepon} onChange={handleInputChange}/>
                                    ) : <div className="read-only-text">{user.noTelepon}</div>}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="password-section fade-in">
                                    <h4 className="sec-title"><FaLock/> Security</h4>
                                    <div className="form-grid">
                                        <div className="input-group">
                                            <label>Old Password</label>
                                            <input type="password" name="oldPassword" className="glass-input" placeholder="******" onChange={handlePassChange}/>
                                        </div>
                                        <div></div>
                                        <div className="input-group">
                                            <label>New Password</label>
                                            <input type="password" name="newPassword" className="glass-input" placeholder="New pass" onChange={handlePassChange}/>
                                        </div>
                                        <div className="input-group">
                                            <label>Confirm Password</label>
                                            <input type="password" name="confirmPassword" className="glass-input" placeholder="Repeat pass" onChange={handlePassChange}/>
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button className="btn-cancel" onClick={() => { setIsEditing(false); setSelectedFile(null); }}>
                                            <FaTimes/> Cancel
                                        </button>
                                        <button className="btn-save" onClick={() => { handleSaveProfile(); handleChangePassword(); }}>
                                            <FaSave/> Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* BOTTOM: RECENT ACTIVITY (SAMA) */}
                        <div className="glass-card bottom-card">
                            <h3><FaHistory style={{marginRight:'8px'}}/> Recent Activity</h3>
                            <div className="activity-list">
                                {history.length === 0 ? <p className="no-data">No transactions yet.</p> : 
                                    history.map((item, idx) => (
                                        <div key={idx} className="activity-row">
                                            <div className="act-desc">
                                                <span className="act-title">
                                                    {item.totalPoin < 0 ? 'Redeem Reward' : `Deposit ${item.jenisSampah || 'Waste'}`}
                                                </span>
                                                {item.keterangan && <span className="act-sub">{item.keterangan}</span>}
                                            </div>
                                            <div className="act-date">{formatDate(item.tanggal)}</div>
                                            <div className={`act-points ${item.totalPoin < 0 ? 'red' : 'green'}`}>
                                                {item.totalPoin > 0 ? '+' : ''}{item.totalPoin}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;