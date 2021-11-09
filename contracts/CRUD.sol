pragma solidity ^0.8.0;

contract CRUD {
    struct User {
        uint256 id;
        string name;
    }
    User[] public users;
    uint256 public nextId = 1;

    function create(string memory _name) public {
        User memory user = User({id: nextId, name: _name});
        users.push(user);
        nextId++;
    }

    function read(uint256 _id) public view returns (uint256, string memory) {
        uint256 id = find(_id);
        return (users[id].id, users[id].name);
    }

    function update(uint256 _id, string memory _name) public {
        uint256 id = find(_id);
        users[id].name = _name;
    }

    function destroy(uint256 _id) public {
        uint256 id = find(_id);
        delete users[id];
    }

    function find(uint256 _id) internal view returns (uint256) {
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i].id == _id) {
                return i;
            }
        }
        revert("User not found");
    }
}
