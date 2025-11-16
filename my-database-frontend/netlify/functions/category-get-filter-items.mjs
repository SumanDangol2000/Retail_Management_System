import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const filter = url.searchParams.get('filter');

    if (!filter) {
      return new Response(
        JSON.stringify({ error: 'Filter parameter required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Parameterized query (prevents SQL injection)
    const result = await sql`SELECT * FROM categories WHERE category_name LIKE %${filter}%;`;

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
