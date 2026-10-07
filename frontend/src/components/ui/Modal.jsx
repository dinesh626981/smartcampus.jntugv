import Dialog from './Dialog';

/**
 * Modal component (Material 3 Dialog with backwards compatible interface)
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  actions,
  ...props
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth={maxWidth}
      actions={actions}
      {...props}
    >
      {children}
    </Dialog>
  );
};

export default Modal;
