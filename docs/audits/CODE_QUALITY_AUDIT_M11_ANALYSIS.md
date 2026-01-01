# M11: Complex Conditional Logic Analysis

## Current Issue

**File:** `src/components/features/user/QuizStats.jsx` (lines 85-121)

### Problem Areas

The component contains multiple nested ternary operators that make the code difficult to read and maintain:

1. **Status Badge Styling** (lines 90-96):

   ```jsx
   ${quiz.completed > 0
     ? 'bg-green-100 text-green-800'
     : quiz.attempts > 0
       ? 'bg-yellow-100 text-yellow-800'
       : 'bg-gray-100 text-gray-800'}
   ```

2. **Status Badge Content** (lines 98-113):

   ```jsx
   {
     quiz.completed > 0 ? (
       <>
         <Trophy className="w-3 h-3" />
         Completed
       </>
     ) : quiz.attempts > 0 ? (
       <>
         <Clock className="w-3 h-3" />
         In Progress
       </>
     ) : (
       <>
         <Target className="w-3 h-3" />
         Not Started
       </>
     );
   }
   ```

3. **Score Badge Styling** (lines 123-125):
   ```jsx
   ${quiz.bestScore >= SCORE_THRESHOLDS.EXCELLENT ? 'bg-green-100 text-green-800' :
     quiz.bestScore >= SCORE_THRESHOLDS.PASSING ? 'bg-yellow-100 text-yellow-800' :
       'bg-red-100 text-red-800'}
   ```

### Problems with Current Approach

1. **Readability**: Nested ternaries are hard to parse, especially when they span multiple lines
2. **Maintainability**: Adding new status types or score ranges requires modifying complex nested logic
3. **Testability**: Difficult to unit test individual status/score logic in isolation
4. **Reusability**: Logic is embedded in JSX, making it hard to reuse elsewhere
5. **Error-Prone**: Easy to introduce bugs when modifying nested conditions

---

## Proposed Solutions

### Solution 1: Helper Functions (Recommended)

Extract the logic into well-named helper functions that return the appropriate values.

#### Implementation

```javascript
// Helper function to get quiz status
function getQuizStatus(quiz) {
  if (quiz.completed > 0) {
    return {
      label: "Completed",
      icon: Trophy,
      className: "bg-green-100 text-green-800",
    };
  }

  if (quiz.attempts > 0) {
    return {
      label: "In Progress",
      icon: Clock,
      className: "bg-yellow-100 text-yellow-800",
    };
  }

  return {
    label: "Not Started",
    icon: Target,
    className: "bg-gray-100 text-gray-800",
  };
}

// Helper function to get score badge styling
function getScoreBadgeClass(score) {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) {
    return "bg-green-100 text-green-800";
  }

  if (score >= SCORE_THRESHOLDS.PASSING) {
    return "bg-yellow-100 text-yellow-800";
  }

  return "bg-red-100 text-red-800";
}
```

#### Usage in Component

```jsx
// Status cell
<TableCell className="text-center">
  {(() => {
    const status = getQuizStatus(quiz);
    const Icon = status.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
        <Icon className="w-3 h-3" />
        {status.label}
      </span>
    );
  })()}
</TableCell>

// Best Score cell
<TableCell className="text-center">
  {quiz.bestScore ? (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBadgeClass(quiz.bestScore)}`}>
      {quiz.bestScore}%
    </span>
  ) : (
    <span className="text-gray-400">--</span>
  )}
</TableCell>
```

---

### Solution 2: Lookup Objects (Alternative)

Use lookup objects/maps for status and score configurations.

#### Implementation

```javascript
// Status configuration lookup
const QUIZ_STATUS_CONFIG = {
  completed: {
    label: "Completed",
    icon: Trophy,
    className: "bg-green-100 text-green-800",
  },
  inProgress: {
    label: "In Progress",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800",
  },
  notStarted: {
    label: "Not Started",
    icon: Target,
    className: "bg-gray-100 text-gray-800",
  },
};

// Score threshold lookup (ordered from highest to lowest)
const SCORE_BADGE_CONFIG = [
  {
    threshold: SCORE_THRESHOLDS.EXCELLENT,
    className: "bg-green-100 text-green-800",
  },
  {
    threshold: SCORE_THRESHOLDS.PASSING,
    className: "bg-yellow-100 text-yellow-800",
  },
  {
    threshold: 0,
    className: "bg-red-100 text-red-800",
  },
];

// Helper to get status key
function getQuizStatusKey(quiz) {
  if (quiz.completed > 0) return "completed";
  if (quiz.attempts > 0) return "inProgress";
  return "notStarted";
}

