import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  try {
    // Connect to database using environment variable
    const sql = neon(process.env.DATABASE_URL);

    // Replace with YOUR table name
    // const result = await sql`SELECT * FROM sales`;
    const result = await sql`SELECT s.sale_id, c.first_name || ' ' || c.last_name AS customer_name, p.product_name, s.quantity_sold, s.sale_date, s.total_amount 
                              FROM sales AS s
                              JOIN Customers AS c ON c.customer_id = s.customer_id
                              JOIN Products AS p ON p.product_id = s.product_id
                              ORDER BY s.sale_date DESC`;

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
