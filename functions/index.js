const functions = require('firebase-functions');

// required for firebase store >> admin sdk allows to interact with firestore and other services. 
const admin = require("firebase-admin");
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// http functions
exports.helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});

// http callabale function
exports.sayHello = functions.https.onCall((data, context) => {
    return `hello , the callable functions is running`;
});

// http auth trigger events (on user create)
exports.newUserSignup = functions.auth.user().onCreate(user => {
    console.log("user created ::", user.uid, user.email);
    // for background triggers you must return a promise or value
    return admin.firestore().collection('users').doc(user.uid).set({
        email: user.email,
        upvotedOn: []
    });
});

// http auth trigger events (on user delete)
exports.userDelete = functions.auth.user().onDelete(user => {
    console.log("user Deleted ::", user.email, user.uid)
    // for background triggers you must return a promise or value
    const doc = admin.firestore().collection('users').doc(user.uid);
    return doc.delete();
});

// http callable function (adding a request)
exports.addRequest = functions.https.onCall((data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            "Only authenticate users can add requests"
        );
    }
    if (data.text.length > 30) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            "request must me valid, less than 30 character"
        );
    }
    return admin.firestore().collection('requests').add({
        text: data.text,
        upvotes: 0,
    });
});

