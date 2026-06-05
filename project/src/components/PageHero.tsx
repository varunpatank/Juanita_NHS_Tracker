import { motion } from 'framer-motion';

interface PageHeroProps {
  title: string;
  subtitle: string;
  className?: string;
  showTitleIcon?: boolean;
  contentClassName?: string;
}

const heroBackground = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 520'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0%25' stop-color='%230b1220'/%3E%3Cstop offset='50%25' stop-color='%23131b2c'/%3E%3Cstop offset='100%25' stop-color='%231a2235'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1600' height='520' fill='url(%23bg)'/%3E%3Crect x='80' y='0' width='160' height='520' fill='%230e7490' fill-opacity='0.16'/%3E%3Crect x='1240' y='0' width='280' height='520' fill='%23ffffff' fill-opacity='0.04'/%3E%3Cpath d='M0 410h1600' stroke='%23ffffff' stroke-opacity='0.12' stroke-width='2'/%3E%3Cg stroke='%23ffffff' stroke-opacity='0.10' stroke-width='6' fill='none'%3E%3Cpath d='M280 0v180'/%3E%3Cpath d='M520 0v210'/%3E%3Cpath d='M760 0v150'/%3E%3Cpath d='M1080 0v195'/%3E%3Cpath d='M1360 0v165'/%3E%3C/g%3E%3Cg stroke='%23ffffff' stroke-opacity='0.08' stroke-width='4' fill='none'%3E%3Cpath d='M70 40l48 42 46-74 40 34'/%3E%3Cpath d='M1480 60h50v-36'/%3E%3C/g%3E%3Crect x='540' y='86' width='520' height='20' rx='10' fill='%23000000' fill-opacity='0.18'/%3E%3Crect x='610' y='120' width='360' height='18' rx='9' fill='%23ffffff' fill-opacity='0.04'/%3E%3C/svg%3E")`;

export function PageHero({ title, subtitle, className = '', showTitleIcon = true, contentClassName = '' }: PageHeroProps) {
  return (
    <section
      className={`relative w-full overflow-hidden border-b border-white/10 ${className}`}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(4, 8, 18, 0.52), rgba(4, 8, 18, 0.84)), linear-gradient(90deg, rgba(12, 26, 56, 0.38), rgba(127, 29, 29, 0.28)), ${heroBackground}`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/35 via-slate-950/25 to-red-950/30" />
      <div className="absolute inset-0 bg-black/20" />
      <div className={`relative w-full px-5 py-14 sm:px-8 sm:py-16 lg:px-12 lg:py-20 ${contentClassName}`}>
        <div className="mx-auto max-w-5xl text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
            {showTitleIcon && (
              <motion.div
                className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/10 shadow-2xl backdrop-blur-sm sm:h-[90px] sm:w-[90px]"
                animate={{ rotate: [0, 5, -5, 2, -2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/5/52/Juanita_High_School_Crest.png"
                  alt="Juanita High School"
                  className="h-[48px] w-[48px] object-contain sm:h-[60px] sm:w-[60px] drop-shadow-lg"
                />
              </motion.div>
            )}
            <h1 className={`text-4xl font-black leading-tight tracking-tight text-transparent sm:text-6xl lg:text-7xl bg-gradient-to-r from-blue-200 via-white to-red-300 bg-clip-text pb-1 ${showTitleIcon ? 'text-center sm:text-left' : 'text-center'}`}>
              {title}
            </h1>
          </div>

          <div className="mx-auto mt-5 max-w-2xl rounded-3xl border border-white/12 bg-black/40 px-4 py-3 shadow-2xl backdrop-blur-md sm:mt-7 sm:px-6 sm:py-4">
            <p className="text-sm leading-relaxed text-blue-50 sm:text-lg">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}