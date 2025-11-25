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

    const { supplier_name, contact_person, phone, email, address } = body;

    if (!supplier_name || !contact_person) {
      return new Response(
        JSON.stringify({ error: "Category name is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    const result = await sql`
      INSERT INTO Suppliers (supplier_name, contact_person, phone, email, address)
      VALUES (${supplier_name}, ${contact_person}, ${phone}, ${email}, ${address})
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
