import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';
import collegeLogo from '../../assests/logo.png';
import { CONTACT_DETAILS } from '../constants';

const Footer = () => {
  const { user, isAuthenticated } = useAuth();

  const dashboardLink = !user
    ? '/'
    : user.role === 'admin'
      ? '/admin/dashboard'
      : user.role === 'staff'
        ? '/staff/dashboard'
        : '/student/dashboard';

  return (
    <footer className="bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] text-sm border-t border-[var(--md-sys-color-outline-variant)] mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <img
                src={collegeLogo}
                alt="JNTU-GV Logo"
                className="h-10 w-10 object-contain rounded-full bg-white p-0.5 shadow-xs shrink-0"
              />
              <div>
                <span className="text-[20px] font-medium leading-6 text-[var(--md-sys-color-on-surface)]">
                  SmartCampus.
                </span>
                <br />
                <span className="text-[14px] font-medium leading-5 text-[var(--md-sys-color-on-surface)]">
                  JNTU-GV (CEV)
                </span>
              </div>
            </div>
            <p className="text-sm leading-6 text-[var(--md-sys-color-on-surface-variant)]">
              An institutional facility management and issue resolution portal
              engineered for students, department staff, and campus administration.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
              Quick links
            </h4>
            <ul className="space-y-2 text-sm text-[var(--md-sys-color-on-surface-variant)]">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link
                      to={dashboardLink}
                      className="hover:text-[var(--md-sys-color-primary)] transition-colors"
                    >
                      Operational dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      className="hover:text-[var(--md-sys-color-primary)] transition-colors"
                    >
                      About the portal
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="hover:text-[var(--md-sys-color-primary)] transition-colors"
                    >
                      Contact administration
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/"
                      className="hover:text-[var(--md-sys-color-primary)] transition-colors"
                    >
                      Campus home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/about"
                      className="hover:text-[var(--md-sys-color-primary)] transition-colors"
                    >
                      About the portal
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="hover:text-[var(--md-sys-color-primary)] transition-colors"
                    >
                      Contact administration
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/login"
                      className="hover:text-[var(--md-sys-color-primary)] transition-colors"
                    >
                      Staff & student sign in
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className="hover:text-[var(--md-sys-color-primary)] transition-colors"
                    >
                      Account registration
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
              Campus administration
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--md-sys-color-on-surface-variant)]">
              <li className="flex items-start space-x-2.5">
                <FaMapMarkerAlt className="text-[var(--md-sys-color-primary)] shrink-0 mt-1" />
                <a
                  href={CONTACT_DETAILS.mapDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--md-sys-color-primary)] transition-colors leading-snug"
                  title="Open in Google Maps"
                >
                  {CONTACT_DETAILS.shortAddress}
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <FaPhoneAlt className="text-[var(--md-sys-color-primary)] shrink-0" />
                <a
                  href={`tel:${CONTACT_DETAILS.supportPhone.replace(/\s+/g, '')}`}
                  className="font-mono hover:text-[var(--md-sys-color-primary)] transition-colors"
                >
                  {CONTACT_DETAILS.supportPhone}
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <FaEnvelope className="text-[var(--md-sys-color-primary)] shrink-0" />
                <a
                  href={`mailto:${CONTACT_DETAILS.supportEmail}`}
                  className="font-mono hover:text-[var(--md-sys-color-primary)] transition-colors break-all"
                >
                  {CONTACT_DETAILS.supportEmail}
                </a>
              </li>
            </ul>
          </div>

          {/* Campus Location Map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
                Campus location
              </h4>
              <a
                href={CONTACT_DETAILS.mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--md-sys-color-primary)] hover:underline inline-flex items-center gap-1 font-normal"
              >
                <span>View map</span>
                <FaExternalLinkAlt className="text-[10px]" />
              </a>
            </div>
            <div className="overflow-hidden rounded-xl border border-[var(--md-sys-color-outline-variant)] shadow-xs h-36 w-full bg-[var(--md-sys-color-surface)]">
              <iframe
                src={CONTACT_DETAILS.mapEmbedUrl}
                title="JNTU-GV College of Engineering Location Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[var(--md-sys-color-outline-variant)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--md-sys-color-on-surface-variant)] gap-3">
          <p>© {new Date().getFullYear()} JNTU-GV SmartCampus Management System. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <span>Privacy policy</span>
            <span>•</span>
            <span>Terms of service</span>
            <span>•</span>
            <span>Academic guidelines</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
