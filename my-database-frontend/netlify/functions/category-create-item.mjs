import { neon } from "@neondatabase/serverless";

export default async (req, context) => {
  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse JSON body
    const { category_name, description } = await req.json();

    // Validate required field
    if (!category_name || category_name.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Category name is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Insert category
    const result = await sql`
    INSERT INTO Categories (category_name, description) 
    VALUES (${category_name}, ${description})
    RETURNING *;
  `;

    return new Response(JSON.stringify(result[0]), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
