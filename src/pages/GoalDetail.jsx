import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle, Lock, Plus, Trophy, Zap, Edit } from "lucide-react";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const categoryColors = {
  health: { gradient: "from-green-500 to-emerald-600", emoji: "💪" },
  career: { gradient: "from-blue-500 to-indigo-600", emoji: "💼" },
  learning: { gradient: "from-purple-500 to-pink-600", emoji: "📚" },
  relationships: { gradient: "from-rose-500 to-red-600", emoji: "❤️" },
  finance: { gradient: "from-yellow-500 to-orange-600", emoji: "💰" },
  personal: { gradient: "from-cyan-500 to-blue-600", emoji: "🌟" },
  creative: { gradient: "from-pink-500 to-purple-600", emoji: "🎨" }
};

export default function GoalDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [goalId, setGoalId] = useState(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showAddLevelDialog, setShowAddLevelDialog] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [newLevelTitle, setNewLevelTitle] = useState("");
  const [newLevelDescription, setNewLevelDescription] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    getUser();

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    setGoalId(id);
  }, []);

  const { data: goal } = useQuery({
    queryKey: ['goal', goalId],
    queryFn: async () => {
      const goals = await base44.entities.Goal.filter({ id: goalId });
      return goals[0];
    },
    enabled: !!goalId,
  });

  const { data: levels = [] } = useQuery({
    queryKey: ['levels', goalId],
    queryFn: () => base44.entities.Level.filter({ goal_id: goalId }),
    enabled: !!goalId,
  });

  const { data: progress } = useQuery({
    queryKey: ['userProgress', user?.id],
    queryFn: async () => {
      const results = await base44.entities.UserProgress.filter({ user_id: user.id });
      return results[0];
    },
    enabled: !!user,
  });

  const sortedLevels = [...levels].sort((a, b) => a.level_number - b.level_number);
  const currentLevel = sortedLevels.find(l => l.status === 'active');
  const completedLevels = sortedLevels.filter(l => l.status === 'completed');

  const completeLevelMutation = useMutation({
    mutationFn: async () => {
      // Mark current level as completed
      await base44.entities.Level.update(currentLevel.id, {
        status: 'completed',
        completed_date: new Date().toISOString(),
        notes: completionNotes
      });

      // Update goal progress
      const newCurrentLevel = goal.current_level + 1;
      const goalCompleted = newCurrentLevel >= goal.target_levels;

      await base44.entities.Goal.update(goal.id, {
        current_level: newCurrentLevel,
        status: goalCompleted ? 'completed' : 'active',
        completed_date: goalCompleted ? new Date().toISOString() : null
      });

      // Update user progress
      const xpEarned = 100;
      await base44.entities.UserProgress.update(progress.id, {
        total_levels_completed: progress.total_levels_completed + 1,
        xp_points: progress.xp_points + xpEarned,
        total_goals_completed: goalCompleted ? progress.total_goals_completed + 1 : progress.total_goals_completed,
        last_active_date: new Date().toISOString().split('T')[0]
      });

      // Activate next level if it exists
      const nextLevel = sortedLevels.find(l => l.level_number === currentLevel.level_number + 1);
      if (nextLevel) {
        await base44.entities.Level.update(nextLevel.id, { status: 'active' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal'] });
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      setShowCompleteDialog(false);
      setCompletionNotes("");
    },
  });

  const addLevelMutation = useMutation({
    mutationFn: async () => {
      const nextLevelNumber = sortedLevels.length + 1;
      await base44.entities.Level.create({
        goal_id: goal.id,
        user_id: user.id,
        level_number: nextLevelNumber,
        title: newLevelTitle,
        description: newLevelDescription,
        status: 'locked'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      setShowAddLevelDialog(false);
      setNewLevelTitle("");
      setNewLevelDescription("");
    },
  });

  if (!goal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="text-6xl">
          ✨
        </motion.div>
      </div>
    );
  }

  const categoryData = categoryColors[goal.category];
  const progressPercent = (goal.current_level / goal.target_levels) * 100;
  const isCompleted = goal.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <Button
          onClick={() => navigate(createPageUrl("Dashboard"))}
          variant="outline"
          className="mb-6 border-white/20 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Goal Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-6xl">{categoryData.emoji}</div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{goal.title}</h1>
                <p className="text-cyan-300 capitalize">{goal.category}</p>
              </div>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full border border-green-500/30">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">Completed!</span>
              </div>
            )}
          </div>

          {goal.description && (
            <p className="text-white/70 mb-6">{goal.description}</p>
          )}

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Overall Progress</span>
              <span className="text-cyan-400 font-bold text-xl">
                {goal.current_level} / {goal.target_levels} Levels
              </span>
            </div>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className={`h-full bg-gradient-to-r ${categoryData.gradient} relative`}
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>
          </div>

          {!isCompleted && currentLevel && (
            <div className="mt-6">
              <Button
                onClick={() => setShowCompleteDialog(true)}
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Complete Current Level
              </Button>
            </div>
          )}
        </div>

        {/* Levels List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Levels</h2>
            <Button
              onClick={() => setShowAddLevelDialog(true)}
              variant="outline"
              size="sm"
              className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Level
            </Button>
          </div>

          <AnimatePresence>
            {sortedLevels.map((level, index) => {
              const isActive = level.status === 'active';
              const isCompleted = level.status === 'completed';
              const isLocked = level.status === 'locked';

              return (
                <motion.div
                  key={level.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 ${
                    isActive ? 'border-cyan-400' : isCompleted ? 'border-green-500/30' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-500' : isActive ? 'bg-cyan-500' : 'bg-white/10'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : isLocked ? (
                        <Lock className="w-6 h-6 text-white/40" />
                      ) : (
                        <Zap className="w-6 h-6 text-white" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`text-lg font-bold ${isLocked ? 'text-white/40' : 'text-white'}`}>
                          Level {level.level_number}: {level.title}
                        </h3>
                        {isActive && (
                          <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">Current</span>
                        )}
                      </div>
                      {level.description && (
                        <p className={`text-sm mb-3 ${isLocked ? 'text-white/30' : 'text-white/70'}`}>
                          {level.description}
                        </p>
                      )}
                      {isCompleted && level.notes && (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mt-2">
                          <p className="text-green-300 text-sm italic">"{level.notes}"</p>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-cyan-400">+100</div>
                      <div className="text-xs text-white/60">XP</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Complete Level Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="bg-slate-900 border-cyan-400/30">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Level Up!
            </DialogTitle>
          </DialogHeader>

          {currentLevel && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 rounded-xl p-4 border border-cyan-400/30">
                <h3 className="text-white font-bold mb-1">Level {currentLevel.level_number}</h3>
                <p className="text-cyan-300">{currentLevel.title}</p>
              </div>

              <div>
                <label className="text-white/80 text-sm mb-2 block">
                  What did you accomplish? (Optional)
                </label>
                <Textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Share your success story..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  rows={4}
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">Reward</span>
                </div>
                <p className="text-white/80 text-sm">+100 XP</p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowCompleteDialog(false)}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => completeLevelMutation.mutate()}
                  disabled={completeLevelMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {completeLevelMutation.isPending ? "Completing..." : "Complete Level!"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Level Dialog */}
      <Dialog open={showAddLevelDialog} onOpenChange={setShowAddLevelDialog}>
        <DialogContent className="bg-slate-900 border-cyan-400/30">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Add New Level</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-white/80 text-sm mb-2 block">Level Title</label>
              <Input
                value={newLevelTitle}
                onChange={(e) => setNewLevelTitle(e.target.value)}
                placeholder="E.g., Run 5K, Read 3 books, Save $1000..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Description (Optional)</label>
              <Textarea
                value={newLevelDescription}
                onChange={(e) => setNewLevelDescription(e.target.value)}
                placeholder="What exactly do you need to do?"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowAddLevelDialog(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={() => addLevelMutation.mutate()}
                disabled={!newLevelTitle || addLevelMutation.isPending}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
              >
                {addLevelMutation.isPending ? "Adding..." : "Add Level"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}