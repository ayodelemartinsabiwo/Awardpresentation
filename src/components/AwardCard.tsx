import { Trophy, Award, Star, Calendar, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Awardee {
  id: number;
  name: string;
  title: string;
  award: string;
  description: string;
  date: string;
  category: string;
  photo: string;
  brandLogo?: string;
  brandLogoPath?: string;
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
}

interface AwardCardProps {
  awardee: Awardee;
  slideNumber: number;
  totalSlides: number;
  isPreviewMode?: boolean;
}

export function AwardCard({ awardee, slideNumber, totalSlides, isPreviewMode = false }: AwardCardProps) {
  // Assign icon based on category or selected icon
  const getCategoryIcon = (category: string, selectedIcon?: string) => {
    // Use selectedIcon if provided
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
    
    // Fall back to category-based icons (but default to star)
    return <Star className="w-8 h-8" />;
  };

  // Get accent color style based on flat vs gradient setting
  const getAccentStyle = () => {
    const isFlat = awardee.slideTheme?.accentColorType === 'flat';
    const hasCustomColor = awardee.slideTheme?.accentColor;
    
    if (!hasCustomColor) {
      // Use default category-based gradient
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
      // Flat color
      return {
        background: awardee.slideTheme.accentColor
      };
    } else {
      // Gradient with two colors
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

  // Default visibility: all elements shown
  const visibility = {
    showPhoto: awardee.visibility?.showPhoto !== false,
    showName: awardee.visibility?.showName !== false,
    showTitle: awardee.visibility?.showTitle !== false,
    showCategory: awardee.visibility?.showCategory !== false,
    showDescription: awardee.visibility?.showDescription !== false,
    showDate: awardee.visibility?.showDate !== false,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={awardee.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-full"
        style={{ backgroundColor: awardee.slideTheme?.backgroundColor || undefined }}
      >
        {/* Background animated gradient */}
        <motion.div
          className="absolute inset-0 opacity-20"
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

        <div className={`relative flex items-center px-16 py-12 h-full`}>
          <div className={`grid ${visibility.showPhoto ? 'grid-cols-2' : 'grid-cols-1'} gap-12 w-full items-center ${!visibility.showPhoto ? 'max-w-[70%] mx-auto' : ''}`}>
            {/* Left side - Awardee Photo */}
            {visibility.showPhoto && (
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                className="flex justify-center"
              >
                <div className="relative">
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
                    className={`relative rounded-full overflow-hidden border-4 border-white/20 shadow-2xl ${colors.glow} ${isPreviewMode ? 'w-[540px] h-[540px]' : 'w-96 h-96'}`}
                    style={{ transformStyle: "preserve-3d" }}
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
                    className={`absolute -right-4 w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${colors.glow} z-10`}
                    style={{
                      bottom: 'calc(-3rem + 96px)', // Moved down 48px (0.5 inches at 96 DPI)
                      background: awardee.logoBadgeColor || `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                      backgroundImage: !awardee.logoBadgeColor ? `linear-gradient(to bottom right, ${colors.gradient.includes('blue') ? 'rgb(59 130 246), rgb(34 211 238)' : colors.gradient.includes('amber') ? 'rgb(245 158 11), rgb(250 204 21)' : colors.gradient.includes('emerald') ? 'rgb(16 185 129), rgb(20 184 166)' : colors.gradient.includes('purple') ? 'rgb(168 85 247), rgb(236 72 153)' : 'rgb(100 116 139), rgb(148 163 184)'})` : undefined
                    }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  >
                    <div className="text-white">
                      {awardee.brandLogo ? (
                        <img 
                          src={awardee.brandLogo} 
                          alt="Brand logo" 
                          className="w-14 h-14 object-cover rounded-full"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        getCategoryIcon(awardee.category, awardee.selectedIcon)
                      )}
                    </div>
                  </motion.div>

                  {/* Star-shaped glitters around the picture */}
                  {[...Array(12)].map((_, i) => {
                    // Calculate positions in a circle around the photo
                    const angle = (i / 12) * 2 * Math.PI;
                    const radius = (isPreviewMode ? 300 : 200) + Math.random() * 60; // Distance from center adjusted for image size
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    return (
                      <motion.div
                        key={i}
                        className="absolute text-yellow-300"
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
                </div>
              </motion.div>
            )}

            {/* Right side - Award Details */}
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
              className="space-y-6"
            >
              {/* Header section */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  {visibility.showCategory && (
                    <motion.div
                      className={`px-4 py-2 rounded-full text-white font-semibold shadow-lg ${isPreviewMode ? 'text-lg' : 'text-sm'}`}
                      style={accentStyle}
                      animate={{ boxShadow: ['0 0 20px rgba(255,255,255,0.2)', '0 0 40px rgba(255,255,255,0.4)', '0 0 20px rgba(255,255,255,0.2)'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {awardee.category}
                    </motion.div>
                  )}
                  {visibility.showDate && (
                    <div className={`flex items-center gap-2 text-white/60 ${isPreviewMode ? 'text-base' : 'text-sm'}`}>
                      <Calendar className={isPreviewMode ? 'w-5 h-5' : 'w-4 h-4'} />
                      {awardee.date}
                    </div>
                  )}
                </div>

                {visibility.showName && (
                  <motion.h1
                    className={`font-bold text-white mb-3 leading-tight ${isPreviewMode ? 'text-7xl' : 'text-6xl'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    {awardee.name}
                  </motion.h1>
                )}

                <motion.div
                  className="h-2 rounded-full"
                  style={accentStyle}
                  initial={{ width: 0 }}
                  animate={{ width: '120px' }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                />
              </motion.div>

              {/* Recipient details */}
              {visibility.showTitle && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-2"
                >
                  <h2 className={`font-bold text-white ${isPreviewMode ? 'text-5xl' : 'text-4xl'}`}>
                    {awardee.title}
                  </h2>
                </motion.div>
              )}

              {/* Award description */}
              {visibility.showDescription && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                >
                  <p 
                    className="text-white/90 leading-relaxed whitespace-pre-line" 
                    style={{ fontSize: awardee.descriptionTextSize ? `${awardee.descriptionTextSize}px` : (isPreviewMode ? '16px' : '13px') }}
                  >
                    {awardee.description}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Animated corner decorations */}
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </AnimatePresence>
  );
}