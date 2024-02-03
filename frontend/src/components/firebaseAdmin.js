import admin from "firebase-admin";



const db = admin.firestore();
const auth = admin.auth();
const increment = admin.firestore.FieldValue.increment(1);
const decrement = admin.firestore.FieldValue.increment(-1);

module.exports = {
    db, auth, increment, decrement
}