const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const path = require('path')

const passwordHash = require('password-hash');

const app = express()

app.use(express.static(path.join(__dirname, "public")))



app.use(express.json({
    limit: '50mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

app.use(express.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 100000
}));


app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: false,
    maxAge: 3600,
    preflightContinue: false,
}));

const port = 5000
app.use(express.json({ limit: '50mb' }));
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "asssoft"
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
app.get("/", (req, res) => {
    try {


        const sql = 'Select * FROM  assembly'
        db.query(sql, (err, data) => {

            if (err) return res.json('Error')

            return res.json(data)

        })

    } catch (error) {

    }

})


app.post('/createstaff', async (req, res) => {

    try {


        const { data } = req.body;

        await query('START TRANSACTION');

        for (const row of data) {

            await query(`insert into  staff (name , emain , department ,	role , staff_id , username , pass ) VALUES (?,?,?,?,?,?,?)`,

                [
                    row.name,
                    row.email,
                    row.department,
                    row.role,
                    row.StaffId,
                    row.username,
                    passwordHash.generate(row.Password)
                ]
            )

        }

        await query('UPDATE assembly SET name=?, mmda=?, region =?, location=?, digital_add=?, email=?, phone=? ,logo=? ,state=? WHERE trans_code= ' + req.body.ActivationId + ' ',

            [req.body.assname,
            req.body.mmda,
            req.body.regions,
            req.body.location,
            req.body.digitaladd,
            req.body.email,
            req.body.Phone,
            req.body.companylogo,
            req.body.state
            ]


        )



        await query('COMMIT');
        res.json({
            success: true,
            message: 'Data imported successfully'

           
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

        const sql = 'SELECT * FROM staff WHERE emain = ?';
        const user = await query(sql, [username]);

        if (user.length === 0 || !passwordHash.verify(password, user[0].pass)) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }


        const userInfo = {
            id: user[0].trans_code,
            name: user[0].name,
            email: user[0].emain,
            department: user[0].department,
            role: user[0].role,
            staff_id: user[0].trans_code,

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

        const { password, trans_code } = req.body;

        const validPassword = passwordHash.generate(password)
        const is_active = 1;
        const is_staff = 1
        const sql = 'UPDATE staff SET pass= ? ,is_active=? ,is_staff=? WHERE trans_code=? ';
        await query(sql, [validPassword, is_active, is_staff, trans_code]);

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

// Get all depar
app.get('/departments', async (req, res) => {
    try {
        const departments = await query('SELECT * FROM departments ORDER BY name ASC');
        res.json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching departments'
        });
    }
});

// new depar
app.post('/departments', async (req, res) => {
    try {
        const { name, description } = req.body;
        console.log('Name:', name);

        console.log('Description:', description);

        await query('START TRANSACTION');

        const existing = await query('SELECT id FROM departments WHERE name = ?', [name]);
        if (existing.length > 0) {
            await query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Department name already exists'
            });
        }

        await query(
            'INSERT INTO departments (name, description) VALUES (?, ?)',
            [name, description]
        );

        await query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Department created successfully'
        });
    } catch (error) {
        await query('ROLLBACK');
        res.status(500).json({
            success: false,
            message: 'Error creating department'
        });
    }
});

// Update depart
app.put('/departments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        await query('START TRANSACTION');




        const existing = await query(
            'SELECT id FROM departments WHERE name = ? AND id != ?',
            [name, id]
        );
        if (existing.length > 0) {
            await query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Department name already exists'
            });
        }


        await query(
            'UPDATE departments SET name = ?, description = ? WHERE id = ?',
            [name, description, id]
        );

        await query('COMMIT');

        res.json({
            success: true,
            message: 'Department updated successfully'
        });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error updating department:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating department'
        });
    }
});

// Delete depar
app.delete('/departments/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await query('START TRANSACTION');


        const department = await query('SELECT id FROM departments WHERE id = ?', [id]);
        if (department.length === 0) {
            await query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }


        await query('DELETE FROM departments WHERE id = ?', [id]);

        await query('COMMIT');

        res.json({
            success: true,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error deleting department:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting department'
        });
    }
});


