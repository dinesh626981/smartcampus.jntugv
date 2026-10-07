import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsService, aiService } from '../services/api';
import { toast } from 'react-toastify';
import {
  FaPlusCircle,
  FaBrain,
  FaMapMarkerAlt,
  FaInfoCircle,
} from 'react-icons/fa';
import { compressImage } from '../utils/compressImage';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import ComplaintImageUploader from '../components/complaints/ComplaintImageUploader';
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES } from '../constants/complaintConstants';

export const RaiseComplaint = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    priority: 'Medium',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionStats, setCompressionStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [aiSuggested, setAiSuggested] = useState(false);

  useEffect(() => {
    if (formData.description.length < 15) {
      setAiSuggested(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      handleAutoPredict();
    }, 1500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.description]);

  const handleAutoPredict = async () => {
    setPredicting(true);
    try {
      const res = await aiService.predictCategory(formData.description);
      if (res.category && COMPLAINT_CATEGORIES.includes(res.category)) {
        setFormData((prev) => ({ ...prev, category: res.category }));
        setAiSuggested(true);
        toast.info(`AI predicted category: ${res.category}`);
      }
    } catch (err) {
      console.error('Auto prediction failed:', err);
    } finally {
      setPredicting(false);
    }
  };

  const handleManualPredict = async () => {
    if (!formData.description || formData.description.trim().length < 5) {
      toast.warning('Please enter a longer description before asking the AI analyzer.');
      return;
    }

    setPredicting(true);
    try {
      const res = await aiService.analyzeIssue(formData.description);
      if (res.category) {
        setFormData((prev) => ({
          ...prev,
          category: res.category,
          priority: res.urgency || prev.priority,
        }));
        setAiSuggested(true);
        toast.success(`AI suggested Category: ${res.category} & Priority: ${res.urgency}`);

        if (res.missing_information && res.missing_information.length > 0) {
          window.alert(
            `AI identified potential missing information:\n\n- ${res.missing_information.join('\n- ')}\n\nPlease provide these details if applicable.`
          );
        }
      }
    } catch (err) {
      toast.error('AI category prediction service failed. Please select manually.');
    } finally {
      setPredicting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, and PNG formats are permitted.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Evidence image must be under 15MB in file size.');
      return;
    }

    // Immediate preview feedback
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Compress in background worker
    setCompressing(true);
    setCompressionProgress(0);
    try {
      const res = await compressImage(file, (p) => setCompressionProgress(p));
      setImage(res.compressedFile);
      setCompressionStats(res);
    } catch (err) {
      console.error('Compression failed:', err);
      setImage(file);
    } finally {
      setCompressing(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setCompressionStats(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, category, location, priority } = formData;

    if (!title || !description || !category || !location) {
      toast.error('Please complete all mandatory fields.');
      return;
    }

    setLoading(true);

    const submitData = new FormData();
    submitData.append('title', title);
    submitData.append('description', description);
    submitData.append('category', category);
    submitData.append('location', location);
    submitData.append('priority', priority);
    if (image) {
      submitData.append('image', image);
    }

    try {
      if (typeof aiService.reportQuality === 'function') {
        try {
          const qualityRes = await aiService.reportQuality(description);
          if (qualityRes?.status === 'Potentially Suspicious' || qualityRes?.status === 'Low Quality') {
            if (!window.confirm(`Your report was flagged as ${qualityRes.status} by automated quality check.\nReason: ${qualityRes.reason}\n\nDo you still wish to submit?`)) {
              setLoading(false);
              return;
            }
          }
        } catch {
          // Non-blocking quality check
        }
      }

      if (typeof aiService.checkDuplicate === 'function') {
        try {
          const dupRes = await aiService.checkDuplicate(description);
          if (dupRes?.is_duplicate) {
            if (!window.confirm(`A similar complaint exists: [${dupRes.existing_status}] ${dupRes.existing_title}.\nReason: ${dupRes.reason || 'Semantic match'}\n\nDo you want to continue submitting?`)) {
              setLoading(false);
              return;
            }
          }
        } catch {
          // Non-blocking duplicate check
        }
      }

      await complaintsService.createComplaint(submitData);
      toast.success('Complaint ticket registered successfully.');
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1200);
    } catch (err) {
      console.error('Complaint submission error:', err);
      let errorMsg = '';
      if (err.response?.data) {
        const d = err.response.data;
        if (typeof d === 'string') {
          errorMsg = d;
        } else if (d.message) {
          errorMsg = d.message;
        } else if (d.error) {
          errorMsg = typeof d.error === 'string' ? d.error : JSON.stringify(d.error);
        } else if (d.detail) {
          errorMsg = d.detail;
        } else if (d.errors && typeof d.errors === 'object') {
          errorMsg = Object.values(d.errors).flat().join(', ');
        }
      }
      if (!errorMsg && err.message) {
        errorMsg = err.message;
      }
      if (!errorMsg) {
        errorMsg = 'Failed to submit complaint. Please verify your inputs and connectivity.';
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      <PageHeader
        title="Report a campus issue"
        subtitle="Submit infrastructure, laboratory, electrical, or residential defects for formal institutional remediation."
      />

      <Card noPadding>
        <form onSubmit={handleSubmit} className="divide-y divide-[var(--md-sys-color-outline-variant)]">
          {/* Section 1: Details */}
          <div className="p-6 sm:p-8 space-y-5">
            <h3 className="text-base font-medium text-[var(--md-sys-color-on-surface)]">
              1. Issue details
            </h3>

            <TextField
              label="Issue title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              helperText="Brief statement (e.g. Water dispenser leaking on 2nd floor)"
            />

            <div className="space-y-1.5">
              <Textarea
                label="Detailed description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                helperText="Explain the defect in full sentences for the AI classifier."
              />

              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  variant="text"
                  size="sm"
                  onClick={handleManualPredict}
                  disabled={predicting}
                  icon={<FaBrain className="text-xs" />}
                >
                  {predicting ? 'Classifying...' : 'AI categorize & check'}
                </Button>
              </div>

              {aiSuggested && (
                <div className="p-3 bg-[var(--md-sys-color-primary-container)] rounded-chip text-xs text-[var(--md-sys-color-on-primary-container)] flex items-center gap-2">
                  <FaInfoCircle className="h-4 w-4 shrink-0" />
                  <span>AI auto-predicted classification applied below. You may override if needed.</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Classification */}
          <div className="p-6 sm:p-8 space-y-5">
            <h3 className="text-base font-medium text-[var(--md-sys-color-on-surface)]">
              2. Classification & priority
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Department category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                options={[
                  { value: '', label: '-- Choose department --' },
                  ...COMPLAINT_CATEGORIES.map((c) => ({ value: c, label: c }))
                ]}
              />

              <Select
                label="Urgency / priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                options={COMPLAINT_PRIORITIES.map((p) => ({ value: p, label: `${p} priority` }))}
              />
            </div>
          </div>

          {/* Section 3: Location */}
          <div className="p-6 sm:p-8 space-y-5">
            <h3 className="text-base font-medium text-[var(--md-sys-color-on-surface)]">
              3. Physical campus location
            </h3>

            <TextField
              label="Location / room identifier"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              helperText="Specify building, floor, classroom or hostel room number"
              leftIcon={<FaMapMarkerAlt className="text-sm" />}
            />
          </div>

          {/* Section 4: Evidence Dropzone */}
          <div className="p-6 sm:p-8 space-y-5">
            <h3 className="text-base font-medium text-[var(--md-sys-color-on-surface)]">
              4. Photographic evidence (optional)
            </h3>

            <ComplaintImageUploader
              image={image}
              imagePreview={imagePreview}
              compressing={compressing}
              compressionProgress={compressionProgress}
              compressionStats={compressionStats}
              onImageChange={handleImageChange}
              onRemove={removeImage}
            />
          </div>

          {/* Form Actions Footer */}
          <div className="p-6 bg-[var(--md-sys-color-surface-container)] flex items-center justify-end gap-3 rounded-b-card">
            <Button
              type="button"
              variant="text"
              onClick={() => navigate('/student/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="filled"
              loading={loading}
              disabled={loading || compressing}
              icon={<FaPlusCircle className="text-xs" />}
            >
              {compressing ? 'Optimizing image...' : 'Submit complaint'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RaiseComplaint;
