import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // SAFE JSON PARSING
    let body = {};
    try {
      body = await req.json();
    } catch (err) {
      console.error("JSON PARSE ERROR:", err);
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { product_name, category_id, supplier_id, price, quantity_in_stock } = body;

            // Validate input
    if (!product_name || !category_id || !supplier_id || !price || !quantity_in_stock) {
      return new Response(
        JSON.stringify({ error: 'Required fields missing' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Insert with parameterized query
    const result = await sql`INSERT INTO Products (product_name, category_id, supplier_id, price, quantity_in_stock) 
                              VALUES (${product_name}, ${category_id}, ${supplier_id}, ${price}, ${quantity_in_stock}) RETURNING *;`;

    return new Response(JSON.stringify(result[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