// Get all
app.get('/hod', async (req, res) => {
    try {
        const hods = await query(`
            SELECT h.*, d.name as department_name 
            FROM head_of_departments h
            JOIN departments d ON h.department_id = d.id
            ORDER BY h.name ASC
        `);
        res.json(hods);
    } catch (error) {
        console.error('Error fetching HODs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching HODs'
        });
    }
});

// new HOD
app.post('/hod', async (req, res) => {
    try {
        const { name, email, phone, department_id } = req.body;

        await query('START TRANSACTION');


        const existingStaff = await query('SELECT trans_code FROM staff WHERE emain = ?', [email]);
        if (existingStaff.length > 0) {
            await query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Email already registered as staff member'
            });
        }


        const existingHOD = await query('SELECT id FROM head_of_departments WHERE email = ?', [email]);
        if (existingHOD.length > 0) {
            await query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Email already exists as HOD'
            });
        }


        const existingDeptHOD = await query('SELECT id FROM head_of_departments WHERE department_id = ?', [department_id]);
        if (existingDeptHOD.length > 0) {
            await query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Department already has an HOD assigned'
            });
        }


        const department = await query('SELECT name FROM departments WHERE id = ?', [department_id]);
        const departmentName = department[0].name;


        const staffResult = await query(
            'INSERT INTO staff (name, emain, department, role, username, pass, is_staff, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                name,
                email,
                departmentName,
                'Head of Department',
                email,
                passwordHash.generate(email),
                0,
                1
            ]
        );
        
        const staffId = staffResult.insertId;

        await query(
            'INSERT INTO head_of_departments (name, email, phone, department_id, staff_id) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone, department_id, staffId]
        );

        await query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'HOD account created successfully. Default password is their email address.'
        });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error creating HOD:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating HOD account'
        });
    }
});

// Update HOD
app.put('/hod/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, department_id } = req.body;

        await query('START TRANSACTION');


        const currentHOD = await query('SELECT staff_id, email FROM head_of_departments WHERE id = ?', [id]);
        if (currentHOD.length === 0) {
            await query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'HOD not found'
            });
        }


        if (email !== currentHOD[0].email) {
            const existingStaff = await query('SELECT trans_code FROM staff WHERE emain = ? AND trans_code != ?',
                [email, currentHOD[0].staff_id]);
            if (existingStaff.length > 0) {
                await query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered as staff member'
                });
            }

            const existingHOD = await query('SELECT id FROM head_of_departments WHERE email = ? AND id != ?',
                [email, id]);
            if (existingHOD.length > 0) {
                await query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists as HOD'
                });
            }
        }


        const existingDeptHOD = await query(
            'SELECT id FROM head_of_departments WHERE department_id = ? AND id != ?',
            [department_id, id]
        );
        if (existingDeptHOD.length > 0) {
            await query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Department already has an HOD assigned'
            });
        }


        const department = await query('SELECT name FROM departments WHERE id = ?', [department_id]);
        const departmentName = department[0].name;

        await query(
            'UPDATE staff SET name = ?, emain = ?, department = ? WHERE trans_code = ?',
            [name, email, departmentName, currentHOD[0].staff_id]
        );


        await query(
            'UPDATE head_of_departments SET name = ?, email = ?, phone = ?, department_id = ? WHERE id = ?',
            [name, email, phone, department_id, id]
        );

        await query('COMMIT');

        res.json({
            success: true,
            message: 'HOD updated successfully'
        });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error updating HOD:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating HOD'
        });
    }
});

// Delete HOD
app.delete('/hod/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await query('START TRANSACTION');

        const hod = await query('SELECT id, staff_id FROM head_of_departments WHERE id = ?', [id]);
        if (hod.length === 0) {
            await query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'HOD not found'
            });
        }

        await query('DELETE FROM head_of_departments WHERE id = ?', [id]);

        await query('DELETE FROM staff WHERE trans_code = ?', [hod[0].staff_id]);

        await query('COMMIT');

        res.json({
            success: true,
            message: 'HOD deleted successfully'
        });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error deleting HOD:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting HOD'
        });
    }
});

