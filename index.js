// Importing database functions. DO NOT MODIFY THIS LINE.
import { central, db1, db2, db3, vault } from "./databases.js";
// function getUserData(id) {
//     const dbs = {
//     db1: db1,
//     db2: db2,
//     db3: db3
//     };
// }
export async function getUserDataAsync(id) {
    const dbs = {
      db1: db1,
      db2: db2,
      db3: db3,
    };
    if (typeof id !== "number" || id < 1 || id > 10) {
      throw new Error("Invalid ID. Please provide a number between 1 and 10.");
    }
    try {
      const dbIdentifier = await central(id);
      const [userData, vaultData] = await Promise.all([
        dbs[dbIdentifier](id),
        vault(id),
      ]);
      return {
        id,
        ...vaultData,
        username: userData.username,
        website: userData.website,
        company: userData.company,
      };
    } catch (error) {
      if (error.message.includes("db")) {
        throw new Error(`Database ${error.message} failed`);
      }
      throw error;
    }
  }
// Promise chaining version
export function getUserDataPromise(id) {
    const dbs = {
      db1: db1,
      db2: db2,
      db3: db3,
    };
    if (typeof id !== "number" || id < 1 || id > 10) {
      return Promise.reject(
        new Error("Invalid ID. Please provide a number between 1 and 10.")
      );
    }
    return central(id)
      .then((dbIdentifier) => {
        return Promise.all([dbs[dbIdentifier](id), vault(id)]);
      })
      .then(([userData, vaultData]) => {
        return {
          id,
          ...vaultData,
          username: userData.username,
          website: userData.website,
          company: userData.company,
        };
      })
      .catch((error) => {
        if (error.message.includes("db")) {
          throw new Error(`Database ${error.message} failed`);
        }
        throw error;
      });
  }
// Test function
function testGetUserData(getUserData, label) {
    const testCases = [
      { id: 1, expected: "success" },
      { id: 5, expected: "success" },
      { id: 10, expected: "success" },
      { id: 0, expected: "error" },
      { id: 11, expected: "error" },
      { id: "5", expected: "error" },
      { id: true, expected: "error" },
      { id: null, expected: "error" },
    ];
    console.log(`\nTesting ${label}:`);
    testCases.forEach(({ id, expected }) => {
      getUserData(id)
        .then((result) => {
          if (expected === "success") {
            console.log(`Test passed for ID ${id}:`, result);
          } else {
            console.error(
              `Test failed for ID ${id}: Expected error, got success`
            );
          }
        })
        .catch((error) => {
          if (expected === "error") {
            console.log(`Test passed for ID ${id}: ${error.message}`);
          } else {
            console.error(`Test failed for ID ${id}: ${error.message}`);
          }
        });
    });
  }
// Run tests
testGetUserData(getUserDataAsync, "Async/Await version");
testGetUserData(getUserDataPromise, "Promise chaining version");
// Performance test with iterations
async function performanceTest(getUserData, iterations = 10, label) {
  const start = Date.now();
  for (let i = 0; i < iterations; i++) {
    await getUserData(5); // Using ID 5 for the performance test
  }
  const end = Date.now();
  console.log(
    `${label} Execution time for ${iterations} iterations: ${end - start}ms`
  );
}
// Run both versions of the performance test with multiple iterations
const iterations = 100;
performanceTest(getUserDataAsync, iterations, "Async/Await").then(() =>
  console.log("Async/Await performance test complete")
);
performanceTest(getUserDataPromise, iterations, "Promise chaining").then(() =>
  console.log("Promise chaining performance test complete")
);
