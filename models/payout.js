const mongoose = require("mongoose");
const payoutSchema = new mongoose.Schema({

  //   method: {
  //   type: String,
  //   required: true,
  //   enum: ["paypal", "bank", "crypto"],
  //   default:"paypal"
  // },
  email: {
    type: String,
    required: function() { return this.method === "paypal"; }
  },
  accountNumber: {
    type: String,
    required: function() { return this.method === "bank"; }
  },
  routingNumber: {
    type: String,
    required: function() { return this.method === "bank"; }
  },
  walletAddress: {
    type: String,
    required: function() { return this.method === "crypto"; }
  },
  //  threshold: {
  //   type: Number,
  //   required: true,
  //   default: 50
  // },
  // currency: {
  // type: String,
  // required: true,
  // default: "USD",
  // enum: ["USD", "EUR", "GBP", "BTC", "ETH", "NAIRA"]
  // },
  // schedule: {
  // type: String,
  // required: true,
  // default: "weekly",
  // enum: ["weekly", "daily", "bi-weekly", "monthly"]
  // }
});

module.exports = mongoose.model("Payout", payoutSchema);