const userRoutes = require('./users');
const doctorRoutes = require('./doctors');
const homeRoutes = require('./home');
const searchRoutes = require('./search');
const appointmentRoutes = require('./appointments');
const reviewRoutes = require('./reviews');
const patientRoutes = require('./patients');
const videoRoutes = require('./video');

const {
    getAuthDetails
} = require('../helpers/auth_helper');

const {
    logout,
    setAuthInfo
} = require('../controllers/auth');

const constructor = (app) => {
    app.use((req, res, next) => {
        setAuthInfo(req, res);
        console.log(`[${new Date().toUTCString()}]: ${req.method}  ${req.originalUrl}  (${getAuthDetails(req.session)})`);
        next();
    });

    app.use('/logout', async (req, res) => {
        logout(req, res);
        res.redirect('/');
    });
    
    app.use('/user', userRoutes);
    app.use('/doctor', doctorRoutes);
    app.use('/search', searchRoutes);
    app.use('/appointment', appointmentRoutes);
    app.use('/review', reviewRoutes);
    app.use('/patient', patientRoutes);
    
    app.use('/', homeRoutes);
    app.use('/video', videoRoutes);

    app.use('*', (req, res) => {
        res.status(404).render("pages/error404", {
            title: "Error",
            error: "No Page Found"
        });
    });
};


module.exports = constructor;