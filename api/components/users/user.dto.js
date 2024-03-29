class UserDTO {

  constructor({ features }) {
    this.ucwords = features.ucWords;
  }
  
  getCompleteURLAvatar = (avatar) => (avatar.startsWith('http')) 
    ? avatar 
    : `${process.env.PATH_STATIC_FILES}${avatar}`;

  single = (resource) => ({
    id: resource._id,
    name: {
      first: this.ucwords(resource.name.first),
      last: this.ucwords(resource.name.last),
    },
    fullname: `${resource.name.first} ${resource.name.last}`,
    gender: resource?.gender,
    email: resource?.email,
    active: resource?.active,
    blocked: resource?.blocked,
    roles: resource?.roles,
    avatar: this.getCompleteURLAvatar(resource?.avatar)
  });

  multiple = (resources) => {
    return resources.map((resource) => this.single(resource));
  };
}

module.exports = UserDTO;
