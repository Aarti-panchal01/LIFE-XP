import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Trophy, Target, Flame, TrendingUp } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

const categoryColors = {
  health: { gradient: "from-green-500 to-emerald-600", emoji: "💪" },
  career: { gradient: "from-blue-500 to-indigo-600", emoji: "💼" },
  learning: { gradient: "from-purple-500 to-pink-600", emoji: "📚" },
  relationships: { gradient: "from-rose-500 to-red-600", emoji: "❤️" },
  finance: { gradient: "from-yellow-500 to-orange-600", emoji: "💰" },
  personal: { gradient: "from-cyan-500 to-blue-600", emoji: "🌟" },
  creative: { gradient: "from-pink-500 to-purple-600", emoji: "🎨" }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (!currentUser.onboarding_completed) {
          navigate(createPageUrl("Onboarding"));
        }
      } catch (error) {
        console.error("Error checking user:", error);
      }
    };
    
    checkOnboarding();
  }, [navigate]);

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['userProgress', user?.id],
    queryFn: async () => {
      const results = await base44.entities.UserProgress.filter({ user_id: user.id });
      return results[0];
    },
    enabled: !!user,
  });

  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: () => base44.entities.Goal.filter({ user_id: user.id }),
    enabled: !!user,
  });

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  if (progressLoading || !progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          ✨
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl mb-4"
          >
            👋
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Welcome back, {progress.avatar_name}!
          </h1>
          <p className="text-cyan-300 text-lg">Ready to level up today?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <span className="text-white/70 text-sm">Active Goals</span>
            </div>
            <p className="text-3xl font-bold text-white">{activeGoals.length}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white/70 text-sm">Levels Done</span>
            </div>
            <p className="text-3xl font-bold text-white">{progress.total_levels_completed}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-white/70 text-sm">Total XP</span>
            </div>
            <p className="text-3xl font-bold text-white">{progress.xp_points}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-white/70 text-sm">Streak</span>
            </div>
            <p className="text-3xl font-bold text-white">{progress.streak_count} days</p>
          </motion.div>
        </div>

        {/* Active Goals Section */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-cyan-400" />
              Your Active Goals
            </h2>
            <Button
              onClick={() => navigate(createPageUrl("Goals"))}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </div>

          {activeGoals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-white/60 text-lg mb-4">No active goals yet!</p>
              <p className="text-white/40 mb-6">Start your journey by creating your first goal</p>
              <Button
                onClick={() => navigate(createPageUrl("Goals"))}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
              >
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {activeGoals.map((goal) => {
                const categoryData = categoryColors[goal.category];
                const progressPercent = (goal.current_level / goal.target_levels) * 100;
                
                return (
                  <motion.div
                    key={goal.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate(createPageUrl("GoalDetail") + `?id=${goal.id}`)}
                    className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-cyan-400/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`text-3xl`}>{categoryData.emoji}</div>
                        <div>
                          <h3 className="text-white font-bold text-lg">{goal.title}</h3>
                          <p className="text-white/60 text-sm capitalize">{goal.category}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-white/70">
                        <span>Level {goal.current_level} / {goal.target_levels}</span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          className={`h-full bg-gradient-to-r ${categoryData.gradient}`}
                        />
                      </div>
                    </div>

                    {goal.current_level > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-cyan-400">
                        <TrendingUp className="w-3 h-3" />
                        <span>{goal.current_level} levels completed!</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Completed Goals ({completedGoals.length})
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              {completedGoals.map((goal) => {
                const categoryData = categoryColors[goal.category];
                return (
                  <div
                    key={goal.id}
                    className="bg-white/10 rounded-xl p-4 border border-white/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{categoryData.emoji}</span>
                      <h4 className="text-white font-semibold">{goal.title}</h4>
                    </div>
                    <p className="text-green-400 text-sm">✓ {goal.target_levels} levels completed</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}