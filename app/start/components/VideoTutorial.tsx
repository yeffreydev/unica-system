"use client";

import { useState } from "react";
import { Clock, ExternalLink, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { TutorialVideo } from "../videos";

interface Props {
  video: TutorialVideo;
  /** Fila compacta con miniatura pequeña, para incrustar dentro de una tarjeta. */
  compact?: boolean;
  /** Etiqueta sobre el título. */
  eyebrow?: string;
  className?: string;
}

/**
 * Reproductor liviano: primero muestra la miniatura y recién carga el iframe
 * de YouTube al hacer click, para no arrastrar el player en cada paso.
 */
export function VideoTutorial({ video, compact, eyebrow = "Video tutorial", className }: Props) {
  const [playing, setPlaying] = useState(false);

  const thumb = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
  const watchUrl = `https://www.youtube.com/watch?v=${video.id}`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`;

  const frame = (
    <div className="relative w-full overflow-hidden rounded-lg bg-black aspect-video">
      {playing ? (
        <iframe
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Reproducir: ${video.title}`}
          className="group absolute inset-0 h-full w-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-black shadow-lg transition-transform duration-200 group-hover:scale-110">
              <Play className="h-6 w-6 translate-x-[1px] fill-current" />
            </span>
          </span>
        </button>
      )}
    </div>
  );

  if (compact) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-card/60 p-3 flex flex-col sm:flex-row gap-3",
          className
        )}
      >
        <div className="sm:w-56 shrink-0">{frame}</div>
        <div className="min-w-0 flex-1 flex flex-col justify-center gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            {eyebrow}
          </p>
          <p className="text-sm font-semibold leading-snug">{video.title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{video.description}</p>
          <Meta video={video} watchUrl={watchUrl} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border bg-card/60 p-4", className)}>
      <div className="mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
        <p className="text-base font-semibold leading-snug mt-0.5">{video.title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1">{video.description}</p>
      </div>
      {frame}
      <Meta video={video} watchUrl={watchUrl} className="mt-2.5" />
    </div>
  );
}

function Meta({
  video,
  watchUrl,
  className,
}: {
  video: TutorialVideo;
  watchUrl: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 text-[11px] text-muted-foreground", className)}>
      {video.length && (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {video.length}
        </span>
      )}
      <a
        href={watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        Ver en YouTube
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
