const logout = (req, res) => {
    res.clearCookie("AuthCookie");
    req.session.destroy();
};

const setAuthInfo = (req, res) => {
    res.locals.auth = req.session.user ? {
        ...req.session.user,
        type: 'user'
    } : req.session.doctor ? {
        ...req.session.doctor,
        type: 'doctor'
    } : undefined;

};

const authorizeDoctor = (req, doc_info) => {
    if (req.session.user) {
        delete req.session.user;
    }
    req.session.doctor = doc_info;
};

const authorizeUser = (req, user_info) => {
    if (req.session.doctor) {
        delete req.session.doctor;
    }
    req.session.user = user_info;
};



module.exports = {
    logout,
    setAuthInfo,
    authorizeUser,
    authorizeDoctor
}