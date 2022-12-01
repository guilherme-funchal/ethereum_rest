pragma solidity ^0.8.17;

// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "hardhat/console.sol";

contract CarbonoNeutroSerproERC1155 is ERC1155, ERC1155Burnable, Ownable, ERC1155Supply {
    struct Project {
        uint id;
        address projectOwner;
        address projectCreator;
        address projectApprover;
        string name;
        string description;
        string documentation;
        string hash_documentation;
        string state;
        string area;
        string creditAssigned;
        string creationDate;
        string retired;
        string updateDate;
    }
    
       mapping(uint => Project) private projects;
       uint[] private projectIds;
       uint private projectIdCounter = 0;

    constructor() ERC1155("") {
    }    

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function burn_carbono(address account, uint256 id, uint256 value)
        public
        onlyOwner
    {
       _burn(account, id, value);
    }


    function setProject(
        address _projectOwner,
        address _projectCreator,
        address _projectApprover,
        string memory _name, 
        string memory _description, 
        string memory _documentation,
        string memory _hash_documentation, 
        string memory _state, 
        string memory _area, 
        string memory _creditAssigned, 
        string memory _creationDate, 
        string memory _retired, 
        string memory _updateDate) public {
        
        projectIdCounter++;
        Project memory newProject = Project({
            id: projectIdCounter,
            projectOwner: _projectOwner,
            projectCreator: _projectCreator,
            projectApprover: _projectApprover,
            name: _name,
            description: _description,
            documentation: _documentation,
            hash_documentation: _hash_documentation,
            state: _state,
            area: _area,
            creditAssigned: _creditAssigned,
            creationDate: _creationDate, 
            retired: _retired, 
            updateDate: _updateDate
        });

        projectIds.push(newProject.id);
        projects[newProject.id] = newProject;
        
    }

    function getProjectById(uint id) public view returns(
        uint, string memory, address, address, address, string memory, string memory, string memory, string memory, string memory, string memory, string memory, string memory, string memory) {
        Project memory project = projects[id];
        return (
            project.id,
            project.name,
            project.projectOwner,
            project.projectCreator,
            project.projectApprover,
            project.description,
            project.documentation,
            project.hash_documentation,
            project.state,
            project.area,
            project.creditAssigned,
            project.creationDate,
            project.retired,
            project.updateDate
        );
    }

    function updateProject(
        uint id,
        string memory _name, 
        address _projectOwner,
        address _projectCreator,
        address _projectApprover, 
        string memory _description, 
        string memory _documentation,
        string memory _hash_documentation, 
        string memory _state, 
        string memory _area, 
        string memory _creditAssigned, 
        string memory _creationDate, 
        string memory _retired,
        string memory _updateDate) public  {

        Project storage targetProject = projects[id];

        targetProject.name = _name;
        targetProject.projectOwner = _projectOwner;
        targetProject.projectCreator = _projectCreator;
        targetProject.projectApprover = _projectApprover;
        targetProject.description = _description;
        targetProject.documentation = _documentation;
        targetProject.hash_documentation = _hash_documentation;
        targetProject.state= _state;
        targetProject.area= _area;
        targetProject.creditAssigned= _creditAssigned;
        targetProject.creationDate = _creationDate;
        targetProject.retired = _retired;
        targetProject.updateDate = _updateDate;       
    }

    function deleteProject(uint256 id) public {
        delete projects[id];
    }

    function getProjectsLength() public view returns(uint) {
        return projectIds.length;
    }

     function getProjectList() public view returns(uint[] memory) {
        return projectIds;
    }

    function transferirValores(address _from, address _to, uint _id, uint256 _amount) external {
    // MUST emit event
    //  safeTransferFrom(_from, _to, _id, _amount, _data);
        address operator = _msgSender();
        emit TransferSingle(operator, _from, _to, _id, _amount);
    }

}    
