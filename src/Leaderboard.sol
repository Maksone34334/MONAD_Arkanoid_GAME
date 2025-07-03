// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Leaderboard {
    struct Score {
        address player;
        uint256 score;
    }

    Score[] public scores;

    function submitScore(uint256 _score) public {
        scores.push(Score(msg.sender, _score));
    }

    function totalScores() public view returns (uint256) {
        return scores.length;
    }

    function getScore(uint256 index) public view returns (address player, uint256 score) {
        Score memory s = scores[index];
        return (s.player, s.score);
    }
}
