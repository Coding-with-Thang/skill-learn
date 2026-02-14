import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Onboarding checklist items
 */
export const ONBOARDING_STEPS = {
  PROFILE_COMPLETE: "profile_complete",
  FIRST_COURSE: "first_course",
  INVITE_MEMBER: "invite_member",
  FIRST_QUIZ: "first_quiz",
  EXPLORE_FEATURES: "explore_features",
};

export const ONBOARDING_ITEMS = [
  {
    id: ONBOARDING_STEPS.PROFILE_COMPLETE,
    title: "Complete your profile",
    description: "Add your profile picture and details",
    href: "/dashboard/settings",
    icon: "User",
    points: 10,
  },
  {
    id: ONBOARDING_STEPS.FIRST_COURSE,
    title: "Create your first course",
    description: "Set up a course to train your team",
    href: "/dashboard/courses/create",
    icon: "BookOpen",
    points: 25,
  },
  {
    id: ONBOARDING_STEPS.INVITE_MEMBER,
    title: "Invite a team member",
    description: "Add learners to your workspace",
    href: "/dashboard/users",
    icon: "UserPlus",
    points: 15,
  },
  {
    id: ONBOARDING_STEPS.FIRST_QUIZ,
    title: "Create a quiz",
    description: "Test your learners with a quiz",
    href: "/dashboard/quizzes",
    icon: "HelpCircle",
    points: 20,
  },
  {
    id: ONBOARDING_STEPS.EXPLORE_FEATURES,
    title: "Explore gamification features",
    description: "Discover rewards, leaderboards, and games",
    href: "/dashboard/rewards",
    icon: "Trophy",
    points: 10,
  },
];

/**
 * Onboarding store for tracking progress
 */
export const useOnboardingStore = create(
  persist(
    (set, get) => ({
      // State
      completedSteps: [],
      dismissed: false,
      lastUpdated: null,

      // Actions
      completeStep: (stepId) => {
        const { completedSteps } = get();
        if (!completedSteps.includes(stepId)) {
          set({
            completedSteps: [...completedSteps, stepId],
            lastUpdated: new Date().toISOString(),
          });
        }
      },

      uncompleteStep: (stepId) => {
        const { completedSteps } = get();
        set({
          completedSteps: completedSteps.filter((id) => id !== stepId),
          lastUpdated: new Date().toISOString(),
        });
      },

      dismissChecklist: () => {
        set({ dismissed: true });
      },

      showChecklist: () => {
        set({ dismissed: false });
      },

      resetOnboarding: () => {
        set({
          completedSteps: [],
          dismissed: false,
          lastUpdated: new Date().toISOString(),
        });
      },

      // Computed
      getProgress: () => {
        const { completedSteps } = get();
        return {
          completed: completedSteps.length,
          total: ONBOARDING_ITEMS.length,
          percentage: Math.round((completedSteps.length / ONBOARDING_ITEMS.length) * 100),
          isComplete: completedSteps.length === ONBOARDING_ITEMS.length,
        };
      },

      getNextStep: () => {
        const { completedSteps } = get();
        return ONBOARDING_ITEMS.find((item) => !completedSteps.includes(item.id));
      },

      isStepComplete: (stepId) => {
        const { completedSteps } = get();
        return completedSteps.includes(stepId);
      },

      getTotalPoints: () => {
        const { completedSteps } = get();
        return ONBOARDING_ITEMS
          .filter((item) => completedSteps.includes(item.id))
          .reduce((sum, item) => sum + item.points, 0);
      },
    }),
    {
      name: "skill-learn-onboarding",
      partialize: (state) => ({
        completedSteps: state.completedSteps,
        dismissed: state.dismissed,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

export default useOnboardingStore;
