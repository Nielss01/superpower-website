"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

/**
 * HeroLandscape — Signature multi-colour flowing terrain waves.
 *
 * Design system rules:
 *   - 10 overlapping cubic-bezier paths — ALL curves, ZERO straight lines
 *   - Vertical linearGradient per band (lighter top → richer bottom)
 *   - Bands DIP and SOAR, crossing over each other
 *   - Colors RICH and SOLID at full opacity
 *
 * Animation (anime.js v4):
 *   - Path morphing (d attribute) — dramatic shape shifts
 *   - Vertical parallax float — top bands move more
 *   - Horizontal sway — subtle lateral drift for extra life
 *   - Faster cycles for more visible motion
 */

const W = 1200;
const H = 520;

interface Band {
  gradId: string;
  stops: [string, string, string];
  pathA: string;
  pathB: string;
  opacity: number;
  floatY: number;
  floatDur: number;
  swayX: number;
  swayDur: number;
  morphDur: number;
  delay: number;
}

const BANDS: Band[] = [
  {
    // 1. Deep Green — dark base, huge dramatic arcs
    gradId: "wg1",
    stops: ["#0D4F34", "#1B5E3B", "#2BA88C"],
    pathA: `M-50,200 C80,100 180,400 350,260 C520,140 580,440 720,280 C860,140 950,380 1100,220 C1180,170 1230,370 1250,400 C1250,470 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,400 -50,200Z`,
    pathB: `M-50,240 C120,150 220,380 400,240 C580,110 640,420 780,300 C920,180 1000,400 1140,250 C1200,200 1250,360 1250,380 C1250,450 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,430 -50,240Z`,
    opacity: 1,
    floatY: 20,
    floatDur: 5000,
    swayX: 8,
    swayDur: 7000,
    morphDur: 6000,
    delay: 0,
  },
  {
    // 2. Blue — dramatic dips, crosses over green
    gradId: "wg2",
    stops: ["#2B6FA0", "#3174B5", "#5BA4D9"],
    pathA: `M-50,340 C100,160 220,460 400,240 C580,60 620,420 780,300 C940,200 1080,460 1250,290 C1250,400 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,440 -50,340Z`,
    pathB: `M-50,300 C140,200 280,440 460,260 C640,100 700,400 860,320 C1020,240 1140,440 1250,330 C1250,430 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,420 -50,300Z`,
    opacity: 1,
    floatY: 16,
    floatDur: 5500,
    swayX: 7,
    swayDur: 8000,
    morphDur: 7000,
    delay: 400,
  },
  {
    // 3. Lime — bright sunlit band, soars high
    gradId: "wg3",
    stops: ["#3E8C30", "#6DBF47", "#4CAF50"],
    pathA: `M-50,380 C60,260 140,500 300,320 C460,160 520,460 680,340 C840,240 960,480 1120,330 C1190,290 1240,440 1250,450 C1250,490 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,460 -50,380Z`,
    pathB: `M-50,350 C100,240 180,480 340,300 C500,140 560,440 720,320 C880,220 1000,460 1160,310 C1220,280 1250,420 1250,430 C1250,475 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,440 -50,350Z`,
    opacity: 1,
    floatY: 14,
    floatDur: 6000,
    swayX: 6,
    swayDur: 9000,
    morphDur: 7500,
    delay: 200,
  },
  {
    // 4. Teal — weaves between others
    gradId: "wg4",
    stops: ["#1B8C6B", "#2BA88C", "#22A06B"],
    pathA: `M-50,300 C100,420 200,230 380,370 C560,480 640,240 800,380 C960,480 1100,290 1250,400 C1250,460 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,400 -50,300Z`,
    pathB: `M-50,330 C130,400 240,260 420,390 C600,500 680,270 860,400 C1020,500 1140,310 1250,420 C1250,475 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,420 -50,330Z`,
    opacity: 1,
    floatY: 12,
    floatDur: 6500,
    swayX: 5,
    swayDur: 8500,
    morphDur: 8000,
    delay: 600,
  },
  {
    // 5. Orange — warm hills
    gradId: "wg5",
    stops: ["#C06830", "#D4763C", "#E8944A"],
    pathA: `M-50,420 C80,300 200,500 380,360 C560,250 640,480 800,380 C960,300 1100,500 1250,390 C1250,460 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,480 -50,420Z`,
    pathB: `M-50,390 C120,290 240,480 420,350 C600,240 700,460 860,370 C1020,290 1140,480 1250,380 C1250,450 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,460 -50,390Z`,
    opacity: 1,
    floatY: 10,
    floatDur: 7000,
    swayX: 5,
    swayDur: 9500,
    morphDur: 8500,
    delay: 300,
  },
  {
    // 6. Sky blue — crosses orange
    gradId: "wg6",
    stops: ["#4A90C4", "#5BA4D9", "#7CC0E8"],
    pathA: `M-50,360 C120,460 260,280 440,410 C620,520 700,300 880,430 C1060,520 1150,370 1250,445 C1250,490 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,450 -50,360Z`,
    pathB: `M-50,390 C150,480 290,310 470,430 C650,530 730,320 910,450 C1090,530 1180,390 1250,460 C1250,500 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,470 -50,390Z`,
    opacity: 1,
    floatY: 8,
    floatDur: 7500,
    swayX: 4,
    swayDur: 10000,
    morphDur: 9000,
    delay: 800,
  },
  {
    // 7. Gold / Amber
    gradId: "wg7",
    stops: ["#A07828", "#C4923A", "#D4A84E"],
    pathA: `M-50,450 C100,380 240,500 420,420 C600,350 680,495 850,430 C1020,380 1140,498 1250,448 C1250,490 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,495 -50,450Z`,
    pathB: `M-50,435 C130,370 270,492 450,412 C630,340 710,488 880,422 C1050,370 1170,490 1250,438 C1250,485 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,488 -50,435Z`,
    opacity: 1,
    floatY: 6,
    floatDur: 8000,
    swayX: 3,
    swayDur: 11000,
    morphDur: 9500,
    delay: 500,
  },
  {
    // 8. Sienna / Red — warm ground
    gradId: "wg8",
    stops: ["#8C3620", "#B5452A", "#C45A3A"],
    pathA: `M-50,470 C80,430 180,510 340,455 C500,410 580,500 740,460 C900,425 1040,508 1250,470 C1250,498 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,500 -50,470Z`,
    pathB: `M-50,458 C110,420 210,502 370,448 C530,402 610,494 770,452 C930,418 1070,500 1250,462 C1250,492 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,496 -50,458Z`,
    opacity: 1,
    floatY: 5,
    floatDur: 9000,
    swayX: 3,
    swayDur: 12000,
    morphDur: 10000,
    delay: 900,
  },
  {
    // 9. Bright emerald — accent stripe
    gradId: "wg9",
    stops: ["#1A8058", "#22A06B", "#38B87C"],
    pathA: `M-50,485 C120,462 280,508 460,478 C640,450 760,502 940,476 C1120,455 1200,502 1250,488 C1250,506 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,508 -50,485Z`,
    pathB: `M-50,475 C150,455 310,500 490,470 C670,444 790,496 970,468 C1150,448 1230,496 1250,480 C1250,500 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,502 -50,475Z`,
    opacity: 1,
    floatY: 4,
    floatDur: 10000,
    swayX: 2,
    swayDur: 13000,
    morphDur: 11000,
    delay: 700,
  },
  {
    // 10. Pink — front accent, semi-transparent, crosses others
    gradId: "wg10",
    stops: ["#C03868", "#D4497A", "#E06090"],
    pathA: `M-50,440 C60,480 160,410 300,460 C440,505 520,420 680,470 C840,508 960,435 1120,478 C1190,492 1240,505 1250,462 C1250,498 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,490 -50,440Z`,
    pathB: `M-50,460 C90,498 190,425 330,475 C470,515 550,435 710,485 C870,518 990,445 1150,492 C1220,502 1250,515 1250,478 C1250,506 1250,${H} 1250,${H} C800,${H} 200,${H} -50,${H} C-50,${H} -50,500 -50,460Z`,
    opacity: 0.75,
    floatY: 7,
    floatDur: 6000,
    swayX: 4,
    swayDur: 8000,
    morphDur: 7000,
    delay: 350,
  },
];

