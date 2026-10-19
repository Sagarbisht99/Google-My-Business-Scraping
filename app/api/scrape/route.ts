import { chromium } from "playwright";

interface Lead {
  name: string;
  phone: string;
  rating: string;
  reviews: string;
  mapsUrl: string;
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  let query: unknown;
  try {
    ({ query } = await request.json());
  } catch {
    return Response.json({ error: "Send a valid search query." }, { status: 400 });
  }

  if (typeof query !== "string" || !query.trim() || query.length > 300) {
    return Response.json(
      { error: "Enter a search query under 300 characters." },
      { status: 400 },
    );
  }

  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      locale: "en-US",
    });

    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(query.trim())}`;
    await page.goto(mapsUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
    const feed = page.locator('div[role="feed"]');
    await feed.waitFor({ state: "visible", timeout: 20_000 });

    let previousCount = 0;
    let stablePasses = 0;
    for (let pass = 0; pass < 18 && stablePasses < 3; pass += 1) {
      const currentCount = await feed.locator('a[href*="/maps/place/"]').count();
      stablePasses = currentCount === previousCount ? stablePasses + 1 : 0;
      previousCount = currentCount;
      await feed.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
      });
      await page.waitForTimeout(850);
    }

    const leads = await feed.evaluate((feedElement): Lead[] => {
      const placeLinks = Array.from(
        feedElement.querySelectorAll<HTMLAnchorElement>('a[href*="/maps/place/"]'),
      );
      const cards = new Set<Element>();

      for (const link of placeLinks) {
        const card =
          link.closest('[role="article"], .Nv2PK') ??
          link.parentElement?.parentElement?.parentElement ??
          link;
        cards.add(card);
      }

      return Array.from(cards)
        .filter(
          (card) =>
            !card.querySelector(
              '[aria-label*="website" i], [data-value*="website" i]',
            ),
        )
        .map((card) => {
          const placeLink = card.querySelector<HTMLAnchorElement>(
            'a[href*="/maps/place/"]',
          );
          const labels = Array.from(card.querySelectorAll("[aria-label]"))
            .map((element) => element.getAttribute("aria-label") ?? "")
            .filter(Boolean);
          const text = `${card.textContent ?? ""} ${labels.join(" ")}`;
          const name =
            placeLink?.getAttribute("aria-label")?.trim() ||
            card.querySelector('[role="heading"]')?.textContent?.trim() ||
            "";
          const phoneLabel = labels.find((label) => /phone|call/i.test(label));
          const phoneMatch = (phoneLabel ?? text).match(
            /(?:\+?\d[\d\s().-]{7,}\d)/,
          );
          const ratingMatch = text.match(
            /\b([0-5](?:\.\d)?)\s*(?:stars?|\/\s*5|out of 5)\b/i,
          );
          const reviewsMatch = text.match(/([\d,.]+)\s*reviews?/i);

          return {
            name,
            phone: phoneMatch?.[0]?.replace(/\s+/g, " ").trim() ?? "",
            rating: ratingMatch?.[1] ?? "",
            reviews: reviewsMatch?.[1]?.replace(/,/g, "") ?? "",
            mapsUrl: placeLink?.href ?? "",
          };
        })
        .filter((lead) => lead.name && lead.mapsUrl);
    });

    const uniqueLeads = Array.from(
      new Map(leads.map((lead) => [`${lead.name}|${lead.mapsUrl}`, lead])).values(),
    );

    return Response.json({ leads: uniqueLeads });
  } catch {
    return Response.json(
      {
        error:
          "Google Maps did not return results. Automated access may be blocked, or the Maps page structure may have changed.",
      },
      { status: 502 },
    );
  } finally {
    await browser?.close();
  }
}