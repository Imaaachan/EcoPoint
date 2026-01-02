import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LandingPage.css';

// --- IMPORT GAMBAR ---
import logo from './Image/logoecopoint.png'; 
import heroBg from './Image/slideges2.png'; // Gambar Pantai

const LandingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Scroll otomatis jika ada request dari halaman lain
    useEffect(() => {
        if (location.state && location.state.scrollTo) {
            const sectionId = location.state.scrollTo;
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                window.history.replaceState({}, document.title);
            }
        }
    }, [location]);

    // Fungsi Scroll Menu
    const handleScroll = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="landing-container">
            
            {/* --- HERO SECTION (FULL SCREEN) --- */}
            {/* Navbar ada di dalam sini agar menyatu dengan background */}
            <div className="landing-hero-split">
                
                {/* NAVBAR */}
                <nav className="landing-navbar">
                    <div className="landing-logo">
                        <img src={logo} alt="EcoPoint" />
                        <span>EcoPoint</span>
                    </div>
                    <div className="landing-nav-right">
                        <ul className="landing-menu">
                            <li onClick={() => handleScroll('about')}>About Us</li>
                            <li onClick={() => handleScroll('service')}>Service</li>
                            <li onClick={() => handleScroll('contact')}>Contact Us</li>
                            <li onClick={() => navigate('/faq')}>FAQ</li>
                        </ul>
                        <button className="btn-get-account" onClick={() => navigate('/role-selection')}>
                            Get Account
                        </button>
                    </div>
                </nav>

                {/* KIRI: TEKS */}
                <div className="hero-left">
                    <div className="hero-logo-large">
                        <span style={{fontSize: '80px', color: '#4CAF50'}}>˖᯽ ݁˖</span>
                    </div>
                    <h1 className="hero-title">EcoPoint</h1>
                    <div className="hero-hashtag">#BERSAMA ECOPOINT KEREN</div>
                </div>

                {/* KANAN: GAMBAR DENGAN EFEK GELOMBANG */}
                <div 
                    className="hero-right" 
                    style={{ backgroundImage: `url(${heroBg})` }}
                >
                </div>
            </div>

            {/* --- SECTIONS DI BAWAHNYA (SCROLL) --- */}
            
            {/* ABOUT SECTION */}
            <section id="about" className="about-section">
                <h2 className="section-title-green">What is EcoPoint?</h2>
                <p className="about-desc">
                    EcoPoint is a digital waste bank management application designed to help the process
                    of recording, managing and tracking waste deposits more efficiently and transparently.
                </p>
            </section>

            {/* SERVICES SECTION */}
            <section id="service" className="service-section">
                <h2 className="section-title-white">Ecopoint Services</h2>
                <div className="service-cards-container">
                    <div className="service-card">
                        <div className="icon-circle">🌱</div>
                        <h3>Deposit Trash</h3>
                        <p>Easily deposit your sorted waste and start earning eco-points for a greener future</p>
                    </div>
                    <div className="service-card">
                        <div className="icon-circle">🧺</div>
                        <h3>Gift Catalogue</h3>
                        <p>Browse and redeem your hard-earned points for exciting rewards and eco-friendly items</p>
                    </div>
                    <div className="service-card">
                        <div className="icon-circle">💳</div>
                        <h3>Transaction History</h3>
                        <p>Track your recycling journey and monitor all your deposits and redemptions in one place</p>
                    </div>
                </div>
            </section>

            {/* CONTACT SECTION */}
            <section id="contact" className="contact-section">
                <h3 className="contact-title">CONTACT US</h3>
                <div className="contact-buttons">
                    <button className="btn-contact">📞 +62 8790-0998-8900</button>
                    <button className="btn-contact">✉️ ecopoint@gmail.com</button>
                    <button className="btn-contact">📷 @ecopoint_sampah</button>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;