import { MongoClient, Db, Collection } from 'mongodb';

class MongoDatabase {
    private ConnectionString: string;
    private DbName: string;
    private Client: MongoClient | null;

    constructor(connectionString: string, dbName: string) {
        this.DbName = dbName;
        this.ConnectionString = connectionString;
        this.Client = null;
        this.GetDb(() => console.log("Connection test"));
        this.CreateCollection("Test");
        this.InsertInCollection("Test", { Hey: "Test" });
        this.UpdateInCollection("Test", { Hey: "Test" }, { $set: { Hey: "Miel" } });
    }

    public async GetDb(action: (db: Db) => void)
        : Promise<boolean> {
        if (this.Client === null) {
            this.Client = await new MongoClient(
                this.ConnectionString,
                { useNewUrlParser: true })
                .connect();
        }

        action(this.Client.db(this.DbName));
        return true;
    }

    public GetCollection(name: string, action: (collection: Collection) => void)
        : boolean {
        this.GetDb((db) => {
            action(db.collection(name));
        });
        return true;
    }

    public CreateCollection(name: string)
        : boolean {
        this.GetDb((db) => {
            db.createCollection(name);
        });
        return true;
    }

    public InsertInCollection(name: string, data: Object | Array<any>)
        : boolean {
        this.GetCollection(name, (collection) => {
            if (data instanceof Object) {
                collection.insertOne(data);
            } else {
                collection.insertMany(data);
            }
        })
        return true;
    }

    public DeleteInCollection(name: string, condition: Object)
        : boolean {
        this.GetCollection(name, (collection) => {
            collection.deleteMany(condition);
        });
        return true;
    }

    public UpdateInCollection(name: string, condition: Object, data: Object)
        : boolean {
        this.GetCollection(name, (collection) => {
            collection.updateOne(condition, data);
        });
        return true;
    }
}

export default MongoDatabase;