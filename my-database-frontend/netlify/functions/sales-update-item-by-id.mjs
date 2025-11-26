import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  try {

    // Only allow UPDATE
    if (req.method !== "PUT") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID parameter required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
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

    const { customer_id, product_id, quantity_sold, total_amount } = body;

            // Validate input
    if (!customer_id || !product_id || !quantity_sold || !total_amount) {
      return new Response(
        JSON.stringify({ error: 'Required parameters are missing' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Parameterized query (prevents SQL injection)
    const result = await sql`UPDATE Sales 
                             SET customer_id = ${customer_id}, product_id = ${product_id}, quantity_sold = ${quantity_sold}, total_amount = ${total_amount}
                             WHERE sale_id = ${id} RETURNING *;`;

    // return new Response(JSON.stringify(result[0] || {}), {
    //   status: result.length > 0 ? 200 : 404,
    //   headers: { 'Content-Type': 'application/json' }
    // });

    if (result.length === 0) {
      return new Response(JSON.stringify({ error: "Record not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(result[0]), {
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
