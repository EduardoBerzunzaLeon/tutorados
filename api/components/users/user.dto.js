class UserDTO {
  // TODO: Implementar el authUser
  single = (resource, authUser) => ({
    id: resource._id,
    username: resource.username,
    email: resource.email,
  });

  multiple = (resources, authUser) =>
    resources.map((resource) => this.single(resource, authUser));
}

module.exports = UserDTO;
