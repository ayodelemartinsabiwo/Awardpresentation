import { AwardCard } from './components/AwardCard';
import { EditorPanel } from './components/EditorPanel';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { projectId, publicAnonKey } from './utils/supabase/info';
import logoImage from 'figma:asset/4b719275cd951e102b70ffa534898fd07dcfed8f.png';

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
  organizationLogo?: string;
  organizationLogoPath?: string;
  organizationLogoSize?: 'small' | 'medium';
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
  layout?: {
    photo?: { x: number; y: number; width: number; height: number };
    name?: { x: number; y: number; width: number; height: number };
    title?: { x: number; y: number; width: number; height: number };
    category?: { x: number; y: number; width: number; height: number };
    description?: { x: number; y: number; width: number; height: number };
    date?: { x: number; y: number; width: number; height: number };
    logo?: { x: number; y: number };
  };
}

// Default awardees if database is empty
const defaultAwardees: Awardee[] = [
  {
    id: 1,
    name: "Iyanuoluwa Olutunmbi",
    title: "FP&A Manager",
    award: "Iyanuoluwa Olutunmbi",
    description: "Iyanu joined the organization only a few months ago, yet within a very short period he has successfully assumed the responsibilities of the FP&A Manager role with confidence and maturity. He quickly developed a strong understanding of the business, financial processes, and stakeholder expectations, enabling him to add value almost immediately.\n\nIyanu demonstrated true ownership by proactively driving the FP&A agenda, coordinating effectively with cross-functional teams, and ensuring timely closure of key deliverables. His structured approach, accountability mindset, and ability to follow through on commitments have helped bring clarity and discipline to financial planning and reporting activities.\n\nDespite being new to the role and organization, Iyanu has shown strong leadership behaviors, reliability, and a results-oriented mindset. His impact in such a short time reflects both his capability and dedication, making him highly deserving of this nomination.",
    date: "February 2026",
    category: "Act as Owner",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
  },
  {
    id: 2,
    name: "Michael Chen",
    title: "Product Manager",
    award: "Leadership Award",
    description: "For exceptional leadership in driving cross-functional collaboration and delivering key projects ahead of schedule.",
    date: "February 2026",
    category: "Leadership",
    photo: "https://images.unsplash.com/photo-1738566061505-556830f8b8f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBhc2lhbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzcwMDQ1NTE0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    title: "Customer Success Manager",
    award: "Customer Champion",
    description: "For consistently exceeding customer satisfaction targets and building lasting client relationships.",
    date: "February 2026",
    category: "Customer Excellence",
    photo: "https://images.unsplash.com/photo-1600696444233-20accba67df3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBsYXRpbmElMjB3b21hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDAyNDE1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 4,
    name: "David Park",
    title: "Data Analyst",
    award: "Rising Star Award",
    description: "For demonstrating exceptional growth, initiative, and impact in their first year with the company.",
    date: "February 2026",
    category: "Emerging Talent",
    photo: "https://images.unsplash.com/photo-1620853724625-4715441de25d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBrb3JlYW4lMjBtYW4lMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzAwNDU1MTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
];

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [awardees, setAwardees] = useState<Awardee[]>(defaultAwardees);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editorPanelWidth, setEditorPanelWidth] = useState(Math.max(600, window.innerWidth * 0.25));
  const [isLayoutEditMode, setIsLayoutEditMode] = useState(false);
  const [layoutEditSlideIndex, setLayoutEditSlideIndex] = useState(0);
  const [layoutUpdateHandler, setLayoutUpdateHandler] = useState<((elementId: string, position: { x: number; y: number }, size: { width: number; height: number }) => void) | null>(null);

  // Load awardees from database on mount
  useEffect(() => {
    loadAwardees();
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditorOpen) return; // Disable keyboard nav when editor is open
      
      switch (e.key) {
        case 'ArrowLeft':
          prevSlide();
          break;
        case 'ArrowRight':
          nextSlide();
          break;
        case 'Escape':
          if (isPreviewMode) {
            setIsPreviewMode(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditorOpen, isPreviewMode, currentSlide, awardees.length]);

  // Sync current slide with layout edit slide when layout mode is enabled
  useEffect(() => {
    if (isLayoutEditMode && layoutEditSlideIndex !== currentSlide) {
      setCurrentSlide(layoutEditSlideIndex);
    }
  }, [isLayoutEditMode, layoutEditSlideIndex]);

  const loadAwardees = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b6556629/awardees`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      const data = await response.json();
      
      // Check if we have awardees in the database
      if (data.awardees && data.awardees.length > 0) {
        // Remove any duplicates based on ID (keep the first occurrence)
        const uniqueAwardees = data.awardees.reduce((acc: Awardee[], current: Awardee) => {
          const exists = acc.find(item => item.id === current.id);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);
        
        setAwardees(uniqueAwardees);
      } else {
        // Database is empty, initialize with defaults
        await initializeDefaultData();
        setAwardees(defaultAwardees);
      }
    } catch (error) {
      console.error('Failed to load awardees:', error);
      // Use default awardees if loading fails
      setAwardees(defaultAwardees);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultData = async () => {
    try {
      await Promise.all(
        defaultAwardees.map(async (awardee) => {
          await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-b6556629/awardees`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`
              },
              body: JSON.stringify(awardee)
            }
          );
        })
      );
      return true;
    } catch (error) {
      console.error('Failed to initialize default data:', error);
      return false;
    }
  };

  const handleUpdate = (updatedAwardees: Awardee[]) => {
    setAwardees(updatedAwardees);
    // Don't close the editor panel - let users close it manually
    // Adjust current slide if needed
    if (currentSlide >= updatedAwardees.length) {
      setCurrentSlide(Math.max(0, updatedAwardees.length - 1));
    }
  };

  const handleLayoutModeChange = (
    isEditMode: boolean,
    activeSlideIndex: number,
    onLayoutUpdate: (elementId: string, position: { x: number; y: number }, size: { width: number; height: number }) => void
  ) => {
    setIsLayoutEditMode(isEditMode);
    setLayoutEditSlideIndex(activeSlideIndex);
    setCurrentSlide(activeSlideIndex); // Sync the current slide with the active tab
    setLayoutUpdateHandler(() => onLayoutUpdate);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % visibleAwardees.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + visibleAwardees.length) % visibleAwardees.length);
  };

  // Filter out hidden awardees in preview mode
  const visibleAwardees = isPreviewMode 
    ? awardees.filter(awardee => !awardee.isHidden)
    : awardees;

  // Calculate scale factor for edit preview based on available width
  const calculateScale = () => {
    if (!isEditorOpen) return 1;
    const availableWidth = window.innerWidth - editorPanelWidth;
    const baseWidth = window.innerWidth * 0.85; // 85vw when editor closed
    const scale = Math.max(0.5, Math.min(1, availableWidth / baseWidth));
    return scale;
  };

  const previewScale = calculateScale();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading presentation...</div>
      </div>
    );
  }

  return (
    <div className={`h-screen overflow-hidden bg-slate-900 ${isPreviewMode ? '' : 'flex'}`}>
      {/* Edit Mode Container with Header */}
      {!isPreviewMode ? (
        <>
          {/* Preview Area - Takes available space on the left */}
          <div 
            className="transition-all duration-300"
            style={{
              width: isEditorOpen ? `calc(100vw - ${editorPanelWidth}px)` : '100vw',
              height: '100vh',
              padding: isEditorOpen ? '4px' : '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Header with buttons */}
            <div 
              className="flex items-center justify-between bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700/50 flex-shrink-0 transition-all duration-300 gap-2 md:gap-4 flex-wrap md:flex-nowrap"
              style={{
                padding: isEditorOpen ? '12px 16px' : '16px 24px'
              }}
            >
              <button
                onClick={() => setIsPreviewMode(true)}
                className="group bg-emerald-600/80 hover:bg-emerald-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-300 backdrop-blur-sm flex items-center gap-2 text-sm md:text-base flex-1 md:flex-initial justify-center"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="whitespace-nowrap font-medium hidden sm:inline">
                  Presentation Preview
                </span>
                <span className="whitespace-nowrap font-medium sm:hidden">
                  Preview
                </span>
              </button>
              
              <button
                onClick={() => setIsEditorOpen(true)}
                className="group bg-blue-600/80 hover:bg-blue-600 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-300 backdrop-blur-sm flex items-center gap-2 text-sm md:text-base flex-1 md:flex-initial justify-center"
              >
                <Edit className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span className="whitespace-nowrap font-medium hidden sm:inline">
                  Edit Awards
                </span>
                <span className="whitespace-nowrap font-medium sm:hidden">
                  Edit
                </span>
              </button>
            </div>

            {/* Presentation slide container - 16:9 aspect ratio */}
            <div 
              className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden flex-1"
              style={{ 
                maxHeight: 'calc(100vh - 80px)'
              }}
            >
              {/* Current award slide */}
              <AwardCard 
                awardee={awardees[currentSlide]} 
                slideNumber={currentSlide + 1}
                totalSlides={awardees.length}
                isPreviewMode={isPreviewMode}
                isLayoutEditMode={isLayoutEditMode}
                onLayoutUpdate={layoutUpdateHandler || undefined}
              />

              {/* Navigation controls - Only show if not at boundaries and not in preview mode */}
              {!isPreviewMode && currentSlide > 0 && (
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-all z-10 hover:scale-110"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-8 h-8" strokeWidth={2.5} />
                </button>
              )}

              {!isPreviewMode && currentSlide < awardees.length - 1 && (
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-all z-10 hover:scale-110"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-8 h-8" strokeWidth={2.5} />
                </button>
              )}

              {/* Slide indicators - disabled in layout edit mode */}
              {!isLayoutEditMode && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
                  {awardees.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`rounded-full transition-all ${
                        index === currentSlide
                          ? 'bg-white'
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                      style={{
                        width: index === currentSlide ? (window.innerWidth < 640 ? '24px' : '32px') : (window.innerWidth < 640 ? '8px' : '12px'),
                        height: window.innerWidth < 640 ? '8px' : '12px'
                      }}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Preview Mode - Fullscreen */
        <div className="w-full h-screen relative bg-gradient-to-br from-slate-800 to-slate-900">
          {/* Current award slide */}
          <AwardCard 
            awardee={visibleAwardees[currentSlide]} 
            slideNumber={currentSlide + 1}
            totalSlides={visibleAwardees.length}
            isPreviewMode={isPreviewMode}
          />

          {/* Slide indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
            {visibleAwardees.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-white'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                style={{
                  width: index === currentSlide ? (window.innerWidth < 640 ? '24px' : '32px') : (window.innerWidth < 640 ? '8px' : '12px'),
                  height: window.innerWidth < 640 ? '8px' : '12px'
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Editor Panel */}
      {isEditorOpen && (
        <EditorPanel
          awardees={awardees}
          onUpdate={handleUpdate}
          onClose={() => setIsEditorOpen(false)}
          onWidthChange={(width) => setEditorPanelWidth(width)}
          onLayoutModeChange={handleLayoutModeChange}
        />
      )}
    </div>
  );
}