import React, { useState, useRef, useEffect } from 'react';
import { GameEvent, InventoryItem, CompanyDetails } from '../types';
import { X, Download, Sparkles, QrCode, Calendar, MapPin, Clock, DollarSign, Shield, Info, Image as ImageIcon, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';

interface EventPosterModalProps {
  event: GameEvent;
  inventory: InventoryItem[];
  companyDetails: CompanyDetails;
  onClose: () => void;
  onUpdateEventImage?: (newImageUrl: string) => void;
}

export const EventPosterModal: React.FC<EventPosterModalProps> = ({
  event,
  inventory,
  companyDetails,
  onClose,
  onUpdateEventImage
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showApiKeyGuide, setShowApiKeyGuide] = useState(false);
  const [posterBgUrl, setPosterBgUrl] = useState<string>(event.imageUrl || companyDetails.logoUrl || '');
  const [customThemePrompt, setCustomThemePrompt] = useState<string>('');

  // Generate QR code for the event
  useEffect(() => {
    const qrText = JSON.stringify({
      eventId: event.id,
      title: event.title,
      date: event.date,
      type: 'BOSJOL_EVENT_PASS'
    });

    QRCode.toDataURL(qrText, {
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then(url => setQrDataUrl(url)).catch(err => console.error('QR generation error:', err));
  }, [event]);

  // Render high-res razor sharp poster to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High Definition Poster Dimensions (1200 x 1600 px)
    canvas.width = 1200;
    canvas.height = 1600;

    // 1. Dark Tactical Background Fill
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Helper to draw poster contents once background image is ready or fails
    const drawPosterContent = (bgImg?: HTMLImageElement) => {
      // 2. Background Image Rendering with tactical darkening & vignette
      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.save();
        // Scale & cover image
        const scale = Math.max(canvas.width / bgImg.naturalWidth, canvas.height / bgImg.naturalHeight);
        const x = (canvas.width - bgImg.naturalWidth * scale) / 2;
        const y = (canvas.height - bgImg.naturalHeight * scale) / 2;
        ctx.drawImage(bgImg, x, y, bgImg.naturalWidth * scale, bgImg.naturalHeight * scale);
        
        // Dark Overlay for readability
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, 'rgba(9, 9, 11, 0.75)');
        bgGradient.addColorStop(0.35, 'rgba(9, 9, 11, 0.55)');
        bgGradient.addColorStop(0.7, 'rgba(9, 9, 11, 0.85)');
        bgGradient.addColorStop(1, 'rgba(9, 9, 11, 0.98)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else {
        // Fallback procedural tactical background pattern
        const grad = ctx.createRadialGradient(600, 800, 100, 600, 800, 1000);
        grad.addColorStop(0, '#1c1917');
        grad.addColorStop(1, '#09090b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 3. Grid Lines Overlay
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 4. Outer Tactical Border & Corner Crosshairs
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 6;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);

      // Corner Crosshairs
      const drawCrosshair = (cx: number, cy: number) => {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 20, cy); ctx.lineTo(cx + 20, cy);
        ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy + 20);
        ctx.stroke();
      };
      drawCrosshair(50, 50);
      drawCrosshair(canvas.width - 50, 50);
      drawCrosshair(50, canvas.height - 50);
      drawCrosshair(canvas.width - 50, canvas.height - 50);

      // 5. Header Banner Box
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(60, 60, canvas.width - 120, 140);
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, canvas.width - 120, 140);

      // Top Header Title
      ctx.fillStyle = '#ef4444';
      ctx.font = '900 38px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((companyDetails.name || 'BOSJOL TACTICAL AIRSOFT').toUpperCase(), canvas.width / 2, 115);

      ctx.fillStyle = '#10b981';
      ctx.font = '700 20px monospace';
      ctx.fillText('OFFICIAL OPERATIONAL MISSION POSTER • SOUTH AFRICA', canvas.width / 2, 155);

      // 6. Event Type Badge & Status Pill
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(60, 230, 220, 48, 8);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(event.type.toUpperCase(), 170, 262);

      // Status Pill
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.roundRect(canvas.width - 280, 230, 220, 48, 8);
      ctx.fill();

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 20px monospace';
      ctx.fillText((event.status || 'UPCOMING').toUpperCase(), canvas.width - 170, 262);

      // 7. Main Event Title Box
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 64px sans-serif';
      ctx.textAlign = 'center';
      
      // Wrap Title if too long
      const titleWords = event.title.split(' ');
      let line1 = '';
      let line2 = '';
      for (const word of titleWords) {
        if ((line1 + ' ' + word).length < 22) {
          line1 += (line1 ? ' ' : '') + word;
        } else {
          line2 += (line2 ? ' ' : '') + word;
        }
      }

      ctx.shadowColor = 'rgba(220, 38, 38, 0.8)';
      ctx.shadowBlur = 25;
      if (line2) {
        ctx.fillText(line1.toUpperCase(), canvas.width / 2, 350);
        ctx.fillText(line2.toUpperCase(), canvas.width / 2, 425);
      } else {
        ctx.fillText(line1.toUpperCase(), canvas.width / 2, 380);
      }
      ctx.shadowBlur = 0; // Reset shadow

      // Theme Subtitle
      if (event.theme) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'italic 700 28px sans-serif';
        ctx.fillText(`OPERATIONAL THEME: "${event.theme}"`, canvas.width / 2, line2 ? 475 : 435);
      }

      // Divider Line
      const startY = line2 ? 510 : 470;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, startY);
      ctx.lineTo(canvas.width - 80, startY);
      ctx.stroke();

      // 8. Event Key Logistics Section (Grid of 3 Info Blocks)
      const infoBoxY = startY + 30;
      const boxWidth = 330;
      const boxHeight = 120;

      // Date Box
      ctx.fillStyle = 'rgba(24, 24, 27, 0.85)';
      ctx.fillRect(80, infoBoxY, boxWidth, boxHeight);
      ctx.strokeStyle = '#3f3f46';
      ctx.strokeRect(80, infoBoxY, boxWidth, boxHeight);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 18px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('📅 EVENT DATE', 100, infoBoxY + 35);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }), 100, infoBoxY + 80);

      // Time Box
      ctx.fillStyle = 'rgba(24, 24, 27, 0.85)';
      ctx.fillRect(435, infoBoxY, boxWidth, boxHeight);
      ctx.strokeStyle = '#3f3f46';
      ctx.strokeRect(435, infoBoxY, boxWidth, boxHeight);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('⏰ BRIEFING & START', 455, infoBoxY + 35);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(`${event.startTime || '10:00'} SHARP`, 455, infoBoxY + 80);

      // Location Box
      ctx.fillStyle = 'rgba(24, 24, 27, 0.85)';
      ctx.fillRect(790, infoBoxY, boxWidth, boxHeight);
      ctx.strokeStyle = '#3f3f46';
      ctx.strokeRect(790, infoBoxY, boxWidth, boxHeight);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('📍 ARENA FIELD', 810, infoBoxY + 35);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      const locText = event.location || 'Bosjol Field';
      ctx.fillText(locText.length > 18 ? locText.substring(0, 18) + '...' : locText, 810, infoBoxY + 80);

      // 9. Pricing & Rental Gear Breakdown Box (High Prominence)
      const pricingY = infoBoxY + boxHeight + 40;
      const pricingHeight = 360;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
      ctx.fillRect(80, pricingY, canvas.width - 160, pricingHeight);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.strokeRect(80, pricingY, canvas.width - 160, pricingHeight);

      // Pricing Header Banner inside Box
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(80, pricingY, canvas.width - 160, 55);
      ctx.fillStyle = '#34d399';
      ctx.font = '900 24px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('💵 OFFICIAL EVENT ENTRY FEES & RENTAL OPTIONS', 105, pricingY + 36);

      // Entry Game Fee
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('ENTRY FIELD FEE:', 110, pricingY + 110);

      ctx.fillStyle = '#10b981';
      ctx.font = '900 42px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(event.gameFee ? `R${event.gameFee}.00` : 'FREE ENTRY', canvas.width - 120, pricingY + 115);

      // Divider inside pricing box
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(110, pricingY + 145);
      ctx.lineTo(canvas.width - 110, pricingY + 145);
      ctx.stroke();

      // Rental Gear Options List
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('RENTAL EQUIPMENT AVAILABLE ON SITE:', 110, pricingY + 185);

      const rentalGearIds = event.gearForRent || [];
      const rentalItems = inventory.filter(i => rentalGearIds.includes(i.id));

      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#e4e4e7';
      let rY = pricingY + 225;

      if (rentalItems.length > 0) {
        rentalItems.slice(0, 4).forEach((item) => {
          const price = event.rentalPriceOverrides?.[item.id] ?? item.salePrice;
          ctx.textAlign = 'left';
          ctx.fillStyle = '#e4e4e7';
          ctx.fillText(`• ${item.name}`, 130, rY);

          ctx.textAlign = 'right';
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 20px monospace';
          ctx.fillText(`R${price}.00`, canvas.width - 130, rY);
          ctx.font = '20px sans-serif';

          rY += 32;
        });
      } else {
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText('• Standard Rental Kits available on site (AEG Rifle, Mask & BBs)', 130, rY);
        rY += 32;
        ctx.fillText('• Contact Arena Command for special equipment reservations', 130, rY);
      }

      // 10. Briefing & Rules Section
      const briefingY = pricingY + pricingHeight + 30;
      ctx.fillStyle = 'rgba(24, 24, 27, 0.85)';
      ctx.fillRect(80, briefingY, 680, 260);
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(80, briefingY, 680, 260);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('📜 BRIEFING & ENGAGEMENT RULES', 105, briefingY + 40);

      ctx.fillStyle = '#d4d4d8';
      ctx.font = '18px sans-serif';
      const rulesText = event.rules || event.description || 'Full face protection mandatory. Chrono check required prior to match start. Observe tactical safety guidelines at all times.';
      
      // Simple word wrapping for rules text
      const words = rulesText.split(' ');
      let currentLine = '';
      let lineY = briefingY + 80;
      for (const w of words) {
        if ((currentLine + ' ' + w).length < 52) {
          currentLine += (currentLine ? ' ' : '') + w;
        } else {
          ctx.fillText(currentLine, 105, lineY);
          currentLine = w;
          lineY += 28;
          if (lineY > briefingY + 230) break;
        }
      }
      if (currentLine && lineY <= briefingY + 230) {
        ctx.fillText(currentLine, 105, lineY);
      }

      // 11. QR Code Box (Right Bottom)
      const qrBoxX = 790;
      const qrBoxY = briefingY;
      const qrBoxSize = 260;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.src = qrDataUrl;
        qrImg.onload = () => {
          ctx.drawImage(qrImg, qrBoxX + 15, qrBoxY + 15, qrBoxSize - 30, qrBoxSize - 35);
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('SCAN FOR FAST CHECK-IN', qrBoxX + (qrBoxSize / 2), qrBoxY + qrBoxSize - 8);
        };
      }

      // 12. Footer Branding
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`POWERED BY BOSJOL COMMAND SYSTEM • CONTACT: ${companyDetails.contactNumber || '082 123 4567'}`, canvas.width / 2, canvas.height - 45);
    };

    // Load poster background image if available
    if (posterBgUrl) {
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.src = posterBgUrl;
      bgImg.onload = () => drawPosterContent(bgImg);
      bgImg.onerror = () => drawPosterContent();
    } else {
      drawPosterContent();
    }
  }, [event, inventory, companyDetails, posterBgUrl, qrDataUrl]);

  // Download Razor-Sharp JPG Poster
  const handleDownloadJpg = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    const safeTitle = event.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `Bosjol_Event_Poster_${safeTitle}.jpg`;
    link.href = dataUrl;
    link.click();
  };

  // Trigger Gemini AI Poster Art Generation
  const handleGenerateAiPoster = async () => {
    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const promptText = customThemePrompt || `High-end razor-sharp epic tactical airsoft promotional event poster background art for Bosjol Tactical Airsoft Field. 
Event Title: ${event.title}. Theme: ${event.theme || 'CQB Skirmish'}. Location: ${event.location}.
Style: Cinematic, high contrast, gritty tactical action, razor sharp detail, intense dramatic atmospheric lighting, professional promotional esports & mil-sim poster art. Aspect ratio portrait 3:4. Clean background image without text overlay.`;

      const res = await fetch('/api/generate-poster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: promptText,
          title: event.title,
          theme: event.theme,
          location: event.location
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate AI poster artwork');
      }

      if (data.imageUrl) {
        setPosterBgUrl(data.imageUrl);
        if (onUpdateEventImage) {
          onUpdateEventImage(data.imageUrl);
        }
      }
    } catch (err: any) {
      console.error('Poster generation failed:', err);
      setAiError(err.message || 'Image generation failed. Check GEMINI_API_KEY environment variable.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-5xl w-full my-auto overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Razor Sharp Event Poster Generator
              </h2>
              <p className="text-xs text-zinc-400">High-end operational poster ready for 1-click JPG export or print</p>
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
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto flex-grow">
          {/* Left Column: Interactive Poster Canvas Preview */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-zinc-950/80 p-3 sm:p-4 rounded-xl border border-zinc-800/80">
            <div className="relative max-w-full max-h-[62vh] aspect-[3/4] shadow-[0_0_40px_rgba(220,38,38,0.25)] rounded-lg overflow-hidden border border-zinc-700">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain block rounded"
              />
            </div>
            <p className="text-[11px] font-mono text-zinc-400 mt-3 text-center">
              ✓ Ultra HD 1200x1600 Canvas • Razor Sharp Vector Layout with QR Pass & Pricing Matrix
            </p>
          </div>

          {/* Right Column: Controls, AI Art Generator, Download & API Key Explanation */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Primary Action: Export Download Button */}
              <div className="bg-gradient-to-br from-emerald-950/60 to-zinc-900 p-4 rounded-xl border border-emerald-500/40 space-y-2">
                <button
                  onClick={handleDownloadJpg}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.4)] transition transform hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Razor Sharp JPG Poster</span>
                </button>
                <p className="text-[10px] text-emerald-400/90 text-center font-mono">
                  Generates ready-to-print/share 300DPI JPG containing event details & QR Pass
                </p>
              </div>

              {/* AI Artwork Generator Tool */}
              <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    AI Poster Background Art Generator
                  </h3>
                  <button
                    onClick={() => setShowApiKeyGuide(!showApiKeyGuide)}
                    className="text-[10px] text-zinc-400 hover:text-amber-300 underline flex items-center gap-1"
                  >
                    <Info className="w-3 h-3" />
                    <span>API Key Setup</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Custom Theme / Artwork Prompt (Optional):
                  </label>
                  <textarea
                    rows={2}
                    placeholder={`e.g. Gritty night vision airsoft mission at abandoned military depot, intense red flares, cinematic high contrast...`}
                    value={customThemePrompt}
                    onChange={(e) => setCustomThemePrompt(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  onClick={handleGenerateAiPoster}
                  disabled={isGeneratingAi}
                  className="w-full py-2.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Generating High-End AI Artwork...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      <span>Generate New AI Background Art</span>
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

              {/* API Key Variable Setup Guide Accordion */}
              {showApiKeyGuide && (
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-amber-500/40 text-zinc-300 text-xs space-y-2">
                  <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-400" />
                    How to Configure GEMINI_API_KEY Variable:
                  </h4>
                  <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-zinc-300">
                    <li>
                      <strong>Environment Variable Name:</strong> <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">GEMINI_API_KEY</code>
                    </li>
                    <li>
                      <strong>Where to Add:</strong> In Google AI Studio, open the <strong>Settings &gt; Secrets</strong> panel and add <code className="bg-zinc-900 px-1 py-0.5 rounded text-amber-300 font-mono">GEMINI_API_KEY</code> with your key.
                    </li>
                    <li>
                      <strong>Secure Architecture:</strong> The key resides strictly on the server (<code className="bg-zinc-900 px-1 py-0.5 rounded text-zinc-200 font-mono">process.env.GEMINI_API_KEY</code>) and is never sent or exposed to the client browser.
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Quick Details Summary Box */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-1.5 text-zinc-400">
              <p className="font-bold text-white flex items-center justify-between">
                <span>Event Summary:</span>
                <span className="text-red-400 font-mono">{event.title}</span>
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>Date: <span className="text-zinc-200">{event.date}</span></div>
                <div>Fee: <span className="text-emerald-400">{event.gameFee ? `R${event.gameFee}` : 'Free'}</span></div>
                <div>Location: <span className="text-zinc-200">{event.location}</span></div>
                <div>Rentals: <span className="text-amber-400">{event.gearForRent?.length || 0} items</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
