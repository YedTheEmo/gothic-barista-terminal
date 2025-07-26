'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="text-center fade-in">
        <h1 className="gothic-title text-6xl md:text-8xl font-bold mb-8 text-white drop-shadow-2xl">
          ☕ Café Noir ☕
        </h1>
        <p className="text-xl md:text-2xl mb-12 text-gray-300 font-light">
          A Gothic Barista Experience
        </p>
        <Link 
          href="/game"
          className="inline-block px-8 py-4 bg-transparent border-2 border-white text-white text-xl font-semibold hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105"
        >
          Enter the Café
        </Link>
        <div className="mt-16 text-gray-500 text-sm">
          Prepare two drinks to reveal the surprise...
        </div>
      </div>
    </div>
  );
}
