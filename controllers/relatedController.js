import connection from "../data/jw_db.js";

const related = (req, res, next) => {
  const { slug } = req.params;
  console.log("TENTATIVO CORRELATI PER:", slug);

  const getCategoryQuery = `
    SELECT categories.id, categories.name
    FROM product
    JOIN product_categories ON product.id = product_categories.product_id
    JOIN categories ON product_categories.category_id = categories.id
    WHERE product.slug = ?
    LIMIT 1
  `;

  connection.query(getCategoryQuery, [slug], (error, categoryResults) => {
    if (error) return next(error);

    if (categoryResults.length === 0) {
      console.log("NESSUNA CATEGORIA TROVATA per:", slug);
      return res.status(404).json({ message: "Categoria non trovata per questo prodotto." });
    }

    const categoryId = categoryResults[0].id;
    console.log("Categoria trovata:", categoryResults[0].name);

    const getRelatedQuery = `
      SELECT product.*
      FROM product
      JOIN product_categories ON product.id = product_categories.product_id
      WHERE product_categories.category_id = ?
      AND product.slug != ?
    `;

    connection.query(getRelatedQuery, [categoryId, slug], (error, relatedProducts) => {
      if (error) return next(error);

      console.log(`Trovati ${relatedProducts.length} prodotti correlati per ${slug}`);

      const productsWithImages = relatedProducts.map(product => ({
        ...product,
        image_url: `${req.protocol}://${req.get("host")}/img/${product.slug}.png`,
      }));

      res.status(200).json(productsWithImages);
    });
  });
};


export default {related}