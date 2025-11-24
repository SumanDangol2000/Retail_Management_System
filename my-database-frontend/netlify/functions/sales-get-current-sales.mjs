import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  try {

    // Connect to database using environment variable
    const sql = neon(process.env.DATABASE_URL);

    // Replace with YOUR table name
    const result = await sql`SELECT SUM(total_amount) AS total_current_month
                                FROM 
                                    Sales
                                WHERE 
                                    EXTRACT(YEAR FROM sale_date) = EXTRACT(YEAR FROM CURRENT_DATE)
                                    AND EXTRACT(MONTH FROM sale_date) = EXTRACT(MONTH FROM CURRENT_DATE); 
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
