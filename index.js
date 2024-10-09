//==============================================================================
// Importing database functions. DO NOT MODIFY THIS LINE.
//==============================================================================
import { central, db1, db2, db3, vault } from "./databases.js";

//==============================================================================
// Map a database id from central() return value into a sub-database
// So if central() returns "db1", then the sub-database is "db1", etc.
//==============================================================================

const dbs = { db1: db1, db2: db2, db3: db3};

//==============================================================================
// Symbols for Async/await version vs Promise chaining version
//==============================================================================

const ASYNC   = Symbol("ASYNC");
const PROMISE = Symbol("PROMISE");
const runCount = 100;

//==============================================================================
// Promise chaining version
//==============================================================================

export function PROMISE_getUserData(id) {

    // Verify ID is a number
    if (typeof id !== "number" || id < 1 || id > 10) {
        return Promise.reject(
        new Error(`${id} is invalid. ID must be a number between 1 and 10.`)
        );
    }

    // Ask the central() database function for the sub-database
    return central(id)

    // Then ask the sub-database for the user data
    .then((whichSubDatabase) => {
        return Promise.all([dbs[whichSubDatabase](id), vault(id)]);
    })

    // Then return a structured object of id, username, website, company,
    .then(([userData, vaultData]) => {
        return {
            id,
            username: userData.username,
            website: userData.website,
            company: userData.company,
            ...vaultData,
        };
    })
    .catch((error) => {
        if (error.message.includes("db")) {
            throw new Error(`Database ${error.message} failed`);
        }
        throw error;
    });
}

//==============================================================================
// getUserData - Async version
//==============================================================================

export async function ASYNC_getUserData(id) {

    // Verify ID is a number
    if (typeof id !== "number" || id < 1 || id > 10) {
        throw new Error(`${id} is invalid. ID must be a number between 1 and 10.`);
    }

    // this is the bulk of the code
    try {
        // Ask the central() database function for the sub-database
        const whichSubDatabase = await central(id);

        // Ask the sub-database for the user data
        const [userData, vaultData] = await Promise.all([
            dbs[whichSubDatabase](id),
            vault(id),
        ]);

        // Return a structured object of id, username, website, company,
        //name, email, address, and phone
        return {
            id,
            username: userData.username,
            website: userData.website,
            company: userData.company,
            ...vaultData,
        };
    }

    // Catch any errors
    catch (error) {

        // Throw an error if database is not valid
        if (error.message.includes("db")) {
            throw new Error(`Database ${error.message} failed`);
        }

        // Re-throw other errors
        throw error;
    }
}


// Test function
async function testGetUserData(promiseOrAsync) {

    const testData = [

        // These should work
        { id:  1, expected: "success" },
        { id:  2, expected: "success" },
        { id:  3, expected: "success" },
        { id:  4, expected: "success" },
        { id:  5, expected: "success" },
        { id:  6, expected: "success" },
        { id:  7, expected: "success" },
        { id:  8, expected: "success" },
        { id:  9, expected: "success" },
        { id: 10, expected: "success" },

        // These should fail
        { id: -1, expected: "error" },
        { id: 0, expected: "error" },
        { id: 11, expected: "error" },
        { id: "string", expected: "error" },
        { id: "5", expected: "error" },

        // Test all JavaScript non-numeric values and types
        { id: "", expected: "error" },
        // { id: NaN, expected: "error" },
        { id: Infinity, expected: "error" },
        { id: -Infinity, expected: "error" },
        { id: true, expected: "error" },
        { id: false, expected: "error" },
        { id: null, expected: "error" },
        { id: undefined, expected: "error" },
        { id: {}, expected: "error" },
        { id: [], expected: "error" },
    ];

    // Show which version is being tested
    console.log(`\nTesting ${promiseOrAsync.toString()} version:`);

    // Go through each test case
    testData.forEach(({ id, expected }) => {

        // Call the appropriate function
        if (promiseOrAsync === ASYNC)
            ASYNC_getUserData(id)
        else
            PROMISE_getUserData(id)

        // Check the for successful results
        .then((result) => {

            // Test expected to pass and passed!
            if (expected === "success") {
                console.log(`GOOD: Test passed for ID ${id}:`, result);
            } else {
                // Test expected to fail and passed, which is bad
                console.error(`BAD: Test passed for ${id} but should have failed!`);
            }
        })

        // Catch any errors
        .catch((error) => {

            // Text expected to fail and failed, this is a good test
            if (expected === "error") { 
                console.log(`GOOD: Test failed for ID ${id}: as expcted with error message:${error.message}`);
            } else {
                // Test expected to fail should have passed, this is BAD
                console.error(`BAD: Test failed for ID ${id}, but should have passed.  Error message: ${error.message}`);
            }
        });
    });
}

//===============================================================================
// Test how fast the code is through looping
//===============================================================================

async function benchmarkGetUserData(promiseOrAsync, runCount = 10) {

    // Start the stop watch
    const startTime = Date.now();

    // Run the loop
    for (let i = 0; i < runCount; i++)

        // Call the appropriate function, cycling through IDs 1-10
        if (promiseOrAsync === ASYNC)
            await ASYNC_getUserData((i % 10) + 1)
        else
            await PROMISE_getUserData((i % 10) + 1);

    // Stop the stop watch
    const stopTime = Date.now();

    // Calculate the run time
    let seconds = Math.floor((stopTime - startTime) / 1000);
    let milliseconds = Math.floor((stopTime - startTime) % 1000);

    // Display the run time
    if (seconds > 0)
        console.log(`Running ${promiseOrAsync.toString()} version ${runCount} times in a loop took: ${seconds}.${milliseconds} seconds`);
    else
        console.log(`Running ${promiseOrAsync.toString()} version ${runCount} times in a loop took: ${milliseconds} milliseconds`);
}

//===============================================================================
// Run tests
//===============================================================================

await testGetUserData(ASYNC)
.then(() => console.log("Async Test Finished. Running Promise Test"))
.then(() => testGetUserData(PROMISE))
.then(() => console.log("Promise Test finished. Running ASYNC Bencharmark"))
.then(() => benchmarkGetUserData(ASYNC))
.then(() => console.log("Async Benchmark Finished. Running PROMISE Benchmark"))
.then(() => benchmarkGetUserData(PROMISE))
.then(() => console.log("All Tests Finished. All Done."));
