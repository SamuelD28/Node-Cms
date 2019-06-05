import crypto, { Hmac } from 'crypto';
import mongoose, { Document, Model } from 'mongoose';
import Jwt from 'jsonwebtoken';

/**
 * @description Interface of the user document that will be stored
 * in the database. Incudes attributes and method specific to
 * the user document
 */
interface IUser extends Document {
    username: string,
    email: string,
    password: string,
    token: string,
    /**
     * @description Method used to hash the password specified by
     * the user.
     *
     * @param password Password set by the user
     * @param salt Generated salt for the user
     */
    HashPassword(password: string, salt?: string): string;
    /**
     * @description Method that verify if the password passed to the function
     * match the password saved for the user
     *
     * @param password Password to verify
     */
    PasswordMatch(p_password: string, cb: (match: boolean) => void): void;
    /**
     * @description Method that generate a random salt lenght
     * based on the user id
     *
     * @param userId Id of the user id
     * @return Salt length
     */
    GetSaltLength(userId: string): number;
    /**
     * @description Method used to save a token in the user
     */
    SaveToken(): void;
    /**
     * @description Method used to clear the token
     */
    RemoveToken(): void;
}

/**
 * @description Interface used to specify statics methods
 * that will be used for the user model
 */
interface IUserModel extends Model<IUser> {
    GenerateSalt(length: number): string;
    FindByToken(token: string, cb: (err: string | null, user: IUser | null) => void): void;
}

/**
 * User Schema that will be stored in the database
 */
let UserSchema = new mongoose.Schema({
    username: {
        type: String,
        minlength: 4,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    token: {
        type: String,
        default: "",
        select: false
    },
},
    {
        timestamps: true,
        versionKey: false,
    }
);

UserSchema.methods.GetSaltLength = function (userId: string): number {
    let length: number = 0;
    let idNumbers: string = "";
    for (let i = 0; i < userId.length; i++) {
        if (!isNaN(Number(userId[i]))) {
            idNumbers = idNumbers.concat(userId[i])
        }
    }
    for (let i = 0; i < idNumbers.length; i++) {
        length = length + Number(idNumbers[i]);
    }

    return length;
}

UserSchema.statics.GenerateSalt = function (p_length: number): string {
    return crypto.randomBytes(Math.ceil(p_length / 2))
        .toString('hex')
        .slice(0, p_length);
}

UserSchema.methods.HashPassword = function (p_password: string, p_salt: string): string {
    let hash: Hmac = crypto.createHmac('sha512', p_salt);
    hash.update(p_password);

    let hashedPassword: string = hash.digest('hex');
    return hashedPassword + p_salt;
}

UserSchema.methods.PasswordMatch = function (p_password: string, cb: (match: boolean) => void) {
    User.findOne({ username: this.username })
        .select('password')
        .then((user) => {
            if (user) {
                let passwordLength = user.password.length;
                let saltLength = UserSchema.methods.GetSaltLength(this.id);

                let passwordStored = user.password.substring(0, passwordLength - saltLength);
                let saltStored = user.password.substring(passwordLength - saltLength, passwordLength);

                let hashedPassword: string = UserSchema.methods.HashPassword(p_password, saltStored);
                let passwordReceived = hashedPassword.substring(0, hashedPassword.length - saltLength);

                cb(passwordStored === passwordReceived);
            }
            else {
                throw new Error();
            }
        })
        .catch((err) => {
            console.log(err);
            cb(false);
        });
}

UserSchema.methods.SaveToken = function () {
    this.token = Jwt.sign(this.id, <string>process.env.SECRET);
    this.save();
}

UserSchema.methods.RemoveToken = function () {
    this.token = "";
    this.save();
}

UserSchema.statics.FindByToken = function (token: string, cb: (err: string | null, user: IUser | null) => void) {
    Jwt.verify(token, <string>process.env.SECRET, function (err, decoded) {
        User.findOne({ "_id": decoded, "token": token })
            .then((user) => {
                if (user) {
                    cb(null, user);
                } else {
                    throw new Error("No user with specified token");
                }
            })
            .catch((err: Error) => {
                cb(err.message, null);
            });
    });
}

/**
 * Trigger before saving the document. Hashed to password if a new
 * password was passed to the document.
 */
UserSchema.pre<IUser>('save', function (next) {
    if (this.isModified("password")) {
        let saltLength = UserSchema.methods.GetSaltLength(this.id);
        let salt = UserSchema.statics.GenerateSalt(saltLength);
        this.password = UserSchema.methods.HashPassword(this.password, salt);
    }
    next();
});


const User: IUserModel = mongoose.model<IUser, IUserModel>("user", UserSchema);

export { User, IUser, IUserModel };