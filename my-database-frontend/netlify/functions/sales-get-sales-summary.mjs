import { neon } from "@neondatabase/serverless";

export default async (req, context) => {
  try {
    // Connect to database using environment variable
    const sql = neon(process.env.DATABASE_URL);

    // Replace with YOUR table name
    const result = await sql`
                            WITH sales_summary AS (
                                SELECT 
                                    p.product_id,
                                    p.product_name,
                                    c.category_name,
                                    SUM(s.quantity_sold) AS total_sold
                                FROM Products p
                                LEFT JOIN Categories c ON p.category_id = c.category_id
                                LEFT JOIN Sales s ON p.product_id = s.product_id
                                GROUP BY p.product_id, p.product_name, c.category_name
                            )
                            SELECT 
                                product_id,
                                product_name,
                                category_name,
                                total_sold,
                                CASE
                                    WHEN total_sold = (SELECT MAX(total_sold) FROM sales_summary) THEN 'Max sale'
                                    WHEN total_sold = (SELECT MIN(total_sold) FROM sales_summary WHERE total_sold IS NOT NULL) THEN 'Min sale'
                                    WHEN total_sold IS NULL THEN 'No sale'
                                END AS sale_label
                            FROM sales_summary
                            WHERE total_sold = (SELECT MAX(total_sold) FROM sales_summary)
                              OR total_sold = (SELECT MIN(total_sold) FROM sales_summary WHERE total_sold IS NOT NULL)
                              OR total_sold IS NULL
                            ORDER BY total_sold DESC;`

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
