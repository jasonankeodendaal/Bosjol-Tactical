import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Poster AI art generator endpoint - Bosjol Tactical Airsoft Poster Generator
app.post('/api/generate-poster', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: 'GEMINI_API_KEY environment variable is missing. Configure GEMINI_API_KEY in your environment secrets.'
      });
    }

    const {
      prompt,
      title,
      theme,
      type,
      location,
      description,
      rules,
      rentalInfo,
      bgImageUrl,
      gameFee,
      rentalFee,
      date,
      startTime,
      briefingTime,
      subjectType,
      hypeText,
      layoutStyle,
      generateMode
    } = req.body;

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const isFullPoster = generateMode !== 'plate_only';

    // Subject description based on preset
    const subjectDesc = subjectType === 'tactical_ape'
      ? 'badass anthropomorphic tactical ape operator wearing detailed airsoft mil-sim gear, bump helmet with night vision goggles, ballistic plate carrier, tactical headset, holding weathered custom M4 rifle'
      : subjectType === 'ghillie_sniper'
      ? 'elite ghillie suit sniper operator holding a suppressed scoped sniper rifle, concealed in woodland terrain with extreme depth of field and intense lighting'
      : subjectType === 'heavy_juggernaut'
      ? 'hyper-detailed heavy airsoft juggernaut operator in reinforced explosive bomb-suit armor with ballistic shield and minigun, illuminated by toxic neon green and crimson flare lighting'
      : subjectType === 'dual_faceoff'
      ? 'dual squad showdown with two elite tactical airsoft operators facing each other in dynamic combat pose through heavy symmetrical red vs blue tactical smoke'
      : 'elite modern tactical airsoft operator wearing detailed mil-sim combat gear, bump helmet with comms headset, reflective ballistic goggles, modular plate carrier, tactical gloves, holding a weathered M4 assault rifle';

    const eventDateStr = date || 'Upcoming Saturday';
    const eventTimeStr = `${briefingTime || '09:30'} Briefing • ${startTime || '10:00'} Game On`;
    const locationStr = location || 'Bosjol Tactical Arena';
    const pricingStr = `Own Gear: R${gameFee ?? 50} | Rentals: R${rentalFee ?? 350}`;
    const titleStr = (title || 'TACTICAL AIRSOFT MISSION').toUpperCase();
    const hypePhrase = (hypeText || 'RUN HIDE REVIVE').toUpperCase();
    const rulesBrief = rules || description || 'Full face protection mandatory under 18. Biodegradable BBs only. Chrono limit 1.5J.';

    let fullPrompt = '';
    if (isFullPoster) {
      fullPrompt = `Masterpiece promotional marketing event poster for "Bosjol Tactical Airsoft", 3D cinematic realism, luxurious top-class movie poster quality, 8k resolution, octane render, extreme depth of field, dramatic volumetric atmospheric lighting, heavy grunge textures (dirt, mud, paint splatters, distressed wood, metallic scratches). Aspect ratio portrait 3:4.

SCENARIO & AESTHETIC:
- Main Subject: ${subjectDesc}.
- Environment: War-torn airsoft arena with barricaded wooden fortresses, tall watchtowers, stacked rubber tires, and military ammo crates.
- Lighting: Extreme contrast, atmospheric volumetric tactical smoke (symmetrical red vs blue smoke explosions or toxic neon lime-green glow).
${prompt ? `Event Directive: ${prompt}` : ''}

POSTER GRAPHIC DESIGN ELEMENTS (TOP TO BOTTOM TO RENDER ON POSTER):
1. TOP HEADER: "BOSJOL TACTICAL AIRSOFT PRESENTS" in spaced-out military stencil typography with tactical crest and team flags.
2. HERO TITLE & 3D ANCHORS:
   - Massive dead-center 3D distressed military stencil title: "${titleStr}" with 3D embossed texture and contrasting dual colors.
   - Hanging metallic engraved steel dog tags with specular chain links.
   - Flanking red splatter or crosshair "5XP" arcade badge with gold ring.
   - Angled stencil graffiti on wooden crates: "${hypePhrase}" and "MORE THAN A GAME".
3. TACTICAL INFO MODULES (MID-SECTION):
   - A uniform horizontal row of 4 semi-transparent glowing rectangular boxes with thin neon borders and minimalist vector icons:
     * Box 1: [Calendar icon] "${eventDateStr}"
     * Box 2: [Clock icon] "${eventTimeStr}"
     * Box 3: [Map Pin icon] "${locationStr}"
     * Box 4: [Coins icon] "${pricingStr}"
4. RULES & MISSION BRIEF:
   - Tactical Mission Brief banner: "${rulesBrief.substring(0, 140)}".
   - Two-column layout with Standard Rules (green numbered steps) and Virus/Variant Rules (red biohazard icon).
5. FOOTER:
   - Dark lower third with operators aiming weapons behind sandbags, tires, and crates with graffiti.
   - Spaced-out white core value icons: "🎯 TEAMWORK  •  ⚡ STRATEGY  •  🚩 OBJECTIVE  •  ⭐ VICTORY".
   - Footer text: "BOSJOL TACTICAL AIRSOFT • WWW.BOSJOLAIRSOFT.CO.ZA".`;
    } else {
      fullPrompt = `Hyper-realistic 3D cinematic background plate for "Bosjol Tactical Airsoft" event poster. 8k resolution, top-class photorealism, luxurious octane render aesthetic.
Subject: ${subjectDesc}.
Environment: War-torn woodlands with barricaded wooden fortresses, watchtowers, stacked tires, and ammo crates.
Lighting: Volumetric tactical smoke, neon accents, dramatic rim lighting, extreme depth of field, heavy grunge textures. Clean cinematic background artwork without flat text overlay. Aspect ratio 3:4 portrait. ${prompt ? `Theme: ${prompt}` : ''}`;
    }

    const parts: any[] = [];

    // If user provided an existing uploaded image or background image, pass it to Gemini as inline data for reference
    if (bgImageUrl && typeof bgImageUrl === 'string' && bgImageUrl.startsWith('data:image/')) {
      const matches = bgImageUrl.match(/^data:(image\/\w+);base64,(.+)$/);
      if (matches) {
        parts.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    }

    parts.push({ text: fullPrompt });

    // Multi-model execution with graceful fallbacks
    const modelsToTry = [
      'gemini-3.1-flash-image',
      'imagen-3.0-generate-001',
      'gemini-3.1-flash-lite-image'
    ];

    let imageUrl = '';
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        if (modelName === 'imagen-3.0-generate-001') {
          const imgRes = await (ai.models as any).generateImages({
            model: 'imagen-3.0-generate-001',
            prompt: fullPrompt,
            config: {
              numberOfImages: 1,
              aspectRatio: '3:4',
              outputMimeType: 'image/jpeg'
            }
          });
          if (imgRes?.generatedImages?.[0]?.image?.imageBytes) {
            imageUrl = `data:image/jpeg;base64,${imgRes.generatedImages[0].image.imageBytes}`;
            break;
          }
        } else {
          const config: any = {};
          if (modelName.includes('flash') || modelName.includes('pro')) {
            config.imageConfig = {
              aspectRatio: '3:4',
              imageSize: '1K'
            };
          }

          const response = await ai.models.generateContent({
            model: modelName,
            contents: {
              parts
            },
            config
          });

          if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                break;
              }
            }
          }

          if (imageUrl) {
            break;
          }
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Poster generation attempt with ${modelName} failed, trying next fallback:`, err?.message || err);
      }
    }

    if (!imageUrl) {
      const errorMsg = lastError?.message || 'No image generated by the AI model. Check your API key and quotas.';
      return res.status(200).json({ success: false, error: errorMsg });
    }

    res.json({ imageUrl, success: true, isFullPoster });
  } catch (error: any) {
    console.error('Error generating poster art:', error);
    res.status(200).json({ success: false, error: error.message || 'Failed to generate poster art.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
