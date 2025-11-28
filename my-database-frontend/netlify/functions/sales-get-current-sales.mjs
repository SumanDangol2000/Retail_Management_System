import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  try {

    // Connect to database using environment variable
    const sql = neon(process.env.DATABASE_URL);

    // Replace with YOUR table name
const result = await sql`SELECT SUM(total_amount) AS total_current_month
                          FROM Sales
                          WHERE sale_date >= date_trunc('month', CURRENT_DATE)
                          AND sale_date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
                    `;

    return new Response(JSON.stringify(result[0].total_current_month ?? 0), {
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
