const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    if (req.originalUrl.startsWith('/jsonRoute') || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    req.flash('error_msg', 'Please log in to access this resource');
    res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
    }
    req.flash('error_msg', 'You must be an admin to access this resource');
    res.redirect('/');
};

const isOwner = (req, res, next) => {
    if (req.isAuthenticated() && (req.user._id.toString() === req.params.id || req.user.isAdmin)) {
        return next();
    }
    req.flash('error_msg', 'You are not authorized to perform this action');
    res.redirect('/');
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isOwner
}; 