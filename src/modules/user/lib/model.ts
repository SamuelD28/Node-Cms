import crypto, { Hmac } from 'crypto';
import Jwt from 'jsonwebtoken';
import uuidv1 from 'uuid/v1';

/**
 * User Schema that will be stored in the database
 */
class User {
    private Id: string;
    private Username: string;
    private Email: string;
    private Password: string;
    private Token: string;

    constructor(username: string,
        email: string,
        password: string) {

        this.Id = uuidv1();
        this.Email = email;
        this.Username = username;
        this.Token = "";

        let saltLength = this.GetSaltLength(this.Id);
        let salt = this.GenerateSalt(saltLength);
        this.Password = this.HashPassword(password, salt);
    }

    /**
     * @description Method that generate a random salt lenght
     * based on the user id
     *
     * @param id Id of the user id
     * @return Salt length
     */
    GetSaltLength(id: string)
        : number {
        let length: number = 0;
        let idNumbers: string = "";
        for (let i = 0; i < id.length; i++) {
            if (!isNaN(Number(id[i]))) {
                idNumbers = idNumbers.concat(id[i])
            }
        }
        for (let i = 0; i < idNumbers.length; i++) {
            length = length + Number(idNumbers[i]);
        }

        return length;
    }

    /**
     * @description Method that generate a random salt for password hashing
     *
     * @param p_length Length of the salt to generate
     */
    GenerateSalt(p_length: number)
        : string {
        return crypto.randomBytes(Math.ceil(p_length / 2))
            .toString('hex')
            .slice(0, p_length);
    }

    /**
     * @description Method used to hash the password specified by
     * the user.
     *
     * @param password Password set by the user
     * @param salt Generated salt for the user
     */
    HashPassword(password: string, p_salt: string)
        : string {
        let hash: Hmac = crypto.createHmac('sha512', p_salt);
        hash.update(password);

        let hashedPassword: string = hash.digest('hex');
        return hashedPassword + p_salt;
    }

    /**
     * @description Method that verify if the password passed to the function
     * match the password saved for the user
     *
     * @param password Password to verify
     */
    PasswordMatch(password: string)
        : boolean {
        let passwordLength = this.Password.length;
        let saltLength = this.GetSaltLength(this.Id);

        let passwordStored = this.Password.substring(0, passwordLength - saltLength);
        let saltStored = this.Password.substring(passwordLength - saltLength, passwordLength);

        let hashedPassword: string = this.HashPassword(password, saltStored);
        let passwordReceived = hashedPassword.substring(0, hashedPassword.length - saltLength);

        return passwordStored === passwordReceived;
    }

    /**
     * @description Method used to save a token in the user
     */
    SaveToken()
        : void {
        this.Token = Jwt.sign(this.Id, <string>process.env.SECRET);
    }

    /**
     * @description Method used to clear the token
     */
    RemoveToken()
        : void {
        this.Token = "";
    }
}

export default User;