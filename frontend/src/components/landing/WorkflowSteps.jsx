import React from 'react';
import { FaPlusCircle, FaUserShield, FaWrench, FaCheckCircle } from 'react-icons/fa';
import Card from '../ui/Card';

const STEPS = [
  {
    num: 'Stage 1',
    title: 'Lodge issue',
    desc: 'Students report defects with exact physical location, description, and optional photo upload with client-side compression.',
    icon: FaPlusCircle,
    colorClass: 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]',
  },
  {
    num: 'Stage 2',
    title: 'AI triage & assign',
    desc: 'Automated predictive classification routes issues to responsible departments and technician dispatch queues.',
    icon: FaUserShield,
    colorClass: 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]',
  },
  {
    num: 'Stage 3',
    title: 'Technician repair',
    desc: 'Department staff update progress, record resolution remarks, and upload mandatory photo proof of completed remediation.',
    icon: FaWrench,
    colorClass: 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]',
  },
  {
    num: 'Stage 4',
    title: 'Verify & close',
    desc: 'Student receives instant notification of resolution and submits star satisfaction rating and feedback.',
    icon: FaCheckCircle,
    colorClass: 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]',
  },
];

export const WorkflowSteps = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-left">
        <span className="text-sm font-medium text-[var(--md-sys-color-primary)] block mb-1">
          Institutional workflow
        </span>
        <h2 className="text-[28px] sm:text-[32px] leading-[36px] sm:leading-[40px] font-normal text-[var(--md-sys-color-on-surface)]">
          How campus issues are resolved
        </h2>
        <p className="text-base text-[var(--md-sys-color-on-surface-variant)] mt-1.5 max-w-xl">
          Four automated stages from ticket registration to closure and student verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <Card
              key={step.num}
              title={step.title}
              subtitle={step.num}
              action={
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step.colorClass}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              }
            >
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-6 mt-1">
                {step.desc}
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default WorkflowSteps;
