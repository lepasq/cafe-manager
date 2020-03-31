const express = require("express");
const menusRouter = express.Router();
const menuItemsRouter = require("./menuItems.js");

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

menusRouter.param("menuId", (req, res, next, menuId) => {
  db.get(`SELECT * FROM Menu WHERE Menu.id = ${menuId}`, (err, menu) => {
    if (err) {
      next(err);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menusRouter.use("/:menuId/menu-items", menuItemsRouter);

menusRouter.get(":menuId", (req, res, next) => {
  res.status(200).json({ menu: req.menu });
});

menusRouter.put("/:menuId", (req, res, next) => {
  const title = req.body.menu.title;
  if (title) {
    db.run(
      `UPDATE Menu SET title = ${title} WHERE Menu.id = ${req.params.menuId}`,
      (err, menu) => {
        if (err) {
          next(err);
        } else {
          db.get(
            `SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
            (err, next) => {
              res.status(200).json({ menu: menu });
            }
          );
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
});

menusRouter.delete("/:menuId", (req, res, next) => {
  const sql = `SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${req.params.menuId}`;
  db.get(sql, (err, menuItem) => {
    if (err) {
      next(err);
    } else if (menuItem) {
      // If the menu has menuitems it should not be deleted
      return res.sendStatus(400);
    } else {
      const sql = `DELETE FROM Menu WHERE Menu.id = ${req.params.menuId}`;
      db.run(sql, err => {
        if (err) {
          next(err);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});

menusRouter.get("/", (req, res, next) => {
  db.all("SELECT * FROM Menu", (err, menus) => {
    if (err) {
      next(err);
    } else {
      return res.status(200).json({ menus: menus });
    }
  });
});

menusRouter.post("/", (req, res, next) => {
  const title = req.body.menu.title;
  if (title) {
    db.run(`INSERT INTO Menu(title) VALUES (${title}`, err => {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM Menu WHERE Menu.id = ${this.lastId}`,
          (err, menu) => {
            res.status(201).json({ menu: menu });
          }
        );
      }
    });
  } else {
    return res.sendStatus(400);
  }
});
