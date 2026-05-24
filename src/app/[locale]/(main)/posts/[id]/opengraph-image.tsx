import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { api } from "~/trpc/server";
import { getBaseUrl } from "~/i18n/seo";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Rate My Roommate";

// Brand palette (mirrors users/[id]/opengraph-image.tsx)
const CREAM = "#F6F3EE";
const INK = "#1F1B16";
const INK_MUTED = "#6B6660";
const BRAND = "#58CC02";

type Props = { params: { id: string; locale: string } };

export default async function OgImage({ params: { id, locale } }: Props) {
  const [post, tMeta, tLocation] = await Promise.all([
    api.post.getById(id),
    getTranslations({ locale, namespace: "metadata" }),
    getTranslations({ locale, namespace: "enums.location" }),
  ]);

  const overline = locale === "hu" ? "SZOBATÁRS HIRDETÉS" : "ROOMMATE LISTING";
  const spotsLabel = locale === "hu" ? "szabad hely" : "spots free";
  const perMonth = locale === "hu" ? "Ft/hó" : "HUF/mo";
  const siteLabel = getBaseUrl().replace(/^https?:\/\//, "");

  const headline = post
    ? tMeta("post.titleWithPrice", {
        location: tLocation(post.location),
        price: post.price,
      })
    : tMeta("home.title");
  const freeSpots = post ? Math.max(0, post.maxPersonCount - post.featuredUsers.length) : 0;

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
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 3,
              color: BRAND,
              marginBottom: 16,
            }}
          >
            {overline}
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: -2,
              marginBottom: 24,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {headline}
          </div>

          {post && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: INK,
                color: CREAM,
                padding: "14px 28px",
                borderRadius: 999,
                fontSize: 30,
                fontWeight: 700,
                alignSelf: "flex-start",
              }}
            >
              <span>
                {post.price.toLocaleString()} {perMonth}
              </span>
              {freeSpots > 0 && (
                <>
                  <span style={{ color: INK_MUTED }}>·</span>
                  <span>
                    {freeSpots} {spotsLabel}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* footer */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            right: 72,
            fontSize: 22,
            fontWeight: 600,
            color: INK_MUTED,
          }}
        >
          {siteLabel}
        </div>
      </div>
    ),
    { ...size }
  );
}
