"use client";

import React from "react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// mockup data
const bannerData = [
  { id: 1, image: "/assets/image/banner1.png" },
  { id: 2, image: "/assets/image/banner2.jpg" },
  { id: 3, image: "/assets/image/banner3.jpg" },
  { id: 4, image: "/assets/image/banner4.jpg" },
];

const HomeBanner = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full -mt-4"
      onMouseEnter={() => {
        plugin.current.stop();
      }}
      onMouseLeave={() => {
        plugin.current.play();
      }}
      opts={{ loop: true }}
    >
      <CarouselContent>
        {bannerData.map((banner) => (
          <CarouselItem key={banner.id}>
            <div className="h-80 relative">
              <Image
                src={banner.image}
                alt={`Banner ${banner.id}`}
                fill
                className="object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-8 bg-black/50 text-white border-none hover:bg-black/70 cursor-pointer" />
      <CarouselNext className="absolute right-8 bg-black/50 text-white border-none hover:bg-black/70 cursor-pointer" />
    </Carousel>
  );
};

export default HomeBanner;
