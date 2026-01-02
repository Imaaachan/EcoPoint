import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Auth.css';

// --- IMPORT GAMBAR ---
import recycleImage from './Image/image_5.png'; 

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // --- LOGIKA LOGIN (Sama seperti sebelumnya) ---
    const handleLogin = async (e) => {
        e.preventDefault();
        const loginData = { username, password };

        if(!username || !password) {
             Swal.fire({ icon: 'warning', text: 'Username dan Password wajib diisi', confirmButtonColor: '#4CAF50'});
            return;
        }

        try {
            const response = await fetch('http://localhost:9090/api/users/login', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('user', JSON.stringify(data)); 

                Swal.fire({
                    icon: 'success',
                    title: 'Welcome Back!',
                    text: `Hello, ${data.nama}`,
                    timer: 1500,
                    showConfirmButton: false,
                    confirmButtonColor: '#4CAF50'
                }).then(() => {
                    if (data.role === 'admin') navigate('/admin-dashboard');
                    else if (data.role === 'officer') navigate('/officer-dashboard');
                    else navigate('/home'); 
                });

            } else {
                const errorText = await response.text();
                Swal.fire({ icon: 'error', title: 'Login Gagal', text: errorText });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Server tidak merespon (Cek Port 9090).' });
        }
    };

    // --- LOGIKA HELPER LAINNYA ---
    const handleForgotPassword = async () => {
    const { value: userReset } = await Swal.fire({
        title: 'Forgot Password?',
        text: "Please enter your username to notify Admin.",
        input: 'text',
        inputPlaceholder: 'Your Username',
        showCancelButton: true,
        confirmButtonColor: '#1B5E20'
    });

    if (userReset) {
            try {
                const res = await fetch(`http://localhost:9090/api/officers/request-reset/${userReset}`, {
                    method: 'PUT'
                });
                if (res.ok) {
                    Swal.fire('Request Sent', 'Admin has been notified. Please contact your Admin.', 'success');
                } else {
                    Swal.fire('Error', 'Username not found.', 'error');
                }
            } catch (err) {
                Swal.fire('Error', 'Server connection failed', 'error');
            }
        }
    };
    return (
        <div 
            className="auth-container" 
            style={{ backgroundImage: `url(${recycleImage})`, position: 'relative' }} 
        >
            {/* --- TOMBOL BARU: BACK TO LANDING PAGE --- */}
            <button 
                onClick={() => navigate('/')} // Arahkan ke root (Landing Page)
                style={{
                    position: 'absolute',
                    top: '30px',
                    right: '40px',
                    padding: '10px 25px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Transparan kaca
                    color: 'white',
                    border: '2px solid white',
                    borderRadius: '30px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(5px)', // Efek blur
                    zIndex: 10,
                    transition: '0.3s'
                }}
                onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.color = '#1B5E20';
                }}
                onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.color = 'white';
                }}
            >
                ← Back to Home
            </button>

            {/* --- KARTU LOGIN (Tetap Sama) --- */}
            <div className="auth-card">
                <div className="auth-side image-side">
                    <img src={recycleImage} alt="Recycle" />
                </div>

                <div className="auth-side form-side">
                    <h2 className="auth-title">ECOPOINT</h2>
                    <p className="auth-subtitle">Welcome Back!</p>

                    <form onSubmit={handleLogin} style={{width: '100%'}}>
                        <div className="form-group">
                            <input type="text" className="custom-input" placeholder="Username" 
                                value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <input type="password" className="custom-input" placeholder="Password" 
                                value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <div className="forgot-password" onClick={handleForgotPassword}>Forgot Password?</div>
                        <button type="submit" className="btn-green">LOGIN</button>
                    </form>

                    <p className="footer-text">
                        Don't have an account? <span className="link-text" onClick={() => navigate('/register')}>Sign Up</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;