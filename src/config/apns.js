import apn from "node-apn";
import dotenv from "dotenv"


const options ={
    token:{
        key:process.env.APNS_KEY_FILE,
        keyId:process.env.APNS_KEY_ID,
        teamId:process.env.APNS_TEAM_ID
    },
    production:false
}

const apnProvider = new apn.Provider(options);



export default apnProvider;