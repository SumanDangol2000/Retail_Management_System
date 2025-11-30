import { neon } from "@neondatabase/serverless";

export default async (req, context) => {
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const filterType = url.searchParams.get('filterType') || 'all';

    if (!filterType) {
      return new Response(
        JSON.stringify({ error: 'FilterType parameter required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // Connect to database using environment variable
    const sql = neon(process.env.DATABASE_URL);

    // Replace with YOUR table name
    const result = await sql`
                            SELECT
                                category_name,
                                product_name,
                                total_sold
                            FROM ProductSalesSummary
                            WHERE 
                                (${filterType} = 'all')
                                OR (${filterType} = 'greater' AND total_sold > (SELECT AVG(total_sold) FROM ProductSalesSummary WHERE total_sold > 0))
                                OR (${filterType} = 'less' AND total_sold < (SELECT AVG(total_sold) FROM ProductSalesSummary WHERE total_sold > 0) AND total_sold > 0)
                                OR (${filterType} = 'none' AND total_sold = 0)
                            ORDER BY category_name, product_name;`;

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
