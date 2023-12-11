const express = require("express");
const app=express();
var mysql = require("mysql2");
const cors = require("cors")
app.use(express.json());
app.use(cors());
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "ration",
  });
  con.connect((err) => {
    if (err) {
      res.send("Error=>" + err);
    }
  });
  // app.post("/login",(req,res)=>{
  //   let username=req.body.username;
  //   let password=req.body.password;
  //   let cardno=req.body.cardno;
  //   let cardholdersname=req.body.cardholdersname;
  //   let phonenumber=req.body.phonenumber;
  //   let address=req.body.address;
  //   let sql="INSERT INTO `ration`.`login` (`Username`, `Password`, `Cardno`) VALUES ('"+username+"', '"+password+"', '"+cardno+"');"
  //   con.query(sql,(err,result)=>{
  //     if(err){
  //       res.send("Error=>"+err);
  //     }
  //     else
  //     {
  //       res.send("RESULT=> "+JSON.stringify(result));
  //     }
  //   });
  // });


  //Add details of customer to the customer table//
  app.post("/login", async (req, res) => {
    try {
      let username = req.body.username;
      let password = req.body.password;
      let cardno = req.body.cardno;
  
      // First Query
      let sql1 = "INSERT INTO `ration`.`login` (`Username`, `Password`, `Cardno`) VALUES ('"+username+"', '"+password+"', '"+cardno+"');";
      let result1 = await query(sql1, [username, password, cardno]);
  
      // Second Query
      let cardholdersname = req.body.cardholdersname;
      let phonenumber = req.body.phonenumber;
      let address = req.body.address;
  
      let sql2 = "INSERT INTO `ration`.`customer` (`Name`, `Address`, `Cardno`, `Username`,`PhoneNo`) VALUES ('"+cardholdersname+"', '"+address+"', '"+cardno+"', '"+username+"','"+phonenumber+"');";
      let result2 = await query(sql2, [cardholdersname, address, cardno, username]);
  
      res.send("Results => " + JSON.stringify({ result1, result2 }));
    } catch (err) {
      res.send("Error => " + err);
    }
  });
  
  function query(sql, values) {
    return new Promise((resolve, reject) => {
      con.query(sql, values, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
  
  // app.post("/confirm",(req,res)=>{
  //   let username=req.body.username;
  //   let password=req.body.password;
  //   let sql="SELECT id from user where username='"+username+"' and password='"+password+"';"
  //   // res.send(sql);
  //   con.query(sql, (err, result) => {
  //     if (err) {
  //       res.send("Error");
  //     } else {
  //       res.send("Result");
  //     }
  //   });
  // });



  //verification of customer login//
  app.post("/confirm", (req, res) => {

    let username = req.body.username;
    let password = req.body.password;
  
    let sql="SELECT username FROM ration.login where username='"+username+"' and password='"+password+"';"
  
    con.query(sql, [username, password], (err, result) => {
      if (err) {
        res.status(500).send("Internal Server Error");
      } else {
        if (result.length > 0) {
          res.json({ success: true, userId: result[0].id });
        } else {
          res.json({ success: false });
        }
      }
    });
  });




  //Fetching details of customer in customer view//
  app.get("/data", (req,res)=>{
  
    let username=req.query.username;
    let sql="SELECT Name,Address,Cardno,PhoneNo FROM ration.customer where username='"+username+"';"
    con.query(sql, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
   
      // Send the results to the frontend
      res.json(results);
    });
  });





  //Insert a booking appointment in booking//
  app.post("/book", (req, res) => {

    let username = req.body.username;
    let date = req.body.date;
  
    let sql="INSERT INTO `ration`.`booking` (`username`, `date`) VALUES ('"+username+"', '"+date+"');"
  
    con.query(sql, [username, date], (err, result) => {
      if (err) {
        console.error("Error executing SQL: " + err.stack);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        return;
      }
  
      // Check if the insertion was successful
      if (result.affectedRows === 1) {
        res.status(201).json({ success: true, message: "Insertion successful" });
      } else {
        res.status(500).json({ success: false, message: "Insertion failed" });
      }
    });
  });







  //Show all booking appointments//
  app.get("/bookdata", (req,res)=>{
  
    let username=req.query.username;
    let sql="SELECT idbooking,date from ration.booking where username='"+username+"';"
    con.query(sql, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
   
      // Send the results to the frontend
      res.json(results);
    });
  });



  //Viewing data of Customer from Shopkeepers page//
  app.get("/viewdata", (req,res)=>{
  
    let cardno=req.query.cardno;
    let sql="SELECT Name,Address,PhoneNo,CardNo from ration.customer where Cardno='"+cardno+"';"
    con.query(sql, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
   
      // Send the results to the frontend
      res.json(results);
    });
  });


  //To view all appointments from the shopkeeeper's viewpoint//
  app.get("/viewappointments", (req,res)=>{
  
    let sql="SELECT idbooking,date,username from ration.booking;"
    con.query(sql, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
   
      // Send the results to the frontend
      res.json(results);
    });
  });



  //Shopkeeper's Login Verification//
  app.post("/confirmshopkeeper", (req, res) => {

    let username = req.body.username;
    let password = req.body.password;
  
    let sql="SELECT username FROM ration.shopkeeper where username='"+username+"' and password='"+password+"';"
  
    con.query(sql, [username, password], (err, result) => {
      if (err) {
        res.status(500).send("Internal Server Error");
      } else {
        if (result.length > 0) {
          res.json({ success: true, userId: result[0].id });
        } else {
          res.json({ success: false });
        }
      }
    });
  });



