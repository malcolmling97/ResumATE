import { Pool } from "pg"

const pool = new Pool({
	connectionString: process.env.DB_URL,
	ssl: { rejectUnauthorized: false },
})

const query = (text, params) => pool.query(text, params)

// Also export pool for transactions
query.pool = pool

export default query
