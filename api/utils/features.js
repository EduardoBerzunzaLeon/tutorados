module.exports = (element) => element?.replace(/(?<= )[^\s]|^./g, a=>a.toUpperCase());
