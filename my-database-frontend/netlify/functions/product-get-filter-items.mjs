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

    //  const searchValue = `%${keyword}%`;

      const result = await sql`SELECT p.product_id,
                                  p.product_name,
                                  c.category_name,
                                  s.supplier_name,
                                  p.price,
                                  p.quantity_in_stock
                            FROM Products AS p
                            LEFT JOIN Categories AS c ON p.category_id = c.category_id
                            LEFT JOIN Suppliers AS s ON p.supplier_id = s.supplier_id
                            WHERE p.product_name ILIKE ${'%' + keyword + '%'}
                              OR c.category_name ILIKE ${'%' + keyword + '%'}
                              OR s.supplier_name ILIKE ${'%' + keyword + '%'}
                            ORDER BY p.product_name ASC
                          `;


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
