/**
 * Material 3 Underline Tabs Component
 * Active: 3px primary indicator with rounded top, label-large (14px, 500 weight)
 */
const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div className={`border-b border-[var(--md-sys-color-outline-variant)] ${className}`}>
      <nav className="flex space-x-1 sm:space-x-4" aria-label="Tabs">
        {tabs.map((tab) => {
          const tabKey = typeof tab === 'string' ? tab : tab.key || tab.id;
          const tabLabel = typeof tab === 'string' ? tab : tab.label || tab.title;
          const tabCount = typeof tab === 'object' ? tab.count : undefined;
          const isActive = activeTab === tabKey;

          return (
            <button
              key={tabKey}
              type="button"
              onClick={() => onChange(tabKey)}
              className={`
                relative h-12 px-4 inline-flex items-center gap-2
                text-sm font-medium leading-5 tracking-[0.1px]
                transition-colors duration-150 select-none cursor-pointer
                ${isActive
                  ? 'text-[var(--md-sys-color-primary)]'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary)]/8 rounded-t'
                }
              `}
            >
              <span>{tabLabel}</span>
              {tabCount !== undefined && (
                <span className={`
                  px-1.5 py-0.5 text-xs font-mono rounded-full
                  ${isActive
                    ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                    : 'bg-neutral-100 text-neutral-600'
                  }
                `}>
                  {tabCount}
                </span>
              )}

              {/* 3px Primary indicator with rounded top */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--md-sys-color-primary)] rounded-t-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;
