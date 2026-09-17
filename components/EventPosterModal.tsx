import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  Sparkles, Download, Save, Upload, Image as ImageIcon, 
  Edit3, ChevronDown, ChevronUp, Check, 
  X, Loader2, Info, Shield, Crosshair, Flame, Zap, 
  RefreshCw, Layers, Eye, FileText, Skull, Award, Target, Flag,
  Calendar, Clock, MapPin, DollarSign, Radio
} from 'lucide-react';
import { EventItem, InventoryItem, CompanyDetails } from '../types';

interface EventPosterModalProps {
  event: EventItem;
  inventory: InventoryItem[];
  companyDetails: CompanyDetails;
  onClose: () => void;
  onUpdateEventImage?: (newUrl: string) => void;
}

// Intelligent Auto-Detection Engine based on Bosjol Tactical Airsoft Specifications
export function autoDetectEventIntel(event: EventItem, inventory: InventoryItem[] = []) {
  const combinedText = `${event.title || ''} ${event.operationalTheme || ''} ${event.themeName || ''} ${event.description || ''} ${event.rules || ''}`.toLowerCase();
  
  let scenario = 'CQB Operator Warfare';
  let theme: 'neon_lime' | 'red_vs_blue' | 'crimson_flare' | 'cyber_cobalt' = 'neon_lime';
  let subject: 'tactical_operator' | 'tactical_ape' | 'ghillie_sniper' | 'heavy_juggernaut' | 'dual_faceoff' = 'tactical_operator';
  let layout: 'symmetrical' | 'asymmetrical' = 'symmetrical';
  let hype = 'RUN HIDE REVIVE';
  let catchphrase = 'MORE THAN A GAME';
  let dogTagLeft = 'DRINKS AVAILABLE AT THE FIELD';
  let dogTagRight = 'CAPTURE REPLACE DOMINATE';
  let missionBrief = event.description || 'Eliminate hostile squad presence, secure tactical containers, and achieve operational dominance.';
  let standardRules = '1. Full face protection mandatory under 18\n2. Biodegradable BBs only on field\n3. Chrono limit 1.5 Joules max\n4. Honor system: call your hits';
  let variantRules = '• Biohazard / Virus infection mode enabled\n• 2-minute bleedout / buddy revive\n• Designated squad medic per fireteam\n• Semi-auto only inside fortress';

  // Check for Fort / Flag / Red vs Blue / War / Base
  if (/fort|base|flag|capture|two team|red vs blue|versus|showdown|wars|dominat/.test(combinedText)) {
    scenario = 'Dual Fortress Showdown (Red vs Blue Wars)';
    theme = 'red_vs_blue';
    subject = 'dual_faceoff';
    layout = 'symmetrical';
    hype = 'CAPTURE REPLACE DOMINATE';
    catchphrase = 'MORE THAN A GAME';
    dogTagLeft = 'DRINKS AVAILABLE AT THE FIELD';
    dogTagRight = 'CAPTURE REPLACE DOMINATE';
    missionBrief = event.description || "TWO TEAMS WITH THE OBJECTIVE OF REPLACING THE OTHER TEAM'S FLAG AT THE BASE WITH YOUR OWN.";
  } 
  // Check for Monkey / Ape / Middle / Chimp / Jungle / Primate
  else if (/monkey|ape|chimp|primate|middle|jungle|beast/.test(combinedText)) {
    scenario = 'Operation Monkey in the Middle';
    theme = 'neon_lime';
    subject = 'tactical_ape';
    layout = 'asymmetrical';
    hype = 'RUN HIDE REVIVE TAKE OVER';
    catchphrase = "BB'S FUEL FUN";
    dogTagLeft = 'DRINKS AVAILABLE AT THE FIELD';
    dogTagRight = 'AIRSOFT = FAMILY';
    standardRules = '1. Full face protection mandatory under 18\n2. Biodegradable BBs only on field\n3. Chrono limit 1.5 Joules max\n4. Honor system: call your hits';
    variantRules = '• Biohazard / Virus infection mode enabled\n• 2-minute bleedout / buddy revive\n• Designated squad medic per fireteam\n• Semi-auto only inside fortress';
  }
  // Check for Ghillie / Sniper / Recon / Woodland / Scout
  else if (/sniper|ghillie|recon|woodland|marksman|ghost|scout/.test(combinedText)) {
    scenario = 'Ghost Recon Ghillie Ops';
    theme = 'cyber_cobalt';
    subject = 'ghillie_sniper';
    layout = 'symmetrical';
    hype = 'ONE SHOT ONE HIT';
    catchphrase = 'SILENT ACCURACY';
    dogTagLeft = 'HIGH-PRECISION OPS';
    dogTagRight = 'ONE SHOT ONE HIT';
  }
  // Check for Juggernaut / Heavy / Bomb / Biohazard / Outbreak
  else if (/juggernaut|heavy|bomb|biohazard|virus|infection|outbreak|hazard/.test(combinedText)) {
    scenario = 'Biohazard Juggernaut Outbreak';
    theme = 'crimson_flare';
    subject = 'heavy_juggernaut';
    layout = 'asymmetrical';
    hype = 'SURVIVE THE INFESTATION';
    catchphrase = 'CONTAIN THE OUTBREAK';
    dogTagLeft = 'HAZMAT PROTOCOL';
    dogTagRight = 'QUARANTINE ZONE';
  }

  return {
    scenario,
    theme,
    subject,
    layout,
    hype,
    catchphrase,
    dogTagLeft,
    dogTagRight,
    missionBrief,
    standardRules,
    variantRules
  };
}

// Curated client-side tactical base plates for instantaneous rendering & resilience
const CLIENT_TACTICAL_BASEPLATES: Record<string, string> = {
  dual_faceoff: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
  tactical_ape: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
  tactical_operator: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
  ghillie_sniper: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
  heavy_juggernaut: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'
};

