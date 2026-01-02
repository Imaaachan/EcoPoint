import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './GiftCatalogue.css';

const GiftCatalogue = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.user || { nama: 'Guest', poin: 0 };

    // Navigasi Navbar (Sama seperti Deposit Trash)
    const handleNavClick = (destination) => {
        if (destination === 'home') navigate('/home', { state: { user } });
        else if (destination === 'contact') navigate('/home', { state: { user, scrollTo: 'contact' } });
        else if (destination === 'faq') navigate('/faq', { state: { user } });
    };

    return (
        <div className="gift-container">
            {/* Navbar Transparan */}
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
                <h1 className="page-title">Choose Your Reward</h1>
                <div className="points-subtitle">Your Eco-Points: {user.poin}</div>

                <div className="catalogue-grid">
                    {/* MENU 1: MONEY */}
                    <div className="catalogue-card" onClick={() => navigate('/redeem-money', { state: { user } })}>
                        <span className="cat-icon">💸</span>
                        <div className="cat-title">Redeem Cash</div>
                        <button className="btn-action">Select</button>
                    </div>

                    {/* MENU 2: VOUCHER */}
                    <div className="catalogue-card" onClick={() => navigate('/redeem-voucher', { state: { user } })}>
                        <span className="cat-icon">🎟️</span>
                        <div className="cat-title">Browse Voucher</div>
                        <button className="btn-action">Select</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GiftCatalogue;