// Get all designations
app.get('/designations', async (req, res) => {
    try {

        const designations = await query('SELECT * FROM designations ORDER BY title ASC');
        res.json(designations);

    } catch (error) {
        console.error('Error fetching designations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching designations'
        });
    }
});

// Create designation
app.post('/designations', async (req, res) => {
    try {
        const { title, description } = req.body;

        await query('START TRANSACTION');

        const existing = await query('SELECT id FROM designations WHERE title = ?', [title]);
        if (existing.length > 0) {
            await query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Designation title already exists'
            });
        }

        await query(
            'INSERT INTO designations (title, description) VALUES (?, ?)',
            [title, description]
        );

        await query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Designation created successfully'
        });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error creating designation:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating designation'
        });
    }
});

// Update designation
app.put('/designations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        await query('START TRANSACTION');

        const existing = await query(
            'SELECT id FROM designations WHERE title = ? AND id != ?',
            [title, id]
        );
        if (existing.length > 0) {
            await query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Designation title already exists'
            });
        }

        await query(
            'UPDATE designations SET title = ?, description = ? WHERE id = ?',
            [title, description, id]
        );

        await query('COMMIT');

        res.json({
            success: true,
            message: 'Designation updated successfully'
        });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error updating designation:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating designation'
        });
    }
});

// Delete designation
app.delete('/designations/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await query('START TRANSACTION');

        const designation = await query('SELECT id FROM designations WHERE id = ?', [id]);
        if (designation.length === 0) {
            await query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Designation not found'
            });
        }

        await query('DELETE FROM designations WHERE id = ?', [id]);

        await query('COMMIT');

        res.json({
            success: true,
            message: 'Designation deleted successfully'
        });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error deleting designation:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting designation'
        });
    }
});

// HOD Access 
app.get('/hod-access', async (req, res) => {
    try {
        const accesses = await query(`
            SELECT ha.*, 
                   COUNT(DISTINCT haa.hod_id) as assigned_count 
            FROM hod_access ha
            LEFT JOIN hod_access_assignments haa ON ha.id = haa.access_id
            GROUP BY ha.id
            ORDER BY ha.name ASC
        `);
        res.json(accesses);
    } catch (error) {
        console.error('Error fetching HOD access:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching HOD access types'
        });
    }
});

app.post('/hod-access', async (req, res) => {
    try {
        const { name } = req.body;

        await query('START TRANSACTION');

        const existing = await query('SELECT id FROM hod_access WHERE name = ?', [name]);
        if (existing.length > 0) {
            await query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Access name already exists'
            });
        }

        await query('INSERT INTO hod_access (name) VALUES (?)', [name]);

        await query('COMMIT');

        res.json({
            success: true,
            message: 'Access type created successfully'
        });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error creating access:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating access type'
        });
    }
});

app.delete('/hod-access/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await query('START TRANSACTION');

        const access = await query('SELECT id FROM hod_access WHERE id = ?', [id]);
        if (access.length === 0) {
            await query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Access type not found'
            });
        }

        await query('DELETE FROM hod_access_assignments WHERE access_id = ?', [id]);

        await query('DELETE FROM hod_access WHERE id = ?', [id]);

        await query('COMMIT');

        res.json({
            success: true,
            message: 'Access type deleted successfully'
        });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error deleting access:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting access type'
        });
    }
});

app.put('/hod-access/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        await query('START TRANSACTION');

        const existing = await query(
            'SELECT id FROM hod_access WHERE name = ? AND id != ?',
            [name, id]
        );
        if (existing.length > 0) {
            await query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Access name already exists'
            });
        }

        await query(
            'UPDATE hod_access SET name = ? WHERE id = ?',
            [name, id]
        );

        await query('COMMIT');

        res.json({
            success: true,
            message: 'Access updated successfully'
        });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error updating access:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating access'
        });
    }
});

