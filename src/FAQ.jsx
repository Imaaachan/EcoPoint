import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './FAQ.css';

const FAQ = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeIndex, setActiveIndex] = useState(null);

    // 1. CEK STATUS USER
    // Ambil data user yang dikirim dari halaman sebelumnya (bisa dari Home atau Landing)
    const user = location.state?.user;

    // 2. TENTUKAN TUJUAN PULANG
    // Kalau ada user (Login) -> Pulang ke '/home'
    // Kalau tidak ada (Tamu) -> Pulang ke '/'
    const targetPath = user ? '/home' : '/';

    // Fungsi Navigasi Pintar
    const handleNavigation = (destination) => {
        if (destination === 'home') {
            // Balik ke Home/Landing bawa data user lagi (biar sesi tidak hilang)
            navigate(targetPath, { state: { user } });
        } else {
            // Balik ke Home/Landing + Scroll ke section tertentu
            navigate(targetPath, { 
                state: { 
                    user: user,       // Jangan lupa bawa user balik
                    scrollTo: destination 
                } 
            });
        }
    };

    // ... (Data FAQ dan fungsi toggle tetap sama) ...
    const faqData = [
        { question: "Di kota mana saja layanan ini tersedia?", answer: "Saat ini layanan EcoPoint tersedia di seluruh wilayah Jabodetabek." },
        { question: "Jenis sampah apa saja yang bisa disetor?", answer: "Organik, Anorganik, dan Residual." },
        { question: "Apakah ada berat minimum?", answer: "Tidak ada, namun lebih dari 5 kg mendapatkan penjemputan gratis." },
        { question: "Cara tukar poin?", answer: "Masuk ke menu Gift Catalogue di Dashboard." },
        { question: "Cara daftar?", answer: "Klik Sign Up di halaman utama." }
    ];

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="faq-container">
            <nav className="faq-navbar">
                <h2 className="faq-logo" onClick={() => handleNavigation('home')}>EcoPoint</h2>
                <div className="faq-nav-links">
                    {/* Menggunakan fungsi handleNavigation yang baru */}
                    <span onClick={() => handleNavigation('home')}>Home</span>
                    <span onClick={() => handleNavigation('service')}>Service</span>
                    <span onClick={() => handleNavigation('about')}>About Us</span>
                    <span onClick={() => handleNavigation('contact')}>Contact Us</span>
                    <span className="active">FAQ</span>
                </div>
            </nav>

            <div className="faq-content">
                <h1 className="faq-title">Frequently Asked Question</h1>
                <p className="faq-subtitle">
                    Have questions about EcoPoint? We summarize all the answers so you can contribute more easily to a better earth.
                </p>

                <div className="faq-box-green">
                    <h2 className="box-title">Top questions</h2>
                    <div className="faq-list">
                        {faqData.map((item, index) => (
                            <div key={index} className="faq-item">
                                <div className={`faq-question ${activeIndex === index ? 'active' : ''}`} onClick={() => toggleFAQ(index)}>
                                    {item.question}
                                    <span className="arrow-icon">{activeIndex === index ? '▲' : '▼'}</span>
                                </div>
                                <div className={`faq-answer ${activeIndex === index ? 'show' : ''}`}>
                                    <p>{item.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* <h2 className="contact-heading">More Questions? Contact Us</h2>
                <div className="contact-box-green">
                    <form className="contact-form">
                        <div className="form-row">
                            <div className="input-group">
                                <label>Full Name</label>
                                <input type="text" placeholder="Your Name" />
                            </div>
                            <div className="input-group">
                                <label>Email Address</label>
                                <input type="email" placeholder="email@address.com" />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Your Message</label>
                            <textarea placeholder="Write your question here..."></textarea>
                        </div>
                        <button type="submit" className="btn-send-message">Send Message</button>
                    </form>
                </div> */}
            </div>
        </div>
    );
};

export default FAQ;