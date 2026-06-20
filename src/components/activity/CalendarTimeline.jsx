import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfDay, addDays, differenceInDays } from 'date-fns';

export default function CalendarTimeline({ activities = [], dateFilter = "all", onNodeClick }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const { columns, hoursAxis } = useMemo(() => {
    // Determine Date Range bounds
    let minT = new Date().getTime();
    let maxT = new Date().getTime();

    // If dateFilter is strictly applied, we want to hardcode the columns to show the span
    if (dateFilter === "today") {
      minT = new Date().getTime();
    } else if (dateFilter === "7days") {
      minT = new Date().getTime() - (6 * 24 * 60 * 60 * 1000);
    } else if (dateFilter === "30days") {
      minT = new Date().getTime() - (29 * 24 * 60 * 60 * 1000);
    } else {
      // For "All Time" or fallback, span exactly the data we have
      if (activities.length > 0) {
        activities.forEach(act => {
          const t = act.rawDate.getTime();
          if (t < minT) minT = t;
          if (t > maxT) maxT = t;
        });
      }
    }

    const startDate = startOfDay(new Date(minT));
    const endDate = startOfDay(new Date(maxT));
    const totalDays = differenceInDays(endDate, startDate) + 1;

    // 2. Generate Columns for each Day
    const cols = [];
    for (let i = 0; i < totalDays; i++) {
      const currentDay = addDays(startDate, i);
      const dayStartT = currentDay.getTime();
      const dayEndT = dayStartT + (24 * 60 * 60 * 1000);

      // Find events strictly matching this day and sort ascending by time
      const dayEvents = activities
        .filter(act => {
          const t = act.rawDate.getTime();
          return t >= dayStartT && t < dayEndT;
        })
        .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

      // Cluster overlapping events (within 15 minutes)
      let currentClusterEndTime = 0;
      let clusterIndex = 0;

      const eventsWithOffset = dayEvents.map(event => {
        const t = event.rawDate.getTime();
        if (t <= currentClusterEndTime) {
          clusterIndex++;
        } else {
          clusterIndex = 0;
          currentClusterEndTime = t + (15 * 60 * 1000); // 15 mins window
        }
        return { ...event, clusterIndex };
      });

      cols.push({
        date: currentDay,
        events: eventsWithOffset
      });
    }

    // 3. Generate Hour Axis (0 to 23)
    const hours = Array.from({ length: 24 }).map((_, i) => ({
      hour: i,
      label: format(new Date().setHours(i, 0, 0, 0), "ha"),
      position: (i / 24) * 100
    }));

    return { columns: cols, hoursAxis: hours };
  }, [activities, dateFilter]);

  if (!activities.length && dateFilter === "all") {
    return (
      <div className="flex items-center justify-center h-full text-[var(--text-tertiary)]">
        No activities found.
      </div>
    );
  }

  // To prevent extremely squished nodes if there are hundreds of days, we enforce a min width
  const COLUMN_MIN_WIDTH = 200; 

  return (
    <div className="bg-[var(--bg-card)] backdrop-blur-md rounded-2xl border border-[var(--border)] shadow-sm flex flex-col h-full overflow-hidden">
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-auto relative flex flex-col">
        <div className="min-w-max w-full flex flex-col flex-1 h-full min-h-[800px]">
          
          {/* Sticky Header (Dates) */}
          <div className="flex border-b border-[var(--border)] bg-[rgba(255,255,255,0.03)] backdrop-blur-sm sticky top-0 z-40">
            {/* Corner Cell (Time Axis Label space) */}
            <div className="w-20 shrink-0 border-r border-[var(--border)] bg-[rgba(255,255,255,0.05)] backdrop-blur-sm sticky left-0 z-50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]" />
            
            {/* Date Columns Header */}
            {columns.map((col, idx) => (
              <div 
                key={idx} 
                className="flex-1 border-r border-[var(--border)] p-3 text-center min-w-[160px]"
                style={{ minWidth: `${COLUMN_MIN_WIDTH}px` }}
              >
                <div className="text-sm font-medium text-[var(--text-primary)]">
                  {format(col.date, 'EEEE')}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {format(col.date, 'MMM d, yyyy')}
                </div>
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="flex flex-1 py-8">
            <div className="flex flex-1 relative h-full w-full">
              
              {/* Sticky Y-Axis (Hours) */}
              <div className="w-20 shrink-0 border-r border-[var(--border)] bg-[rgba(255,255,255,0.05)] backdrop-blur-sm sticky left-0 z-30 shadow-[2px_0_5px_rgba(0,0,0,0.02)] relative">
                {hoursAxis.map((h, i) => (
                  <div 
                    key={i} 
                    className="absolute w-full text-right pr-3 -translate-y-1/2 text-[10px] font-medium text-[var(--text-tertiary)]"
                    style={{ top: `${h.position}%` }}
                  >
                    {h.label}
                  </div>
                ))}
              </div>

              {/* Grid Columns Area */}
              <div className="flex flex-1 relative bg-white/10">
              
              {/* Global Horizontal Grid Lines (Hours) */}
              {hoursAxis.map((h, i) => (
                <div 
                  key={`h-grid-${i}`} 
                  className="absolute left-0 right-0 border-t border-[var(--border)]/40 pointer-events-none"
                  style={{ top: `${h.position}%` }}
                />
              ))}

              {/* Day Columns containing Nodes */}
              {columns.map((col, idx) => (
                <div 
                  key={idx} 
                  className="flex-1 border-r border-[var(--border)] relative min-w-[160px]"
                  style={{ minWidth: `${COLUMN_MIN_WIDTH}px` }}
                >
                  {col.events.map(act => {
                    const hours = act.rawDate.getHours();
                    const minutes = act.rawDate.getMinutes();
                    const pos = ((hours + (minutes / 60)) / 24) * 100;
                    const isHovered = hoveredNode === act.id;
                    const IconComp = act.icon;
                    
                    // Center the cluster by alternating left and right
                    const sign = act.clusterIndex % 2 === 1 ? 1 : -1;
                    
                    // Dynamically spread wider if there's more horizontal space
                    const baseSpread = columns.length === 1 ? 50 : columns.length <= 7 ? 20 : 10;
                    const magnitude = Math.ceil(act.clusterIndex / 2) * baseSpread;
                    const offsetPx = act.clusterIndex === 0 ? 0 : (sign * magnitude);
                    
                    return (
                      <div 
                        key={act.id}
                        className="absolute -translate-y-1/2 -translate-x-1/2 flex justify-center transition-all"
                        style={{ 
                          top: `${pos}%`, 
                          left: `calc(50% + ${offsetPx}px)`,
                          zIndex: isHovered ? 50 : (10 + act.clusterIndex) 
                        }}
                        onMouseEnter={() => setHoveredNode(act.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                      >
                        {/* The Node */}
                        <motion.button
                          onClick={() => onNodeClick && onNodeClick(act)}
                          whileHover={{ scale: 1.15, zIndex: 60 }}
                          className={`w-8 h-8 rounded-full shadow-md border-2 border-white flex items-center justify-center cursor-pointer ${act.bgClass.replace('subtle', 'solid')} bg-[var(--bg-card)]`}
                        >
                          <IconComp size={14} className={act.iconColor} strokeWidth={2.5} />
                        </motion.button>

                        {/* Tooltip */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0, y: 5, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 5, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-[var(--text-primary)] text-[var(--bg-card)] rounded-xl p-3 shadow-xl pointer-events-none z-50"
                            >
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[var(--text-primary)]" />
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                                <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: act.iconColor.match(/text-\[([^\]]+)\]/)?.[1] || 'white' }} />
                                <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">{act.title}</span>
                              </div>
                              <div className="text-xs font-medium mb-1 text-white">{act.productName}</div>
                              <div className="text-[11px] text-[var(--text-tertiary)] leading-tight line-clamp-2 mb-2">
                                {act.description}
                              </div>
                              <div className="text-[10px] text-[var(--text-tertiary)]/70">
                                {format(act.rawDate, "h:mm a")}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
