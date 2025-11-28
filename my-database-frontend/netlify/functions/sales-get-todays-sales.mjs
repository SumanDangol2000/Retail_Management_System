import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  try {

    // Connect to database using environment variable
    const sql = neon(process.env.DATABASE_URL);

    // Replace with YOUR table name
    const result = await sql`SELECT SUM(total_amount) AS total_todays_sales
                              FROM Sales
                              WHERE sale_date::date = CURRENT_DATE;
                          `;

    return new Response(JSON.stringify(result[0].total_todays_sales ?? 0), {
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
