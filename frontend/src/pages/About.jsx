import React, { useState } from 'react';
import { FaBullseye, FaRegEye, FaChevronDown } from 'react-icons/fa';
import Card from '../components/ui/Card';
import { faqsList } from '../constants';
import faqImage from '../../assests/faq.png';

export const About = () => {
  const [openFaqId, setOpenFaqId] = useState(null);

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 sm:pt-8 space-y-10">
      {/* Page Header */}
      <div className="text-left border-b border-[var(--md-sys-color-outline-variant)] pb-6">
        <span className="text-sm font-medium text-[var(--md-sys-color-primary)] block mb-1">
          Institutional overview
        </span>
        <h1 className="text-[32px] leading-[40px] font-normal text-[var(--md-sys-color-on-surface)]">
          About the grievance &amp; facility portal
        </h1>
        <p className="text-base text-[var(--md-sys-color-on-surface-variant)] mt-2 max-w-2xl leading-relaxed">
          The JNTU-GV SmartCampus Issue Reporting &amp; Management System establishes a centralized digital registry to record, triage, assign, and remediate institutional facility defects across academic and residential buildings.
        </p>
      </div>

      {/* Grid: Mission and Objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title="Institutional mission"
          action={
            <div className="h-9 w-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
              <FaBullseye className="h-4 w-4" />
            </div>
          }
        >
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-6">
            To eliminate informal paper-based grievance submission and delayed maintenance response. By providing an authenticated institutional record, every laboratory, classroom, and hostel grievance is timestamped, audited, and resolved with photographic confirmation.
          </p>
        </Card>

        <Card
          title="Core objectives"
          action={
            <div className="h-9 w-9 rounded-full bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-on-warning-container)] flex items-center justify-center">
              <FaRegEye className="h-4 w-4" />
            </div>
          }
        >
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-6">
            Implement reliable predictive categorization to automate ticket dispatch. Natural language processing models analyze reported issues to instantly suggest corresponding facility departments (Electrical, Plumbing, Laboratory, Internet), minimizing manual routing latency.
          </p>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="border-t border-[var(--md-sys-color-outline-variant)] pt-10">
        {/* Section label */}
        <span className="text-sm font-medium text-[var(--md-sys-color-primary)] block mb-1">
          Help center
        </span>
        <h2 className="text-2xl font-medium text-[var(--md-sys-color-on-surface)] mb-8">
          Frequently asked questions
        </h2>

        {/* Two-column: image left, accordion right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left — Illustration */}
          <div className="flex flex-col items-center lg:items-start lg:sticky lg:top-24">
            <div className="w-full max-w-sm lg:max-w-none overflow-hidden rounded-3xl bg-[var(--md-sys-color-surface-container-low)] p-6">
              <img
                src={faqImage}
                alt="FAQ illustration"
                className="w-full h-auto object-contain rounded-2xl"
              />
            </div>
            <p className="mt-4 text-sm text-[var(--md-sys-color-on-surface-variant)] text-center lg:text-left leading-relaxed max-w-sm">
              Can't find what you're looking for? Contact your department coordinator or reach out to the system administrator.
            </p>
          </div>

          {/* Right — Accordion */}
          <div className="space-y-3">
            {faqsList.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-colors duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]/20'
                      : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] hover:border-[var(--md-sys-color-outline)] hover:bg-[var(--md-sys-color-surface-container)]'
                  }`}
                >
                  {/* Question trigger */}
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                    id={`faq-question-${faq.id}`}
                  >
                    <span
                      className={`text-sm font-medium leading-5 transition-colors ${
                        isOpen
                          ? 'text-[var(--md-sys-color-primary)]'
                          : 'text-[var(--md-sys-color-on-surface)]'
                      }`}
                    >
                      {faq.question}
                    </span>
                    <span
                      className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isOpen
                          ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rotate-180'
                          : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]'
                      }`}
                    >
                      <FaChevronDown className="h-3 w-3" />
                    </span>
                  </button>

                  {/* Answer panel — animated open/close */}
                  <div
                    id={`faq-answer-${faq.id}`}
                    role="region"
                    aria-labelledby={`faq-question-${faq.id}`}
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm text-[var(--md-sys-color-on-surface-variant)] leading-6">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
