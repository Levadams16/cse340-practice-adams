const addLocalVariables = (req, res, next) => {
    // Initialize styles array for dynamic CSS loading
    res.locals.styles = [];

    // Add a method to res for adding styles
    res.addStyle = (style) => {
        res.locals.styles.push(style);
    };

    // Convenience variable for UI state based on session state
    res.locals.isLoggedIn = false;
    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
    }

    next();
};

export { addLocalVariables };