import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaMinus, FaPlus, FaTimes } from 'react-icons/fa'; // Icon biar rapi
import './GiftCatalogue.css';

const RedeemMoney = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // --- SETUP USER & STATE ---
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    const [user, setUser] = useState({
        id: location.state?.user?.id || storedUser.id || null,
        nama: location.state?.user?.nama || storedUser.nama || 'Guest',
        poin: 0 
    });

    const [cashRewards, setCashRewards] = useState([]); 
    const [quantities, setQuantities] = useState({});   
    const [loading, setLoading] = useState(true);

    // --- FETCH DATA ---
    useEffect(() => {
        if (user.id) {
            fetch(`https://untemptable-untediously-carole.ngrok-free.dev/api/users/${user.id}/stats`)
                .then(res => res.json())
                .then(stats => setUser(prev => ({ ...prev, poin: stats.poin })))
                .catch(err => console.error(err));
        }

        fetch('https://untemptable-untediously-carole.ngrok-free.dev/api/transaction/cash-rewards')
            .then(res => res.json())
            .then(data => {
                setCashRewards(data);
                // Set default qty 1
                const initialQty = {};
                data.forEach(item => initialQty[item.id] = 1);
                setQuantities(initialQty);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, [user.id]);

    // --- LOGIC KUANTITAS ---
    const handleQtyChange = (id, delta) => {
        setQuantities(prev => {
            const current = prev[id] || 1;
            const newValue = current + delta;
            if (newValue < 1 || newValue > 50) return prev; // Limit 1-50
            return { ...prev, [id]: newValue };
        });
    };

    const handleCancelItem = (id) => {
        setQuantities(prev => ({ ...prev, [id]: 1 })); // Reset ke 1
    };

    // --- LOGIC REDEEM ---
    const handleRedeem = async (item) => {
        const qty = quantities[item.id] || 1;
        const unitCost = parseInt(item.poinDibutuhkan);
        const totalCost = unitCost * qty;

        if (user.poin < totalCost) {
            Swal.fire({
                icon: 'info',
                title: "Insufficient Points",
                text: `You need ${totalCost.toLocaleString()} pts. Current: ${user.poin.toLocaleString()}`,
                confirmButtonColor: '#4CAF50'
            });
            return;
        }

        const confirm = await Swal.fire({
            title: 'Confirm Cash Redeem?',
            html: `
                Redeem <b>${qty}x</b> ${item.namaHadiah}<br/>
                Total: <b style="color:#d32f2f">-${totalCost.toLocaleString()} Pts</b>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1B5E20',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Proceed!'
        });

        if (!confirm.isConfirmed) return;

        try {
            const response = await fetch('https://untemptable-untediously-carole.ngrok-free.dev/api/transaction/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    pointsDeducted: totalCost, 
                    description: `${item.namaHadiah} (x${qty}) via Transfer` 
                }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(prev => ({ ...prev, poin: updatedUser.poin })); 

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `Redeemed ${qty}x ${item.namaHadiah}. Check your e-wallet.`,
                    confirmButtonColor: '#4CAF50'
                });
                setQuantities(prev => ({ ...prev, [item.id]: 1 })); // Reset
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
                <h2 style={{cursor:'pointer'}} onClick={() => navigate('/home')}>EcoPoint</h2>
                <div className="nav-right">
                    <span onClick={() => navigate('/home')}>Home</span>
                    <span onClick={() => navigate('/contact')}>Contact Us</span>
                    <span onClick={() => navigate('/faq')}>FAQ</span>
                </div>
            </div>

            <div className="gift-bg"></div>

            <div className="gift-content">
                <div className="nav-back-simple" onClick={() => navigate('/gift', { state: { user } })}>Back to Catalogue</div>
                
                <h1 className="page-title">Redeem Cash</h1>
                <div className="points-subtitle">Your Eco-Points: {user.poin.toLocaleString()}</div>

                {loading ? <p style={{color:'white', textAlign:'center'}}>Loading...</p> : (
                    <div className="voucher-grid">
                        {cashRewards.map(item => {
                            const qty = quantities[item.id] || 1;
                            const unitCost = parseInt(item.poinDibutuhkan);
                            const totalCost = unitCost * qty;

                            return (
                                /* GUNAKAN CLASS SAMA DENGAN VOUCHER: 'voucher-card' */
                                <div key={item.id} className="voucher-card money-card-fixed">
                                    
                                    {/* 1. Header (Mirip Voucher) */}
                                    <div className="voucher-title">{item.namaHadiah}</div>
                                    <div className="voucher-desc">Transferred via Bank/E-Wallet</div>

                                    {/* 2. Control Kuantitas (Pengganti Kode Voucher) */}
                                    <div className="qty-wrapper">
                                        <button className="btn-qty" onClick={() => handleQtyChange(item.id, -1)}>
                                            <FaMinus size={10}/>
                                        </button>
                                        <span className="qty-value">{qty}</span>
                                        <button className="btn-qty" onClick={() => handleQtyChange(item.id, 1)}>
                                            <FaPlus size={10}/>
                                        </button>
                                    </div>
                                    
                                    <div className="small-label">Total Cost:</div>

                                    {/* 3. Harga Poin Besar (Mirip Voucher) */}
                                    <div className="voucher-cost-large">
                                        {totalCost.toLocaleString()} Points
                                    </div>

                                    {/* 4. Action Buttons (Cancel & Redeem) */}
                                    <div className="money-actions">
                                        {/* Tombol Cancel Kecil Merah */}
                                        <button 
                                            className="btn-cancel-money" 
                                            onClick={() => handleCancelItem(item.id)}
                                            title="Reset Quantity"
                                        >
                                            <FaTimes />
                                        </button>
                                        
                                        {/* Tombol Redeem Hijau Lebar */}
                                        <button 
                                            className="btn-redeem-money" 
                                            onClick={() => handleRedeem(item)}
                                        >
                                            Redeem
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RedeemMoney;