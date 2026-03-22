"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { toPng } from "html-to-image";

// ─── Canvas dimensions ────────────────────────────────────────────────────────
const W = 1320;
const H = 2868;

const SIZES = [
  { label: '6.9"', w: 1320, h: 2868 },
  { label: '6.5"', w: 1284, h: 2778 },
  { label: '6.3"', w: 1206, h: 2622 },
  { label: '6.1"', w: 1125, h: 2436 },
] as const;

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
const BRAND = "#FA5D29";
const BG_DARK = "#06060A";
const BG_MID = "#0D0B14";

// ─── Phone Component ─────────────────────────────────────────────────────────
function Phone({
  src,
  alt,
  style,
  className = "",
}: {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{ aspectRatio: `${MK_W}/${MK_H}`, ...style }}
    >
      <img
        src="/mockup.png"
        alt=""
        className="block w-full h-full"
        draggable={false}
      />
      <div
        className="absolute z-10 overflow-hidden"
        style={{
          left: `${SC_L}%`,
          top: `${SC_T}%`,
          width: `${SC_W}%`,
          height: `${SC_H}%`,
          borderRadius: `${SC_RX}% / ${SC_RY}%`,
        }}
      >
        <img
          src={src}
          alt={alt}
          className="block w-full h-full object-cover object-top"
          draggable={false}
        />
      </div>
    </div>
  );
}

// ─── Caption Component ───────────────────────────────────────────────────────
function Caption({
  label,
  headline,
  color = BRAND,
  align = "center",
}: {
  label: string;
  headline: React.ReactNode;
  color?: string;
  align?: "center" | "left";
}) {
  return (
    <div style={{ textAlign: align }}>
      <div
        style={{
          fontSize: W * 0.028,
          fontWeight: 600,
          color,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: W * 0.02,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: W * 0.085,
          fontWeight: 700,
          color: "#FFFFFF",
          lineHeight: 1.05,
        }}
      >
        {headline}
      </div>
    </div>
  );
}

// ─── Slide wrapper ───────────────────────────────────────────────────────────
function Slide({
  bg,
  children,
}: {
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: W,
        height: H,
        background: bg,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {children}
    </div>
  );
}

