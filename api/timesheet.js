const express = require("express");
const timesheetsRouter = express.Router({ mergeParams: true });

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

timesheetsRouter.param("timesheetId", (req, res, next, timesheetId) => {
  const sql = `SELECT * FROM Timesheet WHERE Timesheet.id = ${timesheetId}`;
  db.get(sql, (err, timesheet) => {
    if (err) {
      next(err);
    } else if (timesheet) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

// Get all timesheets
timesheetsRouter.get("/", (req, res, next) => {
  const sql = `SELECT * FROM Timesheet WHERE Timesheet.employee_id = ${req.params.employeeId}`;
  db.all(sql, (err, timesheets) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ timesheets: timesheets });
    }
  });
});

// Insert new timesheet
timesheetsRouter.post("/", (req, res, next) => {
  const hours = req.body.timesheet.hours,
    rate = req.body.timesheet.rate,
    date = req.body.timesheet.date,
    employeeId = req.params.employeeId;
  if (rate && date && hours) {
    const sql =
      "INSERT INTO Timesheet (hours, rate, date, employee_id)" +
      "VALUES ($hours, $rate, $date, $employeeId)";
    const values = {
      $hours: hours,
      $rate: rate,
      $date: date,
      $employeeId: employeeId
    };
    db.run(sql, values, function(err) {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
          (err, timesheet) => {
            res.status(201).json({ timesheet: timesheet });
          }
        );
      }
    });
  } else {
    return res.sendStatus(400);
  }
});

// Update given timesheet
timesheetsRouter.put("/:timesheetId", (req, res, next) => {
  const hours = req.body.timesheet.hours,
    rate = req.body.timesheet.rate,
    date = req.body.timesheet.date,
    employeeId = req.params.employeeId;

  if (hours && rate && date) {
    const sql =
    "UPDATE Timesheet SET hours = $hours, rate = $rate, " +
    "date = $date, employee_id = $employeeId WHERE Timesheet.id = $timesheetId";
  const values = {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: employeeId,
    $timesheetId: req.params.timesheetId
  };
    db.run(sql, values, (err) => {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
          (err, timesheet) => {
            res.status(200).json({ timesheet: timesheet });
          }
        );
      }
    });
  } else {
    res.sendStatus(400);
  }
});

// Delete given timesheet
timesheetsRouter.delete("/:timesheetId", (req, res, next) => {
  const sql = `DELETE FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`;
  db.run(sql, error => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = timesheetsRouter;
