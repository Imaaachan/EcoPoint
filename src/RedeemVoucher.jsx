import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './GiftCatalogue.css';

const RedeemVoucher = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Ambil data user awal, tapi poinnya mungkin basi (stale)
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    const [user, setUser] = useState({
        id: location.state?.user?.id || storedUser.id || null, // Prioritas ID
        nama: location.state?.user?.nama || storedUser.nama || 'Guest',
        poin: 0 // Mulai dari 0, nanti di-update useEffect
    });

    const [vouchers, setVouchers] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    // --- 1. FETCH DATA TERBARU SAAT HALAMAN DIBUKA ---
    useEffect(() => {
        if (user.id) {
            // Ambil Poin Real-time (yang sudah diperbaiki di backend)
            fetch(`http://localhost:9090/api/users/${user.id}/stats`)
                .then(res => res.json())
                .then(stats => {
                    console.log("Poin terbaru:", stats.poin); // Cek console browser
                    setUser(prev => ({ ...prev, poin: stats.poin }));
                })
                .catch(err => console.error(err));
        } else {
            console.warn("User ID missing, poin cannot be fetched.");
        }

        // B. Ambil Daftar Voucher dari Database Admin
        fetch('http://localhost:9090/api/transaction/vouchers')
            .then(res => res.json())
            .then(data => {
                setVouchers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Gagal ambil voucher:", err);
                setLoading(false);
            });
    }, [user.id]);

    const handleNavClick = (destination) => {
        if (destination === 'home') navigate('/home', { state: { user } });
        else if (destination === 'contact') navigate('/home', { state: { user, scrollTo: 'contact' } });
        else if (destination === 'faq') navigate('/faq', { state: { user } });
    };

const handleRedeem = async (item) => {
        // Konversi poinDibutuhkan (String) jadi Integer
        const cost = parseInt(item.poinDibutuhkan);

        // 1. Cek Saldo Dulu
        if (user.poin < cost) {
            Swal.fire({
                icon: 'info',
                title: "Let's collect more trash!",
                text: `You need ${cost.toLocaleString()} points. Current: ${user.poin.toLocaleString()}`,
                confirmButtonColor: '#4CAF50'
            });
            return;
        }

        // 2. TAMBAHAN: Konfirmasi Sebelum Redeem
        const confirmResult = await Swal.fire({
            title: 'Are you sure?',
            html: `
                You will redeem <b>${item.namaHadiah}</b><br/>
                for <b style="color:#d32f2f">${cost.toLocaleString()} Points</b>.
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1B5E20', // Hijau
            cancelButtonColor: '#d33',    // Merah
            confirmButtonText: 'Yes, Redeem!',
            cancelButtonText: 'Cancel'
        });

        // Kalau user klik Cancel atau klik di luar, berhenti di sini
        if (!confirmResult.isConfirmed) return;

        // 3. Proses Redeem ke Backend (Hanya jalan kalau Yes)
        try {
            const response = await fetch('http://localhost:9090/api/transaction/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    pointsDeducted: cost,
                    description: `Redeem Voucher: ${item.namaHadiah}`
                }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                
                // Update poin langsung di layar setelah redeem
                setUser(prev => ({ ...prev, poin: updatedUser.poin }));

                Swal.fire({
                    icon: 'success',
                    title: 'Redeemed Successfully!',
                    html: `You got <b>${item.namaHadiah}</b>.<br/>Code: <b style="font-size:18px; color:#1B5E20">${item.kodeVoucher}</b>`,
                    confirmButtonColor: '#4CAF50'
                });
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Connection failed' });
        }
    };
    
    return (
        <div className="gift-container">
            <div className="gift-navbar">
                <h2 style={{cursor:'pointer'}} onClick={() => handleNavClick('home')}>EcoPoint</h2>
                <div className="nav-right">
                    <span onClick={() => handleNavClick('home')}>Home</span>
                    <span onClick={() => handleNavClick('contact')}>Contact Us</span>
                    <span onClick={() => handleNavClick('faq')}>FAQ</span>
                </div>
            </div>

            <div className="gift-bg"></div>

            <div className="gift-content">
                <div className="nav-back-simple" onClick={() => navigate('/gift', { state: { user } })}>Back to Catalogue</div>
                
                <h1 className="page-title">Voucher Catalogue</h1>
                {/* Poin di sini sekarang pasti 5300 (sesuai DB) */}
                <div className="points-subtitle">Your Eco-Points: {user.poin}</div>

                {loading ? <p style={{color:'white', textAlign:'center'}}>Loading Vouchers...</p> : (
                    <div className="voucher-grid">
                        {vouchers.map(v => (
                            <div key={v.id} className="voucher-card">
                                <div>
                                    {/* Sesuaikan nama field dengan Model Hadiah kamu */}
                                    <div className="voucher-title">{v.namaHadiah}</div>
                                    <div className="voucher-desc">
                                        {v.deskripsi && v.deskripsi !== 'NULL' && v.deskripsi !== 'EMPTY' ? v.deskripsi : 'Digital Voucher'}
                                    </div>
                                    <span style={{fontSize:'12px', background:'#eee', padding:'2px 8px', borderRadius:'10px', color:'#333', marginTop:'5px', display:'inline-block'}}>
                                        {v.kodeVoucher}
                                    </span>
                                </div>
                                <div>
                                    <div className="voucher-cost">{parseInt(v.poinDibutuhkan).toLocaleString()} Points</div>
                                    <button className="btn-redeem-voucher" onClick={() => handleRedeem(v)}>
                                        Redeem
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RedeemVoucher;