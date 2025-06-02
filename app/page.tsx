"use client";

import Script from 'next/script';

export default function Home() {
  const handleBookCall = () => {
    // Open Calendly popup
    if (typeof window !== 'undefined' && (window as any).Calendly) {
      (window as any).Calendly.initPopupWidget({
        url: 'https://calendly.com/shahparacha/30min'
      });
    }
  };

  const scrollToFeatures = () => {
    const element = document.getElementById('how-it-works');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Calendly CSS */}
      <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />

      {/* Calendly Script */}
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-[var(--off-white)]">
        {/* Hero Section */}
        <section className="relative w-full min-h-[600px] flex items-center justify-center overflow-hidden bg-gray-900">
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
            onError={(e) => console.error('Video failed to load:', e)}
            onLoadedData={() => console.log('Video loaded successfully')}
          >
            <source src="/construction-site-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Overlay for better text readability - TEMPORARILY DISABLED FOR DEBUGGING */}
          {/* <div className="absolute inset-0 bg-black bg-opacity-60 z-10" /> */}

          {/* Hero Content */}
          <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6"
              style={{
                textShadow: `
                    0 0 20px rgba(0, 0, 0, 0.8),
                    0 0 40px rgba(0, 0, 0, 0.6),
                    2px 2px 4px rgba(0, 0, 0, 0.9),
                    -2px -2px 4px rgba(0, 0, 0, 0.9)
                  `
              }}>
              See every movement. Cut every risk.
            </h1>
            <h2 className="text-xl md:text-2xl mb-8 font-light text-gray-100"
              style={{
                textShadow: `
                    0 0 15px rgba(0, 0, 0, 0.8),
                    2px 2px 3px rgba(0, 0, 0, 0.9),
                    -2px -2px 3px rgba(0, 0, 0, 0.9)
                  `
              }}>
              Our rugged body-cams stream second-by-second motion data so stakeholders can create custom live reports, alerts & smarter risk management.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleBookCall}
                className="btn-neumorphic btn-primary text-white font-semibold py-3 px-8 rounded-lg"
              >
                Book a 30-min call
              </button>
              <button
                onClick={scrollToFeatures}
                className="bg-transparent border-2 border-white hover:bg-white hover:text-[var(--dark-gray)] text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
              >
                How it works
              </button>
            </div>
          </div>
        </section>

        {/* Product Showcase Section */}
        <section className="py-16 bg-[var(--white)]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Product Image */}
              <div className="order-2 lg:order-1">
                <div className="card-neumorphic p-8 rounded-2xl relative">
                  <img
                    src="/TimeprintGPTCamera.png"
                    alt="Timeprint GPT Camera"
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  {/* Silicon Valley Badge */}
                  <div className="absolute top-4 right-4 bg-[var(--terra-cotta)] text-white px-4 py-2 rounded-full shadow-lg transform rotate-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-bold">Silicon Valley AI</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-[var(--terra-cotta)]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a1 1 0 11-2 0V8a1 1 0 012 0v4zm3 1a1 1 0 01-1-1V8a1 1 0 012 0v4a1 1 0 01-1 1zm3 0a1 1 0 01-1-1V8a1 1 0 012 0v4a1 1 0 01-1 1z" />
                  </svg>
                  <span className="text-[var(--terra-cotta)] font-semibold uppercase tracking-wider text-sm">
                    Engineered in Silicon Valley
                  </span>
                </div>
                <h2 className="text-4xl font-bold mb-6 text-[var(--dark-gray)]">
                  Military-Grade AI Vision for Static and Dynamic Work Sites
                </h2>
                <p className="text-lg text-[var(--dark-gray)] mb-6 leading-relaxed">
                  The Timeprint GPT Camera combines rugged durability with cutting-edge AI to capture every movement, every moment, every milestone on your job site.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-[var(--terra-cotta)] bg-opacity-10 flex items-center justify-center flex-shrink-0 mr-4">
                      <svg className="w-6 h-6 text-[var(--terra-cotta)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--dark-gray)] mb-1">4G/LTE Real-Time Streaming</h3>
                      <p className="text-[var(--dark-gray)] opacity-75">Instant upload of HD footage with edge AI processing for immediate insights.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-[var(--terra-cotta)] bg-opacity-10 flex items-center justify-center flex-shrink-0 mr-4">
                      <svg className="w-6 h-6 text-[var(--terra-cotta)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--dark-gray)] mb-1">IP67 Weatherproof Design</h3>
                      <p className="text-[var(--dark-gray)] opacity-75">Built to withstand dust, rain, and extreme temperatures. Drop-tested for indoor and outdoor work environments.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-full bg-[var(--terra-cotta)] bg-opacity-10 flex items-center justify-center flex-shrink-0 mr-4">
                      <svg className="w-6 h-6 text-[var(--terra-cotta)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--dark-gray)] mb-1">12+ Hour Battery Life</h3>
                      <p className="text-[var(--dark-gray)] opacity-75">Full shift coverage with hot-swappable batteries. Never miss a critical moment.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 bg-[var(--white)]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-[var(--dark-gray)]">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Capture */}
              <div className="text-center card-neumorphic">
                <div className="w-20 h-20 mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[var(--terra-cotta)]">
                    <path d="M15 3L9 3C6.79086 3 5 4.79086 5 7V17C5 19.2091 6.79086 21 9 21H15C17.2091 21 19 19.2091 19 17V7C19 4.79086 17.2091 3 15 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="7" r="1" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 brand-text">Capture</h3>
                <p className="text-[var(--dark-gray)]">Rugged 4G/LTE body-cams record every motion in real time.</p>
              </div>

              {/* Analyze */}
              <div className="text-center card-neumorphic">
                <div className="w-20 h-20 mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[var(--terra-cotta)]">
                    <path d="M9 11L3 11M9 11C9 13.7614 11.2386 16 14 16M9 11C9 8.23858 11.2386 6 14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="14" cy="11" r="5" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 brand-text">Analyze</h3>
                <p className="text-[var(--dark-gray)]">On-device AI & cloud pipelines turn movement into structured events.</p>
              </div>

              {/* Act */}
              <div className="text-center card-neumorphic">
                <div className="w-20 h-20 mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[var(--terra-cotta)]">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M3 9H21" stroke="currentColor" strokeWidth="2" />
                    <path d="M9 9V21" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 15L15 12L12 18L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 brand-text">Act</h3>
                <p className="text-[var(--dark-gray)]">Dashboards, alerts & APIs let you slash incidents and delays.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits by Stakeholder Section */}
        <section className="py-16 bg-[var(--off-white)]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-[var(--dark-gray)]">Benefits by Stakeholder</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Owners & PMs */}
              <div className="card-neumorphic hover:transform hover:scale-105 transition-all duration-200">
                <h3 className="text-2xl font-semibold mb-4 brand-text">Owners & PMs</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[var(--accent-green)] mr-2">✓</span>
                    <span className="text-[var(--dark-gray)]">Lower re-work costs through real-time monitoring</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[var(--accent-green)] mr-2">✓</span>
                    <span className="text-[var(--dark-gray)]">Tighter schedules with instant progress tracking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[var(--accent-green)] mr-2">✓</span>
                    <span className="text-[var(--dark-gray)]">Reduced liability with comprehensive documentation</span>
                  </li>
                </ul>
              </div>

              {/* Insurance Carriers */}
              <div className="card-neumorphic hover:transform hover:scale-105 transition-all duration-200">
                <h3 className="text-2xl font-semibold mb-4 brand-text">Insurance Carriers</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[var(--accent-green)] mr-2">✓</span>
                    <span className="text-[var(--dark-gray)]">Granular risk data for precise underwriting</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[var(--accent-green)] mr-2">✓</span>
                    <span className="text-[var(--dark-gray)]">Dynamic premiums based on real behavior</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[var(--accent-green)] mr-2">✓</span>
                    <span className="text-[var(--dark-gray)]">Faster claims processing with video evidence</span>
                  </li>
                </ul>
              </div>

              {/* Lenders */}
              <div className="card-neumorphic hover:transform hover:scale-105 transition-all duration-200">
                <h3 className="text-2xl font-semibold mb-4 brand-text">Lenders</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[var(--accent-green)] mr-2">✓</span>
                    <span className="text-[var(--dark-gray)]">Progress-verified draws with visual proof</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[var(--accent-green)] mr-2">✓</span>
                    <span className="text-[var(--dark-gray)]">Reduced default risk through better oversight</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[var(--accent-green)] mr-2">✓</span>
                    <span className="text-[var(--dark-gray)]">Automated compliance monitoring</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 bg-[var(--terra-cotta)]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to transform your site intelligence?
            </h2>
            <button
              onClick={handleBookCall}
              className="btn-neumorphic bg-[var(--white)] text-[var(--terra-cotta)] hover:bg-[var(--off-white)] font-bold py-4 px-10 rounded-lg transition duration-200 text-lg"
            >
              Book a 30-min call
            </button>
          </div>
        </section>
      </div>
    </>
  );
}