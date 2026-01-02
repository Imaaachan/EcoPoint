import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import './Auth.css';

// --- IMPORT GAMBAR ---
// Pastikan file ini ada di folder src/Image/
import registerImage from './Image/image_5.png'; 

const Register = () => {
    const [formData, setFormData] = useState({
        nama: '',
        username: '',
        email: '',
        password: '',
        phone: '', // Tambahkan phone untuk dikirim sebagai noTelepon
        role: 'warga' 
    });
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if(!formData.nama || !formData.username || !formData.email || !formData.password) {
            Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Harap isi semua kolom!', confirmButtonColor: '#4CAF50' });
            return;
        }

        // Mapping Data untuk Backend
        const payload = {
            nama: formData.nama,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            noTelepon: formData.phone, // Backend Java minta noTelepon
            role: "warga"
        };

        try {
            const response = await fetch('https://untemptable-untediously-carole.ngrok-free.dev/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            // Handle Response Text/JSON
            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Registrasi Berhasil!',
                    text: 'Akun Anda telah dibuat. Silakan login.',
                    confirmButtonColor: '#4CAF50',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/login'); 
                });
            } else {
                // Tampilkan pesan error dari backend
                const errMsg = typeof data === 'object' ? JSON.stringify(data) : data;
                Swal.fire({ icon: 'error', title: 'Gagal Daftar', text: errMsg, confirmButtonColor: '#d33' });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({ icon: 'error', title: 'Server Error', text: 'Tidak dapat menghubungi server backend.' });
        }
    };

    // const handleGoogleSignUp = () => {
    //     Swal.fire({ icon: 'info', title: 'Info', text: 'Fitur Google Login belum tersedia.', confirmButtonColor: '#4CAF50' });
    // };

    return (
        <div 
            className="auth-container"
            // BACKGROUND IMAGE DIKEMBALIKAN DI SINI
            style={{ backgroundImage: `url(${registerImage})` }} 
        >
            <div className="auth-card">
                
                {/* BAGIAN KIRI: FORM */}
                <div className="auth-side form-side">
                    <h2 className="auth-title">ECOPOINT</h2>
                    <p className="auth-subtitle">Create your account</p>

                    <form onSubmit={handleRegister} style={{width: '100%'}}>
                        <div className="form-group">
                            <input type="text" name="nama" className="custom-input" placeholder="Full Name" onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <input type="text" name="username" className="custom-input" placeholder="Username" onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <input type="email" name="email" className="custom-input" placeholder="Email Address" onChange={handleChange} />
                        </div>
                        {/* Tambahan input Phone agar backend tidak error null */}
                        <div className="form-group">
                            <input type="text" name="phone" className="custom-input" placeholder="Phone Number" onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <input type="password" name="password" className="custom-input" placeholder="Password" onChange={handleChange} />
                        </div>

                        <button type="submit" className="btn-green">SIGN UP →</button>
                        {/* <div className="divider">or</div>
                        <button type="button" className="btn-google" onClick={handleGoogleSignUp}>
                            <span style={{marginRight: '10px'}}>G</span> Sign Up With Google
                        </button> */}
                    </form>

                    <div className="footer-text" style={{marginTop: '15px'}}>
                        Already have an account? <span className="link-text" onClick={() => navigate('/login')}>Login</span>
                    </div>
                </div>

                {/* BAGIAN KANAN: GAMBAR */}
                <div className="auth-side image-side">
                     <img src={registerImage} alt="Eco Background" />
                </div>
            </div>
        </div>
    );
};

export default Register;