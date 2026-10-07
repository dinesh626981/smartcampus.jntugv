import React, { useState } from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import Textarea from '../components/ui/Textarea';
import Card from '../components/ui/Card';
import { CONTACT_DETAILS } from '../constants';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please complete all contact form fields.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      toast.success('Your inquiry has been submitted to the administration office.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 sm:pt-8 space-y-10">

      {/* Page Header */}
      <div className="text-left border-b border-[var(--md-sys-color-outline-variant)] pb-6">
        <span className="text-sm font-medium text-[var(--md-sys-color-primary)] block mb-1">
          Support & inquiries
        </span>
        <h1 className="text-[32px] leading-[40px] font-normal text-[var(--md-sys-color-on-surface)]">
          Contact campus administration
        </h1>
        <p className="text-base text-[var(--md-sys-color-on-surface-variant)] mt-2 max-w-2xl leading-relaxed">
          For technical difficulties signing in, account role verification, or urgent physical hazards, contact the central facility helpdesk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Institutional Address Cards */}
        <div className="lg:col-span-5 space-y-6">
          <Card title="Helpdesk office">
            <div className="space-y-5 text-sm text-[var(--md-sys-color-on-surface)]">
              <div className="flex items-start space-x-3.5">
                <div className="h-9 w-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0 mt-0.5">
                  <FaMapMarkerAlt className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-xs text-[var(--md-sys-color-on-surface-variant)]">Physical office</p>
                  <p className="text-sm text-[var(--md-sys-color-on-surface)] mt-0.5 leading-relaxed">
                    {CONTACT_DETAILS.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="h-9 w-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0 mt-0.5">
                  <FaEnvelope className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-xs text-[var(--md-sys-color-on-surface-variant)]">Official email</p>
                  <a
                    href={`mailto:${CONTACT_DETAILS.supportEmail}`}
                    className="font-mono text-sm text-[var(--md-sys-color-primary)] hover:underline mt-0.5 block"
                  >
                    {CONTACT_DETAILS.supportEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="h-9 w-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0 mt-0.5">
                  <FaPhoneAlt className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-xs text-[var(--md-sys-color-on-surface-variant)]">Direct telephone</p>
                  <a
                    href={`tel:${CONTACT_DETAILS.supportPhone.replace(/\s+/g, '')}`}
                    className="font-mono text-sm text-[var(--md-sys-color-primary)] hover:underline mt-0.5 block"
                  >
                    {CONTACT_DETAILS.supportPhone}
                  </a>
                </div>
              </div>

              {/* Campus Location Map Preview */}
              <div className="pt-2">
                <div className="overflow-hidden rounded-xl border border-[var(--md-sys-color-outline-variant)] shadow-xs h-44 w-full">
                  <iframe
                    src={CONTACT_DETAILS.mapEmbedUrl}
                    title="JNTU-GV Campus Location Map"
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
          </Card>

          {/* Operating Schedule Card */}
          <div className="bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-card p-5 text-xs text-[var(--md-sys-color-on-surface-variant)] space-y-2">
            <p className="font-medium text-[var(--md-sys-color-on-surface)] text-sm">Operational hours</p>
            <div className="flex justify-between">
              <span>Monday – Friday:</span>
              <span className="font-mono">08:00 – 18:00 IST</span>
            </div>
            <div className="flex justify-between">
              <span>Saturday:</span>
              <span className="font-mono">09:00 – 13:00 IST</span>
            </div>
            <div className="flex justify-between text-[var(--md-sys-color-primary)] font-medium pt-1 border-t border-[var(--md-sys-color-outline-variant)]">
              <span>Emergency facility dispatch:</span>
              <span className="font-mono">24 / 7 Active</span>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Inquiry Form with Floating Labels */}
        <div className="lg:col-span-7">
          <Card title="Submit an administrative inquiry">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Your full name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <TextField
                  label="Institutional email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <TextField
                label="Inquiry subject"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />

              <Textarea
                label="Detailed description"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                required
                counter
                maxLength={1000}
              />

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="filled"
                  loading={loading}
                  icon={<FaPaperPlane className="text-xs" />}
                >
                  Submit inquiry
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
