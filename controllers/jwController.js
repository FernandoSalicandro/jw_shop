import connection from "../data/jw_db.js";

const index = (req, res, next) => {
  const { search, category } = req.query;
  let sql = "";
  let params = [];

  if (search && category) {
    sql = `
    SELECT product.* 
    FROM product
    JOIN product_categories ON product.id = product_categories.product_id
    JOIN categories ON product_categories.category_id = categories.id
    WHERE (product.name LIKE ? OR product.description LIKE ?)
    AND categories.name = ?
    `;
    params = [`%${search}%`, `%${search}%`, category];
  } else if (search) {
    sql = `
      SELECT * FROM product
      WHERE name LIKE ?
      OR description LIKE ?
    `;
    params = [`%${search}%`, `%${search}%`];
  } else if (category) {
    sql = `
      SELECT product.* 
      FROM product
      JOIN product_categories ON product.id = product_categories.product_id
      JOIN categories ON product_categories.category_id = categories.id
      WHERE categories.name = ?
      `;
    params = [category];
  } else {
    sql = `
    SELECT * FROM product`;
  }

  connection.query(sql, params, (err, productsResults) => {
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

// QUERY PER FILTRARE IN CATEGORIE
// SELECT *
// FROM product
// JOIN product_categories ON product.id = product_categories.product_id
// JOIN categories ON product_categories.category_id = categories.id
// WHERE categories.name = ?
