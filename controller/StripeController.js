import dotenv from "dotenv";
import reply from "../helper/reply.js";
import Stripe from "stripe";

dotenv.config();
const secret_key = process.env.STRIPE_SECRET_KEY;
const stripe = Stripe(secret_key);

export default {
  async createPayment(req, res) {
    try {
      let request = req.body;
      let customer = await stripe.customers.create({
        email: request.email,
      });

      const token = await stripe.tokens.create({
        card: {
          number: request.card_number,
          exp_month: request.expire_month,
          exp_year: request.expire_year,
          cvc: request.cvc,
        },
      });

      let card = await stripe.customers.createSource(customer.id, {
        source: token.id,
      });

      if (req.session.users?.role == 1) {
        const token = await stripe.tokens.create({
          card: {
            number: request.card_number,
            exp_month: request.expire_month,
            exp_year: request.expire_year,
            cvc: request.cvc,
          },
        });
        // console.log(request)
        const paymentIntent = await stripe.paymentIntents.create({
          amount: request.total_price * 100,
          currency: "usd",
          payment_method_types: ["card"],
          transfer_data: {
            destination: request.account_id,
          },
          payment_method_data: {
            type: "card",
            card: {
              token: token.id, // replace with a test token
            },
            billing_details: {
              name: "rakesh pathania",
              email: "rakesh@yopmail.com",
              address: {
                line1: "3430 Wood Duck Drive",
                city: "Rapid River",
                state: "Michigan",
                postal_code: "49878",
                country: "US",
              },
            },
          },
          description: "Your Payment Done For Lessons",
        });

        const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
          paymentIntent.id
        );
        return res.json(reply.success("Payment Done Successfully"));
      } else {
        let charge = await stripe.charges.create({
          amount: request.total_price * 100,
          currency: "usd",
          customer: customer.id,
          source: card.id,
          description: "PlayersWanted",
        });
        return res.json(reply.success("Payment Done Successfully"));
      }
    } catch (err) {
      console.log(err);
      switch (err.type) {
        case "StripeCardError":
          return res.json(reply.failed(`${err.message}`));
        case "StripeInvalidRequestError":
          return res.json(reply.failed(`An invalid request occurred.`));
        default:
          return res.json(reply.failed(`An invalid request occurred.`));
      }
    }
  },
};
