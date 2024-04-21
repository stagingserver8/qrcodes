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

// Other routes
app.post('/api/add-customer', async (req, res) => {
    const { name, email } = req.body;
    try {
        const newCustomer = new Customer({ name, email });
        await newCustomer.save();
        res.json({ message: 'Customer added successfully', customer: newCustomer });
    } catch (error) {
        console.error("Failed to add customer:", error);
        res.status(500).send("Failed to add customer");
    }
});

app.get('/generate-qr', (req, res) => {
    const formUrl = `${req.protocol}://${req.get('host')}/customer-form`;
    QRCode.toDataURL(formUrl, { margin: 1, width: 200 }, (err, url) => {
        if (err) {
            console.log("Error generating QR code", err);
            return res.status(500).send("Failed to generate QR code");
        }
        const data = url.split(',')[1]; // Split the URL to remove the data URL header
        const imgBuffer = Buffer.from(data, 'base64');
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Length': imgBuffer.length
        });
        res.end(imgBuffer); // Send the buffer as response
    });
});

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
