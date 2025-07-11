import connection from "../data/jw_db.js";

const index = (req, res, next) => {
  const sql = `
    SELECT * FROM product`;

  connection.query(sql, (err, productsResults) => {
    if (err) return next(err);
    const products = productsResults.map((curProduct) => {
      return {
        ...curProduct,
        image_url: `${req.protocol}://${req.get("host")}/img/${curProduct.slug}.png`,
      };
    });
    res.status(200).json(products);
  });
};

const show = (req, res, next) => {
  const { slug } = req.params;
  const sql = `
    SELECT *
    FROM product
    WHERE slug = ?
    `;

  connection.query(sql, [slug], (err, productResults) => {
    if (err) return next(err);
    if (productResults.length === 0)
      return res.status(404).json({
        message: "Prodotto Non Trovato",
      });

    const product = {
      ...productResults[0],
      image_url: `${req.protocol}://${req.get("host")}/img/${productResults[0].slug}.png`,
    };

    res.status(200).json(product);
  });
};

export default { index, show };
