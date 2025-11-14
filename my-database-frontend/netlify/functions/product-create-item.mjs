import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Parse request body
    const body = await req.json();
    const { column1, column2, column3 } = body;

    // Validate input
    if (!column1 || !column2) {
      return new Response(
        JSON.stringify({ error: 'Required fields missing' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Insert with parameterized query
    const result = await sql(
      'INSERT INTO your_table (column1, column2, column3) VALUES ($1, $2, $3) RETURNING *',
      [column1, column2, column3]
    );

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
