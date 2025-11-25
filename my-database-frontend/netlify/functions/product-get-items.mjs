import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  try {
    // Connect to database using environment variable
    const sql = neon(process.env.DATABASE_URL);

    // Replace with YOUR table name
    // const result = await sql`SELECT * FROM products`;
    const result = await sql`SELECT p.product_id, p.product_name, c.category_name, s.supplier_name , p.price, p.quantity_in_stock 
                              FROM Products AS p 
                              JOIN Categories AS c ON p.category_id = c.category_id 
                              JOIN Suppliers AS s ON p.supplier_id = s.supplier_id 
                              ORDER BY p.product_id ASC `;

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
