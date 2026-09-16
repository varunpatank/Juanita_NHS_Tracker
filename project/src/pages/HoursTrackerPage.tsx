import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { fetchMembers, type MemberHours } from '../lib/googleSheets';
import { PageHero } from '../components/PageHero';

const ease = [0.22, 1, 0.36, 1] as const;

/** The four classes, in school order. The race is run between these. */
const GRADES = ['Freshman', 'Sophomore', 'Junior', 'Senior'] as const;

/** Hours are logged in halves - show the .5 but never a trailing .0 */
const hrs = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

type GradeStanding = {
  grade: string;
  totalHours: number;
  memberCount: number;
  inductedCount: number;
  averageHours: number;
};

export function HoursTrackerPage() {
  const [members, setMembers] = useState<MemberHours[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      setMembers(await fetchMembers());
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Aggregate by class. Individual rows never leave this function, so no one
  // can read another member's hours off the page.
  const standings: GradeStanding[] = GRADES.map((grade) => {
    const inGrade = members.filter(
      (m) => m.grade.trim().toLowerCase() === grade.toLowerCase()
    );
    const totalHours = inGrade.reduce((sum, m) => sum + m.totalHours, 0);
    return {
      grade,
      totalHours,
      memberCount: inGrade.length,
      inductedCount: inGrade.filter((m) => m.inducted).length,
      averageHours: inGrade.length ? totalHours / inGrade.length : 0,
    };
  });

  const ranked = [...standings].sort((a, b) => b.totalHours - a.totalHours);
  const leadHours = ranked[0]?.totalHours ?? 0;
  const chapterHours = standings.reduce((sum, g) => sum + g.totalHours, 0);
  const chapterMembers = standings.reduce((sum, g) => sum + g.memberCount, 0);
  const chapterInducted = standings.reduce((sum, g) => sum + g.inductedCount, 0);
  const hasData = chapterHours > 0 || chapterMembers > 0;
  const margin = ranked.length > 1 ? ranked[0].totalHours - ranked[1].totalHours : 0;

  const chapterStats = [
    { value: hrs(chapterHours), label: 'Chapter hours' },
    { value: String(chapterMembers), label: 'Members' },
    { value: String(chapterInducted), label: 'Inducted' },
    { value: hrs(margin), label: 'Lead margin' },
  ];

  return (
    <div className="min-h-screen bg-navy-950">
      <PageHero
        title="Class Standings"
        subtitle="Four classes, one race. Every hour a member logs counts toward their class total - individual hours stay private."
      />

      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        {/* Chapter totals */}
        <motion.dl
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="grid grid-cols-2 border-y border-white/[0.14] sm:grid-cols-4"
        >
          {chapterStats.map((stat, i) => (
            <div
              key={stat.label}
              className={`px-3 py-5 ${i % 2 === 1 ? 'border-l border-white/[0.14]' : ''} ${
                i >= 2 ? 'border-t border-white/[0.14] sm:border-t-0' : ''
              } ${i === 2 ? 'sm:border-l sm:border-white/[0.14]' : ''}`}
            >
              <dd className="font-display text-3xl font-semibold leading-none tabular-nums text-gold-200">
                {stat.value}
              </dd>
              <dt className="mt-2 text-[10px] font-semibold uppercase tracking-eyebrow text-navy-200/70">
                {stat.label}
              </dt>
            </div>
          ))}
        </motion.dl>

        {/* The race */}
        <div className="mt-12 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.015em] text-white sm:text-3xl">
            The race
          </h2>
          <button
            onClick={loadMembers}
            disabled={isLoading}
            className="inline-flex items-center gap-2 border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-navy-100 transition-colors hover:border-gold-400 hover:text-gold-300 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {isLoading && !hasData ? (
          <p className="mt-8 text-[15px] text-navy-200/70">Loading standings…</p>
        ) : !hasData ? (
          <p className="mt-8 text-[15px] text-navy-200/70">
            No hours logged yet this year. The first submission starts the race.
          </p>
        ) : (
          <ol className="mt-6">
            {ranked.map((standing, i) => {
              const isLeader = i === 0 && standing.totalHours > 0;
              const width = leadHours > 0 ? (standing.totalHours / leadHours) * 100 : 0;

              return (
                <motion.li
                  key={standing.grade}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08, ease }}
                  className={`border-t py-6 ${
                    isLeader ? 'border-gold-400/50' : 'border-white/[0.14]'
                  } ${i === ranked.length - 1 ? 'border-b border-white/[0.14]' : ''}`}
                >
                  <div className="flex items-baseline gap-4 sm:gap-6">
                    <span
                      className={`font-display text-sm font-semibold tabular-nums ${
                        isLeader ? 'text-gold-300' : 'text-navy-200/60'
                      }`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h3
                          className={`font-display text-xl font-semibold tracking-[-0.01em] sm:text-2xl ${
                            isLeader ? 'text-gold-200' : 'text-white'
                          }`}
                        >
                          {standing.grade}s
                          {isLeader && (
                            <span className="ml-3 align-middle text-[10px] font-semibold uppercase tracking-eyebrow text-gold-300">
                              Leading
                            </span>
                          )}
                        </h3>
                        <p className="font-display text-2xl font-semibold tabular-nums text-white sm:text-3xl">
                          {hrs(standing.totalHours)}
                          <span className="ml-1.5 text-[11px] font-semibold uppercase tracking-eyebrow text-navy-200/60">
                            hrs
                          </span>
                        </p>
                      </div>

                      {/* Race bar, measured against the leading class */}
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ duration: 1, delay: 0.2 + i * 0.08, ease }}
                          className={`h-full rounded-full ${
                            isLeader
                              ? 'bg-gradient-to-r from-gold-300 to-gold-500'
                              : 'bg-navy-300/70'
                          }`}
                        />
                      </div>

                      <p className="mt-2.5 text-[12.5px] text-navy-200/70">
                        {standing.memberCount}{' '}
                        {standing.memberCount === 1 ? 'member' : 'members'}
                        {' · '}
                        {standing.averageHours.toFixed(1)} avg
                        {' · '}
                        {standing.inductedCount} inducted
                        {!isLeader && standing.totalHours > 0 && (
                          <>
                            {' · '}
                            <span className="text-gold-300/80">
                              {hrs(leadHours - standing.totalHours)} behind
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        )}

        <p className="mt-8 text-[12.5px] leading-relaxed text-navy-200/55">
          Standings update as hours are approved. Individual member totals are not
          shown here - check your own progress on{' '}
          <span className="text-gold-300/80">My Hours</span>.
        </p>
      </div>
    </div>
  );
}
