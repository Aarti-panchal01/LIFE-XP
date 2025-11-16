import React from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const categoryColors = {
  mind: { from: "from-cyan-500", to: "to-blue-500", icon: "🧠" },
  body: { from: "from-green-500", to: "to-emerald-500", icon: "💪" },
  soul: { from: "from-purple-500", to: "to-pink-500", icon: "✨" },
  wealth: { from: "from-yellow-500", to: "to-orange-500", icon: "💰" },
  relationships: { from: "from-rose-500", to: "to-red-500", icon: "💫" }
};

export default function XPBar({ category, xp, maxXp = 100, showLabel = true }) {
  const colors = categoryColors[category] || categoryColors.mind;
  const percentage = Math.min((xp / maxXp) * 100, 100);

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{colors.icon}</span>
            <span className="text-white font-semibold capitalize">{category}</span>
          </div>
          <span className="text-white/70 text-sm font-mono">
            {xp} / {maxXp} XP
          </span>
        </div>
      )}
      
      <div className="relative h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full bg-gradient-to-r ${colors.from} ${colors.to} relative`}
        >
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
}