app.get('/hod-assignments', async (req, res) => {
    try {
        const hods = await query(`
            SELECT 
                s.trans_code as id,
                s.name,
                s.emain as email,
                s.department as department_name
            FROM staff s
            WHERE s.role = 'Head of Department'
            ORDER BY s.name ASC
        `);
        res.json(hods);
    } catch (error) {
        console.error('Error fetching HODs:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching HODs'
        });
    }
});


app.get('/get_hod-assignments', async (req, res) => {
    try {
        const { hodId } = req.query;

        const assignments = await query(`
            SELECT access_id 
            FROM hod_access_assignments 
            WHERE hod_id = ?
        `, [hodId]);


        const accessIds = assignments.map(row => row.access_id);

        res.json({
            success: true,
            access_ids: accessIds
        });

    } catch (error) {
        console.error('Error fetching HOD assignments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching HOD assignments'
        });
    }
});

// Get 

app.get('/department-users', async (req, res) => {
    const { created_by } = req.query;
   

    try {
        const users = await query(`
            SELECT 
                du.id,
                du.name,
                du.email,
                du.phone,
                du.designation_id,
                des.title as designation_name
            FROM department_users du
            LEFT JOIN designations des ON du.designation_id = des.id
            WHERE du.department = ?
            ORDER BY du.name ASC
        `, [created_by]);

        res.json({
            success: true,
            users: users
        });

    } catch (error) {
        console.error('Error fetching department users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching department users'
        });
    }
});

// Create depart user
app.post('/department-users', async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            department_id,
            created_by,
            designation_id,
            username
        } = req.body;

        console.log('Request Body:', req.body);
        await query('START TRANSACTION');

        const existingEmail = await query(
            'SELECT trans_code FROM staff WHERE emain = ?',
            [email]
        );

        if (existingEmail.length > 0) {
            await query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }




        // Get designation
        const [designation] = await query(
            'SELECT title FROM designations WHERE id = ?',
            [designation_id]
        );
        if (!designation) {
            await query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Invalid designation'
            });
        }

        // Create staff account
        const staffResult = await query(
            `INSERT INTO staff (
                name, 
                emain, 
                department, 
                role, 
                username, 
                pass, 
                is_staff,
                is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                email,
                department_id,
                'Department User',
                email, passwordHash.generate(email),
                1,
                0
            ]
        );

        // Create 
        await query(
            `INSERT INTO department_users (
                name,
                email,
                phone,
                department,
                designation_id,
                created_by,
                staff_id,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                name,
                email,
                phone,
                department_id,
                designation_id,
                created_by,
                staffResult.insertId
            ]
        );

        await query('COMMIT');

        res.json({
            success: true,
            message: 'Department user created successfully',
            credentials: {
                username: email,
                initialPassword: email
            }
        });

    } catch (error) {
        await query('ROLLBACK');
        console.error('Error creating department user:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating department user',
            error: error.message
        });
    }
});

app.delete('/department-users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await query('START TRANSACTION');

       
        const [departmentUser] = await query(
            'SELECT staff_id FROM department_users WHERE id = ?',
            [id]
        );

        if (!departmentUser) {
            await query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Department user not found'
            });
        }
 
        await query(
            'DELETE FROM department_users WHERE id = ?',
            [id]
        );

        if (departmentUser.staff_id) {
            await query(
                'DELETE FROM staff WHERE trans_code = ?',
                [departmentUser.staff_id]
            );
        }

        await query('COMMIT');

        res.json({
            success: true,
            message: 'Department user deleted successfully'
        });

    } catch (error) {
        await query('ROLLBACK');
        console.error('Error deleting department user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting department user'
        });
    }
});

