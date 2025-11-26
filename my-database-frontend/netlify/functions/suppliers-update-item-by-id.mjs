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

    const { supplier_name, contact_person, phone, email, address } = body;

            // Validate input
    if (!supplier_name || !contact_person || !phone || !email || !address) {
      return new Response(
        JSON.stringify({ error: 'Required fields missing' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Parameterized query (prevents SQL injection)
    const result = await sql`UPDATE Suppliers 
                             SET supplier_name = ${supplier_name}, contact_person = ${contact_person}, phone = ${phone}, email = ${email}, address = ${address} 
                             WHERE supplier_id = ${id} RETURNING *;`;

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
