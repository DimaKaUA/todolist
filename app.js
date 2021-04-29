//jshint esversion:6
require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const models = require(__dirname + "/mongoDbUtils/models.js")(mongoose);
const utils = require(__dirname + "/mongoDbUtils/utilMethods.js");

const app = express();

app.use(express.urlencoded({
  extended: true
}));

app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");

mongoose.connect(process.env.MDB_CONN_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

app.get('/', function(req, res) {

  models.Item.find({}, function(err, items) {
    if (err) {
      console.log(err);
    } else {
      if (items.length === 0) {
        models.Item.insertMany(utils.getDefaultItems(models), function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Inserted 3 defaultItems.");
          }
          res.redirect("/");
        });
      } else {
        renderListPage("Today", items, res);
      }
    }
  });
});

app.get('/:customListName', function(req, res) {

  const customListName = _.capitalize(req.params.customListName);

  models.List.findOne({ name: customListName }, function(err, foundList){
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      if (foundList) {
        renderListPage(foundList.name, foundList.items, res);
      } else {
        res.redirect("/");
      }
    }
  })
});

function renderListPage(listName, listItems, res) {
  models.List.find({}, 'name', function(err, lists) {
    if (err) {
      console.log(err);
    }
    const listNames = [];
    if (lists.length !== 0) {
      lists.forEach(list => {
        listNames.push(list.name);
      });
    }
    res.render("list", {
      listTitle: listName,
      itemList: listItems,
      listNames: listNames
    });
  });
}

app.post('/', function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.listName;

  const newItem = new models.Item({
    name: itemName
  });

  if (listName === "Today") {
    newItem.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log(`Inserted new item \"${newItem.name}\" to Today list`);
      }
      res.redirect("/");
    });
  } else {
    models.List.findOne({ name: listName}, function(err, foundList) {
      foundList.items.push(newItem);
      foundList.save(function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log(`Inserted new item \"${newItem.name}\" to ${listName} list.`);
        }
        res.redirect("/" + listName);
      });
    });
  }
});

app.post('/list/new', function(req, res) {

  const customListName = _.capitalize(req.body.newListName);

  const list = new models.List({
    name: customListName,
    items: utils.getDefaultItems(models),
  });

  list.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Created new list named " + customListName);
    }
    res.redirect("/" + customListName);
  });
});

app.post('/item/delete', function(req, res) {

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    models.Item.findByIdAndDelete(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Item deleted");
      }
      res.redirect("/");
    });
  } else {
    models.List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function(err, foundList) {
      if (err) {
        console.log(err);
      }
      res.redirect("/" + listName);
    });
  }
});

app.post('/list/delete', function(req, res) {

  const listName = req.body.listName;

  models.List.deleteOne({ name: listName }, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log(`List "${listName}" deleted`);
    }
    res.redirect("/");
  });
});

app.listen(process.env.PORT, function() {

  console.log("Server is running on port: " + process.env.PORT);

  // If the Node process ends, close the Mongoose connection
  process.on("SIGINT", function() {
    mongoose.connection.close(function () {
      console.log("Mongoose disconnected on app termination");
      process.exit(0);
    });
  });
});
