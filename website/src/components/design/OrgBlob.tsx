"use client";

type BlobVariant = 1 | 2 | 3 | 4 | 5 | 6;

// Six distinct organic shapes — no two are the same
const PATHS: Record<BlobVariant, string> = {
  1: "M420,180 Q480,80 380,40 Q280,0 200,60 Q100,130 40,200 Q-10,260 60,320 Q130,380 240,370 Q350,360 400,280 Q440,220 420,180Z",
  2: "M320,120 Q380,50 300,20 Q220,-10 140,50 Q60,110 30,200 Q0,290 80,340 Q160,390 260,350 Q360,310 370,220 Q380,150 320,120Z",
  3: "M390,170 Q460,60 350,20 Q240,-20 150,50 Q50,130 30,240 Q10,350 110,390 Q210,430 320,370 Q430,310 420,220 Q410,150 390,170Z",
  4: "M360,140 Q440,30 330,5 Q220,-20 130,60 Q30,150 20,270 Q10,390 120,410 Q230,430 330,360 Q430,290 400,200 Q370,130 360,140Z",
  5: "M450,200 Q510,90 400,45 Q290,-10 190,70 Q70,160 50,280 Q30,400 140,420 Q250,440 360,365 Q470,290 460,210 Q450,150 450,200Z",
  6: "M280,90 Q360,10 270,-10 Q180,-30 100,60 Q20,150 15,270 Q10,390 120,400 Q230,410 310,330 Q390,250 370,160 Q350,80 280,90Z",
};

const VIEWBOXES: Record<BlobVariant, string> = {
  1: "0 0 500 400",
  2: "0 0 400 400",
  3: "0 0 480 450",
  4: "0 0 460 440",
  5: "0 0 520 450",
  6: "0 0 410 420",
};

interface OrgBlobProps {
  variant?: BlobVariant;
  color?: string;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function OrgBlob({
  variant = 1,
  color = "#22A06B",
  opacity = 0.1,
  className = "",
  style,
}: OrgBlobProps) {
  return (
    <svg
      viewBox={VIEWBOXES[variant]}
      className={className}
      style={{ display: "block", ...style }}
      aria-hidden="true"
    >
      <path d={PATHS[variant]} fill={color} opacity={opacity} />
    </svg>
  );
}
