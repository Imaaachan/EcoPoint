import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// --- UPDATE IMPORT RECHARTS ---
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { FaHome, FaUserTie, FaRecycle, FaGift, FaSignOutAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './AdminLayout.css'; 
import logo from './Image/logoecopoint.png'; 

// Warna untuk Pie Chart
const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#AF19FF'];

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // --- PERBAIKAN 1: STATE USER & FOTO ---
  // Kita pakai State supaya kalau data di localStorage berubah, tampilan ikut berubah
  const [user, setUser] = useState(() => {
      return JSON.parse(localStorage.getItem('user')) || { nama: 'Super Admin', role: 'admin' };
  });

  // Buat URL Foto berdasarkan data user.fotoProfil
  const photoUrl = user.fotoProfil 
      ? `http://localhost:9090/api/dashboard/uploads/${user.fotoProfil}` 
      : null;

  // --- STATE LAINNYA (TETAP) ---
  const [stats, setStats] = useState({
    totalUser: 0, totalOfficers: 0, totalPoints: 0, pendingRequest: 0, recentActivities: []
  });
  const [topOfficers, setTopOfficers] = useState([]);
  const [wasteData, setWasteData] = useState([]); 
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    // Refresh User Data dari LocalStorage saat halaman dimuat
    // (Penting agar nama/foto terupdate setelah edit profil)
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
        setUser(storedUser);
    }

    // 1. Fetch Stats Cards
    fetch('http://localhost:9090/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Err stats:", err));

    // 2. Fetch Officers
    fetch('http://localhost:9090/api/officers')
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setTopOfficers(data.slice(0, 5)); })
      .catch(err => console.error("Err officers:", err));

    // 3. FETCH CHART: WASTE COMPOSITION (PIE)
    fetch('http://localhost:9090/api/dashboard/chart/composition') 
      .then(res => res.json())
      .then(data => setWasteData(data))

    // 4. FETCH CHART: PERFORMANCE (AREA)
    fetch('http://localhost:9090/api/dashboard/chart/performance')
      .then(res => res.json())
      .then(data => setPerformanceData(data))

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

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo"><span style={{fontSize: '24px'}}>
            <img src={logo} alt="EcoPoint" />
            </span><h2>EcoPoint</h2></div>
        <ul className="sidebar-menu">
          <li className="active" onClick={() => handleNav('/admin-dashboard')}><FaHome className="icon" /> Dashboard</li>
          <li onClick={() => handleNav('/manage-officers')}><FaUserTie className="icon" /> Officers</li>
          <li onClick={() => handleNav('/manage-waste')}><FaRecycle className="icon" /> Waste Data</li>
          <li onClick={() => handleNav('/manage-rewards')}><FaGift className="icon" /> Rewards</li>
          <li className="menu-logout" onClick={handleLogout}><FaSignOutAlt className="icon" /> Logout</li>
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        
        {/* --- PERBAIKAN 2: HEADER DENGAN FOTO DARI BACKEND --- */}
        <header className="admin-header">
             <div className="header-left">
                <h1>Welcome back, <span className="highlight-name">{user.nama}</span> 👋</h1>
            </div>
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

        {/* STATS GRID */}
        <section className="stats-grid">
           <div className="stat-card green">
               <span>Total User</span><h2>{stats.totalUser}</h2><div className="bg-wave"></div>
           </div>
           <div className="stat-card blue">
               <span>Points in Circulation</span><h2>{stats.totalPoints?.toLocaleString()}</h2><div className="bg-wave"></div>
           </div>
           <div className="stat-card teal">
               <span>Total Officers</span><h2>{stats.totalOfficers}</h2><div className="bg-wave"></div>
           </div>
           <div className="stat-card orange">
               <span>Pending Request</span><h2>{stats.pendingRequest}</h2><div className="bg-wave"></div>
           </div>
        </section>

        {/* CHARTS GRID */}
        <section className="charts-grid">
           
           {/* 1. PERFORMANCE OVERVIEW (AREA CHART) */}
           <div className="card">
              <div className="card-header"><h3>Performance Overview</h3></div>
              <div style={{ height: 250, width: '100%', marginTop: '10px' }}>
                  {performanceData.length > 0 ? (
                      <ResponsiveContainer>
                          <AreaChart data={performanceData}>
                              <defs>
                                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee"/>
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#888'}} />
                              <YAxis axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#888'}} />
                              <Tooltip contentStyle={{borderRadius:'10px', border:'none'}}/>
                              <Area type="monotone" dataKey="weight" stroke="#4CAF50" strokeWidth={3} fill="url(#colorWeight)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  ) : (
                      <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#aaa'}}>
                          No transaction data yet...
                      </div>
                  )}
              </div>
           </div>

           {/* 2. WASTE COMPOSITION (PIE CHART) */}
           <div className="card">
              <div className="card-header"><h3>Waste Composition (KG)</h3></div>
              <div className="total-points-badge" style={{position:'absolute', top:'45px', right:'25px', fontSize:'12px', padding:'5px 10px'}}>
                  <FaRecycle style={{marginRight:'5px'}}/> Total Waste Processed: {performanceData.reduce((sum, item) => sum + item.weight, 0)} Kg
              </div>
              <div style={{ height: 250, width: '100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                 {wasteData.length > 0 ? (
                     <ResponsiveContainer>
                        <PieChart>
                            <Pie 
                                data={wasteData} 
                                cx="50%" cy="50%" 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={5} 
                                dataKey="value"
                            >
                                {wasteData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                     </ResponsiveContainer>
                 ) : (
                     <div style={{textAlign:'center'}}>
                         <h2 style={{fontSize:'32px', color:'#00C49F', margin:0}}>0</h2>
                         <span style={{fontSize:'12px', color:'#888'}}>Pts Total</span>
                     </div>
                 )}
              </div>
           </div>
        </section>

        {/* BOTTOM SECTION (Activities & Top Officers) - SAMA PERSIS */}
        <section className="bottom-grid">
           <div className="card">
             <div className="card-header"><h3>Recent Activities</h3></div>
             <div style={{ marginTop: '10px' }}>
                {stats.recentActivities && stats.recentActivities.length > 0 ? (
                    stats.recentActivities.map((act, index) => (
                      <div key={index} style={{padding:'10px 0', borderBottom:'1px solid #eee', display:'flex', gap:'15px', alignItems:'center'}}>
                          <div style={{background:'#E8F5E9', padding:'8px', borderRadius:'8px', color:'#4CAF50'}}>♻️</div>
                          <div><h4 style={{margin:'0 0 5px 0', fontSize:'14px'}}>{act.type}</h4><p style={{margin:0, fontSize:'12px', color:'#666'}}>{act.desc}</p></div>
                      </div>
                    ))
                ) : (
                    <p style={{color:'#999', textAlign:'center', padding:'20px'}}>No recent activities yet.</p>
                )}
             </div>
           </div>

           <div className="card">
             <div className="card-header"><h3>Top Officers</h3></div>
             <table className="officer-table">
               <thead><tr><th>ID</th><th>NAME</th><th>USERNAME</th><th>STATUS</th></tr></thead>
               <tbody>
                 {topOfficers.length > 0 ? (
                     topOfficers.map((off) => (
                         <tr key={off.id}>
                             <td>#{off.officerId}</td><td style={{fontWeight:600}}>{off.fullName}</td><td>@{off.username}</td><td><span className="badge active">Active</span></td>
                         </tr>
                     ))
                 ) : (
                     <tr><td colSpan="4" style={{textAlign:'center', padding:'20px', color:'#999'}}>No officers data found.</td></tr>
                 )}
               </tbody>
             </table>
           </div>
        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;