// Importing database functions. DO NOT MODIFY THIS LINE.
import { central, db1, db2, db3, vault } from "./databases.js";

const dbs = {
    db1: db1,
    db2: db2,
    db3: db3
    };

export async function getUserData(id) {
/*************  ✨ Codeium Command ⭐  *************/
    const centralPromise = central(id);
    
/******  56335855-21b9-40c2-a14b-e0eaed58acae  *******/}