import { neon } from "@neondatabase/serverless";

export default async (req, context) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Safe JSON parsing
    let body = {};
    try {
      body = await req.json();
    } catch (err) {
      console.error("JSON PARSE ERROR:", err);
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { customer_id, product_id, quantity_sold, total_amount } = body;

    // Validate required fields
    if (
      customer_id == null ||
      product_id == null ||
      quantity_sold == null ||
      total_amount == null
    ) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Type/constraint checks (defensive)
    const qty = Number(quantity_sold);
    const amount = Number(total_amount);
    if (!Number.isInteger(qty) || qty <= 0) {
      return new Response(
        JSON.stringify({ error: "quantity_sold must be a positive integer" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    if (!Number.isFinite(amount) || amount < 0) {
      return new Response(
        JSON.stringify({ error: "total_amount must be a non-negative number" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Atomic operation: update stock IF sufficient, then insert sale, all in one statement
    const rows = await sql`
      WITH updated AS (
        UPDATE Products
        SET quantity_in_stock = quantity_in_stock - ${qty}
        WHERE product_id = ${product_id}
          AND quantity_in_stock >= ${qty}
        RETURNING product_id, product_name, quantity_in_stock
      ),
      inserted_sale AS (
        INSERT INTO Sales (customer_id, product_id, quantity_sold, total_amount)
        SELECT ${customer_id}, ${product_id}, ${qty}, ${amount}
        FROM updated
        RETURNING sale_id, customer_id, product_id, quantity_sold, total_amount, sale_date
      )
      SELECT 
        i.sale_id, i.customer_id, i.product_id, i.quantity_sold, i.total_amount, i.sale_date,
        u.product_name, u.quantity_in_stock AS updated_stock
      FROM inserted_sale i
      JOIN updated u ON u.product_id = i.product_id;
    `;

    // If no rows returned, either product doesn't exist or insufficient stock
    if (!rows.length) {
      // Check if product exists to tailor the error message
      const productExists =
        await sql`SELECT 1 FROM Products WHERE product_id = ${product_id} LIMIT 1;`;
      const errorMsg = productExists.length
        ? "Insufficient stock"
        : "Product not found";
      return new Response(JSON.stringify({ error: errorMsg }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Success
    return new Response(JSON.stringify(rows[0]), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("SALE CREATE ERROR:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
