import { Trophy, Award, Star, Calendar, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Rnd } from 'react-rnd';
import { useState, useRef } from 'react';
import defaultLogoImage from 'figma:asset/4b719275cd951e102b70ffa534898fd07dcfed8f.png';

interface Awardee {
  id: number;
  name: string;
  title: string;
  award: string;
  description: string;
  date: string;
  category: string;
  photo: string;
  organizationLogo?: string;
  organizationLogoPath?: string;
  organizationLogoSize?: 'small' | 'medium';
  selectedIcon?: string;
  logoBadgeColor?: string;
  photoScale?: number;
  descriptionTextSize?: number;
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
  layout?: {
    photo?: { x: number; y: number; width: number; height: number };
    name?: { x: number; y: number; width: number; height: number };
    title?: { x: number; y: number; width: number; height: number };
    category?: { x: number; y: number; width: number; height: number };
    description?: { x: number; y: number; width: number; height: number };
    date?: { x: number; y: number; width: number; height: number };
  };
}

interface AwardCardProps {
  awardee: Awardee;
  slideNumber: number;
  totalSlides: number;
  isPreviewMode?: boolean;
  isLayoutEditMode?: boolean;
  onLayoutUpdate?: (elementId: string, position: { x: number; y: number }, size: { width: number; height: number }) => void;
}

