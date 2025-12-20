import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteNavbar from '../components/layout/SiteNavbar';
import SiteFooter from '../components/layout/SiteFooter';
import HeroSection from '../components/landing/HeroSection';
import ServiceHighlights from '../components/landing/ServiceHighlights';
import AnnouncementTicker from '../components/landing/AnnouncementTicker';
import RateCalculator from '../components/landing/RateCalculator';
import OfficeLocator from '../components/landing/OfficeLocator';
import TrackParcel from '../components/track/TrackParcel';
import { fetchSiteContent, trackParcel } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [content, setContent] = useState({ services: [], offices: [], announcements: [], rateChart: [] });
  const [trackState, setTrackState] = useState({ result: null, error: null, loading: false });

  useEffect(() => {
    fetchSiteContent()
      .then((data) => setContent(data))
      .catch(() => {});
  }, []);

  const handleTrack = async (trackingId) => {
    setTrackState({ result: null, error: null, loading: true });
    try {
      const parcel = await trackParcel(trackingId);
      setTrackState({ result: parcel, error: null, loading: false });
    } catch (error) {
      setTrackState({
        result: null,
        error: error.response?.data?.message || 'Tracking ID not found',
        loading: false,
      });
    }
  };


  return (
    <div className="d-flex flex-column min-vh-100">
      <SiteNavbar />
      <HeroSection />
      <AnnouncementTicker items={content.announcements} />
      <main>
        <section id="about" className="container py-5">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <p className="text-uppercase small text-danger mb-2">About Dak Khana</p>
              <h2 className="fw-bold">From traditional dak to a digital-first experience</h2>
              <p className="text-muted">
                Dak Khana keeps the soul of India Post intact while upgrading every user journey with sleek UX, instant
                notifications, OTP-backed security, and one-click customer support.
              </p>
              <ul className="list-unstyled text-muted mb-0">
                <li>• 24x7 self-service dashboard for citizens & MSMEs</li>
                <li>• Integrated banking, insurance, and logistics journeys</li>
                <li>• Human support via 1.5L+ post offices & mobile vans</li>
              </ul>
            </div>
            <div className="col-lg-6">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h5 className="fw-semibold">Need help fast?</h5>
                  <p className="text-muted small">
                    Call +91 98765 43210 / email hello@dakkhana.in. We&apos;re online 9AM–9PM IST for pickups, address
                    changes, and policy clarifications.
                  </p>
                  <div className="d-flex gap-3 flex-wrap">
                    <div>
                      <p className="fw-bold mb-0">4.8/5</p>
                      <small className="text-muted">Customer happiness</small>
                    </div>
                    <div>
                      <p className="fw-bold mb-0">2.3cr+</p>
                      <small className="text-muted">Digital IDs issued</small>
                    </div>
                    <div>
                      <p className="fw-bold mb-0">58 min</p>
                      <small className="text-muted">Avg. pickup SLA</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="track" className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <TrackParcel
                onTrack={handleTrack}
                result={trackState.result}
                error={trackState.error}
                isLoading={trackState.loading}
                variant="plain"
              />
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm bg-light">
                <div className="card-body text-center p-4">
                  <h5 className="fw-bold mb-3">Want to Book a Shipment?</h5>
                  <p className="text-muted mb-3">
                    Visit your nearest post office to book a shipment. Our staff will help you complete the booking and provide you with a tracking ID.
                  </p>
                  <p className="text-muted small mb-0">
                    <strong>Note:</strong> Online booking is available only for authorized post office staff through the admin portal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <ServiceHighlights services={content.services} />
        <RateCalculator rateChart={content.rateChart} />
        <OfficeLocator offices={content.offices} />
      </main>
      <SiteFooter />
    </div>
  );
}

