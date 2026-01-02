import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCamera, FaHome, FaUserTie, FaRecycle, FaGift, FaSignOutAlt, FaSave, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './AdminProfile.css';
import './AdminLayout.css'; 
import logo from './Image/logoecopoint.png'; 
import backgroundImage from './Image/slideges2.png'; 

const AdminProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);

  // 1. Inisialisasi User
  const [localUser, setLocalUser] = useState(() => {
     const saved = localStorage.getItem('user');
     return saved ? JSON.parse(saved) : (location.state?.user || {});
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

  // --- EFFECT PENTING: AMBIL DATA DARI BACKEND SAAT LOAD ---
  useEffect(() => {
      const fetchUserData = async () => {
          const userId = localUser.id || 1; 

          try {
              const response = await fetch(`http://localhost:9090/api/dashboard/profile/${userId}`);
              if (response.ok) {
                  const data = await response.json(); // <--- NAMA VARIABELNYA 'data'
                  
                  // Update State User
                  setLocalUser(data);
                  
                  // Update Form agar tidak kosong
                  setFormData({
                      nama: data.nama || '',
                      username: data.username || '',
                      noTelepon: data.noTelepon || '',
                      email: data.email || '',
                      password: '',
                      confirmPassword: ''
                  });

                  // --- PERBAIKAN ERROR DI SINI ---
                  // Gunakan 'data', BUKAN 'dataTerbaru'
                  if (data.fotoProfil) {
                      setPreviewImage(`http://localhost:9090/api/dashboard/uploads/${data.fotoProfil}`);
                  }

                  // Update LocalStorage
                  localStorage.setItem('user', JSON.stringify(data));
              }
          } catch (error) {
              console.error("Gagal mengambil data profil:", error);
          }
      };

      fetchUserData();
  }, []); 

  const handleNav = (path) => navigate(path, { state: { user: localUser } });

  const handleLogout = () => {
      Swal.fire({
          title: 'Logout?', text: "Are you sure you want to logout?", icon: 'warning',
          showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, Logout'
      }).then((result) => {
         if (result.isConfirmed) {
            localStorage.removeItem('user'); 
            navigate('/');
          }
      });
  };

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setSelectedFile(file);
          const objectUrl = URL.createObjectURL(file);
          setPreviewImage(objectUrl);
      }
  };

  const handleRemovePhoto = () => {
      setPreviewImage(null);  
      setSelectedFile(null);  
  };

  const handleCancel = () => {
      setIsEditing(false); 
      // Reset form ke data asli (localUser)
      setFormData({
          nama: localUser.nama || '',
          username: localUser.username || '',
          noTelepon: localUser.noTelepon || '',
          email: localUser.email || '',
          password: '',
          confirmPassword: ''
      });
      // Reset foto
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

      const data = new FormData();
      data.append('nama', formData.nama);
      data.append('username', formData.username);
      data.append('noTelepon', formData.noTelepon);
      if (formData.password) data.append('password', formData.password);
      if (selectedFile) data.append('file', selectedFile);

      try {
          const userId = localUser.id || 1; 
          const response = await fetch(`http://localhost:9090/api/dashboard/profile-update/${userId}`, {
              method: 'PUT',
              body: data, 
          });

          if (response.ok) {
              Swal.fire('Success', 'Profil berhasil diperbarui!', 'success');
              
              // Disini variabelnya benar 'dataTerbaru' karena kita deklarasikan barusan
              const dataTerbaru = await response.json(); 

              localStorage.setItem('user', JSON.stringify(dataTerbaru));
              setLocalUser(dataTerbaru);
              
              if (dataTerbaru.fotoProfil) {
                setPreviewImage(`http://localhost:9090/api/dashboard/uploads/${dataTerbaru.fotoProfil}`);
              }

              setIsEditing(false);
              setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));

          } else {
              const errMsg = await response.text();
              Swal.fire('Error', 'Failed to Update: ' + errMsg, 'error');
          }
      } catch (error) {
          console.error(error);
          Swal.fire('Error', 'Server error', 'error');
      }
  };

  return (
    <div className="admin-container" style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'
    }}>
      
      <aside className="sidebar">
        <div className="sidebar-logo">
            <span style={{fontSize: '28px'}}><img src={logo} alt="EcoPoint" /></span> 
            <h2>EcoPoint</h2>
        </div>
        <ul className="sidebar-menu">
          <li onClick={() => handleNav('/admin-dashboard')}><FaHome className="icon" /> Dashboard</li>
          <li onClick={() => handleNav('/manage-officers')}><FaUserTie className="icon" /> Officers</li>
          <li onClick={() => handleNav('/manage-waste')}><FaRecycle className="icon" /> Waste Data</li>
          <li onClick={() => handleNav('/manage-rewards')}><FaGift className="icon" /> Rewards</li>
          <li className="menu-logout" onClick={handleLogout}><FaSignOutAlt className="icon" /> Logout</li>
        </ul>
      </aside>

      <main className="main-content">
        <div className="profile-header-wrapper">
             <h2 className="profile-header-title" style={{color: 'white', textShadow: '0 2px 5px rgba(0,0,0,0.6)'}}>
                My <span style={{color:'#4ade80'}}>Profile</span>
             </h2>
        </div>

        <div className="profile-content-grid">
            
            {/* KARTU FOTO */}
            <div className="profile-card-left">
                <div className="profile-avatar-large" style={{position: 'relative'}}>
                    {previewImage ? (
                        <img src={previewImage} alt="Profile" className="avatar-img-preview" />
                    ) : (
                        <span style={{fontSize:'48px', color:'#ccc'}}>
                            {localUser.nama ? localUser.nama.substring(0,2).toUpperCase() : 'AD'}
                        </span>
                    )}

                    {isEditing && (
                        <>
                            <div className="edit-icon-badge" onClick={() => fileInputRef.current.click()}>
                                <FaCamera size={14}/>
                            </div>
                            {previewImage && (
                                <div className="delete-icon-badge" onClick={handleRemovePhoto}>
                                    <FaTrash size={12}/>
                                </div>
                            )}
                        </>
                    )}
                    
                    <input type="file" ref={fileInputRef} style={{display: 'none'}} accept="image/*" onChange={handleFileChange} />
                </div>
                
                <h3 className="profile-name">{localUser.nama || 'Loading...'}</h3>
                <p className="profile-role-sub">Super Administrator</p>
                
                <div className={`status-badge ${isEditing ? 'editing-badge' : ''}`}>
                    {isEditing ? '● Editing Mode' : '● Active Status'}
                </div>
            </div>

            {/* KARTU FORM */}
            <div className="profile-card-right">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee', paddingBottom:'10px', marginBottom:'25px'}}>
                    <h4 className="section-title" style={{border:0, margin:0, padding:0}}>Personal Information</h4>
                    {!isEditing && <span style={{fontSize:'12px', color:'#888', fontStyle:'italic'}}>View Only</span>}
                </div>
                
                <div className="form-row">
                    <div className="input-wrapper">
                        <label>Admin ID</label>
                        <input type="text" className="profile-input" value={localUser.id || '...'} readOnly style={{backgroundColor: '#f3f4f6'}} />
                    </div>
                    <div className="input-wrapper">
                        <label>Full Name</label>
                        <input type="text" className="profile-input" 
                            value={formData.nama} 
                            onChange={(e) => setFormData({...formData, nama: e.target.value})} 
                            readOnly={!isEditing}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="input-wrapper">
                        <label>Username</label>
                        <input type="text" className="profile-input" 
                            value={formData.username} 
                            onChange={(e) => setFormData({...formData, username: e.target.value})} 
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="input-wrapper">
                        <label>Email Address</label>
                        <input type="email" className="profile-input" 
                            value={formData.email} 
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            readOnly={!isEditing}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="input-wrapper">
                        <label>Phone Number</label>
                        <input type="text" className="profile-input" 
                            value={formData.noTelepon}
                            onChange={(e) => setFormData({...formData, noTelepon: e.target.value})} 
                            readOnly={!isEditing}
                        />
                    </div>
                    <div className="input-wrapper">
                        <label>Current Role</label>
                        <input type="text" className="profile-input" value="Administrator" readOnly style={{backgroundColor:'#f3f4f6'}} />
                    </div>
                </div>

                <h4 className="section-title" style={{marginTop:'30px'}}>Account Security</h4>
                
                <div className="form-row">
                    <div className="input-wrapper">
                        <label>New Password</label>
                        <input type="password" className="profile-input" 
                            placeholder={isEditing ? "Leave blank to keep current" : "Locked"}
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                            readOnly={!isEditing}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="input-wrapper">
                        <label>Confirm Password</label>
                        <input type="password" className="profile-input" 
                            placeholder={isEditing ? "Repeat new password" : "Locked"}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            readOnly={!isEditing}
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div className="admin-action-buttons">
                    {!isEditing ? (
                        <button className="btn-edit-profile" onClick={() => setIsEditing(true)}>
                            <FaEdit style={{marginRight:'8px'}}/> Edit Profile
                        </button>
                    ) : (
                        <div style={{display:'flex', gap:'15px'}}>
                            <button className="btn-cancel-profile" onClick={handleCancel}>
                                <FaTimes style={{marginRight:'8px'}}/> Cancel
                            </button>
                            <button className="btn-save-profile" onClick={handleSave}>
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

export default AdminProfile;