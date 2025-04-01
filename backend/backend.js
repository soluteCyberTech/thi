const express=require('express')
const mysql =require('mysql')
const cors =require('cors')
const path=require('path')

const passwordHash = require('password-hash');

const app =express()

app.use(express.static(path.join(__dirname , "public")))
app.use(cors())
app.use(express.json())

const port=5000

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

const db =mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"asssoft"
})


db.connect(err => {
    if (err) {
        console.error('connection failed:', err);
        return;
    }
    console.log('Connected to MySQL!!!');
});


const query = (sql, values) => {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (error, results) => {
            if (error) reject(error);
            resolve(results);
        });
    });
};



// activation
app.get("/", (req, res)=>{
    try {
        
  
    const sql ='Select * FROM  assembly'
    db.query(sql ,(err ,data)=>{

        if(err) return res.json('Error')
        
        return res.json(data)
        
    })

} catch (error) {
        
}

})


app.post('/createstaff' ,async (req ,res)=>{

    try {
        
 
    const { data } = req.body;

    await query('START TRANSACTION');

    for (const row of data) {

         await query (`insert into  staff (name , emain , department ,	role , staff_id , username , pass ) VALUES (?,?,?,?,?,?,?)`,
        
            [
            row.name,
            row.email ,
            row.department,
            row.role,
            row.StaffId,
            row.username ,
           passwordHash.generate(row.Password)
        ]
    )
        
    }

        await query ('UPDATE assembly SET name=?, mmda=?, region =?, location=?, digital_add=?, email=?, phone=? ,logo=? ,state=? WHERE trans_code= '+req.body.ActivationId +' ' ,
        
            [req.body.assname,
                    req.body.mmda ,
                    req.body.regions ,
                    req.body.location ,
                    req.body.digitaladd ,
                    req.body.email ,
                    req.body.Phone ,
                    req.body.companylogo,
                    req.body.state 
                ]          

                
            )

            

    await query('COMMIT');
    res.json({ 
        success: true, 
        message: 'Data imported successfully'
        
       // return res.json(data)
    });


    

    } catch (error) {

        await query('ROLLBACK');
        console.error('Import error:', error);
        res.status(500).json({
            success: false,
            message: 'Error importing data',
            error: error.message
        });
        
    }

})




app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const sql = 'SELECT * FROM staff WHERE username = ?';
        const user = await query(sql, [username]);

        if (user.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const validPassword = passwordHash.verify(password, user[0].pass);
        
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const userInfo = {
            trans_code: user[0].trans_code,
            name: user[0].name,
            email: user[0].emain,
            department: user[0].department,
            role: user[0].role,
            staff_id: user[0].staff_id,
            is_staff: user[0].is_staff
        };

        res.json({
            success: true,
            message: 'Login successful',
            user: userInfo
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login'
        });
    }
});



app.post('/changepassword', async (req, res) => {
    try {
        const {password ,trans_code } = req.body;
        const validPassword = passwordHash.generate(password)
        const is_active=1;
        const is_staff=1
        const sql = 'UPDATE staff SET pass= ? ,is_active=? ,is_staff=? WHERE trans_code=? ';
         await query(sql, [validPassword ,is_active ,is_staff ,trans_code]);

        res.json({
            success: true,
            message: 'Login successful',
          
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login'
        });
    }
});



app.listen(port ,()=>{
    console.log('Connection Up And Runing........')
})