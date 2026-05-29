import React, { createContext, useContext } from 'react';

const GameContext = createContext();

export function GameProvider({ value, children }) {
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  return useContext(GameContext);
}
