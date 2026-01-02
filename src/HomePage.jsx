import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HomePage.css';

// --- IMPORT GAMBAR ASET ---
import logo from './Image/logoecopoint.png';
import slide1 from './Image/slideges1.png';
import slide2 from './Image/slideges2.png';
import slide3 from './Image/slideges3.png';
import slide4 from './Image/slideges4.png';
import bgServices from './Image/BGservices.png';
import iconDeposit from './Image/deposit.png';
import iconGift from './Image/giftcatalogue.png';
import iconHistory from './Image/transhis.png';
import truckImage from './Image/truck.png';
import logoRunning from './Image/logorunningtext.png';
import bgStats from './Image/BGsectpoint.png';

const HomePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 1. Ambil User dari LocalStorage (Lebih aman daripada location.state)
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    // Fallback ke location.state kalau localStorage kosong (jarang terjadi)
    const user = storedUser.id ? storedUser : (location.state?.user || { nama: 'Guest' });

    // 2. State untuk Data Realtime (Poin & Transaksi)
    const [stats, setStats] = useState({
        poin: 0,
        transactionCount: 0
    });

    // --- FETCH DATA TERBARU DARI BACKEND ---
    useEffect(() => {
        if (user.id) {
            fetch(`http://localhost:9090/api/users/${user.id}/stats`)
                .then(res => {
                    if(res.ok) return res.json();
                    throw new Error("Gagal ambil data");
                })
                .then(data => {
                    setStats({
                        poin: data.poin,
                        transactionCount: data.transactionCount
                    });
                })
                .catch(err => console.log("Belum ada data stats:", err));
        }
    }, [user.id]);


    // --- LOGIC SCROLL OTOMATIS (DARI FAQ) ---
    useEffect(() => {
        if (location.state && location.state.scrollTo) {
            const sectionId = location.state.scrollTo;
            const element = document.getElementById(sectionId);
            
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
                window.history.replaceState({ ...location.state, scrollTo: null }, document.title);
            }
        }
    }, [location]);

    // --- LOGIC SLIDER ---
    const [currentSlide, setCurrentSlide] = useState(0);
    const slidesData = [
        { image: slide1, title: "Keep the world", subtitle: "clean and green" },
        { image: slide2, title: "Agriculture Matter", subtitle: "Good production" },
        { image: slide3, title: "Advanced Recycling", subtitle: "Technology for a Sustainable Future" },
        { image: slide4, title: "Reducing Plastic Pollution,", subtitle: "Protecting Our Oceans" }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev === slidesData.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [slidesData.length]);

    const goToSlide = (index) => setCurrentSlide(index);

    // --- NAVIGASI NAVBAR ---
    const handleNavClick = (destination) => {
        if (destination === 'profile') {
            navigate('/profile'); 
        } else if (destination === 'faq') {
            navigate('/faq'); 
        } else {
            const element = document.getElementById(destination);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    // --- NAVIGASI SERVICE CARD ---
    const handleServiceClick = (serviceType) => {
        if (!user.id) {
            alert("Silakan login terlebih dahulu!");
            navigate('/login');
            return;
        }

        if (serviceType === 'deposit') navigate('/deposit');
        else if (serviceType === 'gift') navigate('/gift');
        else if (serviceType === 'history') navigate('/history');
        else alert('Fitur ini akan segera hadir!');
    };

    return (
        <div className="homepage-container">
            
            {/* --- NAVBAR --- */}
            <nav className="home-navbar">
                <div className="nav-logo">
                    <img src={logo} alt="EcoPoint" />
                    <span>EcoPoint</span>
                </div>
                <ul className="nav-menu">
                    <li onClick={() => handleNavClick('profile')}>Profile</li>
                    <li onClick={() => handleNavClick('service')}>Service</li>
                    <li onClick={() => handleNavClick('point')}>Point</li>
                    <li onClick={() => handleNavClick('contact')}>Contact Us</li>
                    <li onClick={() => handleNavClick('faq')}>FAQ</li>
                </ul>
            </nav>

            {/* --- HERO SLIDER --- */}
            <header className="hero-slider" id="home">
                <div 
                    className="slider-bg" 
                    style={{ backgroundImage: `url(${slidesData[currentSlide].image})` }}
                ></div>
                <div className="overlay"></div>

                <div className="hero-content-home">
                    <h2 className="welcome-text">Welcome, {user.nama}</h2>
                    <h1 className="slogan-text">
                        {slidesData[currentSlide].title} <br />
                        {slidesData[currentSlide].subtitle}
                    </h1>
                </div>

                <div className="slider-dots">
                    {slidesData.map((_, index) => (
                        <div 
                            key={index} 
                            className={`dot ${currentSlide === index ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                        ></div>
                    ))}
                </div>
            </header>

            {/* --- SERVICES MENU (ID: service) --- */}
            <section className="services-menu-container" id="service">
                <div className="services-box" style={{ backgroundImage: `url(${bgServices})`, backgroundSize: 'cover' }}>
                    
                    <div className="service-item" onClick={() => handleServiceClick('deposit')}>
                        <div className="service-icon-img"><img src={iconDeposit} alt="Deposit" /></div>
                        <h3>Deposit Trash</h3>
                    </div>

                    <div className="service-item" onClick={() => handleServiceClick('gift')}>
                        <div className="service-icon-img"><img src={iconGift} alt="Gift" /></div>
                        <h3>Gift Catalogue</h3>
                    </div>
                    <div className="service-item" onClick={() => handleServiceClick('history')}>
                        <div className="service-icon-img"><img src={iconHistory} alt="History" /></div>
                        <h3>Transaction History</h3>
                    </div>
                </div>
            </section>

            {/* --- INFO SECTION (ID: about) --- */}
            <section className="info-section" id="about">
                <div className="info-image">
                    <img src={truckImage} alt="Garbage Truck" />
                </div>
                <div className="info-text">
                    <ul>
                        <li>✅ Deliver efficient, eco-friendly waste collection, recycling, and disposal services.</li>
                        <li>✅ Promote sustainability through waste reduction, reuse, and recycling initiatives.</li>
                        <li>✅ Ensure compliance with environmental regulations and best industry practices.</li>
                        <li>✅ Educate communities on responsible waste management and environmental stewardship.</li>
                        <li>✅ Utilize advanced technology to enhance waste management efficiency and sustainability.</li>
                    </ul>
                </div>
            </section>

            {/* --- MARQUEE --- */}
            <div className="green-marquee">
                <div className="marquee-content">
                    {[...Array(5)].map((_, i) => (
                        <React.Fragment key={`set1-${i}`}>
                            <span><img src={logoRunning} alt="icon" className="run-icon"/> Organic Waste</span>
                            <span><img src={logoRunning} alt="icon" className="run-icon"/> Unorganic Waste</span>
                            <span><img src={logoRunning} alt="icon" className="run-icon"/> Point</span>
                            <span><img src={logoRunning} alt="icon" className="run-icon"/> Waste Collection</span>
                            <span><img src={logoRunning} alt="icon" className="run-icon"/> Gift Catalog</span>
                        </React.Fragment>
                    ))}
                    {[...Array(5)].map((_, i) => (
                        <React.Fragment key={`set2-${i}`}>
                            <span><img src={logoRunning} alt="icon" className="run-icon"/> Organic Waste</span>
                            <span><img src={logoRunning} alt="icon" className="run-icon"/> Unorganic Waste</span>
                            <span><img src={logoRunning} alt="icon" className="run-icon"/> Point</span>
                            <span><img src={logoRunning} alt="icon" className="run-icon"/> Waste Collection</span>
                            <span><img src={logoRunning} alt="icon" className="run-icon"/> Gift Catalog</span>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* --- STATS SECTION (ID: point) --- */}
            <section 
                className="stats-section" 
                id="point" 
                style={{ backgroundImage: `url(${bgStats})`, backgroundSize: 'cover' }}
            >
                <h2 className="stats-title">Recycle for a better future</h2>
                <div className="line-divider"></div>
                
                <div className="stats-container">
                    <div className="stat-box">
                        <span className="stat-label">POINT</span>
                        {/* UPDATE: Pakai state stats.poin */}
                        <h1 className="stat-number">{stats.poin}</h1> 
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">TRANSACTION</span>
                        {/* UPDATE: Pakai state stats.transactionCount */}
                        <h1 className="stat-number">{stats.transactionCount}</h1>
                    </div>
                </div>

                <div className="leaf-decoration-left">🌿</div>
                <div className="leaf-decoration-right">🌿</div>
            </section>

            {/* --- CONTACT SECTION (ID: contact) --- */}
            <section id="contact" className="home-contact-section">
                <h3 className="contact-title">CONTACT US</h3>
                <div className="contact-buttons">
                    <a href="https://www.linkedin.com/in/benedict-brian-joel-purba-a6b108292/"target='blank' className="btn-contact">📞 +62 8790-0998-8900</a>
                    <button className="btn-contact">✉️ ecopoint@gmail.com</button>
                    <button className="btn-contact">📷 @ecopoint_sampah</button>
                </div>
            </section>

        </div>
    );
};

export default HomePage;