// Helper to get score badge class
function getScoreBadgeClass(score) {
  const config = SCORE_BADGE_CONFIG.find((item) => score >= item.threshold);
  return config.className;
}
```

---

### Solution 3: Custom Hooks (Advanced)

For more complex scenarios, create custom hooks that encapsulate the logic.

#### Implementation

```javascript
function useQuizStatus(quiz) {
  return useMemo(() => {
    if (quiz.completed > 0) {
      return {
        label: "Completed",
        icon: Trophy,
        className: "bg-green-100 text-green-800",
      };
    }

    if (quiz.attempts > 0) {
      return {
        label: "In Progress",
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800",
      };
    }

    return {
      label: "Not Started",
      icon: Target,
      className: "bg-gray-100 text-gray-800",
    };
  }, [quiz.completed, quiz.attempts]);
}
```

---

## Benefits

### 1. **Improved Readability**

- **Before**: Nested ternaries require mental parsing to understand logic flow
- **After**: Clear function names (`getQuizStatus`, `getScoreBadgeClass`) immediately convey intent
- **Impact**: New developers can understand code faster

### 2. **Better Maintainability**

- **Before**: Modifying status logic requires finding and updating nested ternaries in JSX
- **After**: Logic is centralized in helper functions, making changes easier
- **Impact**: Adding new status types (e.g., "Expired", "Locked") is straightforward

### 3. **Enhanced Testability**

- **Before**: Logic is embedded in JSX, requiring component rendering for tests
- **After**: Pure functions can be unit tested in isolation
- **Impact**: Faster, more reliable tests

```javascript
// Example test
describe("getQuizStatus", () => {
  it("returns completed status when quiz is completed", () => {
    const quiz = { completed: 1, attempts: 1 };
    const status = getQuizStatus(quiz);
    expect(status.label).toBe("Completed");
    expect(status.icon).toBe(Trophy);
  });
});
```

### 4. **Reusability**

- **Before**: Logic is duplicated if needed elsewhere
- **After**: Helper functions can be imported and reused across components
- **Impact**: DRY principle, consistent behavior

### 5. **Type Safety** (with TypeScript)

- **Before**: No type checking for nested ternaries
- **After**: Functions can have explicit return types
- **Impact**: Catch errors at compile time

### 6. **Performance** (with memoization)

- **Before**: Logic recalculates on every render
- **After**: Can use `useMemo` or memoization for expensive calculations
- **Impact**: Better performance for large lists

### 7. **Easier Debugging**

- **Before**: Hard to set breakpoints in JSX ternaries
- **After**: Can debug helper functions directly
- **Impact**: Faster bug resolution

---

## Downsides

### 1. **Additional Code**

- **Impact**: More lines of code (helper functions + usage)
- **Mitigation**: The code is more maintainable, offsetting the increase

### 2. **Slight Performance Overhead**

- **Impact**: Function calls have minimal overhead
- **Mitigation**: Modern JavaScript engines optimize this; can use `useMemo` if needed

### 3. **File Organization**

- **Impact**: Need to decide where to place helper functions
- **Mitigation**:
  - Keep simple helpers in the same file
  - Move complex/reusable helpers to `utils/` directory
  - Use custom hooks in `hooks/` directory

### 4. **Learning Curve**

- **Impact**: Team needs to understand the pattern
- **Mitigation**: Well-named functions are self-documenting

### 5. **Over-Engineering Risk**

- **Impact**: Might be overkill for very simple conditions
- **Mitigation**: Use judgment - if ternary is truly simple (2-3 levels), it's fine

---

## Recommendation

**Use Solution 1 (Helper Functions)** for this case because:

1. ✅ Clear improvement in readability
2. ✅ Easy to test and maintain
3. ✅ Appropriate complexity level (not over-engineered)
4. ✅ Can be implemented incrementally
5. ✅ Works well with existing codebase patterns

**When to use Solution 2 (Lookup Objects):**

- When you have many status types (5+)
- When status configuration might come from API/database
- When you need dynamic status types

**When to use Solution 3 (Custom Hooks):**

- When logic needs React hooks (state, effects)
- When logic is complex and needs memoization
- When logic is shared across multiple components

---

## Implementation Priority

**Priority: Medium**

- Not blocking functionality
- Improves code quality significantly
- Low risk refactoring
- Can be done incrementally

---

## Example: Complete Refactored Code

```javascript
// Helper functions (can be in same file or utils/quizHelpers.js)
function getQuizStatus(quiz) {
  if (quiz.completed > 0) {
    return {
      label: 'Completed',
      icon: Trophy,
      className: 'bg-green-100 text-green-800'
    };
  }

  if (quiz.attempts > 0) {
    return {
      label: 'In Progress',
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-800'
    };
  }

  return {
    label: 'Not Started',
    icon: Target,
    className: 'bg-gray-100 text-gray-800'
  };
}

function getScoreBadgeClass(score) {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) {
    return 'bg-green-100 text-green-800';
  }

  if (score >= SCORE_THRESHOLDS.PASSING) {
    return 'bg-yellow-100 text-yellow-800';
  }

  return 'bg-red-100 text-red-800';
}

// In component
<TableCell className="text-center">
  {(() => {
    const status = getQuizStatus(quiz);
    const Icon = status.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
        <Icon className="w-3 h-3" />
        {status.label}
      </span>
    );
  })()}
</TableCell>

<TableCell className="text-center">
  {quiz.bestScore ? (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBadgeClass(quiz.bestScore)}`}>
      {quiz.bestScore}%
    </span>
  ) : (
    <span className="text-gray-400">--</span>
  )}
</TableCell>
```

---

## Conclusion

Refactoring nested ternaries to helper functions provides significant benefits with minimal downsides. The improved readability and maintainability make this a worthwhile refactoring, especially as the codebase grows.