export const EventPosterModal: React.FC<EventPosterModalProps> = ({
  event,
  inventory,
  companyDetails,
  onClose,
  onUpdateEventImage
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const autoGeneratedRef = useRef<boolean>(false);

  // Auto-detect initial intel from event data
  const initialIntel = autoDetectEventIntel(event, inventory);

  // Form & Poster State
  const [posterTitle, setPosterTitle] = useState<string>(event.title || 'OPERATION FORT WARS');
  const [posterHypeText, setPosterHypeText] = useState<string>(initialIntel.hype);
  const [posterCatchphrase, setPosterCatchphrase] = useState<string>(initialIntel.catchphrase);
  const [posterType, setPosterType] = useState<string>(event.type || 'Mission');
  const [posterThemeName, setPosterThemeName] = useState<string>(event.themeName || event.operationalTheme || initialIntel.scenario);
  const [posterDate, setPosterDate] = useState<string>(event.date || new Date().toISOString().split('T')[0]);
  const [posterStartTime, setPosterStartTime] = useState<string>(event.startTime || '12:00');
  const [posterBriefingTime, setPosterBriefingTime] = useState<string>(event.briefingTime || '11:30');
  const [posterLocation, setPosterLocation] = useState<string>(event.location || 'Bosjol Arena - Pretoria');
  const [posterGameFee, setPosterGameFee] = useState<number>(event.gameFee ?? 100);
  const [posterRentalFee, setPosterRentalFee] = useState<number>(event.rentalFee ?? 350);
  const [posterMissionBrief, setPosterMissionBrief] = useState<string>(initialIntel.missionBrief);
  const [posterStandardRules, setPosterStandardRules] = useState<string>(initialIntel.standardRules);
  const [posterVariantRules, setPosterVariantRules] = useState<string>(initialIntel.variantRules);

  // Visual Theme & Layout State (Auto-Detected)
  const [visualTheme, setVisualTheme] = useState<'neon_lime' | 'red_vs_blue' | 'crimson_flare' | 'cyber_cobalt'>(initialIntel.theme);
  const [subjectPreset, setSubjectPreset] = useState<'tactical_operator' | 'tactical_ape' | 'ghillie_sniper' | 'heavy_juggernaut' | 'dual_faceoff'>(initialIntel.subject);
  const [layoutStyle, setLayoutStyle] = useState<'symmetrical' | 'asymmetrical'>(initialIntel.layout);
  const [viewMode, setViewMode] = useState<'composite' | 'raw'>('composite');
  const [showVectorOverlay, setShowVectorOverlay] = useState<boolean>(true);

  // Background artwork & AI generator state
  const [posterBgUrl, setPosterBgUrl] = useState<string>(
    event.imageUrl || 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80'
  );
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [showTextEditor, setShowTextEditor] = useState<boolean>(false);

  // Available rental gear summary
  const rentalGearNames = inventory
    .filter(i => i.isRental)
    .map(i => i.name)
    .slice(0, 3)
    .join(', ') || 'AEG Rifle, Face Mask, Ammo';

  // AI Generation Handler: calls backend endpoint with auto-detected event intel
  const handleGenerateAiPoster = async (overrideSubject?: any) => {
    setIsGeneratingAi(true);
    setAiNotice(null);

    const activeSubject = overrideSubject || subjectPreset;
    const clientFallback = CLIENT_TACTICAL_BASEPLATES[activeSubject] || CLIENT_TACTICAL_BASEPLATES.tactical_operator;

    try {
      let res: Response | null = null;
      let networkError = false;

      try {
        res = await fetch('/api/generate-poster', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: '',
            title: posterTitle,
            theme: posterThemeName,
            type: posterType,
            location: posterLocation,
            description: posterMissionBrief,
            rules: posterStandardRules,
            rentalInfo: rentalGearNames,
            bgImageUrl: posterBgUrl,
            gameFee: posterGameFee,
            rentalFee: posterRentalFee,
            date: posterDate,
            startTime: posterStartTime,
            briefingTime: posterBriefingTime,
            subjectType: activeSubject,
            hypeText: posterHypeText,
            layoutStyle: layoutStyle,
            generateMode: 'full_poster'
          })
        });
      } catch (networkErr) {
        networkError = true;
        console.warn('Network call to /api/generate-poster failed:', networkErr);
      }

      let data: any = null;
      if (res && res.ok) {
        try {
          data = await res.json();
        } catch {
          data = null;
        }
      }

      // Case 1: Endpoint returned valid image
      if (data && data.imageUrl) {
        setPosterBgUrl(data.imageUrl);
        if (data.apiKeyConfigured === false) {
          setAiNotice(data.notice || 'Tactical base plate active. Set GEMINI_API_KEY in your environment to generate custom AI artwork.');
          setSaveSuccessMsg('✓ Tactical 3D Master ready!');
        } else if (data.fallbackUsed) {
          setAiNotice(data.notice);
          setSaveSuccessMsg('✓ 3D Master ready with tactical plate!');
        } else {
          setSaveSuccessMsg('✓ 3D Cinematic Poster synthesized successfully!');
        }
        setTimeout(() => setSaveSuccessMsg(null), 3500);
        return;
      }

      // Case 2: Attempt client-side direct generation if VITE_GEMINI_API_KEY is configured in Vercel
      const clientApiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (clientApiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey: clientApiKey });
          const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-image',
            contents: {
              parts: [{
                text: `Masterpiece promotional marketing event poster for "Bosjol Tactical Airsoft", 3D cinematic realism, 8k resolution, octane render, extreme depth of field, dramatic volumetric atmospheric lighting, heavy grunge textures. Title: "${posterTitle}". Scenario: ${posterThemeName}. Mode: ${posterType}. Date: ${posterDate}. Aspect ratio 3:4.`
              }]
            },
            config: {
              imageConfig: { aspectRatio: '3:4', imageSize: '1K' }
            } as any
          });

          let clientImg = '';
          if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                clientImg = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                break;
              }
            }
          }

          if (clientImg) {
            setPosterBgUrl(clientImg);
            setSaveSuccessMsg('✓ 3D Cinematic Poster synthesized via client AI!');
            setTimeout(() => setSaveSuccessMsg(null), 3500);
            return;
          }
        } catch (clientErr: any) {
          console.warn('Client-side Gemini generation attempt failed:', clientErr);
        }
      }

      // Case 3: Fallback smoothly to scenario tactical base plate with clear Vercel configuration guidance
      setPosterBgUrl(clientFallback);
      if (res?.status === 404 || networkError) {
        setAiNotice(
          'Vercel Deployment Notice: The serverless endpoint /api/generate-poster was not found on this deployment. We have added /api/generate-poster.ts and vercel.json to the repository. Please commit these files and set GEMINI_API_KEY in Vercel Project Settings > Environment Variables, then redeploy.'
        );
      } else {
        setAiNotice('High-definition tactical base plate active. Set GEMINI_API_KEY in Vercel Project Settings > Environment Variables.');
      }
      setSaveSuccessMsg('✓ Tactical 3D Master ready with base plate!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err: any) {
      console.warn('Poster generation handler error:', err?.message || err);
      setPosterBgUrl(clientFallback);
      setAiNotice('Tactical base plate active.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Auto-trigger generation on mount if no artwork exists
  useEffect(() => {
    if (!autoGeneratedRef.current) {
      autoGeneratedRef.current = true;
      if (!event.imageUrl || event.imageUrl === companyDetails.logoUrl) {
        handleGenerateAiPoster();
      }
    }
  }, []);

  // Handle custom image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPosterBgUrl(reader.result);
        setSaveSuccessMsg('Custom artwork uploaded and applied!');
        setTimeout(() => setSaveSuccessMsg(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save to default event image
  const handleSaveToEventImage = () => {
    const canvas = canvasRef.current;
    const urlToSave = showVectorOverlay && canvas ? canvas.toDataURL('image/jpeg', 0.95) : posterBgUrl;
    if (urlToSave && onUpdateEventImage) {
      onUpdateEventImage(urlToSave);
      setSaveSuccessMsg('✓ Saved as default Event Image!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  // Download high-resolution JPG
  const handleDownloadJpg = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.98);
    const link = document.createElement('a');
    const safeTitle = posterTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `Bosjol_Tactical_Poster_${safeTitle}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  // 1200 x 1600 Ultra HD Canvas Rendering Loop
  useEffect(() => {
    let isCancelled = false;

    const runRender = async () => {
      try {
        await document.fonts.ready;
      } catch (e) {
        // Fallback
      }

      if (isCancelled) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1200;
      canvas.height = 1600;

      const renderPoster = (bgImg?: HTMLImageElement) => {
        // 1. Color Palettes
        let primaryAccent = '#22c55e'; // Neon Lime Green
        let secondaryAccent = '#ffffff';
        let darkBase = '#090a0f';
        let neonBorder = 'rgba(34, 197, 94, 0.55)';

        if (visualTheme === 'red_vs_blue') {
          primaryAccent = '#ef4444'; // Bright Red
          secondaryAccent = '#3b82f6'; // Bright Blue
          darkBase = '#0a0910';
          neonBorder = 'rgba(239, 68, 68, 0.55)';
        } else if (visualTheme === 'crimson_flare') {
          primaryAccent = '#dc2626';
          secondaryAccent = '#f97316';
          darkBase = '#120505';
          neonBorder = 'rgba(220, 38, 38, 0.6)';
        } else if (visualTheme === 'cyber_cobalt') {
          primaryAccent = '#06b6d4';
          secondaryAccent = '#3b82f6';
          darkBase = '#03111b';
          neonBorder = 'rgba(6, 182, 212, 0.6)';
        }

        // Base Canvas Fill
        ctx.fillStyle = darkBase;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Background Image Rendering with Gritty Military Grade Effects
        if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
          ctx.save();
          const scale = Math.max(canvas.width / bgImg.naturalWidth, canvas.height / bgImg.naturalHeight);
          const x = (canvas.width - bgImg.naturalWidth * scale) / 2;
          const y = (canvas.height - bgImg.naturalHeight * scale) / 2;
          ctx.drawImage(bgImg, x, y, bgImg.naturalWidth * scale, bgImg.naturalHeight * scale);

          // If Vector Overlay is disabled, show the direct raw 3D AI poster artwork
          if (!showVectorOverlay) {
            ctx.restore();
            return;
          }

          // Gritty Atmospheric Vignette for Typography Legibility
          const vignette = ctx.createLinearGradient(0, 0, 0, canvas.height);
          vignette.addColorStop(0, 'rgba(7, 8, 12, 0.90)');
          vignette.addColorStop(0.18, 'rgba(7, 8, 12, 0.35)');
          vignette.addColorStop(0.55, 'rgba(7, 8, 12, 0.55)');
          vignette.addColorStop(0.82, 'rgba(7, 8, 12, 0.88)');
          vignette.addColorStop(1, 'rgba(5, 6, 10, 0.98)');
          ctx.fillStyle = vignette;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Symmetrical Red vs Blue Tactical Lighting Smoke
          if (visualTheme === 'red_vs_blue') {
            const redGlow = ctx.createRadialGradient(0, 550, 40, 0, 550, 650);
            redGlow.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
            redGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = redGlow;
            ctx.fillRect(0, 0, canvas.width / 2, canvas.height);

            const blueGlow = ctx.createRadialGradient(1200, 550, 40, 1200, 550, 650);
            blueGlow.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
            blueGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = blueGlow;
            ctx.fillRect(canvas.width / 2, 0, canvas.width / 2, canvas.height);
          } else {
            const centerGlow = ctx.createRadialGradient(600, 520, 50, 600, 520, 700);
            centerGlow.addColorStop(0, visualTheme === 'neon_lime' ? 'rgba(34, 197, 94, 0.28)' : 'rgba(220, 38, 38, 0.28)');
            centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = centerGlow;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.restore();
        } else {
          // Procedural Gritty Backdrop
          const grad = ctx.createRadialGradient(600, 650, 100, 600, 650, 1000);
          grad.addColorStop(0, '#1a2219');
          grad.addColorStop(1, darkBase);
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (!showVectorOverlay) return;

        // 3. Floating Angled Hype Graffiti / Stamp (Background Depth)
        ctx.save();
        ctx.translate(canvas.width / 2, 380);
        ctx.rotate((-10 * Math.PI) / 180);
        ctx.textAlign = 'center';
        ctx.font = '900 96px "Permanent Marker", "Black Ops One", Impact, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeStyle = visualTheme === 'red_vs_blue' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)';
        ctx.lineWidth = 3;
        const hypeText = (posterHypeText || 'CAPTURE REPLACE DOMINATE').toUpperCase();
        ctx.fillText(hypeText, 0, 0);
        ctx.strokeText(hypeText, 0, 0);
        ctx.restore();

        // Secondary aggressive brush-stroke catchphrase
        ctx.save();
        ctx.translate(canvas.width - 240, 240);
        ctx.rotate((8 * Math.PI) / 180);
        ctx.textAlign = 'center';
        ctx.font = '900 28px "Permanent Marker", cursive, sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 8;
        ctx.fillText(`"${(posterCatchphrase || 'MORE THAN A GAME').toUpperCase()}"`, 0, 0);
        ctx.shadowBlur = 0;
        ctx.restore();

        // 4. Outer Precision Tactical Frame & Corner Crosshairs
        ctx.strokeStyle = primaryAccent;
        ctx.lineWidth = 4;
        ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

        const drawCrosshair = (cx: number, cy: number, color: string) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, 14, 0, Math.PI * 2);
          ctx.moveTo(cx - 20, cy); ctx.lineTo(cx + 20, cy);
          ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy + 20);
          ctx.stroke();
        };
        drawCrosshair(55, 55, primaryAccent);
        drawCrosshair(canvas.width - 55, 55, visualTheme === 'red_vs_blue' ? secondaryAccent : primaryAccent);
        drawCrosshair(55, canvas.height - 55, primaryAccent);
        drawCrosshair(canvas.width - 55, canvas.height - 55, visualTheme === 'red_vs_blue' ? secondaryAccent : primaryAccent);

        // 5. HEADER & TEAM FLAGS (Dual Fortress or Insignia)
        if (visualTheme === 'red_vs_blue') {
          // Red Team Flag (Top Left)
          ctx.save();
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(65, 55);
          ctx.lineTo(155, 55);
          ctx.lineTo(155, 115);
          ctx.lineTo(110, 95);
          ctx.lineTo(65, 115);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 13px "Chakra Petch", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('RED TEAM', 110, 80);
          ctx.restore();

          // Blue Team Flag (Top Right)
          ctx.save();
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.moveTo(canvas.width - 155, 55);
          ctx.lineTo(canvas.width - 65, 55);
          ctx.lineTo(canvas.width - 65, 115);
          ctx.lineTo(canvas.width - 110, 95);
          ctx.lineTo(canvas.width - 155, 115);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 13px "Chakra Petch", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('BLUE TEAM', canvas.width - 110, 80);
          ctx.restore();
        } else {
          // Tactical Shield Crest (Top Left)
          ctx.save();
          const crestX = 85;
          const crestY = 75;
          ctx.fillStyle = primaryAccent;
          ctx.beginPath();
          ctx.moveTo(crestX, crestY - 16);
          ctx.lineTo(crestX + 16, crestY - 8);
          ctx.lineTo(crestX + 16, crestY + 12);
          ctx.lineTo(crestX, crestY + 22);
          ctx.lineTo(crestX - 16, crestY + 12);
          ctx.lineTo(crestX - 16, crestY - 8);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#090a0f';
          ctx.font = '900 13px "Chakra Petch", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('B', crestX, crestY + 4);
          ctx.restore();
        }

        // Centered Header Text
        ctx.textAlign = 'center';
        ctx.font = '900 21px "Chakra Petch", sans-serif';
        ctx.letterSpacing = '8px';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = primaryAccent;
        ctx.shadowBlur = 14;
        ctx.fillText('B O S J O L   T A C T I C A L   A I R S O F T   P R E S E N T S', canvas.width / 2, 85);
        ctx.shadowBlur = 0;
        ctx.letterSpacing = '0px';

        // Glowing divider bar
        const lineGrad = ctx.createLinearGradient(140, 105, canvas.width - 140, 105);
        lineGrad.addColorStop(0, 'rgba(0,0,0,0)');
        lineGrad.addColorStop(0.5, primaryAccent);
        lineGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(140, 105);
        ctx.lineTo(canvas.width - 140, 105);
        ctx.stroke();

        // Category Tag
        ctx.fillStyle = primaryAccent;
        ctx.font = '900 15px monospace';
        ctx.fillText(`★ OFFICIAL ${posterType.toUpperCase()} // ${posterThemeName.toUpperCase()} ★`, canvas.width / 2, 135);

        // 6. HERO TITLE (Heavily Textured 3D Stencil)
        const rawTitle = (posterTitle || 'OPERATION FORT WARS').toUpperCase();
        let heroY = 240;

        // Custom Layout for Red vs Blue (Fort Wars)
        if (visualTheme === 'red_vs_blue' && rawTitle.includes('FORT') && rawTitle.includes('WARS')) {
          // Line 1: OPERATION: (White)
          ctx.font = '900 68px "Black Ops One", Impact, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#000000';
          ctx.fillText('OPERATION:', canvas.width / 2 + 5, heroY + 5);
          ctx.fillStyle = '#ffffff';
          ctx.fillText('OPERATION:', canvas.width / 2, heroY);

          heroY += 100;

          // Line 2: FORT (Red) and WARS (Blue)
          ctx.font = '900 100px "Black Ops One", Impact, sans-serif';
          const fortWidth = ctx.measureText('FORT ').width;
          const warsWidth = ctx.measureText('WARS').width;
          const totalWidth = fortWidth + warsWidth;
          const startTitleX = (canvas.width - totalWidth) / 2;

          ctx.textAlign = 'left';
          // FORT Shadow & Glow
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 24;
          ctx.fillStyle = '#ef4444';
          ctx.fillText('FORT ', startTitleX, heroY);
          ctx.shadowBlur = 0;

          // WARS Shadow & Glow
          ctx.shadowColor = '#3b82f6';
          ctx.shadowBlur = 24;
          ctx.fillStyle = '#3b82f6';
          ctx.fillText('WARS', startTitleX + fortWidth, heroY);
          ctx.shadowBlur = 0;

          heroY += 120;
        } 
        // Custom Layout for Monkey in the Middle
        else if (rawTitle.includes('MONKEY')) {
          // Line 1: OPERATION
          ctx.font = '900 52px "Black Ops One", Impact, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('OPERATION', canvas.width / 2, heroY);
          heroY += 95;

          // Line 2: MONKEY (Huge Neon Lime)
          ctx.font = '900 110px "Black Ops One", Impact, sans-serif';
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 28;
          ctx.fillStyle = '#22c55e';
          ctx.fillText('MONKEY', canvas.width / 2, heroY);
          ctx.shadowBlur = 0;
          heroY += 75;

          // Line 3: IN THE MIDDLE
          ctx.font = '900 52px "Black Ops One", Impact, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('IN THE MIDDLE', canvas.width / 2, heroY);
          heroY += 55;

          // Line 4: AIRSOFT GAME
          ctx.font = '900 32px "Chakra Petch", monospace';
          ctx.letterSpacing = '8px';
          ctx.fillStyle = '#22c55e';
          ctx.fillText('AIRSOFT GAME', canvas.width / 2, heroY);
          ctx.letterSpacing = '0px';
          heroY += 75;
        } 
        // Standard Contrasting 2-Line Title
        else {
          const words = rawTitle.split(' ');
          let line1 = words[0] || 'TACTICAL';
          let line2 = words.slice(1).join(' ') || 'MISSION';

          ctx.font = '900 86px "Black Ops One", Impact, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#000000';
          ctx.fillText(line1, canvas.width / 2 + 5, heroY + 5);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(line1, canvas.width / 2, heroY);

          heroY += 95;
          ctx.shadowColor = primaryAccent;
          ctx.shadowBlur = 24;
          ctx.fillStyle = primaryAccent;
          ctx.fillText(line2, canvas.width / 2, heroY);
          ctx.shadowBlur = 0;
          heroY += 120;
        }

        // 7. FLANKING ANCHORS & BADGES
        // Left Anchor: Red Splatter "5XP" Arcade Badge
        ctx.save();
        const xpX = 140;
        const xpY = heroY - 95;
        
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(xpX, xpY, 46, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(xpX, xpY, 40, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.font = '900 32px "Black Ops One", "Chakra Petch", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('5XP', xpX, xpY + 10);
        ctx.font = '900 11px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('+100 RP', xpX, xpY + 26);
        ctx.restore();

        // Right Anchor: Hanging Metallic Engraved Steel Dog Tags
        ctx.save();
        const tagX = canvas.width - 140;
        const tagY = heroY - 95;

        ctx.strokeStyle = '#a1a1aa';
        ctx.lineWidth = 2.5;
        for (let c = tagY - 65; c < tagY - 30; c += 10) {
          ctx.beginPath();
          ctx.arc(tagX, c, 4, 0, Math.PI * 2);
          ctx.stroke();
        }

        const tagGrad = ctx.createLinearGradient(tagX - 35, tagY - 35, tagX + 35, tagY + 45);
        tagGrad.addColorStop(0, '#3f3f46');
        tagGrad.addColorStop(0.5, '#27272a');
        tagGrad.addColorStop(1, '#18181b');
        ctx.fillStyle = tagGrad;
        ctx.beginPath();
        ctx.roundRect(tagX - 35, tagY - 32, 70, 78, 12);
        ctx.fill();

        ctx.strokeStyle = '#71717a';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#090a0f';
        ctx.beginPath();
        ctx.arc(tagX, tagY - 20, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 12px "Black Ops One", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BOSJOL', tagX, tagY + 10);
        ctx.fillStyle = primaryAccent;
        ctx.fillText('WARS', tagX, tagY + 28);
        ctx.restore();

        // Left Hanging Dog Tag: "DRINKS AVAILABLE AT THE FIELD"
        ctx.save();
        const drinkTagX = 140;
        const drinkTagY = heroY + 45;
        ctx.fillStyle = 'rgba(12, 16, 24, 0.94)';
        ctx.beginPath();
        ctx.roundRect(drinkTagX - 60, drinkTagY - 24, 120, 48, 8);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.font = '900 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🥤 DRINKS AVAILABLE', drinkTagX, drinkTagY - 4);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('AT THE FIELD', drinkTagX, drinkTagY + 12);
        ctx.restore();

        // Right Hanging Tag: "CAPTURE REPLACE DOMINATE"
        ctx.save();
        const capTagX = canvas.width - 140;
        const capTagY = heroY + 45;
        ctx.fillStyle = 'rgba(12, 16, 24, 0.94)';
        ctx.beginPath();
        ctx.roundRect(capTagX - 60, capTagY - 24, 120, 48, 8);
        ctx.fill();
        ctx.strokeStyle = visualTheme === 'red_vs_blue' ? '#3b82f6' : primaryAccent;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ CAPTURE', capTagX, capTagY - 4);
        ctx.fillStyle = visualTheme === 'red_vs_blue' ? '#60a5fa' : primaryAccent;
        ctx.font = 'bold 9px monospace';
        ctx.fillText('REPLACE DOMINATE', capTagX, capTagY + 12);
        ctx.restore();

        // Operational Mode Tag Banner
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
        const subBoxWidth = 560;
        ctx.beginPath();
        ctx.roundRect((canvas.width - subBoxWidth) / 2, heroY + 25, subBoxWidth, 42, 8);
        ctx.fill();
        ctx.strokeStyle = primaryAccent;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 18px monospace';
        ctx.fillText(`OPERATIONAL MODE: [ ${posterThemeName.toUpperCase()} ]`, canvas.width / 2, heroY + 52);

        heroY += 105;

        // 8. INFORMATION MODULES (MID-SECTION)
        const numBoxes = 4;
        const boxWidth = 260;
        const boxHeight = 122;
        const totalBoxesWidth = numBoxes * boxWidth;
        const boxGap = (canvas.width - 120 - totalBoxesWidth) / (numBoxes - 1);
        const startX = 60;
        const midSectionY = heroY;

        // Minimalist Vector Icon Drawers
        const drawVectorCalendar = (x: number, y: number, color: string) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.strokeRect(x - 14, y - 12, 28, 26);
          ctx.fillStyle = color;
          ctx.fillRect(x - 8, y - 17, 3, 6);
          ctx.fillRect(x + 5, y - 17, 3, 6);
          ctx.beginPath();
          ctx.moveTo(x - 14, y - 4);
          ctx.lineTo(x + 14, y - 4);
          ctx.stroke();
        };

        const drawVectorClock = (x: number, y: number, color: string) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(x, y, 14, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y - 8);
          ctx.moveTo(x, y);
          ctx.lineTo(x + 7, y);
          ctx.stroke();
        };

        const drawVectorMapPin = (x: number, y: number, color: string) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(x, y - 4, 9, 0, Math.PI * 2);
          ctx.moveTo(x - 9, y - 4);
          ctx.lineTo(x, y + 14);
          ctx.lineTo(x + 9, y - 4);
          ctx.stroke();
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y - 4, 3, 0, Math.PI * 2);
          ctx.fill();
        };

        const drawVectorPricing = (x: number, y: number, color: string) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(x - 6, y, 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x + 6, y, 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = color;
          ctx.font = '900 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('R', x, y + 4);
        };

        const formattedDate = posterDate
          ? new Date(posterDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()
          : 'SAT, 24 OCT';

        const infoModules = [
          {
            label: 'EVENT DATE',
            mainText: formattedDate,
            subText: 'OFFICIAL MATCHDAY',
            drawIcon: drawVectorCalendar,
            color: primaryAccent
          },
          {
            label: 'HOURS & BRIEFING',
            mainText: `${posterStartTime} OPS`,
            subText: `${posterBriefingTime} BRIEFING`,
            drawIcon: drawVectorClock,
            color: '#ffffff'
          },
          {
            label: 'ARENA LOCATION',
            mainText: posterLocation.length > 15 ? posterLocation.substring(0, 15) + '..' : posterLocation.toUpperCase(),
            subText: 'CQB & FIELD ACCESS',
            drawIcon: drawVectorMapPin,
            color: visualTheme === 'red_vs_blue' ? secondaryAccent : primaryAccent
          },
          {
            label: 'ZAR PRICING',
            mainText: `R${posterGameFee} / R${posterRentalFee}`,
            subText: 'OWN GEAR / RENTAL',
            drawIcon: drawVectorPricing,
            color: '#f59e0b'
          }
        ];

        infoModules.forEach((mod, idx) => {
          const boxX = startX + idx * (boxWidth + boxGap);
          
          ctx.fillStyle = 'rgba(10, 14, 22, 0.92)';
          ctx.beginPath();
          ctx.roundRect(boxX, midSectionY, boxWidth, boxHeight, 14);
          ctx.fill();

          ctx.strokeStyle = mod.color;
          ctx.lineWidth = 2;
          ctx.stroke();

          mod.drawIcon(boxX + 32, midSectionY + 32, mod.color);

          ctx.textAlign = 'left';
          ctx.fillStyle = mod.color;
          ctx.font = '900 12px monospace';
          ctx.fillText(mod.label, boxX + 58, midSectionY + 36);

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 20px "Chakra Petch", sans-serif';
          ctx.fillText(mod.mainText, boxX + 22, midSectionY + 77);

          ctx.fillStyle = '#a1a1aa';
          ctx.font = 'bold 12px monospace';
          ctx.fillText(mod.subText, boxX + 22, midSectionY + 103);
        });

        // 9. BODY CONTENT (RULES & MISSION BRIEFS)
        const bodyY = midSectionY + boxHeight + 35;
        const bodyWidth = canvas.width - 120;

        if (layoutStyle === 'symmetrical') {
          // Symmetrical Centralized Mission Brief Box
          ctx.fillStyle = 'rgba(9, 12, 18, 0.94)';
          ctx.beginPath();
          ctx.roundRect(60, bodyY, bodyWidth, 230, 16);
          ctx.fill();
          ctx.strokeStyle = neonBorder;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = primaryAccent;
          ctx.textAlign = 'center';
          ctx.font = '900 24px "Chakra Petch", sans-serif';
          ctx.fillText('━  M I S S I O N   B R I E F I N G   &   F I E L D   R U L E S  ━', canvas.width / 2, bodyY + 45);

          ctx.fillStyle = '#e4e4e7';
          ctx.font = 'bold 20px sans-serif';
          ctx.textAlign = 'center';
          
          const wordsDesc = posterMissionBrief.split(' ');
          let dLine1 = '';
          let dLine2 = '';
          for (const w of wordsDesc) {
            if ((dLine1 + ' ' + w).length <= 55) {
              dLine1 += (dLine1 ? ' ' : '') + w;
            } else {
              dLine2 += (dLine2 ? ' ' : '') + w;
            }
          }
          ctx.fillText(dLine1, canvas.width / 2, bodyY + 95);
          if (dLine2) {
            ctx.fillText(dLine2, canvas.width / 2, bodyY + 128);
          }

          ctx.strokeStyle = primaryAccent;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(120, bodyY + 155);
          ctx.lineTo(canvas.width - 120, bodyY + 155);
          ctx.stroke();

          ctx.fillStyle = '#facc15';
          ctx.font = '900 15px monospace';
          ctx.fillText('⚠ FULL FACE PROTECTION MANDATORY UNDER 18 • CHRONO LIMIT 1.5J • BIODEGRADABLE BBS ONLY', canvas.width / 2, bodyY + 195);
        } else {
          // Asymmetrical Two Split Columns (Standard Rules vs Special Ops)
          const colWidth = (bodyWidth - 30) / 2;

          // Left: Standard Game Rules
          ctx.fillStyle = 'rgba(9, 12, 18, 0.94)';
          ctx.beginPath();
          ctx.roundRect(60, bodyY, colWidth, 230, 16);
          ctx.fill();
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.45)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = primaryAccent;
          ctx.font = '900 20px "Chakra Petch", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('🛡 STANDARD GAME RULES', 85, bodyY + 40);

          ctx.fillStyle = '#d4d4d8';
          ctx.font = '15px sans-serif';
          const ruleLines = posterStandardRules.split('\n');
          ruleLines.slice(0, 4).forEach((rLine, rIdx) => {
            ctx.fillText(rLine, 85, bodyY + 80 + rIdx * 34);
          });

          // Right: Special Ops / VIRUS RULES
          const rightColX = 60 + colWidth + 30;
          ctx.fillStyle = 'rgba(18, 8, 8, 0.94)';
          ctx.beginPath();
          ctx.roundRect(rightColX, bodyY, colWidth, 230, 16);
          ctx.fill();
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#ef4444';
          ctx.font = '900 20px "Chakra Petch", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('☣ SPECIAL OPS / VARIANT RULES', rightColX + 25, bodyY + 40);

          ctx.fillStyle = '#fca5a5';
          ctx.font = '15px sans-serif';
          const variantLines = posterVariantRules.split('\n');
          variantLines.slice(0, 4).forEach((vLine, vIdx) => {
            ctx.fillText(vLine, rightColX + 25, bodyY + 80 + vIdx * 34);
          });
        }

        // 10. FOOTER & CORE VALUES
        const footerY = canvas.height - 120;

        // Operator silhouettes in the lower third
        ctx.save();
        ctx.fillStyle = 'rgba(5, 6, 8, 0.95)';
        
        // Operator Left (Aiming)
        ctx.beginPath();
        ctx.moveTo(50, canvas.height);
        ctx.lineTo(50, footerY - 50);
        ctx.lineTo(85, footerY - 70);
        ctx.lineTo(110, footerY - 65);
        ctx.lineTo(135, footerY - 45);
        ctx.lineTo(190, footerY - 50);
        ctx.lineTo(240, footerY - 50);
        ctx.lineTo(240, footerY - 40);
        ctx.lineTo(180, footerY - 35);
        ctx.lineTo(150, footerY - 15);
        ctx.lineTo(165, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Operator Right (Sniper)
        ctx.beginPath();
        ctx.moveTo(canvas.width - 50, canvas.height);
        ctx.lineTo(canvas.width - 50, footerY - 35);
        ctx.lineTo(canvas.width - 95, footerY - 60);
        ctx.lineTo(canvas.width - 130, footerY - 45);
        ctx.lineTo(canvas.width - 210, footerY - 45);
        ctx.lineTo(canvas.width - 210, footerY - 38);
        ctx.lineTo(canvas.width - 140, footerY - 32);
        ctx.lineTo(canvas.width - 120, footerY - 10);
        ctx.lineTo(canvas.width - 160, canvas.height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Minimal Black Bar
        ctx.fillStyle = 'rgba(4, 5, 8, 0.96)';
        ctx.fillRect(40, footerY, canvas.width - 80, 85);
        ctx.strokeStyle = primaryAccent;
        ctx.lineWidth = 2;
        ctx.strokeRect(40, footerY, canvas.width - 80, 85);

        // Core Values
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 20px "Chakra Petch", sans-serif';
        ctx.fillText('🎯  TEAMWORK      •      ⚡  STRATEGY      •      🚩  OBJECTIVE      •      ⭐  VICTORY', canvas.width / 2, footerY + 38);

        // Brand and Contact details
        ctx.fillStyle = '#a1a1aa';
        ctx.font = 'bold 14px monospace';
        const web = companyDetails.website || 'WWW.BOSJOLAIRSOFT.CO.ZA';
        const phone = companyDetails.contactNumber || '082 123 4567';
        ctx.fillText(`${(companyDetails.name || 'BOSJOL TACTICAL AIRSOFT').toUpperCase()}  |  ${web.toUpperCase()}  |  TEL: ${phone}`, canvas.width / 2, footerY + 66);
      };

      if (posterBgUrl) {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        bgImg.src = posterBgUrl;
        bgImg.onload = () => {
          if (!isCancelled) renderPoster(bgImg);
        };
        bgImg.onerror = () => {
          if (!isCancelled) renderPoster();
        };
      } else {
        renderPoster();
      }
    };

    runRender();

    return () => {
      isCancelled = true;
    };
  }, [
    posterTitle, posterHypeText, posterCatchphrase, posterType, posterThemeName,
    posterDate, posterStartTime, posterBriefingTime, posterLocation, posterGameFee,
    posterRentalFee, posterMissionBrief, posterStandardRules, posterVariantRules,
    visualTheme, layoutStyle, showVectorOverlay, posterBgUrl, companyDetails
  ]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700/90 rounded-2xl max-w-7xl w-full my-auto overflow-hidden shadow-2xl flex flex-col max-h-[96vh]">
        
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                Bosjol Tactical 3D Poster Studio
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                  AUTO-DETECT V2
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Hyper-Realistic 8K Octane Visuals • Auto-Detected Event Intelligence • 1200x1600 Ultra HD</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-y-auto flex-grow">
          
          {/* Left Column: Live High-Definition Canvas & View Modes */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-zinc-950/90 p-3 sm:p-4 rounded-xl border border-zinc-800 relative">
            
            {/* Live AI Synthesis Radar Sweep Overlay */}
            {isGeneratingAi && (
              <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-full border-2 border-emerald-500/40 border-t-emerald-400 animate-spin flex items-center justify-center">
                    <Crosshair className="w-8 h-8 text-emerald-400 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2 max-w-md">
                  <p className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-bounce" />
                    Synthesizing 3D Cinematic Poster
                  </p>
                  <p className="text-xs text-emerald-400 font-mono font-bold">
                    [ AUTO-DETECTED: {initialIntel.scenario.toUpperCase()} ]
                  </p>
                  <p className="text-[11px] text-zinc-400 font-mono leading-relaxed">
                    Rendering 8K Octane Textures, Volumetric Symmetrical Lighting & Integrated Marketing Details...
                  </p>
                </div>
              </div>
            )}

            {/* Poster Frame */}
            <div className="relative max-w-full max-h-[70vh] aspect-[3/4] shadow-[0_0_50px_rgba(34,197,94,0.2)] rounded-lg overflow-hidden border border-zinc-700">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain block rounded"
              />
            </div>

            {/* Success Notification */}
            {saveSuccessMsg && (
              <p className="text-xs font-bold text-emerald-400 mt-2 bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-500/50">
                {saveSuccessMsg}
              </p>
            )}

            {/* View Mode Switcher: Composite vs Raw AI Image */}
            <div className="flex items-center gap-2 mt-3 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800">
              <button
                onClick={() => {
                  setViewMode('composite');
                  setShowVectorOverlay(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  showVectorOverlay
                    ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>3D Master Composite Poster</span>
              </button>
              
              <button
                onClick={() => {
                  setViewMode('raw');
                  setShowVectorOverlay(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  !showVectorOverlay
                    ? 'bg-blue-950 border border-blue-500 text-blue-300'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Raw 3D Generated Artwork</span>
              </button>
            </div>

            {/* Specs Footer */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-zinc-400 mt-2 text-center">
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-3.5 h-3.5" /> 1200x1600 Ultra HD
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1 text-blue-400">
                <Layers className="w-3.5 h-3.5" /> 4-Module Mid-Section
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1 text-amber-400">
                <Shield className="w-3.5 h-3.5" /> 3D Stencil Titles & Badges
              </span>
            </div>
          </div>

          {/* Right Column: Auto-Detected Tactical Intelligence HUD */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4 overflow-y-auto max-h-[72vh] pr-1">
              
              {/* Primary Actions: Download JPG & Save to Event */}
              <div className="bg-gradient-to-br from-emerald-950/70 to-zinc-900 p-3.5 rounded-xl border border-emerald-500/40 space-y-2">
                <button
                  onClick={handleDownloadJpg}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.4)] transition transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Ultra HD Poster (JPG)</span>
                </button>

                {onUpdateEventImage && (
                  <button
                    onClick={handleSaveToEventImage}
                    className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/50 text-emerald-400 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4 text-emerald-400" />
                    <span>Save Artwork as Event Default Image</span>
                  </button>
                )}
              </div>

              {/* Auto-Generation & Instant Re-Roll Card */}
              <div className="bg-zinc-950/90 p-3.5 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Auto-Detected 3D Tactical Intel
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
                    ZERO CONFIG
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  All event parameters, arena pricing, schedule, and tactical rules have been automatically analyzed to generate this 3D cinematic masterpiece.
                </p>

                <button
                  onClick={() => handleGenerateAiPoster()}
                  disabled={isGeneratingAi}
                  className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing 3D Artwork...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>⚡ Regenerate 3D Cinematic Poster</span>
                    </>
                  )}
                </button>

                {aiNotice && (
                  <div className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-amber-300">Tactical Preset Active</p>
                      <p className="text-[11px] text-zinc-300 leading-snug">{aiNotice}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Auto-Detected Tactical Intelligence Readout HUD */}
              <div className="bg-zinc-950/90 rounded-xl border border-zinc-800 p-3.5 space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-400" />
                  Auto-Detected Event Intelligence HUD
                </h3>

                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Tactical Scenario</span>
                      <span className="font-bold text-emerald-400">{initialIntel.scenario}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      {visualTheme.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Match Schedule</span>
                      <span className="font-bold text-white text-xs">{posterDate}</span>
                      <span className="text-[11px] text-zinc-400 block">{posterBriefingTime} Brief | {posterStartTime} Game</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Combat Arena</span>
                      <span className="font-bold text-white text-xs truncate block">{posterLocation}</span>
                      <span className="text-[11px] text-zinc-400 block">CQB & Field Access</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Pricing Structure</span>
                      <span className="font-bold text-amber-400 text-xs">R{posterGameFee} Own / R{posterRentalFee} Rental</span>
                      <span className="text-[11px] text-zinc-400 block">ZAR Official Entry</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Tournament Rewards</span>
                      <span className="font-bold text-red-400 text-xs">5XP Tournament Bounty</span>
                      <span className="text-[11px] text-zinc-400 block">+100 RP Match Bonus</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase block">Mission Directive</span>
                    <p className="text-xs text-zinc-300 italic line-clamp-2">
                      "{posterMissionBrief}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Collapsible: Quick Adjust Event Details */}
              <div className="bg-zinc-950/80 rounded-xl border border-zinc-800 overflow-hidden">
                <button
                  onClick={() => setShowTextEditor(!showTextEditor)}
                  className="w-full p-3 bg-zinc-900/90 hover:bg-zinc-800/90 text-left flex items-center justify-between border-b border-zinc-800 transition"
                >
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    Fine-Tune Event Details (Optional)
                  </span>
                  {showTextEditor ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </button>

                {showTextEditor && (
                  <div className="p-3.5 space-y-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-mono mb-0.5">Hero Title:</label>
                      <input
                        type="text"
                        value={posterTitle}
                        onChange={(e) => setPosterTitle(e.target.value)}
                        className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-mono mb-0.5">Date:</label>
                        <input
                          type="date"
                          value={posterDate}
                          onChange={(e) => setPosterDate(e.target.value)}
                          className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-mono mb-0.5">Game Time:</label>
                        <input
                          type="text"
                          value={posterStartTime}
                          onChange={(e) => setPosterStartTime(e.target.value)}
                          className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-mono mb-0.5">Own Gear Fee (R):</label>
                        <input
                          type="number"
                          value={posterGameFee}
                          onChange={(e) => setPosterGameFee(Number(e.target.value))}
                          className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-mono mb-0.5">Rental Fee (R):</label>
                        <input
                          type="number"
                          value={posterRentalFee}
                          onChange={(e) => setPosterRentalFee(Number(e.target.value))}
                          className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 font-mono mb-0.5">Mission Brief:</label>
                      <textarea
                        rows={2}
                        value={posterMissionBrief}
                        onChange={(e) => setPosterMissionBrief(e.target.value)}
                        className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Artwork Upload */}
              <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-amber-400" />
                  Custom Photo Source
                </h3>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-amber-500/50 text-amber-300 font-bold transition flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Upload Photo</span>
                  </button>

                  {event.imageUrl && (
                    <button
                      onClick={() => setPosterBgUrl(event.imageUrl || '')}
                      className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold transition flex items-center justify-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4 text-blue-400" />
                      <span>Use Event Image</span>
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Quick Summary Bar */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <div><span className="text-zinc-500">Poster:</span> <span className="text-white font-bold">{posterTitle}</span></div>
                <div><span className="text-zinc-500">Theme:</span> <span className="text-emerald-400 font-bold">{initialIntel.scenario}</span></div>
                <div><span className="text-zinc-500">Date:</span> <span className="text-zinc-300">{posterDate} @ {posterStartTime}</span></div>
                <div><span className="text-zinc-500">Entry:</span> <span className="text-amber-400 font-bold">R{posterGameFee} / R{posterRentalFee}</span></div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
