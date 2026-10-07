import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import Button from '../ui/Button';
import campusHeroImg from '../../../assests/hero.png';

export const LandingHero = ({ getStartedLink, isAuthenticated }) => {
  return (
    <section className="bg-[var(--md-sys-color-surface)] border-b border-[var(--md-sys-color-outline-variant)] pt-6 pb-12 sm:pt-8 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
          {/* Left Content */}
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-[var(--md-sys-color-primary)] mb-2 block">
              Campus grievance portal
            </span>
            <h1 className="text-[36px] sm:text-[45px] leading-[44px] sm:leading-[52px] font-normal text-[var(--md-sys-color-on-surface)] tracking-tight">
              Institutional facility management and issue remediation
            </h1>
            <p className="mt-3 text-base sm:text-lg text-[var(--md-sys-color-on-surface-variant)] leading-7 max-w-2xl">
              A transparent, accountable workflow for reporting campus maintenance, safety, and equipment defects directly to facility teams with real-time updates.
            </p>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link to={getStartedLink()}>
                <Button
                  variant="filled"
                  size="lg"
                  className="w-full sm:w-auto"
                  icon={<FaArrowRight className="h-3.5 w-3.5" />}
                  iconPosition="right"
                >
                  Raise a complaint
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/login">
                  <Button variant="outlined" size="lg" className="w-full sm:w-auto">
                    Sign in to portal
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Illustration: positioned directly below CTA buttons */}
            <div className="mt-6 block lg:hidden w-full">
              <div className="w-full overflow-hidden rounded-lg">
                <img
                  src={campusHeroImg}
                  alt="JNTU-GV Campus"
                  className="w-full h-auto object-contain rounded-lg block"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 pt-6 border-t border-[var(--md-sys-color-outline-variant)] grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
              <div>
                <p className="text-3xl font-normal text-[var(--md-sys-color-on-surface)]">2,500+</p>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">Enrolled students</p>
              </div>
              <div>
                <p className="text-3xl font-normal text-[var(--md-sys-color-on-surface)]">10</p>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">Campus departments</p>
              </div>
              <div>
                <p className="text-3xl font-normal text-[var(--md-sys-color-on-surface)]">98.4%</p>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">Resolution rate</p>
              </div>
              <div>
                <p className="text-3xl font-normal text-[var(--md-sys-color-on-surface)]">&lt; 24h</p>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">Median response</p>
              </div>
            </div>
          </div>

          {/* Desktop Illustration: right side of the hero, vertically centered */}
          <div className="hidden lg:flex shrink-0 items-center justify-center w-[520px] xl:w-[580px]">
            <div className="w-full overflow-hidden rounded-2xl shadow-sm border border-[var(--md-sys-color-outline-variant)]/40">
              <img
                src={campusHeroImg}
                alt="JNTU-GV Campus"
                className="w-full h-auto max-h-[520px] object-contain rounded-2xl block"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
