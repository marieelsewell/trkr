const User = require('../models/User');

module.exports = (req, res, next) => {
    if (req.session && req.session.user) {
        // we know the user is authenticated
        console.log('auth middleware: User is authenticated');
        User.findOne({
            _id: req.session.user
        }).then(function (user) {
            if (!user) {
                return res.status(404).json({ success: false, message: 'Auth middleware: User not found' });
            }
            req.user = user;
            console.log('auth middleware: User found:', user);
            next();
        }).catch(err => {
            console.error('Auth middleware: Error finding user:', err);
            res.status(500).json({ success: false, message: 'Auth middleware: Internal server error' });
        });
    } else {
        // user is not authenticated
        res.status(401).json({ success: false, message: 'Auth middleware: Unauthorized' });
    }
};
