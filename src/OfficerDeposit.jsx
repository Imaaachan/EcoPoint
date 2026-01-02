import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaLeaf, FaThLarge, FaClipboardList, FaPlusCircle, FaSignOutAlt, 
    FaUser, FaRecycle, FaCalculator, FaCheckCircle, FaArrowRight 
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import './OfficerDashboard.css'; // Sidebar & General Style
import './OfficerDeposit.css';   // CSS Layout Khusus Halaman Ini
import logo from './Image/logoecopoint.png';

const OfficerDeposit = () => {
    const navigate = useNavigate();
    
    // --- 1. USER STATE & FOTO ---
    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem('user')) || { nama: 'Officer' };
    });

    const photoUrl = user.fotoProfil 
      ? `https://untemptable-untediously-carole.ngrok-free.dev/api/dashboard/uploads/${user.fotoProfil}` 
      : null;

    // State
    const [wasteTypes, setWasteTypes] = useState([]); 
    const [selectedWaste, setSelectedWaste] = useState(null); 
    
    const [formData, setFormData] = useState({
        username: '',
        weight: '',
    });

    const [isConfirmed, setIsConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Refresh User
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if(storedUser) setUser(storedUser);

        // Fetch Waste Types
        fetch('https://untemptable-untediously-carole.ngrok-free.dev/api/officers/waste-types')
            .then(res => res.json())
            .then(data => {
                setWasteTypes(data);
                if (data.length > 0) {
                    setSelectedWaste(data[0]);
                }
            })
            .catch(err => console.error("Gagal ambil jenis sampah:", err));
    }, []);

    const calculatePoints = () => {
        if (!selectedWaste || !formData.weight) return 0;
        const weight = parseFloat(formData.weight) || 0;
        return Math.floor(weight * selectedWaste.poinPerKg);
    };

    const handleTypeChange = (e) => {
        const typeName = e.target.value;
        const found = wasteTypes.find(w => w.jenis === typeName);
        setSelectedWaste(found);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.username || !formData.weight || parseFloat(formData.weight) <= 0) {
            Swal.fire('Warning', 'Check your input fields.', 'warning');
            return;
        }

        if (!isConfirmed) {
            Swal.fire('Warning', 'Please confirm the data.', 'warning');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('https://untemptable-untediously-carole.ngrok-free.dev/api/officers/deposit-manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    type: selectedWaste.jenis,
                    weight: formData.weight,
                    officerUsername: user.username 
                })
            });

            const data = await res.json();

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `Points added to ${formData.username}`,
                    confirmButtonColor: '#1B5E20'
                });
                setFormData({ ...formData, username: '', weight: '' });
                setIsConfirmed(false);
            } else {
                Swal.fire('Error', data.message || 'User not found', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Connection failed', 'error');
        } finally {
            setLoading(false);
        }
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
        <div className="od-deposit-container">
            {/* SIDEBAR */}
            <aside className="od-sidebar">
                <div className="od-logo">
                    <img src={logo} alt="EcoPoint Logo" />
                    <h2>EcoPoint</h2>
                </div>
                <ul className="od-menu">
                    <li onClick={() => navigate('/officer-dashboard')}><FaThLarge /> Dashboard</li>
                    <li onClick={() => navigate('/check-queue')}><FaClipboardList /> Check Queue</li>
                    <li className="active"><FaPlusCircle /> Manual Deposit</li>
                    <li className="od-logout" onClick={handleLogout}><FaSignOutAlt /> Logout</li>
                </ul>
            </aside>

            {/* MAIN AREA */}
            <main className="od-deposit-main">
                
                {/* HEADER (Konsisten dengan Dashboard) */}
                <header className="ofd-header">
                    <div className="od-welcome">
                        <h3>Manual <span className="highlight-name">Deposit</span></h3>
                        <p style={{margin:0, fontSize:'13px', color:'#888'}}>Verify all details before submitting.</p>
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
                        <div className="avatar-circle" style={{overflow:'hidden', background: photoUrl ? 'transparent' : '#1B5E20'}}>
                            {photoUrl ? (
                                <img src={photoUrl} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="profile"/>
                            ) : (
                                user.nama.charAt(0).toUpperCase()
                            )}
                        </div>
                    </div>
                </header>

                {/* FORM CONTENT */}
                <div className="deposit-content-wrapper">
                    <div className="deposit-form-card">
                        
                        <div className="form-title-bar">
                            <h2>Transaction Form</h2>
                            <p>Please ensure all data matches the actual waste received.</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            
                            {/* SECTION 1: CITIZEN */}
                            <div className="form-section">
                                <div className="section-label">
                                    <FaUser /> Citizen Information
                                </div>
                                <div className="input-grid-2">
                                    <div className="form-group">
                                        <label>Citizen Username <span style={{color:'red'}}>*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            placeholder="Enter username (e.g. budi01)"
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Transaction Date</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            value={new Date().toLocaleDateString()}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: WASTE DATA */}
                            <div className="form-section">
                                <div className="section-label">
                                    <FaRecycle /> Waste Details
                                </div>
                                <div className="input-grid-3">
                                    
                                    <div className="form-group">
                                        <label>Waste Type <span style={{color:'red'}}>*</span></label>
                                        <select 
                                            className="form-control"
                                            onChange={handleTypeChange}
                                            value={selectedWaste ? selectedWaste.jenis : ''}
                                        >
                                            <option value="" disabled>Select Type...</option>
                                            {wasteTypes.map((item) => (
                                                <option key={item.id} value={item.jenis}>
                                                    {item.jenis}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Current Rate</label>
                                        <div className="rate-display">
                                            <span className="rate-value">
                                                {selectedWaste ? selectedWaste.poinPerKg : 0}
                                            </span>
                                            <span className="rate-label">Pts / Kg</span>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Weight (Kg) <span style={{color:'red'}}>*</span></label>
                                        <input 
                                            type="number" 
                                            className="form-control"
                                            placeholder="0.0" step="0.1" min="0.1"
                                            value={formData.weight}
                                            onChange={(e) => setFormData({...formData, weight: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: CALCULATION */}
                            <div className="form-section">
                                <div className="section-label">
                                    <FaCalculator /> Points Calculation
                                </div>
                                <div className="total-points-box">
                                    <div className="tp-label">Total Points to Earn</div>
                                    <div className="tp-value">+{calculatePoints()}</div>
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div className="footer-section">
                                <div className="confirm-check">
                                    <input 
                                        type="checkbox" 
                                        id="confirm"
                                        checked={isConfirmed}
                                        onChange={(e) => setIsConfirmed(e.target.checked)}
                                    />
                                    <label htmlFor="confirm" style={{cursor:'pointer', marginLeft:'8px'}}>
                                        I have verified the waste weight and citizen identity.
                                    </label>
                                </div>
                                
                                <button type="submit" className="btn-submit" disabled={!isConfirmed || loading}>
                                    {loading ? 'Processing...' : (
                                        <>Submit Transaction <FaArrowRight /></>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OfficerDeposit;