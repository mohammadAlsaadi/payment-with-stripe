require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

app.use(express.static("public"));
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

app.post("/create-checkout-session", async (req, res) => {
  const { items, discount } = req.body;

  // Calculate total price of items
  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.count,
    0
  );
  try {
    const lineItems = items.map((item) => {
      let unitAmount = item.price * 1000; // Default unit amount without discount
      if (discount > 0) {
        // Apply discount if discount value is greater than 0
        unitAmount *= (100 - 15) / 100; // Apply 15% discount
      }
      return {
        price_data: {
          currency: "jod",
          product_data: {
            name: discount > 0 ? `${item.name} - after discount` : item.name,
          },
          unit_amount: discount > 0 ? unitAmount : item.price * 1000,
        },
        quantity: item.count,
      };
    });

    // Add shipping line item to the lineItems array
    if (totalPrice < 70) {
      lineItems.push({
        price_data: {
          currency: "jod",
          product_data: {
            name: "Shipping",
          },
          unit_amount: 3000, // Assuming shipping cost is 3 JOD
        },
        quantity: 1,
      });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: lineItems, // Use the lineItems array when creating the session
      success_url: `${process.env.CLIENT_URL}/success-payment`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

/*
require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

app.use(express.static("public"));
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

const storeItems = new Map([
  [1, { priceInCents: 10000, name: "Whey Protein" }],
  [2, { priceInCents: 20000, name: "Iso Protein" }],
]);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: item.quantity,
        };
        //   price_data: {
        //     currency: "JOD", // Change to JD
        //     product_data: {
        //       name: "Total Price",
        //     },
        //     unit_amount: totalPrice * 100,
        //   },
        //   quantity: 1,
        // };
      }),
      success_url: `${process.env.CLIENT_URL}/success-payment`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

*/
