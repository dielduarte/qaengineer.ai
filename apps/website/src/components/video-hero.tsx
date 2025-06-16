'use client';

export default function VideoHero() {
  return (
    <div className="relative mx-auto aspect-video max-w-4xl overflow-hidden rounded-xl border bg-muted/20">
      <iframe
        width="100%"
        height="100%"
        src="https://www.youtube.com/embed/0ejKPwVr9Q0?si=iotH4tn0GwXMSdnJ"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
    </div>
  );
}
