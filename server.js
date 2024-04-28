const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Customer = require('./models/customer');
const app = express();
const port = process.env.PORT || 3000;

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find({});
        res.render('customers', { customers });
    } catch (error) {
        console.error('Failed to retrieve customers:', error);
        res.status(500).send('Failed to retrieve customers');
    }
});

// Use the router
app.use('/', router); // This line applies the router to the app

// Route for QR Code page
app.get('/qr', (req, res) => {
    res.render('qr'); // This will render a view called 'qr.ejs' from your views folder
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
    res.render('esg'); // This will render the customer-form.ejs from your views folder
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

