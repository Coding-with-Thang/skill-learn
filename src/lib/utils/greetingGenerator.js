/**
 * Greeting Generator Utility
 * Generates dynamic, contextual greetings based on user data and scenarios
 */

// Priority levels (higher = more important)
const PRIORITY = {
  FIRST_TIME: 100,
  STREAK_MILESTONE: 90,
  LEADERBOARD_TOP: 85,
  POINTS_MILESTONE: 80,
  STREAK_AT_RISK: 75,
  QUIZ_PERFECT: 70,
  SPECIAL_OCCASION: 65,
  RETURNING_USER: 60,
  STREAK_ACTIVE: 55,
  POINTS_ACHIEVEMENT: 50,
  LEADERBOARD_POSITION: 45,
  QUIZ_PERFORMANCE: 40,
  TIME_OF_DAY: 30,
  DEFAULT: 10,
};

// Greeting templates organized by scenario
const GREETINGS = {
  // First-time user greetings (10 variations)
  firstTime: [
    {
      text: "Welcome to your learning journey, {name}! 🎉",
      subtext: "Let's start building amazing skills together!",
    },
    {
      text: "Hey {name}, welcome aboard! 🚀",
      subtext: "Your adventure in learning starts now!",
    },
    {
      text: "Great to have you here, {name}! ✨",
      subtext: "Ready to unlock your potential?",
    },
    {
      text: "Welcome, {name}! Let's make learning fun! 🎯",
      subtext: "Your first lesson awaits!",
    },
    {
      text: "Hello {name}! Excited to learn with you! 🌟",
      subtext: "Let's discover something new today!",
    },
    {
      text: "Welcome to Skill-Learn, {name}! 🎓",
      subtext: "Your personalized learning path is ready!",
    },
    {
      text: "Hi {name}! Ready to level up? 💪",
      subtext: "Let's start with your first challenge!",
    },
    {
      text: "Welcome {name}! Your journey begins! 🌈",
      subtext: "Explore courses tailored just for you!",
    },
    {
      text: "Hey there, {name}! Let's get started! 🔥",
      subtext: "Amazing things await you here!",
    },
    {
      text: "Welcome {name}! Time to shine! ⭐",
      subtext: "Your learning adventure starts today!",
    },
  ],

  // Time-based greetings (24 variations)
  morning: [
    {
      text: "Good morning, {name}! ☀️",
      subtext: "Ready to start your day with some learning?",
    },
    {
      text: "Rise and shine, {name}! 🌅",
      subtext: "Let's make today productive!",
    },
    {
      text: "Morning, {name}! Coffee and coding? ☕",
      subtext: "Perfect way to start the day!",
    },
    {
      text: "Good morning, {name}! 🌞",
      subtext: "Early bird gets the knowledge!",
    },
    {
      text: "Hey {name}, great morning for learning! 🌄",
      subtext: "Let's tackle something new!",
    },
    {
      text: "Morning {name}! Fresh start, fresh skills! 🌻",
      subtext: "What will you learn today?",
    },
  ],

  afternoon: [
    {
      text: "Good afternoon, {name}! 🌤️",
      subtext: "Perfect time for a learning break!",
    },
    {
      text: "Hey {name}, how's your day going? 👋",
      subtext: "Ready for your next lesson?",
    },
    {
      text: "Afternoon, {name}! ☀️",
      subtext: "Let's keep that momentum going!",
    },
    {
      text: "Hi {name}! Midday learning session? 📚",
      subtext: "You're doing great!",
    },
    {
      text: "Good afternoon, {name}! 🌺",
      subtext: "Time to boost your skills!",
    },
    {
      text: "Hey {name}, afternoon energy! ⚡",
      subtext: "Let's learn something exciting!",
    },
  ],

  evening: [
    {
      text: "Good evening, {name}! 🌆",
      subtext: "Winding down with some learning?",
    },
    {
      text: "Evening, {name}! Perfect study time! 🌃",
      subtext: "Let's make tonight count!",
    },
    {
      text: "Hey {name}, evening learner! 🌙",
      subtext: "Dedication looks good on you!",
    },
    {
      text: "Good evening, {name}! 🌇",
      subtext: "Ready for your evening session?",
    },
    {
      text: "Hi {name}! Evening vibes! ✨",
      subtext: "Let's end the day strong!",
    },
    {
      text: "Evening {name}! Still going strong! 💫",
      subtext: "Your commitment is inspiring!",
    },
  ],

  lateNight: [
    {
      text: "Burning the midnight oil, {name}? 🌙",
      subtext: "Your dedication is impressive!",
    },
    {
      text: "Late night learning, {name}! 🦉",
      subtext: "Night owl mode activated!",
    },
    { text: "Hey {name}, still at it? 🌟", subtext: "That's the spirit!" },
    {
      text: "Late night grind, {name}! 💪",
      subtext: "Success loves dedication!",
    },
    { text: "Night owl {name}! 🌃", subtext: "Making every hour count!" },
    {
      text: "Wow {name}, late night hustle! ⭐",
      subtext: "Your future self will thank you!",
    },
  ],

  // Streak-based greetings (15 variations)
  streakMilestone: [
    {
      text: "🔥 {streak} day streak, {name}! Legendary! 🏆",
      subtext: "You're on fire! Keep it going!",
    },
    {
      text: "Incredible {streak}-day streak, {name}! 🎉",
      subtext: "Consistency is your superpower!",
    },
    {
      text: "{name}, {streak} days strong! 💪",
      subtext: "You're unstoppable!",
    },
    {
      text: "Wow! {streak} days in a row, {name}! 🌟",
      subtext: "That's commitment!",
    },
    {
      text: "{streak}-day streak! You're crushing it, {name}! 🚀",
      subtext: "Keep this momentum!",
    },
  ],

  streakActive: [
    {
      text: "Welcome back, {name}! Day {streak} 🔥",
      subtext: "Your streak is looking great!",
    },
    {
      text: "Hey {name}! Streak day {streak}! 💫",
      subtext: "Consistency is key!",
    },
    {
      text: "{name}, keeping that {streak}-day streak alive! ⚡",
      subtext: "You're doing amazing!",
    },
    {
      text: "Day {streak} of your streak, {name}! 🌟",
      subtext: "Don't break the chain!",
    },
    {
      text: "Streak strong at {streak} days, {name}! 🔥",
      subtext: "Let's keep it going!",
    },
  ],

  streakAtRisk: [
    {
      text: "Don't lose your {streak}-day streak, {name}! ⚠️",
      subtext: "Quick lesson to keep it alive?",
    },
    {
      text: "{name}, your {streak}-day streak needs you! 🔥",
      subtext: "Just one activity to save it!",
    },
    {
      text: "Streak alert, {name}! Day {streak} at risk! ⏰",
      subtext: "Don't break the chain now!",
    },
    {
      text: "Save your {streak}-day streak, {name}! 💪",
      subtext: "You've come too far to stop!",
    },
    {
      text: "{name}, {streak} days! Don't let it slip! 🎯",
      subtext: "Quick action needed!",
    },
  ],

  // Points-based greetings (15 variations)
  pointsMilestone: [
    {
      text: "🎉 {points} points, {name}! Milestone unlocked! 🏆",
      subtext: "You're climbing the ranks!",
    },
    {
      text: "Incredible! {points} points, {name}! 🌟",
      subtext: "Your hard work is paying off!",
    },
    {
      text: "{name}, you hit {points} points! 💎",
      subtext: "That's a major achievement!",
    },
    {
      text: "Wow! {points} points earned, {name}! 🚀",
      subtext: "You're on a roll!",
    },
    {
      text: "You're amazing, {name}! You've earned {points} points!  ⭐",
      subtext: "Keep reaching new heights!",
    },
  ],

  pointsHigh: [
    {
      text: "Welcome back, {name}! {points} points strong! 💪",
      subtext: "You're in the top tier!",
    },
    {
      text: "Hey {name}! Sitting at {points} points! 🌟",
      subtext: "Impressive progress!",
    },
    {
      text: "{name}, {points} points and counting! 📈",
      subtext: "You're doing fantastic!",
    },
    {
      text: "Great to see you, {name}! {points} points! ✨",
      subtext: "Your dedication shows!",
    },
    {
      text: "{points} points, {name}! Outstanding! 🎯",
      subtext: "Keep up the excellent work!",
    },
  ],

  pointsGrowing: [
    {
      text: "Welcome back, {name}! {points} points! 🌱",
      subtext: "You're making steady progress!",
    },
    {
      text: "Hey {name}! {points} points earned! 📊",
      subtext: "Every point counts!",
    },
    {
      text: "{name}, you're at {points} points! 💫",
      subtext: "Keep building that score!",
    },
    {
      text: "Nice to see you, {name}! {points} points! 🎈",
      subtext: "You're on the right track!",
    },
    {
      text: "{points} points, {name}! Growing strong! 🌿",
      subtext: "Consistency is paying off!",
    },
  ],

  // Leaderboard greetings (15 variations)
  leaderboardTop3: [
    {
      text: "Top {position}, {name}! You're a champion! 🥇",
      subtext: "The competition is fierce!",
    },
    {
      text: "#{position} on the leaderboard, {name}! 🏆",
      subtext: "Elite status achieved!",
    },
    {
      text: "Wow {name}! Rank #{position}! 🌟",
      subtext: "You're leading the pack!",
    },
    {
      text: "{name}, you're #{position}! Incredible! 👑",
      subtext: "Stay at the top!",
    },
    {
      text: "Rank {position}! Legendary, {name}! ⭐",
      subtext: "You're inspiring others!",
    },
  ],

  leaderboardTop10: [
    {
      text: "Top 10! Rank #{position}, {name}! 🎯",
      subtext: "You're in elite company!",
    },
    {
      text: "#{position} on the board, {name}! 🚀",
      subtext: "Climbing higher every day!",
    },
    {
      text: "{name}, you're #{position}! Awesome! 💪",
      subtext: "Top 10 achievement!",
    },
    {
      text: "Rank {position}, {name}! Well done! 🌟",
      subtext: "You're making waves!",
    },
    {
      text: "Hey {name}! #{position} and rising! 📈",
      subtext: "Keep pushing forward!",
    },
  ],

  leaderboardRising: [
    {
      text: "Welcome {name}! Rank #{position}! 🎈",
      subtext: "You're climbing the leaderboard!",
    },
    { text: "Hey {name}! You're #{position}! 💫", subtext: "Great progress!" },
    {
      text: "{name}, rank {position} and moving up! 🌱",
      subtext: "Keep up the momentum!",
    },
    {
      text: "Nice work, {name}! Rank #{position}! ✨",
      subtext: "You're on your way up!",
    },
    {
      text: "#{position}, {name}! Keep climbing! 🧗",
      subtext: "Every rank counts!",
    },
  ],

  // Quiz performance greetings (10 variations)
  quizPerfect: [
    {
      text: "Perfect score, {name}! 💯",
      subtext: "You absolutely nailed that quiz!",
    },
    {
      text: "100%! You're brilliant, {name}! 🌟",
      subtext: "Flawless performance!",
    },
    {
      text: "{name}, perfect quiz! Genius! 🧠",
      subtext: "You're mastering this!",
    },
    { text: "Wow {name}! Perfect score! 🎯", subtext: "Excellence in action!" },
    { text: "Flawless, {name}! 100%! ⭐", subtext: "You're on fire!" },
  ],

  quizExcellent: [
    {
      text: "Excellent quiz score, {name}! 🌟",
      subtext: "{score}% - You're doing great!",
    },
    {
      text: "{name}, {score}% on that quiz! 🎉",
      subtext: "Impressive knowledge!",
    },
    {
      text: "Great job, {name}! {score}%! 💪",
      subtext: "You really know your stuff!",
    },
    {
      text: "{score}%! Well done, {name}! ✨",
      subtext: "Keep up the excellent work!",
    },
    {
      text: "Nice work, {name}! {score}%! 🚀",
      subtext: "You're mastering the material!",
    },
  ],

  // Activity-based greetings (10 variations)
  returningUser: [
    {
      text: "Welcome back, {name}! We missed you! 💙",
      subtext: "Ready to pick up where you left off?",
    },
    {
      text: "Great to see you again, {name}! 🎉",
      subtext: "Let's continue your journey!",
    },
    { text: "{name}! You're back! 🌟", subtext: "Your courses are waiting!" },
    { text: "Hey {name}, welcome back! 👋", subtext: "Time to dive back in!" },
    { text: "Missed you, {name}! 💫", subtext: "Let's get back to learning!" },
  ],

  longAbsence: [
    { text: "Long time no see, {name}! 🌈", subtext: "Ready to jump back in?" },
    {
      text: "{name}! Great to have you back! 🎊",
      subtext: "Let's refresh those skills!",
    },
    {
      text: "Welcome back, {name}! It's been a while! ⏰",
      subtext: "Your learning awaits!",
    },
    {
      text: "Hey {name}! Glad you're back! 🌟",
      subtext: "Let's make up for lost time!",
    },
    {
      text: "{name}, you're back! Awesome! 🚀",
      subtext: "Ready for a fresh start?",
    },
  ],

  // Special occasion greetings (10 variations)
  weekend: [
    {
      text: "Happy weekend, {name}! 🎉",
      subtext: "Learning on the weekend? Impressive!",
    },
    {
      text: "Weekend warrior, {name}! 💪",
      subtext: "Your dedication is inspiring!",
    },
    {
      text: "Hey {name}! Weekend learning! 🌟",
      subtext: "Making the most of your time!",
    },
    { text: "{name}, weekend vibes! ✨", subtext: "Perfect time to level up!" },
    { text: "Weekend learning, {name}! 🎯", subtext: "That's commitment!" },
  ],

  monday: [
    {
      text: "Happy Monday, {name}! Fresh start! 🌟",
      subtext: "Let's make this week count!",
    },
    {
      text: "Monday motivation, {name}! 💪",
      subtext: "Start the week strong!",
    },
    { text: "New week, new goals, {name}! 🚀", subtext: "Ready to crush it?" },
    {
      text: "Monday energy, {name}! ⚡",
      subtext: "Let's set the tone for the week!",
    },
    { text: "Hey {name}! Monday hustle! 🎯", subtext: "Week one, day one!" },
  ],

  // Default greetings (5 variations)
  default: [
    {
      text: "Welcome back, {name}! 👋",
      subtext: "Ready to continue learning?",
    },
    {
      text: "Hey {name}! Great to see you! 🌟",
      subtext: "Let's make today count!",
    },
    {
      text: "Hi {name}! Ready to learn? 📚",
      subtext: "Your next lesson awaits!",
    },
    {
      text: "Welcome, {name}! 💫",
      subtext: "Let's keep building those skills!",
    },
    { text: "Hello {name}! Let's go! 🚀", subtext: "Time to level up!" },
  ],
};

