import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  try {
    if (req.method !== "DELETE") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID parameter required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Use RETURNING * so we can detect success
    const result = await sql`
      DELETE FROM Categories
      WHERE category_id = ${id}
      RETURNING *;
    `;

    if (result.length === 0) {
      return new Response(JSON.stringify({ message: "Record not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: true, deletedId: id }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
