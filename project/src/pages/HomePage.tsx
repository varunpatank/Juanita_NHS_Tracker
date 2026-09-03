import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useDarkMode } from '../lib/darkModeContext';

const pillars = [
  {
    title: 'Scholarship',
    description:
      'A cumulative GPA of 3.5 or higher, sustained across every term of membership.',
  },
  {
    title: 'Service',
    description:
      'Hours given to the school and the wider Kirkland community, logged and verified.',
  },
  {
    title: 'Leadership',
    description:
      'Initiative that outlasts the person who started it - projects, teams, and mentorship.',
  },
  {
    title: 'Character',
    description:
      'Integrity when it is inconvenient. The pillar no transcript can measure.',
  },
];

const stats = [
  { number: '150+', label: 'Active members' },
  { number: '2,500+', label: 'Hours served' },
  { number: '25+', label: 'Chapter projects' },
  { number: '95%', label: 'College bound' },
];

// One reveal, staggered down the page - children inherit the timing.
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const spread = {
  hidden: { opacity: 0, scaleX: 0 },
  show: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function HomePage() {
  const { darkMode } = useDarkMode();

  const page = darkMode ? 'bg-navy-950' : 'bg-[#fbfaf7]';
  const heading = darkMode ? 'text-white' : 'text-navy-900';
  const body = darkMode ? 'text-navy-200/80' : 'text-navy-800/75';
  const rule = darkMode ? 'border-white/10' : 'border-navy-900/12';

  return (
    <div className={`min-h-screen ${page}`}>
      {/* ---------------------------------------------------------------
          Hero - asymmetric, always navy, anchored by the chapter record
          --------------------------------------------------------------- */}
      <section className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-start overflow-hidden bg-navy-950 px-5 pb-12 pt-6 sm:px-8 lg:px-10 lg:pt-8">
        {/* Faint gold horizon, no glow orbs */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent"
          aria-hidden="true"
        />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative mx-auto flex w-full max-w-5xl flex-col items-center text-center"
        >
          {/* Crest, flanked by rules - the anchor everything else sits around.
              Two layers: a gold gradient masked to the raven's silhouette, then
              the artwork blended over it so the eye and outlines survive. */}
          <div className="flex w-full items-center gap-6 sm:gap-10">
            <motion.span
              variants={spread}
              style={{ transformOrigin: 'right' }}
              className="h-px flex-1 bg-gradient-to-r from-transparent to-gold-400/50"
            />
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.86, y: 8 },
                show: {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
                },
              }}
              whileHover={{ scale: 1.04, rotate: -1.5 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="relative h-24 w-24 shrink-0 cursor-default sm:h-32 sm:w-32 lg:h-40 lg:w-40"
              role="img"
              aria-label="Juanita High School raven crest"
            >
              <div
                className="absolute inset-0"
                style={{
                  WebkitMaskImage: 'url(/Raven_Head_-_Blue_Outline.png)',
                  maskImage: 'url(/Raven_Head_-_Blue_Outline.png)',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  background:
                    'linear-gradient(160deg, #f7e6a6 0%, #e6ae22 44%, #93640a 100%)',
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
            </motion.div>
            <motion.span
              variants={spread}
              style={{ transformOrigin: 'left' }}
              className="h-px flex-1 bg-gradient-to-l from-transparent to-gold-400/50"
            />
          </div>

          {/* Title */}
          <motion.p variants={rise} className="mt-6 text-[11px] font-semibold uppercase tracking-eyebrow text-gold-300">
            Juanita High School &middot; Kirkland, Washington
          </motion.p>
          <motion.h1 variants={rise} className="mt-3 font-display text-[2.2rem] font-semibold leading-[0.98] tracking-[-0.02em] text-white sm:text-[3.4rem] lg:text-[3.9rem]">
            National Honor
            <br />
            <span className="text-gold-300">Society</span>
          </motion.h1>

          <motion.p variants={rise} className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-navy-100/70">
            Four pillars, one standard. Log verified service hours, track your
            progress toward induction, and find the work that needs doing
            around Kirkland.
          </motion.p>

          {/* Actions */}
          <motion.div variants={rise} className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/submit-hours"
              className="group inline-flex items-center gap-2 bg-gold-400 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-navy-950 transition-colors hover:bg-gold-300"
            >
              Submit hours
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/hours-tracker"
              className="inline-flex items-center gap-2 border border-white/25 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:border-gold-400 hover:text-gold-300"
            >
              Leaderboard
            </Link>
          </motion.div>

          {/* The record - one ruled row so it clears the fold */}
          <motion.dl variants={rise} className="mt-8 grid w-full grid-cols-2 border-t border-white/[0.14] sm:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`px-3 py-4 sm:py-5 ${
                  i % 2 === 1 ? 'border-l border-white/[0.14]' : ''
                } ${i >= 2 ? 'border-t border-white/[0.14] sm:border-t-0' : ''} ${
                  i === 2 ? 'sm:border-l sm:border-white/[0.14]' : ''
                }`}
              >
                <dd className="font-display text-3xl font-semibold leading-none tabular-nums text-gold-200 sm:text-[2.1rem]">
                  {stat.number}
                </dd>
                <dt className="mt-2 text-[10px] font-semibold uppercase tracking-eyebrow text-navy-200/70">
                  {stat.label}
                </dt>
              </div>
            ))}
          </motion.dl>

          {/* Pillars close the frame */}
          <motion.div variants={rise} className="grid w-full grid-cols-2 gap-y-3 border-t border-white/[0.14] pt-4 sm:grid-cols-4">
            {pillars.map((pillar) => (
              <span
                key={pillar.title}
                className="text-[10px] font-semibold uppercase tracking-eyebrow text-navy-200/55"
              >
                {pillar.title}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ---------------------------------------------------------------
          Four pillars - numbered editorial list
          --------------------------------------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className={`text-[11px] font-semibold uppercase tracking-eyebrow ${
              darkMode ? 'text-gold-400' : 'text-gold-600'
            }`}>
              What membership asks
            </p>
            <h2
              className={`mt-4 font-display text-3xl font-semibold leading-tight tracking-[-0.015em] sm:text-[2.5rem] ${heading}`}
            >
              The four pillars
            </h2>
            <p className={`mt-5 max-w-sm text-[15px] leading-relaxed ${body}`}>
              Every chapter in the country is held to the same four. Meeting one
              is not membership; meeting all four is.
            </p>
          </div>

          <ol className="lg:col-span-8">
            {pillars.map((pillar, i) => (
              <motion.li
                key={pillar.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
                className={`group grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t py-7 transition-colors duration-300 sm:gap-x-10 ${rule} ${
                  darkMode ? 'hover:border-gold-400/60' : 'hover:border-gold-500/60'
                } ${i === pillars.length - 1 ? 'border-b' : ''}`}
              >
                <span
                  className={`pt-1 font-display text-sm font-semibold tabular-nums transition-colors ${
                    darkMode
                      ? 'text-gold-400/70 group-hover:text-gold-300'
                      : 'text-gold-600/80 group-hover:text-gold-600'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3
                    className={`font-display text-xl font-semibold tracking-[-0.01em] ${heading}`}
                  >
                    {pillar.title}
                  </h3>
                  <p className={`mt-2 max-w-lg text-[15px] leading-relaxed ${body}`}>
                    {pillar.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------------------------------------------
          Closing band
          --------------------------------------------------------------- */}
      <section className="border-t border-gold-400/30 bg-navy-900">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-10 lg:py-20">
          <div>
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-[-0.015em] text-white sm:text-4xl">
              Hours don&rsquo;t log themselves.
            </h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-navy-100/70">
              Submit what you&rsquo;ve served, or find something on the board
              that still needs hands.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0">
            <Link
              to="/submit-hours"
              className="group inline-flex items-center gap-2 bg-gold-400 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-navy-950 transition-colors hover:bg-gold-300"
            >
              Log hours
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/volunteering"
              className="inline-flex items-center border border-white/25 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:border-gold-400 hover:text-gold-300"
            >
              Opportunities
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
