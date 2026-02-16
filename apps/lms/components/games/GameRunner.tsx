"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from "next-intl";
import GamePlayLayout from './GamePlayLayout';
import { useLocalStorage } from "@skill-learn/lib/hooks/useLocalStorage";

const PLACEHOLDER_AVATAR =
  `data:image/svg+xml,${ 
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#9ca3af"/></svg>')}`;

const DEFAULT_LEADERBOARD = [
  { name: "ZenMaster_01", score: 9420, avatar: PLACEHOLDER_AVATAR },
  { name: "CodingWizard", score: 8150, avatar: PLACEHOLDER_AVATAR },
  { name: "LogicLover", score: 7900, avatar: PLACEHOLDER_AVATAR },
  { name: "WebDevPro", score: 6500, avatar: PLACEHOLDER_AVATAR },
];

const GameRunner = ({ gameConfig, GameComponent }) => {
  const t = useTranslations("games");
  const [round, setRound] = useLocalStorage("round", 1);
  const [score, setScore] = useLocalStorage("score", 0);
  const [isPaused, setIsPaused] = useState(false);

  // Synchronize score and round if the game component updates them in local storage
  // Note: useLocalStorage already handles this if the same key is used elsewhere, 
  // but we might need to force a refresh if the game doesn't use the hook.

  const handleReset = () => {
    // We can't easily reset the board from here unless the game component exposes a ref
    // For now, we'll just reload or hope the game has its own reset button
    window.location.reload();
  };

  return (
    <GamePlayLayout
      title={gameConfig.title}
      gameTitle={gameConfig.gameTitle}
      currentScore={score}
      round={round}
      totalRounds={5} // standard for now
      personalBest={gameConfig.personalBest || 0}
      globalRank={gameConfig.globalRank || "Unranked"}
      rules={gameConfig.rules}
      tip={gameConfig.tip}
      leaderboard={DEFAULT_LEADERBOARD}
      onReset={handleReset}
      onPause={() => setIsPaused(true)}
      onResume={() => setIsPaused(false)}
      isPaused={isPaused}
    >
      <div className={isPaused ? "opacity-20 pointer-events-none grayscale transition-all duration-300" : "transition-all duration-300"}>
        <GameComponent />
      </div>

      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-md p-8 rounded-4xl shadow-2xl text-center">
            <h3 className="text-2xl font-black text-slate-800 mb-4">{t("gamePaused")}</h3>
            <button
              onClick={() => setIsPaused(false)}
              className="px-8 py-3 bg-cyan-400 text-white font-bold rounded-xl shadow-lg hover:bg-cyan-500 transition-all"
            >
              {t("resumePlay")}
            </button>
          </div>
        </div>
      )}
    </GamePlayLayout>
  );
};

export default GameRunner;
