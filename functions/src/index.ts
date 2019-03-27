// Import main libraries
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";
// Initialize firebase for accesing to its services
admin.initializeApp(functions.config().firebase);


// Create a record
// First, let's initialize our database.
const db = admin.firestore(); // Add this

// Intialize Express.js server
const app = express();
const main = express();
// Configure the server.
// Let's add the path used for receiving the request.
// Select JSON as our main parser for processing requests body.
main.use('/api/v1', app);
main.use(bodyParser.json());

// Export our function.
// Last but not least, 
// let's define our Google Cloud Function name,
//  we are going to expose it using export. 
// Our function will receive an express server object(this case main)
export const webApi = functions.https.onRequest(main);

// Creating our first service
// Let's expose a GET endpoint returning just a string.
app.get('/warm', (req, res) => {
    res.send('Calentando para la pelea');
})

curl -d '{"winner":"levi", "losser":"henry", "title": "fight1"}' -H "Content-Type: application/json" -X POST "https://github-ring-flakor.firebaseapp.com/api/v1/fights/"


// POST /fights/
// We get our post data using request.body
// We use add() method to add a new fight, if the collection doesn't exist (our case), it will create it automatically.
// In order to get the actual record data, we must use get() over the ref.
// Return a json using response.json.

// # Testing create fight (POST /fights)
// $ curl -d '{"winner":"levi", "losser":"henry", "title": "fight1"}' -H "Content-Type: application/json" -X POST "https://github-ring-flakor.firebaseapp.com/api/v1/fights/"

// > {"id":"zC9QORei07hklkKUB1Gl","data":{"title":"fight1","winner":"levi","losser":"henry"}


app.post('/fights', async (request, response) => {
    try {
      const { winner, loser, title } = request.body;
      const data = {
        winner,
        loser,
        title
      } 
      const fightRef = await db.collection('fights').add(data);
      const fight = await fightRef.get();
  
      response.json({
        id: fightRef.id,
        data: fight.data()
      });
  
    } catch(error){
  
      response.status(500).send(error);
  
    }
  });

// GET /fights/:id
// We get the fight id using request.params.
// We validate if the id is not blank.
// We get the fight and check if it exists.
// If fight doesn't exist we throw an error
// If fight exists, we return the data.

  app.get('/fights/:id', async (request, response) => {
    try {
      const fightId = request.params.id;
  
      if (!fightId) throw new Error('Fight ID is required');
  
      const fight = await db.collection('fights').doc(fightId).get();
  
      if (!fight.exists){
          throw new Error('Fight doesnt exist.')
      }
  
      response.json({
        id: fight.id,
        data: fight.data()
      });
  
    } catch(error){
  
      response.status(500).send(error);
  
    }
  
  });

// GET /fights/
// We get a collection snapshot.
// We iterate over every document and push the data into an array.
// We return our fight list.

app.get('/fights', async (request, response) => {
    try {
  
      const fightQuerySnapshot = await db.collection('fights').get();
      const fights: any = [];
      fightQuerySnapshot.forEach(
          (doc) => {
              fights.push({
                  id: doc.id,
                  data: doc.data()
              });
          }
      );
  
      response.json(fights);
  
    } catch(error){
  
      response.status(500).send(error);
  
    }
  
  });

// PUT /fights/:id
// We get request data.
// We validate the data
// We update a record using set(data, merge: true). 
// It means it is going to update only the fields passed on data parameter.

app.put('/fights/:id', async (request, response) => {
    try {
  
      const fightId = request.params.id;
      const title = request.body.title;
  
      if (!fightId) throw new Error('id is blank');
  
      if (!title) throw new Error('Title is required');
  
      const data = { 
          title
      };
        await db.collection('fights')
          .doc(fightId)
          .set(data, { merge: true });
  
      response.json({
          id: fightId,
          data
      })
  
  
    } catch(error){
  
      response.status(500).send(error);
  
    }
  
  });

// DELETE /fights/:id
// We get the fight id.
// We use delete() in order to delete a doc instance 
// (Remember that firestore is database based on documents( "NoSQL" ))

app.delete('/fights/:id', async (request, response) => {
    try {
  
      const fightId = request.params.id;
  
      if (!fightId) throw new Error('id is blank');
  
      await db.collection('fights')
          .doc(fightId)
          .delete();
  
      response.json({
          id: fightId,
      })
  
  
    } catch(error){
  
      response.status(500).send(error);
  
    }
  
  });
  
  

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
