class UserDTO {
  // TODO: Implementar el authUser
  single = (resource, authUser) => ({
    id: resource._id,
    name: {
      first: resource.name.first,
      last: resource.name.last,
    },
    fullname: `${resource.name.first} ${resource.name.last}`,
    gender: resource?.gender,
    email: resource?.email,
    active: resource?.active,
    role: resource?.role,
  });

  multiple = (resources, authUser) =>
    resources.map((resource) => this.single(resource, authUser));
}

module.exports = UserDTO;
