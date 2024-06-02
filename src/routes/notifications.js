import express from "express";
const router = express.Router();

// Inject a cookies in this route
router.get("/", (req,res)=>{

    res.status(200).json("Teste  router")

})






export default router;



