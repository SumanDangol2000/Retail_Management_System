import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const keyword = url.searchParams.get('keyword');

    if (!keyword) {
      return new Response(
        JSON.stringify({ error: 'Keyword parameter required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

     const searchValue = `%${keyword}%`;

    // Parameterized query (prevents SQL injection)
    const result = await sql`SELECT * FROM Categories WHERE category_name ILIKE ${searchValue};`;

    return new Response(JSON.stringify(result || {}), {
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
