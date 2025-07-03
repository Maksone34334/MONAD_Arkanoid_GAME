// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Leaderboard {
    struct Score {
        address player;
        uint256 score;
    }

    Score[] public scores;

    /// @notice Записывает очко игрока
    function submitScore(uint256 _score) external {
        scores.push(Score(msg.sender, _score));
    }

    /// @notice Личный максимальный результат игрока
    function highScores(address player) external view returns (uint256 max) {
        for (uint256 i; i < scores.length; ++i) {
            if (scores[i].player == player && scores[i].score > max) {
                max = scores[i].score;
            }
        }
    }

    /// @notice Возврат произвольной записи (для отладки)
    function getScore(uint256 index) external view returns (address, uint256) {
        Score memory s = scores[index];
        return (s.player, s.score);
    }

    /// @notice Общее кол-во результатов
    function totalScores() external view returns (uint256) {
        return scores.length;
    }
}
