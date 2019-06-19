import { MongoClient } from 'mongodb';

const client = new MongoClient(
    <string>process.env.DATABASE_URL,
    { useNewUrlParser: true }
);

client.connect((err) => {
    if (err) {
        throw (err.message);
    }
    client.db(<string>process.env.DATABASE_NAME);
    client.close();
});

export default client;