"use client";
import { useRef, useEffect, useState } from "react";
import { toPng } from "html-to-image";

// ─── Canvas dimensions ────────────────────────────────────────────────────────
const W = 1320;
const H = 2868;

// ─── Phone mockup measurements ───────────────────────────────────────────────
const MK_W = 1022;
const MK_H = 2082;
const SC_L = (52 / MK_W) * 100;
const SC_T = (46 / MK_H) * 100;
const SC_W = (918 / MK_W) * 100;
const SC_H = (1990 / MK_H) * 100;
const SC_RX = (126 / 918) * 100;
const SC_RY = (126 / 1990) * 100;

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:       "#16131E",
  surface:  "#1F1C2B",
  card:     "#2B2739",
  border:   "#3E3A52",
  text:     "#F2F8EF",
  muted:    "#8A8799",
  secondary:"#B8BBD5",
  primary:  "#F9C5B1",  // warm peach
  pink:     "#E8B4C8",
  mint:     "#C8E6C0",
  yellow:   "#F5D5A0",
  lavender: "#B8BBD5",
  gray:     "#D0CDD4",
};

const CDN = "https://stickermeapp.ink/stickers";

const STYLES = [
  { id: "3d-cartoon",      name: "3D Cartoon",    accent: C.primary,  emoji: "🎬" },
  { id: "anime-kawaii",    name: "Anime Kawaii",  accent: C.lavender, emoji: "🌸" },
  { id: "chibi-game",      name: "Chibi Gamer",   accent: C.mint,     emoji: "🎮" },
  { id: "watercolor-soft", name: "Watercolor",    accent: C.pink,     emoji: "🎨" },
  { id: "pop-art",         name: "Pop Art",       accent: C.yellow,   emoji: "💥" },
  { id: "minimalist-line", name: "Minimal Line",  accent: C.gray,     emoji: "✏️" },
];

const STICKERS = [
  { url: `${CDN}/3d-cartoon/laughing.png`,       accent: C.primary  },
  { url: `${CDN}/anime-kawaii/affectionate.png`,  accent: C.lavender },
  { url: `${CDN}/chibi-game/laughing.png`,        accent: C.mint     },
  { url: `${CDN}/watercolor-soft/winking.png`,    accent: C.pink     },
  { url: `${CDN}/pop-art/laughing.png`,           accent: C.yellow   },
  { url: `${CDN}/minimalist-line/laughing.png`,   accent: C.gray     },
];

// ─── Shared components ────────────────────────────────────────────────────────
function Label({ children, color = C.primary }: { children: string; color?: string }) {
  return (
    <div style={{
      fontSize: W * 0.026,
      fontWeight: 700,
      letterSpacing: "0.18em",
      color,
      textTransform: "uppercase",
      marginBottom: W * 0.022,
      fontFamily: "inherit",
    }}>
      {children}
    </div>
  );
}

function Headline({ children, size = W * 0.092 }: { children: React.ReactNode; size?: number }) {
  return (
    <div style={{
      fontSize: size,
      fontWeight: 800,
      color: C.text,
      lineHeight: 1.0,
      letterSpacing: "-0.03em",
      fontFamily: "inherit",
    }}>
      {children}
    </div>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: W * 0.038,
      fontWeight: 400,
      color: C.secondary,
      lineHeight: 1.4,
      marginTop: W * 0.028,
      fontFamily: "inherit",
    }}>
      {children}
    </div>
  );
}

// Glowing orb decoration
function Orb({ cx, cy, r, color, opacity = 0.18 }: {
  cx: number; cy: number; r: number; color: string; opacity?: number;
}) {
  return (
    <div style={{
      position: "absolute",
      left: cx - r,
      top: cy - r,
      width: r * 2,
      height: r * 2,
      borderRadius: "50%",
      background: color,
      opacity,
      filter: `blur(${r * 0.55}px)`,
      pointerEvents: "none",
    }} />
  );
}

