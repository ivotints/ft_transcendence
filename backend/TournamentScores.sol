// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract Ownable {   
	address private _owner;    
	event OwnershipTransferred(     
		address indexed previousOwner,     
		address indexed newOwner   
	);    
	
	/**    
			* @dev The Ownable constructor sets the original `owner` of 
			* thecontract to the sender
			* account.    
	*/   
	constructor() {
		_owner = msg.sender;
		emit OwnershipTransferred(address(0), _owner);   
		}
		    
	/**  
		* @return the address of the owner.
		* */   
	function owner() public view returns(address) {     
		return _owner;   
	}    
	
	/**    
	* @dev Throws if called by any account other than the owner.    
	* */   
	modifier onlyOwner() {     
		require(isOwner());     
		_;   
	}    
	
	/**    
	* @return true if `msg.sender` is the owner of the contract.    
	* */   
	function isOwner() public view returns(bool) {     
		return msg.sender == _owner;   
	}    
	
	/**    
	* @dev Allows the current owner to relinquish control of the contract.    
	* @notice Renouncing to ownership will leave the contract without an owner.     * It will not be possible to call the functions with the `onlyOwner`    
	* modifier anymore.    
	* */   
	function renounceOwnership() public onlyOwner {     
		emit OwnershipTransferred(_owner, address(0));     
		_owner = address(0);   
	}    
	
	/**    
	* @dev Allows the current owner to transfer control of the contract to a 
	* newOwner.
	* @param newOwner The address to transfer ownership to.    
	* */   
	function transferOwnership(address newOwner) public onlyOwner { 
		_transferOwnership(newOwner);   
	}    
	
	/**    
	* @dev Transfers control of the contract to a newOwner.    
	* @param newOwner The address to transfer ownership to.    
	* */   
	function _transferOwnership(address newOwner) internal {     
		require(newOwner != address(0));     
		emit OwnershipTransferred(_owner, newOwner);     
		_owner = newOwner;   
	}
}


/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
 */
contract TournamentScores is Ownable{
    mapping (uint16 => string[]) private tournaments;

    function addTournament(uint16 _tournamentID, string[] memory _user_names) public onlyOwner{
        require(tournaments[_tournamentID].length == 0, "Tournament already exists");
        require(_user_names.length  == 4, "Must provide exactly 4 user IDs");
        tournaments[_tournamentID] = _user_names;
    }

    function viewTournament(uint16 _tournamentID) public view returns (string[] memory) {
        require(tournaments[_tournamentID].length > 0, "Tournament does not exist");
        return tournaments[_tournamentID];
    }
}