app.put('/department-users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, designation_id ,department_id} = req.body;

    try {
        await query('START TRANSACTION');

       
        const [existingUser] = await query(
            'SELECT staff_id FROM department_users WHERE id = ?',
            [id]
        );

        if (!existingUser) {
            await query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Department user not found'
            });
        }

       
        const [emailCheck] = await query(
            'SELECT id FROM department_users WHERE email = ? AND id != ?',
            [email, id]
        );

        if (emailCheck) {
            await query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Email already in use by another user'
            });
        }

       
        await query(`
            UPDATE department_users 
            SET 
                name = ?,
                email = ?,
                phone = ?,
                designation_id = ?
            WHERE id = ?
        `, [name, email, phone, designation_id, id]);

       
        if (existingUser.staff_id) {
            await query(`
                UPDATE staff 
                SET 
                    name = ?,
                    emain = ?,
                    department =?
                WHERE trans_code = ?
            `, [name, email,department_id, existingUser.staff_id]);
        }

        await query('COMMIT');

        res.json({
            success: true,
            message: 'User updated successfully'
        });

    } catch (error) {
        await query('ROLLBACK');
        console.error('Error updating department user:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating department user'
        });
    }
});

// Update user access assignments
app.put('/department-users/:userId/access', async (req, res) => {
    try {
        const { userId } = req.params;
        const { access_ids, hod_id } = req.body;

        await query('START TRANSACTION');

        
        

        const hodAccess = await query(`
            SELECT access_id FROM hod_access_assignments 
            WHERE hod_id = ? AND access_id IN (?)
        `, [hod_id, access_ids]);

        if (hodAccess.length !== access_ids.length) {
            await query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'You can only assign access that you have been granted'
            });
        }

        // Update access
        
        await query('DELETE FROM user_access_assignments WHERE user_id = ?', [userId]);

        if (access_ids && access_ids.length > 0) {
            const values = access_ids.map(access_id => [userId, access_id, hod_id]);
            await query(
                'INSERT INTO user_access_assignments (user_id, access_id, granted_by) VALUES ?',
                [values]
            );
        }

        await query('COMMIT');

        res.json({
            success: true,
            message: 'User access updated successfully'
        });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error updating user access:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user access'
        });
    }
});

// Get available access for HOA
app.get('/hoa-access', async (req, res) => {
    try {
        const access = await query(`
            SELECT * FROM all_access 
            WHERE section = 'HOA'
            ORDER BY name ASC
        `);
        res.json(access);
    } catch (error) {
        console.error('Error fetching HOA access:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching access list'
        });
    }
});

// Get available access for HOD
app.get('/hod-access/:hodId', async (req, res) => {
    try {
        const { hodId } = req.params;

        // Get access 
        
        const hodAccess = await query(`
            SELECT aa.* 
            FROM all_access aa
            JOIN hod_access_assignments haa ON aa.id = haa.access_id
            WHERE haa.hod_id = ? AND aa.section = 'HOD'
            ORDER BY aa.name ASC
        `, [hodId]);

        res.json(hodAccess);
    } catch (error) {
        console.error('Error fetching HOD access:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching access list'
        });
    }
});

// Assign access to HOD
app.post('/hod-assignments', async (req, res) => {
    try {
        const { hod_id, access_ids, granted_by } = req.body;

        await query('START TRANSACTION');

        await query('DELETE FROM hod_access_assignments WHERE hod_id = ?', [hod_id]);


        const values = access_ids.map(access_id => [hod_id, access_id, granted_by]);
        await query(
            'INSERT INTO hod_access_assignments (hod_id, access_id, granted_by) VALUES ?',
            [values]
        );

        await query('COMMIT');

        res.json({
            success: true,
            message: 'Access assignments updated successfully'
        });
    } catch (error) {
        await query('ROLLBACK');
        console.error('Error updating assignments:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating access assignments'
        });
    }
});

app.get('/all-access/:section', async (req, res) => {
    try {
        const { section } = req.params;

        const access = await query(`
            SELECT 
                id,
                name,
                description,
                is_core 
            FROM all_access 
            WHERE section = ? 
            AND is_core = 0
            ORDER BY name ASC
        `, [section]);

        res.json(access);


    } catch (error) {
        console.error('Error fetching access:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching access list'
        });
    }
});


