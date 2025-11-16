import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [avatarName, setAvatarName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleComplete = async () => {
    setIsCreating(true);
    try {
      const user = await base44.auth.me();
      
      await base44.auth.updateMe({
        avatar_name: avatarName,
        onboarding_completed: true
      });

      await base44.entities.UserProgress.create({
        user_id: user.id,
        avatar_name: avatarName,
        total_levels_completed: 0,
        total_goals_completed: 0,
        streak_count: 0,
        xp_points: 0,
        last_active_date: new Date().toISOString().split('T')[0]
      });

      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-2xl"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-8xl mb-8"
              >
                🎯
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
                LIFE XP
              </h1>
              <p className="text-xl md:text-2xl text-cyan-300 mb-8 font-light">
                Level Up Your Life, One Goal at a Time
              </p>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
                <p className="text-white/90 text-lg leading-relaxed">
                  Transform your goals into an epic adventure.<br />
                  Break them into levels, complete them one by one,<br />
                  and watch yourself <span className="text-cyan-400 font-semibold">level up in real life</span>.
                </p>
              </div>
              <Button
                onClick={() => setStep(1)}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-full"
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="name"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="w-full max-w-md"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                <div className="text-center mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="text-6xl mb-4"
                  >
                    ✨
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">What's your name?</h2>
                  <p className="text-white/70">This is how we'll cheer you on!</p>
                </div>
                <Input
                  value={avatarName}
                  onChange={(e) => setAvatarName(e.target.value)}
                  placeholder="Enter your name..."
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50 text-lg py-6 mb-6 rounded-xl"
                  autoFocus
                  onKeyPress={(e) => e.key === "Enter" && avatarName && handleComplete()}
                />
                <Button
                  onClick={handleComplete}
                  disabled={!avatarName || isCreating}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-6 rounded-xl text-lg"
                >
                  {isCreating ? "Creating Your Journey..." : "Let's Go!"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}