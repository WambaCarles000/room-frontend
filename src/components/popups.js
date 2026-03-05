// lib/popup.js
import Swal from 'sweetalert2';
import styles from '../styles/popups.module.css';

const POPUP_CONFIG = {
  success: {
    icon: 'success',
    background: '#f8fafc',
    iconColor: '#10b981',
  },
  error: {
    icon: 'error',
    background: '#fef2f2',
    iconColor: '#ef4444',
  },
  warning: {
    icon: 'warning',
    background: '#fffbeb',
    iconColor: '#f59e0b',
  },
  info: {
    icon: 'info',
    background: '#f0f9ff',
    iconColor: '#3b82f6',
  },
};

export default function Popup(message, type = 'info') {
  const config = POPUP_CONFIG[type] || POPUP_CONFIG.info;

  Swal.fire({
    title: message,
    icon: type,
    background: config.background,
    iconColor: config.iconColor,
    confirmButtonText: 'Fermer',
    allowOutsideClick: true,
    allowEscapeKey: true,
    customClass: {
      popup: styles.popupContainer,
      title: 'popup-title',
      icon: 'popup-icon',
      confirmButton: 'popup-confirm-btn',
    },
  });
}

// Usage:
// import Popup from '@/lib/popup';
//
// Popup('Succès! Votre demande a été envoyée.', 'success');
// Popup('Une erreur est survenue.', 'error');
// Popup('Attention, veuillez vérifier vos données.', 'warning');
// Popup('Informations importantes.', 'info');