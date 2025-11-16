import React from "react";
import { motion } from "framer-motion";

const avatarStages = {
  1: {
    emoji: "✨",
    name: "Seeker",
    description: "Foundation",
    auraColor: "from-cyan-500/30 to-purple-500/30"
  },
  2: {
    emoji: "🌟",
    name: "Adept",
    description: "Awakening",
    auraColor: "from-cyan-500/50 to-purple-500/50"
  },
  3: {
    emoji: "⚡",
    name: "Master",
    description: "Ascension",
    auraColor: "from-cyan-500/70 to-purple-500/70"
  },
  4: {
    emoji: "🔥",
    name: "Legend",
    description: "Transcendence",
    auraColor: "from-orange-500/70 to-red-500/70"
  },
  5: {
    emoji: "🌌",
    name: "Cosmic",
    description: "Infinity",
    auraColor: "from-purple-500 to-pink-500"
  }
};

export default function AvatarDisplay({ stage = 1, size = "large", showInfo = true }) {
  const stageData = avatarStages[stage] || avatarStages[1];
  
  const sizeClasses = {
    small: "w-16 h-16 text-3xl",
    medium: "w-24 h-24 text-5xl",
    large: "w-32 h-32 text-6xl"
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        {/* Outer glow ring */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${stageData.auraColor} blur-xl`}
        />
        
        {/* Avatar circle */}
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${stageData.auraColor} backdrop-blur-xl border-2 border-white/30 flex items-center justify-center relative z-10 shadow-2xl`}>
          <span className="drop-shadow-lg">{stageData.emoji}</span>
        </div>

        {/* Orbiting particles */}
        {size === "large" && [...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: "50%",
              top: "50%",
              marginLeft: "-4px",
              marginTop: "-4px"
            }}
          >
            <div
              style={{
                transform: `translateX(${60 + i * 10}px)`
              }}
              className="w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
            />
          </motion.div>
        ))}
      </motion.div>

      {showInfo && (
        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold text-white">{stageData.name}</h3>
          <p className="text-sm text-cyan-300">{stageData.description}</p>
        </div>
      )}
    </div>
  );
}