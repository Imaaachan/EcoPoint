import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './DepositTrash.css'; 

const DepositTrash = () => {
    const navigate = useNavigate();
    
    const [flippedCard, setFlippedCard] = useState(null); 
    const [berat, setBerat] = useState('');
    const [trashOptions, setTrashOptions] = useState([]);
    const [loading, setLoading] = useState(true);

    // FETCH DATA
    useEffect(() => {
        fetch('https://untemptable-untediously-carole.ngrok-free.dev/api/transaction/waste-types')
            .then(res => res.json())
            .then(data => {
                setTrashOptions(data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    // Helper Icon
    const getTrashIcon = (typeName) => {
        const lower = typeName.toLowerCase();
        if (lower.includes('organik') && !lower.includes('anorganik')) return '🍂';
        if (lower.includes('anorganik')) return '🥤';
        if (lower.includes('elektronik')) return '🔌';
        if (lower.includes('kertas')) return '📄';
        if (lower.includes('kaca')) return '🍾';
        return '🗑️';
    };

    const handleFlip = (id) => {
        setFlippedCard(id); 
        setBerat(''); // Reset input saat ganti kartu
    };

    const handleCancel = (e) => {
        e.stopPropagation(); 
        setFlippedCard(null);
    };

    const handleSubmit = async (e, typeObj) => {
        e.preventDefault();
        const beratFloat = parseFloat(berat);
        
        if (!berat || isNaN(beratFloat) || beratFloat <= 0) {
            Swal.fire({ icon: 'warning', title: 'Invalid Weight', text: 'Enter valid weight!' });
            return;
        }

        const userStorage = JSON.parse(localStorage.getItem('user'));
        
        try {
            const response = await fetch('https://untemptable-untediously-carole.ngrok-free.dev/api/transaction/deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userStorage.id,
                    jenisSampah: typeObj.jenis,
                    berat: beratFloat
                }),
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `Submitted ${beratFloat}kg of ${typeObj.jenis}`,
                    confirmButtonColor: '#1B5E20'
                })//.then(() => navigate('/home'));
            } else {
                Swal.fire({ icon: 'error', title: 'Failed', text: 'Server error' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Connection failed' });
        }
    };

    return (
        <div className="deposit-container">
            <div className="deposit-bg"></div>
            
            <div className="deposit-navbar">
                <h2 style={{fontWeight:'800', fontSize:'24px', cursor:'pointer'}} onClick={() => navigate('/home')}>EcoPoint</h2>
                <div className="nav-right">
                    {/* <span onClick={() => navigate('/dashboard')}>Dashboard</span> */}
                    <span onClick={() => navigate('/home')}>Home</span>
                </div>
            </div>

            <div className="content-wrapper">
                <h1 className="page-title">Choose Waste Type</h1>
                
                {loading ? <p style={{color:'white'}}>Loading...</p> : (
                    <div className="cards-wrapper">
                        {trashOptions.map((item) => {
                            // --- LOGIKA HITUNG POIN REALTIME DI SINI ---
                            // Hitung poin cuma kalau input berat ada isinya dan valid
                            const estPoints = berat && !isNaN(berat) 
                                ? Math.floor(parseFloat(berat) * item.poinPerKg) 
                                : 0;

                            return (
                                <div key={item.id} className="card-scene">
                                    <div className={`card ${flippedCard === item.id ? 'is-flipped' : ''}`}>
                                        
                                        {/* DEPAN */}
                                        <div className="card-face card-face--front">
                                            <div className="card-icon-circle">
                                                <span style={{fontSize:'40px'}}>{getTrashIcon(item.jenis)}</span>
                                            </div>
                                            <h3 className="card-title-green">{item.jenis}</h3>
                                            <div className="card-divider"></div>
                                            <p className="card-rate">{item.poinPerKg} Poin/KG</p>
                                            <button className="btn-add-trash" onClick={() => handleFlip(item.id)}>
                                                + Add Trash
                                            </button>
                                        </div>

                                        {/* BELAKANG */}
                                        <div className="card-face card-face--back">
                                            <h3 style={{color:'#1B5E20', marginBottom:'15px', fontSize:'18px'}}>
                                                Input Weight (KG)
                                            </h3>
                                            
                                            {/* Input Group */}
                                            <div className="weight-input-group">
                                                <input 
                                                    type="number" step="0.1" min="0.1" placeholder="0.0"
                                                    className="weight-input"
                                                    value={berat}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => setBerat(e.target.value)}
                                                    autoFocus={flippedCard === item.id}
                                                />
                                            </div>

                                            {/* --- ESTIMASI POIN --- */}
                                            <div className="est-points-badge">
                                                Est. Points: +{estPoints} Pts
                                            </div>

                                            {/* Tombol Action */}
                                            <div className="action-buttons">
                                                <button className="btn-cancel" onClick={handleCancel}>
                                                    Cancel
                                                </button>
                                                <button className="btn-submit" onClick={(e) => handleSubmit(e, item)}>
                                                    Confirm
                                                </button>
                                            </div>
                                        </div>

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

export default DepositTrash;