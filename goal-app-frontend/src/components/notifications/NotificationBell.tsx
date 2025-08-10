import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { NotificationsList } from './NotificationsList';
import { notificationService } from '../../services/notificationService';

interface NotificationBellProps {
  unreadCount?: number;
  onCountChange?: (count: number) => void;
  userId?: number; // ✅ Add userId prop
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ 
  unreadCount = 0, 
  onCountChange,
  userId // ✅ Accept userId prop
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const toggleDropdown = async () => {
    if (!showNotifications && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.right - 320,
      });
      
      // Fetch notifications when opening the dropdown
      // The count will be updated by the parent component when notifications are marked as seen
    }
    setShowNotifications(!showNotifications);
  };

  const handleClose = () => {
    setShowNotifications(false);
    
    // No need to manually reset count - it will be updated by parent component
  };

  // Rest of your component remains the same...
  const DropdownPortal = () => {
    if (!showNotifications) return null;
    
    const portalContainer = document.getElementById('notification-portal');
    if (!portalContainer) return null;

    return createPortal(
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${Math.max(16, dropdownPosition.left)}px`,
        }}
        className="fixed w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]"
      >
        <NotificationsList onClose={handleClose} />
      </motion.div>,
      portalContainer
    );
  };

  return (
    <div className="relative">
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleDropdown}
        className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        <DropdownPortal />
      </AnimatePresence>
    </div>
  );
};
