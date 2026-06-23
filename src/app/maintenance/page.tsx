import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ثروة | الموقع تحت الصيانة',
  description: 'نعمل على تحسين منصة ثروة. سنعود قريبًا.',
};

export default function MaintenancePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .maintenance-root {
          min-height: 100vh;
          background: #0a0e1a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          overflow: hidden;
          position: relative;
        }

        /* Animated background orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          animation: float 8s ease-in-out infinite;
        }
        .orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #6c63ff, transparent);
          top: -150px; right: -100px;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #00d4aa, transparent);
          bottom: -100px; left: -80px;
          animation-delay: 3s;
        }
        .orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #ff6b6b, transparent);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 1.5s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }

        /* Grid overlay */
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(108, 99, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108, 99, 255, 0.05) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .card {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 60px 50px;
          max-width: 600px;
          width: 90%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(108, 99, 255, 0.1),
            0 40px 80px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255,255,255,0.05);
          animation: fadeInUp 0.8s ease forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Gear icon */
        .gear-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }

        .gear-ring {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(108, 99, 255, 0.2), rgba(0, 212, 170, 0.2));
          border: 2px solid rgba(108, 99, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: pulse-ring 2s ease-in-out infinite;
        }

        .gear-ring::before {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 1px solid rgba(108, 99, 255, 0.15);
          animation: pulse-ring 2s ease-in-out infinite 0.5s;
        }

        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(108, 99, 255, 0.3); }
          50% { box-shadow: 0 0 0 12px rgba(108, 99, 255, 0); }
        }

        .gear-svg {
          width: 52px;
          height: 52px;
          animation: spin 6s linear infinite;
          fill: #6c63ff;
          filter: drop-shadow(0 0 12px rgba(108, 99, 255, 0.5));
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* Badge */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: rgba(108, 99, 255, 0.15);
          border: 1px solid rgba(108, 99, 255, 0.3);
          border-radius: 100px;
          color: #a78bfa;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
          letter-spacing: 0.5px;
        }

        .badge-dot {
          width: 7px;
          height: 7px;
          background: #a78bfa;
          border-radius: 50%;
          animation: blink 1.5s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        .title {
          font-size: 36px;
          font-weight: 900;
          color: #fff;
          margin-bottom: 16px;
          line-height: 1.3;
          background: linear-gradient(135deg, #fff 40%, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 17px;
          color: #94a3b8;
          line-height: 1.8;
          margin-bottom: 40px;
        }

        /* Progress bar */
        .progress-section {
          margin-bottom: 40px;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: #64748b;
          margin-bottom: 10px;
        }

        .progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 100px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          width: 70%;
          background: linear-gradient(90deg, #6c63ff, #00d4aa);
          border-radius: 100px;
          animation: progress-glow 2s ease-in-out infinite;
          position: relative;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 40px; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5));
          animation: shimmer 2s linear infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(40px); }
          100% { transform: translateX(-200px); }
        }

        @keyframes progress-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(108, 99, 255, 0.4); }
          50% { box-shadow: 0 0 20px rgba(108, 99, 255, 0.7); }
        }

        /* Features list */
        .features {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 40px;
          text-align: right;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          color: #cbd5e1;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .feature-item:hover {
          background: rgba(108, 99, 255, 0.08);
          border-color: rgba(108, 99, 255, 0.2);
          transform: translateX(-4px);
        }

        .feature-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        /* Divider */
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          margin-bottom: 30px;
        }

        .footer-text {
          font-size: 13px;
          color: #475569;
        }

        .footer-text span {
          color: #6c63ff;
          font-weight: 600;
        }
      `}</style>

      <div className="maintenance-root">
        {/* Background */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-bg" />

        {/* Card */}
        <div className="card">
          {/* Gear Icon */}
          <div className="gear-wrapper">
            <div className="gear-ring">
              <svg className="gear-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.34.07-.68.07-1.08s-.03-.73-.07-1.08l2.32-1.8c.21-.16.27-.46.13-.7l-2.2-3.8c-.13-.25-.42-.33-.67-.25l-2.74 1.1c-.57-.44-1.18-.8-1.86-1.08L14.3 2.5c-.05-.27-.28-.5-.57-.5H9.27c-.29 0-.52.23-.57.5L8.34 5.37C7.66 5.65 7.05 6 6.48 6.45L3.74 5.35c-.25-.1-.54 0-.67.25L.87 9.4c-.14.24-.08.54.13.7l2.32 1.8C3.28 12.27 3.25 12.6 3.25 13s.03.72.07 1.07l-2.32 1.8c-.21.17-.27.46-.13.71l2.2 3.8c.13.24.42.33.67.24l2.74-1.1c.57.44 1.18.8 1.86 1.09l.36 2.87c.05.27.28.5.57.5h4.46c.29 0 .52-.23.57-.5l.36-2.87c.68-.28 1.29-.65 1.86-1.09l2.74 1.1c.25.09.54 0 .67-.24l2.2-3.8c.14-.25.08-.54-.13-.71l-2.32-1.8z"/>
              </svg>
            </div>
          </div>

          {/* Badge */}
          <div className="badge">
            <span className="badge-dot" />
            جارٍ الصيانة
          </div>

          {/* Title */}
          <h1 className="title">الموقع تحت الصيانة مؤقتًا</h1>

          {/* Subtitle */}
          <p className="subtitle">
            نعمل على تحسين منصة <strong style={{color: '#a78bfa'}}>ثروة</strong> لتقديم تجربة أفضل لك.<br />
            سنعود قريبًا وبكامل قوتنا!
          </p>

          {/* Progress */}
          <div className="progress-section">
            <div className="progress-label">
              <span>جارٍ التحديث...</span>
              <span>70%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" />
            </div>
          </div>

          {/* Features */}
          <div className="features">
            <div className="feature-item">
              <span className="feature-icon flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              تحسين الأداء والسرعة
            </div>
            <div className="feature-item">
              <span className="feature-icon flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              تعزيز الأمان وحماية البيانات
            </div>
            <div className="feature-item">
              <span className="feature-icon flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </span>
              إضافة ميزات جديدة مميزة
            </div>
          </div>

          <div className="divider" />

          <p className="footer-text">
            شكرًا لصبرك — فريق <span>ثروة</span>
          </p>
        </div>
      </div>
    </>
  );
}
