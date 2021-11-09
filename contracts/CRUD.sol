pragma solidity ^0.8.0;

contract CRUD {
  struct User {
    uint id;
    string name;
  }
  User[] public users;
  uint public nextId = 1;

  function create(string memory _name) public {
    User memory user = User({
      id: nextId,
      name: _name
    });
    users.push(user);
    nextId++;
  }

  function read(uint _id) public view returns (uint, string memory) {
    uint id = find(_id);
    return (users[id].id, users[id].name);
  }

  function update(uint _id, string memory _name) public {
    uint id = find(_id);
    users[id].name = _name;
  }

  function destroy(uint _id) public {
    uint id = find(_id);
    delete users[id];
  }

  function find(uint _id) internal view returns(uint) {
    for (uint i = 0; i < users.length; i++) {
      if (users[i].id == _id) {
        return i;
      }
    }
    revert("User not found");
  }
}