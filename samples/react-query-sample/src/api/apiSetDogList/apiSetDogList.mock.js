module.exports = function setDogList(list) {
  return {
    list: (list || []).slice(),
    updated: new Date(),
  };
};