app.get('/user-access', async (req, res) => {
    try {
        const { userId } = req.query;
        console.log('Fetching access for user:', userId);

        await query('START TRANSACTION');

      
        const [staffInfo] = await query(`
            SELECT role, department 
            FROM staff 
            WHERE trans_code = ?
        `, [userId]);

        let accessList = [];

        if (staffInfo?.role === 'Head of Department') {
            // For HODs 
            const hodAccess = await query(`
                SELECT 
                    aa.id,
                    aa.name,
                    aa.path,
                    aa.icon,
                    aa.section,
                    aa.is_core
                FROM all_access aa
                INNER JOIN hod_access_assignments haa ON aa.id = haa.access_id
                WHERE haa.hod_id = ? 
                ORDER BY aa.name ASC
            `, [userId]);

           
            const coreAccess = await query(`
                SELECT 
                    id,
                    name,
                    path,
                    icon,
                    section,
                    is_core
                FROM all_access 
                WHERE section = 'HOD' 
                AND is_core = 12
            `);

            accessList = [...coreAccess, ...hodAccess];

        } else if (staffInfo?.role === 'Department User') {
            console.log('Fetching access for Department User:', userId);
       
            accessList = await query(`
                SELECT 
                    aa.id,
                    aa.name,
                    aa.path,
                    aa.icon,
                    aa.section,
                    aa.is_core,
                    uaa.granted_at,
                    s.name as granted_by_name
                FROM user_access_assignments uaa
                INNER JOIN all_access aa ON uaa.access_id = aa.id
                LEFT JOIN staff s ON uaa.granted_by = s.trans_code
                WHERE uaa.user_id = ?
                ORDER BY aa.name ASC
            `, [userId]);
        }

        await query('COMMIT');

        res.json({
            success: true,
            access: accessList,
            role: staffInfo?.role,
            department: staffInfo?.department
        });

    } catch (error) {
        await query('ROLLBACK');
        console.error('Error fetching user access:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user access'
        });
    }
});