export default function HeroLandscape() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const paths = svg.querySelectorAll<SVGPathElement>("path[data-wave]");
    const animations: ReturnType<typeof animate>[] = [];

    paths.forEach((path, i) => {
      const b = BANDS[i];
      if (!b) return;

      // 1. Path morphing — dramatic shape shifts between two states
      animations.push(
        animate(path, {
          d: [b.pathA, b.pathB],
          duration: b.morphDur,
          loop: true,
          alternate: true,
          ease: "inOutSine",
          delay: b.delay,
        })
      );

      // 2. Vertical parallax float — top bands move much more
      animations.push(
        animate(path, {
          translateY: [-b.floatY, b.floatY],
          duration: b.floatDur,
          loop: true,
          alternate: true,
          ease: "inOutQuad",
          delay: b.delay + 200,
        })
      );

      // 3. Horizontal sway — subtle lateral drift for extra life
      animations.push(
        animate(path, {
          translateX: [-b.swayX, b.swayX],
          duration: b.swayDur,
          loop: true,
          alternate: true,
          ease: "inOutSine",
          delay: b.delay + 500,
        })
      );
    });

    return () => {
      animations.forEach((a) => a.revert());
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "65%",
        overflow: "hidden",
        zIndex: 0,
        pointerEvents: "none",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 10%)",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 10%)",
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      >
        <defs>
          {BANDS.map((b) => (
            <linearGradient key={b.gradId} id={b.gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={b.stops[0]} />
              <stop offset="50%" stopColor={b.stops[1]} />
              <stop offset="100%" stopColor={b.stops[2]} />
            </linearGradient>
          ))}
        </defs>

        {BANDS.map((b, i) => (
          <path
            key={i}
            data-wave={i}
            d={b.pathA}
            fill={`url(#${b.gradId})`}
            opacity={b.opacity}
          />
        ))}
      </svg>
    </div>
  );
}
