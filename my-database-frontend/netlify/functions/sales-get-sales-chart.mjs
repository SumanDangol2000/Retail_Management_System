import { neon } from "@neondatabase/serverless";

export default async (req, context) => {
  try {
    // Connect to database using environment variable
    const sql = neon(process.env.DATABASE_URL);

    const result = await sql`
      SELECT 
        p.product_name,
        TO_CHAR(s.sale_date, 'YYYY-MM') AS sale_month,
        SUM(s.quantity_sold) AS total_sold
      FROM Sales s
      JOIN Products p ON s.product_id = p.product_id
      GROUP BY p.product_name, sale_month
      ORDER BY sale_month, p.product_name;
    `;

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