app.post('/api/nff-import', async (req, res) => {
    try {
        console.log('Received data:', req.body);

        const { data } = req.body;
        await query('START TRANSACTION');

        for (const row of data) {

            const metroValue = row.metro && !isNaN(row.metro) ? parseFloat(row.metro) : null;
            const municipalValue = row.municipal && !isNaN(row.municipal) ? parseFloat(row.municipal) : null;
            const districtValue = row.district && !isNaN(row.district) ? parseFloat(row.district) : null;


            const [existingRecord] = await query(
                `SELECT id FROM licence_fees 
                WHERE main_category = ? 
                AND item_name = ?`,
                [
                    row.mainName,
                    row.itemName || row.mainName
                ]
            );

            if (!existingRecord) {

                await query(
                    `INSERT INTO licence_fees (
                        main_category,
                        code,
                        item_name,
                        metro_value,
                        municipal_value,
                        district_value,
                        is_main
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        row.mainName,
                        row.code || '',
                        row.itemName || row.mainName,
                        metroValue,
                        municipalValue,
                        districtValue,
                        row.isMain
                    ]
                );
            }
        }

        await query('COMMIT');
        res.json({
            success: true,
            message: 'Data imported successfully'
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
});


app.post('/api/search', async (req, res) => {
    try {
        const { searchTerm, category, location } = req.body;
        console.log('Search params:', { searchTerm, category, location });

        let searchQuery = `
            SELECT 
                main_category,
                code,
                item_name,
                metro_value,
                municipal_value,
                district_value,
                is_main
            FROM licence_fees
            WHERE 1=1
        `;

        const params = [];

        if (category) {
            searchQuery += ` AND main_category = ?`;
            params.push(category);
        }

        if (searchTerm) {
            searchQuery += ` AND (
                LOWER(main_category) LIKE LOWER(?) OR
                LOWER(item_name) LIKE LOWER(?)
            )`;
            params.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }

        searchQuery += ` ORDER BY main_category, is_main DESC, item_name`;

        const results = await query(searchQuery, params);
        console.log(`Found ${results.length} results`);

        res.json({
            success: true,
            results,
            count: results.length
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error performing search',
            error: error.message
        });
    }
});


app.get('/api/categories', async (req, res) => {
    try {
        const results = await query(`
            SELECT DISTINCT main_category as mainName
            FROM licence_fees
            WHERE is_main = true
            ORDER BY main_category
        `);

        res.json({
            success: true,
            categories: results
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
});


app.get('/api/all-fees', async (req, res) => {
    try {
        const results = await query(`
            SELECT 
                main_category,
                code,
                item_name,
                metro_value,
                municipal_value,
                district_value,
                is_main
            FROM licence_fees
            ORDER BY main_category, is_main DESC, item_name
        `);

        res.json({
            success: true,
            results
        });
    } catch (error) {
        console.error('Error fetching all fees:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching fees data',
            error: error.message
        });
    }
});


app.get('/api/fee-items/:standard', async (req, res) => {
    try {
        const { standard } = req.params;

        const [assembly] = await query(`
            SELECT mmda 
            FROM assembly 
            WHERE state = 1 
            LIMIT 1
        `);

        if (!assembly) {
            throw new Error('Assembly information not found');
        }

       
        let valueColumn;
        switch(assembly.mmda.toLowerCase()) {
            case 'metropolitan':
                valueColumn = 'lf.metro_value';
                break;
            case 'municipal':
                valueColumn = 'lf.municipal_value';
                break;
            case 'district':
                valueColumn = 'lf.district_value';
                break;
            default:
                throw new Error('Invalid assembly type');
        }

        const items = await query(`
            SELECT 
                lf.id,
                lf.main_category as mainName,
                lf.item_name as itemName,
                lf.code,
                ${valueColumn} as upperLimit,
                lf.is_main as isMain
            FROM licence_fees lf
            WHERE ${valueColumn} IS NOT NULL
            AND ${valueColumn} > 0
            ORDER BY lf.main_category, lf.is_main DESC, lf.item_name
        `);

        res.json({
            success: true,
            items,
            standardType: assembly.mmda
        });
        console.log('Fee items:', items);

    } catch (error) {
        console.error('Error fetching fee items:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching fee items'
        });
    }
});






app.get('/department-staff/:department', async (req, res) => {
    try {
        const { department } = req.params;

        const staff = await query(`
            SELECT 
                s.trans_code as id,
                s.name,
                s.emain as email,
                s.department,
                s.role,
                s.is_active,
                du.phone,
                du.designation_id,
                des.title as designation_name,
                (
                    SELECT COUNT(uaa.access_id) 
                    FROM user_access_assignments uaa 
                    WHERE uaa.user_id = s.trans_code
                ) as access_count
            FROM staff s
            LEFT JOIN department_users du ON s.trans_code = du.staff_id
            LEFT JOIN designations des ON du.designation_id = des.id
            WHERE s.department = ?
            AND s.role = 'Department User'
            ORDER BY s.name ASC
        `, [department]);

        res.json({
            success: true,
            staff: staff
        });

    } catch (error) {
        console.error('Error fetching department staff:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching department staff'
        });
    }
});


app.get('/department-available-access/:hodId', async (req, res) => {
    try {
        const { hodId } = req.params;

       
        const [staffInfo] = await query(`
            SELECT role, department 
            FROM staff 
            WHERE trans_code = ?
        `, [hodId]);

        let availableAccess = [];

        if (staffInfo?.role === 'Head of Department') {
            
            availableAccess = await query(`
                SELECT 
                    aa.id,
                    aa.name,
                    aa.path,
                    aa.icon,
                    aa.section,
                    aa.is_core,
                    haa.granted_at as assigned_at
                FROM all_access aa
                INNER JOIN hod_access_assignments haa ON aa.id = haa.access_id
                WHERE haa.hod_id = ?
                AND aa.section = 'HOD'
                ORDER BY aa.name ASC
            `, [hodId]);
        } else {

            // For regular users 
            
            availableAccess = await query(`
                SELECT 
                    aa.id,
                    aa.name,
                    aa.path,
                    aa.icon,
                    aa.section,
                    aa.is_core,
                    uaa.granted_at as assigned_at,
                    s.name as granted_by_name
                FROM all_access aa
                INNER JOIN user_access_assignments uaa ON aa.id = uaa.access_id
                LEFT JOIN staff s ON uaa.granted_by = s.trans_code
                WHERE uaa.user_id = ?
                ORDER BY aa.name ASC
            `, [hodId]);
        }

        res.json({
            success: true,
            access: availableAccess,
            isHOD: staffInfo?.role === 'Head of Department',
            department: staffInfo?.department
        });

        console.log('User Role:', staffInfo?.role);
        console.log('Available Access:', availableAccess);

    } catch (error) {
        console.error('Error fetching available access:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching available access'
        });
    }
});


app.get('/department-user-access/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const userAccess = await query(`
            SELECT 
                aa.id,
                aa.name,
                aa.path,
                aa.icon,
                aa.section,
                aa.is_core,
                uaa.granted_at,
                s.name as granted_by_name
            FROM user_access_assignments uaa
            INNER JOIN all_access aa ON uaa.access_id = aa.id
            LEFT JOIN staff s ON uaa.granted_by = s.trans_code
            WHERE uaa.user_id = ?
            ORDER BY aa.name ASC
        `, [userId]);

        res.json({
            success: true,
            access: userAccess
        });

    } catch (error) {
        console.error('Error fetching user access:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user access'
        });
    }
});


app.put('/department-user-access/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { accessIds, hodId } = req.body;

        await query('START TRANSACTION');

        await query('DELETE FROM user_access_assignments WHERE user_id = ?', [userId]);

       
        if (accessIds && accessIds.length > 0) {
            const values = accessIds.map(accessId => [
                userId,
                accessId,
                hodId,
                new Date()
            ]);

            await query(`
                INSERT INTO user_access_assignments 
                (user_id, access_id, granted_by, granted_at) 
                VALUES ?
            `, [values]);
        }

        await query('COMMIT');

        res.json({
            success: true,
            message: 'User access updated successfully'
        });

    } catch (error) {
        await query('ROLLBACK');
        console.error('Error updating user access:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user access'
        });
    }
});


app.get('/check-user-access/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('User ID:', userId);
   

        await query('START TRANSACTION');

  
        const [staffInfo] = await query(`
            SELECT role, department 
            FROM staff 
            WHERE trans_code = ?
        `, [userId]);

       console.log('Staff Info:', staffInfo);
        const userAssignedAccess = await query(`
            SELECT 
                aa.id,
                aa.name,
                aa.path,
                aa.icon,
                aa.section,
                aa.is_core
            FROM all_access aa
            INNER JOIN user_access_assignments uaa ON aa.id = uaa.access_id
            WHERE uaa.user_id = ? 
            ORDER BY aa.name ASC
        `, [userId]);

        
        if (staffInfo?.role === 'Head of Department') {
            console.log('User is HOD:', staffInfo.role);
            const coreAccess = await query(`
                SELECT 
                    id,
                    name,
                    path,
                    icon,
                    section,
                    is_core
                FROM all_access 
                WHERE section = 'HOD' 
                AND is_core = 1
                AND name IN ('Department User Management', 'User Access Control')
            `);

          
            const combinedAccess = [...coreAccess, ...userAssignedAccess];

            await query('COMMIT');
            res.json({
                success: true,
                access: combinedAccess,
                isHOD: true,
                department: staffInfo.department
            });
        } else {
            await query('COMMIT');
            res.json({
                success: true,
                access: userAssignedAccess,
                isHOD: false
            });
        }

    } catch (error) {
        await query('ROLLBACK');
        console.error('Error checking user access:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking user access'
        });
    }
});

app.get('/assembly-info', async (req, res) => {
    try {
        const [assembly] = await query(`
            SELECT 
                trans_code,
                name,
                mmda,
                region,
                location,
                digital_add,
                email,
                phone
            FROM assembly 
            WHERE state = 1 
            LIMIT 1
        `);

        if (!assembly) {
            return res.status(404).json({
                success: false,
                message: 'Assembly information not found'
            });
        }

       
        const standardType = assembly.mmda.toUpperCase();

        res.json({
            success: true,
            assembly: {
                ...assembly,
                standardType
            }
        });

    } catch (error) {
        console.error('Error fetching assembly info:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching assembly information'
        });
    }
});

app.listen(port, () => {
    console.log('Connection Up And Runing........')
})