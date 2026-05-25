import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { api } from "~/trpc/server";
import { getAverageRating } from "~/utils/helpers";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Rate My Roommate";

// Brand palette
const CREAM = "#F6F3EE";
const INK = "#1F1B16";
const INK_MUTED = "#6B6660";
const BRAND = "#58CC02";
const GOLD = "#E8A93C";

type Props = { params: { id: string; locale: string } };

export default async function OgImage({ params: { id, locale } }: Props) {
  const [user, t] = await Promise.all([
    api.user.getById(id),
    getTranslations({ locale, namespace: "metadata.user" }),
  ]);

  const name = user?.name?.trim() ?? "";
  const rating = user ? getAverageRating(user) : 0;
  const reviewCount = user?.reviewsReceived.length ?? 0;
  const overline = locale === "hu" ? "SZOBATÁRSAT KERESEK" : "I'M LOOKING FOR A ROOMMATE";
  const reviewsLabel = locale === "hu" ? "értékelés" : "reviews";
  const headline = user ? name || t("title") : t("title");
  const initial = (name.charAt(0) || "?").toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          background: CREAM,
          color: INK,
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* decorative brand circle bleeding off the top-right edge */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -180,
            width: 560,
            height: 560,
            borderRadius: 999,
            background: BRAND,
          }}
        />

        {/* brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 999, background: BRAND }} />
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>rmrm</div>
        </div>

        {/* headline block */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            maxWidth: 920,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 999,
                background: BRAND,
                color: INK,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              {initial}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 3,
                color: BRAND,
              }}
            >
              {overline}
            </div>
          </div>
          <div
            style={{
              fontSize: 104,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: -3,
              marginBottom: 24,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {headline}
          </div>

          {reviewCount > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: INK,
                color: CREAM,
                padding: "14px 28px",
                borderRadius: 999,
                fontSize: 32,
                fontWeight: 700,
                alignSelf: "flex-start",
              }}
            >
              <span style={{ color: GOLD }}>★</span>
              <span>{rating.toFixed(1)}</span>
              <span style={{ color: INK_MUTED }}>·</span>
              <span>
                {reviewCount} {reviewsLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
