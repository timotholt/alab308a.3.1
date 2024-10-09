// Importing database functions. DO NOT MODIFY THIS LINE.
import { central, db1, db2, db3, vault } from "./databases.js";

const dbs = {
    db1: db1,
    db2: db2,
    db3: db3
    };

export async function getUserData(id) {

     async function getUserDataHelper(id) {

        // Verify ID is a number
        if (typeof id !== "number") {
            return Promise.reject(new Error(`Id ${id} (a ${typeof id}) is not a number`));
        }

        // Verify ID is a number and in range
        if (id < 1 || id > 10) {
            return Promise.reject(
                new Error(`Id (${id}) (a ${typeof id}) is out of range of 1-10`)
            );
        }
    
        return await central(id)
            .then((dbIdentifier) => {
                if (dbIdentifier === null) {
                    return Promise.reject(
                        new Error(`Database identifier for ID ${id} is null`)
                    );
                }
    
                // Verify that the database identifier is valid
                if (!(dbIdentifier in dbs)) {
                    return Promise.reject(
                        new Error(`Database identifier '${dbIdentifier}' is not valid`)
                    );
                }
    
                return Promise.all([dbs[dbIdentifier](id), vault(id)]);
            })
            .then(([userData, vaultData]) => {
                if (userData === null || vaultData === null) {
                    return Promise.reject(
                        new Error(`Null pointer reference when retrieving user data`)
                    );
                }
    
                // Verify that the user data and vault data are objects
                if (typeof userData !== "object" || typeof vaultData !== "object") {
                    return Promise.reject(
                        new Error(`User data or vault data is not an object`)
                    );
                }
    
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

    getUserDataHelper(id)
    .then((result) => console.log(result))
    .catch((error) => console.error(error));
}



// Test valid cases
for (let i = 1; i <= 10; i++) {
    getUserData(i);
}

// Test invalid cases
getUserData(-1);                // Invalid number
getUserData(0);                 // Zero
getUserData(11);                // Number out of range
getUserData(true);              // Boolean
getUserData(null);              // Null
getUserData(undefined);         // Undefined
getUserData("5");               // String
getUserData("10");              // String
getUserData({});                // Object
getUserData(function () {});    // Function

// Test edge cases  
getUserData(0.5);
getUserData(10.5);

// Performance test

async function testSpeed(getUserData, count) {
    const start = Date.now();
    for (let i = 0; i < count; i++) {
        await getUserData(7);    
    }
    const end = Date.now();
    console.log(`Time spent for ${count} executions of getUserData: ${end - start}ms`);
}

// Run both versions of the performance test with multiple iterations
testSpeed(getUserData, 100)
    .then(() => console.log("Test finished"));

console.log("All database tests launched");

