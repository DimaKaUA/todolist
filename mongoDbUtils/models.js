module.exports = function(mongoose) {

  const itemSchema = {
    name: {
      type: String,
      required: true
    }
  }

  const listSchema = {
    name: {
      type: String,
      required: true
    },
    items: [itemSchema]
  }

  var models = {
    Item: mongoose.model("Item", itemSchema),
    List: mongoose.model("List", listSchema)
  }

  return models;
}
