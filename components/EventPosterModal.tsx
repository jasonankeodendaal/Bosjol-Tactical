import React, { useState, useRef, useEffect } from 'react';
import { GameEvent, InventoryItem, CompanyDetails } from '../types';
import { 
  X, Download, Sparkles, Calendar, MapPin, Clock, DollarSign, Shield, Info, 
  Image as ImageIcon, Loader2, Flame, Crosshair, Palette, Sliders, Users, Check,
  Upload, Save, RefreshCw, Edit3, ChevronDown, ChevronUp
} from 'lucide-react';

interface EventPosterModalProps {
  event: GameEvent;
  inventory: InventoryItem[];
  companyDetails: CompanyDetails;
  onClose: () => void;
  onUpdateEventImage?: (newImageUrl: string) => void;
}

export type PosterTheme = 'red_vs_blue' | 'toxic_juggernaut' | 'crimson_warfare' | 'cyber_cobalt';

export const EventPosterModal: React.FC<EventPosterModalProps> = ({
  event,
  inventory,
  companyDetails,
  onClose,
  onUpdateEventImage
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Compute rental gear names and default prices from inventory
  const rentalGearIds = event.gearForRent || [];
  const rentalItems = inventory.filter(i => rentalGearIds.includes(i.id));
  const rentalGearNames = rentalItems.length > 0 
    ? rentalItems.map(i => i.name).join(', ') 
    : 'Standard AEG Rifle, Thermal Mask & Bio BBs';

  const initialRentalPrice = rentalItems.length > 0 
    ? (event.rentalPriceOverrides?.[rentalItems[0].id] ?? rentalItems[0].salePrice) 
    : 350;

  // --- STATEFUL DISPLAY FIELDS (Editable right inside the Poster Studio!) ---
  const [posterTitle, setPosterTitle] = useState<string>(event.title || 'TACTICAL AIRSOFT MISSION');
  const [posterType, setPosterType] = useState<string>(event.type || 'Mission');
  const [posterThemeName, setPosterThemeName] = useState<string>(event.theme || 'CQB Operations');
  const [posterDate, setPosterDate] = useState<string>(event.date || new Date().toISOString().split('T')[0]);
  const [posterStartTime, setPosterStartTime] = useState<string>(event.startTime || '10:00');
  const [posterLocation, setPosterLocation] = useState<string>(event.location || companyDetails.address || 'BOSJOL AIRSOFT ARENA');
  const [posterGameFee, setPosterGameFee] = useState<number>(event.gameFee !== undefined ? event.gameFee : 50);
  const [posterRentalFee, setPosterRentalFee] = useState<number>(initialRentalPrice);
  const [posterRules, setPosterRules] = useState<string>(
    event.rules || event.description || 'Full face protection mandatory for under 18s. Biodegradable BBs only. Chrono limit 1.5J.'
  );

  // Studio UI Controls
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showApiKeyGuide, setShowApiKeyGuide] = useState(false);
  const [posterBgUrl, setPosterBgUrl] = useState<string>(event.imageUrl || companyDetails.logoUrl || '');
  const [customThemePrompt, setCustomThemePrompt] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [showTextEditor, setShowTextEditor] = useState<boolean>(true);

  // Auto-detect color theme based on text keywords
  const detectBestTheme = (): PosterTheme => {
    const combinedStr = `${posterTitle} ${posterThemeName} ${posterType} ${posterRules}`.toLowerCase();
    if (combinedStr.includes('toxic') || combinedStr.includes('juggernaut') || combinedStr.includes('zombie') || combinedStr.includes('bio')) {
      return 'toxic_juggernaut';
    }
    if (combinedStr.includes('night') || combinedStr.includes('crimson') || combinedStr.includes('dark') || combinedStr.includes('flare')) {
      return 'crimson_warfare';
    }
    if (combinedStr.includes('cyber') || combinedStr.includes('cobalt') || combinedStr.includes('spec ops')) {
      return 'cyber_cobalt';
    }
    return 'red_vs_blue';
  };

  const [visualStyleTheme, setVisualStyleTheme] = useState<PosterTheme>(detectBestTheme());
  const [showTeamBanners, setShowTeamBanners] = useState<boolean>(true);
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [showHudReticle, setShowHudReticle] = useState<boolean>(true);
  const [entryLabel, setEntryLabel] = useState<string>('PER PERSON');
  const [rentalLabel, setRentalLabel] = useState<string>('RENTALS');

  // Dynamic Prompt generator derived directly from current event state
  const buildDynamicEventPrompt = (customStyleOverride?: string) => {
    return `Masterpiece, top class modern high-end professional 3D effect image design. Hyper-realistic photorealistic tactical airsoft promotional poster background art. Exceptional intricate detail, macro-level fabric textures, dirt and grime weathering on gear, custom decal stickers, combined with vibrant abstract color art splashes and dynamic paint splatters blending into the action. Unreal Engine 5 render aesthetic, 8k resolution.
Event Title: "${posterTitle}".
Game Mode / Type: ${posterType}.
Theme Scenario: "${posterThemeName}".
Field Location: "${posterLocation}".
Mission Briefing: "${posterRules}".
Visual Style: ${customStyleOverride || 'Cinematic, ultra-photorealistic rendering, tactical airsoft operators in combat gear, intense atmospheric lighting, flying white airsoft BBs, wet reflective ground, surrounded by energetic abstract color art splashes, masterpiece 3D design'}. Aspect ratio 3:4 portrait. NO text overlays, NO words, NO letters.`;
  };

  // Dynamically synthesized AI Presets matching current event details
  const promptPresets = [
    {
      name: `🎯 Tactical Sniper (Abstract Splash)`,
      prompt: buildDynamicEventPrompt('Hyper-photorealistic sniper operator in full detailed ghillie suit aiming a scoped rifle. Interwoven with vibrant neon green and yellow abstract color art splashes. White airsoft BBs flying through the air, wet muddy ground, cinematic lighting, high-end promotional sports aesthetic.')
    },
    {
      name: `☣️ Heavy Juggernaut (Explosive Paint)`,
      prompt: buildDynamicEventPrompt('Ultra-detailed photorealistic heavy airsoft juggernaut operator in full bomb suit armor wielding a minigun. Framed by explosive toxic green and black abstract paint splatters and art splashes. Dense glowing smoke, flying white BB pellets, wet reflective ground, masterpiece.')
    },
    {
      name: `⚔️ Team Deathmatch (Red/Blue Splash)`,
      prompt: buildDynamicEventPrompt('Dual team split artwork. Hyper-realistic tactical airsoft operators facing off. Chaotic, highly energetic abstract color art splashes of vibrant crimson red and neon blue paint colliding in the center. Flying white airsoft BBs, epic showdown, 3D high-end render.')
    },
    {
      name: `🔥 Dynamic CQB (Kinetic Colors)`,
      prompt: buildDynamicEventPrompt('Dynamic high-action photorealistic airsoft combat scene. Operators in elite tactical gear breaching a room, accentuated by kinetic, vibrant abstract color art splashes trailing their movement. Muzzle flashes, flying white BBs, cinematic rim lighting, 8k resolution, ultra-detailed.')
    }
  ];

  // Auto-trigger AI Artwork Generation on open if event has no custom artwork image
  useEffect(() => {
    if (!event.imageUrl || event.imageUrl === companyDetails.logoUrl) {
      handleGenerateAiPoster();
    }
  }, []);

  // Handle Local Custom Image File Upload
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

  // Save current poster background image as default event image
  const handleSaveToEventImage = () => {
    if (posterBgUrl && onUpdateEventImage) {
      onUpdateEventImage(posterBgUrl);
      setSaveSuccessMsg('✓ Saved as default Event Image!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  // Draw 3D High Definition Razor Sharp Poster onto Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High Definition Poster Dimensions (1200 x 1600 px)
    canvas.width = 1200;
    canvas.height = 1600;

    const drawPosterContent = (bgImg?: HTMLImageElement) => {
      // 1. THEME COLOR CONFIGURATIONS
      let primaryColor = '#ef4444'; // Red
      let secondaryColor = '#3b82f6'; // Blue
      let accentGlow = '#f59e0b'; // Gold
      let darkBase = '#09090b';

      if (visualStyleTheme === 'toxic_juggernaut') {
        primaryColor = '#22c55e'; // Toxic Green
        secondaryColor = '#10b981'; // Emerald
        accentGlow = '#eab308'; // Amber Gold
        darkBase = '#051b0d';
      } else if (visualStyleTheme === 'crimson_warfare') {
        primaryColor = '#dc2626'; // Dark Crimson
        secondaryColor = '#f97316'; // Orange Flare
        accentGlow = '#eab308';
        darkBase = '#180505';
      } else if (visualStyleTheme === 'cyber_cobalt') {
        primaryColor = '#06b6d4'; // Cyan
        secondaryColor = '#3b82f6'; // Cobalt Blue
        accentGlow = '#f59e0b';
        darkBase = '#03131d';
      }

      // Base Canvas Fill
      ctx.fillStyle = darkBase;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. BACKGROUND IMAGE OR PROCEDURAL BACKDROP
      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.save();
        const scale = Math.max(canvas.width / bgImg.naturalWidth, canvas.height / bgImg.naturalHeight);
        const x = (canvas.width - bgImg.naturalWidth * scale) / 2;
        const y = (canvas.height - bgImg.naturalHeight * scale) / 2;
        ctx.drawImage(bgImg, x, y, bgImg.naturalWidth * scale, bgImg.naturalHeight * scale);

        // Dark Vignette Overlay for Text Readability
        const overlay = ctx.createLinearGradient(0, 0, 0, canvas.height);
        overlay.addColorStop(0, 'rgba(9, 9, 11, 0.82)');
        overlay.addColorStop(0.35, 'rgba(9, 9, 11, 0.50)');
        overlay.addColorStop(0.7, 'rgba(9, 9, 11, 0.88)');
        overlay.addColorStop(1, 'rgba(9, 9, 11, 0.98)');
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Theme Lighting Overlay
        if (visualStyleTheme === 'red_vs_blue') {
          const leftGlow = ctx.createRadialGradient(0, 800, 100, 0, 800, 700);
          leftGlow.addColorStop(0, 'rgba(239, 68, 68, 0.28)');
          leftGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = leftGlow;
          ctx.fillRect(0, 0, canvas.width / 2, canvas.height);

          const rightGlow = ctx.createRadialGradient(1200, 800, 100, 1200, 800, 700);
          rightGlow.addColorStop(0, 'rgba(59, 130, 246, 0.28)');
          rightGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = rightGlow;
          ctx.fillRect(canvas.width / 2, 0, canvas.width / 2, canvas.height);
        } else if (visualStyleTheme === 'toxic_juggernaut') {
          const greenGlow = ctx.createRadialGradient(600, 1000, 100, 600, 1000, 900);
          greenGlow.addColorStop(0, 'rgba(34, 197, 94, 0.30)');
          greenGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = greenGlow;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.restore();
      } else {
        // Fallback Procedural Background
        const grad = ctx.createRadialGradient(600, 800, 100, 600, 800, 1000);
        grad.addColorStop(0, '#1c1917');
        grad.addColorStop(1, darkBase);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 3. ATMOSPHERIC 3D SMOKE & BB PARTICLE OVERLAY
      if (showParticles) {
        ctx.save();
        const drawSmokePuff = (sx: number, sy: number, radius: number, colorStr: string) => {
          const smokeGrad = ctx.createRadialGradient(sx, sy, radius * 0.1, sx, sy, radius);
          smokeGrad.addColorStop(0, colorStr);
          smokeGrad.addColorStop(0.6, colorStr.replace(/[^,]+(?=\))/, '0.15'));
          smokeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = smokeGrad;
          ctx.beginPath();
          ctx.arc(sx, sy, radius, 0, Math.PI * 2);
          ctx.fill();
        };

        if (visualStyleTheme === 'red_vs_blue') {
          drawSmokePuff(150, 400, 320, 'rgba(239, 68, 68, 0.35)');
          drawSmokePuff(1050, 400, 320, 'rgba(59, 130, 246, 0.35)');
          drawSmokePuff(200, 1100, 280, 'rgba(220, 38, 38, 0.25)');
          drawSmokePuff(1000, 1100, 280, 'rgba(37, 99, 235, 0.25)');
        } else if (visualStyleTheme === 'toxic_juggernaut') {
          drawSmokePuff(600, 1200, 450, 'rgba(34, 197, 94, 0.35)');
          drawSmokePuff(300, 500, 280, 'rgba(16, 185, 129, 0.25)');
        } else {
          drawSmokePuff(200, 600, 350, 'rgba(220, 38, 38, 0.3)');
          drawSmokePuff(1000, 600, 350, 'rgba(220, 38, 38, 0.2)');
        }

        // Flying 3D White Airsoft BB Spheres
        const bbSeeds = [
          { x: 120, y: 320, r: 12 }, { x: 280, y: 780, r: 8 }, { x: 180, y: 1350, r: 14 },
          { x: 1050, y: 280, r: 10 }, { x: 920, y: 820, r: 15 }, { x: 1120, y: 1250, r: 9 },
          { x: 520, y: 180, r: 7 }, { x: 680, y: 1420, r: 11 }, { x: 420, y: 950, r: 13 }
        ];

        bbSeeds.forEach(bb => {
          const bbGrad = ctx.createRadialGradient(bb.x - bb.r * 0.3, bb.y - bb.r * 0.3, bb.r * 0.1, bb.x, bb.y, bb.r);
          bbGrad.addColorStop(0, '#ffffff');
          bbGrad.addColorStop(0.7, '#e4e4e7');
          bbGrad.addColorStop(1, '#71717a');
          ctx.fillStyle = bbGrad;
          ctx.beginPath();
          ctx.arc(bb.x, bb.y, bb.r, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });
        ctx.restore();
      }

      // 4. TACTICAL GRID MESH & HUD FRAME
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Double Frame
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 5;
      ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70);

      // Corner Crosshairs
      const drawCrosshairTarget = (cx: number, cy: number, color: string) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.moveTo(cx - 22, cy); ctx.lineTo(cx + 22, cy);
        ctx.moveTo(cx, cy - 22); ctx.lineTo(cx, cy + 22);
        ctx.stroke();
      };
      drawCrosshairTarget(45, 45, primaryColor);
      drawCrosshairTarget(canvas.width - 45, 45, secondaryColor);
      drawCrosshairTarget(45, canvas.height - 45, secondaryColor);
      drawCrosshairTarget(canvas.width - 45, canvas.height - 45, primaryColor);

      // Weapon Scope Reticle
      if (showHudReticle) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 160, 65, 0, Math.PI * 2);
        ctx.moveTo(canvas.width / 2 - 80, 160); ctx.lineTo(canvas.width / 2 + 80, 160);
        ctx.moveTo(canvas.width / 2, 160 - 80); ctx.lineTo(canvas.width / 2, 160 + 80);
        ctx.stroke();
        ctx.restore();
      }

      // 5. HEADER COMPANY BRANDING BANNER
      ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
      ctx.fillRect(50, 50, canvas.width - 100, 100);
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 50, canvas.width - 100, 100);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = primaryColor;
      ctx.shadowBlur = 15;
      ctx.fillText((companyDetails.name || 'BOSJOL TACTICAL AIRSOFT').toUpperCase(), canvas.width / 2, 95);
      ctx.shadowBlur = 0;

      ctx.fillStyle = accentGlow;
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`★ OFFICIAL ${posterType.toUpperCase()} POSTER ★`, canvas.width / 2, 128);

      // 6. MAIN EVENT TITLE (3D STENCIL)
      const titleText = (posterTitle || 'AIRSOFT TACTICAL MATCH').toUpperCase();
      const titleWords = titleText.split(' ');
      let line1 = '';
      let line2 = '';
      for (const word of titleWords) {
        if ((line1 + ' ' + word).length <= 16) {
          line1 += (line1 ? ' ' : '') + word;
        } else {
          line2 += (line2 ? ' ' : '') + word;
        }
      }

      const draw3dTitleText = (txt: string, ty: number) => {
        ctx.font = '900 76px sans-serif';
        ctx.textAlign = 'center';

        ctx.fillStyle = '#000000';
        ctx.fillText(txt, canvas.width / 2 + 6, ty + 6);

        ctx.shadowColor = visualStyleTheme === 'red_vs_blue' ? '#ef4444' : primaryColor;
        ctx.shadowBlur = 35;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(txt, canvas.width / 2, ty);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.fillText(txt, canvas.width / 2, ty);

        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 3;
        ctx.strokeText(txt, canvas.width / 2, ty);
      };

      let titleY = 250;
      if (line2) {
        draw3dTitleText(line1, titleY);
        draw3dTitleText(line2, titleY + 85);
        titleY += 170;
      } else {
        draw3dTitleText(line1, titleY + 30);
        titleY += 120;
      }

      // Theme Subtitle
      if (posterThemeName) {
        const themeSub = posterThemeName.toUpperCase();
        ctx.fillStyle = primaryColor;
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        const displaySub = themeSub.length > 40 ? themeSub.substring(0, 40) + '...' : themeSub;
        ctx.fillText(`THEME: "${displaySub}"`, canvas.width / 2, titleY + 10);
        titleY += 45;
      }

      // 7. TEAM DIVISION FLAGS
      let nextY = titleY + 20;

      if (showTeamBanners) {
        const flagWidth = 240;
        const flagHeight = 110;

        // Left Red Flag
        ctx.save();
        ctx.fillStyle = 'rgba(220, 38, 38, 0.85)';
        ctx.fillRect(70, nextY, flagWidth, flagHeight);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(70, nextY, flagWidth, flagHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('☠ RED', 70 + flagWidth / 2, nextY + 45);
        ctx.fillText('TEAM', 70 + flagWidth / 2, nextY + 80);
        ctx.restore();

        // Right Blue Flag
        ctx.save();
        ctx.fillStyle = 'rgba(37, 99, 235, 0.85)';
        ctx.fillRect(canvas.width - 70 - flagWidth, nextY, flagWidth, flagHeight);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.strokeRect(canvas.width - 70 - flagWidth, nextY, flagWidth, flagHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('☠ BLUE', canvas.width - 70 - flagWidth / 2, nextY + 45);
        ctx.fillText('TEAM', canvas.width - 70 - flagWidth / 2, nextY + 80);
        ctx.restore();

        // VS Emblem
        ctx.fillStyle = '#f59e0b';
        ctx.font = '900 38px sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 10;
        ctx.fillText('VS', canvas.width / 2, nextY + 68);
        ctx.shadowBlur = 0;

        nextY += flagHeight + 35;
      } else {
        nextY += 15;
      }

      // 8. LOGISTICS BADGES (TIME & LOCATION)
      const badgeBoxWidth = 540;
      const badgeBoxHeight = 65;

      // Time Badge Container
      const timeBoxX = (canvas.width - badgeBoxWidth) / 2;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.beginPath();
      ctx.roundRect(timeBoxX, nextY, badgeBoxWidth, badgeBoxHeight, 12);
      ctx.fill();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.arc(timeBoxX + 45, nextY + badgeBoxHeight / 2, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⏰', timeBoxX + 45, nextY + badgeBoxHeight / 2 + 7);

      ctx.font = '900 28px sans-serif';
      ctx.textAlign = 'center';
      const eventDateStr = posterDate 
        ? new Date(posterDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()
        : 'SUN, 12 SEP';
      const timeStr = `${eventDateStr} • ${posterStartTime}`;
      ctx.fillText(timeStr, canvas.width / 2 + 20, nextY + 43);

      nextY += badgeBoxHeight + 20;

      // Location Badge Container
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.beginPath();
      ctx.roundRect(timeBoxX, nextY, badgeBoxWidth, badgeBoxHeight, 12);
      ctx.fill();
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = secondaryColor;
      ctx.beginPath();
      ctx.arc(timeBoxX + 45, nextY + badgeBoxHeight / 2, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📍', timeBoxX + 45, nextY + badgeBoxHeight / 2 + 7);

      ctx.font = '900 26px sans-serif';
      ctx.textAlign = 'center';
      const locStr = posterLocation.toUpperCase();
      ctx.fillText(locStr.length > 25 ? locStr.substring(0, 25) + '...' : locStr, canvas.width / 2 + 20, nextY + 43);

      nextY += badgeBoxHeight + 40;

      // 9. HIGH-CONTRAST 3D PRICING BADGES
      const pillWidth = 480;
      const pillHeight = 110;
      const leftPillX = (canvas.width / 2) - pillWidth - 20;
      const rightPillX = (canvas.width / 2) + 20;

      // ENTRY FEE BADGE (LEFT PILL)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.beginPath();
      ctx.roundRect(leftPillX, nextY, pillWidth, pillHeight, 16);
      ctx.fill();
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.arc(leftPillX + 55, nextY + pillHeight / 2, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👤', leftPillX + 55, nextY + pillHeight / 2 + 9);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px monospace';
      ctx.textAlign = 'left';
      const entryFeeVal = posterGameFee > 0 ? `R${posterGameFee}` : 'FREE';
      ctx.fillText(entryFeeVal, leftPillX + 110, nextY + 62);

      ctx.fillStyle = primaryColor;
      ctx.font = '900 18px sans-serif';
      ctx.fillText(entryLabel.toUpperCase(), leftPillX + 110, nextY + 92);

      // RENTAL FEE BADGE (RIGHT PILL)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.beginPath();
      ctx.roundRect(rightPillX, nextY, pillWidth, pillHeight, 16);
      ctx.fill();
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = secondaryColor;
      ctx.beginPath();
      ctx.arc(rightPillX + 55, nextY + pillHeight / 2, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🥽', rightPillX + 55, nextY + pillHeight / 2 + 9);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`R${posterRentalFee}`, rightPillX + 110, nextY + 62);

      ctx.fillStyle = secondaryColor;
      ctx.font = '900 18px sans-serif';
      ctx.fillText(rentalLabel.toUpperCase(), rightPillX + 110, nextY + 92);

      nextY += pillHeight + 35;

      // 10. MATCH SAFETY & EQUIPMENT NOTES
      ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
      ctx.fillRect(70, nextY, canvas.width - 140, 110);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(70, nextY, canvas.width - 140, 110);

      ctx.fillStyle = accentGlow;
      ctx.font = '900 18px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('⚠ SAFETY RULES & CHRONO CHECK MANDATORY ON SITE', 90, nextY + 35);

      ctx.fillStyle = '#d4d4d8';
      ctx.font = '16px sans-serif';
      const ruleText = posterRules || 'Full face protection mandatory for under 18s. Biodegradable BBs only. Chrono limit 1.5J.';
      ctx.fillText(ruleText.length > 85 ? ruleText.substring(0, 85) + '...' : ruleText, 90, nextY + 72);

      // 11. FOOTER BRANDING
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '900 18px monospace';
      ctx.textAlign = 'center';
      const websiteStr = companyDetails.website || 'WWW.BOSJOLAIRSOFT.CO.ZA';
      ctx.fillText(`${(companyDetails.name || 'BOSJOL AIRSOFT').toUpperCase()} • CONTACT: ${companyDetails.contactNumber || '082 123 4567'} • ${websiteStr.toUpperCase()}`, canvas.width / 2, canvas.height - 40);
    };

    if (posterBgUrl) {
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.src = posterBgUrl;
      bgImg.onload = () => drawPosterContent(bgImg);
      bgImg.onerror = () => drawPosterContent();
    } else {
      drawPosterContent();
    }
  }, [
    posterTitle, posterType, posterThemeName, posterDate, posterStartTime, 
    posterLocation, posterGameFee, posterRentalFee, posterRules, companyDetails,
    posterBgUrl, visualStyleTheme, showTeamBanners, showParticles, showHudReticle, 
    entryLabel, rentalLabel
  ]);

  // Download Razor-Sharp High-Res JPG Poster
  const handleDownloadJpg = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.98);
    const link = document.createElement('a');
    const safeTitle = posterTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `Bosjol_3D_Poster_${safeTitle}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  // Trigger Gemini AI Poster Art Generation using Event Details & Upload Reference
  const handleGenerateAiPoster = async (overridePrompt?: string) => {
    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const promptText = overridePrompt || customThemePrompt || buildDynamicEventPrompt();

      const res = await fetch('/api/generate-poster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: promptText,
          title: posterTitle,
          theme: posterThemeName,
          type: posterType,
          location: posterLocation,
          description: posterRules,
          rules: posterRules,
          rentalInfo: rentalGearNames,
          bgImageUrl: posterBgUrl
        })
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error('Invalid JSON response:', text.substring(0, 200));
        throw new Error(`Server returned an invalid response (${res.status}). Please try a smaller image or shorter prompt.`);
      }

      if (!res.ok || data.success === false || data.error) {
        throw new Error(data.error || 'Failed to generate AI poster artwork');
      }

      if (data.imageUrl) {
        setPosterBgUrl(data.imageUrl);
        setSaveSuccessMsg('✓ AI Artwork generated directly from event details!');
        setTimeout(() => setSaveSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      console.error('Poster generation failed:', err);
      setAiError(err.message || 'Image generation failed. Check GEMINI_API_KEY environment variable.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700/90 rounded-2xl max-w-6xl w-full my-auto overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                3D Airsoft Poster Studio
              </h2>
              <p className="text-xs text-zinc-400">Live Event Data Engine • Editable Display Info • 1200x1600 Ultra HD Export</p>
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
          {/* Left Column: Interactive Poster Canvas Preview */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-zinc-950/90 p-3 sm:p-4 rounded-xl border border-zinc-800">
            <div className="relative max-w-full max-h-[68vh] aspect-[3/4] shadow-[0_0_50px_rgba(220,38,38,0.25)] rounded-lg overflow-hidden border border-zinc-700">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain block rounded"
              />
            </div>
            
            {saveSuccessMsg && (
              <p className="text-xs font-bold text-emerald-400 mt-2 bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-500/50">
                {saveSuccessMsg}
              </p>
            )}

            <p className="text-[11px] font-mono text-zinc-400 mt-2.5 text-center flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-400 inline" />
              <span>1200x1600 Vector Rendering • Real-Time Event Data Sync • Ultra HD JPG Export</span>
            </p>
          </div>

          {/* Right Column: Customization Controls & AI Artwork Generator */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4 overflow-y-auto max-h-[68vh] pr-1">
              
              {/* Primary Actions: Download JPG & Save to Event */}
              <div className="bg-gradient-to-br from-emerald-950/70 to-zinc-900 p-3.5 rounded-xl border border-emerald-500/40 space-y-2">
                <button
                  onClick={handleDownloadJpg}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.4)] transition transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download High-Res 3D Poster (JPG)</span>
                </button>

                {onUpdateEventImage && (
                  <button
                    onClick={handleSaveToEventImage}
                    className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/50 text-emerald-400 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4 text-emerald-400" />
                    <span>Save Artwork as Default Event Image</span>
                  </button>
                )}
              </div>

              {/* Collapsible Section: EDIT POSTER DISPLAY TEXT */}
              <div className="bg-zinc-950/80 rounded-xl border border-zinc-800 overflow-hidden">
                <button
                  onClick={() => setShowTextEditor(!showTextEditor)}
                  className="w-full p-3 bg-zinc-900/90 hover:bg-zinc-800/90 text-left flex items-center justify-between border-b border-zinc-800 transition"
                >
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    Edit Event Poster Info & Display Text
                  </span>
                  {showTextEditor ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </button>

                {showTextEditor && (
                  <div className="p-3.5 space-y-2.5 text-xs">
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-mono mb-0.5">Event Title:</label>
                      <input
                        type="text"
                        value={posterTitle}
                        onChange={(e) => setPosterTitle(e.target.value)}
                        className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white font-bold"
                        placeholder="e.g. NIGHT RAID OPS"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-mono mb-0.5">Game Type:</label>
                        <select
                          value={posterType}
                          onChange={(e) => setPosterType(e.target.value)}
                          className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white font-bold"
                        >
                          <option value="Mission">Mission</option>
                          <option value="Training">Training</option>
                          <option value="Briefing">Briefing</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-400 font-mono mb-0.5">Theme / Scenario:</label>
                        <input
                          type="text"
                          value={posterThemeName}
                          onChange={(e) => setPosterThemeName(e.target.value)}
                          className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white"
                          placeholder="e.g. CQB Warfare"
                        />
                      </div>
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
                        <label className="block text-[10px] text-zinc-400 font-mono mb-0.5">Start Time:</label>
                        <input
                          type="text"
                          value={posterStartTime}
                          onChange={(e) => setPosterStartTime(e.target.value)}
                          className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white"
                          placeholder="10:00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 font-mono mb-0.5">Field Location:</label>
                      <input
                        type="text"
                        value={posterLocation}
                        onChange={(e) => setPosterLocation(e.target.value)}
                        className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white"
                        placeholder="e.g. Bosjol Arena"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-mono mb-0.5">Entry Fee (R):</label>
                        <input
                          type="number"
                          value={posterGameFee}
                          onChange={(e) => setPosterGameFee(Number(e.target.value))}
                          className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-zinc-400 font-mono mb-0.5">Rental Fee (R):</label>
                        <input
                          type="number"
                          value={posterRentalFee}
                          onChange={(e) => setPosterRentalFee(Number(e.target.value))}
                          className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 font-mono mb-0.5">Safety & Rules Text:</label>
                      <textarea
                        rows={2}
                        value={posterRules}
                        onChange={(e) => setPosterRules(e.target.value)}
                        className="w-full p-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Uploads & Background Image Sources */}
              <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 space-y-2.5">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-amber-400" />
                  Artwork Upload & Image Sources
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
                    <span>Upload Custom Photo</span>
                  </button>

                  {event.imageUrl && (
                    <button
                      onClick={() => setPosterBgUrl(event.imageUrl || '')}
                      className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold transition flex items-center justify-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4 text-blue-400" />
                      <span>Use Event Upload</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Poster Theme Preset Selector */}
              <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 space-y-2.5">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-amber-400" />
                  Visual Theme & Color Preset
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setVisualStyleTheme('red_vs_blue')}
                    className={`p-2 rounded-lg border text-left font-bold transition flex items-center gap-2 ${
                      visualStyleTheme === 'red_vs_blue'
                        ? 'bg-red-950/80 border-red-500 text-white shadow-md'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-blue-500" />
                    <span>Red vs Blue Split</span>
                  </button>

                  <button
                    onClick={() => setVisualStyleTheme('toxic_juggernaut')}
                    className={`p-2 rounded-lg border text-left font-bold transition flex items-center gap-2 ${
                      visualStyleTheme === 'toxic_juggernaut'
                        ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Toxic Juggernaut</span>
                  </button>

                  <button
                    onClick={() => setVisualStyleTheme('crimson_warfare')}
                    className={`p-2 rounded-lg border text-left font-bold transition flex items-center gap-2 ${
                      visualStyleTheme === 'crimson_warfare'
                        ? 'bg-red-950/80 border-red-600 text-white shadow-md'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-red-600" />
                    <span>Crimson Flare</span>
                  </button>

                  <button
                    onClick={() => setVisualStyleTheme('cyber_cobalt')}
                    className={`p-2 rounded-lg border text-left font-bold transition flex items-center gap-2 ${
                      visualStyleTheme === 'cyber_cobalt'
                        ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-md'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-cyan-400" />
                    <span>Cyber Cobalt</span>
                  </button>
                </div>
              </div>

              {/* Layout Toggles */}
              <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 space-y-2.5">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Poster Elements & Badges
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTeamBanners}
                      onChange={(e) => setShowTeamBanners(e.target.checked)}
                      className="rounded accent-red-500"
                    />
                    <span>Red vs Blue Flags</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showParticles}
                      onChange={(e) => setShowParticles(e.target.checked)}
                      className="rounded accent-red-500"
                    />
                    <span>3D BBs & Smoke</span>
                  </label>
                </div>
              </div>

              {/* AI Artwork Generator Tool */}
              <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-red-400" />
                    AI 3D Artwork Generator
                  </h3>
                  <button
                    onClick={() => setShowApiKeyGuide(!showApiKeyGuide)}
                    className="text-[10px] text-zinc-400 hover:text-amber-300 underline flex items-center gap-1"
                  >
                    <Info className="w-3 h-3" />
                    <span>API Setup</span>
                  </button>
                </div>

                {/* Event Details Presets */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-zinc-400">Presets (Derived from Event Details):</label>
                  <div className="space-y-1">
                    {promptPresets.map((pr, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCustomThemePrompt(pr.prompt);
                          handleGenerateAiPoster(pr.prompt);
                        }}
                        disabled={isGeneratingAi}
                        className="w-full text-left p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-[11px] font-bold text-zinc-200 hover:text-amber-300 transition flex items-center justify-between"
                      >
                        <span className="truncate pr-2">{pr.name}</span>
                        <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-zinc-400 mb-1">
                    Custom Prompt:
                  </label>
                  <textarea
                    rows={2}
                    placeholder={`Describe custom 3D airsoft artwork...`}
                    value={customThemePrompt}
                    onChange={(e) => setCustomThemePrompt(e.target.value)}
                    className="w-full p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  onClick={() => handleGenerateAiPoster()}
                  disabled={isGeneratingAi}
                  className="w-full py-2.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Generating 3D Artwork from Event Details...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      <span>Generate 3D AI Artwork From Event Details</span>
                    </>
                  )}
                </button>

                {aiError && (
                  <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-[11px] text-red-300 space-y-1">
                    <p className="font-bold">⚠️ AI Generation Notice:</p>
                    <p>{aiError}</p>
                  </div>
                )}
              </div>

              {/* API Key Guide */}
              {showApiKeyGuide && (
                <div className="p-3 rounded-xl bg-zinc-950 border border-amber-500/40 text-zinc-300 text-xs space-y-2">
                  <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-400" />
                    How to Configure GEMINI_API_KEY:
                  </h4>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] text-zinc-300">
                    <li>
                      Environment variable name: <code className="bg-zinc-900 px-1 py-0.5 rounded text-amber-300 font-mono">GEMINI_API_KEY</code>
                    </li>
                    <li>
                      Set in Google AI Studio <strong>Settings &gt; Secrets</strong>.
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Quick Summary Footer */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1 text-zinc-400">
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <div><span className="text-zinc-500">Title:</span> <span className="text-white font-bold">{posterTitle}</span></div>
                <div><span className="text-zinc-500">Type:</span> <span className="text-amber-400 font-bold">{posterType}</span></div>
                <div><span className="text-zinc-500">Theme:</span> <span className="text-emerald-400 font-bold">{posterThemeName}</span></div>
                <div><span className="text-zinc-500">Field:</span> <span className="text-blue-400 font-bold">{posterLocation}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