export function AwardCard({ awardee, slideNumber, totalSlides, isPreviewMode = false, isLayoutEditMode = false, onLayoutUpdate }: AwardCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const layoutRef = useRef<Record<string, { x: number; y: number; width: number; height: number }>>({});

  // Assign icon based on category or selected icon
  const getCategoryIcon = (category: string, selectedIcon?: string) => {
    if (selectedIcon) {
      switch (selectedIcon) {
        case 'star':
          return <Star className="w-8 h-8" />;
        case 'trophy':
          return <Trophy className="w-8 h-8" />;
        case 'award':
          return <Award className="w-8 h-8" />;
        case 'sparkles':
          return <Sparkles className="w-8 h-8" />;
        default:
          return <Star className="w-8 h-8" />;
      }
    }
    return <Star className="w-8 h-8" />;
  };

  // Get accent color style based on flat vs gradient setting
  const getAccentStyle = () => {
    const isFlat = awardee.slideTheme?.accentColorType === 'flat';
    const hasCustomColor = awardee.slideTheme?.accentColor;
    
    if (!hasCustomColor) {
      const gradientColors = colors.gradient.includes('blue') 
        ? 'rgb(59 130 246), rgb(34 211 238)' 
        : colors.gradient.includes('amber') 
        ? 'rgb(245 158 11), rgb(250 204 21)' 
        : colors.gradient.includes('emerald') 
        ? 'rgb(16 185 129), rgb(20 184 166)' 
        : colors.gradient.includes('purple') 
        ? 'rgb(168 85 247), rgb(236 72 153)' 
        : 'rgb(100 116 139), rgb(148 163 184)';
      
      return {
        backgroundImage: `linear-gradient(to right, ${gradientColors})`
      };
    }
    
    if (isFlat) {
      return {
        background: awardee.slideTheme.accentColor
      };
    } else {
      const startColor = awardee.slideTheme.accentColor;
      const endColor = awardee.slideTheme.accentColorEnd || '#22d3ee';
      return {
        backgroundImage: `linear-gradient(to right, ${startColor}, ${endColor})`
      };
    }
  };

  // Assign color theme based on category
  const getCategoryColors = (category: string) => {
    switch (category) {
      case 'Technical Excellence':
        return {
          gradient: 'from-blue-500 to-cyan-400',
          glow: 'shadow-blue-500/50',
          accent: 'bg-blue-500',
          text: 'text-blue-400'
        };
      case 'Leadership':
        return {
          gradient: 'from-amber-500 to-yellow-400',
          glow: 'shadow-amber-500/50',
          accent: 'bg-amber-500',
          text: 'text-amber-400'
        };
      case 'Customer Excellence':
        return {
          gradient: 'from-emerald-500 to-teal-400',
          glow: 'shadow-emerald-500/50',
          accent: 'bg-emerald-500',
          text: 'text-emerald-400'
        };
      case 'Emerging Talent':
        return {
          gradient: 'from-purple-500 to-pink-400',
          glow: 'shadow-purple-500/50',
          accent: 'bg-purple-500',
          text: 'text-purple-400'
        };
      default:
        return {
          gradient: 'from-slate-500 to-slate-400',
          glow: 'shadow-slate-500/50',
          accent: 'bg-slate-500',
          text: 'text-slate-400'
        };
    }
  };

  const colors = getCategoryColors(awardee.category);
  const accentStyle = getAccentStyle();

  // Default visibility
  const visibility = {
    showPhoto: awardee.visibility?.showPhoto !== false,
    showName: awardee.visibility?.showName !== false,
    showTitle: awardee.visibility?.showTitle !== false,
    showCategory: awardee.visibility?.showCategory !== false,
    showDescription: awardee.visibility?.showDescription !== false,
    showDate: awardee.visibility?.showDate !== false,
  };

  const getLogoSize = () => {
    const isMobile = window.innerWidth < 640;
    const size = awardee.organizationLogoSize || 'medium';
    
    if (size === 'small') {
      return isMobile ? '32px' : '56px';
    }
    return isMobile ? '48px' : '80px';
  };

  const logoSize = getLogoSize();

  // Editable wrapper for layout edit mode
  const EditableElement = ({ 
    children, 
    elementId,
    defaultPos,
  }: { 
    children: React.ReactNode; 
    elementId: string;
    defaultPos: { x: number; y: number; width: number; height: number };
  }) => {
    const layout = awardee.layout?.[elementId as keyof typeof awardee.layout] || defaultPos;
    const isSelected = selected === elementId;

    if (!isLayoutEditMode || !onLayoutUpdate) {
      // Normal mode - return children as-is (relative positioning handled by parent)
      return <>{children}</>;
    }

    // Edit mode - wrap with Rnd
    return (
      <Rnd
        key={`${awardee.id}-${elementId}`}
        default={{
          x: layout.x,
          y: layout.y,
          width: layout.width,
          height: layout.height,
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          setSelected(elementId);
        }}
        onDragStart={() => setSelected(elementId)}
        onDragStop={(e, data) => {
          onLayoutUpdate(elementId, { x: data.x, y: data.y }, { width: layout.width, height: layout.height });
        }}
        onResizeStart={() => setSelected(elementId)}
        onResizeStop={(e, direction, ref, delta, position) => {
          onLayoutUpdate(
            elementId,
            { x: position.x, y: position.y },
            { width: parseInt(ref.style.width), height: parseInt(ref.style.height) }
          );
        }}
        minWidth={50}
        minHeight={50}
        className={isSelected ? 'z-[100]' : 'z-10'}
        style={{
          border: isSelected ? '2px solid #3b82f6' : 'none',
          borderRadius: '8px',
        }}
        enableResizing={{
          top: isSelected,
          right: isSelected,
          bottom: isSelected,
          left: isSelected,
          topRight: isSelected,
          bottomRight: isSelected,
          bottomLeft: isSelected,
          topLeft: isSelected,
        }}
        disableDragging={false}
      >
        {/* Resize handles - only show when selected */}
        {isSelected && (
          <>
            {/* Corner handles */}
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full" style={{ cursor: 'nwse-resize' }} />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full" style={{ cursor: 'nesw-resize' }} />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full" style={{ cursor: 'nesw-resize' }} />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full" style={{ cursor: 'nwse-resize' }} />
            {/* Edge handles */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full" style={{ cursor: 'ns-resize' }} />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full" style={{ cursor: 'ns-resize' }} />
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full" style={{ cursor: 'ew-resize' }} />
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full" style={{ cursor: 'ew-resize' }} />
            
            {/* Selected label */}
            <div className="absolute -top-6 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap pointer-events-none">
              {elementId}
            </div>
          </>
        )}
        
        <div className="w-full h-full">
          {children}
        </div>
      </Rnd>
    );
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={awardee.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-full overflow-hidden"
        style={{ backgroundColor: awardee.slideTheme?.backgroundColor || undefined }}
        onClick={(e) => {
          // Click on background to deselect
          if (e.target === e.currentTarget && isLayoutEditMode) {
            setSelected(null);
          }
        }}
      >
        {/* Background animated gradient */}
        <motion.div
          className="absolute inset-0 opacity-20 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* Info banner when in layout edit mode */}
        {isLayoutEditMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-[200] pointer-events-none">
            <p className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Layout Edit Mode
            </p>
          </div>
        )}

        {/* Main content container - using original relative layout when NOT in edit mode */}
        {!isLayoutEditMode ? (
          <div className="flex items-center justify-center gap-16 px-16 h-full">
            {/* Left side - Photo */}
            {visibility.showPhoto && (
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                className="relative flex-shrink-0"
              >
                {/* Animated glow ring */}
                <motion.div
                  className={`absolute -inset-4 bg-gradient-to-r ${colors.gradient} rounded-full blur-2xl opacity-60`}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.6, 0.8, 0.6],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Photo container */}
                <motion.div
                  className={`relative rounded-full overflow-hidden border-4 border-white/20 shadow-2xl ${colors.glow}`}
                  style={{ 
                    transformStyle: "preserve-3d",
                    width: '400px',
                    height: '400px',
                  }}
                  animate={{
                    scale: [1, 1.15, 1.15, 1, 1.1],
                    rotateY: [0, 0, 0, 360, 360],
                    z: [0, 0, 0, 0, 50]
                  }}
                  transition={{
                    duration: 8,
                    repeat: 0,
                    ease: "easeInOut",
                    times: [0, 0.2, 0.3, 0.75, 1]
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <img
                    src={awardee.photo}
                    alt={awardee.name}
                    className="w-full h-full object-cover"
                    style={{
                      transform: `scale(${awardee.photoScale || 1})`
                    }}
                  />
                  
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${colors.gradient} opacity-20`} />
                </motion.div>

                {/* Floating icon badge */}
                <motion.div
                  className={`absolute -right-2 sm:-right-4 bottom-10 rounded-full flex items-center justify-center shadow-lg ${colors.glow}`}
                  style={{
                    width: '60px',
                    height: '60px',
                    background: awardee.logoBadgeColor || `linear-gradient(to bottom right, ${colors.gradient.includes('blue') ? 'rgb(59 130 246), rgb(34 211 238)' : colors.gradient.includes('amber') ? 'rgb(245 158 11), rgb(250 204 21)' : colors.gradient.includes('emerald') ? 'rgb(16 185 129), rgb(20 184 166)' : colors.gradient.includes('purple') ? 'rgb(168 85 247), rgb(236 72 153)' : 'rgb(100 116 139), rgb(148 163 184)'})`,
                  }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  <div className="text-white">
                    {getCategoryIcon(awardee.category, awardee.selectedIcon)}
                  </div>
                </motion.div>

                {/* Star-shaped glitters */}
                {[...Array(12)].map((_, i) => {
                  const angle = (i / 12) * 2 * Math.PI;
                  const radius = 220;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  return (
                    <motion.div
                      key={i}
                      className="absolute text-yellow-300 pointer-events-none"
                      style={{
                        left: '50%',
                        top: '50%',
                        marginLeft: `${x}px`,
                        marginTop: `${y}px`,
                      }}
                      animate={{
                        scale: [0, 1.5, 0],
                        opacity: [0, 1, 0],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }}
                    >
                      <Star className="w-4 h-4 fill-current drop-shadow-lg" />
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Right side - Content */}
            <div className="flex-1 flex flex-col gap-6 max-w-3xl">
              {/* Category and Date row */}
              <div className="flex items-center gap-6">
                {visibility.showCategory && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative"
                  >
                    <div
                      className="px-6 py-3 rounded-full text-white font-semibold shadow-lg relative overflow-hidden"
                      style={{
                        ...accentStyle,
                        fontSize: '18px',
                      }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        animate={{ boxShadow: ['0 0 20px rgba(255,255,255,0.2)', '0 0 40px rgba(255,255,255,0.4)', '0 0 20px rgba(255,255,255,0.2)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      {awardee.category}
                    </div>
                    {/* Underline */}
                    <motion.div
                      className="h-1 mt-2 rounded-full"
                      style={accentStyle}
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    />
                  </motion.div>
                )}

                {visibility.showDate && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 text-white/60"
                    style={{ fontSize: '14px' }}
                  >
                    <Calendar className="w-4 h-4" />
                    {awardee.date}
                  </motion.div>
                )}
              </div>

              {/* Name */}
              {visibility.showName && (
                <motion.h1
                  className="font-bold text-white leading-tight"
                  style={{ fontSize: '56px' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {awardee.name}
                </motion.h1>
              )}

              {/* Title */}
              {visibility.showTitle && (
                <motion.h2
                  className="text-white/80 font-medium -mt-4"
                  style={{ fontSize: '28px' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {awardee.title}
                </motion.h2>
              )}

              {/* Description */}
              {visibility.showDescription && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-h-80 overflow-y-auto"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.3) transparent'
                  }}
                >
                  <p 
                    className="text-white/90 leading-relaxed whitespace-pre-line" 
                    style={{ fontSize: awardee.descriptionTextSize ? `${awardee.descriptionTextSize}px` : '16px' }}
                  >
                    {awardee.description}
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        ) : (
          /* Layout Edit Mode - Absolute positioned elements */
          <>
            {visibility.showPhoto && (
              <EditableElement elementId="photo" defaultPos={{ x: 100, y: 200, width: 400, height: 400 }}>
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className={`absolute -inset-4 bg-gradient-to-r ${colors.gradient} rounded-full blur-2xl opacity-60 pointer-events-none`} />
                  
                  <div
                    className={`relative rounded-full overflow-hidden border-4 border-white/20 shadow-2xl ${colors.glow} w-full h-full`}
                  >
                    <img
                      src={awardee.photo}
                      alt={awardee.name}
                      className="w-full h-full object-cover"
                      style={{ transform: `scale(${awardee.photoScale || 1})` }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${colors.gradient} opacity-20 pointer-events-none`} />
                  </div>

                  <div
                    className={`absolute -right-2 bottom-10 rounded-full flex items-center justify-center shadow-lg ${colors.glow} pointer-events-none`}
                    style={{
                      width: '60px',
                      height: '60px',
                      background: awardee.logoBadgeColor || `linear-gradient(to bottom right, ${colors.gradient.includes('blue') ? 'rgb(59 130 246), rgb(34 211 238)' : colors.gradient.includes('amber') ? 'rgb(245 158 11), rgb(250 204 21)' : colors.gradient.includes('emerald') ? 'rgb(16 185 129), rgb(20 184 166)' : colors.gradient.includes('purple') ? 'rgb(168 85 247), rgb(236 72 153)' : 'rgb(100 116 139), rgb(148 163 184)'})`,
                    }}
                  >
                    <div className="text-white">
                      {getCategoryIcon(awardee.category, awardee.selectedIcon)}
                    </div>
                  </div>
                </div>
              </EditableElement>
            )}

            {visibility.showCategory && (
              <EditableElement elementId="category" defaultPos={{ x: 550, y: 60, width: 200, height: 80 }}>
                <div className="w-full h-full flex flex-col gap-2">
                  <div
                    className="px-6 py-3 rounded-full text-white font-semibold shadow-lg w-fit"
                    style={{ ...accentStyle, fontSize: '18px' }}
                  >
                    {awardee.category}
                  </div>
                  <div className="h-1 rounded-full w-full" style={accentStyle} />
                </div>
              </EditableElement>
            )}

            {visibility.showDate && (
              <EditableElement elementId="date" defaultPos={{ x: 780, y: 70, width: 200, height: 30 }}>
                <div className="flex items-center gap-2 text-white/60" style={{ fontSize: '14px' }}>
                  <Calendar className="w-4 h-4" />
                  {awardee.date}
                </div>
              </EditableElement>
            )}

            {visibility.showName && (
              <EditableElement elementId="name" defaultPos={{ x: 550, y: 160, width: 800, height: 80 }}>
                <h1 className="font-bold text-white leading-tight" style={{ fontSize: '56px' }}>
                  {awardee.name}
                </h1>
              </EditableElement>
            )}

            {visibility.showTitle && (
              <EditableElement elementId="title" defaultPos={{ x: 550, y: 260, width: 800, height: 50 }}>
                <h2 className="text-white/80 font-medium" style={{ fontSize: '28px' }}>
                  {awardee.title}
                </h2>
              </EditableElement>
            )}

            {visibility.showDescription && (
              <EditableElement elementId="description" defaultPos={{ x: 550, y: 340, width: 1200, height: 350 }}>
                <div
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 overflow-y-auto w-full h-full"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.3) transparent'
                  }}
                >
                  <p 
                    className="text-white/90 leading-relaxed whitespace-pre-line" 
                    style={{ fontSize: awardee.descriptionTextSize ? `${awardee.descriptionTextSize}px` : '16px' }}
                  >
                    {awardee.description}
                  </p>
                </div>
              </EditableElement>
            )}
          </>
        )}

        {/* Animated corner decorations */}
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl pointer-events-none"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-3xl pointer-events-none"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Organization Logo */}
        <div className="absolute bottom-6 right-6 pointer-events-none z-50">
          <img 
            src={awardee.organizationLogo || defaultLogoImage} 
            alt="Organization Logo" 
            className="object-contain drop-shadow-lg"
            style={{
              width: logoSize,
              height: logoSize
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}