import { useState } from 'react';
import { X, Upload, Save, Trash2, Plus, Image as ImageIcon, Star, Trophy, Award, Sparkles, GripVertical, Copy, Edit2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { TabContextMenu } from './TabContextMenu';

interface Awardee {
  id: number;
  name: string;
  title: string;
  award: string;
  description: string;
  date: string;
  category: string;
  photo: string;
  photoPath?: string;
  brandLogo?: string;
  brandLogoPath?: string;
  selectedIcon?: string;
  logoBadgeColor?: string;
  photoScale?: number;
  descriptionTextSize?: number;
  tabName?: string;
  isHidden?: boolean;
  slideTheme?: {
    backgroundColor?: string;
    accentColor?: string;
    accentColorEnd?: string;
    accentColorType?: 'flat' | 'gradient';
  };
  visibility?: {
    showPhoto?: boolean;
    showName?: boolean;
    showTitle?: boolean;
    showCategory?: boolean;
    showDescription?: boolean;
    showDate?: boolean;
  };
}

interface EditorPanelProps {
  awardees: Awardee[];
  onUpdate: (awardees: Awardee[]) => void;
  onClose: () => void;
}

const categories = [
  'Act as Owner',
  'Focus and get things done fast',
  'Celebrate Success'
];

export function EditorPanel({ awardees, onUpdate, onClose }: EditorPanelProps) {
  const [editingAwardees, setEditingAwardees] = useState<Awardee[]>(awardees);
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; index: number } | null>(null);
  const [renamingIndex, setRenamingIndex] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const allCategories = [...categories];

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newAwardees = [...editingAwardees];
    const draggedItem = newAwardees[draggedIndex];
    
    // Remove from old position
    newAwardees.splice(draggedIndex, 1);
    
    // Insert at new position
    newAwardees.splice(dropIndex, 0, draggedItem);
    
    setEditingAwardees(newAwardees);
    
    // Update active tab to follow the moved item
    if (activeTab === draggedIndex) {
      setActiveTab(dropIndex);
    } else if (draggedIndex < activeTab && dropIndex >= activeTab) {
      setActiveTab(activeTab - 1);
    } else if (draggedIndex > activeTab && dropIndex <= activeTab) {
      setActiveTab(activeTab + 1);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleFieldChange = (index: number, field: keyof Awardee, value: string) => {
    const updated = [...editingAwardees];
    updated[index] = { ...updated[index], [field]: value };
    setEditingAwardees(updated);
  };

  const handlePhotoUpload = async (index: number, file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b6556629/upload-photo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: formData
        }
      );

      const data = await response.json();
      
      if (data.success) {
        const updated = [...editingAwardees];
        updated[index] = { 
          ...updated[index], 
          photo: data.photoUrl,
          photoPath: data.photoPath
        };
        setEditingAwardees(updated);
      } else {
        alert('Failed to upload photo: ' + data.error);
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleBrandLogoUpload = async (index: number, file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b6556629/upload-photo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: formData
        }
      );

      const data = await response.json();
      
      if (data.success) {
        const updated = [...editingAwardees];
        updated[index] = { 
          ...updated[index], 
          brandLogo: data.photoUrl,
          brandLogoPath: data.photoPath
        };
        setEditingAwardees(updated);
      } else {
        alert('Failed to upload logo: ' + data.error);
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleAddAwardee = () => {
    const newId = Math.max(...editingAwardees.map(a => a.id), 0) + 1;
    const newAwardee: Awardee = {
      id: newId,
      name: 'New Awardee',
      title: 'Position Title',
      award: 'Award Title',
      description: 'Add achievement description here...',
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      category: 'Act as Owner',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
    };
    setEditingAwardees([...editingAwardees, newAwardee]);
    setActiveTab(editingAwardees.length);
  };

  const handleDeleteAwardee = (index: number) => {
    setDeleteConfirmIndex(index);
  };

  const confirmDelete = () => {
    if (deleteConfirmIndex !== null) {
      const updated = editingAwardees.filter((_, i) => i !== deleteConfirmIndex);
      setEditingAwardees(updated);
      if (activeTab >= updated.length) {
        setActiveTab(Math.max(0, updated.length - 1));
      }
      setDeleteConfirmIndex(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmIndex(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // First, get all existing awardees from the database
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b6556629/awardees`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      const data = await response.json();
      const existingAwardees = data.awardees || [];
      
      // Find awardees to delete (those that exist in DB but not in our current list)
      const currentIds = editingAwardees.map(a => a.id);
      const awardeesToDelete = existingAwardees.filter((a: Awardee) => !currentIds.includes(a.id));
      
      // Delete removed awardees
      await Promise.all(
        awardeesToDelete.map(async (awardee: Awardee) => {
          await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-b6556629/awardees/${awardee.id}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`
              }
            }
          );
        })
      );

      // Save all current awardees
      await Promise.all(
        editingAwardees.map(async (awardee, index) => {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-b6556629/awardees`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`
              },
              body: JSON.stringify({ ...awardee, order: index })
            }
          );
          
          if (!response.ok) {
            throw new Error(`Failed to save awardee ${awardee.id}`);
          }
        })
      );

      onUpdate(editingAwardees);
      setSaveSuccess(true);
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, index });
  };

  const handleRename = (index: number) => {
    setRenamingIndex(index);
    setRenameValue(editingAwardees[index].tabName || `Award ${index + 1}`);
  };

  const confirmRename = () => {
    if (renamingIndex !== null && renameValue.trim()) {
      const updated = [...editingAwardees];
      updated[renamingIndex] = {
        ...updated[renamingIndex],
        tabName: renameValue.trim()
      };
      setEditingAwardees(updated);
    }
    setRenamingIndex(null);
    setRenameValue('');
  };

  const cancelRename = () => {
    setRenamingIndex(null);
    setRenameValue('');
  };

  const handleDuplicate = (index: number) => {
    const awardee = editingAwardees[index];
    const newId = Math.max(...editingAwardees.map(a => a.id), 0) + 1;
    const duplicated: Awardee = {
      ...awardee,
      id: newId,
      tabName: awardee.tabName ? `${awardee.tabName} (Copy)` : undefined
    };
    const updated = [...editingAwardees];
    updated.splice(index + 1, 0, duplicated);
    setEditingAwardees(updated);
    setActiveTab(index + 1);
  };

  const handleToggleHide = (index: number) => {
    const updated = [...editingAwardees];
    updated[index] = {
      ...updated[index],
      isHidden: !updated[index].isHidden
    };
    setEditingAwardees(updated);
  };

  const currentAwardee = editingAwardees[activeTab];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-slate-900 shadow-2xl z-50 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-slate-800 p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Edit Awards</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddAwardee}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add New Award
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {editingAwardees.map((awardee, index) => (
              <div key={awardee.id} className="relative">
                {renamingIndex === index ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') confirmRename();
                        if (e.key === 'Escape') cancelRename();
                      }}
                      onBlur={confirmRename}
                      autoFocus
                      className="px-3 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ) : (
                  <button
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setActiveTab(index)}
                    onContextMenu={(e) => handleContextMenu(e, index)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-grab active:cursor-grabbing ${
                      activeTab === index
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    } ${
                      draggedIndex === index 
                        ? 'opacity-50 scale-95' 
                        : ''
                    } ${
                      dragOverIndex === index && draggedIndex !== index
                        ? 'ring-2 ring-blue-400 scale-105'
                        : ''
                    } ${
                      awardee.isHidden
                        ? 'opacity-50'
                        : ''
                    }`}
                  >
                    <GripVertical className="w-4 h-4 opacity-50" />
                    <span>{awardee.tabName || `Award ${index + 1}`}</span>
                    {awardee.isHidden && (
                      <EyeOff className="w-3.5 h-3.5 opacity-70" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <TabContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            isHidden={editingAwardees[contextMenu.index]?.isHidden || false}
            onRename={() => handleRename(contextMenu.index)}
            onDuplicate={() => handleDuplicate(contextMenu.index)}
            onToggleHide={() => handleToggleHide(contextMenu.index)}
            onDelete={() => handleDeleteAwardee(contextMenu.index)}
            onClose={() => setContextMenu(null)}
          />
        )}

        {/* Form */}
        {currentAwardee && (
          <div className="flex-1 overflow-y-auto p-6 pb-32 space-y-6">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Awardee Photo
              </label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700">
                    {currentAwardee.photo ? (
                      <img
                        src={currentAwardee.photo}
                        alt={currentAwardee.name}
                        className="w-full h-full object-cover"
                        style={{
                          transform: `scale(${currentAwardee.photoScale || 1})`
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-slate-600" />
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(activeTab, file);
                      }}
                    />
                  </label>
                </div>
                
                {/* Image Size Tip */}
                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                  <p className="text-xs text-blue-300">
                    💡 Tip: Upload close-up portrait photos for best results. Photos will automatically fill the circular frame.
                  </p>
                </div>

                {/* Image Zoom Adjustment */}
                {currentAwardee.photo && (
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">
                      Image Zoom (adjust to fit)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="100"
                        max="200"
                        step="5"
                        value={(currentAwardee.photoScale || 1) * 100}
                        onChange={(e) => {
                          const updated = [...editingAwardees];
                          updated[activeTab] = { 
                            ...updated[activeTab], 
                            photoScale: parseInt(e.target.value) / 100
                          };
                          setEditingAwardees(updated);
                        }}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>100% (Default)</span>
                        <span className="text-blue-400 font-medium">{Math.round((currentAwardee.photoScale || 1) * 100)}%</span>
                        <span>200% (Max Zoom)</span>
                      </div>
                      {currentAwardee.photoScale && currentAwardee.photoScale !== 1 && (
                        <button
                          onClick={() => {
                            const updated = [...editingAwardees];
                            updated[activeTab] = { 
                              ...updated[activeTab], 
                              photoScale: 1
                            };
                            setEditingAwardees(updated);
                          }}
                          className="w-full px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs"
                        >
                          Reset Zoom
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Brand Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Brand Logo or Icon
              </label>
              <div className="space-y-4">
                {/* Logo Upload */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                    {currentAwardee.brandLogo ? (
                      <img
                        src={currentAwardee.brandLogo}
                        alt="Brand logo"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 w-fit">
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Uploading...' : 'Upload Logo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleBrandLogoUpload(activeTab, file);
                        }}
                      />
                    </label>
                    {currentAwardee.brandLogo && (
                      <button
                        onClick={() => {
                          const updated = [...editingAwardees];
                          updated[activeTab] = { 
                            ...updated[activeTab], 
                            brandLogo: undefined,
                            brandLogoPath: undefined
                          };
                          setEditingAwardees(updated);
                        }}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 w-fit text-sm"
                      >
                        <X className="w-4 h-4" />
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>

                {/* Badge Background Color Picker */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Badge Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentAwardee.logoBadgeColor || '#3b82f6'}
                      onChange={(e) => handleFieldChange(activeTab, 'logoBadgeColor', e.target.value)}
                      className="w-12 h-9 rounded cursor-pointer bg-slate-800 border border-slate-700"
                    />
                    <input
                      type="text"
                      value={currentAwardee.logoBadgeColor || '#3b82f6'}
                      onChange={(e) => handleFieldChange(activeTab, 'logoBadgeColor', e.target.value)}
                      placeholder="#3b82f6"
                      className="w-24 px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {currentAwardee.logoBadgeColor && (
                      <button
                        onClick={() => handleFieldChange(activeTab, 'logoBadgeColor', '')}
                        className="px-2 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Icon Selection - Always visible */}
                <div>
                  <p className="text-sm text-slate-400 mb-2">Or choose an icon:</p>
                  <div className="flex gap-2">
                    {[
                      { name: 'star', icon: Star },
                      { name: 'trophy', icon: Trophy },
                      { name: 'award', icon: Award },
                      { name: 'sparkles', icon: Sparkles }
                    ].map(({ name, icon: Icon }) => (
                      <button
                        key={name}
                        onClick={() => handleFieldChange(activeTab, 'selectedIcon', name)}
                        className={`p-2 rounded-lg border transition-all ${
                          (currentAwardee.selectedIcon || 'star') === name
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Theme Customization - continues in next part */}
            <div className="border-t border-slate-700 pt-6">
              <label className="block text-sm font-medium text-slate-300 mb-4">
                Slide Theme Colors
              </label>
              <div className="space-y-4">
                {/* Background Color */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Slide Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentAwardee.slideTheme?.backgroundColor || '#1e293b'}
                      onChange={(e) => {
                        const updated = [...editingAwardees];
                        updated[activeTab] = { 
                          ...updated[activeTab], 
                          slideTheme: {
                            ...updated[activeTab].slideTheme,
                            backgroundColor: e.target.value
                          }
                        };
                        setEditingAwardees(updated);
                      }}
                      className="w-12 h-9 rounded cursor-pointer bg-slate-800 border border-slate-700"
                    />
                    <input
                      type="text"
                      value={currentAwardee.slideTheme?.backgroundColor || '#1e293b'}
                      onChange={(e) => {
                        const updated = [...editingAwardees];
                        updated[activeTab] = { 
                          ...updated[activeTab], 
                          slideTheme: {
                            ...updated[activeTab].slideTheme,
                            backgroundColor: e.target.value
                          }
                        };
                        setEditingAwardees(updated);
                      }}
                      placeholder="#1e293b"
                      className="w-24 px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {currentAwardee.slideTheme?.backgroundColor && (
                      <button
                        onClick={() => {
                          const updated = [...editingAwardees];
                          updated[activeTab] = { 
                            ...updated[activeTab], 
                            slideTheme: {
                              ...updated[activeTab].slideTheme,
                              backgroundColor: undefined
                            }
                          };
                          setEditingAwardees(updated);
                        }}
                        className="px-2 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Accent Color (Category Badge & Line)
                  </label>
                  
                  {/* Flat vs Gradient Toggle */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => {
                        const updated = [...editingAwardees];
                        updated[activeTab] = { 
                          ...updated[activeTab], 
                          slideTheme: {
                            ...updated[activeTab].slideTheme,
                            accentColorType: 'flat'
                          }
                        };
                        setEditingAwardees(updated);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        (currentAwardee.slideTheme?.accentColorType || 'gradient') === 'flat'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Flat Color
                    </button>
                    <button
                      onClick={() => {
                        const updated = [...editingAwardees];
                        updated[activeTab] = { 
                          ...updated[activeTab], 
                          slideTheme: {
                            ...updated[activeTab].slideTheme,
                            accentColorType: 'gradient'
                          }
                        };
                        setEditingAwardees(updated);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        (currentAwardee.slideTheme?.accentColorType || 'gradient') === 'gradient'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      Gradient
                    </button>
                  </div>

                  {/* Color Picker(s) */}
                  {(currentAwardee.slideTheme?.accentColorType || 'gradient') === 'flat' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentAwardee.slideTheme?.accentColor || '#3b82f6'}
                        onChange={(e) => {
                          const updated = [...editingAwardees];
                          updated[activeTab] = { 
                            ...updated[activeTab], 
                            slideTheme: {
                              ...updated[activeTab].slideTheme,
                              accentColor: e.target.value
                            }
                          };
                          setEditingAwardees(updated);
                        }}
                        className="w-12 h-9 rounded cursor-pointer bg-slate-800 border border-slate-700"
                      />
                      <input
                        type="text"
                        value={currentAwardee.slideTheme?.accentColor || '#3b82f6'}
                        onChange={(e) => {
                          const updated = [...editingAwardees];
                          updated[activeTab] = { 
                            ...updated[activeTab], 
                            slideTheme: {
                              ...updated[activeTab].slideTheme,
                              accentColor: e.target.value
                            }
                          };
                          setEditingAwardees(updated);
                        }}
                        placeholder="#3b82f6"
                        className="w-24 px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {currentAwardee.slideTheme?.accentColor && (
                        <button
                          onClick={() => {
                            const updated = [...editingAwardees];
                            updated[activeTab] = { 
                              ...updated[activeTab], 
                              slideTheme: {
                                ...updated[activeTab].slideTheme,
                                accentColor: undefined
                              }
                            };
                            setEditingAwardees(updated);
                          }}
                          className="px-2 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Start Color */}
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Gradient Start</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={currentAwardee.slideTheme?.accentColor || '#3b82f6'}
                            onChange={(e) => {
                              const updated = [...editingAwardees];
                              updated[activeTab] = { 
                                ...updated[activeTab], 
                                slideTheme: {
                                  ...updated[activeTab].slideTheme,
                                  accentColor: e.target.value
                                }
                              };
                              setEditingAwardees(updated);
                            }}
                            className="w-12 h-9 rounded cursor-pointer bg-slate-800 border border-slate-700"
                          />
                          <input
                            type="text"
                            value={currentAwardee.slideTheme?.accentColor || '#3b82f6'}
                            onChange={(e) => {
                              const updated = [...editingAwardees];
                              updated[activeTab] = { 
                                ...updated[activeTab], 
                                slideTheme: {
                                  ...updated[activeTab].slideTheme,
                                  accentColor: e.target.value
                                }
                              };
                              setEditingAwardees(updated);
                            }}
                            placeholder="#3b82f6"
                            className="w-24 px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* End Color */}
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Gradient End</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={currentAwardee.slideTheme?.accentColorEnd || '#22d3ee'}
                            onChange={(e) => {
                              const updated = [...editingAwardees];
                              updated[activeTab] = { 
                                ...updated[activeTab], 
                                slideTheme: {
                                  ...updated[activeTab].slideTheme,
                                  accentColorEnd: e.target.value
                                }
                              };
                              setEditingAwardees(updated);
                            }}
                            className="w-12 h-9 rounded cursor-pointer bg-slate-800 border border-slate-700"
                          />
                          <input
                            type="text"
                            value={currentAwardee.slideTheme?.accentColorEnd || '#22d3ee'}
                            onChange={(e) => {
                              const updated = [...editingAwardees];
                              updated[activeTab] = { 
                                ...updated[activeTab], 
                                slideTheme: {
                                  ...updated[activeTab].slideTheme,
                                  accentColorEnd: e.target.value
                                }
                              };
                              setEditingAwardees(updated);
                            }}
                            placeholder="#22d3ee"
                            className="w-24 px-2 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Reset Button */}
                      {(currentAwardee.slideTheme?.accentColor || currentAwardee.slideTheme?.accentColorEnd) && (
                        <button
                          onClick={() => {
                            const updated = [...editingAwardees];
                            updated[activeTab] = { 
                              ...updated[activeTab], 
                              slideTheme: {
                                ...updated[activeTab].slideTheme,
                                accentColor: undefined,
                                accentColorEnd: undefined
                              }
                            };
                            setEditingAwardees(updated);
                          }}
                          className="w-full px-2 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs"
                        >
                          Reset Gradient
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Visibility Controls */}
            <div className="border-t border-slate-700 pt-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Slide Content Visibility
              </label>
              <p className="text-xs text-slate-400 mb-4">
                Choose which elements to show or hide on this slide
              </p>
              <div className="space-y-2">
                {[
                  { key: 'showPhoto', label: 'Awardee Photo' },
                  { key: 'showName', label: 'Awardee Name' },
                  { key: 'showTitle', label: 'Position/Title' },
                  { key: 'showCategory', label: 'Award Category' },
                  { key: 'showDescription', label: 'Achievement Description' },
                  { key: 'showDate', label: 'Award Date' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={currentAwardee.visibility?.[key as keyof typeof currentAwardee.visibility] !== false}
                      onChange={(e) => {
                        const updated = [...editingAwardees];
                        updated[activeTab] = {
                          ...updated[activeTab],
                          visibility: {
                            ...updated[activeTab].visibility,
                            [key]: e.target.checked
                          }
                        };
                        setEditingAwardees(updated);
                      }}
                      className="w-4 h-4 rounded border-2 border-slate-600 bg-slate-800/50 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-white text-sm group-hover:text-blue-300 transition-colors">{label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                <p className="text-xs text-blue-300">
                  💡 Tip: Hide elements you don't want to show for this particular award. This gives you full control over each slide's content.
                </p>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Awardee Name
              </label>
              <input
                type="text"
                value={currentAwardee.name}
                onChange={(e) => handleFieldChange(activeTab, 'name', e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Position/Title
              </label>
              <input
                type="text"
                value={currentAwardee.title}
                onChange={(e) => handleFieldChange(activeTab, 'title', e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Award Category
              </label>
              <select
                value={currentAwardee.category}
                onChange={(e) => handleFieldChange(activeTab, 'category', e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Award Date
              </label>
              <input
                type="text"
                value={currentAwardee.date}
                onChange={(e) => handleFieldChange(activeTab, 'date', e.target.value)}
                placeholder="e.g., February 2026"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Achievement Description
              </label>
              <textarea
                value={currentAwardee.description}
                onChange={(e) => handleFieldChange(activeTab, 'description', e.target.value)}
                rows={8}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-slate-400 mt-2">
                Use two line breaks to create paragraph spacing
              </p>
            </div>

            {/* Description Text Size */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description Text Size
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="10"
                  max="20"
                  step="1"
                  value={currentAwardee.descriptionTextSize || 13}
                  onChange={(e) => {
                    const updated = [...editingAwardees];
                    updated[activeTab] = { 
                      ...updated[activeTab], 
                      descriptionTextSize: parseInt(e.target.value)
                    };
                    setEditingAwardees(updated);
                  }}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>10px (Small)</span>
                  <span className="text-blue-400 font-medium">{currentAwardee.descriptionTextSize || 13}px</span>
                  <span>20px (Large)</span>
                </div>
                {currentAwardee.descriptionTextSize && currentAwardee.descriptionTextSize !== 13 && (
                  <button
                    onClick={() => {
                      const updated = [...editingAwardees];
                      updated[activeTab] = { 
                        ...updated[activeTab], 
                        descriptionTextSize: 13
                      };
                      setEditingAwardees(updated);
                    }}
                    className="w-full px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs"
                  >
                    Reset to Default (13px)
                  </button>
                )}
              </div>
            </div>

            {/* Delete Button */}
            {editingAwardees.length > 1 && (
              <button
                onClick={() => handleDeleteAwardee(activeTab)}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete This Awardee
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-800 p-6 border-t border-slate-700">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || saveSuccess}
              className={`flex-1 px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                saveSuccess
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : saveSuccess ? 'Changes Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmIndex !== null && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-800 rounded-xl p-6 max-w-sm w-full shadow-2xl border border-slate-700"
            >
              <h3 className="text-lg font-bold text-white mb-3">Delete Awardee?</h3>
              <p className="text-slate-300 text-sm mb-6">
                Are you sure you want to delete this awardee? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}