// ─── Slide 1: Hero ───────────────────────────────────────────────────────────
function Screenshot1() {
  return (
    <Slide bg={`radial-gradient(ellipse 80% 50% at 50% 70%, rgba(250,93,41,0.25) 0%, ${BG_DARK} 70%)`}>
      {/* Caption top */}
      <div style={{ position: "absolute", top: W * 0.12, left: 0, right: 0, zIndex: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: W * 0.028,
              fontWeight: 600,
              color: BRAND,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: W * 0.025,
            }}
          >
            AI STICKER PACK
          </div>
          <div
            style={{
              fontSize: W * 0.1,
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.05,
            }}
          >
            Your Face.
            <br />6 Stickers.
          </div>
        </div>
      </div>
      {/* Orange glow behind phone */}
      <div
        style={{
          position: "absolute",
          bottom: -W * 0.1,
          left: "50%",
          transform: "translateX(-50%)",
          width: W * 0.9,
          height: W * 0.9,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(250,93,41,0.35) 0%, rgba(250,93,41,0.08) 50%, transparent 70%)",
          zIndex: 1,
        }}
      />
      {/* Phone centered bottom */}
      <div
        style={{
          position: "absolute",
          bottom: -W * 0.05,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <Phone
          src="/screenshot/IMG_3522.PNG"
          alt="Hero screenshot"
          style={{ width: W * 0.82 }}
        />
      </div>
    </Slide>
  );
}

// ─── Slide 2: Choose Style ───────────────────────────────────────────────────
function Screenshot2() {
  return (
    <Slide bg={`linear-gradient(160deg, ${BG_DARK} 0%, #0F0A1A 40%, #1A0E20 70%, ${BG_MID} 100%)`}>
      {/* Subtle purple/orange gradient glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "-10%",
          width: W * 0.6,
          height: W * 0.6,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(107,78,255,0.15) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "-5%",
          width: W * 0.5,
          height: W * 0.5,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(250,93,41,0.12) 0%, transparent 70%)",
        }}
      />
      {/* Caption top-left aligned */}
      <div style={{ position: "absolute", top: W * 0.12, left: W * 0.08, zIndex: 20 }}>
        <Caption
          label="CHOOSE YOUR STYLE"
          headline={<>6 Styles.<br />Pick Your Vibe.</>}
          color="#B08AFF"
          align="left"
        />
      </div>
      {/* Phone right-shifted, tilted slightly */}
      <div
        style={{
          position: "absolute",
          bottom: -W * 0.02,
          left: "55%",
          transform: "translateX(-50%) rotate(3deg)",
          zIndex: 10,
        }}
      >
        <Phone
          src="/screenshot/IMG_3525.PNG"
          alt="Style picker"
          style={{ width: W * 0.78 }}
        />
      </div>
    </Slide>
  );
}

// ─── Slide 3: Expressions ────────────────────────────────────────────────────
function Screenshot3() {
  return (
    <Slide bg={`radial-gradient(ellipse 70% 40% at 50% 40%, rgba(249,197,177,0.12) 0%, ${BG_DARK} 70%)`}>
      {/* Warm glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: W * 0.8,
          height: W * 0.6,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(250,93,41,0.1) 0%, transparent 70%)",
        }}
      />
      {/* Phone centered */}
      <div
        style={{
          position: "absolute",
          top: W * 0.08,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <Phone
          src="/screenshot/Simulator Screenshot - iPhone 16e - 2026-03-16 at 16.00.48.png"
          alt="Expressions"
          style={{ width: W * 0.8 }}
        />
      </div>
      {/* Caption below phone */}
      <div style={{ position: "absolute", bottom: W * 0.15, left: 0, right: 0, zIndex: 20 }}>
        <Caption
          label="EXPRESSIONS"
          headline={<>6 Expressions.<br />Every Emotion.</>}
          color="#F9C5B1"
        />
      </div>
    </Slide>
  );
}

// ─── Slide 4: AI-Powered ─────────────────────────────────────────────────────
function Screenshot4() {
  return (
    <Slide bg={`radial-gradient(ellipse 60% 40% at 50% 60%, rgba(34,197,94,0.1) 0%, ${BG_DARK} 70%)`}>
      {/* Green/orange accent glows */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: W * 0.7,
          height: W * 0.7,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, rgba(250,93,41,0.05) 50%, transparent 70%)",
        }}
      />
      {/* Caption top */}
      <div style={{ position: "absolute", top: W * 0.12, left: 0, right: 0, zIndex: 20 }}>
        <Caption
          label="AI-POWERED"
          headline={<>AI Draws You<br />in 30 Seconds.</>}
          color="#22C55E"
        />
      </div>
      {/* Phone centered */}
      <div
        style={{
          position: "absolute",
          bottom: -W * 0.04,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <Phone
          src="/screenshot/Simulator Screenshot - iPhone 16e - 2026-03-16 at 16.06.14.png"
          alt="AI processing"
          style={{ width: W * 0.8 }}
        />
      </div>
    </Slide>
  );
}

// ─── Slide 5: Share Anywhere ─────────────────────────────────────────────────
function Screenshot5() {
  return (
    <Slide bg={`radial-gradient(ellipse 70% 50% at 40% 50%, rgba(59,130,246,0.08) 0%, ${BG_DARK} 60%), radial-gradient(ellipse 50% 40% at 70% 60%, rgba(34,197,94,0.08) 0%, transparent 60%)`}>
      {/* Caption top */}
      <div style={{ position: "absolute", top: W * 0.12, left: 0, right: 0, zIndex: 20 }}>
        <Caption
          label="SHARE ANYWHERE"
          headline={<>Use Everywhere.<br />Share Anytime.</>}
          color="#60A5FA"
        />
      </div>
      {/* Chat bubble decorations */}
      <div
        style={{
          position: "absolute",
          top: W * 0.55,
          left: W * 0.04,
          width: W * 0.18,
          height: W * 0.12,
          borderRadius: W * 0.03,
          background: "rgba(34,197,94,0.15)",
          border: "1px solid rgba(34,197,94,0.25)",
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: W * 0.9,
          right: W * 0.04,
          width: W * 0.15,
          height: W * 0.1,
          borderRadius: W * 0.025,
          background: "rgba(59,130,246,0.15)",
          border: "1px solid rgba(59,130,246,0.25)",
          zIndex: 5,
        }}
      />
      {/* Phone centered */}
      <div
        style={{
          position: "absolute",
          bottom: -W * 0.04,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <Phone
          src="/screenshot/IMG_3524.PNG"
          alt="Share stickers"
          style={{ width: W * 0.8 }}
        />
      </div>
    </Slide>
  );
}

// ─── Slide 6: Instant Save ───────────────────────────────────────────────────
function Screenshot6() {
  return (
    <Slide bg={`radial-gradient(ellipse 60% 35% at 50% 30%, rgba(34,197,94,0.12) 0%, ${BG_DARK} 70%)`}>
      {/* Green glow */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: W * 0.6,
          height: W * 0.5,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)",
        }}
      />
      {/* Phone top area */}
      <div
        style={{
          position: "absolute",
          top: W * 0.06,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <Phone
          src="/screenshot/Simulator Screenshot - iPhone 16e - 2026-03-16 at 16.08.29.png"
          alt="Save and share"
          style={{ width: W * 0.78 }}
        />
      </div>
      {/* Caption below */}
      <div style={{ position: "absolute", bottom: W * 0.15, left: 0, right: 0, zIndex: 20 }}>
        <Caption
          label="INSTANT SAVE"
          headline={<>Save &amp; Share<br />in One Tap.</>}
          color="#22C55E"
        />
      </div>
    </Slide>
  );
}

// ─── Slide 7: Get Started ────────────────────────────────────────────────────
function Screenshot7() {
  return (
    <Slide bg={`radial-gradient(ellipse 80% 60% at 50% 80%, rgba(250,93,41,0.3) 0%, rgba(250,93,41,0.05) 40%, ${BG_DARK} 70%)`}>
      {/* Bold orange gradient overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: "linear-gradient(to top, rgba(250,93,41,0.2) 0%, transparent 100%)",
        }}
      />
      {/* App icon + caption top */}
      <div style={{ position: "absolute", top: W * 0.08, left: 0, right: 0, zIndex: 20 }}>
        <div style={{ textAlign: "center", marginBottom: W * 0.04 }}>
          <img
            src="/icon.png"
            alt="StickerMe"
            style={{
              width: W * 0.12,
              height: W * 0.12,
              borderRadius: W * 0.027,
              display: "inline-block",
            }}
            draggable={false}
          />
        </div>
        <Caption
          label="GET STARTED"
          headline={<>Your Sticker.<br />Just One Photo.</>}
          color={BRAND}
        />
      </div>
      {/* Phone bottom centered */}
      <div
        style={{
          position: "absolute",
          bottom: -W * 0.06,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <Phone
          src="/screenshot/IMG_3526.PNG"
          alt="Get started"
          style={{ width: W * 0.82 }}
        />
      </div>
    </Slide>
  );
}

// ─── Screenshot registry ─────────────────────────────────────────────────────
const SCREENSHOTS: { id: string; name: string; component: React.FC }[] = [
  { id: "01-hero", name: "Hero", component: Screenshot1 },
  { id: "02-styles", name: "Choose Style", component: Screenshot2 },
  { id: "03-expressions", name: "Expressions", component: Screenshot3 },
  { id: "04-ai-powered", name: "AI-Powered", component: Screenshot4 },
  { id: "05-share", name: "Share Anywhere", component: Screenshot5 },
  { id: "06-save", name: "Instant Save", component: Screenshot6 },
  { id: "07-get-started", name: "Get Started", component: Screenshot7 },
];

// ─── Export helpers ──────────────────────────────────────────────────────────
async function exportNode(
  node: HTMLElement,
  targetW: number,
  targetH: number,
): Promise<string> {
  // Double-call trick: first render warms up fonts/images, second is clean
  await toPng(node, {
    width: W,
    height: H,
    canvasWidth: targetW,
    canvasHeight: targetH,
    pixelRatio: 1,
  });
  return toPng(node, {
    width: W,
    height: H,
    canvasWidth: targetW,
    canvasHeight: targetH,
    pixelRatio: 1,
  });
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ScreenshotGenerator() {
  const containerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);
  const [selectedSize, setSelectedSize] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportingIdx, setExportingIdx] = useState<number | null>(null);

  // ResizeObserver for scaling previews
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const availW = entry.contentRect.width;
        // 3 columns with gaps
        const colW = (availW - 32 * 2) / 3;
        setScale(colW / W);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleExportOne = useCallback(
    async (idx: number) => {
      const node = containerRefs.current[idx];
      if (!node || exporting) return;
      setExportingIdx(idx);
      try {
        const size = SIZES[selectedSize];
        const dataUrl = await exportNode(node, size.w, size.h);
        downloadDataUrl(
          dataUrl,
          `${SCREENSHOTS[idx].id}-${size.w}x${size.h}.png`,
        );
      } finally {
        setExportingIdx(null);
      }
    },
    [selectedSize, exporting],
  );

  const handleExportAll = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      for (const size of SIZES) {
        for (let i = 0; i < SCREENSHOTS.length; i++) {
          const node = containerRefs.current[i];
          if (!node) continue;
          setExportingIdx(i);
          const dataUrl = await exportNode(node, size.w, size.h);
          downloadDataUrl(
            dataUrl,
            `${SCREENSHOTS[i].id}-${size.w}x${size.h}.png`,
          );
          await delay(300);
        }
      }
    } finally {
      setExporting(false);
      setExportingIdx(null);
    }
  }, [exporting]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111",
        color: "#fff",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(17,17,17,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #333",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 18 }}>
          StickerMe Screenshots
        </span>
        <div style={{ flex: 1 }} />
        <label style={{ fontSize: 14, color: "#999" }}>
          Export size:&nbsp;
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(Number(e.target.value))}
            style={{
              background: "#222",
              color: "#fff",
              border: "1px solid #444",
              borderRadius: 6,
              padding: "4px 8px",
              fontSize: 14,
            }}
          >
            {SIZES.map((s, i) => (
              <option key={i} value={i}>
                {s.label} ({s.w}x{s.h})
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={handleExportAll}
          disabled={exporting}
          style={{
            background: exporting ? "#555" : BRAND,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 20px",
            fontWeight: 600,
            fontSize: 14,
            cursor: exporting ? "not-allowed" : "pointer",
          }}
        >
          {exporting ? "Exporting..." : "Export All"}
        </button>
      </div>

      {/* Preview grid */}
      <div
        ref={previewRef}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 32,
          padding: 32,
          maxWidth: 1400,
          margin: "0 auto",
        }}
      >
        {SCREENSHOTS.map((s, i) => {
          const Comp = s.component;
          return (
            <div key={s.id}>
              <div
                style={{
                  fontSize: 13,
                  color: "#888",
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  {i + 1}. {s.name}
                </span>
                <button
                  onClick={() => handleExportOne(i)}
                  disabled={exporting}
                  style={{
                    background: "transparent",
                    color: exportingIdx === i ? BRAND : "#666",
                    border: "1px solid #444",
                    borderRadius: 4,
                    padding: "2px 10px",
                    fontSize: 12,
                    cursor: exporting ? "not-allowed" : "pointer",
                  }}
                >
                  {exportingIdx === i ? "..." : "Export"}
                </button>
              </div>
              <div
                style={{
                  overflow: "hidden",
                  borderRadius: 8,
                  border: "1px solid #333",
                  background: "#000",
                  height: H * scale,
                }}
              >
                <div
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    width: W,
                    height: H,
                  }}
                >
                  <Comp />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Offscreen export containers */}
      <div
        style={{
          position: "absolute",
          left: -9999,
          top: 0,
          pointerEvents: "none",
        }}
      >
        {SCREENSHOTS.map((s, i) => {
          const Comp = s.component;
          return (
            <div
              key={s.id}
              ref={(el) => {
                containerRefs.current[i] = el;
              }}
              style={{ width: W, height: H }}
            >
              <Comp />
            </div>
          );
        })}
      </div>
    </div>
  );
}
