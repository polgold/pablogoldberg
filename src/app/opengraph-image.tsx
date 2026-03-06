import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Pablo Goldberg — Director, Producer, Cinematographer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
          backgroundColor: "#000",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 8,
            backgroundColor: "#F0C84A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 600,
            color: "#2d2d2d",
          }}
        >
          pg
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 300,
            color: "#fff",
            letterSpacing: "-0.02em",
          }}
        >
          PABLO GOLDBERG
        </div>
        <div
          style={{
            fontSize: 22,
            color: "#F0C84A",
            letterSpacing: "0.08em",
          }}
        >
          Director · Producer · Cinematographer
        </div>
      </div>
    ),
    { ...size },
  );
}
