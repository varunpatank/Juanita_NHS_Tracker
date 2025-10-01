import React from 'react';
import { motion } from 'framer-motion';

export function FloatingLogos() {
  const logos = [
    {
      src: 'https://resources.finalsite.net/images/f_auto,q_auto/v1605026389/lwsdorg/azffuqvgwggxboecskaw/nhs_logo_smaller.jpg',
      alt: 'NHS Logo',
      size: 'w-32 h-32',
      delay: 0,
      rounded: true
    },
    {
      src: 'https://upload.wikimedia.org/wikipedia/en/5/52/Juanita_High_School_Crest.png',
      alt: 'Juanita High School',
      size: 'w-32 h-32',
      delay: 3,
      rounded: false
    }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {logos.map((logo, index) => (
        <motion.div
          key={index}
          className={`absolute ${logo.size} opacity-30`}
          initial={{ 
            x: Math.random() * (window.innerWidth - 200) + 100,
            y: Math.random() * (window.innerHeight - 200) + 100,
            rotate: 0
          }}
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 30 + Math.random() * 20,
            repeat: Infinity,
            ease: "linear",
            delay: logo.delay
          }}
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`
          }}
        >
          <img 
            src={logo.src} 
            alt={logo.alt}
            className={`w-full h-full object-contain filter drop-shadow-lg ${logo.rounded ? 'rounded-2xl' : ''}`}
          />
        </motion.div>
      ))}
    </div>
  );
}