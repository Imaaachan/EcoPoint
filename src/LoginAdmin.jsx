import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Auth.css'; // Menggunakan style yang sama dengan user login

// Import gambar background (Gunakan gambar yang sama agar konsisten)
import adminBg from './Image/image_5.png'; 

const AdminLogin = () => {
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
            // Menggunakan endpoint login yang sama
            const response = await fetch('https://untemptable-untediously-carole.ngrok-free.dev/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // <--- WAJIB ADA
                },
                body: JSON.stringify({
                    username: username, // pastikan variabel ini isinya 'admin'
                    password: password  // pastikan variabel ini isinya 'admin123'
                }),
            });

            if (response.ok) {
                const data = await response.json();

                // CEK ROLE: Hanya Admin yang boleh masuk
                if (data.role === 'admin') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Welcome Admin!',
                        text: `${data.nama}`,
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        // Arahkan ke Dashboard Admin
                        navigate('/admin-dashboard', { state: { user: data } });
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Access Denied',
                        text: 'This portal is for Admins only. Your role is: ' + data.role, // Debug role
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

    return (
        <div 
            className="auth-container" 
            style={{ backgroundImage: `url(${adminBg})` }} 
        >
            {/* Gunakan 'login-mode' agar layout sama dengan login user */}
            <div className="auth-card login-mode">
                
                {/* Gambar Kiri */}
                <div className="auth-side image-side">
                    <img src={adminBg} alt="Admin Background" />
                </div>

                {/* Form Kanan */}
                <div className="auth-side form-side">
                    {/* Judul Khusus Admin */}
                    <h2 className="auth-title" style={{ color: '#0E3D28' }}>ADMIN PORTAL</h2>
                    <p className="auth-subtitle">Login to manage EcoPoint System</p>

                    <form onSubmit={handleLogin} style={{width: '100%'}}>
                        <div className="form-group">
                            <input 
                                type="text" className="custom-input" placeholder="Admin Username" 
                                value={username} onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input 
                                type="password" className="custom-input" placeholder="Password" 
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn-green" style={{backgroundColor: '#0E3D28'}}>
                            LOGIN AS ADMIN
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

export default AdminLogin;