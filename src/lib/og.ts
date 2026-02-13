import ogs from "open-graph-scraper";

export interface OgData {
  title: string;
  description: string;
  image: string | null;
  favicon: string | null;
  siteName: string | null;
  url: string;
}

export async function fetchOgData(url: string): Promise<OgData> {
  try {
    const { result } = await ogs({ url, timeout: 8000 });

    let image: string | null = null;
    if (result.ogImage && result.ogImage.length > 0) {
      image = result.ogImage[0].url;
    }

    let favicon: string | null = null;
    if (result.favicon) {
      favicon = result.favicon.startsWith("http")
        ? result.favicon
        : new URL(result.favicon, url).href;
    }

    return {
      title: result.ogTitle || result.dcTitle || url,
      description: result.ogDescription || result.dcDescription || "",
      image,
      favicon,
      siteName: result.ogSiteName || null,
      url,
    };
  } catch {
    return {
      title: url,
      description: "",
      image: null,
      favicon: null,
      siteName: null,
      url,
    };
  }
}

export function isVideoUrl(url: string): { isVideo: boolean; embedUrl: string | null } {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeMatch) {
    return { isVideo: true, embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}` };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { isVideo: true, embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  return { isVideo: false, embedUrl: null };
}
