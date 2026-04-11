import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Modal,
  SxProps,
  Typography,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';

export interface DialogAction {
  label: string;
  onClick: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  variant?: 'text' | 'outlined' | 'contained';
  startIcon?: string;
  endIcon?: string;
  disabled?: boolean;
}

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  content?: React.ReactNode;
  actions?: DialogAction[] | React.ReactNode;
  maxWidth?: number | string;
  disableEscapeKeyDown?: boolean;
  disableBackdropClick?: boolean;
  hideCloseButton?: boolean;
  showLoading?: boolean;
  loadingTitle?: string;
  sx?: SxProps;
  headerSx?: SxProps;
  contentSx?: SxProps;
  actionsSx?: SxProps;
}

/**
 * A flexible modal dialog component that supports:
 * - Custom headers, content, and action buttons
 * - Loading states with spinner
 * - Array-based or custom ReactNode actions
 * - Consistent styling across the application
 */
export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose = () => {},
  title,
  content,
  actions = [],
  maxWidth = 400,
  disableEscapeKeyDown = true,
  disableBackdropClick = false,
  hideCloseButton = false,
  showLoading = false,
  loadingTitle = 'Loading...',
  sx,
  headerSx,
  contentSx,
  actionsSx,
}) => {
  const renderActions = () => {
    if (showLoading) return null;

    if (Array.isArray(actions)) {
      return actions.map((action, index) => (
        <Button
          key={index}
          onClick={action.onClick}
          color={action.color || 'primary'}
          variant={action.variant || 'contained'}
          startIcon={action.startIcon && <IconifyIcon icon={action.startIcon} />}
          endIcon={action.endIcon && <IconifyIcon icon={action.endIcon} />}
          disabled={action.disabled}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          {action.label}
        </Button>
      ));
    }

    return actions;
  };

  // Handle close based on props
  const handleClose = (event: React.SyntheticEvent, reason?: 'backdropClick' | 'escapeKeyDown') => {
    // Prevent closing on backdrop click if disabled
    if (disableBackdropClick && reason === 'backdropClick') {
      event.stopPropagation();
      return;
    }
    // Prevent closing on escape key if disabled
    if (disableEscapeKeyDown && reason === 'escapeKeyDown') {
      event.stopPropagation();
      return;
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="dialog-modal-title"
      disableEscapeKeyDown={disableEscapeKeyDown}
      disableAutoFocus={false}
      // If backdrop click is disabled, we still need to provide onClose but filter it
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: maxWidth },
          maxHeight: '85vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 3,
          outline: 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ...sx,
        }}
      >
        {/* Header section with title and close button */}
        {(title || !hideCloseButton) && (
          <Box
            sx={{
              p: 3,
              pb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
              ...headerSx,
            }}
          >
            {title && (
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            )}
            {!hideCloseButton && !showLoading && (
              <IconButton
                onClick={onClose}
                size="small"
                sx={{
                  bgcolor: '#f1f5f9',
                  '&:hover': { bgcolor: '#e2e8f0' },
                }}
              >
                <IconifyIcon icon="mdi:close" fontSize={20} />
              </IconButton>
            )}
          </Box>
        )}

        {/* Content area with optional loading state */}
        {(content || showLoading) && (
          <Box
            sx={{
              p: 3,
              overflow: 'auto',
              flex: 1,
              ...contentSx,
            }}
          >
            {showLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  py: 4,
                }}
              >
                <CircularProgress size={40} thickness={4} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {loadingTitle}
                </Typography>
              </Box>
            ) : (
              content
            )}
          </Box>
        )}

        {/* Action buttons section */}
        {!showLoading && (
          <Box
            sx={{
              p: 3,
              pt: 2,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1.5,
              borderTop: '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
              ...actionsSx,
            }}
          >
            {renderActions()}
          </Box>
        )}
      </Box>
    </Modal>
  );
};

/**
 * Simple modal loader for displaying a centered spinner
 * Useful for blocking operations that don't need complex UI
 */
export const OnLoader: React.FC<{
  open: boolean;
  title?: string;
  onClose?: () => void;
  disableEscapeKeyDown?: boolean;
  size?: number;
  thickness?: number;
  sx?: SxProps;
}> = ({
  open,
  title = 'Loading...',
  onClose = () => {},
  disableEscapeKeyDown = true,
  size = 40,
  thickness = 4,
  sx,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="loader-modal-title"
      disableEscapeKeyDown={disableEscapeKeyDown}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 300,
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          p: 3,
          outline: 'none',
          ...sx,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={size} thickness={thickness} />
          <Typography id="loader-modal-title" variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
};

/**
 * Helper to create standard confirm/cancel action buttons
 * Returns an array of DialogAction objects with consistent styling
 */
export const createDialogActions = (
  cancelHandler: () => void,
  confirmHandler: () => void,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  cancelDisabled = false,
  confirmDisabled = false,
): DialogAction[] => [
  {
    label: cancelLabel,
    onClick: cancelHandler,
    color: 'secondary',
    variant: 'outlined',
    startIcon: 'mdi:close',
    disabled: cancelDisabled,
  },
  {
    label: confirmLabel,
    onClick: confirmHandler,
    color: 'primary',
    variant: 'contained',
    startIcon: 'mdi:check',
    disabled: confirmDisabled,
  },
];
