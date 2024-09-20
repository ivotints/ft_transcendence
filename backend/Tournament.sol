// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract TournamentScores {
    mapping (uint16 => uint16[]) private tournaments;

    function addTournament(uint16 _tournamentID, uint16[] memory _userIDs) public {
        require(tournaments[_tournamentID].length == 0, "Tournament already exists");
        require(_userIDs.length  == 4, "Must provide exactly 4 user IDs");
        tournaments[_tournamentID] = _userIDs;
    }

    function viewTournament(uint16 _tournamentID) public view returns (uint16[] memory) {
        return tournaments[_tournamentID];
    }
}