/**
 * Get greeting variant based on visit count (rotates through all greetings)
 * @param {number} visitCount - Number of times user has visited
 * @param {Array} greetingArray - Array of greetings to rotate through
 * @returns {Object} - Selected greeting
 */
function getRotatedGreeting(visitCount, greetingArray) {
  const index = visitCount % greetingArray.length;
  return greetingArray[index];
}

/**
 * Check if it's a special day
 */
function getSpecialOccasion() {
  const now = new Date();
  const day = now.getDay();

  // Weekend
  if (day === 0 || day === 6) return "weekend";

  // Monday
  if (day === 1) return "monday";

  return null;
}

/**
 * Calculate days since last activity
 */
function getDaysSinceLastActivity(lastActivityDate) {
  if (!lastActivityDate) return 0;
  const now = new Date();
  const last = new Date(lastActivityDate);
  const diffTime = Math.abs(now - last);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get random item from array
 */
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Replace placeholders in greeting text
 */
function replacePlaceholders(text, context) {
  return text
    .replace(/{name}/g, context.firstName || "there")
    .replace(/{streak}/g, context.streak || 0)
    .replace(/{points}/g, context.points?.toLocaleString() || 0)
    .replace(/{position}/g, context.leaderboardPosition || "?")
    .replace(/{score}/g, context.lastQuizScore || 0);
}

/**
 * Generate greeting based on user context
 * @param {Object} context - User context data
 * @returns {Object} - Greeting object with text, subtext, and priority
 */
export function generateGreeting(context = {}) {
  const scenarios = [];
  const visitCount = context.visitCount || 0;

  // First-time user (highest priority)
  if (context.isFirstTime) {
    scenarios.push({
      priority: PRIORITY.FIRST_TIME,
      greeting: getRotatedGreeting(visitCount, GREETINGS.firstTime),
    });
  }

  // Streak milestones (5, 10, 30, 50, 100+ days)
  if (
    context.streak >= 5 &&
    [5, 10, 30, 50, 100, 200, 365].includes(context.streak)
  ) {
    scenarios.push({
      priority: PRIORITY.STREAK_MILESTONE,
      greeting: getRotatedGreeting(visitCount, GREETINGS.streakMilestone),
    });
  }

  // Streak at risk
  if (context.streakAtRisk && context.streak > 0) {
    scenarios.push({
      priority: PRIORITY.STREAK_AT_RISK,
      greeting: getRotatedGreeting(visitCount, GREETINGS.streakAtRisk),
    });
  }

  // Active streak (not at risk, not milestone)
  if (context.streak > 0 && !context.streakAtRisk) {
    scenarios.push({
      priority: PRIORITY.STREAK_ACTIVE,
      greeting: getRotatedGreeting(visitCount, GREETINGS.streakActive),
    });
  }

  // Leaderboard top 3
  if (context.leaderboardPosition && context.leaderboardPosition <= 3) {
    scenarios.push({
      priority: PRIORITY.LEADERBOARD_TOP,
      greeting: getRotatedGreeting(visitCount, GREETINGS.leaderboardTop3),
    });
  }

  // Leaderboard top 10
  if (
    context.leaderboardPosition &&
    context.leaderboardPosition > 3 &&
    context.leaderboardPosition <= 10
  ) {
    scenarios.push({
      priority: PRIORITY.LEADERBOARD_POSITION,
      greeting: getRotatedGreeting(visitCount, GREETINGS.leaderboardTop10),
    });
  }

  // Leaderboard rising
  if (context.leaderboardPosition && context.leaderboardPosition > 10) {
    scenarios.push({
      priority: PRIORITY.LEADERBOARD_POSITION - 5,
      greeting: getRotatedGreeting(visitCount, GREETINGS.leaderboardRising),
    });
  }

  // Points milestones (1000, 5000, 10000, 25000, 50000, 100000)
  if (
    context.points &&
    [1000, 5000, 10000, 25000, 50000, 100000].includes(context.points)
  ) {
    scenarios.push({
      priority: PRIORITY.POINTS_MILESTONE,
      greeting: getRotatedGreeting(visitCount, GREETINGS.pointsMilestone),
    });
  }

  // High points (>10000)
  if (context.points && context.points > 10000) {
    scenarios.push({
      priority: PRIORITY.POINTS_ACHIEVEMENT,
      greeting: getRotatedGreeting(visitCount, GREETINGS.pointsHigh),
    });
  }

  // Growing points (>100)
  if (context.points && context.points > 100) {
    scenarios.push({
      priority: PRIORITY.POINTS_ACHIEVEMENT - 10,
      greeting: getRotatedGreeting(visitCount, GREETINGS.pointsGrowing),
    });
  }

  // Perfect quiz score
  if (context.lastQuizScore === 100) {
    scenarios.push({
      priority: PRIORITY.QUIZ_PERFECT,
      greeting: getRotatedGreeting(visitCount, GREETINGS.quizPerfect),
    });
  }

  // Excellent quiz score (>80%)
  if (
    context.lastQuizScore &&
    context.lastQuizScore > 80 &&
    context.lastQuizScore < 100
  ) {
    scenarios.push({
      priority: PRIORITY.QUIZ_PERFORMANCE,
      greeting: getRotatedGreeting(visitCount, GREETINGS.quizExcellent),
    });
  }

  // Returning user after long absence (>7 days)
  const daysSinceLastActivity = getDaysSinceLastActivity(
    context.lastActivityDate
  );
  if (daysSinceLastActivity > 7) {
    scenarios.push({
      priority: PRIORITY.RETURNING_USER,
      greeting: getRotatedGreeting(visitCount, GREETINGS.longAbsence),
    });
  }

  // Returning user (1-7 days)
  if (daysSinceLastActivity >= 1 && daysSinceLastActivity <= 7) {
    scenarios.push({
      priority: PRIORITY.RETURNING_USER - 10,
      greeting: getRotatedGreeting(visitCount, GREETINGS.returningUser),
    });
  }

  // Special occasions
  const occasion = getSpecialOccasion();
  if (occasion && GREETINGS[occasion]) {
    scenarios.push({
      priority: PRIORITY.SPECIAL_OCCASION,
      greeting: getRotatedGreeting(visitCount, GREETINGS[occasion]),
    });
  }

  // Default fallback - combine all time-based greetings for rotation
  const allTimeGreetings = [
    ...GREETINGS.morning,
    ...GREETINGS.afternoon,
    ...GREETINGS.evening,
    ...GREETINGS.lateNight,
    ...GREETINGS.default,
  ];
  scenarios.push({
    priority: PRIORITY.DEFAULT,
    greeting: getRotatedGreeting(visitCount, allTimeGreetings),
  });

  // Sort by priority (highest first) and pick the top one
  scenarios.sort((a, b) => b.priority - a.priority);
  const selectedScenario = scenarios[0];

  // Replace placeholders
  const greeting = {
    text: replacePlaceholders(selectedScenario.greeting.text, context),
    subtext: replacePlaceholders(selectedScenario.greeting.subtext, context),
    priority: selectedScenario.priority,
  };

  return greeting;
}

export default generateGreeting;