// Sticker chip with glow
function StickerChip({ url, accent, size, style: s }: {
  url: string; accent: string; size: number; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.22,
      overflow: "hidden",
      border: `3px solid ${accent}55`,
      boxShadow: `0 ${size * 0.1}px ${size * 0.35}px ${accent}30, 0 0 ${size * 0.5}px ${accent}18`,
      flexShrink: 0,
      ...s,
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

// ─── SLIDE 1: Hero — "Your selfie. 6 stickers." ──────────────────────────────
function Slide1() {
  // 6 stickers in a ring
  const chipSize = W * 0.21;
  const rX = W * 0.34;
  const rY = W * 0.34;
  const cx = W / 2;
  const cy = H * 0.42;

  const positions = STICKERS.map((_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    return {
      x: Math.round(cx + Math.cos(angle) * rX - chipSize / 2),
      y: Math.round(cy + Math.sin(angle) * rY - chipSize / 2),
    };
  });

  return (
    <div style={{
      width: W, height: H,
      background: `radial-gradient(ellipse 80% 60% at 50% 38%, #2A2040 0%, ${C.bg} 70%)`,
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Background orbs */}
      <Orb cx={W * 0.5}  cy={H * 0.4}  r={W * 0.55} color={C.primary}  opacity={0.10} />
      <Orb cx={W * 0.15} cy={H * 0.55} r={W * 0.3}  color={C.pink}     opacity={0.08} />
      <Orb cx={W * 0.85} cy={H * 0.3}  r={W * 0.28} color={C.lavender} opacity={0.07} />

      {/* Sticker ring */}
      {STICKERS.map((s, i) => (
        <div key={i} style={{ position: "absolute", left: positions[i].x, top: positions[i].y }}>
          <StickerChip url={s.url} accent={s.accent} size={chipSize} />
        </div>
      ))}

      {/* Center glow dot */}
      <div style={{
        position: "absolute",
        left: cx - W * 0.07, top: cy - W * 0.07,
        width: W * 0.14, height: W * 0.14,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${C.primary}60 0%, transparent 70%)`,
      }} />

      {/* Text block */}
      <div style={{
        position: "absolute",
        left: W * 0.1, right: W * 0.1,
        bottom: H * 0.14,
        textAlign: "center",
      }}>
        <Label color={C.primary}>StickerMe</Label>
        <Headline size={W * 0.1}>
          Your selfie.<br />
          <span style={{ color: C.primary }}>6 stickers.</span>
        </Headline>
        <Sub>AI sticker pack — ready in 30 seconds</Sub>
      </div>

      {/* Bottom gradient fade */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: H * 0.16,
        background: `linear-gradient(to top, ${C.bg}, transparent)`,
      }} />
    </div>
  );
}

// ─── SLIDE 2: "6 styles. One you." ───────────────────────────────────────────
function Slide2() {
  const chipSize = W * 0.36;
  const gap = W * 0.04;

  return (
    <div style={{
      width: W, height: H,
      background: `linear-gradient(160deg, #1C1830 0%, ${C.bg} 45%, #1A1528 100%)`,
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <Orb cx={W * 0.8}  cy={H * 0.2}  r={W * 0.35} color={C.lavender} opacity={0.09} />
      <Orb cx={W * 0.2}  cy={H * 0.75} r={W * 0.32} color={C.pink}     opacity={0.09} />

      {/* Text header */}
      <div style={{
        position: "absolute",
        top: H * 0.08,
        left: W * 0.1, right: W * 0.1,
      }}>
        <Label color={C.lavender}>Pick Your Style</Label>
        <Headline>
          6 styles.<br />
          <span style={{ color: C.lavender }}>One you.</span>
        </Headline>
        <Sub>Every style is a different vibe.</Sub>
      </div>

      {/* 2×3 style grid */}
      <div style={{
        position: "absolute",
        top: H * 0.36,
        left: W * 0.08, right: W * 0.08,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap,
      }}>
        {STYLES.map((style, i) => (
          <div key={i} style={{
            position: "relative",
            borderRadius: chipSize * 0.16,
            overflow: "hidden",
            border: `2px solid ${style.accent}30`,
            boxShadow: `0 8px 32px ${style.accent}20`,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${CDN}/${style.id}/laughing.png`}
              alt={style.name}
              style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }}
            />
            {/* Style name badge */}
            <div style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              background: `linear-gradient(to top, rgba(22,19,30,0.92) 0%, transparent 100%)`,
              padding: `${chipSize * 0.22}px ${chipSize * 0.12}px ${chipSize * 0.1}px`,
            }}>
              <div style={{
                fontSize: W * 0.032,
                fontWeight: 700,
                color: style.accent,
                fontFamily: "inherit",
              }}>
                {style.emoji} {style.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: H * 0.06,
        background: `linear-gradient(to top, ${C.bg}, transparent)`,
      }} />
    </div>
  );
}

// ─── SLIDE 3: "Ready in 30 seconds." ─────────────────────────────────────────
function Slide3() {
  const bigSize = W * 0.32;
  const smSize  = W * 0.22;

  return (
    <div style={{
      width: W, height: H,
      background: `radial-gradient(ellipse 90% 55% at 50% 65%, #241E36 0%, ${C.bg} 65%)`,
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <Orb cx={W * 0.5}  cy={H * 0.62} r={W * 0.5}  color={C.mint}    opacity={0.08} />
      <Orb cx={W * 0.1}  cy={H * 0.45} r={W * 0.25} color={C.primary} opacity={0.07} />

      {/* Text block top */}
      <div style={{
        position: "absolute",
        top: H * 0.08,
        left: W * 0.1, right: W * 0.1,
      }}>
        <Label color={C.mint}>Speed</Label>
        <Headline>
          Ready in<br />
          <span style={{ color: C.mint }}>30 seconds.</span>
        </Headline>
        <Sub>One selfie. Six expressions.<br />All yours.</Sub>
      </div>

      {/* Process steps */}
      <div style={{
        position: "absolute",
        top: H * 0.36,
        left: W * 0.08, right: W * 0.08,
        display: "flex",
        alignItems: "center",
        gap: W * 0.025,
      }}>
        {/* Step: Photo */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: W * 0.025,
        }}>
          <div style={{
            width: W * 0.26, height: W * 0.26, borderRadius: W * 0.06,
            background: C.card,
            border: `2px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: W * 0.1,
          }}>📸</div>
          <div style={{ fontSize: W * 0.03, color: C.muted, fontWeight: 600, fontFamily: "inherit" }}>
            Selfie
          </div>
        </div>

        {/* Arrow */}
        <div style={{ fontSize: W * 0.07, color: C.primary, opacity: 0.7, flexShrink: 0, marginBottom: W * 0.04 }}>→</div>

        {/* Step: AI */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: W * 0.025,
        }}>
          <div style={{
            width: W * 0.26, height: W * 0.26, borderRadius: W * 0.06,
            background: `linear-gradient(135deg, ${C.primary}22, ${C.pink}22)`,
            border: `2px solid ${C.primary}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: W * 0.1,
          }}>✨</div>
          <div style={{ fontSize: W * 0.03, color: C.muted, fontWeight: 600, fontFamily: "inherit" }}>
            AI Magic
          </div>
        </div>

        {/* Arrow */}
        <div style={{ fontSize: W * 0.07, color: C.primary, opacity: 0.7, flexShrink: 0, marginBottom: W * 0.04 }}>→</div>

        {/* Step: Stickers */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: W * 0.025,
        }}>
          <div style={{
            width: W * 0.26, height: W * 0.26, borderRadius: W * 0.06,
            background: `linear-gradient(135deg, ${C.mint}22, ${C.lavender}22)`,
            border: `2px solid ${C.mint}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: W * 0.1,
          }}>🎉</div>
          <div style={{ fontSize: W * 0.03, color: C.muted, fontWeight: 600, fontFamily: "inherit" }}>
            6 Stickers
          </div>
        </div>
      </div>

      {/* 3 big stickers fanned out */}
      <div style={{
        position: "absolute",
        bottom: H * 0.08,
        left: "50%",
        transform: "translateX(-50%)",
        width: W * 0.92,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: W * 0.04,
      }}>
        <StickerChip url={`${CDN}/3d-cartoon/laughing.png`}           accent={C.primary}  size={smSize}  style={{ transform: "rotate(-8deg) translateY(20px)" }} />
        <StickerChip url={`${CDN}/chibi-game/affectionate.png`}        accent={C.mint}     size={bigSize} style={{ transform: "translateY(0px)" }} />
        <StickerChip url={`${CDN}/anime-kawaii/winking.png`}           accent={C.lavender} size={smSize}  style={{ transform: "rotate(8deg) translateY(20px)" }} />
      </div>

      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0, height: H * 0.1,
        background: `linear-gradient(to top, ${C.bg}, transparent)`,
      }} />
    </div>
  );
}

// ─── SLIDE 4: "Send it everywhere." ──────────────────────────────────────────
const PLATFORMS = [
  { name: "Telegram",  color: "#229ED9", icon: "✈️" },
  { name: "WhatsApp",  color: "#25D366", icon: "💬" },
  { name: "iMessage",  color: "#34C759", icon: "🍎" },
  { name: "Discord",   color: "#5865F2", icon: "🎮" },
];

function Slide4() {
  return (
    <div style={{
      width: W, height: H,
      background: `linear-gradient(175deg, #1A1430 0%, ${C.bg} 40%, #161325 100%)`,
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <Orb cx={W * 0.2}  cy={H * 0.3}  r={W * 0.38} color={C.pink}     opacity={0.09} />
      <Orb cx={W * 0.85} cy={H * 0.65} r={W * 0.3}  color={C.primary}  opacity={0.08} />

      {/* Text top */}
      <div style={{
        position: "absolute",
        top: H * 0.08,
        left: W * 0.1, right: W * 0.1,
      }}>
        <Label color={C.pink}>Works Everywhere</Label>
        <Headline>
          Send it<br />
          <span style={{ color: C.pink }}>everywhere.</span>
        </Headline>
        <Sub>Your stickers work on every app<br />your friends are on.</Sub>
      </div>

      {/* Chat mockup */}
      <div style={{
        position: "absolute",
        top: H * 0.36,
        left: W * 0.08, right: W * 0.08,
        display: "flex",
        flexDirection: "column",
        gap: W * 0.04,
      }}>
        {/* Received bubble */}
        <div style={{
          display: "flex", alignItems: "flex-end", gap: W * 0.025,
        }}>
          <div style={{
            width: W * 0.1, height: W * 0.1, borderRadius: "50%",
            background: C.card,
            border: `2px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: W * 0.045, flexShrink: 0,
          }}>👤</div>
          <div style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: `${W * 0.05}px ${W * 0.05}px ${W * 0.05}px ${W * 0.012}px`,
            padding: `${W * 0.028}px ${W * 0.04}px`,
            fontSize: W * 0.038,
            color: C.secondary,
            fontFamily: "inherit",
            maxWidth: "72%",
          }}>
            Check out my new sticker! 😍
          </div>
        </div>

        {/* Sticker row */}
        <div style={{
          display: "flex", gap: W * 0.035,
          paddingLeft: W * 0.12,
        }}>
          {[
            { url: `${CDN}/3d-cartoon/laughing.png`,     accent: C.primary  },
            { url: `${CDN}/watercolor-soft/affectionate.png`, accent: C.pink },
            { url: `${CDN}/anime-kawaii/winking.png`,    accent: C.lavender },
          ].map((s, i) => (
            <StickerChip key={i} url={s.url} accent={s.accent} size={W * 0.2} />
          ))}
        </div>

        {/* Reply bubble */}
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "flex-end", gap: W * 0.025,
        }}>
          <div style={{
            background: C.primary,
            borderRadius: `${W * 0.05}px ${W * 0.05}px ${W * 0.012}px ${W * 0.05}px`,
            padding: `${W * 0.028}px ${W * 0.04}px`,
            fontSize: W * 0.038,
            color: C.bg,
            fontWeight: 600,
            fontFamily: "inherit",
            maxWidth: "72%",
          }}>
            Omg so cute, where?? 🥺
          </div>
          <div style={{
            width: W * 0.1, height: W * 0.1, borderRadius: "50%",
            background: `${C.primary}22`,
            border: `2px solid ${C.primary}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: W * 0.045, flexShrink: 0,
          }}>😊</div>
        </div>
      </div>

      {/* Platform badges */}
      <div style={{
        position: "absolute",
        bottom: H * 0.1,
        left: W * 0.08, right: W * 0.08,
        display: "flex", gap: W * 0.03,
        flexWrap: "wrap", justifyContent: "center",
      }}>
        {PLATFORMS.map(p => (
          <div key={p.name} style={{
            background: `${p.color}15`,
            border: `1.5px solid ${p.color}40`,
            borderRadius: W * 0.025,
            padding: `${W * 0.02}px ${W * 0.04}px`,
            fontSize: W * 0.034,
            fontWeight: 700,
            color: p.color,
            fontFamily: "inherit",
          }}>
            {p.icon} {p.name}
          </div>
        ))}
      </div>

      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0, height: H * 0.08,
        background: `linear-gradient(to top, ${C.bg}, transparent)`,
      }} />
    </div>
  );
}

// ─── SLIDE 5: "Pay once. Done." ───────────────────────────────────────────────
function Slide5() {
  const features = [
    { icon: "✨", text: "6 unique stickers per style" },
    { icon: "⚡", text: "Generated in under 30 seconds" },
    { icon: "📲", text: "Telegram, WhatsApp, iMessage" },
    { icon: "♾️", text: "Yours forever — no expiry" },
  ];

  return (
    <div style={{
      width: W, height: H,
      background: `radial-gradient(ellipse 70% 50% at 50% 55%, #221B35 0%, ${C.bg} 65%)`,
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <Orb cx={W * 0.5}  cy={H * 0.5}  r={W * 0.55} color={C.yellow}  opacity={0.07} />
      <Orb cx={W * 0.1}  cy={H * 0.3}  r={W * 0.3}  color={C.primary} opacity={0.07} />
      <Orb cx={W * 0.9}  cy={H * 0.7}  r={W * 0.28} color={C.pink}    opacity={0.06} />

      {/* Text top */}
      <div style={{
        position: "absolute",
        top: H * 0.08,
        left: W * 0.1, right: W * 0.1,
      }}>
        <Label color={C.yellow}>Pricing</Label>
        <Headline>
          Pay once.<br />
          <span style={{ color: C.yellow }}>Done.</span>
        </Headline>
        <Sub>No subscription. No renewal.<br />Own your stickers forever.</Sub>
      </div>

      {/* Pricing card */}
      <div style={{
        position: "absolute",
        top: H * 0.38,
        left: W * 0.08, right: W * 0.08,
        background: C.card,
        border: `1.5px solid ${C.yellow}35`,
        borderRadius: W * 0.055,
        padding: W * 0.07,
        boxShadow: `0 0 ${W * 0.1}px ${C.yellow}15`,
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: W * 0.02,
          background: `${C.yellow}18`,
          border: `1px solid ${C.yellow}40`,
          borderRadius: W * 0.025,
          padding: `${W * 0.015}px ${W * 0.032}px`,
          marginBottom: W * 0.045,
        }}>
          <span style={{ fontSize: W * 0.03 }}>⭐</span>
          <span style={{ fontSize: W * 0.028, fontWeight: 700, color: C.yellow, fontFamily: "inherit" }}>
            ONE-TIME PURCHASE
          </span>
        </div>

        {/* Price row */}
        <div style={{
          display: "flex", alignItems: "baseline", gap: W * 0.02, marginBottom: W * 0.055,
        }}>
          <span style={{ fontSize: W * 0.14, fontWeight: 800, color: C.text, lineHeight: 1, fontFamily: "inherit" }}>
            $2.99
          </span>
          <span style={{ fontSize: W * 0.038, color: C.muted, fontFamily: "inherit" }}>
            per style
          </span>
        </div>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: W * 0.03 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: W * 0.03 }}>
              <span style={{ fontSize: W * 0.045, flexShrink: 0 }}>{f.icon}</span>
              <span style={{
                fontSize: W * 0.036, color: C.secondary, fontFamily: "inherit", fontWeight: 500,
              }}>
                {f.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom stickers decoration */}
      <div style={{
        position: "absolute",
        bottom: H * 0.06,
        left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: W * 0.045, alignItems: "center",
      }}>
        {[
          { url: `${CDN}/pop-art/laughing.png`,           accent: C.yellow   },
          { url: `${CDN}/3d-cartoon/blowing_kiss.png`,    accent: C.primary  },
          { url: `${CDN}/chibi-game/laughing.png`,        accent: C.mint     },
          { url: `${CDN}/anime-kawaii/crying.png`,        accent: C.lavender },
        ].map((s, i) => (
          <StickerChip key={i} url={s.url} accent={s.accent} size={W * 0.17}
            style={{ transform: `rotate(${[-6, -2, 2, 6][i]}deg)` }} />
        ))}
      </div>

      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0, height: H * 0.07,
        background: `linear-gradient(to top, ${C.bg}, transparent)`,
      }} />
    </div>
  );
}

// ─── Registry ─────────────────────────────────────────────────────────────────
const SCREENSHOTS = [
  { id: "01-hero",       label: "Hero",          component: <Slide1 /> },
  { id: "02-styles",     label: "6 Styles",       component: <Slide2 /> },
  { id: "03-speed",      label: "30 Seconds",     component: <Slide3 /> },
  { id: "04-platforms",  label: "Send Everywhere",component: <Slide4 /> },
  { id: "05-pricing",    label: "Pay Once",       component: <Slide5 /> },
];

const EXPORT_SIZES = [
  { label: '6.9"', w: 1320, h: 2868 },
  { label: '6.5"', w: 1284, h: 2778 },
  { label: '6.3"', w: 1206, h: 2622 },
  { label: '6.1"', w: 1125, h: 2436 },
] as const;

// ─── Preview card ─────────────────────────────────────────────────────────────
function ScreenshotPreview({
  item,
  onExportMount,
}: {
  item: (typeof SCREENSHOTS)[0];
  onExportMount: (el: HTMLDivElement | null) => void;
}) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setScale(el.clientWidth / W);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Scaled preview */}
      <div
        ref={previewRef}
        style={{
          width: "100%",
          aspectRatio: `${W}/${H}`,
          overflow: "hidden",
          borderRadius: 12,
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          position: "relative",
        }}
      >
        <div style={{
          width: W, height: H,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          position: "absolute", top: 0, left: 0,
        }}>
          {item.component}
        </div>
      </div>

      {/* Off-screen export clone */}
      <div
        ref={onExportMount}
        style={{
          width: W, height: H,
          position: "absolute",
          left: -9999, top: 0,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {item.component}
      </div>

      <div style={{ textAlign: "center", color: "#8A8799", fontSize: 13 }}>
        {item.label}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ScreenshotsPage() {
  const exportEls = useRef<(HTMLDivElement | null)[]>(Array(SCREENSHOTS.length).fill(null));
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState("");

  async function exportAll(sizeIndex = 0) {
    const size = EXPORT_SIZES[sizeIndex];
    setExporting(true);

    for (let i = 0; i < SCREENSHOTS.length; i++) {
      const item = SCREENSHOTS[i];
      const el = exportEls.current[i];
      if (!el) { console.warn(`No export element for slide ${i}`); continue; }

      setProgress(`Exporting ${item.label}…`);

      // Bring on-screen for capture
      el.style.left = "0px";
      el.style.zIndex = "-1";
      await new Promise(r => setTimeout(r, 250));

      const opts = { width: W, height: H, pixelRatio: 1, cacheBust: true };

      try {
        await toPng(el, opts);                    // warm up fonts + images
        const dataUrl = await toPng(el, opts);    // clean capture

        // Resize to target size
        const img = new Image();
        img.src = dataUrl;
        await new Promise(r => { img.onload = r; });

        const canvas = document.createElement("canvas");
        canvas.width = size.w;
        canvas.height = size.h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, size.w, size.h);

        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `${item.id}-${size.w}x${size.h}.png`;
        a.click();
      } finally {
        el.style.left = "-9999px";
        el.style.zIndex = "";
      }

      await new Promise(r => setTimeout(r, 300));
    }

    setProgress("");
    setExporting(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0E0C16",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: "40px 24px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontSize: 28, fontWeight: 800, color: "#F2F8EF",
            margin: 0, letterSpacing: "-0.03em",
          }}>
            StickerMe — App Store Screenshots
          </h1>
          <p style={{ color: "#8A8799", marginTop: 8, fontSize: 14, margin: "8px 0 0" }}>
            5 slides · 1320×2868px · Export for all iPhone sizes
          </p>
        </div>

        {/* Export toolbar */}
        <div style={{
          background: "#1F1C2B",
          border: "1px solid #3E3A52",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 40,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}>
          {EXPORT_SIZES.map((size, i) => (
            <button
              key={i}
              onClick={() => exportAll(i)}
              disabled={exporting}
              style={{
                background: "#F9C5B1",
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: 700,
                color: "#16131E",
                cursor: exporting ? "not-allowed" : "pointer",
                opacity: exporting ? 0.5 : 1,
                fontFamily: "inherit",
              }}
            >
              Export {size.label} — {size.w}×{size.h}
            </button>
          ))}
          {progress && (
            <span style={{ color: "#F9C5B1", fontSize: 13, marginLeft: 4 }}>
              ⏳ {progress}
            </span>
          )}
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 32,
        }}>
          {SCREENSHOTS.map((item, i) => (
            <ScreenshotPreview
              key={item.id}
              item={item}
              onExportMount={(el) => { exportEls.current[i] = el; }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
