import React, { useState, useRef, useCallback } from 'react';
import type { SocialLink } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { 
  Trash2, 
  Plus, 
  Upload, 
  ExternalLink, 
  Image as ImageIcon, 
  Loader2,
  CheckCircle2,
  X,
  Link as LinkIcon
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { deleteFromSupabaseStorage } from '../utils/storageCleaner';

interface SocialLinksManagerProps {
  socialLinks: SocialLink[];
  onChange: (updatedLinks: SocialLink[]) => void;
  apiServerUrl?: string;
  onUploadingChange?: (uploading: boolean) => void;
}

const POPULAR_PLATFORMS = [
  { name: 'Instagram', defaultUrl: 'https://instagram.com/' },
  { name: 'Discord', defaultUrl: 'https://discord.gg/' },
  { name: 'Facebook', defaultUrl: 'https://facebook.com/' },
  { name: 'TikTok', defaultUrl: 'https://tiktok.com/@' },
  { name: 'YouTube', defaultUrl: 'https://youtube.com/@' },
  { name: 'WhatsApp', defaultUrl: 'https://chat.whatsapp.com/' },
  { name: 'X / Twitter', defaultUrl: 'https://x.com/' },
  { name: 'Telegram', defaultUrl: 'https://t.me/' }
];

export const SocialLinksManager: React.FC<SocialLinksManagerProps> = ({
  socialLinks,
  onChange,
  apiServerUrl,
  onUploadingChange
}) => {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [urlInputOpenId, setUrlInputOpenId] = useState<string | null>(null);

  const handleAddLink = (platformName?: string, defaultUrl?: string) => {
    const newLink: SocialLink = {
      id: `social_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: platformName || '',
      url: defaultUrl || '',
      iconUrl: ''
    };
    onChange([...socialLinks, newLink]);
  };

  const handleRemoveLink = (id: string) => {
    const linkToRemove = socialLinks.find(l => l.id === id);
    if (linkToRemove?.iconUrl) {
      deleteFromSupabaseStorage(linkToRemove.iconUrl).catch(() => {});
    }
    onChange(socialLinks.filter(l => l.id !== id));
  };

  const handleUpdateField = (id: string, field: keyof SocialLink, value: string) => {
    onChange(
      socialLinks.map(l => (l.id === id ? { ...l, [field]: value } : l))
    );
  };

  const uploadIconFile = useCallback(async (linkId: string, file: File) => {
    setUploadingId(linkId);
    onUploadingChange?.(true);

    try {
      // 1. Try Supabase Storage first if configured
      if (isSupabaseConfigured() && supabase) {
        const ext = file.name.split('.').pop() || 'png';
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `social_icons/${Date.now()}_${sanitizedName}`;
        const buckets = ['media', 'public', 'uploads', 'settings'];

        for (const bucket of buckets) {
          try {
            const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            });
            if (!error && data) {
              const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path || filePath);
              if (publicUrlData?.publicUrl) {
                handleUpdateField(linkId, 'iconUrl', publicUrlData.publicUrl);
                return;
              }
            }
          } catch (e) {
            console.warn(`Supabase bucket ${bucket} upload failed, checking next:`, e);
          }
        }
      }

      // 2. Try API server upload if provided
      if (apiServerUrl) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch(`${apiServerUrl}/upload`, {
            method: 'POST',
            body: formData
          });
          if (res.ok) {
            const result = await res.json();
            if (result.url) {
              handleUpdateField(linkId, 'iconUrl', result.url);
              return;
            }
          }
        } catch (e) {
          console.warn('API Server upload failed:', e);
        }
      }

      // 3. Client-side Base64 fallback (guaranteed instant reliability for icons)
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          handleUpdateField(linkId, 'iconUrl', dataUrl);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to upload social icon file:', err);
    } finally {
      setUploadingId(null);
      onUploadingChange?.(false);
    }
  }, [apiServerUrl, onUploadingChange, socialLinks]);

  return (
    <div className="space-y-4">
      {/* Header with Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Social Links & Channels
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-900/60 text-[10px] font-mono font-bold">
              {socialLinks.length} Active
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Upload custom JPG/PNG icons and configure direct profile URLs displayed on the Welcome and Login screens.
          </p>
        </div>

        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => handleAddLink()} 
          className="!py-1 !px-3 text-xs font-bold shrink-0"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Social Link
        </Button>
      </div>

      {/* Quick Add Platform Starter Chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1">Quick Add:</span>
        {POPULAR_PLATFORMS.map(p => (
          <button
            key={p.name}
            type="button"
            onClick={() => handleAddLink(p.name, p.defaultUrl)}
            className="px-2 py-1 rounded bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[10px] font-medium transition-all"
          >
            + {p.name}
          </button>
        ))}
      </div>

      {/* Social Links List */}
      {socialLinks.length === 0 ? (
        <div className="p-6 rounded-xl bg-zinc-950/40 border border-dashed border-zinc-800 text-center space-y-3">
          <ImageIcon className="w-8 h-8 mx-auto text-zinc-600" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-300">No Social Links Configured</p>
            <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
              Add your community Instagram, Discord, YouTube, or Facebook channels with custom JPG/PNG icon uploads.
            </p>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => handleAddLink('Instagram', 'https://instagram.com/')}
            className="!py-1.5 !px-3 text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Your First Link
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {socialLinks.map((link) => {
            const isUploading = uploadingId === link.id;
            const isUrlInputOpen = urlInputOpenId === link.id;
            const fileInputRef = React.createRef<HTMLInputElement>();

            return (
              <div 
                key={link.id} 
                className="p-3 sm:p-3.5 bg-zinc-950/70 rounded-xl border border-zinc-800/90 hover:border-zinc-700/80 transition-all flex flex-col justify-between space-y-3"
              >
                {/* Top Row: Icon Upload / Thumbnail + Network Name + Remove */}
                <div className="flex items-start gap-3">
                  {/* JPG / PNG Icon Upload Box */}
                  <div className="relative group shrink-0">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 relative ${
                        link.iconUrl 
                          ? 'border-zinc-700 bg-black/60 shadow-inner' 
                          : 'border-dashed border-zinc-700 hover:border-red-500 bg-zinc-900/60'
                      }`}
                      title="Click to upload JPG or PNG icon"
                    >
                      {link.iconUrl ? (
                        <img 
                          src={link.iconUrl} 
                          alt={link.name || 'Social Icon'} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain p-1.5"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-1 text-center">
                          <ImageIcon className="w-4 h-4 text-zinc-500 group-hover:text-red-400 transition-colors" />
                          <span className="text-[8px] font-bold text-zinc-400 mt-0.5 leading-none">
                            JPG/PNG
                          </span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[9px] font-semibold text-center p-0.5">
                        <Upload className="w-3.5 h-3.5 mb-0.5 text-red-400" />
                        <span>Change</span>
                      </div>

                      {/* Loading state */}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Hidden Native File Input */}
                    <input 
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.svg,image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          uploadIconFile(link.id, file);
                        }
                      }}
                    />
                  </div>

                  {/* Platform / Network Name & Controls */}
                  <div className="flex-grow space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Platform / Network
                      </label>
                      <button 
                        type="button"
                        onClick={() => handleRemoveLink(link.id)} 
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors rounded hover:bg-red-950/40"
                        title="Delete this social link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <Input 
                      value={link.name} 
                      onChange={(e) => handleUpdateField(link.id, 'name', e.target.value)} 
                      placeholder="e.g. Instagram, Discord, TikTok" 
                      className="!text-xs !py-1.5 !bg-zinc-900/90" 
                    />

                    {/* Icon Action Buttons: Upload JPG/PNG vs Direct URL */}
                    <div className="flex items-center gap-2 pt-0.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <Upload className="w-3 h-3" /> Upload JPG/PNG
                      </button>
                      <span className="text-zinc-700">|</span>
                      <button
                        type="button"
                        onClick={() => setUrlInputOpenId(isUrlInputOpen ? null : link.id)}
                        className="text-zinc-400 hover:text-zinc-200 font-medium flex items-center gap-1 hover:underline"
                      >
                        {isUrlInputOpen ? 'Hide URL Box' : 'Paste Image URL'}
                      </button>
                      {link.iconUrl && (
                        <>
                          <span className="text-zinc-700">|</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateField(link.id, 'iconUrl', '')}
                            className="text-zinc-500 hover:text-red-400 font-medium hover:underline"
                          >
                            Remove Icon
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Optional: Direct Icon Image URL input field */}
                {isUrlInputOpen && (
                  <div className="pt-1.5 border-t border-zinc-800/80 space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400">
                      Direct Icon Image URL (JPG/PNG):
                    </label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={link.iconUrl || ''}
                        onChange={(e) => handleUpdateField(link.id, 'iconUrl', e.target.value.trim())}
                        placeholder="https://example.com/icon.png"
                        className="!text-xs !py-1 !bg-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={() => setUrlInputOpenId(null)}
                        className="p-1 text-zinc-400 hover:text-white"
                        title="Close URL field"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Row: Social Profile URL with Test Button */}
                <div className="space-y-1 pt-1 border-t border-zinc-800/60">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Target Profile / Channel URL
                    </label>
                    {link.url && (
                      <a 
                        href={link.url.startsWith('http') ? link.url : `https://${link.url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                        title="Test link in new tab"
                      >
                        <span>Test Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <Input 
                    value={link.url} 
                    onChange={(e) => handleUpdateField(link.id, 'url', e.target.value)} 
                    placeholder="https://instagram.com/yourhandle" 
                    className="!text-xs !py-1.5 !bg-zinc-900/90 font-mono" 
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Preview on Welcome / Login Screen */}
      {socialLinks.length > 0 && (
        <div className="p-3 bg-black/50 rounded-xl border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Live Preview (Welcome & Login Screen Display)
            </span>
          </div>

          <div className="flex items-center justify-center p-3 rounded-lg bg-zinc-950/80 border border-zinc-800">
            <div className="flex items-center justify-center gap-4 bg-black/60 px-4 py-2 rounded-full border border-zinc-800/70 shadow-lg">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url ? (link.url.startsWith('http') ? link.url : `https://${link.url}`) : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:scale-110 transition-transform flex items-center gap-1"
                  title={link.name || 'Social Link'}
                >
                  {link.iconUrl && link.iconUrl.trim() !== '' ? (
                    <img 
                      src={link.iconUrl} 
                      alt={link.name} 
                      referrerPolicy="no-referrer"
                      className="h-5 w-5 object-contain rounded" 
                    />
                  ) : (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {link.name || 'Link'}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
