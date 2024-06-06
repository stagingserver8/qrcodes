const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Customer = require('./models/customer');
const User = require('./User');
var session = require('express-session');
var cookieParser = require('cookie-parser');


const app = express();
const port = process.env.PORT || 3003;

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
var MemoryStore = session.MemoryStore;
app.use(session({
    secret: ['secret', 'secret', 'secret'],
    name: "esg-benchmark",
    cookie: { maxAge: 3600000 },
    expires: new Date(new Date().getTime() + 3600000),//1 day session
    resave: true,
    store: new MemoryStore(),
    saveUninitialized: true
}));


// Connect to MongoDB
mongoose.connect('mongodb://localhost/my-crm-db')
    .then(() => {
        console.log('MongoDB connected successfully');
        app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
    })
    .catch(error => console.error('MongoDB connection error:', error));

// Create a router
const router = express.Router();

// Define a GET route on the router
// router.get('/', async (req, res) => {
//     try {
//         const customers = await Customer.find({});
//         res.render('customers', { customers });
//     } catch (error) {
//         console.error('Failed to retrieve customers:', error);
//         res.status(500).send('Failed to retrieve customers');
//     }
// });

// Use the router
app.use('/', router); // This line applies the router to the app

// Route for QR Code page
app.get('/qr', (req, res) => {
    res.render('qr'); // This will render a view called 'qr.ejs' from your views folder
});
app.get('/esg2', (req, res) => {
    res.render('esg2'); // This will render a view called 'qr.ejs' from your views folder
});

app.post('/register', async (req, res) => {
    try {
        const { name, email } = req.body;
        const customer = new Customer({ name, email });
        await customer.save();
        res.send("Thank you for registering!");
    } catch (error) {
        res.status(500).send("Error registering customer");
    }
});
// Route to serve the Customer Form page
app.get('/customer-form', (req, res) => {
    res.render('customer-form'); // This will render the customer-form.ejs from your views folder
});

// Route to serve the Customer Form page
app.get('/esg', (req, res) => {
    // res.render('esg'); // This will render the customer-form.ejs from your views folder
    //get the active session
    if (req.session.authenticated) {
        res.render('esg-test', { user: req.session.user });
        return
    }
    //if not authenticated, go to login page
    res.redirect('/');

});
//The login page
app.get('/', (req, res) => {
    res.render('index');
});
//post request for the login page
app.post('/', (req, res) => {
    User.login(req.body, function (result) {
        if (result.status == 500) {
            res.render('index', result);
            return
        }

        req.session.user = result.user;
        req.session.authenticated = true;
        res.redirect('/esg');

    })

});

app.get('/esg1', (req, res) => {
    res.render('esg'); // This will render the customer-form.ejs from your views folder
    // res.render('esg-test');
});

app.get('/test', (req, res) => {
    res.render('test'); // This will render the customer-form.ejs from your views folder
});


app.get('/reports', (req, res) => {
    res.render('reports'); // This will render the customer-form.ejs from your views folder
});



app.post('/edit-customer/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    try {
        await Customer.findByIdAndUpdate(id, { name, email });
        res.json({ message: 'Customer updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating customer' });
    }
});

app.delete('/delete-customer/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Customer.findByIdAndDelete(id);
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting customer' });
    }
});



