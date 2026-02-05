'use client'
import { useState } from 'react'
import Image from 'next/image'

export default function ImageCarousel({ images, title }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Se non ci sono immagini, mostra un placeholder o niente
  if (!images || images.length === 0) {
    return <div className="h-96 w-full bg-gray-200 flex items-center justify-center">Nessuna immagine disponibile</div>
  }

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const nextSlide = () => {
    const isLastSlide = currentIndex === images.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  return (
    <div className="relative h-96 w-full group overflow-hidden">
      <div className="w-full h-full relative">
       <Image
          src={images[currentIndex]}
          alt={`${title} - image ${currentIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-500"
          priority
        />
      </div>
      
      {/* Left Arrow */}
      {images.length > 1 && (
        <button 
            type="button"
            className="absolute top-[50%] -translate-y-1/2 left-5 rounded-full p-2 bg-black/30 text-white cursor-pointer hover:bg-black/50 transition backdrop-blur-sm z-10" 
            onClick={prevSlide}
            aria-label="Previous slide"
        >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}

      {/* Right Arrow */}
      {images.length > 1 && (
        <button 
            type="button"
            className="absolute top-[50%] -translate-y-1/2 right-5 rounded-full p-2 bg-black/30 text-white cursor-pointer hover:bg-black/50 transition backdrop-blur-sm z-10" 
            onClick={nextSlide}
            aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 right-0 left-0 z-10">
            <div className="flex items-center justify-center gap-2">
                {images.map((_, slideIndex) => (
                    <button
                        key={slideIndex}
                        onClick={() => setCurrentIndex(slideIndex)}
                        className={`
                            transition-all w-2.5 h-2.5 bg-white rounded-full cursor-pointer shadow-sm
                            ${currentIndex === slideIndex ? "scale-125 opacity-100 ring-2 ring-black/20" : "opacity-60 hover:opacity-90"}
                        `}
                        aria-label={`Go to slide ${slideIndex + 1}`}
                    ></button>
                ))}
            </div>
        </div>
      )}
    </div>
  )
}
