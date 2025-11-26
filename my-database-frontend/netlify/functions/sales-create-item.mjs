import { neon } from "@neondatabase/serverless";

export default async (req, context) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
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

    if (!customer_id || !product_id || !quantity_sold || !total_amount) {
      return new Response(
        JSON.stringify({ error: "Category name is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    const result = await sql`
      INSERT INTO Sales (customer_id, product_id, quantity_sold, total_amount )
      VALUES (${customer_id}, ${product_id}, ${quantity_sold}, ${total_amount})
      RETURNING *;
    `;

    return new Response(JSON.stringify(result[0]), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("CATEGORY CREATE ERROR:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
