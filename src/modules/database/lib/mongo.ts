import { MongoClient, Db, Collection } from 'mongodb';

/**
 * @description Utility class for talking with a mongo
 * database.
 *
 * @author Samuel Dube
 */
class MongoDatabase {
    private ConnectionString: string;
    private DbName: string;
    private Client: MongoClient | null;

    /**
     * @description Base constructor for the class. Lazy initialise
     * the mongo client.
     *
     * @param connectionString Connection string used to connect to the database
     * @param dbName Name of the database to access
     */
    constructor(connectionString: string, dbName: string) {
        this.DbName = dbName;
        this.ConnectionString = connectionString;
        this.Client = null;
    }

    /**
     * @description Method that returns a database object of the specified
     * database.
     *
     * @param action Callback function to pass the database object to.
     */
    public async GetDb(action: (db: Db) => void)
        : Promise<boolean> {

        //Lazy initialisation
        if (this.Client === null) {
            this.Client = await new MongoClient(
                this.ConnectionString,
                { useNewUrlParser: true })
                .connect();
        }

        action(this.Client.db(this.DbName));
        return true;
    }

    /**
     * @description Method that return a collection object from a specific
     * database.
     *
     * @param name Name of the collection to retrieve
     * @param action Callback function to pass the collection object to.
     */
    public GetCollection(name: string, action: (collection: Collection) => void)
        : boolean {
        this.GetDb((db) => {
            action(db.collection(name));
        });
        return true;
    }

    /**
     * @description Method that create a new collection inside a database
     *
     * @param name Name of the collection to create
     */
    public CreateCollection(name: string)
        : boolean {
        this.GetDb((db) => {
            db.createCollection(name);
        });
        return true;
    }

    /**
     * @description Methodd that insert a single or multiple set of data inside a collection
     *
     * @param name Name of the collection to insert the data into
     * @param data Data to insert inside the collection
     */
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

    /**
     * @description Method that delete a single or multiple object
     * inside a collection based on a mongo condition
     *
     * @param name Name of the collection to remove the data from
     * @param condition Condition for removing the data
     */
    public DeleteInCollection(name: string, condition: Object)
        : boolean {
        this.GetCollection(name, (collection) => {
            collection.deleteMany(condition);
        });
        return true;
    }

    /**
     * @description Method that update a single or muliple data set
     * inside a collection
     *
     * @param name Name of the collection
     * @param condition Condition for updating a data set
     * @param data New data to override the old data with
     */
    public UpdateInCollection(name: string, condition: Object, data: Object)
        : boolean {
        this.GetCollection(name, (collection) => {
            collection.updateOne(condition, data);
        });
        return true;
    }
}

export default MongoDatabase;