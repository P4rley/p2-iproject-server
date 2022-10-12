const axios = require("axios");
const { News, User } = require("../models");
const midtransClient = require("midtrans-client");

class NewsController {
  static async getTopHeadlinesNews(req, res, next) {
    try {
      const { country, category } = req.query;

      const { data } = await axios({
        method: "get",
        url: "https://newsapi.org/v2/top-headlines",
        params: {
          country,
          apiKey: "00a0bec52a3b49978784f968d4342653",
          category,
        },
      });

      await res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getNewsSources(req, res, next) {
    try {
      const { country } = req.query;

      const { data } = await axios({
        url: "https://newsapi.org/v2/top-headlines/sources",
        method: "get",
        params: {
          country,
          apiKey: "00a0bec52a3b49978784f968d4342653",
        },
      });

      await res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async midtrans(req, res, next) {
    // Create Snap API instance
    const user = await User.findByPk(req.user.id);
    const { orderId } = req.query;

    if (!user) {
      throw { name: "invalid_token" };
    }

    let snap = new midtransClient.Snap({
      // Set to true if you want Production Environment (accept real transaction).
      isProduction: false,
      serverKey: "SB-Mid-server-ocSqyIyZrV22NwlKhRJSxQtQ",
    });

    let parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: 100000,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        email: user.email,
        phone: "08111222333",
      },
    };

    snap.createTransaction(parameter).then((transaction) => {
      // transaction token
      let transactionToken = transaction.token;
      res.status(200).json({ transactionToken });
    });
  }

  static async updateStatus(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id);

      if (!user) {
        throw { name: "invalid_token" };
      }

      await User.update(
        { status: "subscriber" },
        { where: { id: req.user.id } }
      );

      res.status(200).json(user.status);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NewsController;
