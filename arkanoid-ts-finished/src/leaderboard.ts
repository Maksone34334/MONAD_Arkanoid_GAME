// Import ethers.js for blockchain interaction
import { ethers } from 'ethers';
import { leaderboardContract } from '../../lib/contract';

// Function to submit score to the leaderboard
export async function submitScoreToLeaderboard(score: number): Promise<boolean> {
  try {
    // Check if window.ethereum is available (MetaMask or other wallet)
    if (typeof window.ethereum !== 'undefined') {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create a provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Get the signer
      const signer = provider.getSigner();
      
      // Create contract instance
      const contract = new ethers.Contract(
        leaderboardContract.address,
        leaderboardContract.abi,
        signer
      );
      
      // Submit score to the contract
      const tx = await contract.submitScore(score);
      
      // Wait for transaction to be mined
      await tx.wait();
      
      console.log('Score submitted successfully!');
      return true;
    } else {
      console.error('Ethereum wallet not found. Please install MetaMask or another wallet.');
      alert('Ethereum wallet not found. Please install MetaMask to save your score.');
      return false;
    }
  } catch (error) {
    console.error('Error submitting score:', error);
    alert('Failed to submit score to the leaderboard. Please try again.');
    return false;
  }
}

// Function to get top scores from the leaderboard
export async function getTopScores(limit: number = 10): Promise<Array<{address: string, score: number}>> {
  try {
    if (typeof window.ethereum !== 'undefined') {
      // Create a provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Create contract instance (read-only)
      const contract = new ethers.Contract(
        leaderboardContract.address,
        leaderboardContract.abi,
        provider
      );
      
      // Get total number of scores
      const totalScores = await contract.totalScores();
      
      // Get scores (up to the limit)
      const scores: Array<{address: string, score: number}> = [];
      const count = Math.min(Number(totalScores), limit);
      
      for (let i = 0; i < count; i++) {
        const [player, score] = await contract.getScore(i);
        scores.push({
          address: player,
          score: Number(score)
        });
      }
      
      // Sort scores in descending order
      return scores.sort((a, b) => b.score - a.score);
    } else {
      console.error('Ethereum wallet not found.');
      return [];
    }
  } catch (error) {
    console.error('Error getting scores:', error);
    return [];
  }
}

// Add this to the global Window interface
declare global {
  interface Window {
    ethereum: any;
  }
}