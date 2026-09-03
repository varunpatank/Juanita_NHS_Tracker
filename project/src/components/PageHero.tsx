import { motion } from 'framer-motion';

interface PageHeroProps {
  title: string;
  subtitle: string;
  className?: string;
  showTitleIcon?: boolean;
  contentClassName?: string;
}

const ease = [0.22, 1, 0.36, 1] as const;

/** The chapter crest: a gold gradient masked to the raven, with the artwork
 *  blended back over it so the eye and outlines survive. Same treatment as the
 *  home page, sized down for page banners. */
function Crest({ className = '' }: { className?: string }) {
  return (
    <span
      className={`relative block shrink-0 ${className}`}
      role="img"
      aria-label="Juanita High School raven crest"
    >
      <span
        className="absolute inset-0 block"
        style={{
          WebkitMaskImage: 'url(/Raven_Head_-_Blue_Outline.png)',
          maskImage: 'url(/Raven_Head_-_Blue_Outline.png)',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          background: 'linear-gradient(160deg, #f7e6a6 0%, #e6ae22 44%, #93640a 100%)',
        }}
      />
      <img
        src="/Raven_Head_-_Blue_Outline.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-contain"
        style={{
          filter: 'grayscale(1) contrast(1.35)',
          mixBlendMode: 'multiply',
          opacity: 0.85,
        }}
      />
    </span>
  );
}

export function PageHero({
  title,
  subtitle,
  className = '',
  showTitleIcon = true,
  contentClassName = '',
}: PageHeroProps) {
  return (
    <section
      className={`relative w-full overflow-hidden bg-navy-950 ${className}`}
    >
      {/* Gold hairline closing the banner */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-400/55 to-transparent"
        aria-hidden="true"
      />

      <div
        className={`relative mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16 ${contentClassName}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          className="flex flex-col items-center text-center"
        >
          {showTitleIcon && (
            <div className="flex w-full items-center gap-5 sm:gap-8">
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease }}
                style={{ transformOrigin: 'right' }}
                className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-400/45"
              />
              <Crest className="h-16 w-16 sm:h-20 sm:w-20" />
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease }}
                style={{ transformOrigin: 'left' }}
                className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-400/45"
              />
            </div>
          )}

          <h1
            className={`font-display text-[2rem] font-semibold leading-[1.02] tracking-[-0.02em] text-white sm:text-5xl ${
              showTitleIcon ? 'mt-6' : ''
            }`}
          >
            {title}
          </h1>

          <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-navy-100/70 sm:text-[15px]">
            {subtitle}
          </p>

          <span className="mt-6 h-px w-14 bg-gold-400/70" aria-hidden="true" />
        </motion.div>
      </div>
    </section>
  );
}
