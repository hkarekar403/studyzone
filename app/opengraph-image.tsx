import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "StudyZone — Class 4 Maths Practice"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            padding: "10px 28px",
            borderRadius: 9999,
            background: "rgba(255,255,255,0.15)",
            border: "2px solid rgba(255,255,255,0.35)",
            color: "white",
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 36,
          }}
        >
          Free · No Login · CBSE · ICSE · IGCSE
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 116,
            fontWeight: 800,
            color: "white",
            letterSpacing: -2,
          }}
        >
          StudyZone
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 46,
            fontWeight: 700,
            color: "#fde68a",
            marginTop: 12,
          }}
        >
          Make Maths Fun!
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "rgba(255,255,255,0.85)",
            marginTop: 28,
          }}
        >
          Class 4 Maths Practice — 19 Topics, 3 Difficulty Levels
        </div>
      </div>
    ),
    { ...size },
  )
}
