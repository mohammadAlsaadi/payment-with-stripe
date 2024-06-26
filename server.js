require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const stripe = require("stripe")(
  "sk_test_51Os50kJqsiz40vSavvT1EAtKvwMYpkPe1pIryxHWjw7GXYGx0x6B9PJMJqMbU11NufjXkblg0ckLz0ReLzxoffbF00DM3BENbM"
);

app.use(express.static("public"));
app.use(express.json());
app.use(cors({ origin: "https://red-zone-nutrition.vercel.app" }));

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

    // Add shipping
    if (totalPrice < 70) {
      lineItems.push({
        price_data: {
          currency: "jod",
          product_data: {
            name: "Shipping",
          },
          unit_amount: 3000, // shipping cost is 3 JOD
        },
        quantity: 1,
      });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: lineItems,
      success_url: `https://red-zone-nutrition.vercel.app/success-payment`,
      cancel_url: `https://red-zone-nutrition.vercel.app/checkout`,
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
