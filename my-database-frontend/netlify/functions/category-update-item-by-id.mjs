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

    // Parse JSON body
    const { category_name, description } = await req.json();

    // Validate required field
    if (!category_name || category_name.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Category name is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Parameterized query (prevents SQL injection)
    const result = await sql`UPDATE Categories SET category_name = ${category_name}, description = ${description} WHERE id = ${id};`;

    return new Response(JSON.stringify(result[0] || {}), {
      status: result.length > 0 ? 200 : 404,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
