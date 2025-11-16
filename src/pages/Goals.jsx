import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Target } from "lucide-react";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { id: "health", label: "Health & Fitness", emoji: "💪" },
  { id: "career", label: "Career & Work", emoji: "💼" },
  { id: "learning", label: "Learning & Skills", emoji: "📚" },
  { id: "relationships", label: "Relationships", emoji: "❤️" },
  { id: "finance", label: "Finance & Money", emoji: "💰" },
  { id: "personal", label: "Personal Growth", emoji: "🌟" },
  { id: "creative", label: "Creative Projects", emoji: "🎨" }
];

export default function Goals() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "",
    target_levels: 10
  });

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    getUser();
  }, []);

  const { data: goals = [] } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: () => base44.entities.Goal.filter({ user_id: user.id, status: 'active' }),
    enabled: !!user,
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData) => {
      const goal = await base44.entities.Goal.create({
        user_id: user.id,
        ...goalData,
        current_level: 0,
        status: 'active'
      });

      // Create the first level automatically
      await base44.entities.Level.create({
        goal_id: goal.id,
        user_id: user.id,
        level_number: 1,
        title: "Level 1",
        description: "Get started on your journey!",
        status: 'active'
      });

      return goal;
    },
    onSuccess: (goal) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setShowNewGoal(false);
      setNewGoal({ title: "", description: "", category: "", target_levels: 10 });
      navigate(createPageUrl("GoalDetail") + `?id=${goal.id}`);
    },
  });

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

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🎯
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Your Goals</h1>
          <p className="text-cyan-300 text-lg">Create goals, break them into levels, and achieve them step by step</p>
        </div>

        <div className="mb-6 text-center">
          <Button
            onClick={() => setShowNewGoal(true)}
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Goal
          </Button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
            <div className="text-7xl mb-6">🚀</div>
            <h3 className="text-2xl font-bold text-white mb-3">Your journey starts here!</h3>
            <p className="text-white/60 text-lg mb-6">Create your first goal and break it into achievable levels</p>
            <Button
              onClick={() => setShowNewGoal(true)}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const category = categories.find(c => c.id === goal.category);
              const progressPercent = (goal.current_level / goal.target_levels) * 100;
              
              return (
                <motion.div
                  key={goal.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(createPageUrl("GoalDetail") + `?id=${goal.id}`)}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-cyan-400/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{category?.emoji}</div>
                      <div>
                        <h3 className="text-white font-bold text-xl">{goal.title}</h3>
                        <p className="text-white/60 text-sm">{category?.label}</p>
                      </div>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-white/70 text-sm mb-4 line-clamp-2">{goal.description}</p>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Progress</span>
                      <span className="text-cyan-400 font-bold">
                        Level {goal.current_level} / {goal.target_levels}
                      </span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-600"
                      />
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      className="w-full border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Continue Journey
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Goal Dialog */}
      <Dialog open={showNewGoal} onOpenChange={setShowNewGoal}>
        <DialogContent className="bg-slate-900 border-cyan-400/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Create a New Goal</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-white/80 text-sm mb-2 block">Goal Title</label>
              <Input
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="E.g., Run a Marathon, Learn Spanish, Build a Business..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Category</label>
              <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">Description (Optional)</label>
              <Textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="What do you want to achieve and why?"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                rows={3}
              />
            </div>

            <div>
              <label className="text-white/80 text-sm mb-2 block">
                How many levels to complete this goal?
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={newGoal.target_levels}
                onChange={(e) => setNewGoal({ ...newGoal, target_levels: parseInt(e.target.value) || 10 })}
                className="bg-white/10 border-white/20 text-white"
              />
              <p className="text-white/50 text-xs mt-1">
                Each level is a milestone towards your goal. Recommended: 10-20 levels.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowNewGoal(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createGoalMutation.mutate(newGoal)}
                disabled={!newGoal.title || !newGoal.category || createGoalMutation.isPending}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
              >
                {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}