import query from "../db/index.js"
import crypto from "crypto"
import { createOAuthUsername } from "../utils/usernameUtils.js"

const createUser = async (username, email) => {
  try {
    const userId = crypto.randomUUID()

    const result = await query(
      `INSERT INTO users(id, username, email) 
       VALUES($1, $2, $3) RETURNING id, username, email`,
      [userId, username, email]
    )

    if (result.rows.length === 0) {
      throw new Error("Unable to create staging user.")
    }

    return result.rows[0]
  } catch (error) {
    throw error
  }
}
const getUser = async (identifier, secondaryIdentifier = null) => {
  try {
    let query_text, params;

    if (secondaryIdentifier) {
      // Both email and username provided - verify they belong to the same user
      query_text = `SELECT u.id, u.username, u.email, ai.password_hash 
                    FROM users u
                    LEFT JOIN auth_identities ai ON u.id = ai.user_id AND ai.provider = 'local'
                    WHERE u.username = $1 AND u.email = $2`;
      params = [identifier, secondaryIdentifier];
    } else {
      query_text = `SELECT u.id, u.username, u.email, ai.password_hash 
                    FROM users u
                    LEFT JOIN auth_identities ai ON u.id = ai.user_id AND ai.provider = 'local'
                    WHERE u.username = $1 OR u.email = $1`;
      params = [identifier];
    }

    const results = await query(query_text, params);
    return results.rows[0];
  } catch (error) {
    console.error("Error fetching user from database:", error.message)
    throw new Error("DB error while fetching user.")
  }
}

const deleteUser = async (id) => {
  try {
    const results = await query(
      `DELETE FROM users WHERE id = $1 RETURNING id, username, email`,
      [id]
    )

    if (results.rows.length === 0) {
      throw new Error("User not found.")
    }

    return results.rows[0]
  } catch (error) {
    console.error("Error deleting user from database:", error.message)
    throw new Error("DB error while deleting user.")
  }
}

const getUserByEmail = async (email) => {
  try {
    const results = await query(
      `SELECT u.id, u.username, u.email 
       FROM users u WHERE u.email = $1`,
      [email]
    )
    return results.rows[0]
  } catch (error) {
    console.error("Error fetching user by email:", error.message)
    throw new Error("DB error while fetching user by email.")
  }
}

const createGoogleUser = async (userData) => {
  try {
    const { username, email, googleId } = userData

    // Generate username with 5-digit hash for OAuth users
    const finalUsername = createOAuthUsername(username, email)

    // Generate a new UUID for the user
    const userId = crypto.randomUUID()

    // Start a transaction
    await query('BEGIN')

    // Create user first
    const userResults = await query(
      `INSERT INTO users(id, username, email, provider, provider_id) 
       VALUES($1, $2, $3, 'google', $4) RETURNING id, username, email`,
      [userId, finalUsername, email, googleId]
    )

    if (userResults.rows.length === 0) {
      await query('ROLLBACK')
      throw new Error("Unable to create Google user.")
    }
    await query('COMMIT')
    return userResults.rows[0]
  } catch (error) {
    await query('ROLLBACK')
    console.error("Error creating Google user:", error.message)
    throw error
  }
}

// Generic function to get user by OAuth provider
const getUserByProvider = async (provider, providerUserId) => {
  try {
    const results = await query(
      `SELECT u.id, u.username, u.email 
       FROM users u
       WHERE u.provider = $1 AND u.provider_id = $2`,
      [provider, providerUserId]
    )
    return results.rows[0]
  } catch (error) {
    console.error("Error fetching user by provider:", error.message)
    throw new Error("DB error while fetching user by provider.")
  }
}

// Generic function to create OAuth user
const createOAuthUser = async (userData) => {
  try {
    const { username, email, provider, providerId } = userData

    // Generate username with 5-digit hash for OAuth users
    const finalUsername = createOAuthUsername(username, email)

    // Start a transaction
    await query('BEGIN')

    // Create user first
    const userResults = await query(
      `INSERT INTO users(username, email) 
       VALUES($1, $2) RETURNING id, username, email`,
      [finalUsername, email]
    )

    if (userResults.rows.length === 0) {
      await query('ROLLBACK')
      throw new Error("Unable to create OAuth user.")
    }

    const user = userResults.rows[0]

    // Create OAuth auth identity
    await query(
      `INSERT INTO auth_identities(user_id, provider, provider_user_id) 
       VALUES($1, $2, $3)`,
      [user.id, provider, providerId]
    )

    await query('COMMIT')
    return user
  } catch (error) {
    await query('ROLLBACK')
    console.error("Error creating OAuth user:", error.message)
    throw error
  }
}

// Get user by username
const getUserByUsername = async (username) => {
  try {
    const results = await query(
      `SELECT u.id, u.username, u.email 
       FROM users u WHERE u.username = $1`,
      [username]
    )
    return results.rows[0]
  } catch (error) {
    console.error("Error fetching user by username:", error.message)
    throw new Error("DB error while fetching user by username.")
  }
}

// Get user by ID
const getUserById = async (userId) => {
  try {
    const results = await query(
      `SELECT u.id, u.username, u.email 
       FROM users u WHERE u.id = $1`,
      [userId]
    )
    return results.rows[0]
  } catch (error) {
    console.error("Error fetching user by ID:", error.message)
    throw new Error("DB error while fetching user by ID.")
  }
}

export default {
  getUser,
  deleteUser,
  getUserByEmail,
  createGoogleUser,
  getUserByProvider,
  createOAuthUser,
  getUserByUsername,
  getUserById
}
