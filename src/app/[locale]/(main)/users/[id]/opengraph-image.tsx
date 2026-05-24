import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { api } from "~/trpc/server";
import { getAverageRating } from "~/utils/helpers";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Rate My Roommate";

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

  // Only render <img> for absolute https URLs we can reasonably fetch; if the
  // upstream image 404s or 5xxs, Satori would otherwise fail the whole card.
  // Pre-check with a HEAD request and fall back to initials on any failure.
  let avatarUrl: string | null = null;
  if (user?.image && /^https:\/\//i.test(user.image)) {
    try {
      const res = await fetch(user.image, { method: "HEAD", cache: "no-store" });
      if (res.ok) avatarUrl = user.image;
    } catch {
      avatarUrl = null;
    }
  }
  const fallbackInitial = (name.charAt(0) || "?").toUpperCase();
  const headline = user ? name || t("title") : t("title");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          background: "#F6F3EE",
          color: "#1F1B16",
          fontFamily: "sans-serif",
        }}
      >
        {/* brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: "#58CC02",
            }}
          />
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>rmrm</div>
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: 48,
          }}
        >
          {/* avatar */}
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: 999,
              background: "#58CC02",
              color: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 96,
              fontWeight: 800,
              overflow: "hidden",
            }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" width={220} height={220} style={{ objectFit: "cover" }} />
            ) : (
              fallbackInitial
            )}
          </div>

          {/* name + meta */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 2,
                color: "#58CC02",
                marginBottom: 12,
              }}
            >
              {overline}
            </div>
            <div
              style={{
                fontSize: 84,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: -2,
                marginBottom: 16,
              }}
            >
              {headline}
            </div>
            {reviewCount > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 28,
                  color: "#1F1B16",
                }}
              >
                <span style={{ color: "#E8A93C", fontWeight: 800 }}>★ {rating.toFixed(1)}</span>
                <span style={{ color: "#6B6660" }}>({reviewCount})</span>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
