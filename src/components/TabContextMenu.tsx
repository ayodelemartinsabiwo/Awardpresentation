import { useEffect } from 'react';
import { Edit2, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

interface TabContextMenuProps {
  x: number;
  y: number;
  isHidden: boolean;
  onRename: () => void;
  onDuplicate: () => void;
  onToggleHide: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function TabContextMenu({
  x,
  y,
  isHidden,
  onRename,
  onDuplicate,
  onToggleHide,
  onDelete,
  onClose
}: TabContextMenuProps) {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't close if clicking inside the context menu
      if (!target.closest('.context-menu-container')) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    // Small delay to prevent immediate closure
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 0);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuItems = [
    {
      icon: Edit2,
      label: 'Rename Tab',
      onClick: onRename,
      color: 'text-slate-300 hover:text-white'
    },
    {
      icon: Copy,
      label: 'Duplicate',
      onClick: onDuplicate,
      color: 'text-slate-300 hover:text-white'
    },
    {
      icon: isHidden ? Eye : EyeOff,
      label: isHidden ? 'Show in Preview' : 'Hide in Preview',
      onClick: onToggleHide,
      color: 'text-slate-300 hover:text-white'
    },
    {
      icon: Trash2,
      label: 'Delete',
      onClick: onDelete,
      color: 'text-red-400 hover:text-red-300'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="fixed bg-slate-800 rounded-lg shadow-2xl border border-slate-700 py-1 min-w-[180px] z-[60] context-menu-container"
      style={{
        left: `${x}px`,
        top: `${y}px`
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            item.onClick();
            onClose();
          }}
          className={`w-full px-4 py-2 flex items-center gap-3 transition-colors ${item.color} hover:bg-slate-700/50`}
        >
          <item.icon className="w-4 h-4" />
          <span className="text-sm font-medium">{item.label}</span>
        </button>
      ))}
    </motion.div>
  );
}