'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VideoHero() {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayVideo = () => {
    setIsPlaying(true);
  };

  return (
    <div className="relative mx-auto aspect-video max-w-4xl overflow-hidden rounded-xl border bg-muted/20">
      {!isPlaying ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-background/80 to-background/40">
          <Button
            size="lg"
            className="rounded-full h-16 w-16 flex items-center justify-center"
            onClick={handlePlayVideo}
          >
            <Play className="h-6 w-6" />
          </Button>
          <p className="mt-4 text-lg font-medium">Watch the demo</p>
        </div>
      ) : null}

      {isPlaying ? (
        <video
          className="h-full w-full"
          controls
          autoPlay
          src="/demo-video.mp4"
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
          {/* <Image
            src="/placeholder.svg?height=720&width=1280"
            alt="Video thumbnail"
            className="h-full w-full object-cover"
          /> */}
        </div>
      )}
    </div>
  );
}
