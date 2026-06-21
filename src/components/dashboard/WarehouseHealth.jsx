import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

function AnimatedScore({ score }) {
  const [displayed, setDisplayed] = useState(0);
  const mv = useMotionValue(0);

  useEffect(() => {
    const unsub = mv.on('change', (v) => setDisplayed(Math.round(v)));
    animate(mv, score, { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] });
    return unsub;
  }, [score, mv]);

  return displayed;
}

export default function WarehouseHealth({ score = 0 }) {
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getScoreColor = (s) => {
    if (s >= 80) return 'var(--success)';
    if (s >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const scoreColor = getScoreColor(score);


  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-sm rounded-2xl border border-[var(--border)] shadow-sm p-6"
    >
      <p className="text-sm font-medium text-[var(--text-secondary)]">
        Warehouse Health
      </p>

      <div className="flex items-center justify-center mt-6 mb-6">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--border)"
              strokeWidth={strokeWidth}
            />
            {/* Progress ring */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - progress }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.4 }}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-2xl font-bold"
              style={{ color: scoreColor }}
            >
              <AnimatedScore score={score} />
            </span>
            <span className="text-xs text-[var(--text-tertiary)] -mt-0.5">%</span>
          </div>
        </div>
      </div>


    </motion.div>
  );
}