//To view all shopkeepers details from Admin//
  app.get("/viewshopkeeper", (req,res)=>{
  
    let sql="SELECT ShopkeeperID,Name,Address FROM ration.shopkeeper;"
    con.query(sql, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
   
      // Send the results to the frontend
      res.json(results);
    });
  });


// To view items for shopkeeper//
  app.get("/viewitems", (req,res)=>{
    
    let username=req.query.username;
    
    let sql="select ration.product.name,quantity,price from ration.shopkeeper,ration.product where ration.shopkeeper.ShopkeeperID=ration.product.ShopkeeperID and ration.shopkeeper.username='"+username+"';"
    con.query(sql, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
      
      // Send the results to the frontend
      res.json(results);
    });
  });



  //Add transaction details//
  app.post("/addtransaction", (req, res) => {
    let username=req.body.username;
    let cardno = req.body.cardno;
    let date = req.body.date;
    let price=req.body.price;
    let sugar=req.body.sugar;
    let kerosene=req.body.kerosene;
    let rice=req.body.rice;
  
    let sql="INSERT INTO `ration`.`transaction` (`TransactionDate`, `TotalAmount`, `Cardno`, `Rice`, `Kerosene`, `Sugar`) VALUES ('"+date+"', '"+price+"', '"+cardno+"', '"+rice+"', '"+kerosene+"', '"+sugar+"');"
  
    con.query(sql, [date, price, cardno, rice, kerosene, sugar], (err, result) => {
      if (err) {
        console.error("Error executing SQL: " + err.stack);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        return;
      }
  
      // Check if the insertion was successful
      if (result.affectedRows === 1) {
        res.status(201).json({ success: true, message: "Insertion successful" });
      } else {
        res.status(500).json({ success: false, message: "Insertion failed" });
      }
    });
  });





  //View of transaction in customer//
  app.get("/customertransaction", (req,res)=>{
    
    let username=req.query.username;
    
    let sql="SELECT TransID,TransactionDate,TotalAmount,Rice,Kerosene,Sugar from ration.transaction natural join ration.customer where username='"+username+"';"
    con.query(sql, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
      
      // Send the results to the frontend
      res.json(results);
    });
  });






  //Add stock by admin//
  app.post("/addstock", (req, res) => {

    let itemname = req.body.itemname;
    let quantity = req.body.quantity;
    let price=req.body.price;
    let shopkeeperid=req.body.shopkeeperid;
      let sql="update ration.product set Quantity='"+quantity+"',Price='"+price+"' where name='"+itemname+"' and shopkeeperid='"+shopkeeperid+"';"
  
    con.query(sql, [quantity,price], (err, result) => {
      if (err) {
        console.error("Error executing SQL: " + err.stack);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        return;
      }
  
      // Check if the insertion was successful
      if (result.affectedRows === 1) {
        res.status(201).json({ success: true, message: "Insertion successful" });
      } else {
        res.status(500).json({ success: false, message: "Insertion failed" });
      }
    });
  });



  //Admin verification//
  app.post("/confirmadmin", (req, res) => {

    let username = req.body.username;
    let password = req.body.password;
  
    let sql="SELECT username FROM ration.admin where username='"+username+"' and password='"+password+"';"
  
    con.query(sql, [username, password], (err, result) => {
      if (err) {
        res.status(500).send("Internal Server Error");
      } else {
        if (result.length > 0) {
          res.json({ success: true, userId: result[0].id });
        } else {
          res.json({ success: false });
        }
      }
    });
  });
app.listen(4000, () => {
    console.log("Server is running");
  });