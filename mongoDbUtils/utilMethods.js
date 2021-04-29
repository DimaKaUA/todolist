module.exports.getDefaultItems = function(models) {

  const item1 = new models.Item({
    name: "Welcome!"
  });

  const item2 = new models.Item({
    name: "Hit the + button to aff a new item."
  });

  const item3 = new models.Item({
    name: "<-- Hit this to delete an item."
  });

  return [item1, item2, item3];
}
