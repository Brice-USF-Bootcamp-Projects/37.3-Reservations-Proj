/** Routes for Lunchly */

const express = require("express");

const Customer = require("./models/customer");
const Reservation = require("./models/reservation");

const router = new express.Router();

/** Homepage: show list of customers. */

router.get("/", async function(req, res, next) {
  try {
    const customers = await Customer.all();
    return res.render("customer_list.html", { customers });
  } catch (err) {
    return next(err);
  }
});

/** Form to add a new customer. */

router.get("/add/", async function(req, res, next) {
  try {
    return res.render("customer_new_form.html");
  } catch (err) {
    return next(err);
  }
});

/** Handle adding a new customer. */

router.post("/add/", async function(req, res, next) {
  try {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phone = req.body.phone;
    const notes = req.body.notes;

    const customer = new Customer({ firstName, lastName, phone, notes });
    await customer.save();

    return res.redirect(`/${customer.id}/`);
  } catch (err) {
    return next(err);
  }
});

/** Show a customer, given their ID. */

router.get("/:id/", async function(req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);

    const reservations = await customer.getReservations();

    return res.render("customer_detail.html", { customer, reservations });
  } catch (err) {
    return next(err);
  }
});

/** Show form to edit a customer. */

router.get("/:id/edit/", async function(req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);

    res.render("customer_edit_form.html", { customer });
  } catch (err) {
    return next(err);
  }
});

/** Handle editing a customer. */

router.post("/:id/edit/", async function(req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);
    customer.firstName = req.body.firstName;
    customer.lastName = req.body.lastName;
    customer.phone = req.body.phone;
    customer.notes = req.body.notes;
    await customer.save();

    return res.redirect(`/${customer.id}/`);
  } catch (err) {
    return next(err);
  }
});

/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function (req, res, next) {
  try {
    const customerId = req.params.id;
    const startAt = new Date(req.body.startAt);
    const numGuests = parseInt(req.body.numGuests, 10);
    const notes = req.body.notes || null;

    // Create a new Reservation instance
    const newReservation = new Reservation({
      customerId,
      startAt,
      numGuests,
      notes,
    });

    // Save the reservation to the database
    await newReservation.save();

    // Redirect to the customer details page
    return res.redirect(`/${customerId}/`);
  } catch (err) {
    console.error("Error saving reservation:", err);
    return next(err); // Pass error to middleware
  }
});




// add flash message after the reservation
// router.post("/reservations", async (req, res, next) => {
//   try {
//     const newReservation = new Reservation({
//       customerId: req.body.customerId,
//       numGuests: req.body.numGuests,
//       startAt: new Date(req.body.startAt),
//       notes: req.body.notes || null,
//     });

//     await newReservation.save();

//     // Set a success flash message
//     req.flash("success", "Reservation created successfully!");

//     // Redirect to the customer details page
//     res.redirect(`/customers/${newReservation.customerId}`);
//   } catch (err) {
//     // Set an error flash message
//     req.flash("error", "Failed to create reservation. Please try again.");
//     res.redirect("back"); // Redirect back to the form
//   }
// });

module.exports = router;
