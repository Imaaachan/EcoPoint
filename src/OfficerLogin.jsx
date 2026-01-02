import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Auth.css'; 

// Gambar Background Portal Petugas
import officerBg from './Image/image_5.png'; 

const OfficerLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            Swal.fire({ icon: 'warning', text: 'Please fill in all fields', confirmButtonColor: '#4CAF50' });
            return;
        }

        try {
            const response = await fetch('http://localhost:9090/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();

                if (data.role === 'officer') {
                    localStorage.setItem('user', JSON.stringify(data)); 

                    Swal.fire({
                        icon: 'success',
                        title: 'Login Success!',
                        text: `Welcome, Officer ${data.nama}`,
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        navigate('/officer-dashboard'); 
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Access Denied',
                        text: 'This portal is for Officers only.',
                        confirmButtonColor: '#d33'
                    });
                }
            } else {
                Swal.fire({ icon: 'error', title: 'Login Failed', text: 'Invalid username or password' });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Server connection failed' });
        }
    };

    // --- FUNGSI LUPA PASSWORD ---
// --- FUNGSI LUPA PASSWORD ---
const handleForgotPassword = async () => {
        const result = await Swal.fire({
            title: 'Reset Officer Password',
            html:
                '<div style="text-align: left; font-size: 14px; margin-bottom: 10px; color: #666;">Enter your username and new password:</div>' +
                '<input id="swal-input1" class="swal2-input" placeholder="Username">' +
                '<input id="swal-input2" type="password" class="swal2-input" placeholder="New Password">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Reset Now',
            confirmButtonColor: '#1B5E20',
            // Memastikan data diambil dengan benar sebelum ditutup
            preConfirm: () => {
                const usernameInput = document.getElementById('swal-input1').value;
                const passwordInput = document.getElementById('swal-input2').value;
                if (!usernameInput || !passwordInput) {
                    Swal.showValidationMessage('Username and Password are required');
                    return false; // Jangan tutup modal kalau kosong
                }
                return [usernameInput, passwordInput];
            }
        });

        // Cek apakah user menekan "Reset Now" (isConfirmed)
        if (result.isConfirmed) {
            const [userReset, newPass] = result.value;

            try {
                const res = await fetch(`http://localhost:9090/api/officers/auth/reset-password`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: userReset, newPassword: newPass })
                });

                if (res.ok) {
                    Swal.fire('Success!', 'Your password has been reset.', 'success');
                } else {
                    Swal.fire('Failed', 'Username not found.', 'error');
                }
            } catch (err) {
                console.error("Reset error:", err);
                Swal.fire('Error', 'Connection failed', 'error');
            }
        }
    };
        
    return (
        <div 
            className="auth-container" 
            style={{ backgroundImage: `url(${officerBg})` }} 
        >
            <div className="auth-card login-mode">
                
                {/* Gambar Kiri */}
                <div className="auth-side image-side">
                    <img src={officerBg} alt="Officer Background" />
                </div>

                {/* Form Kanan */}
                <div className="auth-side form-side">
                    <h2 className="auth-title" style={{ color: '#1B5E20' }}>OFFICER PORTAL</h2>
                    <p className="auth-subtitle">Manage your waste collection account</p>

                    <form onSubmit={handleLogin} style={{width: '100%'}}>
                        <div className="form-group">
                            <input 
                                type="text" className="custom-input" placeholder="Officer Username" 
                                value={username} onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input 
                                type="password" className="custom-input" placeholder="Password" 
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Forget Password Link */}
                        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                            <span 
                                onClick={handleForgotPassword} 
                                style={{ color: '#1B5E20', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
                            >
                                Forget Password?
                            </span>
                        </div>

                        <button type="submit" className="btn-green" style={{backgroundColor: '#1B5E20'}}>
                            LOGIN AS OFFICER
                        </button>
                    </form>

                    <div className="footer-text" style={{marginTop: '20px'}}>
                        <span className="link-text" onClick={() => navigate('/')}>← Back to Home</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OfficerLogin;