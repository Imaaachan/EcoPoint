import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TransactionHistory.css';

const TransactionHistory = () => {
    const navigate = useNavigate();
    
    // PERBAIKAN: Prioritaskan ambil user dari LocalStorage, baru fallback ke default
    const getUser = () => {
        const stored = localStorage.getItem('user');
        if (stored) return JSON.parse(stored);
        return { nama: 'Guest', id: 0, poin: 0 };
    };

    const user = getUser();
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- FETCH DATA ---
    useEffect(() => {
        if (user.id !== 0) {
            // PERBAIKAN: Port 9090
            fetch(`http://localhost:9090/api/transaction/history/${user.id}`)
                .then(res => {
                    if (!res.ok) throw new Error("Gagal load data");
                    return res.json();
                })
                .then(data => {
                    // PERBAIKAN: Pastikan data yang masuk adalah ARRAY
                    if (Array.isArray(data)) {
                        setHistoryData(data);
                    } else {
                        setHistoryData([]); // Kalau error/objek, kosongkan saja biar ga crash
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching history:", err);
                    setHistoryData([]); // Set kosong saat error
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [user.id]);

    // --- FORMATTERS (Tetap sama) ---
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatTransactionDetails = (text, isDeposit) => {
        if (!text) return { title: isDeposit ? "Waste Deposit" : "Redemption", subtitle: "-" };
        
        if (text.startsWith("Setor")) {
            const parts = text.split(' '); 
            let type = parts.length > 1 ? parts[1] : 'Trash';
            if (type === 'Organik') type = 'Organic';
            if (type === 'Anorganik') type = 'Anorganic';
            return { title: "Waste Deposit", subtitle: `${type} Waste` };
        }
        if (text.startsWith("Redeem:")) {
            return { title: "Reward Redemption", subtitle: text.replace("Redeem: ", "") };
        }
        if (text.startsWith("Input Manual")) {
            return { title: "Manual Deposit", subtitle: "Verified by Officer" };
        }
        return { title: "Transaction", subtitle: text };
    };

    return (
        <div className="history-container">
            <div className="history-navbar">
                <h2 style={{cursor:'pointer'}} onClick={() => navigate('/home')}>EcoPoint</h2>
                <div className="nav-right">
                    <span onClick={() => navigate('/home')}>Home</span>
                    <span onClick={() => navigate('/faq')}>FAQ</span>
                </div>
            </div>

            <div className="history-bg"></div>

            <div className="history-content">
                <h1 className="page-title">Transaction History</h1>
                <p className="subtitle">Track your contributions and rewards</p>

                <div className="history-list-wrapper">
                    {loading ? (
                        <p style={{textAlign:'center'}}>Loading data...</p>
                    ) : historyData.length === 0 ? (
                        <div className="empty-state">
                            <h3>No transactions yet</h3>
                            <p>Start depositing trash to earn points!</p>
                        </div>
                    ) : (
                        // PERBAIKAN: Map aman karena sudah dicek Array di atas
                        historyData.map((item) => {
                            const isDeposit = item.totalPoin > 0; // Kalau poin positif = deposit
                            const typeClass = isDeposit ? 'type-deposit' : 'type-redeem';
                            const pointClass = isDeposit ? 'point-plus' : 'point-minus';
                            const iconSymbol = isDeposit ? '⬇️' : '⬆️';
                            const details = formatTransactionDetails(item.keterangan, isDeposit);

                            return (
                                <div key={item.id} className="history-card-detail">
                                    <div className="h-left">
                                        <div className={`h-icon-box ${typeClass}`}>{iconSymbol}</div>
                                        <div className="h-info">
                                            <h4>{details.title}</h4>
                                            <p style={{fontSize:'14px', fontWeight:'600', color:'#555', marginBottom:'2px'}}>
                                                {details.subtitle}
                                            </p>
                                            <p>{formatDate(item.tanggal)} • {formatTime(item.tanggal)} • {item.status}</p>
                                        </div>
                                    </div>
                                    <div className={`h-points ${pointClass}`}>
                                        {isDeposit ? '+' : ''}{item.totalPoin} Poin
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionHistory;