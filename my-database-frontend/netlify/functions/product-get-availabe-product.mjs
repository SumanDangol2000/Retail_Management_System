import { neon } from "@neondatabase/serverless";

export default async (req, context) => {
  try {
    // Connect to database using environment variable
    const sql = neon(process.env.DATABASE_URL);

    // Replace with YOUR table name
    const result = await sql`
                            SELECT 
                              product_name,
                              quantity_in_stock
                            FROM products
                            ORDER BY quantity_in_stock
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
