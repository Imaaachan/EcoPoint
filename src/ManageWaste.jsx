import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaUserTie, FaRecycle, FaGift, FaSignOutAlt, FaBell, FaEnvelope, FaPlus, FaEdit, FaTimes, FaArrowUp, FaArrowDown, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './AdminLayout.css';
import './ManageWaste.css';
import logo from './Image/logoecopoint.png'; 

const ManageWaste = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- PERBAIKAN 1: USER STATE & FOTO ---
  const [user, setUser] = useState(() => {
     return JSON.parse(localStorage.getItem('user')) || { nama: 'Super Admin', role: 'admin' };
  });

  // URL Foto Profil
  const photoUrl = user.fotoProfil 
      ? `https://untemptable-untediously-carole.ngrok-free.dev/api/dashboard/uploads/${user.fotoProfil}` 
      : null;

  const [wasteTypes, setWasteTypes] = useState([]);
  const [priceLogs, setPriceLogs] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: null, type: '', description: '', price: '' });

  const fetchData = () => {
    fetch('https://untemptable-untediously-carole.ngrok-free.dev/api/waste/categories')
        .then(res => res.json())
        .then(data => {
            const mappedData = data.map(item => ({
                id: item.id,
                type: item.type || item.jenis,
                description: item.description || item.deskripsi,
                price: item.price || item.poin_per_kg,
                color: item.color,
                bgColor: item.bg_color
            }));
            setWasteTypes(mappedData);
        })
        .catch(err => console.error("Err waste:", err));

    fetch('https://untemptable-untediously-carole.ngrok-free.dev/api/waste/logs')
        .then(res => res.json())
        .then(data => setPriceLogs(data.reverse()))
        .catch(err => console.error("Err logs:", err));
  };

  useEffect(() => { 
      // Refresh User Data
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) setUser(storedUser);

      fetchData(); 
  }, []);

  // --- FUNGSI DELETE WASTE ---
  const handleDeleteWaste = (id) => {
    Swal.fire({
        title: 'Delete Category?',
        text: "All associated logs will remain, but this category will be removed.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`https://untemptable-untediously-carole.ngrok-free.dev/api/waste/${id}`, { method: 'DELETE' })
                .then(res => {
                    if(res.ok) {
                        Swal.fire('Deleted!', 'Category has been removed.', 'success');
                        fetchData();
                    }
                })
                .catch(err => Swal.fire('Error', 'Failed to delete category', 'error'));
        }
    });
  };

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

  const openAddModal = () => {
      setIsEditMode(false);
      setFormData({ id: null, type: '', description: '', price: '' });
      setShowModal(true);
  };

  const openEditModal = (item) => {
      setIsEditMode(true);
      setFormData({ id: item.id, type: item.type, description: item.description, price: item.price });
      setShowModal(true);
  };

  const getColorByType = (typeName) => {
      if (!typeName) return { color: '#607D8B', bg: '#ECEFF1' };
      const lower = typeName.toLowerCase();
      if (lower.includes('inor')) {
          return { color: '#1e92f0ff', bg: '#E3F2FD' };
      } else if (lower.includes('organ')) {
          return { color: '#4CAF50', bg: '#E8F5E9' };
      }
      if (lower.includes('resid') || lower.includes('b3') || lower.includes('elektronik')) {
          return { color: '#F44336', bg: '#FFEBEE' };
      }
      return { color: '#FF9800', bg: '#FFF3E0' }; 
  };

    const handleSave = () => {
      if (!formData.type || !formData.price) return Swal.fire('Error', 'Please fill required fields', 'warning');
      
      let url, method;
      const priceInt = parseInt(formData.price); 
      // Hitung ulang warna (kali aja usernya ganti nama kategori, warnanya harus update)
      const colors = getColorByType(formData.type); 

      // Payload (Data yang dikirim) sama untuk Edit maupun Add
      const payload = {
          jenis: formData.type, 
          deskripsi: formData.description, 
          poin_per_kg: priceInt,
          color: colors.color, 
          bg_color: colors.bg,
          adminName: user.nama // Penting buat log harga
      };

      if (isEditMode) {
          // URL BARU: PUT /api/waste/{id}
          url = `https://untemptable-untediously-carole.ngrok-free.dev/api/waste/${formData.id}`;
          method = 'PUT';
      } else {
          // URL ADD: POST /api/waste
          url = 'https://untemptable-untediously-carole.ngrok-free.dev/api/waste'; 
          method = 'POST';
      }

      fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload) // Kirim JSON body baik untuk Edit maupun Add
      }).then(async (res) => {
          if (res.ok) {
              fetchData();
              setShowModal(false);
              Swal.fire('Success', isEditMode ? 'Category Updated' : 'Category Added', 'success');
          } else {
              const errorText = await res.text();
              Swal.fire('Failed!', `Server error: ${errorText}`, 'error');
          }
      }).catch(err => Swal.fire('Error', 'Gagal terhubung ke server', 'error'));
    };

  return (
    <div className="mw-container">
      <aside className="sidebar">
        <div className="sidebar-logo"><span>
            <img src={logo} alt="EcoPoint" />
            </span><h2>EcoPoint</h2></div>
        <ul className="sidebar-menu">
          <li onClick={() => handleNav('/admin-dashboard')}><FaHome className="icon"/> Dashboard</li>
          <li onClick={() => handleNav('/manage-officers')}><FaUserTie className="icon"/> Officers</li>
          <li className="active"><FaRecycle className="icon"/> Waste Data</li>
          <li onClick={() => handleNav('/manage-rewards')}><FaGift className="icon"/> Rewards</li>
          <li className="menu-logout" onClick={handleLogout}><FaSignOutAlt className="icon"/> Logout</li>
        </ul>
      </aside>

      <main className="mw-content">
         
         {/* --- PERBAIKAN 2: HEADER DENGAN AVATAR BARU --- */}
         <header className="admin-header">
             <div className="header-left"><h1>Manage <span className="highlight-name">Waste</span></h1></div>
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

         <div className="mw-header-section">
             <div>
                 <h2>Waste Categories</h2>
                 <p>Manage waste types and current market prices.</p>
             </div>
             <button className="btn-add-waste" onClick={openAddModal}>
                 <FaPlus /> Add Category
             </button>
         </div>

         <div className="mw-grid">
             {wasteTypes.length > 0 ? (
                 wasteTypes.map((item) => (
                     <div className="mw-card" key={item.id} style={{ borderTopColor: item.color || '#ccc' }}>
                         {/* TOMBOL DELETE DI POJOK KANAN ATAS KARTU */}
                         <FaTrash 
                            style={{position: 'absolute', top: '15px', right: '15px', color: '#ff4d4d', cursor: 'pointer', fontSize: '14px'}} 
                            onClick={() => handleDeleteWaste(item.id)}
                            title="Delete Category"
                         />

                         <div className="mw-icon-circle" style={{ color: item.color || '#333', background: item.bgColor || '#f9f9f9' }}>♻️</div>
                         <h3>{item.type}</h3>
                         <p className="mw-desc">{item.description}</p>
                         
                         <div className="mw-price-box">
                             <div className="mw-price">{item.price}</div>
                             <span className="mw-unit">Points / Kg</span>
                         </div>

                         <button className="btn-edit-price" onClick={() => openEditModal(item)}>
                             <FaEdit style={{marginRight:'5px'}}/> Edit Price
                         </button>
                     </div>
                 ))
             ) : (
                 <div style={{gridColumn:'1 / -1', textAlign:'center', padding:'40px', color:'#999'}}>
                     No waste categories found. Add one!
                 </div>
             )}
         </div>
         
         <div className="mw-logs-card">
             <div className="mw-logs-header">Price Change History</div>
             <table className="mw-table">
                 <thead><tr><th>Date</th><th>Category</th><th>Old Price</th><th>New Price</th><th>Admin</th></tr></thead>
                 <tbody>
                     {priceLogs.length > 0 ? priceLogs.map((log) => (
                         <tr key={log.id}>
                             <td>{new Date(log.date).toLocaleString()}</td>
                             <td>{log.category}</td>
                             <td>{log.oldPrice}</td>
                             <td style={{fontWeight:'bold', color: log.trend === 'up' ? 'red' : 'green'}}>
                                 {log.newPrice} {log.trend === 'up' ? <FaArrowUp size={10}/> : <FaArrowDown size={10}/>}
                             </td>
                             <td>{log.adminName}</td>
                         </tr>
                     )) : (
                         <tr><td colSpan="5" style={{textAlign:'center', padding:'20px', color:'#999'}}>No price changes recorded yet.</td></tr>
                     )}
                 </tbody>
             </table>
         </div>
      </main>

      {/* --- MODAL --- */}
      {showModal && (
          <div className="mw-modal-overlay">
              <div className="mw-modal-box">
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', borderBottom:'1px solid #eee', paddingBottom:'15px'}}>
                      <h3 style={{margin:0}}>{isEditMode ? 'Edit Category' : 'Add New Category'}</h3>
                      <FaTimes style={{cursor:'pointer', color:'#999'}} onClick={()=>setShowModal(false)}/>
                  </div>
                  
                  <div className="mw-input-group">
                      <label>Category Name</label>
                      <input 
                        className="mw-input" 
                        value={formData.type} 
                        onChange={(e)=>setFormData({...formData, type:e.target.value})} 
                        // HAPUS readOnly={isEditMode} DISINI AGAR BISA DIEDIT
                        placeholder="e.g. Organic, Plastic, Metal" 
                        // HAPUS style background abu-abu
                      />
                  </div>
                  <div className="mw-input-group">
                      <label>Description</label>
                      <input 
                        className="mw-input" 
                        value={formData.description} 
                        onChange={(e)=>setFormData({...formData, description:e.target.value})} 
                        placeholder="e.g. Food scraps, leaves, etc." 
                        // HAPUS readOnly={isEditMode} DISINI JUGA
                      />
                  </div>
                  <div className="mw-input-group">
                      <label>Price (Pts/Kg)</label>
                      <input 
                        type="number" 
                        className="mw-input" 
                        value={formData.price} 
                        onChange={(e)=>setFormData({...formData, price:e.target.value})} 
                        placeholder="0" 
                      />
                  </div>
                  <div style={{display:'flex', justifyContent:'flex-end', marginTop:'25px', gap:'10px'}}>
                      <button onClick={()=>setShowModal(false)} className="btn-grey">Cancel</button>
                      <button onClick={handleSave} className="btn-save-changes">Save Data</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ManageWaste;