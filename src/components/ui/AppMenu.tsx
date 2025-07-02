import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../lib/hooks/useTheme';
import { Settings, Info, HelpCircle, LogOut } from 'lucide-react';

interface AppMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  position: {
    top: number;
    left: number;
    height: number;
  } | null;
}

const AppMenu: React.FC<AppMenuProps> = ({ isOpen, onClose, onAction, position }) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const menuItems = [
    { id: 'settings', label: 'Configuración', icon: Settings },
    { id: 'about', label: 'Acerca de', icon: Info },
    { id: 'help', label: 'Ayuda', icon: HelpCircle },
    { id: 'quit', label: 'Salir', icon: LogOut },
  ];

  const handleItemClick = (action: string) => {
    onAction(action);
    onClose();
  };

  if (!position) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999998]"
            onClick={onClose}
          />
          
          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`fixed z-[999999] glass-strong rounded-lg shadow-2xl border min-w-48 ${
              isDark 
                ? 'border-macos-border-dark' 
                : 'border-macos-border'
            }`}
            style={{
              top: position.top + 8,
              left: position.left,
            }}
          >
            <div className="py-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ backgroundColor: isDark ? 'rgba(206, 124, 115, 0.1)' : 'rgba(0, 102, 204, 0.1)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full px-4 py-2 text-left flex items-center space-x-3 transition-colors duration-150 ${
                      isDark 
                        ? 'text-dark-rose hover:text-white' 
                        : 'text-light-text hover:text-light-accent'
                    } ${index === menuItems.length - 1 ? 'border-t border-opacity-20 mt-1 pt-3' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-bricolage-normal text-sm">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AppMenu;
