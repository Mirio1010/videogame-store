#!/usr/bin/env node

/**
 * Seed Script for Test Data
 *
 * This script creates realistic test data for development and testing:
 * 1. Creates test users via Supabase Auth
 * 2. Inserts test profiles
 * 3. Inserts test orders and order items
 *
 * Usage:
 *   node backend/seed/seed.js
 *
 * Environment:
 *   Requires SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env
 */

const dotenv = require("dotenv");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

dotenv.config({ path: path.join(__dirname, "../.env") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase environment variables. Check your .env file.");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test users to create
const testUsers = [
  {
    email: "alice@example.com",
    password: "TestPassword123!",
    displayName: "Alice Smith",
  },
  {
    email: "bob@example.com",
    password: "TestPassword123!",
    displayName: "Bob Johnson",
  },
  {
    email: "carol@example.com",
    password: "TestPassword123!",
    displayName: "Carol Williams",
  },
];

// Popular Steam game IDs for test orders
const steamGames = [
  { id: 570, name: "Dota 2", price: 19.99 },
  { id: 730, name: "CS:GO", price: 29.99 },
  { id: 275850, name: "No Man's Sky", price: 19.99 },
  { id: 1238840, name: "Deep Rock Galactic", price: 39.99 },
  { id: 1172470, name: "Raft", price: 24.99 },
  { id: 252950, name: "Rocket League", price: 19.99 },
];

async function main() {
  console.log("Starting database seed...\n");

  try {
    // Step 1: Create test users
    console.log("Step 1: Creating test users...");
    const createdUserIds = [];

    for (const user of testUsers) {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          user_metadata: { displayName: user.displayName },
          email_confirm: true, // Auto-confirm email
        });

        if (error) {
          // User might already exist, try to get them
          if (error.message.includes("already exists")) {
            console.log(`  User ${user.email} already exists, skipping creation`);
            // Try to get the existing user
            const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
            const existing = existingUsers?.users?.find((u) => u.email === user.email);
            if (existing) {
              createdUserIds.push(existing.id);
            }
          } else {
            console.error(`  Error creating user ${user.email}: ${error.message}`);
          }
        } else {
          console.log(`  Created user: ${user.email} (ID: ${data.user.id})`);
          createdUserIds.push(data.user.id);
        }
      } catch (err) {
        console.error(`  Error: ${err.message}`);
      }
    }

    if (createdUserIds.length === 0) {
      console.error("\nNo users were created or found. Aborting seed.");
      process.exit(1);
    }

    console.log(`\nUsers ready: ${createdUserIds.length} users\n`);

    // Step 2: Insert profiles for created users
    console.log("Step 2: Creating profiles...");
    for (let i = 0; i < createdUserIds.length; i++) {
      const userId = createdUserIds[i];
      const user = testUsers[i];

      const { error } = await supabaseAdmin.from("profiles").upsert({
        user_id: userId,
        display_name: user.displayName,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName.split(" ")[0]}`,
      });

      if (error) {
        console.error(`  Error creating profile for ${user.email}: ${error.message}`);
      } else {
        console.log(`  Created profile for: ${user.displayName}`);
      }
    }

    console.log();

    // Step 3: Create test orders and order items
    console.log("Step 3: Creating test orders and items...");

    // Alice's orders
    const alice = createdUserIds[0];
    if (alice) {
      // First order (2 items)
      const { data: order1, error: error1 } = await supabaseAdmin
        .from("orders")
        .insert({
          user_id: alice,
          total_price: 59.97,
          status: "delivered",
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (!error1 && order1) {
        // Add items to order
        await supabaseAdmin.from("order_items").insert([
          {
            order_id: order1.id,
            steam_id: steamGames[0].id,
            quantity: 1,
            price: steamGames[0].price,
          },
          {
            order_id: order1.id,
            steam_id: steamGames[2].id,
            quantity: 2,
            price: steamGames[2].price,
          },
        ]);
        console.log(`  Created order for Alice (delivered)`);
      }

      // Second order (1 item)
      const { data: order2, error: error2 } = await supabaseAdmin
        .from("orders")
        .insert({
          user_id: alice,
          total_price: 29.99,
          status: "shipped",
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (!error2 && order2) {
        await supabaseAdmin.from("order_items").insert({
          order_id: order2.id,
          steam_id: steamGames[1].id,
          quantity: 1,
          price: steamGames[1].price,
        });
        console.log(`  Created order for Alice (shipped)`);
      }
    }

    // Bob's orders
    const bob = createdUserIds[1];
    if (bob) {
      const { data: order3, error: error3 } = await supabaseAdmin
        .from("orders")
        .insert({
          user_id: bob,
          total_price: 89.96,
          status: "delivered",
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (!error3 && order3) {
        await supabaseAdmin.from("order_items").insert([
          {
            order_id: order3.id,
            steam_id: steamGames[3].id,
            quantity: 1,
            price: steamGames[3].price,
          },
          {
            order_id: order3.id,
            steam_id: steamGames[4].id,
            quantity: 2,
            price: steamGames[4].price,
          },
        ]);
        console.log(`  Created order for Bob (delivered)`);
      }
    }

    // Carol's orders
    const carol = createdUserIds[2];
    if (carol) {
      const { data: order4, error: error4 } = await supabaseAdmin
        .from("orders")
        .insert({
          user_id: carol,
          total_price: 19.99,
          status: "pending",
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (!error4 && order4) {
        await supabaseAdmin.from("order_items").insert({
          order_id: order4.id,
          steam_id: steamGames[5].id,
          quantity: 1,
          price: steamGames[5].price,
        });
        console.log(`  Created order for Carol (pending)`);
      }
    }

    console.log("\nSeed complete!\n");

    // Summary
    console.log("Summary:");
    console.log(`  • Users created: ${createdUserIds.length}`);
    console.log(`  • Test accounts:`);
    testUsers.forEach((user) => {
      console.log(`    - ${user.email} / ${user.password}`);
    });
    console.log(`\nUse these credentials to log in and test the application.`);
    console.log(`\nRemember to delete these test users before deploying to production!\n`);
  } catch (error) {
    console.error("Fatal error during seed:", error.message);
    process.exit(1);
  }
}

main();
