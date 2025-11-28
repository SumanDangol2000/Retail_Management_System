import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  try {
    const url = new URL(req.url);
    const range = url.searchParams.get('range') || 'all';
    let order = url.searchParams.get('order') || 'DESC';

    // Validate order to prevent injection
    order = order.toUpperCase();
    if (order !== 'ASC' && order !== 'DESC') {
      order = 'DESC';
    }

    const sql = neon(process.env.DATABASE_URL);

    let whereClause = '';
    if (range === '1w') {
      whereClause = "s.sale_date >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (range === '1m') {
      whereClause = "s.sale_date >= CURRENT_DATE - INTERVAL '1 month'";
    } else if (range === '3m') {
      whereClause = "s.sale_date >= CURRENT_DATE - INTERVAL '3 months'";
    } else if (range === 'all') {
      whereClause = 'TRUE';
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid range parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await sql`
      SELECT s.sale_id,
             c.first_name || ' ' || c.last_name AS customer_name,
             p.product_name,
             s.quantity_sold,
             s.sale_date,
             s.total_amount
      FROM sales AS s
      LEFT JOIN Customers AS c ON c.customer_id = s.customer_id
      LEFT JOIN Products AS p ON p.product_id = s.product_id
      WHERE ${sql.unsafe(whereClause)}
      ORDER BY s.sale_date ${sql.unsafe(order)}
    `;

    return new Response(JSON.stringify(result), {
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