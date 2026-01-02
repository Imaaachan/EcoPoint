import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaUserTie, FaRecycle, FaGift, 
  FaBell, FaEnvelope, FaPlus, FaTimes, FaSignOutAlt 
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import './AdminLayout.css'; 
import './ManageOfficers.css'; 
import logo from './Image/logoecopoint.png'; 

const ManageOfficers = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- PERBAIKAN 1: USER STATE & FOTO ---
  const [user, setUser] = useState(() => {
     return JSON.parse(localStorage.getItem('user')) || { nama: 'Super Admin', role: 'admin' };
  });

  // URL Foto Profil
  const photoUrl = user.fotoProfil 
      ? `http://localhost:9090/api/dashboard/uploads/${user.fotoProfil}` 
      : null;

  // Data State
  const [officers, setOfficers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ 
      pk_id: null, 
      id: '', name: '', username: '', phone: '', password: '' 
  });
  
  const [deleteTargetPk, setDeleteTargetPk] = useState(null);

  // Fetch Officers
  const fetchOfficers = () => {
    fetch('http://localhost:9090/api/officers')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(item => ({
          pk_id: item.pk_id,
          id: item.id, 
          name: item.fullName,
          username: item.username,
          phone: item.phone,
          reset_request: item.reset_request 
        }));
        setOfficers(formatted);
      })
      .catch(err => console.error("Fetch error:", err));
  };

  useEffect(() => { 
      // Refresh User Data (Biar sinkron kalau habis edit profil)
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) setUser(storedUser);

      fetchOfficers(); 
  }, []);

  const handleNav = (path) => navigate(path, { state: { user } });
  
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

  // --- HANDLERS --- //

  const openAddModal = () => {
      setIsEditMode(false);
      const autoId = 'PTG-' + Math.floor(100 + Math.random() * 900);
      setFormData({ pk_id: null, id: autoId, name: '', username: '', phone: '', password: '' });
      setShowModal(true);
  };

  const openEditModal = (officer) => {
      setIsEditMode(true);
      setFormData({ 
          pk_id: officer.pk_id,
          id: officer.id, 
          name: officer.name, 
          username: officer.username, 
          phone: officer.phone, 
          password: '' 
      });
      setShowModal(true);
  };

  const openDeleteModal = (pk_id) => {
      setDeleteTargetPk(pk_id);
      setShowDeleteModal(true);
  };

  const handleSave = () => {
      if (!formData.name || (!isEditMode && !formData.username)) {
          return Swal.fire('Error', 'Please fill in the required fields', 'warning');
      }

      const payload = { 
          officerId: formData.id, 
          fullName: formData.name, 
          username: formData.username, 
          phone: formData.phone, 
          password: formData.password 
      };

      const url = isEditMode 
        ? `http://localhost:9090/api/officers/${formData.pk_id}` 
        : 'http://localhost:9090/api/officers';
      
      const method = isEditMode ? 'PUT' : 'POST';

      fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      })
      .then(res => {
          if (res.ok) {
            fetchOfficers(); 
            setShowModal(false); 
            Swal.fire('Success', 'Data successfully saved!', 'success'); 
          } else {
            throw new Error("Failed to save");
          }
      })
      .catch(() => Swal.fire('Error', 'Failed to save data', 'error'));
  };

  const confirmDelete = () => {
      fetch(`http://localhost:9090/api/officers/${deleteTargetPk}`, { method: 'DELETE' })
        .then(() => { 
            fetchOfficers(); 
            setShowDeleteModal(false); 
            Swal.fire('Deleted!', 'Officer has been removed.', 'success'); 
        });
  };

  const handleAdminReset = (pk_id) => {
      Swal.fire({
          title: 'Reset Password?',
          text: "Password will be reset to '123456'",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#FF9800',
          confirmButtonText: 'Yes, Reset'
      }).then((result) => {
          if (result.isConfirmed) {
              fetch(`http://localhost:9090/api/officers/admin-reset/${pk_id}`, { method: 'PUT' })
                .then(res => {
                    if(res.ok) {
                        fetchOfficers(); 
                        Swal.fire('Success', 'Password reset to 123456', 'success');
                    }
                })
                .catch(() => Swal.fire('Error', 'Failed to reset', 'error'));
          }
      });
  };


  return (
    <div className="mo-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo"><span>
            <img src={logo} alt="EcoPoint" />
            </span><h2>EcoPoint</h2></div>
        <ul className="sidebar-menu">
          <li onClick={() => handleNav('/admin-dashboard')}><FaHome className="icon" /> Dashboard</li>
          <li className="active"><FaUserTie className="icon" /> Officers</li>
          <li onClick={() => handleNav('/manage-waste')}><FaRecycle className="icon" /> Waste Data</li>
          <li onClick={() => handleNav('/manage-rewards')}><FaGift className="icon" /> Rewards</li>
          <li className="menu-logout" onClick={handleLogout}><FaSignOutAlt className="icon" /> Logout</li>
        </ul>
      </aside>

      {/* CONTENT */}
      <main className="mo-content">
        
        {/* --- PERBAIKAN 2: HEADER DENGAN AVATAR BARU --- */}
        <header className="admin-header">
          <div className="header-left"><h1>Manage <span className="highlight-name">Officers</span></h1></div>
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

        {/* --- NOTIFIKASI PERMINTAAN RESET --- */}
        {officers.filter(off => off.reset_request).length > 0 && (
            <div className="mo-reset-alert">
                <div className="mo-reset-alert-header">
                    <span role="img" aria-label="warning">⚠️</span>
                    <h4>Password Reset Requests</h4>
                </div>
                <div className="mo-reset-list">
                    {officers.filter(off => off.reset_request).map(req => (
                        <div key={req.pk_id} className="mo-reset-item">
                            <span>
                                Officer <strong>{req.name}</strong> (@{req.username}) requested a reset.
                            </span>
                            <button 
                                className="btn-admin-reset" 
                                onClick={() => handleAdminReset(req.pk_id)}
                            >
                                Reset to "123456"
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
        {/* LIST CARD */}
        <div className="mo-card">
            <h2 style={{fontSize:'20px', margin:0}}>Field Officers List</h2>
            <p style={{margin:'5px 0 0', color:'#888', fontSize:'13px'}}>Manage your team</p>
            
            <button className="btn-add-wide" onClick={openAddModal}>
                <FaPlus /> Add Officer
            </button>
          
            <table className="mo-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>FULL NAME</th>
                        <th>USERNAME</th>
                        <th>PHONE</th>
                        <th>ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    {officers.length > 0 ? officers.map((off) => (
                        <tr key={off.pk_id}>
                            <td style={{fontWeight:'bold', color:'#555'}}>{off.id}</td>
                            <td>{off.name}</td>
                            <td>{off.username}</td>
                            <td>{off.phone}</td>
                            <td>
                                <div className="action-wrapper">
                                    <button className="btn-action-edit" onClick={() => openEditModal(off)}>Edit</button>
                                    <button className="btn-action-delete" onClick={() => openDeleteModal(off.pk_id)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>No officers found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </main>

      {/* --- MAIN MODAL (ADD / EDIT) --- */}
      {showModal && (
        <div className="mo-modal-overlay">
          <div className="mo-modal-box">
            <div className="mo-modal-header">
                <h3>{isEditMode ? 'Edit Officer Data' : 'Register New Officer'}</h3>
                <FaTimes style={{cursor:'pointer', color:'#999'}} onClick={()=>setShowModal(false)}/>
            </div>
            
            <div className="mo-form-grid">
               {/* KOLOM KIRI */}
               <div className="left-col">
                   <div className="mo-input-group">
                       <label>Officer ID</label>
                       <input 
                           className={`mo-input ${isEditMode ? 'readonly' : ''}`} 
                           value={formData.id} 
                           onChange={(e) => setFormData({...formData, id: e.target.value})}
                           readOnly={isEditMode} 
                           placeholder="e.g. PTG-001"
                       />
                   </div>
                   <div className="mo-input-group">
                       <label>Username</label>
                       <input 
                           className={`mo-input ${isEditMode ? 'readonly' : ''}`}
                           value={formData.username} 
                           onChange={(e) => setFormData({...formData, username: e.target.value})}
                           readOnly={isEditMode}
                           placeholder="e.g. budisantoso"
                       />
                   </div>
                   {!isEditMode && (
                       <div className="mo-input-group">
                           <label>Password</label>
                           <input 
                               type="password"
                               className="mo-input"
                               value={formData.password}
                               onChange={(e) => setFormData({...formData, password: e.target.value})}
                               placeholder="Create a password"
                           />
                       </div>
                   )}
               </div>

               {/* KOLOM KANAN */}
               <div className="right-col">
                   <div className="mo-input-group">
                       <label>Full Name</label>
                       <input 
                           className="mo-input"
                           value={formData.name} 
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                           placeholder="e.g. Budi Santoso"
                       />
                   </div>
                   <div className="mo-input-group">
                       <label>Phone Number</label>
                       <input 
                           className="mo-input"
                           value={formData.phone} 
                           onChange={(e) => setFormData({...formData, phone: e.target.value})}
                           placeholder="e.g. 0812-3456-7890"
                       />
                   </div>
               </div>
            </div>

            <div className="mo-modal-footer">
                <button className="btn-grey" onClick={()=>setShowModal(false)}>Cancel</button>
                <button className="btn-save-changes" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="mo-modal-overlay">
            <div className="mo-modal-box delete-modal-box">
                <h3 style={{margin:'0 0 10px 0', fontSize:'22px'}}>Are you sure?</h3>
                <p style={{color:'#666', marginBottom:'30px'}}>Do you really want to delete this officer account? This process cannot be undone.</p>
                <div style={{display:'flex', justifyContent:'center', gap:'15px'}}>
                    <button className="btn-grey" onClick={()=>setShowDeleteModal(false)}>No, Cancel</button>
                    <button className="btn-action-delete" style={{fontSize:'14px', padding:'12px 30px'}} onClick={confirmDelete}>Yes, Delete</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
export default ManageOfficers;