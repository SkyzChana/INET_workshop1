var express = require("express");
var router = express.Router();

var productModel = require("../models/product.model");
var orderModel = require("../models/order.model");

const { isAdmin, verifyToken } = require("../middleware/token.middleware");

// get all products
router.get("/", verifyToken, async function (req, res, next) {
  try {
    let product = await productModel.find();
    return res.status(200).send({
      status: "200",
      message: "get product success.",
      data: product,
    });
  } catch (error) {
    res.status(500).send({
      status: "500",
      message: error,
      data: null,
    });
  }
});

// add product
router.post("/", verifyToken, isAdmin, async function (req, res, next) {
  try {
    let { name, price, count } = req.body;
    let product = await new productModel({ name, price, count });
    await product.save();
    return res.status(201).send({
      status: "201",
      message: "add product success",
      data: {
        name: name,
        price: price,
        count: count,
      },
    });
  } catch (error) {
    return res.status(500).send({
      status: "500",
      message: error,
      data: null,
    });
  }
});

// get product by id
router.get("/:id", verifyToken, async function (req, res, next) {
  try {
    let { id } = req.params;
    let product = await productModel.findById(id);
    if (!product) {
      return res.status(200).send({
        status: "200",
        message: "product not found.",
        data: [],
      });
    }
    return res.status(200).send({
      status: "200",
      message: "get product by id success.",
      data: product,
    });
  } catch (error) {
    res.status(500).send({
      status: "500",
      message: error,
    });
  }
});

// edit product
router.put("/:id", verifyToken, isAdmin, async function (req, res, next) {
  try {
    let { id } = req.params;
    let { name, price, count } = req.body;
    let product = await productModel.findByIdAndUpdate(
      id,
      { name, price, count },
      { new: true },
    );
    return res.status(200).send({
      status: "200",
      message: `edit ${name} success.`,
      data: product,
    });
  } catch (error) {
    res.status(500).send({
      status: "500",
      message: error,
    });
  }
});

// delete product
router.delete("/:id", verifyToken, isAdmin, async function (req, res, next) {
  try {
    let { id } = req.params;
    let product = await productModel.findByIdAndDelete(id);
    let dataP = product.name;
    return res.status(200).send({
      status: "200",
      message: `Delete ${dataP} success.`,
      data: product,
    });
  } catch (error) {
    res.status(500).send({
      status: "500",
      message: error,
    });
  }
});

// show order by product id
router.get("/:id/orders", verifyToken, async function (req, res, next) {
  try {
    let { id } = req.params;
    let order = await orderModel.find({ productID: id });
    return res.status(200).send({
      status: "200",
      message: "show order by product id.",
      data: order,
    });
  } catch (error) {
    res.status(500).send({
      status: "500",
      message: error,
    });
  }
});

// add product to order
router.post("/:id/orders", verifyToken, async function (req, res, next) {
  try {
    const product_id = req.params.id;
    const { count } = req.body;

    if (!count || count <= 0) {
      return res.status(400).send({
        status: "400",
        message: "invalid item count.",
        data: null,
      });
    }

    let productData = await productModel.findById(product_id);
    if (!productData) {
      return res.status(400).send({
        status: "400",
        message: "product not found.",
        data: null,
      });
    }

    if (productData.count < count) {
      return res.status(400).send({
        status: "400",
        message: `not enough product, product have ${productData.count}, product needed ${count}`,
        data: null,
      });
    }

    productData.count -= count;
    await productData.save();

    let userID = req.user.id;
    let order = new orderModel({
      userID: userID,
      productID: product_id,
      count: count,
    });
    await order.save();

    return res.status(201).send({
      status: "201",
      message: "add order success.",
      data: order,
    });
  } catch (error) {
    return res.status(500).send({
      status: "500",
      message: error,
    });
  }
});

module.exports = router;
