import { useApp } from './app';

export function useLeaderboardButton() {
  const { toggleLeaderboard } = useApp();

  const openLeaderboard = () => {
    toggleLeaderboard();
  };

  return {
    openLeaderboard
  };
}
